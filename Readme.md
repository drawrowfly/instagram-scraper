# InstaTouch

![NPM](https://img.shields.io/npm/l/instatouch.svg?style=for-the-badge) ![npm](https://img.shields.io/npm/v/instatouch.svg?style=for-the-badge) ![Codacy grade](https://img.shields.io/codacy/grade/037f8049f7e048a2b03a95fda8863f39.svg?style=for-the-badge)

Scrape useful information from instagram.

**No login or password are required.**

This is not an official API support and etc. This is just a scraper that is using instagram graph api to scrape media.

## Demo

![Demo](https://i.imgur.com/DDRmH2y.gif)

## Features

-   Scrape media posts from username, hashtag or location
-   Scrape comments from a specific instagram post
-   Scrape users who liked specific post
-   Scrape followers **`REQUIRES AN ACTIVE SESSION`**
-   Scrape following **`REQUIRES AN ACTIVE SESSION`**
-   Download and save media to a ZIP archive
-   Create JSON/CSV files with a post information

**Note:**

-   If you need to download all user posts or comments then do not specify count or set it to 0(zero)
-   location and hashtag should always have count >0

**Posts - JSON/CSV output:**

```
    id: '454535345435345',
    isVideo: false,
    shortcode: 'B1SkSkdjskA',
    takenAtTimestamp: 23123123,
    commentsDisabled: false,
    location:{
        id: '12312312312',
        has_public_page: true,
        name: 'Eiffel Tower, Paris',
        slug: 'eiffel-tower-paris'
    },
    thumbnailSrc: 'THUMNAIL_URL',
    displayUrl:'PREVIEW_URL',
    url:'MAIN_URL_SRC',
    ownerId: '1321313',
    ownerUsername: 'bobobobobo',
    likes: 232,
    comments: 11,
    views: 0,
```

![Demo](https://i.imgur.com/D9sH95B.png)
**Comments - JSON/CSV output:**

```
    id: '12312312312',
    text: 'Beautiful',
    created_at: 1271249682,
    did_report_as_spam: false,
    viewer_has_liked: false,
    owner_id: '11582747922',
    owner_username: 'dasdasdasd',
    owner_is_verified: false,
    likes: 0,
```

![Demo](https://i.imgur.com/C5EravY.png)

**Likers - JSON/CSV output:**

```
    user_id: '12312312312',
    username: 'bob',
    full_name: 'sam',
    profile_pic_url: 'URL',
    is_private: false,
    is_verified: true,
    followed_by_viewer: false,
    requested_by_viewer: false,
```

![Demo](https://i.imgur.com/NEqVfzB.png)

**Possible errors from instagram API**

-   Rate Limit - Instagram API temporarily blocked your IP, you can wait a little, try to use a proxy or set a {timeout}

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

### In Terminal

```sh
$ instatouch --help

Commands:
  instatouch user [id]      Scrape posts from username. Enter only username
  instatouch hashtag [id]   Scrape posts from hashtag. Enter hashtag without
  instatouch comments [id]  Scrape comments from a post. Enter post url or post id
  instatouch likers [id]    Scrape users who liked a post. Enter post url or post id

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
  --progress              Show progress in terminal    [boolean] [default: true]
  --filename, --file, -f  Name of the output file              [default: "[id]"]
  --filepath              Directory to save file
                                           [default: "{CURRENT_PATH}"]
  --filetype, --type, -t  Type of output file
                              [choices: "csv", "json", "both"] [default: "json"]
```

**Example 1:**
Scrape 50 video posts from hashtag summer. Save post info in to a CSV file (by default)

```sh
$ instatouch hashtag summer --count 50 --mediaType video

Output:
JSON path: /{CURRENT_PATH}/summer_1552945544582.csv
```

**Example 2:**
Scrape 100 posts from user natgeo, download and save them to a ZIP archive. Save post info in to a JSON and CSV files (--filetype all)

```
$ instatouch user natgeo --count 100 --download true --filetype all

Output:
ZIP path: /{CURRENT_PATH}/natgeo_1552945659138.zip
JSON path: /{CURRENT_PATH}/natgeo_1552945659138.json
CSV path: /{CURRENT_PATH}/natgeo_1552945659138.csv
```

**Example 3:**
Scrape 50 posts from user natgeo, download and save them to a ZIP archive. Save post info in to a JSON and CSV files (--filetype all). Save all files to a custom path (--filepath /custom/path/to/save/files)

```
$ instatouch user natgeo --count 50 --download true --filetype all --filepath /custom/path/to/save/files

Output:
ZIP path: /custom/path/to/save/files/natgeo_1552945659138.zip
JSON path: /custom/path/to/save/files/natgeo_1552945659138.json
CSV path: /custom/path/to/save/files/natgeo_1552945659138.csv
```

**Example 4:**
Scrape 200 comments from this post https://www.instagram.com/p/B3XPst_A98M/. Save comment data in to a CSV file

```
$ instatouch comments https://www.instagram.com/p/B3XPst_A98M/ --count 50

Output:
CSV path: /{CURRENT_PATH}/B3XPst_A98M_1552945659138.csv
```

**Example 5:**
Scrape 200 users who liked this post https://www.instagram.com/p/B3XPst_A98M/. Save comment data in to a CSV file

```
$ instatouch likers https://www.instagram.com/p/B3XPst_A98M/ --count 200

Output:
CSV path: /{CURRENT_PATH}/B3XPst_A98M_1552945659138.csv
```

**To make it look better, when downloading posts the progress will be shown in terminal**

```
Downloading VIDEO B3PmkisgjSx [==============================] 100%
Downloading PHOTO B3Pmme3ASuY [==============================] 100%
Downloading PHOTO B3PmmLHjE4s [==============================] 100%
Downloading VIDEO B3PmiL0HxG3 [==============================] 100%
Downloading PHOTO B3PmmJFAWVI [==============================] 100%
Downloading PHOTO B3Pml8PFg3i [==============================] 100%
Downloading PHOTO B3Pml-hJyvc [==============================] 100%
Downloading PHOTO B3Pml2lnS0B [==============================] 100%
Downloading PHOTO B3PmltPiTDi [==============================] 100%
Downloading PHOTO B3Pml05osiU [==============================] 100%
Downloading PHOTO B3Pmlmficxo [==============================] 100%
```

## Module

### Promise

```javascript
const instaTouch = require('instatouch');

// Scrape posts from a user profile
(async () => {
    let options = { count: 100, mediaType: 'image', download: true, filepath: process.cwd() };
    try {
        let user = await instaTouch.user('natgeo', options);
        console.log(user);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape posts from the hashtag page
(async () => {
    let options = { count: 100, mediaType: 'image', download: true, filepath: process.cwd() };
    try {
        let hashtag = await instaTouch.hashtag('summer', options);
        console.log(user);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape posts from the location page
// For example from this location https://www.instagram.com/explore/locations/213359469/munich-germany/
// In this example location id will be 213359469
(async () => {
    let options = { count: 100, mediaType: 'image', download: true, filepath: process.cwd() };
    try {
        let location = await instaTouch.location('213359469', options);
        console.log(user);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape comments from a post
// For example from this post https://www.instagram.com/p/B7wOyffArc5/
// In this example post id will be B7wOyffArc5
(async () => {
    let options = { count: 100, download: true, filepath: process.cwd() };
    try {
        let comments = await instaTouch.comments('B7wOyffArc5', options);
        console.log(comments);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape users who liked a post
// For example from this post https://www.instagram.com/p/B7wOyffArc5/
// In this example post id will be B7wOyffArc5
(async () => {
    let options = { count: 100, download: true, filepath: process.cwd() };
    try {
        let likers = await instaTouch.likers('B7wOyffArc5', options);
        console.log(likers);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape Followers Data from a specific user
// For example from this profile page https://www.instagram.com/natgeo/
// In this example username will be natgeo
// NOTE: in order for you to scrape Followers Data you need an Active Session ID.
// You can login to your IG profile in Google Chrome.
// Open "Inspector" and extract sessionId value from cookies
(async () => {
    let options = { count: 100, download: true, filepath: process.cwd(), sessionId: '' };
    try {
        let followers = await instaTouch.followers('natgeo', options);
        console.log(followers);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape Following Data from a specific user
// For example from this profile page https://www.instagram.com/natgeo/
// In this example username will be natgeo
// NOTE: in order for you to scrape Following Data you need an Active Session ID.
// You can login to your IG profile in Google Chrome.
// Open "Inspector" and extract sessionId value from cookies
(async () => {
    let options = { count: 100, download: true, filepath: process.cwd(), sessionId: '' };
    try {
        let followers = await instaTouch.following('natgeo', options);
        console.log(following);
    } catch (error) {
        console.log(error);
    }
})();
```

### Event

```javascript
const instaTouch = require('instatouch');

const options = {
    count: 100,
    mediaType: 'all',
    event: true, // Enable event listener, you won't be able to use promises
};

const user = instaTouch.user('natgeo', options);

user.getPosts();

user.on('data', (json) => {
    //data in JSON format
});

user.on('error', (error) => {
    //error message
});
```

**Functions**

```diff
.user(id, options) //Scrape user posts
.hashtag(id, options) //Scrape hashtag posts
.location() // Scrape posts from a specific location
.comments(id, options) //Scrape location posts
.likers(id, options) //Scrape users who liked specific post
- .followers(id, options) //Scrape Followers data.-> REQUIRES AN ACTIVE SESSION
- .following(id, options) //Scrape Following data.-> REQUIRES AN ACTIVE SESSION
```

**Options**

```javascript
let options = {
    // Number of posts to scrape: {int default: 0}
    count: 0,

    // Download posts or not. If true ZIP archive in {filepath} will be created: {boolean default: false}
    download: false,

    // How many post should be downloaded asynchronously. Only if {download:true}: {int default: 5}
    asyncDownload: 5,

    // Media type to scrape: ["image", "video", "all"]: {string default: 'all'}
    mediaType: 'all',

    // Set proxy, example: 127.0.0.1:8080: {string default: ''}
    proxy: '',

    // File name that will be used to save data to: {string default: '[id]'}
    filename: '[id]',

    // File path where all files will be saved: {string default: 'USER_HOME_DIR'}
    filepath: `USER_HOME_DIR`,

    // File types to save post data to: ['json', 'csv', 'all', 'na']: {string default: 'na'}
    filetype: 'na',

    // Enable or Disable events. If true then you can accept data through events: {boolean default: false}
    event: false,

    // Timeout between requests. If error 'rate limit' received then this option can be useful: {int default: 0}
    timeout: 0,
};
```

**Result will contain a bunch of data**

```javascript
instaTouch {
    collector:[ARRAY_OF_DATA]
    //Files are below
    zip: '/{CURRENT_PATH}/natgeo_1552963581094.zip',
    json: '/{CURRENT_PATH}/natgeo_1552963581094.json',
    csv: '/{CURRENT_PATH}/natgeo_1552963581094.csv'
}
```

---

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

## License

**MIT**

**Free Software**
