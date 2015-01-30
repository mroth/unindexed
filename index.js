"use strict";

var helpers = require('./helpers');
var config = require('./config');
var client = config.redis.client();

var express = require('express');
var app = express();

// templating engine stuff (ugh)
var ECT = require('ect');
var ectRendererOptions = {
  watch: false,
  root: __dirname + '/views',
  ext : '.ect',
  gzip: true
};
var ectRenderer = ECT(ectRendererOptions);
app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

// main route
app.get('/', function (req, res) {

  var queryKeys = [ "times_indexed",
                    "created_at",
                    "destroyed_at",
                    "live_visitors",
                    "content",
                    "comments_count" ];

  client.multi()
    .mget(queryKeys)
    .lrange("comments", 0, -1)
    .exec( function (err,reply) {

      if (err) {
        res.send("Oh dear. Something went horribly wrong.");
        console.log("Horrific redis load error on page request: " + err);
      } else {
        var queryVal = reply[0];
        var comments = reply[1].map(JSON.parse);

        var timesIndexed = parseInt(queryVal[0], 10);
        var siteIsAlive  = timesIndexed === 0;
        var createdAt    = new Date(queryVal[1]);
        var destroyedAt  = queryVal[2] ? new Date(queryVal[2]) : new Date();

        var data = {
          timesIndexed:  timesIndexed,
          createdAt:     createdAt,
          destroyedAt:   destroyedAt,
          timeAlive:     helpers.timeAlive(createdAt, destroyedAt),
          liveVisitors:  queryVal[3],
          content:       queryVal[4],
          commentsCount: queryVal[5],
          comments:      comments
        };

        if (siteIsAlive) {
          // display alive template
          res.render('alive', data);
          // update live_visitors count
          client.incr("live_visitors");
        } else {
          // header GONE
          res.status(410);
          // display a text status message with stats
          res.type("text");
          res.render('dead', data);
          // update dead_visitors count
          client.incr("dead_visitors");
        }
      }

    });
});

// load comment processing routes from separate module
require('./comments')(app, client);

// allow all robot overlords (this is default, but more fun to be specific)
app.get('/robots.txt', function (req, res) {
  res.type("text");
  res.send("User-agent: *\nDisallow:\n");
});

// for status pings
app.get('/status', function (req, res) {
  res.type("text");
  res.send("OK");
});

var port = process.env.PORT || 3000;
console.log("Starting up on port " + port);
app.listen(port);
