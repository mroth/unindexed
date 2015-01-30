#!/usr/bin/env node
/*
Takes whatever is sent to STDIN, and loads it into the content field in Redis.

Takes the REDIS_URL as optional argument

Usage examples:
  - node load_content.js redis://localhost:6379 < /path/to/content.txt
  - node load_content.js `heroku config:get REDIS_URL` < /path/to/content.txt

*/

"use strict";

var redisurl = require('redis-url');
var client;
if (process.argv[2]) {
  client = redisurl.connect(process.argv[2]);
} else {
  client = redisurl.connect();
}

// take whatever is sent to stdin, and load it into content field
var content = '';
process.stdin.resume();
process.stdin.on('data', function (buf) { content += buf.toString(); });
process.stdin.on('end', function () {
  client.set(['content', content], function (err, reply) {
    console.log("set content!");

    client.get('content', function (err, res) {
      console.log("checking content, appears to be...");
      console.log(res);
      client.quit();
    });

  });
});
