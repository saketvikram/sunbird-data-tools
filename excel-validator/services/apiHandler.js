const _CONFIG = require('../config/wordcard-config');
const request = require('request');
let readContent = (contentId, fields = '') => {
  let options = {
    url: _CONFIG.BASE_URL + _CONFIG.SUB_PATH.CONTENT + _CONFIG.APIS.READ + contentId + fields,
    headers: {
      'Content-Type': 'application/json',
      Authorization: _CONFIG.API_KEY
    },
    json: true
  };
  console.log(`readContent API REQUEST BODY :: ${JSON.stringify(options)} `);
  return new Promise(function(resolve, reject) {

    request.get(options, function(error, resp, body) {
      if (!error && body && body.responseCode === 'OK') {
        console.log(`readContent API RESPONSE :: ${JSON.stringify(body)} `);
        resolve(body);
      } else if (!error && body) {
        console.log(`readContent API ERROR :: ${JSON.stringify(body)} `);
        reject(body);
      } else {
        console.log(`readContent API ERROR :: ${JSON.stringify(error)} `);
        reject(error);
      }

    });
  });
};


let searchContent = contentBody => {
  var options = {
    url: _CONFIG.BASE_URL + _CONFIG.SUB_PATH.SEARCH + _CONFIG.APIS.SEARCH,
    headers: {
      'Content-Type': 'application/json',
      Authorization: _CONFIG.API_KEY
    },
    body: contentBody,
    json: true
  };
 //  console.log(`searchContent API REQUEST BODY :: ${JSON.stringify(options)} `);
  return new Promise(function(resolve, reject) {

    request.post(options, function(error, resp, body) {
      if (!error && body && body.responseCode === 'OK') {
        // console.log(`searchContent API RESPONSE BODY :: ${JSON.stringify(body)} `);
        resolve(body);
      } else if (!error && body) {
        console.log(`searchContent API ERROR :: ${JSON.stringify(body)} `);
        reject(body);
      } else {
        console.log(`searchContent API ERROR :: ${JSON.stringify(error)} `);
        reject(error);
      }


    });
  });
};

let getContentHierarchy = (contentId, fields = '') => {
  let options = {
    url: _CONFIG.PRIVATE_BASE_URL + _CONFIG.SUB_PATH_V3.CONTENT + _CONFIG.APIS.HIERARCHY + contentId + "?mode=edit",
    headers: {
      'Content-Type': 'application/json',
      Authorization: _CONFIG.API_KEY
    },
    json: true
  };
   console.log(`Private getContentHierarchy API BODY :: ${JSON.stringify(options)} `);
  return new Promise(function(resolve, reject) {

    request.get(options, function(error, resp, body) {
      if (!error && body && body.responseCode === 'OK') {
        // console.log(`Private getContentHierarchy API RESPONSE :: ${JSON.stringify(body)} `);
        resolve(body);
      } else if (!error && body) {
        console.log(`Private getContentHierarchy API ERROR :: ${JSON.stringify(body)} `);
        reject(body);
      } else {
        console.log(`Private getContentHierarchy API ERROR :: ${JSON.stringify(error)} `);
        reject(error);
      }

    });
  });
};



module.exports = {
  readContent,
  searchContent,
  getContentHierarchy
};