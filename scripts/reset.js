#!/usr/bin/env node
/*
Zeroes out all control variables to pristine state.  Doesn't affect content.

NOTE: I AM DANGEROUS - ONLY FOR DEV MODE TESTING.
*/

"use strict";

var config = require('../config');
var client = config.redis.client();

client.multi()
  .set("times_indexed", 0)                     // zero index count
  .set("live_visitors", 0)                     // zero both visitor counts
  .set("dead_visitors", 0)                     //
  .del("destroyed_at")                         // null out destroyed_at
  .del("comments")                             // get rid of all comments
  .del("comments_count")                       //
  .set("created_at", (new Date()).toString())  // set created_at to Now
  .exec(function (err, replies) {
    if (err) {
      console.log("*** Error updating redis!");
      process.exit(1);
    }

    console.log(replies);
    client.quit();
  });
