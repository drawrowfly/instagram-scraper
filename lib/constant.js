"use strict";

module.exports = {
    scrapeType: ['user', 'hashtag', 'location', 'comments', 'likers'],
    downloadable: ['user', 'hashtag', 'location'],
    notDownloadable: ['comments', 'likers'],
    mediaType: ["video", "image", "all"], 
    fileType: ["json", "csv", "all", "na"],
    csvFields: ["id", "ownerId", "ownerUsername", "shortcode", "isVideo", "takenAtTimestamp", "commentsDisabled", "thumbnailSrc", "url", "likes", "comments", "views"],
    csvCommentFields: ['id', 'text', 'created_at', 'did_report_as_spam', 'owner_id', 'owner_username', 'owner_is_verified', 'viewer_has_liked', 'likes'],
    hash: {
        'user': 'f045d723b6f7f8cc299d62b57abd500a',
        'hashtag': '174a5243287c5f3a7de741089750ab3b',
        'location': '1b84447a4d8b6d6d0426fefb34514485', // with auth only
        'post': '870ea3e846839a3b6a8cd9cd7e42290c',
        'comments': '97b41c52301f77ce508f55e66d17620e',
        'likers': 'd5d763b1e2acf209d62d22d184488e57',
    },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
}