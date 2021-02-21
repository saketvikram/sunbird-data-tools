


// Preprod ENV
const CONFIG = {
    INPUT_PATH: "/home/saket/saket/Projects/sunbird-content-player/player/public/fixture-stories/",
    OUTPUT_PATH: "/home/saket/saket/Projects/pdf2ecml/zip/",
    TOKEN_BODY: "",
    API_KEY: "",
    YOUTUBE_KEY: "<YOUTUBE-KEY>",
    CHANNEL_ID: "in.ekstep",
    CREATED_BY: "",
    ORG_NAME: [""],
    CREATED_FOR: [""],
    FRAEMEWORK: "",
    CREATOR: "",
    OWNERSHIPTYPE: [""],
    KEY_BASE_URL: "https://staging.ntp.net.in",
    BASE_URL: "https://staging.ntp.net.in",
    PRIVATE_BASE_URL: "https://staging.ntp.net.in/api/private/",
    SUB_PATH_V3: {
        CONTENT: "content/v3/" ,
        assessment:"/action/assessment/v3/"
    },
    SUB_PATH: {
        USERS: "user/v1/",
        CONTENT: "content/v1/"
    },
    APIS_V3: {
        UPLOAD_URL: "upload/url/"
    },
    APIS: {
        CREATE: "create",
        TOKEN: "/auth/realms/sunbird/protocol/openid-connect/token",
        READ_PROFILE: "profile/read",
        UPLOAD: "upload/",
        UPADTE: "update/",
        READ: "read/",
        UPLOAD_URL: "upload/url/read/",
        ITEMCreate:"items/create"
    },
    CONTENT_DEFAULT_BODY: "",
    MIME_TYE: {
        ECML: "application/vnd.ekstep.ecml-archive",
        image:"image/png"
    },
    ICON_NAME: 'slide0.jpeg'
}


module.exports = CONFIG;