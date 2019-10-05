#!/usr/bin/env node
"use strict";

const os = require("os");
 
const instagramScrape = require("../lib/instance");

const startScraper = (argv) => {
    argv.scrapeType = argv._[0];
    let instaGrab = instagramScrape(argv);
    instaGrab.getPosts()
    .then((that) =>{
        if (that._download){
            console.log(`ZIP path: ${that._filepath}/${that._filename}_${that._date}.zip`);
        }

        switch(that._filetype){
            case "json":
                console.log(`JSON path: ${that._filepath}/${that._filename}_${that._date}.json`);
                break;
            case "csv":
                console.log(`CSV path: ${that._filepath}/${that._filename}_${that._date}.csv`);
                break;
            default:
                console.log(`JSON path: ${that._filepath}/${that._filename}_${that._date}.json`);
                console.log(`CSV path: ${that._filepath}/${that._filename}_${that._date}.csv`);
                break;
        }
    })
    .catch((error) =>{
        console.log(error.message);
    })
}

require("yargs")
    .command(
        "user [id]", 
        "scrape posts from username", 
        {}, 
        (argv) => {
            startScraper(argv);
        }
    )
    .command(
        "hashtag [id]", 
        "scrape posts from hashtag", 
        {}, 
        (argv) => {
            startScraper(argv);
        }
    )
    .command(
        "location [id]", 
        "scrape posts from location", 
        {}, 
        (argv) => {
            startScraper(argv);
        }
    )
    .options({
        "count": {
            alias: "c",
            default: 0,
            describe: "Number of post to scrape"
        },
        "mediaType": {
            default: "all",
            choices: ["image", "video", "all"],
            describe: "Media type to scrape"
        },
        "proxy": {
            alias: "p",
            default: "",
            describe: "Set proxy"
        },
        "download": {
            boolean: true,
            default: false,
            describe: "Download and archive all scraped posts to a ZIP file"
        },
        "asyncDownload": {
            default: 2,
            describe: "How many posts should be downloaded at the same time. Try not to set more then 5 "
        },
        "progress": {
            boolean: true,
            default: true,
            describe: "Show progress in terminal"
        },
        "filename":{
            alias: ["file", "f"],
            default: "[id]",
            describe: "Name of the output file",
        },
        "filepath":{
            default: `${os.homedir()}/Downloads`,
            describe: "Directory to save file",
        },
        "filetype": {
            alias: ["type", "t"],
            default: "json",
            choices: ["csv", "json", "both"],
            describe: "Type of output file",
        },
    })
    .argv