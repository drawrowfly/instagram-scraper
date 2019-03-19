`use strict`

const rp = require('request-promise');
const crypto = require('crypto');
const archiver = require('archiver');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;

//Constants
const CONST = require('./constant');

const json2csvParser = new Json2csvParser({ fields: CONST.csv_fields });

class instaTouch{
    constructor({ url, download, filepath, filename, filetype, id, count, proxy, query_hash, mediaType, scrapeType }){
        this._url = url;
        this._download = download;
        this._filepath = filepath;
        this._filename = filename;
        this._filetype = filetype;
        this._id = id;
        this._toCollect = count;
        this._proxy = proxy;
        this._query_hash = query_hash;
        this._type = mediaType;
        this._scrapeType = scrapeType; 
        this._proceed = true;
        this._collector = [];
        this._date = Date.now();
        //Important!!! If you change user agents, hash keys will be invalid
        this._userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36';

        this._itemId;
        this._has_next_page;
        this._rhx_gis;
        this._cookie;
        this._end_cursor;
    }

    toBuffer(item){
        return new Promise( async(resolve, reject) => {
            let buffer;
            try{
                let result = await rp({
                    uri: item.url,
                    encoding: null,
                    ...(this._proxy ? { proxy: `http://${this._proxy}/` } : {})
                });

                buffer = Buffer.from(result,'utf8');
            } catch(error){
                return reject(`Wasn't able to download post. You can try to add proxy`)
            }
            return resolve(buffer);
        })
    }

    zipIt(){
        return new Promise( async (resolve, reject) => {
            let output = fs.createWriteStream(`${this._filepath}/${this._filename}_${this._date}.zip`);
            let archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 }
            });
            archive.pipe(output);

            for(let i = 0; i< this._collector.length; i++ ){
                let buffer;
                try{
                    buffer = await this.toBuffer(this._collector[i]);
                } catch(error){
                    return reject(error)
                    break;
                }

                if(this._collector[i].is_video){
                    archive.append(buffer, { name: `${this._collector[i].shortcode}.mp4` });
                }else{
                    archive.append(buffer, { name: `${this._collector[i].shortcode}.jpeg` });
                }
            }

            archive.finalize();

