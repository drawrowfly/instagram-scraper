#!/usr/bin/env node
'use strict';

const instagramScrape = require('../lib/instance');

const startScraper = async argv => {
    try {
        argv.scrapeType = argv._[0];
        argv.cli = true;

        let scraper = await instagramScrape(argv).getPosts();

        if (scraper.zip) {
            console.log(`ZIP path: ${scraper.zip}`);
        }
        if (scraper.json) {
            console.log(`JSON path: ${scraper.json}`);
        }
        if (scraper.csv) {
            console.log(`CSV path: ${scraper.csv}`);
        }
    } catch (error) {
        console.log(error.message);
    }
};

require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('user [id]', 'Scrape posts from username. Enter only username', {}, argv => {
        startScraper(argv);
    })
    .command('hashtag [id]', 'Scrape posts from hashtag. Enter hashtag without #', {}, argv => {
        startScraper(argv);
    })
    .command('location [id]', 'Scrape posts from a specific location. Enter location ID', {}, argv => {
        startScraper(argv);
    })
    .command('comments [id]', 'Scrape comments from a post. Enter post url or post id', {}, argv => {
        startScraper(argv);
    })
    .command('likers [id]', 'Scrape users who liked a post. Enter post url or post id', {}, argv => {
        startScraper(argv);
    })
    .options({
        help: {
            alias: 'h',
            describe: 'help',
        },
        count: {
            alias: 'c',
            default: 0,
            describe: 'Number of post to scrape',
        },
        mediaType: {
            alias: 'm',
            default: 'all',
            choices: ['image', 'video', 'all'],
            describe: 'Media type to scrape',
        },
        proxy: {
            alias: 'p',
            default: '',
            describe: 'Set proxy',
        },
        timeout: {
            default: 0,
            describe: "If you will receive error saying 'rate limit', you can try to set timeout. Timeout is in mls: 1000 mls = 1 second",
        },
        download: {
            alias: 'd',
            boolean: true,
            default: false,
            describe: 'Download and archive all scraped posts to a ZIP file',
        },
        asyncDownload: {
            alias: 'a',
            default: 5,
            describe: 'How many posts should be downloaded at the same time. Try not to set more then 5 ',
        },
        progress: {
            boolean: true,
            default: true,
            describe: 'Show progress in terminal',
        },
        filename: {
            alias: ['file', 'f'],
            default: '[id]',
            describe: 'Name of the output file',
        },
        filepath: {
            default: process.cwd(),
            describe: 'Directory to save all output files.',
        },
        filetype: {
            alias: ['type', 't'],
            default: 'csv',
            choices: ['csv', 'json', 'all'],
            describe: "Type of output file where post information will be saved. 'all' - save information about all posts to a 'json' and 'csv' ",
        },
    })
    .demandCommand().argv;
