'use strict';

const rp = require('request-promise');
const request = require('request');
const { jar } = require('request');
const crypto = require('crypto');
const archiver = require('archiver');
const fs = require('fs');
const async = require('async');
const Json2csvParser = require('json2csv').Parser;
const ProgressBar = require('progress');
const ora = require('ora');
const Bluebird = require('bluebird');
const EventEmitter = require('events');

const MultipleBar = require('./multipleBar');

//Constants
const CONST = require('./constant');

class instaTouch extends EventEmitter {
    constructor({
        url,
        download,
        filepath,
        filename,
        filetype,
        id,
        count,
        proxy,
        queryHash,
        mediaType,
        scrapeType,
        asyncDownload,
        progress,
        cli,
        event,
        timeout,
        sessionId,
        proxyList,
    }) {
        super();
        this._url = url;
        this._mainHost = 'https://instagram.com/';
        this._download = download;
        this._filepath = '' || filepath;
        this._filename = filename;
        this._filetype = filetype;
        this._mbars = new MultipleBar();
        this._id = id;
        this._toCollect = count;
        this._proxy = proxy;
        this._queryHash = queryHash;
        this._type = mediaType;
        this._scrapeType = scrapeType;
        this._asyncDownload = asyncDownload;
        this._collector = [];
        this._date = Date.now();
        this._cookieJar = jar();
        this._progressBar = [];
        this._progress = progress;
        this._event = event;
        this._timeout = timeout;
        this._cli = cli;
        this._spinner = cli ? ora('Instagram Scraper Started').start() : '';
        this._sessionId = sessionId;
        //Important!!! If you change user agents, hash keys will be invalid
        this._userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36';

        this._itemId = '';
        this._hasNextPage = false;
        this._rhxGis = '';
        this._endCursor = '';
        this._csrftoken = '';
    }

    _setSpinnerText(text) {
        this._spinner.text = text;
    }

    _request({ uri, method, qs, body, form, headers, json, gzip, jar }) {
        let proxy = '';
        if (Array.isArray(this._proxy)) {
            proxy = this._proxy.length ? this._proxy[Math.floor(Math.random() * this._proxy.length)] : '';
        } else {
            proxy = this._proxy;
        }

        return new Promise(async (resolve, reject) => {
            try {
                const query = {
                    uri,
                    method,
                    ...(qs ? { qs } : {}),
                    ...(body ? { body } : {}),
                    ...(form ? { form } : {}),
                    headers: {
                        'User-Agent': this._userAgent,
                        Host: 'www.instagram.com',
                        ...headers,
                    },
                    ...(json ? { json: true } : {}),
                    ...(gzip ? { gzip: true } : {}),
                    ...(jar ? { jar: this._cookieJar } : {}),
                    resolveWithFullResponse: true,
                    ...(proxy ? { proxy: `http://${proxy}/` } : {}),
                    timeout: 10000,
                };
                const response = await rp(query);

                if (this._timeout) {
                    setTimeout(() => {
                        resolve(response);
                    }, this._timeout);
                } else {
                    resolve(response);
                }
            } catch (error) {
                if (error.name === 'StatusCodeError') {
                    if (error.statusCode === 404) {
                        return reject({ message: 'Not found' });
                    }
                    reject(error.response.body);
                } else {
                    reject({ message: error.message ? error.message : 'Request error' });
                }
            }
        });
    }

    _addBar(len) {
        this._progressBar.push(
            this._mbars.newBar('Downloading :type :shortcode [:bar] :percent', {
                complete: '=',
                incomplete: ' ',
                width: 30,
                total: len,
            }),
        );

        return this._progressBar[this._progressBar.length - 1];
    }

    toBuffer(item) {
        return new Promise((resolve, reject) => {
            let r = request;
            let barIndex;
            let downloaded = 0;
            let buffer = Buffer.from('');
            if (this._proxy) {
                r = request.defaults({ proxy: `http://${this._proxy}/` });
            }
            r.get(item.url)
                .on('response', (response) => {
                    if (this._progress) {
                        barIndex = this._addBar(parseInt(response.headers['content-length']));
                    }
                })
                .on('data', (chunk) => {
                    buffer = Buffer.concat([buffer, chunk]);
                    if (this._progress) {
                        barIndex.tick(chunk.length, { type: item.isVideo ? 'VIDEO' : 'PHOTO', shortcode: item.shortcode });
                    }
                })
                .on('end', () => {
                    resolve(buffer);
                })
                .on('error', () => {
                    reject(`Cant download media. If you were using proxy, please try without it.`);
                });
        });
    }