            archive.on('end', () => {
                return resolve()
            })
        })
    }

    getPosts(){
        return new Promise( async(resolve, reject) => {
            if (!this._itemId){
                try{
                    await this.scrapePage()
                } catch(error){
                    return reject(error)
                }
            }

            while(this._proceed){
                let edges;
                if (this._collector.length === this._toCollect)
                    break;

                try{
                    edges = await this.graphqlQuery()
                } catch(error){
                    return reject(error)
                    break;
                }

                let difference = this._toCollect - this._collector.length;

                if (edges.length>difference && this._type === 'all')
                    edges.splice(difference);

                await this.collectPosts(edges);

                if (this._collector.length>this._toCollect){
                    this._collector.splice(-(this._collector.length-this._toCollect))
                    break;
                }

                if (!this._has_next_page)
                    break;
            }

            if (this._download){
                try{
                    await this.zipIt()
                }catch(error){
                    return reject(error);
                }
            }

            switch(this._filetype){
                case 'json':
                    fs.writeFileSync(`${this._filepath}/${this._filename}_${this._date}.json`, JSON.stringify(this._collector));
                    break;
                case 'csv':
                    fs.writeFileSync(`${this._filepath}/${this._filename}_${this._date}.csv`, json2csvParser.parse(this._collector));
                    break;
                default:
                    fs.writeFileSync(`${this._filepath}/${this._filename}_${this._date}.json`, JSON.stringify(this._collector));
                    fs.writeFileSync(`${this._filepath}/${this._filename}_${this._date}.csv`, json2csvParser.parse(this._collector));
                    break;
            }

            return resolve(this);
        })
    };

    scrapePage(){
        return new Promise( async (resolve, reject) => {
            let response, toJson;

            let options = {
                method: 'GET',
                gzip: true,
                uri: this._url,
                headers: {
                    'Accept': 'application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'keep-alive',
                    'Host':'www.instagram.com',
                    'Upgrade-Insecure-Requests':1,
                    'User-Agent': this._userAgent,
                },
                ...(this._proxy ? { proxy: `http://${this._proxy}/`} : {}),
                resolveWithFullResponse:true,
            };

            try{
                response = await rp(options)
            }catch(error){
                return reject({ status: false, message: `Response Status: ${error.statusCode}\nWasn't able to scrape input page: ${this._url}\nTry again with a different input [id] and/or with a proxy!` });
            }

            if (response.body.indexOf('window._sharedData = ')>-1){
                toJson = response.body.split('window._sharedData = ')[1].split(`};`);
                toJson = JSON.parse(`${toJson[0]}}`);
            }else{
                toJson = response.body.split('window._sharedData=')[1].split(`};`);
                toJson = JSON.parse(`${toJson[0]}}`);
            }

            try{
                this._cookie = response.headers['set-cookie'].map(item => {
                    return item.split('; D')[0]
                }).join('; ');
            } catch(error){
                return reject({ status: false, message: `Can't set cookies` });
            }

            if (this._scrapeType === 'hashtag'){
                try{
                    await this.scrapeHashtagInput(toJson)
                }catch(error){
                    return reject(error);
                }
            }

            if (this._scrapeType === 'user'){
                try{
                    await this.scrapeUserInput(toJson)
                }catch(error){
                    return reject(error);
                }
            }

            if (this._scrapeType === 'location'){
                try{
                    await this.scrapeLocationInput(toJson)
                }catch(error){
                    return reject(error);
                }
            }

            return resolve()
        })
    }

    graphqlQuery(ineedhelp){
        return new Promise( async (resolve, reject) => {
            let response, query, edges;

            if (this._scrapeType === 'user'){
                query = `{"id":"${this._itemId}","first":12,"after":"${this._end_cursor}"}`;
            }

            if (this._scrapeType === 'hashtag'){
                query = `{"tag_name":"${this._id}","show_ranked":false,"first":9,"after":"${this._end_cursor}"}`;
            }

            if (this._scrapeType === 'location'){
                query = `{"id":"${this._id}","first":12,"after":"${this._end_cursor}"}`
            }

            if (ineedhelp){
                if (ineedhelp.type === 'post'){
                    query = `{"shortcode":"${ineedhelp.shortcode}","child_comment_count":3,"fetch_comment_count":40,"parent_comment_count":24,"has_threaded_comments":false}`
                }
            }

            let requestQuery = {
                method: 'GET',
                uri: 'https://www.instagram.com/graphql/query/',
                json: true,
                qs: {
                    'query_hash': CONST.hash[ineedhelp ? ineedhelp.type : this._scrapeType],
                    'variables': query,
                },
                headers: {
                    'Accept': '*/*',
                    'Referer': this._url,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
                    'X-IG-App-ID': '936619743392459',
                    'X-Instagram-Gis': crypto.createHash('md5').update(`${this._rhx_gis}:${query}`).digest("hex"),
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cookie': this._cookie,
                    'Host': 'www.instagram.com',
                },
                ...(this._proxy ? { proxy: `http://${this._proxy}/`} : {}),
                resolveWithFullResponse:true,
            };

            try{
                response = await rp(requestQuery)
            }catch(error){
                return reject(error);
            }
            if(!ineedhelp){
                if (this._scrapeType === 'hashtag'){
                    response = response.body.data.hashtag.edge_hashtag_to_media;
                }

                if (this._scrapeType === 'user'){
                    response = response.body.data.user.edge_owner_to_timeline_media;
                }

                if (this._scrapeType === 'location'){
                    response = response.body.data.location.edge_location_to_media;
                }

                this._has_next_page = response.page_info.has_next_page;
                this._end_cursor = response.page_info.end_cursor;
                edges = response.edges;
            }else{
                if (ineedhelp.type === 'post'){
                    edges = response.body.data.shortcode_media;
                }else{
                    return reject({ message: `Unsupported help type` });
                }
            }

            return resolve(edges);
        })
    }


    scrapeLocationInput(toJson){
        return new Promise( async (resolve, reject) => {
            let edges;
            try{
                edges = toJson.entry_data.LocationsPage[0].graphql.location.edge_location_to_media.edges;
                this._rhx_gis = toJson.rhx_gis;
                this._itemId = toJson.entry_data.LocationsPage[0].graphql.location.id;
                this._has_next_page = toJson.entry_data.LocationsPage[0].graphql.location.edge_location_to_media.page_info.has_next_page;
                this.count = toJson.entry_data.LocationsPage[0].graphql.location.edge_location_to_media.count;
                this._end_cursor = toJson.entry_data.LocationsPage[0].graphql.location.edge_location_to_media.page_info.end_cursor;
            } catch(error){
                return reject({ message: 'Cant parse json' });
            }

            if (edges.length>this._toCollect)
                edges.splice(this._toCollect);

            if (this._toCollect>this.count)
                return reject({ message: `Location page has only ${this.count} posts` });

            try{
                await this.collectPosts(edges)
            } catch(error){
                return reject(error);
            }

            if (this._toCollect>this.count)
                this._toCollect = this.count;

            return resolve();
        })
    }

    scrapeHashtagInput(toJson){
        return new Promise( async (resolve, reject) => {
            let edges;
            try{
                edges = toJson.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges;
                this._rhx_gis = toJson.rhx_gis;
                this._itemId = toJson.entry_data.TagPage[0].graphql.hashtag.id;
                this._has_next_page = toJson.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page;
                this.count = toJson.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.count;
                this._end_cursor = toJson.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor;
            } catch(error){
                return reject({ message: 'Cant parse json' });
            }

            if (edges.length>this._toCollect)
                edges.splice(this._toCollect);

            if (this._toCollect>this.count)
                return reject({ message: `Hashtag page has only ${this.count} posts` });

            try{
                await this.collectPosts(edges)
            } catch(error){
                return reject(error);
            }

            if (this._toCollect>this.count)
                this._toCollect = this.count;

            return resolve();
        })
    }

    scrapeUserInput(toJson){
        return new Promise( async (resolve, reject) => {
            let edges;
            try{
                edges = toJson.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
                this._rhx_gis = toJson.rhx_gis;
                this._itemId = toJson.entry_data.ProfilePage[0].graphql.user.id;
                this._has_next_page = toJson.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.page_info.has_next_page;
                this.count = toJson.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count;
                this._end_cursor = toJson.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.page_info.end_cursor;
            } catch(error){
                return reject({ message: 'Cant parse json' });
            }

            if (edges.length>this._toCollect)
                edges.splice(this._toCollect);

            if (this._toCollect>this.count)
                return reject({ message: `Profile has only ${this.count} posts` });

            try{
                await this.collectPosts(edges)
            } catch(error){
                return reject(error);
            }

            if (this._toCollect>this.count)
                this._toCollect = this.count;

            return resolve();
        })
    }

    collectPosts(edges){
        return new Promise( async (resolve, reject) => {
            for(let i = 0; i < edges.length; i++){
                let item = edges[i].node;

                item = {
                    id: item.id.toString(),
                    is_video: item.is_video,
                    shortcode: item.shortcode,
                    taken_at_timestamp: item.taken_at_timestamp,
                    comments_disabled: item.comments_disabled,
                    location: item.location,
                    thumbnail_src: item.thumbnail_src,
                    display_url: item.display_url,
                    owner_id: item.owner.id,
                    owner_username: item.owner.username,
                    likes: item.edge_media_preview_like.count,
                    comments: item.edge_media_to_comment.count,
                    ...( item.is_video ? { views: item.video_view_count } : { views: 0 } ),
                    ...( item.video_url ? { video_url: item.video_url } : {} ),
                };

                if (this._type === 'video'){
                    if (item.is_video){
                        if (!item.video_url){
                            let response;
                            try{
                                response = await this.graphqlQuery({
                                    type: 'post',
                                    shortcode: item.shortcode,
                                })
                            } catch(error){
                                return reject({ message: `Can't scrape single post. Query request was unsuccessful`})
                            }
                            item.url = response.video_url
                        }else{
                            item.url = item.video_url;
                        }
                        this._collector.push(item);
                    }
                }else if (this._type === 'image'){
                    if (!item.is_video){
                        item.url = item.display_url;
                        this._collector.push(item);
                    }
                }else{
                    if (item.is_video){
                        if (!item.video_url){
                            let response;
                            try{
                                response = await this.graphqlQuery({
                                    type: 'post',
                                    shortcode: item.shortcode,
                                })
                            } catch(error){
                                return reject({message: `Can't scrape single post. Query request was unsuccessful`})
                            }
                            item.url = response.video_url
                        }else{
                            item.url = item.video_url;
                        }
                        this._collector.push(item);
                    }else{
                        item.url = item.display_url;
                    }
                    this._collector.push(item);
                }
            }
            return resolve();
        })
    }
}

module.exports = instaTouch;