const hope = require('./src');

hope.evaluate("https://github.com/HackaIran/HOPE").then(result=>{
    console.log(result.results.general,result.results.readme)
})

module.exports = hope