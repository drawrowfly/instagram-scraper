[Go back to the Main Documenation](https://github.com/drawrowfly/instagram-scraper)

## Manage Download History

![History](https://i.imgur.com/VnDKh72.png)

You can only view the history from the CLI and only if you have used **-s** flag in your previous scraper executions.

**-s** save download history to avoid downloading duplicate posts in the future

To view history record:

```sh
instatouch history
```

To delete single history record:

```sh
instatouch history -r TYPE:INPUT
instatouch history -r user:tiktok
instatouch history -r hashtag:summer
instatouch history -r location:434343
instatouch history -r likers:https://www.instagram.com/p/CAS6In0AU_K/
instatouch history -r comments:https://www.instagram.com/p/CAS6In0AU_K/
```

Set custom path where history files will be stored.

**NOTE: After setting the custom path you will have to specify it all the time so that the scraper knows the file location**

```
instatouch hashtag summer -s -d -n 10 --historypath /Blah/Blah/Blah
```

To delete all records:

```sh
instatouch history -r all
```
