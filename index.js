'use strict';

const os = require('os');

const instaTouch = require('./lib/instance');
const instaTouchClass = require('./lib/instaTouch');

let INIT_OPTIONS = {
    id: '',
    count: 0,
    download: false,
    asyncDownload: 2,
    mediaType: 'all',
    proxy: '',
    filename: '[id]',
    filepath: ``,
    filetype: 'na',
    progress: false,
};

const startScraper = (options) => {
    return new Promise(async (resolve, reject) => {
        if (!options.filepath) {
            options.filepath = INIT_OPTIONS.filepath;
        }

        if (!options.filetype) {
            options.filetype = INIT_OPTIONS.filetype;
        }

        if (!options.mediaType) {
            options.mediaType = INIT_OPTIONS.mediaType;
        }

        if (!options.filename) {
            options.filename = INIT_OPTIONS.filename;
        }

        if (!options.asyncDownload) {
            options.asyncDownload = INIT_OPTIONS.asyncDownload;
        }

        try {
            return resolve(await instaTouch(options).getPosts());
        } catch (error) {
            return reject(error);
        }
    });
};

exports.hashtag = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.scrapeType = 'hashtag';
    options.id = id;

    if (options.event) {
        return instaTouch(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.location = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.scrapeType = 'location';
    options.id = id;

    if (options.event) {
        return instaTouch(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.user = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.scrapeType = 'user';
    options.id = id;

    if (options.event) {
        return instaTouch(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.comments = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.scrapeType = 'comments';
    options.id = id;

    if (options.event) {
        return instaTouch(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.likers = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.scrapeType = 'likers';
    options.id = id;

    if (options.event) {
        return instaTouch(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.followers = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }

    if (!options.sessionId) {
        throw new Error('Selected type requires an active session ID');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.scrapeType = 'followers';
    options.id = id;

    if (options.event) {
        return instaTouch(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.following = (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    if (!options.sessionId) {
        throw new Error('Selected type requires an active session ID');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.scrapeType = 'following';
    options.id = id;

    if (options.event) {
        return instaTouch(options);
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await startScraper(options));
            } catch (error) {
                return reject(error);
            }
        });
    }
};

exports.getUserMeta = async (id, options) => {
    if (typeof options !== 'object') {
        throw new Error('Object is expected');
    }
    options = Object.assign(INIT_OPTIONS, options);

    options.scrapeType = 'user_meta';
    options.id = id;

    const instagram = new instaTouchClass(options);
    return await instagram.getUserMeta();
};
