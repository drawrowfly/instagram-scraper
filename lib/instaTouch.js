"use strict";

const rp = require("request-promise");
const request = require('request');
const { jar } = require('request');
const crypto = require("crypto");
const archiver = require("archiver");
const fs = require("fs");
const async = require("async");
const Json2csvParser = require("json2csv").Parser;
const ProgressBar = require('progress');
const ora = require('ora');
const spinner = ora('Loading unicorns');

const MultipleBar = require('./multipleBar');


//Constants
const CONST = require("./constant");

const json2csvParser = new Json2csvParser({ fields: CONST.csvFields });


class instaTouch{
    constructor({ url, download, filepath, filename, filetype, id, count, proxy, queryHash, mediaType, scrapeType, asyncDownload, progress }){
        this._url = url;
        this._download = download;
        this._filepath = filepath;
        this._filename = filename;
        this._filetype = filetype;
        this._mbars = new MultipleBar();
        this._id = id; 
        this._toCollect = !count ? (scrapeType === "location" || scrapeType === "hashtag" ) ? 0 : undefined : count;
        this._proxy = proxy;
        this._queryHash = queryHash;
        this._type = mediaType;
        this._scrapeType = scrapeType; 
        this._asyncDownload = asyncDownload;
        this._proceed = true;
        this._collector = [];
        this._date = Date.now();
        this._cookieJar = jar();
        this._progressBar = [];
        this._progress = progress;
        //Important!!! If you change user agents, hash keys will be invalid
        this._userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36";

        this._itemId;
        this._hasNextPage;
        this._rhxGis;
        this._endCursor;
    }

    _setSpinnerText(text){
        spinner.text = text;
    }

    _request({ uri, method, qs, body, form, headers, json, gzip }){
        return new Promise( async (resolve, reject) => {
            try{
                let response = await rp({
                    uri,
                    method,
                    ...(qs ? { qs } : {}),
                    ...(body ? { body } : {}),
                    ...(form ? { form } : {}),
                    'headers':{
                        'User-Agent': this._userAgent,
                        "Host":"www.instagram.com",
                        ...headers,
                    },
                    ...(json ?{ json: true } : {}),
                    ...(gzip ? { gzip:true} : {}),
                    'jar': this._cookieJar,
                    'resolveWithFullResponse': true,
                    ...(this._proxy ? {proxy:`https://${this._proxy}/`} : {}),
                });

                resolve(response);
            } catch(error){
                reject(error);
            }
        })
    }
    _addBar(len) {
        this._progressBar.push(this._mbars.newBar('Downloading :type :shortcode [:bar] :percent', {
            complete: '=', 
            incomplete: ' ', 
            width: 30, 
            total: len
        }));

        return this._progressBar[this._progressBar.length - 1];
    }

    toBuffer(item){
        return new Promise((resolve, reject) => {
            let r = request;
            let barIndex;
            let downloaded = 0;
            let buffer = Buffer.from('');
            if (this._proxy){
                r = request.defaults({'proxy':`http://${this._proxy}/`})
            }
            r.get(item.url)
            .on('response', (response) => {
                if (this._progress){
                    barIndex = this._addBar(parseInt(response.headers['content-length']))
                }
            })
            .on('data', (chunk) => {
                buffer = Buffer.concat([buffer, chunk]);
                if (this._progress){
                    barIndex.tick(chunk.length, { type: item.isVideo ? 'VIDEO' : 'PHOTO', shortcode: item.shortcode})
                }
            })
            .on('end', () => {
                resolve(buffer);
            })
            .on('error', () => {
                reject(`Cant download media. If you were using proxy, please try without it.`)
            })
        })
    }

    zipIt(){
        return new Promise( async (resolve, reject) => {
            let zip = `${this._filepath}/${this._filename}_${this._date}.zip`;
            let output = fs.createWriteStream(zip);
            let archive = archiver("zip", {
                gzip: true,
                zlib: { level: 9 }
            });
            archive.pipe(output);

            async.forEachLimit(this._collector, this._asyncDownload, (item, cb) => {
                this.toBuffer(item)
                .then((buffer) => {
                    if(item.isVideo){
                        archive.append(buffer, { name: `${item.shortcode}.mp4` });
                    }else{
                        archive.append(buffer, { name: `${item.shortcode}.jpeg` });
                    }
                    cb(null);
                })
                .catch((error) => {
                    cb(error);
                })
            }, (error) => {
                if (error){
                    return reject(error);
                }

                archive.finalize();

                archive.on("end", () => {
                    return resolve();
                })
            })
        })
    }

