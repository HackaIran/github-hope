const axios = require("axios");

const stringSimilarity = require("string-similarity");

//

class Checker {

    constructor(url) {

        // Regex of the url

        let githubRepRegex = /^(?:http|https):\/\/github\.com\/([\w-]+?)\/([\w-]+?)$/i;

        // Let's get important parts

        let urlParts = githubRepRegex.exec(url);

        this.url = url;

        this.repositoryName = urlParts[2];

        this.owner = urlParts[1];

        // Critical files of the repository

        this.criticalFiles = {};

        // Report properties

        this.report = {
            quality: 0,
            results: [

            ]
        };

    }

    /**
     * 
     * Parses html headings
     * 
     * @param {String} text
     * 
     */

    html2mdHeadings(text) {

        text = text.replace(new RegExp('<h1.*?>(.+?)</h1>', 'g'), "# $1");
        text = text.replace(new RegExp('<h2.*?>(.+?)</h2>', 'g'), "## $1");
        text = text.replace(new RegExp('<h3.*?>(.+?)</h3>', 'g'), "### $1");
        text = text.replace(new RegExp('<h4.*?>(.+?)</h4>', 'g'), "#### $1");

        return text;
    }

    /**
     * 
     * Parses headings inside links into the raw text
     * 
     * @param {String} text
     * 
     */

