const axios = require("axios");

const stringSimilarity = require("string-similarity");

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
     * Parse
     * 
     */

    parse() {

        return new Promise((resolve, reject) => {

            // Let's get the community

            this.getCommunity().then((community) => {

                console.log(community);

                this.criticalFiles = community.files;

                // Check for important files

                this.importantFileChecker().then(() => {

                    this.checkReadme();

                }).then(() => {
                    resolve(this.get());
                })

            }).catch((e)=>{
                console.log(e)
            })
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

        // Let's get the readme file

        this.getFile("readme").then((file) => {

            let temp;

            let headingRegEx = /#{1,}(.+)/g;

            let headings = [];

            while ((temp = headingRegEx.exec(file)) !== null) {// Finding headings
                headings.push(temp);
            }

            file += "\n#"; // For regex

            // Let's check whether it has a heading or not

            let properHeading = headings.filter(item => {
                if (stringSimilarity.compareTwoStrings(item[1], this.repositoryName) * 100 > 80) {
                    return item;
                }
            });

            if (properHeading.length != 0) {
                // has heading

                properHeading = properHeading[0];

                if(!/#{1}[^#]+/.test(properHeading[0])){
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
                    message: "I can see your projects name.👀"
                });

                // Now that it has a heading for his/her project, let's check the description of it

                let descriptionRegex = new RegExp(properHeading[0]+'(.+?)#','s');

                let description = descriptionRegex.exec(file);

                description = description[1].trim()

                if(description){

                    // it has description

                    this.report.results.push({
                        type:"HeadingDescription",
                        status:"Success",
                        message:"Thanks for adding a Description about your project."
                    });

                }else{
                    this.report.results.push({
                        type:"HeadingDescription",
                        status:"Fail",
                        message:"Add a brief description about your project, please."
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

            let properInstallationHeading = headings.filter(item => {
                if ((stringSimilarity.compareTwoStrings("Installation", item[1]) * 100 > 80) ||  ((stringSimilarity.compareTwoStrings("Installation Guide", item[1]) * 100 > 80))){
                    return item;
                }
            });

            if(properInstallationHeading.length != 0){

                properInstallationHeading = properInstallationHeading[0];

                // There is an installation guide

                // Let's check for description

                let descriptionRegex = new RegExp(properInstallationHeading[0]+'(.+?)#','s');

                let description = descriptionRegex.exec(file);

                description = description[1].trim()

                if(description){

                    // it has description

                    this.report.results.push({
                        type:"installtaion-guide-description",
                        status:"Success",
                        message:"Thanks for adding a Description about Installation Guide."
                    });

                }else{
                    this.report.results.push({
                        type:"installtaion-guide-description",
                        status:"Fail",
                        message:"Add a brief Installation Guide about your project, please."
                    });
                }

            }else{

                // There is not installation guides

                this.report.results.push({
                    type:"installation-guide",
                    status:"Fail",
                    message:"Please add a Installation Guide in your REAME file."
                });

            }

            // Let's check for Usage Guide

            let properUsageHeading = headings.filter(item => {
                if ((stringSimilarity.compareTwoStrings("Usage", item[1]) * 100 > 80) ||  ((stringSimilarity.compareTwoStrings("How to Use", item[1]) * 100 > 80))){
                    return item;
                }
            });

            if(properUsageHeading.length != 0){

                properUsageHeading = properUsageHeading[0];

                // There is an usage guide

                // Let's check for description

                let descriptionRegex = new RegExp(properUsageHeading[0]+'(.+?)#','s');

                let description = descriptionRegex.exec(file);

                description = description[1].trim()

                if(description){

                    // it has description

                    this.report.results.push({
                        type:"installtaion-guide-description",
                        status:"Success",
                        message:"Thanks for adding a Description about Usage Guide."
                    });

                }else{
                    this.report.results.push({
                        type:"installtaion-guide-description",
                        status:"Fail",
                        message:"Add a brief Usage Guide about your project, please."
                    });
                }

            }else{

                // There is not usage guides

                this.report.results.push({
                    type:"usage-guide",
                    status:"Fail",
                    message:"Please add a Usage Guide in your README file."
                });

            }

            console.log(this.report.results)

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