    getPosts(){
        return new Promise( async(resolve, reject) => {
            if (!this._itemId){
                if (this._progress){
                    spinner.start();
                    this._setSpinnerText('Start scrapper')
                }
                try{
                    await this.scrapePage();
                } catch(error){
                    return reject(error);
                }
            }

            while(this._proceed){
                let edges;
                if (this._collector.length === this._toCollect){
                    break;
                }

                try{
                    edges = await this.graphqlQuery();
                } catch(error){
                    return reject(error);
                }

                let difference = this._toCollect - this._collector.length;

                if (edges.length>difference && this._type === "all"){
                    edges.splice(difference);
                }

                await this.collectPosts(edges);

                if (this._collector.length>this._toCollect){
                    this._collector.splice(-(this._collector.length-this._toCollect));
                    break;
                }

                if (!this._hasNextPage){
                    break;
                }
            }
            spinner.stop();
            if (this._download){
                try{
                    await this.zipIt();
                }catch(error){
                    return reject(error);
                }
            }

            let json = `${this._filepath}/${this._filename}_${this._date}.json`;
            let csv = `${this._filepath}/${this._filename}_${this._date}.csv`;

            switch(this._filetype){
                case "json":
                    fs.writeFileSync(json, JSON.stringify(this._collector));
                    break;
                case "csv":
                    fs.writeFileSync(csv, json2csvParser.parse(this._collector));
                    break;
                default:
                    fs.writeFileSync(json, JSON.stringify(this._collector));
                    fs.writeFileSync(csv, json2csvParser.parse(this._collector));
                    break;
            }

            return resolve(this);
        })
    }

    scrapePage(){
        return new Promise( async (resolve, reject) => {
            let response, toJson;
            let options = {
                method: "GET",
                gzip: true,
                uri: this._url,
                headers: {
                    "Accept": "application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests":1,
                },
            };

            try{
                response = await this._request(options);
            }catch(error){
                return reject({ status: false, message: `Response Status: ${error.statusCode}\nWasn"t able to scrape input page: ${this._url}\nTry again with a different input [id] and/or with a proxy!` });
            }

            if (response.body.indexOf("window._sharedData = ")>-1){
                toJson = response.body.split("window._sharedData = ")[1].split("};");
                toJson = JSON.parse(`${toJson[0]}}`);
            }else{
                toJson = response.body.split("window._sharedData=")[1].split("};");
                toJson = JSON.parse(`${toJson[0]}}`);
            }


            try{
                await this.scrapeInput(toJson);
            }catch(error){
                return reject(error);
            }

            return resolve();
        })
    }

    graphqlQuery(ineedhelp){
        return new Promise( async (resolve, reject) => {
            let response, query, edges;

            if (this._scrapeType === "user"){
                query = `{"id":"${this._itemId}","first":12,"after":"${this._endCursor}"}`;
            }

            if (this._scrapeType === "hashtag"){
                query = `{"tag_name":"${this._id}","show_ranked":false,"first":9,"after":"${this._endCursor}"}`;
            }

            if (this._scrapeType === "location"){
                query = `{"id":"${this._id}","first":12,"after":"${this._endCursor}"}`;
            }

            if (ineedhelp){
                if (ineedhelp.type === "post"){
                    query = `{"shortcode":"${ineedhelp.shortcode}","child_comment_count":3,"fetch_comment_count":40,"parent_comment_count":24,"has_threaded_comments":false}`;
                }
            }

            let requestQuery = {
                method: "GET",
                uri: "https://www.instagram.com/graphql/query/",
                json: true,
                qs: {
                    "query_hash": CONST.hash[ineedhelp ? ineedhelp.type : this._scrapeType],
                    "variables": query,
                },
                headers: {
                    "Accept": "*/*",
                    "Referer": this._url,
                    "X-IG-App-ID": "936619743392459",
                    "X-Instagram-Gis": crypto.createHash("md5").update(`${this._rhxGis}:${query}`).digest("hex"),
                    "X-Requested-With": "XMLHttpRequest",
                },
            };

            try{
                response = await this._request(requestQuery);
            }catch(error){
                return reject(error);
            }
            if(!ineedhelp){
                if (this._scrapeType === "hashtag"){
                    try{
                        response = response.body.data.hashtag.edge_hashtag_to_media;
                    }catch(error){
                        return reject({ message: "Can't parse API" });
                    }
                }

                if (this._scrapeType === "user"){
                    try{
                        response = response.body.data.user.edge_owner_to_timeline_media;
                    }catch(error){
                        return reject({ message: "Can't parse API" });
                    }
                }

                if (this._scrapeType === "location"){
                    try{
                        response = response.body.data.location.edge_location_to_media;
                    }catch(error){
                        return reject({ message: "Can't parse API" });
                    }
                }

                this._hasNextPage = response.page_info.has_next_page;
                this._endCursor = response.page_info.end_cursor;
                edges = response.edges;
            }else{
                if (ineedhelp.type === "post"){
                    edges = response.body.data.shortcode_media;
                }else{
                    return reject({ message: "Unsupported help type" });
                }
            }

            return resolve(edges);
        })
    }


