#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */

const yargs = require('yargs');
const { tmpdir } = require('os');
const IGScraper = require('../build');
const CONST = require('../build/constant');

const startScraper = async (argv) => {
    try {
        argv.scrapeType = argv._[0];
        argv.input = argv.id;
        argv.cli = true;
        argv.store_history = argv.store;
        if (argv.filename) {
            argv.fileName = argv.filename;
        }

        if (argv.historypath) {
            argv.historyPath = argv.historypath;
        }
        if (argv.file) {
            argv.input = argv.file;
        }
        if (argv.scrapeType.indexOf('-') > -1) {
            argv.scrapeType = argv.scrapeType.replace('-', '');
        }

        if (argv.async) {
            argv.asyncBulk = argv.async;
        }
        argv.bulk = false;
        const scraper = await IGScraper[argv.scrapeType](argv.input, argv);

        if (scraper.zip) {
            console.log(`ZIP path: ${scraper.zip}`);
        }
        if (scraper.json) {
            console.log(`JSON path: ${scraper.json}`);
        }
        if (scraper.csv) {
            console.log(`CSV path: ${scraper.csv}`);
        }
        if (scraper.message) {
            console.log(scraper.message);
        }
        if (scraper.table) {
            console.table(scraper.table);
        }
    } catch (error) {
        console.log(error);
    }
};

yargs
    .usage('Usage: $0 <command> [options]')
    .command('user [id]', 'Scrape posts from username. Enter only username', {}, (argv) => {
        startScraper(argv);
    })
    .command('hashtag [id]', 'Scrape posts from hashtag. Enter hashtag without #', {}, (argv) => {
        startScraper(argv);
    })
    .command('location [id]', 'Scrape posts from a specific location. Enter location ID', {}, (argv) => {
        startScraper(argv);
    })
    .command('comments [id]', 'Scrape comments from a post. Enter post url or post id', {}, (argv) => {
        startScraper(argv);
    })
    .command('likers [id]', 'Scrape users who liked a post. Enter post url or post id', {}, (argv) => {
        startScraper(argv);
    })
    .command('history', 'View previous download history', {}, (argv) => {
        startScraper(argv);
    })
    .command('from-file [file] [async]', 'Scrape users, hashtags, music, videos mentioned in a file. 1 value per 1 line', {}, (argv) => {
        startScraper(argv);
    })
    .options({
        help: {
            alias: 'h',
            describe: 'help',
        },
        count: {
            alias: 'c',
            default: 40,
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
            describe: 'Set single proxy',
        },
        'proxy-file': {
            default: '',
            describe: 'Use proxies from a file. Scraper will use random proxies from the file per each request. 1 line 1 proxy.',
        },
        session: {
            default: '',
            describe: 'Set session. For example: sessionid=BLBLBLBLLBL',
        },
        timeout: {
            default: 0,
            describe: "If you will receive error saying 'rate limit', you can try to set timeout. Timeout is in mls: 1000 mls = 1 second",
        },
        download: {
            alias: 'd',
            boolean: true,
            default: false,
            describe: 'Download all scraped posts',
        },
        zip: {
            alias: 'z',
            boolean: true,
            default: false,
            describe: 'ZIP all downloaded posts',
        },
        asyncDownload: {
            alias: 'a',
            default: 5,
            describe: 'How many posts should be downloaded at the same time. Try not to set more then 5 ',
        },
        filename: {
            alias: ['f'],
            default: '',
            describe: 'Set custom filename for the output files',
        },
        filepath: {
            default: process.env.SCRAPING_FROM_DOCKER ? '' : process.cwd(),
            describe: 'Directory to save all output files.',
        },
        filetype: {
            alias: ['t'],
            default: 'csv',
            choices: ['csv', 'json', 'all', ''],
            describe:
                "Type of output file where post information will be saved. 'all' - save information about all posts to a 'json' and 'csv'. '' - do not save data in to files ",
        },
        store: {
            alias: ['s'],
            boolean: true,
            default: false,
            describe:
                'Scraper will save the progress in the OS TMP or Custom folder and in the future usage will only download new posts avoiding duplicates',
        },
        historypath: {
            default: process.env.SCRAPING_FROM_DOCKER ? '' : tmpdir(),
            describe: 'Set custom path where history file/files will be stored',
        },
        remove: {
            alias: ['r'],
            default: '',
            describe: 'Delete the history record by entering "TYPE:INPUT" or "all" to clean all the history. For example: user:bob',
        },
    })
    .check((argv) => {
        if (CONST.scrapeType.indexOf(argv._[0]) === -1) {
            throw new Error('Wrong command');
        }

        if (!argv.download) {
            if (argv.cli && !argv.zip && !argv.type) {
                throw new Error(`Pointless commands. Try again but with the correct set of commands`);
            }
        }

        if (argv._[0] === 'from-file') {
            const async = parseInt(argv.async, 10);
            if (!async) {
                throw new Error('You need to set number of task that should be executed at the same time');
            }
            if (!argv.t && !argv.d) {
                throw new Error('You need to specify file type(-t) where data will be saved AND/OR if posts should be downloaded (-d)');
            }
        }

        if (process.env.SCRAPING_FROM_DOCKER && (argv.historypath || argv.filepath)) {
            throw new Error(`Can't set custom path when running from Docker`);
        }
        if (argv.remove) {
            if (argv.remove.indexOf(':') === -1) {
                argv.remove = `${argv.remove}:`;
            }
            const split = argv.remove.split(':');
            const type = split[0];
            const input = split[1];

            if (type !== 'all' && CONST.history.indexOf(type) === -1) {
                throw new Error(`--remove, -r list of allowed types: ${CONST.history}`);
            }
            if (!input && type !== 'trend' && type !== 'all') {
                throw new Error('--remove, -r to remove the specific history record you need to enter "TYPE:INPUT". For example: user:bob');
            }
        }

        return true;
    })
    .demandCommand()
    .help().argv;
