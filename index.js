const hope = require('./lib');

hope.evaluate("https://github.com/webpack/webpack").then(console.log);

module.exports = hope