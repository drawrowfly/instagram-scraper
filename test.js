const instaTouch = require('./');
let stream = require( 'stream' );

let options = {
    count: 100,
    download: false,
    mediaType: "all",
    timeout:0,
    // filetype: "all",
    event: true,
};

let scraper = instaTouch.comments("B3r5KWygzP7", options);
scraper.getPosts();

scraper.on('data', (json) => {
    console.log(json.id, json.text)
})

scraper.on('error', (data) => {
    console.log(data)
})

// (async () => {
//     try{
//         let comments = await instaTouch.comments("B3XPst_A98M", options);
//         console.log(comments.length)
//     } catch(error){
//         console.log(error)
//     }
// })()

// (async () => {
//     let scraper = new instaTouch({ 
//         id: 'instagram',
//         count: 100,
//         download: false,
//         asyncDownload: 2,
//         event: false,
//         mediaType: 'all',
//         proxy: '',
//         filename: 'instagram',
//         filepath: '/Users/jackass/Downloads',
//         filetype: 'both',
//         progress: false,
//         scrapeType: 'user',
//         queryHash: 'f045d723b6f7f8cc299d62b57abd5002',
//         url: 'https://www.instagram.com/instagram/' 
//     })
//     try{
//         let user = await scraper.getPosts();
//         console.log(user)
//     } catch(error){
//         console.log(error)
//     }
// })()

// let scraper = new instaTouch({ 
//     id: 'instagram',
//     count: 100,
//     download: false,
//     asyncDownload: 2,
//     event: true,
//     mediaType: 'all',
//     proxy: '',
//     filename: 'instagram',
//     filepath: '/Users/jackass/Downloads',
//     filetype: 'both',
//     progress: false,
//     scrapeType: 'user',
//     queryHash: 'f045d723b6f7f8cc299d62b57abd5002',
//     url: 'https://www.instagram.com/instagram/',
//     //timeout: 1000
// })


// scraper.getPosts();

// scraper.on('data', (data) => {
//     let json = JSON.parse(data.toString());
//     console.log(json.id)
// })

// scraper.on('error', (data) => {
//     console.log(data)
// })