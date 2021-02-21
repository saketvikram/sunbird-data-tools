const apiHandler = require("./apiHandler");
const data = require("./data");
const XLSX = require("xlsx");
const _cliProgress = require("cli-progress");
const YOUTUBE_KEY = "<YOUTUBE-KEY>";
const excelFileName = "content_fulldata.xlsx";
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
 const adapter = new FileSync('db.json')
const db = low(adapter)

function checklink(link) {
    //call youtube api and check the validity of link.
}
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
let result = [];

// result.doid = [];
// result.ytlink = [];
// result.status = [];
(async function getArtifactLink() {
    bar1.start(data.length, 0);
    for (var i = 0; i < data.length; i++) {
var count = db.read().__wrapped__.youtube.count;
count = count + 1;
  db.set('youtube.count', count)
  .write()
  


        bar1.update(i + 1);
        // console.log(data[i]);
        var obj = {};
        obj.url = "https://diksha.gov.in/play/content/"+data[i];
        var s = data[i];
        var a = s.split("/");
        obj.doid = a.pop();
  
        let readContentRes = await apiHandler.readContent(obj.doid.trim());
            //console.log(readContentRes.result.content.artifactUrl);
        // result.doid.push(data[i]);
        if (readContentRes.result.content.artifactUrl) {
            obj.ytlink = readContentRes.result.content.artifactUrl;
            // result.ytlink.push(readContentRes.result.content.artifactUrl);

            //Send video id to youtube api
            var videoid = YouTubeGetID(readContentRes.result.content.artifactUrl);
            // console.log(videoid);
            // console.log(typeof videoid);
            // var random_boolean = Math.random() >= 0.5;

            // if (random_boolean){
            //   youtubecheck = await apiHandler.checkyoutube(videoid);
            // } else {
            //   youtubecheck = await apiHandler.checkyoutube("videoid");
            // }

// const [a, b, c] = await Promise.all([who(), what(), where()]);

     let [youtubecheck, videoProperty] = await Promise.all([apiHandler.checkyoutube(videoid), apiHandler.checkvideoProperty(videoid)]);
    
  

           
            // console.log("----------------- YOUTUBE CHECK STATUS -------------------");
            // console.log(typeof youtubecheck);
            var resp;
            if (videoProperty && videoProperty.author_name) {
                for (var key in videoProperty) {
                    if (videoProperty.hasOwnProperty(key)) {
                        // console.log(key + " -> " + youtubecheck[key]);
                        obj[key] = videoProperty[key];
                    }
                }

            }
            if(typeof videoid === "string" && youtubecheck && youtubecheck.items){
                if(youtubecheck.items.length === 0){
                      obj["status"] = "Private Video";
                obj["privacyStatus"] = "private";
                obj["embeddable"] = false;
                } 
                if (youtubecheck.items[0] && youtubecheck.items[0].status.privacyStatus === "public" && youtubecheck.items[0].status.embeddable === true){
                       obj["status"] = "Valid Video link";
                obj["privacyStatus"] = "public";
                obj["embeddable"] = true;
                }
 if (youtubecheck.items[0] && youtubecheck.items[0].status.privacyStatus === "public" && youtubecheck.items[0].status.embeddable === false){
                       obj["status"] = "Public Video link";
                obj["privacyStatus"] = "public";
                obj["embeddable"] = false;
                }

            } else {
                obj["status"] = "Not a video link";
                obj["privacyStatus"] = "NA";
                obj["embeddable"] = "NA";
            }
              /*
            }
            if (youtubecheck && youtubecheck.items && youtubecheck.items[0] && youtubecheck.items[0].status.privacyStatus === "public" && youtubecheck.items[0].status.embeddable === true) {
                obj["status"] = "Valid link";
                obj["privacyStatus"] = "public";
                obj["embeddable"] = true;
               for (var key in youtubecheck) {
                    if (youtubecheck.hasOwnProperty(key)) {
                        // console.log(key + " -> " + youtubecheck[key]);
                        obj[key] = youtubecheck[key];
                    }
                }
            } else {
                // obj["status"] = "invalid link";
                if(youtubecheck && youtubecheck.items && youtubecheck.items.length === 0) {
                    obj["status"] = "private link";
                obj["privacyStatus"] = "private";
                obj["embeddable"] = false;
                } 
                if(youtubecheck && youtubecheck.items && youtubecheck.items[0]) {
                    obj["status"] = "valid link";
                obj["privacyStatus"] = youtubecheck.items[0].status.privacyStatus;
                obj["embeddable"] = youtubecheck.items[0].status.embeddable;

                }

            } */
       

            // console.log(resp);
            // result.ytlink.push("no artifact link");
            // console.log("----------------- YOUTUBE CHECK STATUS -------------------");
            // result.status.push(youtubecheck);
        } else
            obj.status = "no artifact link";
         // console.log("This is object status: " + obj.status);
        result.push(obj);
    }

    //print entire object
    // console.log(result);
    jsonToExcel(result);

    bar1.stop();

    console.log("Done.");
})();

const ws_name = "Sheet1";

let jsonToExcel = json => {
    var wb = XLSX.utils.book_new(),
        ws = XLSX.utils.json_to_sheet(json);
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, excelFileName);
};
(async function testyoutube() {
    //qHykTrjcbWg
    let youtubecheck = await apiHandler.checkyoutube("asdfasdfasdf");
    console.log(youtubecheck);
});

function YouTubeGetID(url) {
    var ID = "";
    url = url.replace(/(>|<)/gi, "").split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        ID = url;
    }
    return ID;
}