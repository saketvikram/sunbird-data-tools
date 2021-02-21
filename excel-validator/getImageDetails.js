const readdirp = require('readdirp');
const _ = require('lodash');
const XLSX = require('xlsx');
const path = require('path');
const sizeOf = require('image-size');
const inputDir = '/Users/saket/Documents/question-create/cg/maths-10/Images';
const fileFilter = ['*.jpg', '*.jpeg', '*.png'];
const isStats = true;
const worksheetName = 'Sheet1';
const excelFileName = 'imageDetails.xlsx';

const read = async directory => {
  let files = await readdirp.promise(directory, { alwaysStat: isStats, fileFilter: fileFilter });

  if (_.isEmpty(files)) throw new Error('Given Directory is empty.');

  files = _.map(files, file => {
    return { filepath: file.fullPath, filename: file.basename, filesize: file.stats.size };
  });
  return files;
};

let formatFileSize = (bytes, decimalPoint) => {
  if (bytes == 0) return '0 Bytes';
  var k = 1000,
    dm = decimalPoint || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

let gcd = (a, b) => {
  return b ? gcd(b, a % b) : a;
};

let aspectRatio = (width, height) => {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

let jsonToExcel = json => {
  var wb = XLSX.utils.book_new(),
    ws = XLSX.utils.json_to_sheet(json);
  XLSX.utils.book_append_sheet(wb, ws, worksheetName);
  XLSX.writeFile(wb, path.join(__dirname, excelFileName));
};

read(inputDir).then(files => {
  console.log('Count :: ' + files.length);
  try {
    let images = [];
    files.forEach(file => {
      let dimensions = sizeOf(file.filepath);
      dimensions.filname = file.filename;
      dimensions.filepath = file.filepath;
      dimensions.filesize = formatFileSize(file.filesize);
      dimensions.aspectRatio = aspectRatio(dimensions.width, dimensions.height);
      images.push(dimensions);
    });
    jsonToExcel(images);
    console.log('DONE!!');
  } catch (error) {
    console.log('Error: ' + error.message);
  }
});
