module.exports = {
    general: {
        readme: {
            exist: {
                heading: "Readme file exists!",
                message: "Some message",
                type: "success",
                mark: 1
            },
            notExist: {
                heading: "Readme file doesn't exist!",
                message: "Some message",
                type: "error"
            }
        }
    },
    inFiles: {
        readme: [{
            heading: false,
            pattern: "/# %[heading1,heading2,%repositoryName%]%(.+?)#/is",
            captures:[
                {
                    messages: {
                        exist: {
                            heading: "general regex matched",
                            message: "Some message",
                            type: "success",
                            mark: 1
                        },
                        notExist: {
                            heading: "general regex doesn't matched anything",
                            message: "Some message",
                            type: "error"
                        },
                    }
                },
                {
                    minLength: 20,
                    maxLength: 40,
                    messages:{
                        exist: {
                            heading: "1st captured, captured sth!",
                            message: "Some message",
                            type: "success",
                            mark: 1
                        },
                        notExist: {
                            heading: "1st captured, didn't capture anything!",
                            message: "Some message",
                            type: "error"
                        },
                        minLengthOk: {
                            heading: "1st captured, min length is ok.",
                            message: "Some message",
                            type: "success",
                            mark: 1
                        },
                        minLengthNotOk: {
                            heading: "1st captured, min length is not ok!",
                            message: "Some message",
                            type: "error"
                        },
                        maxLengthOk: {
                            heading: "1st captured, max length is ok!",
                            message: "Some message",
                            type: "success",
                            mark: 1
                        },
                        maxLengthNotOk:{
                            heading: "1st captured, max length is not ok!",
                            message: "Some message",
                            type: "error"
                        }
                    }
                }
            ],
            
        },
        {
            heading: true,
            pattern: ['%repositoryName%','heading2'],
            headingType:1,
            messages:{
                exist: {
                    heading: "Readme file exists!",
                    message: "Some message",
                    type: "success",
                    mark: 1
                },
                notExist: {
                    heading: "Readme file doesn't exist!",
                    message: "Some message",
                    type: "error"
                },
                headingTypeOk:{
                    heading: "heading type ok",
                    message: "Some message",
                    type: "success",
                    mark: 1
                },
                headingTypeNotOk:{
                    heading: "heading type error",
                    message: "Some message",
                    type: "error"
                }
            }
            
        }]
    },
    maxMark: 7
}