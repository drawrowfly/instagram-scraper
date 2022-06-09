/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable no-throw-literal */
/* eslint-disable no-restricted-syntax */
import { tmpdir } from 'os';
import { readFile, writeFile, unlink } from 'fs';
import { fromCallback } from 'bluebird';
import { forEachLimit } from 'async';
import { InstaTouch } from './core';
import {
    Constructor,
    ScrapeType,
    Options,
    Result,
    UserMetaFromWebApi,
    PostMetaFromWebApi,
    History,
    HistoryItem,
    UserStories,
    UserReelsFeed,
} from './types';
import CONST from './constant';

const INIT_OPTIONS = {
    id: '',
    count: 50,
    download: false,
    asyncDownload: 5,
    mediaType: 'all',
    proxy: [],
    session: [],
    filepath: process.cwd(),
    filetype: 'na',
    progress: false,
    userAgent: CONST.userAgent,
    queryHash: '',
    url: '',
    cli: false,
    timeout: 0,
    endCursor: '',
    zip: false,
    bulk: true,
    headers: {},
};

/**
 * Load proxys from a file
 * @param file
 */
const proxyFromFile = async (file: string) => {
    try {
        const data = (await fromCallback((cb) => readFile(file, { encoding: 'utf-8' }, cb))) as string;
        const proxyList = data.split('\n');
        if (!proxyList.length) {
            throw new Error('Proxy file is empty');
        }
        return proxyList;
    } catch (error) {
        throw error.message;
    }
};

const validateFullProfileUrl = (constructor: Constructor, input: string) => {
    if (!/^https:\/\/www.instagram.com\/[\w.+]+\/?$/.test(input)) {
        if (/instagram.com\/(p|reel)\//.test(input)) {
            constructor.url = `https://www.instagram.com/${input.split(/instagram.com\/(p|reel)\//)[1].split('/')[1]}/?__a=1`;
        } else {
            constructor.url = `https://www.instagram.com/${input}/?__a=1`;
        }
    } else {
        constructor.url = `${input}?__a=1`;
        constructor.input = input.split('instagram.com/')[1].split('/')[0];
    }
};

const validatePostUrl = (constructor: Constructor, input: string) => {
    if (!/(https?:\/\/(www\.)?)?instagram\.com(\/(p|reel)\/[\w-]+\/?)/.test(input)) {
        if (/instagram.com\/(p|reel)\//.test(input)) {
            constructor.url = `https://www.instagram.com/p/${input.split(/instagram.com\/(p|reel)\//)[1].split('/')[1]}/?__a=1`;
        } else {
            constructor.url = `https://www.instagram.com/p/${input}/?__a=1`;
        }
    } else {
        constructor.url = `${input}?__a=1`;
        constructor.input = input.split(/instagram.com\/(p|reel)\//)[2].split('/')[0];
    }
};

const promiseScraper = async (input: string, type: ScrapeType, options?: Options): Promise<Result> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const constructor: Constructor = { ...INIT_OPTIONS, ...options, ...{ scrapeType: type, input } };
    switch (type) {
        case 'user':
        case 'stories':
            validateFullProfileUrl(constructor, input);
            break;
        case 'hashtag':
            constructor.url = `https://www.instagram.com/explore/tags/${input}/?__a=1`;
            break;
        case 'location':
            constructor.url = `https://www.instagram.com/explore/locations/${input}/?__a=1`;
            break;
        case 'comments':
        case 'likers':
            validatePostUrl(constructor, input);
            break;
        case 'followers':
        case 'following':
            if (Array.isArray(options?.session)) {
                if (!options?.session.length) {
                    throw 'This method is working only with the active session. Exampe: sessionid=1231231313';
                }
            } else {
                options!.session = options!.session && [options!.session as string];
            }
            if (!options?.session) {
                throw 'This method is working only with the active session. Exampe: sessionid=1231231313';
            }
            validateFullProfileUrl(constructor, input);

            break;
        default:
            break;
    }

    const scraper = new InstaTouch(constructor);

    const result: Result = await scraper.startScraper();
    return result;
};

export const user = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'user', options);
export const hashtag = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'hashtag', options);
export const location = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'location', options);
export const comments = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'comments', options);
export const likers = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'likers', options);
export const followers = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'followers', options);
export const following = async (input: string, options?: Options): Promise<Result> => promiseScraper(input, 'following', options);

export const getUserMeta = async (input: string, options?: Options): Promise<UserMetaFromWebApi> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const constructor: Constructor = { ...INIT_OPTIONS, ...options, ...{ scrapeType: 'user_meta', input } };
    const scraper = new InstaTouch(constructor);

    validateFullProfileUrl(constructor, input);
    const result = await scraper.getUserMeta(constructor.url);
    return result;
};

export const getPostMeta = async (input: string, options?: Options): Promise<PostMetaFromWebApi> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const constructor: Constructor = { ...INIT_OPTIONS, ...options, ...{ scrapeType: 'post_meta', input } };
    validatePostUrl(constructor, input);
    const scraper = new InstaTouch(constructor);

    const result = await scraper.getPostMeta(constructor.url);
    return result;
};

export const getStories = async (input: string, options?: Options): Promise<UserStories> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const constructor: Constructor = { ...INIT_OPTIONS, ...options, ...{ scrapeType: 'post_meta', input } };
    validateFullProfileUrl(constructor, input);
    const scraper = new InstaTouch(constructor);

    const userMeta = await scraper.getUserMeta(constructor.url);
    const result = await scraper.getStories(userMeta.graphql.user.id);
    return { ...result, id: userMeta.graphql.user.id };
};

/**
 * Get user reels feed
 * @param input
 * @param options
 * @returns
 */