    rawHeadings(text) {
        text = text.replace(/(#{1,}) \[(.+?)\]\(.+\)/g, "$1 $2");
        return text;
    }

    /**
     * 
     * Function for taking information about important files on github
     * 
     */

    getCommunity() {

        return new Promise((resolve, reject) => {
            axios.get("https://api.github.com/repos/" + this.owner + "/" + this.repositoryName + "/community/profile", {
                headers: {
                    'Accept': 'application/vnd.github.black-panther-preview+json'
                }
            }).then((result) => {
                resolve(result.data)
            }).catch((error) => {
                reject(error);
            })
        })

    }

    /**
     * 
     * For getting certain file from github
     * 
     */

    getFile(name) {
        return new Promise((resolve, reject) => {

            axios.get("https://api.github.com/repos/" + this.owner + "/" + this.repositoryName + "/" + name).then((result) => {
                axios.get(result.data.download_url).then((file) => {
                    resolve(file.data);
                }).catch((e) => {
                    reject(e);
                })
            }).catch((e) => {
                reject(e);
            })

        })
    }

    /**
     * 
     * Returns best match between an array of textx and array of texts
     * 
     * @param {Array} mainStrings
     * 
     * @param {Array} texts
     * 
     * @param {Integer} minPercentage
     * 
     */

    findBestMatch(mainStrings, texts, minPercentage) {

        let result;

        for (let index in mainStrings) {
            result = stringSimilarity.findBestMatch(mainStrings[index], texts);
            if (result.bestMatch.rating * 100 >= minPercentage) {
                return result.bestMatch.target;
            } else {
                return false;
            }
        }

    }

    /**
     * 
     * Parse
     * 
     */

    parse() {

        return new Promise((resolve, reject) => {

            // Let's get the community

            this.getCommunity().then((community) => {

                this.criticalFiles = community.files;

                // Check for important files and README.md

                this.importantFileChecker().then(() => {
                    this.checkReadme().then(() => resolve(this.get()));
                })

            }).catch(console.log)
        })

    }

    /**
     * 
     * Check existance of critical files
     * 
     */

    importantFileChecker() {

        return new Promise((resolve, reject) => {

            // Check Code Of Conduct

            if (this.criticalFiles.code_of_conduct) { // if code of conduct exists

                this.report.results.push({
                    type: "Code of Conduct",
                    status: "Success",
                    message: "Yay! You have added a 'Code of Conduct' to your project."
                });

            } else {

                this.report.results.push({
                    type: "Code of Conduct",
                    status: "Fail",
                    message: "I can’t find the Code of Conduct. Please add it using Contributor Covenant drop-in 'Code of Conduct'."
                });

            }

            // Let's check for contributing file

            if (this.criticalFiles.contributing) { // if contributing exists

                this.report.results.push({
                    type: "Contributing",
                    status: "Success",
                    message: "I found a 'CONTRIBUTING' file in your project. Good job!"
                });

            } else {

                this.report.results.push({
                    type: "Contributing",
                    status: "Fail",
                    message: "Mmmm… Did you forget to create a 'CONTRIBUTING' file? Please add it."
                });

            }

            // Let's check for license

            if (this.criticalFiles.license) { // if license exists

                this.report.results.push({
                    type: "License",
                    status: "Success",
                    message: "Kudos! You have a chosen a license for your project. But is it chosen properly? If you’re not sure, take a look at our interactive license chooser guide."
                });

            } else {

                this.report.results.push({
                    type: "License",
                    status: "Fail",
                    message: "Whoops! I couldn’t find your 'LICENSE' file. If you want help to choose a license, use our interactive license chooser guide."
                });

            }

            // Let's check for readme

            if (this.criticalFiles.readme) { // if readme exists

                this.report.results.push({
                    type: "Readme",
                    status: "Success",
                    message: "Your project contains a 'README' file. Congrats!"
                });

            } else {

                this.report.results.push({
                    type: "Readme",
                    status: "Fail",
                    message: "Oops! It seems that your project does not contain a 'README' file. Please add it to pass this check."
                });

            }

            // Done!

            resolve();

        })

    }

    /**
     * 
     * Check readme for 
     * 
     */

    checkReadme() {

        return new Promise((resolve, reject) => {

            // Let's get the readme file

            this.getFile("readme").then((file) => {

                file = this.html2mdHeadings(file);
                file = this.rawHeadings(file);

                let temp;

                let headingRegEx = /#{1,}(.+)/g;

                let headings = [];

                let rawHeadings = [];

                while ((temp = headingRegEx.exec(file)) !== null) { // Finding headings
                    headings.push(temp);
                    rawHeadings.push(temp[1]);
                }

                console.log(file.slice(0,3000))

                file += "\n#"; // For regex

                // Let's check whether it has a heading or not

                let properHeading = this.findBestMatch([this.repositoryName], rawHeadings, 80);

                if (properHeading) {

                    // has heading

                    if (!/#{1}[^#]+/.test(headings.filter(item => {
                            if (item[1] == properHeading) { // find the text with md style
                                return item[0]
                            }
                        }))) {
                        // it is not in h1

                        this.report.results.push({
                            type: "Heading",
                            status: "warning",
                            message: "Your project name is not in #..."
                        });


                    }

                    this.report.results.push({
                        type: "Heading",
                        status: "success",
                        message: "I can see your project name.👀"
                    });

                    // Now that it has a heading for his/her project, let's check the description of it

                    let descriptionRegex = new RegExp(properHeading + '(.+?)#', 's');

                    let description = descriptionRegex.exec(file);

                    description = description[1].trim()

                    if (description) {

                        // it has description

                        this.report.results.push({
                            type: "HeadingDescription",
                            status: "Success",
                            message: "Thanks for adding a Description about your project."
                        });

                    } else {
                        this.report.results.push({
                            type: "HeadingDescription",
                            status: "Fail",
                            message: "Add a brief description about your project, please."
                        });
                    }


                } else {
                    // Doesn't have a heading

                    this.report.results.push({
                        type: "Heading",
                        status: "Fail",
                        message: "Your project doesn’t have a name!? Please use our guide to choose a name for it."
                    });

                }

                // Let's check for Installation Guide

                let properInstallationHeading = this.findBestMatch(["Install", "Installation", "Installation Guide"], rawHeadings, 80);

                if (properInstallationHeading) {

                    // There is an installation guide

                    // Let's check for description

                    let descriptionRegex = new RegExp(properInstallationHeading + '(.+?)#', 's');

                    let description = descriptionRegex.exec(file);

                    description = description[1].trim()

                    if (description) {

                        // it has description

                        this.report.results.push({
                            type: "installtaion-guide-description",
                            status: "Success",
                            message: "Thanks for adding a Description about Installation Guide."
                        });

                    } else {
                        this.report.results.push({
                            type: "installtaion-guide-description",
                            status: "Fail",
                            message: "Add a brief Installation Guide about your project, please."
                        });
                    }

                } else {

                    // There is not installation guides

                    this.report.results.push({
                        type: "installation-guide",
                        status: "Fail",
                        message: "Please add a Installation Guide in your REAME file."
                    });

                }

                // Let's check for Usage Guide

                let properUsageHeading = this.findBestMatch(["Usage", "How to Use"], rawHeadings, 80);

                if (properUsageHeading) {

                    // There is an usage guide

                    // Let's check for description

                    let descriptionRegex = new RegExp(properUsageHeading + '(.+?)#', 's');

                    let description = descriptionRegex.exec(file);

                    description = description[1].trim()

                    if (description) {

                        // it has description

                        this.report.results.push({
                            type: "installtaion-guide-description",
                            status: "Success",
                            message: "Thanks for adding a Description about Usage Guide."
                        });

                    } else {
                        this.report.results.push({
                            type: "installtaion-guide-description",
                            status: "Fail",
                            message: "Add a brief Usage Guide about your project, please."
                        });
                    }

                } else {

                    // There is not usage guides

                    this.report.results.push({
                        type: "usage-guide",
                        status: "Fail",
                        message: "Please add a Usage Guide in your README file."
                    });

                }

                // check license in README.md

                let licenseHeading = this.findBestMatch(["license"], rawHeadings, 80);

                if (licenseHeading) {

                    // There is an license

                    // Let's check for description

                    let descriptionRegex = new RegExp(licenseHeading + '(.+?)#', 's');

                    let description = descriptionRegex.exec(file);

                    description = description[1].trim()

                    if (description) {

                        // it has description

                        this.report.results.push({
                            type: "readme-license",
                            status: "Success",
                            message: "Thanks for adding a License in README.md."
                        });

                    } else {
                        this.report.results.push({
                            type: "readme-license",
                            status: "Fail",
                            message: "Add a license into README.md, please."
                        });
                    }

                } else {

                    // There is no license

                    this.report.results.push({
                        type: "readme-license",
                        status: "Fail",
                        message: "Please add a license in your README file."
                    });

                }

                // check contribution guide in the README.md

                let contributeHeading = this.findBestMatch(["Contributing", "contribution", "contribution guide", "how to contribute"], rawHeadings, 80);

                if (contributeHeading) {

                    // There is an contribution guide

                    // Let's check for description

                    let descriptionRegex = new RegExp(contributeHeading + '(.+?)#', 's');

                    let description = descriptionRegex.exec(file);

                    description = description[1].trim()

                    if (description) {

                        // it has description

                        this.report.results.push({
                            type: "readme-contribution-guide",
                            status: "Success",
                            message: "Thanks for adding a contribution guide in README.md."
                        });

                    } else {
                        this.report.results.push({
                            type: "readme-contribution-guide",
                            status: "Fail",
                            message: "Add a contribution guide into README.md, please."
                        });
                    }

                } else {

                    // There is no license

                    this.report.results.push({
                        type: "readme-contribution-guide",
                        status: "Fail",
                        message: "Please add a contribution guide in your README file."
                    });

                }

                resolve()

            })

        })

    }

    /**
     * 
     * Get the result
     * 
     */

    get() {

        return this.report.results;

    }

}
module.exports = Checker;