    scrapeInput(toJson){
        return new Promise( async (resolve, reject) => {
            let edges, fromInput, edgeFrom;
            switch(this._scrapeType){
                case "user":
                    fromInput = "ProfilePage";
                    edgeFrom = "edge_owner_to_timeline_media";
                    break;
                case "hashtag":
                    fromInput = "TagPage";
                    edgeFrom = "edge_hashtag_to_media";
                    break;
                case "location":
                    fromInput = "LocationsPage";
                    edgeFrom = "edge_location_to_media";
                    break;
            }
            try{
                edges = toJson.entry_data[fromInput][0].graphql[this._scrapeType][edgeFrom].edges;
                this._rhxGis = toJson.rhx_gis;
                this._itemId = toJson.entry_data[fromInput][0].graphql[this._scrapeType].id;
                this._hasNextPage = toJson.entry_data[fromInput][0].graphql[this._scrapeType][edgeFrom].page_info.has_next_page;
                this.count = toJson.entry_data[fromInput][0].graphql[this._scrapeType][edgeFrom].count;
                this._endCursor = toJson.entry_data[fromInput][0].graphql[this._scrapeType][edgeFrom].page_info.end_cursor;
            } catch(error){
                return reject({ message: "Can't parse json" });
            }

            if (edges.length>this._toCollect){
                edges.splice(this._toCollect);
            }

            if (this._toCollect>this.count){
                return reject({ message: `${this._scrapeType} page has only ${this.count} posts` });
            }

            try{
                await this.collectPosts(edges);
            } catch(error){
                return reject(error);
            }

            if (this._toCollect>this.count){
                this._toCollect = this.count;
            }

            return resolve();
        })
    }

    collectPosts(edges){
        return new Promise( async (resolve, reject) => {
            for(let i = 0; i < edges.length; i++){
                let item = edges[i].node;
                item = {
                    id: item.id.toString(),
                    isVideo: item.is_video,
                    shortcode: item.shortcode,
                    takenAtTimestamp: item.taken_at_timestamp,
                    commentsDisabled: item.comments_disabled,
                    location: item.location,
                    thumbnailSrc: item.thumbnail_src,
                    displayUrl: item.display_url,
                    ownerId: item.owner.id,
                    ownerUsername: item.owner.username,
                    likes: item.edge_media_preview_like.count,
                    comments: item.edge_media_to_comment.count,
                    ...( item.is_video ? { views: item.video_view_count } : { views: 0 } ),
                    ...( item.video_url ? { videoUrl: item.video_url } : {} ),
                };
                if (item.isVideo){
                    if (this._type === "video" || this._type === "all"){
                        if (!item.videoUrl){
                            let response;
                            try{
                                response = await this.graphqlQuery({
                                    type: "post",
                                    shortcode: item.shortcode,
                                });
                            } catch(error){
                                return reject({ message: "Can't scrape single post. Query request was unsuccessful"});
                            }
                            item.url = response.video_url;
                        }else{
                            item.url = item.videoUrl;
                        }
                        this._collector.push(item);
                    }
                }else{
                    if (this._type === "image" || this._type === "all"){
                        item.url = item.displayUrl;
                        this._collector.push(item);
                    }
                }
            }
            return resolve();
        })
    }
}

module.exports = instaTouch;