const instaTouch = require('instatouch');

let options = {
    count: 5,
    download: true,
    mediaType: "all",
    filetype: "both"
};

(async () => {
    let user;
    try{
        user = await instaTouch.user("ellenadya", options);
        console.log(user)
    } catch(error){
        console.log(error)
    }
})()