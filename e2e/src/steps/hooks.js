'use strict';

var {After, setDefaultTimeout} = require('cucumber');

setDefaultTimeout(60 * 1000);

After(function(scenario, callback) {
  if (scenario.result.status === "failed") {
    const world = this;
    browser.takeScreenshot().then(
      function(buffer) {
        world.attach(buffer, 'image/png');
        callback();
      },
      function(err) { callback(err); });
  } else {
    callback();
  }
});
