// validate if the image file format is correct. if image is present in image directory
// validate if the audio file formate is correct. if audio is present in audio directory
// validate if QRcodes are linked to textbookid

const XLSX = require('xlsx');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const _CONFIG = require('./config/wordcard-config');
const worksheetName = 'Sheet1';
const excelFileName = 'WordCardStatusReport.xlsx';
const Joi = require('@hapi/joi');
const _apiHandler = require('./services/apiHandler');
const firstline = require('firstline');





let initQuestionsCreation = async () => {
            try {

                let result = [];
                let questions = await readCsvFile(_CONFIG.CSVPATH);



                let qrCodearray = [];
                let textBookarray = [];
                for (let i = 0; i < questions.length; i++) {
                    //console.log(`=========== ROW ${i} ===========`);
                    let item = questions[i];

                    item.QRorDoIdError = '';
                    if (item.textbookId) {
                        if (textBookarray.indexOf(item.textbookId) === -1) {
                            textBookarray.push(item.textbookId);
                        }
                    } else {
                        item.QRorDoIdError += "textbookId field is not populated";
                    }
                    let itemQRcode = item.Qrcode;
                    if (!itemQRcode) { console.log(`missing QR code on ${i} row`); }
                    if (qrCodearray.indexOf(itemQRcode) === -1) {
                        qrCodearray.push(itemQRcode);
                    }

                    /*
                          if (itemQRcode.indexOf(' ') === -1 && itemQRcode.length === 6) {
                            if (qrCodearray.indexOf(itemQRcode) === -1) {
                              qrCodearray.push(itemQRcode);
                            }
                          } else {

                            if (itemQRcode.indexOf(' ') >= 0) {
                              item.QRorDoIdError += "There is space in QR code.";
                            }
                            if (itemQRcode.length !== 6) {
                              item.QRorDoIdError += "The QR code length is not 6 and hence invalid."
                            }
                          }
                          if (item.QRorDoIdError.length === 0) {
                            delete item.QRorDoIdError;
                          }
                    */
                    let ImageLinkPath = item.imageLink ? item.imageLink : '';
                    let validImage = ImageLinkPath.search(/\.jpg$/i);
                    if (validImage === -1) {
                        console.log("Not Valid Image for row " + (i+2));
                        item.imagestatus = "Invalid Image";

                    }
                    if (!_.isEmpty(ImageLinkPath) && !_.isEqual(ImageLinkPath, 'NULL')) {
                        let wordcardImageName = path.basename(ImageLinkPath);
                        let isImageFileExist = await fs.pathExists(path.join(_CONFIG.IMAGE_PATH, ImageLinkPath));

                        if (!isImageFileExist) {
                            item.wordcardImageStatus = 'Image does Not Exists. Data need correction';
                        } else {
                            item.wordcardImageStatus = 'Exist';
                        }
                    }
                    let audioLinkPath = item.audioLink ? item.audioLink : '';
                    let validAudio = audioLinkPath.search(/\.mp3$/i);
                    if (validAudio === -1) {
                        console.log("Not Valid Audio for row " + (i + 2));
                        item.audiostatus = "Invalid Audio";
                    }
                        if (!_.isEmpty(audioLinkPath) && !_.isEqual(audioLinkPath, 'NULL')) {
                            let wordcardAudioName = path.basename(audioLinkPath);
                            let isAudioFileExist = await fs.pathExists(path.join(_CONFIG.AUDIO_PATH, audioLinkPath));

                            if (!isAudioFileExist) {
                                item.wordcardAudioStatus = 'Image does Not Exists. Data need correction';
                            } else {
                                item.wordcardAudioStatus = 'Exist';
                            }
                        }
                        result.push(item);
                    }
                    console.log(qrCodearray);
                    var createRes = await _apiHandler.getContentHierarchy(textBookarray[0]);
                    if (createRes) {
                        var dialcodes = await getbookdialcodes(createRes.result.content.children);
                        console.log(dialcodes);
                        var missqr = await missMatchQRCode(dialcodes, qrCodearray);
                        if (missqr.length > 0) {
                            console.log("This is missing qr codes array: " + missqr);
                            // process.exit();
                        }
                        var diffQR = _.difference(qrCodearray, missqr);
                        // await getAssessmentidReport(diffQR);

                        console.log("everything is fine");
                        // console.log(textBookarray);
                    } else {
                        console.log("Issue in book");
                    }



                    if (!_.isEmpty(result)) jsonToExcel(result);
                } catch (error) {
                    console.log('ERROR :: ', error);

                }
            };

            let getbookdialcodes = async array => {
                dialcodeArray = [];
                await getDialcodes(array);
                return dialcodeArray;
            }

            let getAssessmentidReport = async qrarray => {
                qrarray.forEach(function(codeqr) {
                    qrassessment(codeqr);
                });
            }

            let qrassessment = async qr => {
                let requestBody = await searchQuestions(qr);
                let questionIds = await _apiHandler.searchContent(requestBody);
                console.log("The question id result is: " + JSON.stringify(questionIds.result));
                if (questionIds && questionIds.result && questionIds.result.count) {
                    console.log("The question id count is: " + questionIds.result.count);
                }
                if (questionIds && questionIds.result && questionIds.result.count && questionIds.result.count !== 0) {
                    console.log("QRcode " + qr + " is having existing assessment items");
                }
            }


            let missMatchQRCode = async (qrcodearray, sheetqr) => {
                var missQRcodearray = [];
                var qrset = new Set(qrcodearray);

                sheetqr.forEach(function(qr) {

                    if (!qrset.has(qr)) {
                        missQRcodearray.push(qr);

                    }
                })
                return missQRcodearray;
            }


            function getDialcodes(array) {
                if (array.length !== 0) {
                    array.forEach(function(element) {
                        if (element.children) {
                            getDialcodes(element.children);
                        }
                        if (element.dialcodes && element.dialcodes[0]) {
                            dialcodeArray.push(element.dialcodes[0]);
                        }
                    })
                }
            }


            let searchQuestions = async keyword => {
                let reqBody = {
                    request: {
                        filters: {
                            objectType: ['AssessmentItem'],
                            status: ['Live'],
                            keywords: [keyword],
                            createdBy: _CONFIG.CREATED_BY
                        },
                        fields: ['identifier'],
                        sort_by: {
                            lastUpdatedOn: 'desc'
                        },
                        limit: 1000
                    }
                };
                return reqBody;
            };

            /**
             * Read csv file and convert csv to json
             *
             * @param {string} filepath
             * @return {Array} Return array repponse
             *
             */

            let readCsvFile = async filepath => {
                return new Promise(function(resolve, reject) {
                    // console.log('Reading a excel file');

                    // If it's encoded in UTF8, make sure that it starts with the UTF8 BOM.
                    // If not, then pass the option codepage: 65001 to the read function:
                    // https://github.com/sheetjs/js-codepage
                    // https://github.com/SheetJS/js-xlsx/issues/1481

                    var workbook = XLSX.read(filepath, {
                        type: 'file',
                        codepage: 65001
                    });
                    var sheet_name_list = workbook.SheetNames;
                    var result = [];
                    sheet_name_list.forEach(function(y) {
                        var worksheet = workbook.Sheets[y];
                        var headers = {};
                        var data = [];
                        for (z in worksheet) {
                            if (z[0] === '!') continue;
                            //parse out the column, row, and value
                            var col = z.substring(0, 1);
                            var row = parseInt(z.substring(1));
                            var value = worksheet[z].v;

                            //store header names
                            if (row == 1) {
                                headers[col] = value;
                                continue;
                            }

                            if (!data[row]) data[row] = {};
                            data[row][headers[col]] = value;
                        }
                        //drop those first two rows which are empty
                        data.shift();
                        data.shift();

                        data.forEach(function(item) {
                            result.push(item);
                        });
                    });
                    if (!_.isEmpty(result)) {
                        resolve(result);
                    } else {
                        console.log('Excel ERROR : Excel file is empty!!');
                        reject('Excel file is empty!!');
                    }
                });
            };

            let jsonToExcel = json => {
                var wb = XLSX.utils.book_new(),
                    ws = XLSX.utils.json_to_sheet(json);
                XLSX.utils.book_append_sheet(wb, ws, worksheetName);
                XLSX.writeFile(wb, path.join(__dirname, excelFileName));
            };

            // Init function
            initQuestionsCreation();