    zipIt() {
        return new Promise(async (resolve, reject) => {
            if (CONST.downloadable.indexOf(this._scrapeType) === -1) {
                this._download = false;
                return resolve();
            }
            let zip = this._filepath ? `${this._filepath}/${this._filename}_${this._date}.zip` : `${this._filename}_${this._date}.zip`;
            let output = fs.createWriteStream(zip);
            let archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 },
            });
            archive.pipe(output);

            async.forEachLimit(
                this._collector,
                this._asyncDownload,
                (item, cb) => {
                    this.toBuffer(item)
                        .then((buffer) => {
                            if (item.isVideo) {
                                archive.append(buffer, { name: `${item.shortcode}.mp4` });
                            } else {
                                archive.append(buffer, { name: `${item.shortcode}.jpeg` });
                            }
                            cb(null);
                        })
                        .catch((error) => {
                            cb(error);
                        });
                },
                (error) => {
                    if (error) {
                        return reject(error);
                    }

                    archive.finalize();
                    archive.on('end', () => resolve());
                },
            );
        });
    }

    getPosts() {
        return new Promise(async (resolve, reject) => {
            if (!this._itemId) {
                try {
                    if (
                        this._scrapeType === 'likers' ||
                        this._scrapeType === 'location' ||
                        this._scrapeType === 'followers' ||
                        this._scrapeType === 'following'
                    ) {
                        // For the types following and followers we need to find the User ID that is located on the entry page
                        // Current values are protected with the AUTH so we also need an active Session ID to make requests to GraphQL API
                        if (CONST.authScrapeType.indexOf(this._scrapeType) > -1) {
                            this._cookieJar.setCookie(this._sessionId, 'https://www.instagram.com/');
                            let result = await this.scrapePage();
                            this._id = result.entry_data.ProfilePage[0].graphql.user.id;
                        }

                        let edges = await this.graphqlQuery();

                        await this.collectPosts(edges);
                    } else {
                        await this.scrapePage();
                    }
                } catch (error) {
                    if (this._cli) {
                        this._spinner.stop();
                    }
                    if (this._event) {
                        return this.emit('error', error);
                    } else {
                        return reject(error);
                    }
                }
            }

            while (true) {
                if (this._collector.length >= this._toCollect) {
                    break;
                }

                try {
                    let edges = await this.graphqlQuery();

                    await this.collectPosts(edges);
                } catch (error) {
                    if (error.message) {
                        if (this._cli) {
                            this._spinner.text = `Error Received: ${error.message}`;
                        }
                    }
                    if (this._event) {
                        this.emit('error', error);
                    }
                    break;
                }

                if (!this._hasNextPage) {
                    break;
                }
            }
            if (this._event) {
                this.emit('done');
            }

            if (!this._event) {
                try {
                    if (this._download) {
                        if (this._cli) {
                            this._spinner.stop();
                        }
                        await this.zipIt();
                    }

                    let json = this._filepath ? `${this._filepath}/${this._filename}_${this._date}.json` : `${this._filename}_${this._date}.json`;
                    let csv = this._filepath ? `${this._filepath}/${this._filename}_${this._date}.csv` : `${this._filename}_${this._date}.csv`;
                    let zip = this._filepath ? `${this._filepath}/${this._filename}_${this._date}.zip` : `${this._filename}_${this._date}.zip`;

                    if (this._filetype === 'csv' || this._filetype === 'all') {
                        switch (this._scrapeType) {
                            case 'user':
                            case 'hashtag':
                            case 'location':
                                this._json2csvParser = new Json2csvParser({ fields: CONST.csvFields });
                                break;
                            case 'comments':
                                this._json2csvParser = new Json2csvParser({ fields: CONST.csvCommentFields });
                                break;
                            case 'likers':
                            case 'followers':
                            case 'following':
                                this._json2csvParser = new Json2csvParser({ fields: CONST.csvLikersFields });
                                break;
                        }
                    }

                    switch (this._filetype) {
                        case 'json':
                            await Bluebird.fromCallback((cb) => fs.writeFile(json, JSON.stringify(this._collector), cb));
                            break;
                        case 'csv':
                            await Bluebird.fromCallback((cb) => fs.writeFile(csv, this._json2csvParser.parse(this._collector), cb));
                            break;
                        case 'all':
                            await Promise.all([
                                await Bluebird.fromCallback((cb) => fs.writeFile(json, JSON.stringify(this._collector), cb)),
                                await Bluebird.fromCallback((cb) => fs.writeFile(csv, this._json2csvParser.parse(this._collector), cb)),
                            ]);
                            break;
                        default:
                            break;
                    }
                    if (this._cli) {
                        this._spinner.stop();
                    }
                    return resolve({
                        collector: this._collector,
                        ...(this._download ? { zip } : {}),
                        ...(this._filetype === 'all' ? { json, csv } : {}),
                        ...(this._filetype === 'json' ? { json } : {}),
                        ...(this._filetype === 'csv' ? { csv } : {}),
                    });
                } catch (error) {
                    if (this._cli) {
                        this._spinner.stop();
                    }
                    if (this._event) {
                        return this.emit('error', error);
                    } else {
                        return reject(error);
                    }
                }
            }
        });
    }

    scrapePage() {
        return new Promise(async (resolve, reject) => {
            let response, toJson;
            let options = {
                method: 'GET',
                gzip: true,
                jar: true,
                uri: this._url,
                headers: {
                    Accept: 'application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.5',
                    Connection: 'keep-alive',
                    'Upgrade-Insecure-Requests': 1,
                },
            };

            try {
                response = await this._request(options);
            } catch (error) {
                return reject({
                    status: false,
                    message: `Response Status: ${error.message}\nCan't scrape input page: ${this._url}\nTry again with a different input [id] and/or with a proxy!`,
                });
            }

            if (response.body.indexOf('window._sharedData = ') > -1) {
                toJson = response.body.split('window._sharedData = ')[1].split('};');
                toJson = JSON.parse(`${toJson[0]}}`);
            } else {
                toJson = response.body.split('window._sharedData=')[1].split('};');
                toJson = JSON.parse(`${toJson[0]}}`);
            }

            this._csrftoken = toJson.config.csrf_token;

            try {
                if (CONST.authScrapeType.indexOf(this._scrapeType) > -1) {
                    return resolve(toJson);
                }
                await this.scrapeInput(toJson);
            } catch (error) {
                return reject(error);
            }

            return resolve();
        });
    }

    graphqlQuery(ineedhelp) {
        return new Promise(async (resolve, reject) => {
            let response, query, edges;

            if (this._scrapeType === 'user') {
                query = JSON.stringify({ id: this._itemId, first: 12, after: this._endCursor });
            }

            if (this._scrapeType === 'hashtag') {
                query = JSON.stringify({ tag_name: this._id, show_ranked: false, first: 9, after: this._endCursor });
            }

            if (this._scrapeType === 'location') {
                query = JSON.stringify({ id: this._id, first: 12, after: this._endCursor });
            }

            if (this._scrapeType === 'comments') {
                query = JSON.stringify({ shortcode: this._id, first: 12, after: this._endCursor });
            }

            if (this._scrapeType === 'likers') {
                query = JSON.stringify({
                    shortcode: this._id,
                    include_reel: true,
                    first: this._collector.length === 0 ? 24 : 12,
                    after: this._endCursor,
                });
            }

            if (this._scrapeType === 'followers' || this._scrapeType === 'following') {
                query = JSON.stringify({
                    id: this._id,
                    include_reel: true,
                    fetch_mutual: false,
                    first: this._collector.length === 0 ? 24 : 12,
                    after: this._endCursor,
                });
            }

            if (ineedhelp) {
                if (ineedhelp.type === 'post') {
                    query = JSON.stringify({
                        shortcode: ineedhelp.shortcode,
                        child_comment_count: 3,
                        fetch_comment_count: 40,
                        parent_comment_count: 24,
                        has_threaded_comments: true,
                    });
                }
            }

            let requestQuery = {
                method: 'GET',
                uri: 'https://www.instagram.com/graphql/query/',
                json: true,
                jar: true,
                qs: {
                    query_hash: CONST.hash[ineedhelp ? ineedhelp.type : this._scrapeType],
                    variables: query,
                },
                headers: {
                    Accept: '*/*',
                    Referer: this._url,
                    'X-IG-App-ID': '936619743392459',
                    'x-csrftoken': this._csrftoken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout: 5000,
            };
            try {
                response = await this._request(requestQuery);
            } catch (error) {
                return reject(error);
            }

            if (!ineedhelp) {
                if (this._scrapeType === 'hashtag') {
                    try {
                        response = response.body.data.hashtag.edge_hashtag_to_media;
                    } catch (error) {
                        return reject({ message: "Can't parse JSON response" });
                    }
                }

                if (this._scrapeType === 'user') {
                    try {
                        response = response.body.data.user.edge_owner_to_timeline_media;
                    } catch (error) {
                        return reject({ message: "Can't parse JSON response" });
                    }
                }

                if (this._scrapeType === 'location') {
                    try {
                        response = response.body.data.location.edge_location_to_media;
                    } catch (error) {
                        return reject({ message: "Can't parse JSON response" });
                    }
                }

                if (this._scrapeType === 'comments') {
                    try {
                        response = response.body.data.shortcode_media.edge_media_to_parent_comment;
                    } catch (error) {
                        return reject({ message: "Can't parse JSON response" });
                    }
                }

                if (this._scrapeType === 'likers') {
                    try {
                        response = response.body.data.shortcode_media.edge_liked_by;
                    } catch (error) {
                        return reject({ message: "Can't parse JSON response" });
                    }
                }

                if (this._scrapeType === 'followers') {
                    try {
                        response = response.body.data.user.edge_followed_by;
                    } catch (error) {
                        return reject({ message: "Can't parse JSON response" });
                    }
                }
                if (this._scrapeType === 'following') {
                    try {
                        response = response.body.data.user.edge_follow;
                    } catch (error) {
                        return reject({ message: "Can't parse JSON response" });
                    }
                }
                this._hasNextPage = response.page_info.has_next_page;
                this._endCursor = response.page_info.end_cursor;
                edges = response.edges;
            } else {
                if (ineedhelp.type === 'post') {
                    edges = response.body.data.shortcode_media;
                } else {
                    return reject({ message: 'Unsupported help type' });
                }
            }

            return resolve(edges);
        });
    }

    scrapeInput(toJson) {
        return new Promise(async (resolve, reject) => {
            let edges, fromInput, edgeFrom, graphqlInput;
            switch (this._scrapeType) {
                case 'user':
                    fromInput = 'ProfilePage';
                    edgeFrom = 'edge_owner_to_timeline_media';
                    graphqlInput = 'user';
                    break;
                case 'hashtag':
                    fromInput = 'TagPage';
                    edgeFrom = 'edge_hashtag_to_media';
                    graphqlInput = 'hashtag';
                    break;
                case 'location':
                    fromInput = 'LocationsPage';
                    edgeFrom = 'edge_location_to_media';
                    graphqlInput = 'location';
                    break;
                case 'comments':
                    fromInput = 'PostPage';
                    edgeFrom = 'edge_media_to_parent_comment';
                    graphqlInput = 'shortcode_media';
                    break;
            }

            try {
                edges = toJson.entry_data[fromInput][0].graphql[graphqlInput][edgeFrom].edges;
                this._itemId = toJson.entry_data[fromInput][0].graphql[graphqlInput].id;
                this._hasNextPage = toJson.entry_data[fromInput][0].graphql[graphqlInput][edgeFrom].page_info.has_next_page;
                this.count = toJson.entry_data[fromInput][0].graphql[graphqlInput][edgeFrom].count;
                this._endCursor = toJson.entry_data[fromInput][0].graphql[graphqlInput][edgeFrom].page_info.end_cursor;
            } catch (error) {
                return reject({ message: `Can't scrape date. Please try again or submit issue to the github` });
            }

            if (edges.length > this._toCollect) {
                edges.splice(this._toCollect);
            }

            try {
                await this.collectPosts(edges);
            } catch (error) {
                return reject(error);
            }

            if (this._toCollect > this.count) {
                this._toCollect = this.count;
            }

            return resolve();
        });
    }

    async _getUsername(id) {
        let options = {
            method: 'GET',
            uri: `https://i.instagram.com/api/v1/users/${id}/info/`,
            headers: {
                'User-Agent':
                    'Instagram 1.1.1 Android (24/7.0; 420dpi; 1080x1920; samsung; SM-J730FM; j7y17lte; samsungexynos7870; en_US; 139906542)',
                Host: 'i.instagram.com',
            },
            gzip: true,
            json: true,
        };

        try {
            const response = await this._request(options);
            if (response.body.user) {
                return response.body.user.username;
            }
        } catch (error) {
            throw new Error('');
        }
    }

    async getUserMeta() {
        const options = {
            method: 'GET',
            uri: `https://www.instagram.com/${this._id}/?__a=1`,
            gzip: true,
            json: true,
        };

        try {
            const response = await this._request(options);
            return response.body;
        } catch (error) {
            throw new Error('');
        }
    }

    collectPosts(edges) {
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < edges.length; i++) {
                if (this._collector.length >= this._toCollect) {
                    break;
                }
                let graphQlPostData = '';
                let item = edges[i].node;
                switch (this._scrapeType) {
                    case 'user':
                    case 'hashtag':
                    case 'location':
                        item = {
                            id: item.id.toString(),
                            isVideo: item.is_video,
                            shortcode: item.shortcode,
                            takenAtTimestamp: item.taken_at_timestamp,
                            takenAtGMT: new Date(parseInt(item.taken_at_timestamp.toString() + '000')).toUTCString(),
                            commentsDisabled: item.comments_disabled,
                            location: item.location,
                            thumbnailSrc: item.thumbnail_src,
                            displayUrl: item.display_url,
                            ownerId: item.owner.id,
                            ownerUsername: item.owner.username,
                            likes: item.edge_media_preview_like.count,
                            comments: item.edge_media_to_comment.count,
                            ...(item.is_video ? { views: item.video_view_count } : { views: 0 }),
                            ...(item.video_url ? { videoUrl: item.video_url } : {}),
                        };
                        if (item.isVideo) {
                            if (this._type === 'video' || this._type === 'all') {
                                if (!item.videoUrl) {
                                    if (graphQlPostData) {
                                        item.url = response.video_url;
                                    } else {
                                        try {
                                            let response = await this.graphqlQuery({
                                                type: 'post',
                                                shortcode: item.shortcode,
                                            });
                                            item.url = response.video_url;
                                        } catch (error) {}
                                    }
                                } else {
                                    item.url = item.videoUrl;
                                }
                                if (this._event) {
                                    this.emit('data', item);
                                    this._collector.push('');
                                } else {
                                    this._collector.push(item);
                                }
                            }
                        } else {
                            if (this._type === 'image' || this._type === 'all') {
                                item.url = item.displayUrl;
                                if (this._event) {
                                    this.emit('data', item);
                                    this._collector.push('');
                                } else {
                                    this._collector.push(item);
                                }
                            }
                        }
                        break;
                    case 'comments':
                        item = {
                            ...item,
                            owner_id: item.owner.id,
                            owner_username: item.owner.username,
                            owner_is_verified: item.owner.is_verified,
                            likes: item.edge_threaded_comments.count,
                        };
                        if (this._event) {
                            this.emit('data', item);
                            this._collector.push('');
                        } else {
                            this._collector.push(item);
                        }
                        break;
                    case 'likers':
                    case 'followers':
                    case 'following':
                        item = {
                            user_id: item.id,
                            username: item.username,
                            full_name: item.full_name,
                            profile_pic_url: item.profile_pic_url,
                            is_private: item.is_private,
                            is_verified: item.is_verified,
                            followed_by_viewer: item.followed_by_viewer,
                            requested_by_viewer: item.requested_by_viewer,
                        };
                        if (this._event) {
                            this.emit('data', item);
                            this._collector.push('');
                        } else {
                            this._collector.push(item);
                        }
                        break;
                }
            }
            return resolve();
        });
    }
}

module.exports = instaTouch;
