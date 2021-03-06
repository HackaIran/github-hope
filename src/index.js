const Checker = require("./Checker");

/**
 * Evaluate function of hope
 * @param {string} url a git repository's url which will be checked
 * @returns {Promise} a promise including test results
 */
const evaluate = (url,config) => {

    return new Promise ((resolve, reject) => {

        // Let's check whether url is valid or not

        if(!/^(?:http|https):\/\/github\.com\/[\w-.]+?\/[\w-.]+?(?:\.git|)$/i.test(url)){
            reject(new Error("Url is not valid!"));
        }

        // Let's initiate checker

        const checker = new Checker(url,config);

        // Let's parse the repository

        checker.parse().then(resolve).catch(reject);

    })

}

module.exports = { evaluate }