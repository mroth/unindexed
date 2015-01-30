"use strict";

if (!process.env.DYNO) {
  console.log("[We don't seem to be on Heroku, doing a manual dotenv load...]");
  var dotenv = require('dotenv');
  dotenv.load();
}

module.exports = {
  site: {
    name: function() { return process.env.SITE_NAME; },
    url:  function() { return process.env.SITE_URL; }
  },

  redis: {
    client: function() {
      return require('redis-url').connect();
    }
  }

};
