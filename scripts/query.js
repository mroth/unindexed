#!/usr/bin/env node
/*
Queries for the site in Google search index, updates redis with results.

This should be run periodically from an automated cron task or whatnot.

This can run forever, but times_mentioned null->1 is special case so we have to
record time-of-death when that happens.
*/
"use strict";

var config  = require('../config');
var siteUrl = config.site.url();

var google = require('google');
google.resultsPerPage = 100;

// site:siteUrl ?
// "siteUrl" in quotes for goog exact search?
// var query = "\"" + siteUrl + "\"";
var query = "site:" + siteUrl;
console.log("Querying google for [" + query + "]...");

google(query, function (err, next, links) {
  if (err) {
    console.log("*** got an error!: " + err);
    process.exit(1);
  } else {
    var n = links.length;
    console.log("   ...got " + n + " search results.");

    if (n > 0) {
      var client   = config.redis.client();
      // if the previous times indexed was null, this is the first time
      // we were indexed!  so we need to record the historic moment.
      // instead doing a query/response, let's be clever and use SETNX.
      client.multi()
            .set(["times_indexed", n])
            .del("content")
            .del("comments")
            .setnx(["destroyed_at", (new Date()).toString()])
            .exec(function (err, replies) {

              if (err) {
                console.log("*** Error updating redis!");
                process.exit(1);
              }

              console.log("-> Set times_indexed to " + n + ":\t\t" + replies[0]);
              console.log("-> Did we just destroy content?:\t"     + replies[1]);
              console.log("-> Did we just destroy comments?:\t"    + replies[2]);
              console.log("-> Did we initialize destroyed_at?:\t"  + replies[3]);
              client.quit();
            });
    }
  }
});
