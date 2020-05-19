[Go back to the Main Documenation](https://github.com/drawrowfly/instagram-scraper)

## Promise

```javascript
const instaTouch = require('instatouch');

// Scrape 100 image posts from the user feed
(async () => {
    try {
        const options = { count: 100, mediaType: 'image' };
        const user = await instaTouch.user('natgeo', options);
        console.log(user);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape 100 video posts from the hashtag feed
(async () => {
    try {
        const options = { count: 100, mediaType: 'video' };
        const hashtag = await instaTouch.hashtag('summer', options);
        console.log(const);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape 100 video and iage posts from the location feed
// For example from this location https://www.instagram.com/explore/locations/213359469/munich-germany/
// In this example location id will be 213359469
(async () => {
    try {
        const options = { count: 100, mediaType: 'all' };
        const location = await instaTouch.location('213359469', options);
        console.log(location);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape comments from a post
// For example from this post https://www.instagram.com/p/B7wOyffArc5/
// In this example post id will be B7wOyffArc5 or you can set full URL
(async () => {
    try {
        const options = { count: 100};
        const comments = await instaTouch.comments('B7wOyffArc5', options);
        console.log(comments);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape users who liked a post
// For example from this post https://www.instagram.com/p/B7wOyffArc5/
// In this example post id will be B7wOyffArc5 or you can set full URL
(async () => {
    try {
        const options = { count: 200 };
        const likers = await instaTouch.likers('B7wOyffArc5', options);
        console.log(likers);
    } catch (error) {
        console.log(error);
    }
})();

// Scrape 2000 users who liked a post and set custom proxy list to avoid rate limit error
// For example from this post https://www.instagram.com/p/B7wOyffArc5/
// In this example post id will be B7wOyffArc5 or you can set full URL
(async () => {
    try {
        const proxy = [
            'username:password@127.0.0.1:1000',
            'username:password@127.0.0.1:1002',
            'username:password@127.0.0.1:1003',
            'username:password@127.0.0.1:1004',
            'username:password@127.0.0.1:1005',
        ]
        const options = { count: 200, proxy };
        const likers = await instaTouch.likers('B7wOyffArc5', options);
        console.log(likers);
    } catch (error) {
        console.log(error);
    }
})();
```
