`use strict`

const os = require('os');

const instagramScrape = require('./lib/instance');

let INIT_OPTIONS = {
    id: "",
    count: 0,
    download: false,
    mediaType: "all",
    proxy: "",
    filename: "[id]",
    filepath: `${os.homedir()}/Downloads`,
    filetype: "json",
};

const startScraper = ( options ) => {
    if (!options.filepath)
        options.filepath = INIT_OPTIONS.filepath;

    if (!options.filetype)
        options.filetype = INIT_OPTIONS.filetype;

    if (!options.mediaType)
        options.mediaType = INIT_OPTIONS.mediaType;

    if (!options.filename)
        options.filename = INIT_OPTIONS.filename;

    let instaGrab = instagramScrape(options)

    instaGrab.getPosts()
    .then(that =>{
        if (that._download)
            console.log(`ZIP path: ${that._filepath}/${that._filename}_${that._date}.zip`);

        switch(that._filetype){
            case 'json':
                console.log(`JSON path: ${that._filepath}/${that._filename}_${that._date}.json`);
                break;
            case 'csv':
                console.log(`CSV path: ${that._filepath}/${that._filename}_${that._date}.csv`);
                break;
            default:
                console.log(`JSON path: ${that._filepath}/${that._filename}_${that._date}.json`);
                console.log(`CSV path: ${that._filepath}/${that._filename}_${that._date}.csv`);
                break;
        }
    })
    .catch(error =>{
        console.log(error.message);
    })
}

exports.hashtag = ( id, options = INIT_OPTIONS ) => {
    if (typeof(options) !== 'object' )
        throw new Error("Object is expected")
    options.scrapeType = "hashtag";
    options.id = id;

    startScraper(options)
}

exports.location = ( id, options = INIT_OPTIONS ) => {
    if (typeof(options) !== 'object' )
        throw new Error("Object is expected")
    options.scrapeType = "location";
    options.id = id;

    startScraper(options)
}

exports.user = ( id, options = INIT_OPTIONS ) => {
    if (typeof(options) !== 'object' )
        throw new Error("Object is expected")
    options.scrapeType = "user";
    options.id = id;

    startScraper(options)
}

