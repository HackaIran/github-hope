module.exports = {
    general: {
        readme: {
            exist: {
                heading: "Readme Existance",
                message: "Your project contains a 'README' file. Congrats!",
                type: "success",
                mark: 5
            },
            notExist: {
                heading: "Readme Existance",
                message: "Oops! It seems that your project does not contain a 'README' file. Please add it to pass this check.",
                type: "error"
            }
        },
        code_of_conduct: {
            exist: {
                heading: "Code of Conduct Existance",
                message: "Yay! You have added a 'Code of Conduct' to your project.",
                type: "success",
                mark: 1
            },
            notExist: {
                heading: "Code of Conduct Existance",
                message: "I can’t find the Code of Conduct. Please add it using Contributor Covenant drop-in 'Code of Conduct'",
                type: "error"
            }
        },
        contributing: {
            exist: {
                heading: "",
                message: "I found a 'CONTRIBUTING' file in your project. Good job!",
                type: "success",
                mark: 1
            },
            notExist: {
                heading: "Contributing Existance",
                message: "Mmmm… Did you forget to create a 'CONTRIBUTING' file? Please add it.",
                type: "error"
            }
        },
        license: {
            exist: {
                heading: "License Existance",
                message: "Kudos! You have a chosen a license for your project. But is it chosen properly? If you’re not sure, take a look at our interactive license chooser guide.",
                type: "success",
                mark: 1
            },
            notExist: {
                heading: "License Existance",
                message: "hoops! I couldn’t find your 'LICENSE' file. If you want help to choose a license, use our interactive license chooser guide.",
                type: "error"
            }
        }
    },
    inFiles: {
        readme: [{
            heading: true,
            pattern: ['%repositoryName%'],
            headingType: 1,
            messages: {
                exist: {
                    heading: "in Readme Project Name Existance",
                    message: "I can see your project name.👀",
                    type: "success",
                    mark: 1
                },
                notExist: {
                    heading: "in Readme Project Name Existance",
                    message: "Your project doesn’t have a name!? Please use our guide to choose a name for it.",
                    type: "error"
                },
                headingTypeNotOk: {
                    heading: "in Readme Project Name Place",
                    message: "Your project name is not in #...",
                    type: "warning"
                }
            }

        }, {
            heading: false,
            pattern: "/# %[%repositoryName%]%(.+?)#/is",
            captures: [{},
                {
                    minLength: 20,
                    messages: {
                        exist: {
                            heading: "in Readme Short Description",
                            message: "Thanks for adding a Description about your project.",
                            type: "success",
                            mark: 1
                        },
                        notExist: {
                            heading: "in Readme Short Description",
                            message: "Add a brief description about your project, please.",
                            type: "error"
                        },
                        minLengthNotOk: {
                            heading: "in Readme Short Description Length",
                            message: "Your description is too short.",
                            type: "warning"
                        }
                    }
                }
            ]
        }, {
            heading: true,
            pattern: ['Installation Guide', 'Installation', 'Install'],
            messages: {
                exist: {
                    heading: "in Readme Installation Guide Existance",
                    message: "Thanks for adding a Description about Installation Guide.",
                    type: "success",
                    mark: 1
                },
                notExist: {
                    heading: "in Readme Installation Guide Existance",
                    message: "Add a brief Installation Guide about your project, please.",
                    type: "error"
                }
            }
        }, {
            heading: true,
            pattern: ['Usage', 'How to Use', 'Examples', 'Example of Use'],
            messages: {
                exist: {
                    heading: "in Readme Usage Guide Existance",
                    message: "I’m so thankful that you have added a Usage Guide.",
                    type: "success",
                    mark: 1
                },
                notExist: {
                    heading: "in Readme Usage Guide Existance",
                    message: "Please add a Usage Guide in your README file.",
                    type: "error"
                }
            }
        }, {
            heading: true,
            pattern: ['Contribution Guide', 'contribution', 'Contributing', 'how to contribute'],
            messages: {
                exist: {
                    heading: "in Readme Contribution Guide Existance",
                    message: "Thanks for adding a contribution guide in README.md.",
                    type: "success",
                    mark: 1
                },
                notExist: {
                    heading: "in Readme contribution Guide Existance",
                    message: "Add a contribution guide into README.md, please.",
                    type: "error"
                }
            }
        }, {
            heading: true,
            pattern: ['license'],
            messages: {
                exist: {
                    heading: "in Readme License Existance",
                    message: "Thanks for adding a license in README.md.",
                    type: "success",
                    mark: 1
                },
                notExist: {
                    heading: "in Readme Usage Guide Existance",
                    message: "Add a license into README.md, please.",
                    type: "error"
                }
            }
        }, {
            heading: false,
            pattern: "/# %[Installation Guide,Installation,Install]%(.+?)#/is",
            captures: [{},
                {
                    minLength: 20,
                    messages: {
                        exist: {
                            heading: "in Readme Installation Guide Description",
                            message: "Thanks for adding a description about instalation.",
                            type: "success",
                            mark: 1
                        },
                        notExist: {
                            heading: "in Readme Installation Guide Description",
                            message: "Add a brief installation guide to your Readme.md.",
                            type: "error"
                        },
                        minLengthNotOk: {
                            heading: "in Readme Installation Guide Description",
                            message: "Your description for installation guide is too short.",
                            type: "warning"
                        }
                    }
                }
            ]
        }, {
            heading: false,
            pattern: "/# %[Usage,How to Use,Examples,Example of Use]%(.+?)#/is",
            captures: [{},
                {
                    minLength: 20,
                    messages: {
                        exist: {
                            heading: "in Readme Usage Guide Description",
                            message: "Thanks for adding a description about usage.",
                            type: "success",
                            mark: 1
                        },
                        notExist: {
                            heading: "in Readme Usage Guide Description",
                            message: "Add a brief usage to your Readme.md.",
                            type: "error"
                        },
                        minLengthNotOk: {
                            heading: "in Readme Usage Guide Description",
                            message: "Your description for usage is too short.",
                            type: "warning"
                        }
                    }
                }
            ]
        }, {
            heading: false,
            pattern: "/# %[Contribution Guide,contribution,Contributing,how to contribute]%(.+?)#/is",
            captures: [{},
                {
                    minLength: 20,
                    messages: {
                        exist: {
                            heading: "in Readme Contribution Guide Description",
                            message: "Thanks for adding a description about contribution.",
                            type: "success",
                            mark: 1
                        },
                        notExist: {
                            heading: "in Readme Contribution Guide Description",
                            message: "Add a brief contribution to your Readme.md.",
                            type: "error"
                        },
                        minLengthNotOk: {
                            heading: "in Readme Contribution Guide Description",
                            message: "Your description for contribution is too short.",
                            type: "warning"
                        }
                    }
                }
            ]
        }, {
            heading: false,
            pattern: "/# %[license]%(.+?)#/is",
            captures: [{},
                {
                    minLength: 3,
                    messages: {
                        exist: {
                            heading: "in Readme License Description",
                            message: "Thanks for adding a License to your project.",
                            type: "success",
                            mark: 1
                        },
                        notExist: {
                            heading: "in Readme Licensee Description",
                            message: "Add a License to your Readme.md.",
                            type: "error"
                        },
                        minLengthNotOk: {
                            heading: "in Readme License Description",
                            message: "Your License is too short.",
                            type: "warning"
                        }
                    }
                }
            ]
        }]
    },
    maxMark: 10
}