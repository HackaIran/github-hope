const hope = require('./lib')

hope.evaluate('https://github.com/Alireza29675/handy-storage').then(result => {
    console.log('\n--------------------------------------\n')
    console.log(result)
})

module.exports = hope