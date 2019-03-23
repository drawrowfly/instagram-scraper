
# InstaTouch
 
![NPM](https://img.shields.io/npm/l/instatouch.svg?style=for-the-badge) ![npm](https://img.shields.io/npm/v/instatouch.svg?style=for-the-badge) ![Codacy grade](https://img.shields.io/codacy/grade/037f8049f7e048a2b03a95fda8863f39.svg?style=for-the-badge)

Scrape instagram media posts from username, hashtag or location pages.
No login or password are required. This is not an official API support and etc. This is just a scraper that is using instagram web api to scrape media

## Features
* Scrape media posts from username, hashtag or location
* Download and save media to a ZIP archive
* Create JSON/CSV files with a post information

**JSON/CSV output:**
*   Media ID
*   Post owner ID
*   Post owner Username
*   Post shortcode
*   Is video or not
*   Taken at timestamp
* Like, Comment, View counters
* Direct url to a media(jpeg, mp4)
* Thumbnail url

## Installation
instatouch requires [Node.js](https://nodejs.org/) v8.6.0+ to run.

**Install from NPM**
```sh
$ npm i -g instatouch
```

**Install from YARN**
```sh
$ yarn global add instatouch
```

## USAGE

**Terminal**

```sh
$ instatouch --help

Commands:
  instatouch user [id]      scrape posts from username
  instatouch hashtag [id]   scrape posts from hashtag
  instatouch location [id]  scrape posts from location

Options:
  --help                  Show help                                    [boolean]
  --version               Show version number                          [boolean]
  --count, -c             Number of post to scrape                  [default: 0]
  --mediaType             Media type to scrape
                             [choices: "image", "video", "all"] [default: "all"]
  --proxy, -p             Set proxy                                [default: ""]
  --download              Download and archive all scraped posts to a ZIP file
                                                      [boolean] [default: false]
  --asyncDownload         How many posts should be downloaded at the same time
                                                                    [default: 5]
  --filename, --file, -f  Name of the output file              [default: "[id]"]
  --filepath              Directory to save file
                                           [default: "/Users/jackass/Downloads"]
  --filetype, --type, -t  Type of output file
                              [choices: "csv", "json", "both"] [default: "json"]
```

**Example 1**

Scrape 50 video posts from hashtag summer. Save post info in to a JSON file (by default) 
```sh
$ instatouch hashtag summer --count 50 --mediaType video  

Output:
JSON path: /Users/boddy/Downloads/summer_1552945544582.json
```

**Example 2**

Scrape 100 posts from user natgeo, download and save them to a ZIP archive. Save post info in to a JSON and CSV files (--filetype both)
```
$ instatouch user natgeo --count 100 --download true --filetype both

Output:
ZIP path: /Users/boddy/Downloads/natgeo_1552945659138.zip
JSON path: /Users/boddy/Downloads/natgeo_1552945659138.json
CSV path: /Users/boddy/Downloads/natgeo_1552945659138.csv
```

**Example 3**

Scrape 50 posts from user natgeo, download and save them to a ZIP archive. Save post info in to a JSON and CSV files (--filetype both). Save all files to a custom path (--filepath /custom/path/to/save/files)
```
$ instatouch user natgeo --count 50 --download true --filetype both --filepath /custom/path/to/save/files

Output:
ZIP path: /custom/path/to/save/files/natgeo_1552945659138.zip
JSON path: /custom/path/to/save/files/natgeo_1552945659138.json
CSV path: /custom/path/to/save/files/natgeo_1552945659138.csv
```

**Module**
```
const instaTouch = require('instatouch');

let options = {
    count: 100,
    download: true,
    mediaType: "all",
    filetype: "both"
};

(async () => {
    let user;
    try{
        user = await instaTouch.user("natgeo", options);
        console.log(user)
    } catch(error){
        console.log(error)
    }
})()
```

**Functions**
```
instaTouch.user(id, options) //Scrape user posts
instaTouch.hashtag(id, options) //Scrape hashtag posts
instaTouch.location(id, options) //Scrape location posts
```

**Options**
```
let options = {
    //Number of posts to scrape: int default: 0
    count: 0,

    //Download posts or not: boolean default: false. If true ZIP archive in [filepath] will be created
    download: false,

    //How many post should be downloaded asynchronously
    asyncDownload: 5,

    //Media type to scrape: ["image", "video", "all"] default: "all"
    mediaType: "all",

    //Set proxy, example: 127.0.0.1:8080 default: ""
    proxy: "",

    //File name that will be used to save data to, default: "[id]"
    filename: "[id]",

    //File path where all files will be saved, default: USER_HOME_DIR/Downloads
    filepath: `USER_HOME_DIR/Downloads`,

    //File types to save post data to: ["json", "csv", "both"] default: "json"
    filetype: "json",
};
```

**Result will contain a bunch of data**
```javascript
instaTouch {
    _url: 'https://www.instagram.com/explore/tags/natgeo/',
    _download: true,
    _filepath: '/Users/jackass/Downloads',
    _filename: 'natgeo',
    _filetype: 'both',
    _id: 'natgeo',
    _scrapeType: 'hashtag',
    _collector:[ARRAY_OF_ALL_POSTS]
    count: 15568853,
    //Files are below
    zip: '/Users/jackass/Downloads/natgeo_1552963581094.zip',
    json: '/Users/jackass/Downloads/natgeo_1552963581094.json',
    csv: '/Users/jackass/Downloads/natgeo_1552963581094.csv' 
    ...
}
```

License
----

**MIT**

**Free Software**