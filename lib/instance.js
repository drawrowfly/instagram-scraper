'use strict';

const fs = require('fs');

const InstaTouch = require('./instaTouch');
const CONST = require('./constant');

let vending = options => {
    return vending.create(options);
};

vending.create = options => {
    if (!options.id) {
        throw new Error('Missing instagram input id');
    }

    if (options.download) {
        if (!fs.existsSync(options.filepath)) {
            throw new Error('Download path does not exist');
        }
    }

    if (CONST.mediaType.indexOf(options.mediaType) === -1) {
        throw new Error(`Wrong media type. You can set ${CONST.mediaType}`);
    }

    if (CONST.scrapeType.indexOf(options.scrapeType) === -1) {
        throw new Error(`Wrong scrape type. You can set ${CONST.scrapeType}`);
    }

    if (CONST.fileType.indexOf(options.filetype) === -1) {
        throw new Error(`Wrong file type. You can set ${CONST.fileType}`);
    }

    //Setting query hash key
    options.queryHash = CONST.hash[options.scrapeType];

    switch (options.scrapeType) {
        case 'hashtag':
            options.url = `https://www.instagram.com/explore/tags/${options.id}/`;
            break;
        case 'user':
        case 'followers':
        case 'following':
            if (!/^(?:https:\/\/)?(?:www.)?(?:instagram.com\/)([A-Za-z0-9_.])*\/$/.test(options.id)) {
                if (options.id.indexOf('instagram.com') > -1) {
                    options.id = `https://www.instagram.com/${options.id.split('instagram.com')[1].split('/')[1]}/`;
                } else {
                    if (!/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,30}$/.test(options.id)) {
                        throw new Error('Wrong instagram username');
                    }

                    options.url = `https://www.instagram.com/${options.id}/`;
                }
            } else {
                options.url = options.id;
                options.id = options.id.split('instagram.com/')[1].split('/')[0];
            }
            break;
        case 'location':
            options.url = `https://www.instagram.com/explore/locations/${options.id}/`;
            break;
        case 'comments':
        case 'likers':
            if (!/(https?:\/\/(www\.)?)?instagram\.com(\/p\/\w+\/?)/.test(options.id)) {
                if (options.id.indexOf('instagram.com/p/') > -1) {
                    options.id = `https://www.instagram.com/p/${options.id.split('instagram.com/p/')[1].split('/')[1]}/`;
                } else {
                    options.url = `https://www.instagram.com/p/${options.id}/`;
                }
            } else {
                options.url = options.id;
                options.id = options.id.split('instagram.com/p/')[1].split('/')[0];
            }
            break;
    }

    if (options.filename === '[id]') {
        options.filename = options.id;
    }
    return new InstaTouch(options);
};

module.exports = vending;
