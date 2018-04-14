const axios = require("axios");

const stringSimilarity = require("string-similarity");

const strategy = require('./strategy.config.js');

class Checker {

    constructor(url, config) {

        // Regex of the url

        let githubRepRegex = /^(?:http|https):\/\/github\.com\/([\w-.]+?)\/([\w-.]+?)(?:\.git|)$/i;

        // Let's get important parts

        let urlParts = githubRepRegex.exec(url);

        this.url = url;

        // for general infos of the repository

        this.generalInfo = {};

        this.generalInfo.repositoryName = urlParts[2];

        this.generalInfo.owner = urlParts[1];

        // strategy config file

        this.strategy = config || strategy;

        // Critical files of the repository

        this.criticalFiles = {};

        // mark

        this.mark = 0;

        // Report properties

        this.report = {
            quality: 0,
            results: {}
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
            axios.get("https://api.github.com/repos/" + this.generalInfo.owner + "/" + this.generalInfo.repositoryName + "/community/profile", {
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
     * @param {String} name - name of the file
     * 
     */

    getFile(name) {
        return new Promise((resolve, reject) => {

            axios.get("https://api.github.com/repos/" + this.generalInfo.owner + "/" + this.generalInfo.repositoryName + "/" + name).then((result) => {
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
            }
        }

        return false;

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

                this.fileExistanceChecker().then(() => {

                    this.checkInFiles().then(() => resolve(this.get()));

                })

            }).catch(console.log)
        })

    }

    /**
     * 
     * Check existance of specified files
     * 
     */

    fileExistanceChecker() {

        return new Promise((resolve, reject) => {

            let resultPrefix = "general";

            this.report.results[resultPrefix] = [];


            for (let item in this.strategy.general) {

                if (this.criticalFiles[item]) { // if code of conduct exists

                    this.report.results[resultPrefix].push(this.strategy.general[item].exist);

                    // increment mark

                    this.incrementMark(this.strategy.general[item].exist.mark);

                } else {

                    this.report.results[resultPrefix].push(this.strategy.general[item].notExist);

                }

            }

            // Done!

            resolve();

        })

    }

    /**
     * 
     * Reads inside of file and performs the rules of the config
     * 
     */

    checkInFiles() {

        return new Promise(async (resolve, reject) => {

            let inFiles = this.strategy.inFiles;

            let fileIndex = 0;

            for (let fileName in inFiles) {

                this.report.results[fileName] = [];

                let file = await this.getFile(fileName);

                file = this.html2mdHeadings(file);
                file = this.rawHeadings(file);

                let temp;

                let headingRegEx = /#{1,}(.+)/g;

                let headings = [];

                let rawHeadings = [];

                while ((temp = headingRegEx.exec(file)) !== null) { // Finding headings
                    headings.push(temp);
                    rawHeadings.push(temp[1].trim());
                }

                file += "\n#"; // For regex

                for (let rule of inFiles[fileName]) {

                    // Let's parse the pattern

                    if (rule.pattern instanceof Array && rule.heading) {

                        // Let's parse array

                        rule.pattern = this.parsePatternArray(rule.pattern);

                        // let's find proper text

                        let properText = this.findBestMatch(rule.pattern, rawHeadings, 80);

                        // check existance

                        if (properText) {

                            // it exists

                            this.report.results[fileName].push(rule.messages.exist);

                            // increment mark

                            this.incrementMark(rule.messages.exist.mark);

                            // check heading type

                            if (rule.hasOwnProperty("headingType")) {

                                let headingTypeRegEx = new RegExp("#{" + rule.headingType + "}[^#]+");

                                if (!headingTypeRegEx.test(headings.filter(item => {
                                        if (item[1].trim() == properText.trim()) { // find the text with md style
                                            return item[0]
                                        }

                                    }))) {

                                    // not proper type

                                    if (rule.messages.hasOwnProperty("headingTypeNotOk")) {
                                        this.report.results[fileName].push(rule.messages.headingTypeNotOk);
                                    }

                                } else {

                                    if (rule.messages.hasOwnProperty("headingTypeOk")) {
                                        // proper type

                                        this.report.results[fileName].push(rule.messages.headingTypeOk);

                                        // increment mark

                                        this.incrementMark(rule.messages.headingTypeOk.mark);
                                    }

                                }
                            }

                        } else {
                            this.report.results[fileName].push(rule.messages.notExist);
                        }

                    } else {

                        // global pattern

                        // parse the pattern

                        if (rule.pattern = this.parseRegExPattern(rule.pattern, rawHeadings)) {

                            let rulePattern;

                            if ((rulePattern = /\/(.+)\/(.*)/i.exec(rule.pattern)) !== null) {

                                rulePattern = new RegExp(rulePattern[1], rulePattern[2]);

                                let result;

                                if ((result = rulePattern.exec(file)) !== null) {

                                    let index = 0;

                                    for (let capture of rule.captures) {

                                        if (Object.keys(capture).length) { // if not empty

                                            // success

                                            this.report.results[fileName].push(capture.messages.exist);

                                            // increment mark

                                            this.incrementMark(capture.messages.exist.mark);

                                            // let's check whether minLength is ok or not...;)

                                            if (capture.hasOwnProperty("minLength")) {

                                                // eleminate html tags

                                                let resultText;

                                                resultText = this.eliminateHTMLTags(result[index]).trim();

                                                if (resultText.length >= capture.minLength) {

                                                    if(capture.messages.hasOwnProperty("minLengthOk")){
                                                        // success

                                                        this.report.results[fileName].push(capture.messages.minLengthOk);

                                                        // increment mark

                                                        this.incrementMark(capture.messages.minLengthOk.mark);
                                                    }

                                                } else {

                                                    if(capture.messages.hasOwnProperty("minLengthNotOk")){

                                                        // oops

                                                        this.report.results[fileName].push(capture.messages.minLengthNotOk);

                                                    }

                                                }

                                            }

                                            // let's check whether maxLength is ok or not...;)

                                            if (capture.hasOwnProperty("maxLength")) {

                                                // eleminate html tags

                                                let resultText;

                                                resultText = this.eliminateHTMLTags(result[index]).trim();

                                                if (resultText.length < capture.maxLength) {

                                                    if(capture.messages.hasOwnProperty("maxLengthOk")){

                                                        // success

                                                        this.report.results[fileName].push(capture.messages.maxLengthOk);

                                                        // increment mark

                                                        this.incrementMark(capture.messages.maxLengthOk.mark);

                                                    }

                                                    

                                                } else {

                                                    if(capture.messages.hasOwnProperty("maxLengthNotOk")){

                                                        // oops

                                                        this.report.results[fileName].push(capture.messages.maxLengthNotOk);

                                                    }

                                                }

                                            }

                                        }

                                        // go to the next captured section

                                        index++;

                                    }

                                } else {

                                    // not exists

                                    this.report.results[fileName].push(captures[0].messages.notExist);

                                }

                            } else {

                                reject(new Error("regex is invalid!"));

                            }



                        } else {

                            if(rule.captures[0].hasOwnProperty("notExist")){
                                
                                // best match matched nothing

                                this.report.results[fileName].push(rule.captures[0].notExist)

                            }

                            

                        }

                    }

                }

            }

            resolve();

        })

    }

    /**
     * 
     * Parses %% variables and parses %[]% arrays in regex
     * 
     * @param {String} pattern - The pattern that should be parsed
     * 
     * @param {Array} rawHeadings
     * 
     */

    parseRegExPattern(pattern, rawHeadings) {

        let arrayVarRegEx = /(\%\[.*)%(.+)%(.*\]\%)/i;

        if (arrayVarRegEx.test(pattern)) {

            let result;

            while ((result = arrayVarRegEx.exec(pattern)) !== null) {

                if (this.getGeneralProperty(result[2])) {
                    pattern = pattern.replace(arrayVarRegEx, "$1" + this.getGeneralProperty(result[2]) + "$3");
                } else {
                    pattern = pattern.replace(arrayVarRegEx, "$1$3");
                }

            }


        }

        let arrayRegEx = /%\[(.+)\]%/i;

        if (arrayRegEx.test(pattern)) {

            let result;

            let properText;

            while ((result = arrayRegEx.exec(pattern)) !== null) {

                if (properText = this.findBestMatch(result[1].split(','), rawHeadings, 80)) {
                    pattern = pattern.replace(arrayRegEx, properText);
                } else {
                    // no match
                    return false;
                }

            }


        }

        return pattern;

    }

    /**
     * 
     * Parses %% variables in array
     * 
     * @param {Array} patternArray - The array that should be parsed
     * 
     */

    parsePatternArray(patternArray) {

        for (let key in patternArray) {

            if (/%(.+)%/i.test(patternArray[key])) {
                let result = /%(.+)%/i.exec(patternArray[key]);
                if (this.getGeneralProperty(result[1])) {
                    patternArray[key] = this.getGeneralProperty(result[1]);
                } else {
                    patternArray[key] = "";
                }
            }

        }

        return patternArray;
    }

    /**
     * 
     * Returns general property with certain key
     * 
     * @param {String} key - Key of the param
     * 
     */

    getGeneralProperty(key) {
        if (this.generalInfo.hasOwnProperty(key)) {
            return this.generalInfo[key];
        }
        return false;
    }

    /**
     * 
     * Deletes HTML tags
     * 
     * @param {String} HTML - The text that should be purified
     * 
     */

    eliminateHTMLTags(html) {

        html = html.replace(/<(.+)>(.+)<\/\1>/s, "$2");

        return html; //plain text

    }

    /**
     * 
     * Increments the mark
     * 
     * @param {Number} plusMark - The number that should be added to the mark
     * 
     */

    incrementMark(plusMark) {

        this.mark += plusMark;

    }

    /**
     * 
     * Parses the result
     * 
     */

    get() {

        // convert mark to percent and assign it to quality

        this.report.quality = this.mark / this.strategy.maxMark;

        this.report.quality = parseFloat(this.report.quality.toFixed(2));

        return this.report;

    }

}
module.exports = Checker;