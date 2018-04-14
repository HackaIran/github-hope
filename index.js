const hope = require('./lib');

hope.evaluate("https://github.com/hackairan/hope").then((result)=>{
    console.log(result)
})

module.exports = hope