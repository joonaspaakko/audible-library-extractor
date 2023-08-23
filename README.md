# Audible Library Extractor browser extension ((metadata only)) <!-- omit in toc -->
[![](https://img.shields.io/github/v/release/joonaspaakko/audible-library-extractor?include_prereleases&label=latest%20version)](https://github.com/joonaspaakko/audible-library-extractor/releases/latest)
[![](https://img.shields.io/github/release-date/joonaspaakko/audible-library-extractor?label=latest%20version)](https://github.com/joonaspaakko/audible-library-extractor/releases/latest)
[![](https://img.shields.io/github/issues/joonaspaakko/audible-library-extractor/bug?label=known%20bugs)](https://github.com/joonaspaakko/audible-library-extractor/labels/bug)

> Supported browsers: Chrome, Edge (and other Chromium based browsers), ~~Firefox~~ (not past v.0.2.8)

**Automatically generates a searchable gallery** from your Audible **library**. Additionally, you can extract **collections** and **wishlist**too. If you upload the gallery online, you can share it with others or you can use the gallery to find your next listen on mobile and  [easily open the book in Audible’s mobile app](applewebdata://130BB437-11BF-4F93-9793-DF8D1A3A9464/@joonaspaakko/s/audible-library-extractor/~/drafts/-M_UXBJG3cmCydpyKhOe/gallery/next-listen-mobile-use#open-book-in-audibles-mobile-app) .
You can check my Audible library [here](https://joonaspaakko.github.io/my-audible-library/).

## Install
- ~~Firefox - [https://addons.mozilla.org/firefox/addon/audible-library-extractor/](https://addons.mozilla.org/firefox/addon/audible-library-extractor/)~~ (not past v.0.2.8)
- Chrome - [https://chrome.google.com/webstore/detail/audible-library-extractor/deifcolkciolkllaikijldnjeloeaall](https://chrome.google.com/webstore/detail/audible-library-extractor/deifcolkciolkllaikijldnjeloeaall)
    - This version can also be installed in the Chromium based Edge and other Chromium based browsers.

## Extension documentation
Here you will find general usage information as well as instructions for sharing the gallery: [documentation](https://joonaspaakko.gitbook.io/audible-library-extractor/).

<br/><br/>

----

![](https://github.com/joonaspaakko/audible-library-extractor/blob/master/screenshots/audible-library-extractor-screenshot-1.png)

[screenshot 1](https://github.com/joonaspaakko/audible-library-extractor/blob/master/screenshots/audible-library-extractor-screenshot-1.png?raw=true), [screenshot 2](https://github.com/joonaspaakko/audible-library-extractor/blob/master/screenshots/audible-library-extractor-screenshot-2.png?raw=true), [screenshot 3](https://github.com/joonaspaakko/audible-library-extractor/blob/master/screenshots/audible-library-extractor-screenshot-5.png?raw=true), [screenshot 4](https://github.com/joonaspaakko/audible-library-extractor/blob/master/screenshots/audible-library-extractor-screenshot-4.png?raw=true), [screenshot 5](https://github.com/joonaspaakko/audible-library-extractor/blob/master/screenshots/audible-library-extractor-screenshot-3.png?raw=true)

<br/><br/>

----
<br/><br/>

## How to use the extension <!-- omit in toc -->

1. Go to your Audible library, 
2. Click the `Audible Library Extractor` button below the search input or the extension icon.
3. In the next view you can choose what to extract and start the extraction process by clicking the big blue button: [screenshot](https://github.com/joonaspaakko/audible-library-extractor/blob/master/screenshots/audible-library-extractor-screenshot-4.png?raw=true) 
    - The extraction will take a few minutes. It depends on the size of your library and any of the other things you choose to extract.
    - After the extraction is done the current tab is closed and a new output page for the gallery is opened.

<br/><br/>

----
<br/><br/>

## How to install development releases

<details><summary>Read more...</summary>
<br/><br/>

> These instructions are for [all releases](https://github.com/joonaspaakko/audible-library-extractor/releases) you can find on GitHub.

I would not recommend installing these development releases. For one, you get to retain previously extracted data updating through the official channels, but unfortunately not when updating dev releases.

### Chrome  <!-- omit in toc -->
  
0. Get the [latest audible-library-extractor zip](https://github.com/joonaspaakko/audible-library-extractor/releases/latest) file from the [releases page](https://github.com/joonaspaakko/audible-library-extractor/releases).
1. Go to the address:  `chrome:extensions`.
	- Or:  `Window > Extensions`
2. Turn on the developer mode from the top right
3. Drag the downloaded `.zip` file in the browser window to install

### Firefox  <!-- omit in toc -->

> This is a temporary installation that will be gone after a restart. No way around it, other than installing it through the Firefox addon website, which is preferred anyways.

0. Get the [latest audible-library-extractor zip](https://github.com/joonaspaakko/audible-library-extractor/releases/latest) file from the [releases page](https://github.com/joonaspaakko/audible-library-extractor/releases).
1. Go to the address: `about:debugging#/runtime/this-firefox`
	- Alternatively:  `Tools > Add-ons` and click the gear icon on the top right and then `Debug Addons`
2. Then on the top right click the button: `Load Temporary Add-on...`
3. Locate and add the downloaded release `.zip` file.

</details>
