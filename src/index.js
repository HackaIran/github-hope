const Checker = require("./Checker");

/**
 * Represents main hope function
 * @param {string} url a git repository's url which will be checked
 * @returns {Promise} a promise including test results
 */
module.exports = function hope (url) {

    return new Promise ((resolve, reject) => {

        // Let's check whether url is valid or not

        if(!/^(?:http|https):\/\/github\.com\/[\w-]+?\/[\w-]+?$/i.test(url)){
            reject(new Error("Url is not valid!"));
        }

        // Let's initiate checker

        const checker = new Checker(url);

        // Let's parse the repository

        checker.parse().then(()=>{

            console.log(checker.get());

        });

    })

}