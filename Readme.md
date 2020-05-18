# InstaTouch

![NPM](https://img.shields.io/npm/l/instatouch.svg?style=for-the-badge) ![npm](https://img.shields.io/npm/v/instatouch.svg?style=for-the-badge) ![Codacy grade](https://img.shields.io/codacy/grade/037f8049f7e048a2b03a95fda8863f39.svg?style=for-the-badge)

Scrape useful information from instagram.

**No login or password are required.**

This is not an official API support and etc. This is just a scraper that is using instagram graph api to scrape media.

---

<a href="https://www.buymeacoffee.com/Usom2qC" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

---

## Content
- [Demo](#demo)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
	- [In Terminal](#in-terminal)
	    - [Terminal Examples](https://github.com/drawrowfly/instagram-scraper/tree/master/examples/CLI/Examples.md)
	    - [Manage Download History](https://github.com/drawrowfly/instagram-scraper/tree/master/examples/CLI/DownloadHistory.md)
	    - [Scrape and Download in Batch](https://github.com/drawrowfly/instagram-scraper/tree/master/examples/CLI/BatchDownload.md)
	    - [Output File Example](#output-file-example)
	- [Module](#docker)
	    - [Methods](#methods)
	    - [Options](#options)
	    - [Use with Promises](https://github.com/drawrowfly/instagram-scraper/tree/master/examples/Module/Examples.md)
	    - [Output Example](#json-output-example)
	        - [User, Hashtag, Location Feeds](#feed)
	        - [comments](#comments)
	        - [likers](#likers)
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
- [Terminal Examples](https://github.com/drawrowfly/instagram-scraper/tree/master/examples/CLI/Examples.md)
- [Manage Download History](https://github.com/drawrowfly/instagram-scraper/tree/master/examples/CLI/DownloadHistory.md)
- [Scrape and Download in Batch](https://github.com/drawrowfly/instagram-scraper/tree/master/examples/CLI/BatchDownload.md)

### Output File Example

![Demo](https://i.imgur.com/D9sH95B.png)

## Module

### Methods

```javascript
.user('tiktok', options) // User feed
.hashtag('summer', options) // Hashtag feed
.location('', options) // Location feed
.comments('https://www.instagram.com/p/CATMghXnGrg/', options) // Post comments
.likers('https://www.instagram.com/p/CATMghXnGrg/', options) // People who liked post

.getUserMeta('USERNAME', options) // Get user metadata
.getPostMeta('https://www.instagram.com/p/CATMghXnGrg/', options) // Get post metadata
```

### Options

```javascript
const options = {
    // Number of posts to scrape: {int default: 0}
    count: 0,

    // Download posts or not. {boolean default: false}
    download: false,
    
    // Archive downloaded posts. {boolean default: false}
    // If set to {false} then posts will be saved in the newly created folder
    zip: false

    // How many post should be downloaded asynchronously. Only if {download:true}: {int default: 5}
    asyncDownload: 5,

    // Media type to scrape: ["image", "video", "all"]: {string default: 'all'}
    mediaType: 'all',

    // Set proxy {string[] | string default: ''}
    // http proxy: 127.0.0.1:8080
    // socks proxy: socks5://127.0.0.1:8080
    // You can pass proxies as an array and scraper will randomly select a proxy from the array to execute the requests
    proxy: '',

    // File name that will be used to save data to: {string default: '[id]'}
    filename: '[id]',

    // File path where all files will be saved: {string default: 'USER_HOME_DIR'}
    filepath: `USER_HOME_DIR`,

    // Output with information can be saved to a CSV or JSON files: {string default: 'na'}
    // 'csv' to save in csv
    // 'json' to save in json
    // 'all' to save in json and csv
    // 'na' to skip this step
    filetype: `na`,
    
    // Set initial cursor value to start pagination over the feed from the specific point: {string default: ''}
    endCursor: ''

    // Timeout between requests. If error 'rate limit' received then this option can be useful: {int default: 0}
    timeout: 0,
};
```

- [Promise Examples](https://github.com/drawrowfly/instagram-scraper/tree/master/examples/Module/Examples.md)

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

### Json Output Example

##### Feed
Example output for the methods: **user, hashtag, location**

```javascript
{
    id: '2311886241697642614',
    shortcode: 'CAVeEm1gDh2',
    type: 'GraphSidecar',
    is_video: false,
    dimension: { height: 1080, width: 1080 },
    display_url:
        'https://scontent-hel2-1.cdninstagram.com/v/t51.2885-15/e35/97212979_112497166934732_8766432510789477700_n.jpg?_nc_ht=scontent-hel2-1.cdninstagram.com&_nc_cat=1&_nc_ohc=4jd1cuOMYrkAX_y6CK2&oh=2aa0b339cdf653dac916a64a70c81e31&oe=5EEB5E07',
    thumbnail_src:
        'https://scontent-hel2-1.cdninstagram.com/v/t51.2885-15/sh0.08/e35/s640x640/97212979_112497166934732_8766432510789477700_n.jpg?_nc_ht=scontent-hel2-1.cdninstagram.com&_nc_cat=1&_nc_ohc=4jd1cuOMYrkAX_y6CK2&oh=af5440bdf071108b7e74b1524c358e66&oe=5EED8CE4',
    owner: { id: '25025320', username: 'instagram' },
    description:
        'FernandoMagalhães’(@mglhs_com)ever-evolvingfuturisticbeingsliveintheGenesisHumanProject.Alpha,acomputer-generatedworldhedreamedupattheendof2018.TheLondon-basedBrazilianartistusesproceduralmodeling,aprogrammingtechniquethatcreates3Dmodelsandtextures.⁣\n⁣\n“I’monlyabletoseethem[hischaracters]oncetherenderisdone—soit’skindoflikemeetingsomebodyforthefirsttime,”explainsFernando.“Ilovetoseethemandtrytounderstand,tofeelfromwheretheycamefrom,whotheyare,whattheydoandsoon.”⁣\n⁣\n“TodayI’mworkinginthisuniversethatIcreated,butmymindgoesmuchfurtherthanthat.Throughmywork,Ihopepeopleunderstandthatartgoesbeyondwhatweknowasart,there’sdifferentpaths,approachesandpossibilities.”#ThisWeekOnInstagram⁣\n⁣\nDigitalimagesby@mglhs_com',
    comments: 5050,
    likes: 412657,
    comments_disabled: false,
    taken_at_timestamp: 1589818338,
    location: { id: '213385402', has_public_page: true, name: 'London,UnitedKingdom', slug: 'london-united-kingdom' },
    hashtags: ['#ThisWeekOnInstagram'],
    mentions: ['@mglhs_com', '@mglhs_com'],
};
```

##### Comments
Example output for the methods: **comments**

```javascript
{
    id: '17854856327003928',
    text: 'Böyle şeytani figürleri yayınlamak mi zorundasınız. Euzu billahi mineşşeytanirracim Bismillahirrahmanirrahim.',
    created_at: 1589837238,
    did_report_as_spam: false,
    owner: {
        id: '13492154487',
        is_verified: false,
        profile_pic_url:
            'https://scontent-hel2-1.cdninstagram.com/v/t51.2885-19/s150x150/89832595_142698410416916_7218363900150939648_n.jpg?_nc_ht=scontent-hel2-1.cdninstagram.com&_nc_ohc=dIhkVzLiHVUAX-o8Vx6&oh=d516c43b444dc3409ac3f0cca145f9ca&oe=5EEBA851',
        username: 'hasan_dede4809',
    },
    likes: 0,
    comments: 0,
};
```

##### Likers
Example output for the methods: **likers**

```javascript
{
    id: '27165506664',
    username: 'josedhl_priv',
    full_name: 'José David',
    profile_pic_url:
        'https://scontent-hel2-1.cdninstagram.com/v/t51.2885-19/s150x150/80568189_848308822340996_1519415041114243072_n.jpg?_nc_ht=scontent-hel2-1.cdninstagram.com&_nc_ohc=Kgmrwidffj0AX99RC-n&oh=a4e999c7ec74630c9a4a468272fc22c8&oe=5EEE2A91',
    is_private: true,
    is_verified: false,
};
```

## License

**MIT**

**Free Software**