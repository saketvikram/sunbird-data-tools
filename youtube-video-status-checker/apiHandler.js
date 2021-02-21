const request = require("request");
const fs = require('fs-extra');
const _CONFIG = require("./config");
const logger = require('../config/winston');

// generate user access token API
let generateAccessToken = () => {

  var options = {
    url: _CONFIG.KEY_BASE_URL + _CONFIG.APIS.TOKEN,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: _CONFIG.TOKEN_BODY,
    json: true
  };

  logger.info(`generateAccessToken API BODY :: ${JSON.stringify(options)} `);

  return new Promise(function (resolve, reject) {
    request.post(options, function (err, res, body) {
      if (err) {
        logger.error(`generateAccessToken API ERR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
        logger.info(`generateAccessToken API RESPONSE :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}

// Create content API
let createContent = (data, contentReqBody) => {

  let options = {
    url: _CONFIG.BASE_URL + _CONFIG.SUB_PATH.CONTENT + _CONFIG.APIS.CREATE,
    headers: {
      'Content-Type': "application/json",
      'Authorization': _CONFIG.API_KEY,
      'X-Channel-Id': _CONFIG.CHANNEL_ID,
      'x-authenticated-user-token': data.access_token
    },
    body: contentReqBody,
    json: true
  };
  logger.info(`createContent API BODY :: ${JSON.stringify(options)} `);
  return new Promise(function (resolve, reject) {
    request.post(options, function (err, resp, body) {
      if (err) {
        logger.error(`createContent API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
        logger.error(`createContent API RESPONSE :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}
let createQuestion=(contentReqBody,token)=>{
  let options = {
    url: _CONFIG.BASE_URL + _CONFIG.SUB_PATH_V3.assessment + _CONFIG.APIS.ITEMCreate,
    headers: {
      'Content-Type': "application/json",
      'Authorization': _CONFIG.API_KEY,
     'x-authenticated-user-token':token
    },
    body: contentReqBody,
    json: true
};
return new Promise(function (resolve, reject) {
  request.post(options, function (err, resp, body) {
    if (err) {
      //logger.error(`createContent API ERROR :: ${JSON.stringify(err)} `);
      reject(err);
    } else {
      //logger.error(`createContent API RESPONSE :: ${JSON.stringify(body)} `);
      resolve(body);
    }
  });
});
}



//private content api 
let createContentPrivate = (contentReqBody) => {
  let options = {
    url: _CONFIG.PRIVATE_BASE_URL + _CONFIG.SUB_PATH_V3.CONTENT + _CONFIG.APIS.CREATE,
    headers: {
      'Content-Type': "application/json",
      'Authorization': _CONFIG.API_KEY,
      'cache-control': 'no-cache',
      'user-id': 'system',
      'x-channel-id': 'in.ekstep',
    },
    body: contentReqBody,
    json: true
  };
  // logger.info(`Private createContent API BODY :: ${JSON.stringify(options)} `);
  return new Promise(function (resolve, reject) {
    request.post(options, function (err, resp, body) {
      if (err) {
        //logger.error(`Private createContent API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
        // logger.error(`Private createContent API RESPONSE :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}

// READ CONTENT API
let readContent = (contentId, fields = '') => {

  let options = {
    url: _CONFIG.BASE_URL + _CONFIG.SUB_PATH.CONTENT + _CONFIG.APIS.READ + contentId + fields,
    headers: {
      'Content-Type': "application/json",
      'Authorization': _CONFIG.API_KEY
    },
    json: true
  };
  logger.info(`readContent API REQUEST BODY :: ${JSON.stringify(options)} `);
  return new Promise(function(resolve, reject) {
    request.get(options, function(err, resp, body) {
      if (err) {
        logger.error(`readContent API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
        logger.info(`readContent API RESPONSE BODY :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}

// Check if youtube is a valid link
let checkyoutube = (videoid) => {
  // console.log("This is videoid", + JSON.stringify(videoid));
  let options = {
    url: "https://www.googleapis.com/youtube/v3/videos?part=status&id=" + videoid + "&key=" + _CONFIG.YOUTUBE_KEY,
    headers: {
      'Content-Type': "application/json"
    },
    json: true
  };
  logger.info(`youtube API BODY :: ${JSON.stringify(options)} `);
  return new Promise(function (resolve, reject) {
    request.get(options, function (err, resp, body) {
      if (err) {
        logger.error(`youtube API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
         logger.info(`youtube API RESPONSE :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}


let checkvideoProperty = (videoid) => {

  let options = {
    url: "https://www.youtube.com/oembed?format=json&url=http://www.youtube.com/watch?v=" + videoid,
    headers: {
      'Content-Type': "application/json"
    },
    json: true
  };
  logger.info(`youtube API BODY :: ${JSON.stringify(options)} `);
  return new Promise(function (resolve, reject) {
    request.get(options, function (err, resp, body) {
      if (err) {
        logger.error(`youtube API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
         logger.info(`youtube API RESPONSE :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}

// Upload content using file API
let uploadContentUsingFile = async (access_token, folderPath, contentId) => {

    let formData = {
      files: await fs.createReadStream(folderPath),
      mimeType:_CONFIG.MIME_TYE.ECML
    };
    
    let options = {
      url: _CONFIG.BASE_URL + _CONFIG.SUB_PATH.CONTENT + _CONFIG.APIS.UPLOAD + contentId,
      headers: {
        'Content-Type' : "application/json",
        'Authorization' : _CONFIG.API_KEY,
        'X-Channel-Id' : _CONFIG.CHANNEL_ID,
        'x-authenticated-user-token' : access_token
      },
      formData:formData
    };
    logger.info(`uploadContentUsingFile API REQUEST BODY :: ${JSON.stringify(options)} `);
    return new Promise(function(resolve, reject) {
      request.post(options, function (err, resp, body) {
        if (err) {
          logger.error(`uploadContentUsingFile API ERROR :: ${JSON.stringify(err)} `);
          reject(err);
        } else {
          logger.info(`uploadContentUsingFile API RESPONSE BODY :: ${JSON.stringify(body)} `);
          resolve(body);
        }
      });
    });
};



// Update content API
let updateContent = (contentId, access_token, contentBody, strS3AssetPath, versionKey) => {

  var options = {
    url: _CONFIG.BASE_URL + _CONFIG.SUB_PATH.CONTENT + _CONFIG.APIS.UPADTE + contentId,
    headers: {
      'Content-Type': "application/json",
      'Authorization': _CONFIG.API_KEY,
      'x-authenticated-user-token': access_token
    },
    body: {
      "request": {
        "content": {
          "versionKey": versionKey,
          "body": contentBody,
          "appIcon": strS3AssetPath
        }
      }
    },
    json: true
  };
  logger.info(`updateContent API BODY :: ${JSON.stringify(options)} `);
  return new Promise(function (resolve, reject) {
    request.patch(options, function (err, resp, body) {
      if (err) {
        logger.error(`updateContent API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
        logger.error(`updateContent API RESPONSE :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}

let getPreSignedURL = (contentId, access_token, contentBody) => {
  let options = {
    url: _CONFIG.BASE_URL + _CONFIG.SUB_PATH.CONTENT + _CONFIG.APIS.UPLOAD_URL + contentId,
    headers: {
      'Content-Type': "application/json",
      'Authorization': _CONFIG.API_KEY,
      'X-Channel-Id': _CONFIG.CHANNEL_ID,
      'x-authenticated-user-token': access_token
    },
    body: contentBody,
    json: true
  };
  logger.info(`getPreSignedURL API REQUEST BODY :: ${JSON.stringify(options)} `);
  return new Promise(function (resolve, reject) {
    request.post(options, function (err, resp, body) {
      if (err && !body) {
        logger.error(`getPreSignedURL API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
        logger.info(`getPreSignedURL API RESPONSE BODY :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}

let uploadFileToS3SinglePUT = function (presignurl, contentFile, strMimeType) {
  return new Promise(function (resolve, reject) {
    var stats = fs.statSync(contentFile);
    fs.createReadStream(contentFile).pipe(request({
      method: 'PUT',
      url: presignurl,
      headers: {
        'Content-Type': strMimeType,
        "x-ms-blob-type": "BlockBlob",
        'Content-Length': stats['size']
      }
    }, function (err, res, body) {
      if (res && res.statusCode && res.statusCode === 201) {
        logger.info(`uploadFileToS3SinglePUT RESPONSE :::  ${res.statusCode}`);
        resolve(res.statusCode);
      } else {
        logger.error(`uploadFileToS3SinglePUT API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      }
    }));
  });
}
//upload private image
let uploadContentPrivate = (contentId, path) => {
    // let formData = {
    //   files: fs.createReadStream(path),
    //   mimeType: _CONFIG.MIME_TYE.image
    // };
    let formData = {
      file: {
        value: fs.createReadStream(path),
        options: {
          filename: 'icon.png',
          contentType: null
        }
      },
      mimeType: 'image/png'
    };
    let options = {
      url: _CONFIG.PRIVATE_BASE_URL + _CONFIG.SUB_PATH_V3.CONTENT + _CONFIG.APIS.UPLOAD + contentId,
      headers: {
        'user-id': 'system',
        'Authorization': _CONFIG.API_KEY,
      },
      formData: formData
    };
    return new Promise(function (resolve, reject) {
      request.post(options, function (err, resp, body) {
        if (err) {
          // logger.error(`uploadContentUsingFile API ERROR :: ${JSON.stringify(err)} `);
          reject(err);
        } else {
          // logger.error(`uploadContentUsingFile API RESPONSE :: ${JSON.stringify(body)} `);
          resolve(body);
        }
      });
    });
}

let updateContentPrivate = (contentId, contentBody) => {

  var options = {
    url: _CONFIG.PRIVATE_BASE_URL + _CONFIG.SUB_PATH_V3.CONTENT + _CONFIG.APIS.UPADTE + contentId,
    headers: {
      'Content-Type': "application/json",
      'Authorization': _CONFIG.API_KEY
    },
    body: contentBody,
    json: true
  }; 
  logger.info(`updateContentPrivate API REQUEST BODY :: ${JSON.stringify(options)} `);
  return new Promise(function (resolve, reject) {
    request.patch(options, function (err, resp, body) {
      if (err) {
        logger.error(`updateContentPrivate API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
        logger.info(`updateContentPrivate API RESPONSE BODY :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}

let getPreSignedURLPrivate = (contentId, contentBody) => {
  let options = {
    url: _CONFIG.PRIVATE_BASE_URL + _CONFIG.SUB_PATH_V3.CONTENT + _CONFIG.APIS_V3.UPLOAD_URL + contentId,
    headers: {
      'Content-Type': "application/json",
      'Authorization': _CONFIG.API_KEY
    },
    body: contentBody,
    json: true
  };
  logger.info(`getPreSignedURLPrivate API REQUEST BODY :: ${JSON.stringify(options)} `);
  return new Promise(function (resolve, reject) {
    request.post(options, function (err, response, body) {
      if (err) {
        logger.error(`getPreSignedURLPrivate API ERROR :: ${JSON.stringify(err)} `);
        reject(err);
      } else {
        logger.info(`getPreSignedURLPrivate API RESPONSE BODY :: ${JSON.stringify(body)} `);
        resolve(body);
      }
    });
  });
}

module.exports = {
  generateAccessToken,
  updateContent,
  createContent,
  uploadContentUsingFile,
  readContent,
  getPreSignedURL,
  checkvideoProperty,
  uploadFileToS3SinglePUT,
  checkyoutube,
  updateContentPrivate,
  getPreSignedURLPrivate,
  createContentPrivate,
  uploadContentPrivate,
  createQuestion
};