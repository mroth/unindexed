#!/usr/bin/env node
/*
Dump current Redis status to screen, for checking stats without visiting site.

*/
"use strict";

var config = require('../config');
var client = config.redis.client();

var keys = [
  "times_indexed",
  "comments_count",
  "live_visitors",
  "dead_visitors",
  "created_at",
  "destroyed_at"
];

client.mget(keys, function (err, replies) {
    if (err) {
      console.log("*** Error querying redis!");
      process.exit(1);
    }

    replies.forEach( function(r, i) {
      console.log(keys[i] + ":\t" + r);
    });
    client.quit();
  }
);
