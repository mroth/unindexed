"use strict";

module.exports = {

  // convenience function to calculate time site has been alive as string
  timeAlive: function (start, end) {
    var diff = (end - start) / 1000 / 60; // in minutes
    if (diff < 120) {
      return Math.ceil(diff) + " minutes";
    } else if (diff < 72*60) {
      return Math.ceil(diff/60) + " hours";
    } else {
      return Math.ceil(diff/60/24) + " days";
    }
  }

};
