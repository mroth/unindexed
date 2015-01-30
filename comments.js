"use strict";

// form processing and sanitization
var sanitizeHtml = require('sanitize-html');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// configure markdown processsing
// override heading function to allow only a subset of syntax
var marked = require('marked');
var renderer = new marked.Renderer();
renderer.heading = function (text, level) { return text; };

marked.setOptions({
  renderer: renderer,
  gfm:         true,
  tables:      false,
  breaks:      true,
  pedantic:    false,
  sanitize:    false, //doing manually to allow some basic HTML
  smartLists:  true,
  smartypants: true
});


module.exports = function (app, client) {
  // comment submission
  app.post('/comments', urlencodedParser, function (req, res) {

    // no blanks
    if (!req.body) { return res.sendStatus(400); }

    // strip nasty stuff
    var user = sanitizeHtml(req.body.user, {
      allowedTags: []
    }).trim();
    var comment = sanitizeHtml(req.body.comment, {
      allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
      allowedAttributes: {
        'a': [ 'href' ]
      }
    }).trim();

    // if no content is left after stripping, error out
    if (comment === "") {
      return res.status(400).send("Bad request.  Did you fill everything out?");
    }

    // no username is anonymous
    if (user === "") { user = "anonymous"; }

    // truncate at max length for fields (plus a little for leniency)
    user = user.slice(0,48+8);
    comment = comment.slice(0,2048+8);

    // process markdown for post
    comment = marked(comment);

    // create post json
    var post = JSON.stringify({
      ip: req.headers['X-Forwarded-For'] || req.connection.remoteAddress,
      t:  (new Date()).toJSON(),
      u:  user,
      c:  comment
    });

    // post to redis
    client.multi()
      .rpush("comments", post)
      .incr("comments_count")
      .exec();

    // redirect to original page, at bottom
    res.redirect("/#comments-latest");
  });

};
