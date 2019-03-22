`use strict`

const fs = require('fs');

const instaTouch = require('./instaTouch');
const CONST = require('./constant');

let vending = (options) => {
  return vending.create(options);
};

vending.create = (options) => {
    if (!options.id || !parseInt(options.count))
        throw new Error(`Missing url or count`);

    if (options.download){
        if (!fs.existsSync(options.filepath))
            throw new Error(`Download path does not exist`);
    }

    if (CONST.media_type.indexOf(options.mediaType) === -1)
        throw new Error(`Wrong media type. You can set ${CONST.media_type}`);

    if (CONST.scrape_type.indexOf(options.scrapeType) === -1)
        throw new Error(`Wrong scrape type. You can set ${CONST.scrape_type}`);

    if (CONST.file_type.indexOf(options.filetype) === -1)
        throw new Error(`Wrong file type. You can set ${CONST.file_type}`);

    //Setting query hash key
    options.query_hash = CONST.hash[options.scrapeType];

    switch(options.scrapeType){
        case 'hashtag':
            options.url = `https://www.instagram.com/explore/tags/${options.id}/`;
            break;
        case 'user':
            if (!/^(?:https:\/\/)?(?:www.)?(?:instagram.com\/)([A-Za-z0-9_.])*\/$/.test(options.id)){
                if (options.id.indexOf('instagram.com')>-1){
                    options.id = `https://www.instagram.com/${options.id.split('instagram.com')[1].split('/')[1]}/`;
                }else{
                    if(!/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,30}$/.test(options.id))
                        throw new Error('Wrong instagram username');

                    options.url = `https://www.instagram.com/${options.id}/`;
                }
            }
            break;
        case 'location':
            options.url = `https://www.instagram.com/explore/locations/${options.id}/`
            break;
    }

    if (options.filename === "[id]")
        options.filename = options.id;

    let instance = new instaTouch(options);

    return instance;
};


module.exports = vending;