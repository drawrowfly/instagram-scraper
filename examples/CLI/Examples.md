[Go back to the Main Documenation](https://github.com/drawrowfly/instagram-scraper)

## Terminal Examples

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

**Example 6:**
Download(-d) 20 newest post from the user {USERNAME} and save the progress to avoid downloading the same posts in the future(-s)

-   When executing same command next time scraper will only download new posts that weren't downloaded before

```sh
instatouch user USERNAME -c 20 -d -s


Output:
Folder Path: /User/Bob/Downloads/USERNAME
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