export const getUserReels = async (input: string, options?: Options): Promise<UserReelsFeed> => {
    if (options && typeof options !== 'object') {
        throw new TypeError('Object is expected');
    }
    const constructor: Constructor = { ...INIT_OPTIONS, ...options, ...{ scrapeType: 'post_meta', input } };
    validateFullProfileUrl(constructor, input);
    const scraper = new InstaTouch(constructor);

    const userMeta = await scraper.getUserMeta(constructor.url);
    const result = await scraper.getUserReels(userMeta.graphql.user.id, constructor.count, constructor.endCursor!);
    return result;
};

// eslint-disable-next-line no-unused-vars
export const history = async (input: string, options?: Options) => {
    let store: string;

    const historyPath = process.env.SCRAPING_FROM_DOCKER ? '/usr/app/files' : options?.historyPath || tmpdir();
    try {
        store = (await fromCallback((cb) => readFile(`${historyPath}/ig_history.json`, { encoding: 'utf-8' }, cb))) as string;
    } catch (error) {
        throw `History file doesn't exist`;
    }
    const historyStore: History = JSON.parse(store);

    if (options?.remove) {
        const split = options.remove.split(':');
        const type = split[0];

        if (type === 'all') {
            const remove: any = [];
            for (const key of Object.keys(historyStore)) {
                remove.push(fromCallback((cb) => unlink(historyStore[key].file_location, cb)));
            }
            remove.push(fromCallback((cb) => unlink(`${historyPath}/ig_history.json`, cb)));

            await Promise.all(remove);

            return { message: `History was completely removed` };
        }

        const key = type !== 'trend' ? options.remove.replace(':', '_') : 'trend';

        if (historyStore[key]) {
            const historyFile = historyStore[key].file_location;

            await fromCallback((cb) => unlink(historyFile, cb));

            delete historyStore[key];

            await fromCallback((cb) => writeFile(`${historyPath}/ig_history.json`, JSON.stringify(historyStore), cb));

            return { message: `Record ${key} was removed` };
        }
        throw `Can't find record: ${key.split('_').join(' ')}`;
    }
    const table: HistoryItem[] = [];
    for (const key of Object.keys(historyStore)) {
        table.push(historyStore[key]);
    }
    return { table };
};

interface Batcher {
    scrapeType: string;
    input: string;
    by_user_id?: boolean;
}

const batchProcessor = (batch: Batcher[], options: Options): Promise<any[]> => {
    return new Promise((resolve) => {
        console.log('Instagram Bulk Scraping Started');
        const result: any[] = [];
        forEachLimit(
            batch,
            options.asyncBulk || 5,
            async (item) => {
                switch (item.scrapeType) {
                    case 'user':
                        try {
                            const output = await user(item.input, { ...{ bulk: true }, ...options });
                            result.push({ type: item.scrapeType, input: item.input, completed: true, scraped: output.collector.length });
                            console.log(`Scraping completed: ${item.scrapeType} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.scrapeType, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    case 'hashtag':
                        try {
                            const output = await hashtag(item.input, { ...{ bulk: true }, ...options });
                            result.push({ type: item.scrapeType, input: item.input, completed: true, scraped: output.collector.length });
                            console.log(`Scraping completed: ${item.scrapeType} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.scrapeType, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    case 'location':
                        try {
                            const output = await location(item.input, { ...{ bulk: true }, ...options });
                            result.push({ type: item.scrapeType, input: item.input, completed: true, scraped: output.collector.length });
                            console.log(`Scraping completed: ${item.scrapeType} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.scrapeType, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    case 'comments':
                        try {
                            const output = await comments(item.input, { ...{ bulk: true }, ...options });
                            result.push({ type: item.scrapeType, input: item.input, completed: true, scraped: output.collector.length });
                            console.log(`Scraping completed: ${item.scrapeType} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.scrapeType, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    case 'likers':
                        try {
                            const output = await likers(item.input, { ...{ bulk: true }, ...options });
                            result.push({ type: item.scrapeType, input: item.input, completed: true, scraped: output.collector.length });
                            console.log(`Scraping completed: ${item.scrapeType} ${item.input}`);
                        } catch (error) {
                            result.push({ type: item.scrapeType, input: item.input, completed: false });
                            console.log(`Error while scraping: ${item.input}`);
                        }
                        break;
                    default:
                        break;
                }
            },
            () => {
                resolve(result);
            },
        );
    });
};

export const fromfile = async (input: string, options: Options) => {
    let inputFile: string;
    try {
        inputFile = (await fromCallback((cb) => readFile(input, { encoding: 'utf-8' }, cb))) as string;
    } catch (error) {
        throw `Can't find fle: ${input}`;
    }
    const batch: Batcher[] = inputFile
        .split('\n')
        .filter((item) => item.indexOf('##') === -1 && item.length)
        .map((item) => {
            item = item.replace(/\s/g, '');
            if (item.indexOf('#') > -1) {
                return {
                    scrapeType: 'hashtag',
                    input: item.split('#')[1],
                };
            }
            if (item.indexOf('location|') > -1) {
                return {
                    scrapeType: 'location',
                    input: item.split('|')[1],
                };
            }
            if (item.indexOf('comments|') > -1) {
                return {
                    scrapeType: 'comments',
                    input: item.split('|')[1],
                    by_user_id: true,
                };
            }
            if (item.indexOf('likers|') > -1) {
                return {
                    scrapeType: 'likers',
                    input: item.split('|')[1],
                    by_user_id: true,
                };
            }
            return {
                scrapeType: 'user',
                input: item,
            };
        });
    if (!batch.length) {
        throw `File is empty: ${input}`;
    }

    if (options?.proxyFile) {
        options.proxy = await proxyFromFile(options?.proxyFile);
    }

    const result = await batchProcessor(batch, options);

    return { table: result };
};
