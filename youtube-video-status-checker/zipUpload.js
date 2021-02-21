const zipFolder = require('zip-folder');
const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const _ = require('lodash');
const X2JS = require("../libs/x2js.js");
const apiHandler = require("./apiHandler");
const _config = require("./config");
const logger = require('../config/winston');
const readDirSource = _config.INPUT_PATH;
const { performance } = require('perf_hooks');
var t0 = performance.now();


let initZipUpload = async () => {
  try {
    let tokenData = await apiHandler.generateAccessToken();
    let folderList = await fs.readdir(_config.INPUT_PATH);
    await foldertoZip(folderList);
    let zipFolderList = await fs.readdir(_config.OUTPUT_PATH);
    processOfContent(tokenData, zipFolderList);
  } catch (error) {
    logger.error(error.toString());
  }
}

let foldertoZip = async (folderList) => {

  if (_.isEmpty(folderList)) throw new Error('Fixture stories folder is empty');
  await fs.emptyDir(_config.OUTPUT_PATH);
  let count = folderList.length;
  for (var i = 0; i < count; i++) {
    await createZipFolder(folderList[i]);
  }
}

let createZipFolder = async (folderName) => {
  return await new Promise(function (res, rej) {
    zipFolder(readDirSource + folderName, '/home/saket/saket/Projects/pdf2ecml/zip/' + folderName + '.zip', function (err) {
      if (err) return rej(err);
      logger.info(`Created Zip folder for ${folderName}`);
      res();
    });
  });
}

let processOfContent = async (tokenData, zipFolderList) => {
  try {

    if (_.isEmpty(zipFolderList)) throw new Error('Zip folder is not exist');
    let count = zipFolderList.length;
    let folderName, fileName, folderPath, contentReq, contentRes, contentId,
    readContentRes, strVersionKey, contentBody='';

    for (let i = 0; i < count; i++) {
      folderName = zipFolderList[i];
      fileName = path.parse(folderName).name;
      folderPath = _config.OUTPUT_PATH + zipFolderList[i];
      contentReq = await prepareContentRequestBody(folderName);
      contentRes = await apiHandler.createContent(tokenData, contentReq);
      contentId = contentRes.result.content_id;
      logger.info(`${folderName} Content ID :: ${contentId}`);
      await apiHandler.uploadContentUsingFile(tokenData.access_token, folderPath, contentId);
      let strAssetBaseUrlImage = await createContentThumb(contentId,tokenData.access_token,fileName);
      readContentRes = await apiHandler.readContent(contentId, '?fields=body,versionKey');
      strVersionKey = readContentRes['result']['content']['versionKey'];
      contentBody = readContentRes.result.content.body;
      contentBody = parseContentBody(contentBody);
      contentBody = await processOfUpdateContentBody(contentBody, folderName);
      await apiHandler.updateContent(contentId, tokenData.access_token, contentBody, strAssetBaseUrlImage, strVersionKey);
      logger.info(`${folderName} Content body updated successfully`);
    }
    logger.info("PDF2ECML PROCESS SUCCESSFULLY DONE :)");
    var t1 = performance.now();
    logger.info(`Call to initZipUpload took ${t1 - t0} milliseconds.`)
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
}

let prepareContentRequestBody = async (folderName) => {
  try {
    let contentBody = await readContentFile(folderName, readDirSource, 'image2ecml.json');
    let body = {
      "request": {
        "content": {
          "name": contentBody.contentName,
          "description": contentBody.contentName,
          "subject": contentBody.subject,
          "medium": contentBody.medium,
          "gradeLevel": [contentBody.gradeLevel],
          "board": contentBody.board,
          "createdBy": _config.CREATED_BY,
          "organisation": _config.ORG_NAME,
          "createdFor": _config.CREATED_FOR,
          "contentType": "Resource",
          "ownershipType": _config.OWNERSHIPTYPE,
          "ownedBy": _config.CHANNEL_ID,
          "owner": _config.ORG_NAME[0],
          "framework": _config.FRAEMEWORK,
          "mimeType": _config.MIME_TYE.ECML,
          "resourceType": "Learn",
          "creator": _config.CREATOR
        }
      }
    }
    return body;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
}

let createContentThumb = async (contentId, access_token, fileName) => {
  try {
    var strImageType = "jpeg";
    let contentUploadBody = { "request": { "content": { "fileName": _config.ICON_NAME } } };
    let strPreSignedUrl = await apiHandler.getPreSignedURL(contentId, access_token, contentUploadBody);
    strPreSignedUrl = strPreSignedUrl['result']['pre_signed_url'];
    let imageFilePath = `${readDirSource}${fileName}/assets/${_config.ICON_NAME}`;
    await apiHandler.uploadFileToS3SinglePUT(strPreSignedUrl, imageFilePath, strImageType);
    let index = strPreSignedUrl.indexOf("?");
    let strAssetBaseUrlImage = strPreSignedUrl.substring(0, index);
    return strAssetBaseUrlImage;
  } catch (error) {
    logger.error(error.message);
    throw error;
  }
}


let parseContentBody = (contentBody) => {
  try {
    contentBody = JSON.parse(contentBody)
  } catch (e) {
    contentBody = convertToJSON(contentBody)
  }
  return contentBody;
}

let convertToJSON = (contentBody) => {
  try {
    let x2js = new X2JS({ attributePrefix: 'none', enableToStringFunc: false });
    contentBody = x2js.xml_str2json(contentBody);
    return contentBody;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

let processOfUpdateContentBody = async (contentBody, folderName) => {
  try {
    let videoJsonBody = await readContentFile(folderName, readDirSource, 'indexVideo.json'); 
    _.forEach(contentBody.theme.manifest.media, function (value, key) {
      let index = _.findIndex(videoJsonBody.theme.manifest.media, ['id', value.id]);
      if (index != -1) {
        videoJsonBody.theme.manifest.media[index].src = contentBody.theme.manifest.media[key].src;
      }
    });
    return videoJsonBody;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

let readContentFile = async (folderName,sourcePath,fileName) => {
  folderName = path.parse(folderName).name;
  folderName = `${sourcePath}${folderName}/${fileName}`;
  let jsonBody = await fs.readFile(folderName, 'utf8');
  return JSON.parse(jsonBody);
}

initZipUpload();











