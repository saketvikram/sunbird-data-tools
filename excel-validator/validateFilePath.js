const XLSX = require('xlsx');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const _CONFIG = require('./config/config');
const _QCONFIG = require('./config/Questionconfig');
const worksheetName = 'Sheet1';
const excelFileName = 'questionAssetsStatusReport.xlsx';
const Joi = require('@hapi/joi');
const _apiHandler = require('./services/apiHandler');
const firstline = require('firstline');

var header = {};
_QCONFIG.headers.forEach(function(element) {
  var pattern = new RegExp(element);
  // console.log(typeof(pattern) + ' :' + pattern);
  header[element] = Joi.string().regex(pattern).required()
});
const headerschema = Joi.object().keys(header);
/*
const bodySchema = Joi.object().keys({



})*/

let processOfHeaderValidation = async filePath => {

  let headerbody = await firstline(filePath, {
    lineEnding: '\n'
  });
  headerbody = headerbody.split(',');
  var headerData = {};
  headerData.QuestionId = headerbody[0];
  headerData.QuestionTypeNo = headerbody[1];
  headerData.QuestionCategory = headerbody[2];
  headerData.QuestionText = headerbody[3];
  headerData.QuestionImage = headerbody[4];

  headerData.Option1 = headerbody[5];
  headerData.Option2 = headerbody[6];
  headerData.Option3 = headerbody[7];
  headerData.Option4 = headerbody[8];

  headerData.Option1Image = headerbody[9];
  headerData.Option2Image = headerbody[10];
  headerData.Option3Image = headerbody[11];
  headerData.Option4Image = headerbody[12];

  headerData.AnswerNo = headerbody[13];
  headerData.Medium = headerbody[14];
  // headerData.SubjectNameEng = headerbody[15];
  headerData.ClassNameEng = headerbody[15];
  headerData.SubjectNameEng = headerbody[16];

  headerData.DifficultyLevelId = headerbody[17];
  headerData.QRCode = headerbody[18];
  headerData.textbookId = headerbody[19];

  const result23 = headerschema.validate(headerData);
  // console.log(result23);

  if(result23.error){ 
    console.log(result23.error);
    process.exit() }
}


function hasDuplicates(array) {
  return (new Set(array)).size !== array.length;
}



let initQuestionsCreation = async () => {
  try {

    // await processOfHeaderValidation(_CONFIG.CSVPATH);
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
      let itemQRcode = item.QRCode;
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
      let questionImagePath = item.QuestionImage ? item.QuestionImage : '';

      if (!_.isEmpty(questionImagePath) && !_.isEqual(questionImagePath, 'NULL')) {
        let questionImageName = path.basename(questionImagePath);
        let isQuestionFileExist = await fs.pathExists(path.join(_CONFIG.Q_IMAGE_PATH, questionImagePath));

        if (!isQuestionFileExist) {
          item.QuestionImageStatus = 'Image does Not Exists. Data need correction';
        } else {
          item.QuestionImageStatus = 'Exist';
        }
      }

      for (let index = 1; index <= _CONFIG.TOTAL_OPTIONS; index++) {
        let optionImagePath = item[`Option${index}Image`] ? item[`Option${index}Image`] : '';
        if (!_.isEmpty(optionImagePath) && !_.isEqual(optionImagePath, 'NULL')) {
          let optionImageName = path.basename(optionImagePath);
           // console.log('this is option path image file : ' + path.join(_CONFIG.O_IMAGE_PATH, optionImagePath));
          let isOptionFileExist = await fs.pathExists(path.join(_CONFIG.O_IMAGE_PATH, optionImagePath));
          if (!isOptionFileExist) {
            item[`Option${index}ImageStatus`] = `Image does Not Exists. Data need correction`;
          } else {
            item[`Option${index}ImageStatus`] = `Exist`;
          }
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
      if(missqr.length > 0){
      console.log("This is missing qr codes array: " + missqr);
      process.exit();
    }
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