"use strict";

module.exports = {
    scrape_type: ["user", "hashtag", "location"],
    media_type: ["video", "image", "all"], 
    file_type: ["json", "csv", "both"],
    csv_fields: ["id", "ownerId", "ownerUsername", "shortcode", "isVideo", "takenAtTimestamp", "commentsDisabled", "thumbnailSrc", "url", "likes", "comments", "views"],
    hash: {
        "user": "f2405b236d85e8296cf30347c9f08c2a",
        "hashtag": "f92f56d47dc7a55b606908374b43a314",
        "location": "1b84447a4d8b6d6d0426fefb34514485",
        "post": "477b65a610463740ccdb83135b2014db",
    },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
}