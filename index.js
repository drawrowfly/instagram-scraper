"use strict";

const os = require("os");

const instaTouch = require("./lib/instance");

let INIT_OPTIONS = {
    id: "",
    count: 0,
    download: false,
    asyncDownload: 2,
    mediaType: "all",
    proxy: "",
    filename: "[id]",
    filepath: `${os.homedir()}/Downloads`,
    filetype: "json",
    progress: false,
};

const startScraper = ( options ) => {
    return new Promise( async (resolve, reject) => {
        let magic;
        if (!options.filepath){
            options.filepath = INIT_OPTIONS.filepath;
        }

        if (!options.filetype){
            options.filetype = INIT_OPTIONS.filetype;
        }

        if (!options.mediaType){
            options.mediaType = INIT_OPTIONS.mediaType;
        }

        if (!options.filename){
            options.filename = INIT_OPTIONS.filename;
        } 

        if (!options.asyncDownload){
            options.asyncDownload = INIT_OPTIONS.asyncDownload;
        }

        let instaGrab = instaTouch(options);

        try{
            magic = await instaGrab.getPosts();
        } catch(error){
            return reject(error);
        }

        if (magic._download){
            magic.zip = `${magic._filepath}/${magic._filename}_${magic._date}.zip`;
        }

        switch(magic._filetype){
            case "json":
                magic.json = `${magic._filepath}/${magic._filename}_${magic._date}.json`;
                break;
            case "csv":
                magic.csv = `${magic._filepath}/${magic._filename}_${magic._date}.csv`;
                break;
            default:
                magic.json = `${magic._filepath}/${magic._filename}_${magic._date}.json`;
                magic.csv = `${magic._filepath}/${magic._filename}_${magic._date}.csv`;
                break;
        }
        return resolve(magic);
    })
}

exports.hashtag = ( id, options ) => {
    return new Promise( async (resolve, reject) => {
        if (typeof(options) !== 'object' ){
            throw new Error("Object is expected");
        }

        options = Object.assign(INIT_OPTIONS, options)

        options.scrapeType = "hashtag";
        options.id = id;

        try{
            return resolve(await startScraper(options));
        }catch(error){
            return reject(error);
        }

    })
}

exports.location = ( id, options ) => {
    return new Promise( async(resolve, reject) => {
        if (typeof(options) !== 'object' ){
            throw new Error("Object is expected");
        }

        options = Object.assign(INIT_OPTIONS, options)

        options.scrapeType = "location";
        options.id = id;

        try{
            return resolve(await startScraper(options));
        }catch(error){
            return reject(error);
        }
    })
}

exports.user = ( id, options ) => {
    return new Promise( async (resolve, reject) => {
        if (typeof(options) !== "object" ){
            throw new Error("Object is expected");
        }

        options = Object.assign(INIT_OPTIONS, options)

        options.scrapeType = "user";
        options.id = id;

        try{
            return resolve(await startScraper(options));
        }catch(error){
            return reject(error);
        }
    })
}

