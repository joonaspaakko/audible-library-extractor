# Audible Library Extractor 
> It's a **Chrome extension** only, _for now_...

Right now the extension scans your Audible library and then opens a web gallery in a new tab. There is also a spreadsheet view, but right now it's a little janky. The goal with this project is to be able to save the gallery locally so you could potentially upload it online for friends and family to see or possibly share the files via email. The spreadsheet view is sort of the backside of the web gallery and will have it's own `.csv` export, search, and sort functionalities. The plan is to also make this spreadsheet Goodreads import compatible, so you could then scan your library and import to goodreads to keep it up to date.

Here's a video showing the scanning process and a little bit of the gallery: [Youtube video](https://youtu.be/SxqG8BXIsg0) and this is a video from a later release with just the gallery, filtering, and its "books I own in the series" list: [Youtube video](https://www.youtube.com/watch?v=UYGmQWaFNjs).

> Note: this extension is **not for extracting the audio files from your library**, just the metadata. 
>
> If you are interested in downloading/converting the audio files to mp3's, try [OpenAudible](https://openaudible.org/). If you are looking for something to manage/stream/download/listen you may want to look into [Booksonic](https://booksonic.org/). I haven't looked into it in a while, but my understanding is that it's a fork of [Subsonic](http://www.subsonic.org/) and again I'm not certain, but I believe its mobile app works for booksonic too, which I think people have used specifically on ios, since booksonic doesn't have an ios client. Another route is [Plex Media Server](https://www.plex.tv/). It's okay for this purpose, but it doesn't have a real audiobook support. For the best experience with PMS, you need [Prologue](https://prologue-app.com/), which is ios only. That said, both Booksonic and PMS are kind of advanced. In a perfect world they are fairly plug and play, but as soon as you need to do custom stuff, it gets a bit complicated. As these are both essentially home server applications, you have to have your computer on when you want to stream or download books. PMS does allow you to download books, but I'm not sure if Booksonic has that feature. Though with PMS you need a paid account to download, which they offer lifetime licenses for.

## Install 

**( Chrome only for now)**

> This slightly inconvenient installation method is required until the extension ready to be put in Chrome's web store page and Firefox's addons page.
  
1. Go to `chrome://extensions`. 
  - Should also be in `Window > Extensions`
2. Turn on the developer mode from the top right
3. [`Download`](https://github.com/joonaspaakko/audible-library-extractor/releases/download/v0.1.1-pre-alpha/audible-library-extractor-v0.1.1.zip) / drag the zip file in the browser window to install

Additional info on what's changed in each version in the [releases page](https://github.com/joonaspaakko/audible-library-extractor/releases).

## How to use

> Check this video if you can't make sense of the list of steps below: [Youtube video](https://youtu.be/SxqG8BXIsg0). First 10 seconds should tell you all you need to know.

1. Go to `audible.com` → login → open your library
2. In the library, you’ll find an orange button at the top right above where the list of books starts, in the filter section. Click it.
3. In the next view you can start the extraction process but pressing the big blue button. The only button that doesn't quite work yet is the update button.
4. After the extraction is done (if it goes through…) the current tab is closed and a new output page for the gallery is opened.
  - For now the gallery can only be viewed through the extension. Check the list below for more info.

**End goal**

> Just the big mile markers... There will be many minor and major features and issues to patch between each one listed below.

- [x] Library scanning (scraping):
  - [x] Extract the whole library and its relevant data
  - [x] Library update 
    - Added, but still has some bugs. I believe it only works right now if you've added new books since the last scan. Otherwise it will freeze.
- [x] Gallery:
  - [x] A locally viewable gallery
  - [x] Lazy loading for images
  - [x] Search
    - [x] Search scopes
    - [ ] Autocomplete
  - [x] Filter buttons
  - [x] Sorting ~~Right now it shows them in the order they were added to your library, but search shuffles the deck.~~
  - [ ] Audio player for the sample audio
    - [ ] Ability to play the full mp3 files saved by OpenAudible. 
      - I'm not sure how feasible this idea is, but it would be cool if the player could play the full audiobook if they exist in the gallery folder.
  - [ ] Google books API's summary(?) _Not sure about this yet, but I never liked many plot summaries provided by Audible_
- [x] Spreadsheet:
  - [ ] CSV export _Right now you can select all cells and copy it to clipboard. No export button yet._
  - [ ] Goodreads import compatibility for the CSV 
    - To make sure the imported books get the best chance of finding a match in Goodreads it should include the International Standard Book Number (ISB), that audible doesn't provide in the website, so the plan is to fetch it from the Google books API and place it in the spreadsheet.
- [ ] Ability to save the output page locally as a standalone web gallery.
  - The purpose of this is so that you can share it with others by uploading it online or possibly sharing via email or something.
- [ ] Firefox support
