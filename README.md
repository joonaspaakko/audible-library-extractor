# Audible Library Extractor
> It's a **Chrome extension** only, _for now_...

The goal with this project is to be able to show others what you have in your Audible library. Once the library has been scanned, you can save the gallery output locally so you can upload it online for friends and family to see or alternatively share the files via email. It can help you find the next book to listen.

**You can check my audible library [here](https://joonaspaakko.github.io/my-audible-library/).** This gallery was generated using the extension. Note: it may take a while to load. Here's an old video showing how what the extension extraction process looks like [Youtube video](https://youtu.be/SxqG8BXIsg0).

> Note: this extension is **not for extracting the audio files from your library**, just the metadata.

## Install

**( Chrome only for now)**

> This slightly inconvenient installation method is required until the extension ready to be put in Chrome's web store page and Firefox's addons page.
  
1. Go to `chrome://extensions`.
  - Should also be in `Window > Extensions`
2. Turn on the developer mode from the top right
3. [`Download`](https://github.com/joonaspaakko/audible-library-extractor/releases/download/v0.1.5-pre-alpha/audible-library-extractor-v0.1.5.zip) / drag the zip file in the browser window to install

Additional info on what's changed in each version in the [releases page](https://github.com/joonaspaakko/audible-library-extractor/releases).

## How to use

> Check this video if you can't make sense of the list of steps below: [Youtube video](https://youtu.be/SxqG8BXIsg0). First 10 seconds should tell you all you need to know.

1. Go to `audible.com` → login → open your library
2. In the library, you’ll find an orange button at the top right above where the list of books starts, in the filter section. Click it.
3. In the next view you can start the extraction process but pressing the big blue button. The only button that doesn't quite work yet is the update button.
4. After the extraction is done (if it goes through…) the current tab is closed and a new output page for the gallery is opened.
  - For now the gallery can only be viewed through the extension. Check the list below for more info.

## Save gallery locally

The gallery can be saved easily by clicking the save icon at the top of the extensions output page.  This way you can share the gallery with others. If you don't feel like sharing, you can always just view the gallery through the extension's output page. But it might be useful to upload the gallery, even if to just view it yourself on your phone or a tablet.

One option for sharing the gallery would be to send the exported zip file via email and once the zip is unpacked the index.html inside can be opened in a browser and viewed locally by anyone you send the files to.

The slightly more advanced way to share it, but way more versatile option would be to upload the gallery online. If you already have a web hosting plan, there's nothing to it, you should know what to do. Just upload the files as is and you're done. But for all others, I would recommend Github Pages because you can get this website running for free with a reasonable domain name even, but that said it is not exactly the simplest process. I'm going to outline the steps below.

As an example, here's [my Audible library in Github](https://joonaspaakko.github.io/my-audible-library/).

### Uploading your gallery to github as a website

<details>
  <summary>Click to expand!</summary>
	> Be aware that Github Pages only work on public repositories on the free account. This means that the repository/the files are more freely available than on a more traditional hosting platform. For example the repository for my audible library website I linked to above is accessible from this address [https://github.com/joonaspaakko/my-audible-library](https://github.com/joonaspaakko/my-audible-library). Anyone can clone (fork) this repository and use it as they please. In this instance it shouldn't be a problem because this extension doesn't gather any information that could be used against you in any way.

	_Note: The complexity in uploading your site to Github comes mostly from how Git/Github works and what it's mainly for. You don't need to touch any code, it's just a matter of learning how it works and clicking your way through the process._

	1. You need a (free) [github account ](https://github.com/join).
	2. For things to not get totally out of hand in terms of complexity, you will definitely want to use the [Github Desktop client](https://desktop.github.com/).
		1. In Github Desktop you first make the repository `File > New repository`, which you can think of as a project folder in your account. The only thing you need to add when creating a new repository is the name for the project, for example I named mine `my-audible-library`.
		2. If you select the project you should see a button that opens the project folder in your computer. Click that and put the files in that folder.
			- Because websites don't work from inside a zip file, you need to unpack the zip file here. Then you can remove the zip file.
		3. Now when you come back to Github Desktop, it should inform you that 3 new files were added to the project.
		4. In the bottom left there's `Summary, Description, and Commit to master`. This is where you basically save the changes in your project.
			1. You need to always give summary before you can commit (save). In this case you don't have to be descriptive at all. You can make the summary a `-` if you want.
			2. When you press `Commit to master`, you're almost there. The changes are now saved locally, but you then have to upload the files
			3. Upload the files with the `Push origin` button.
	3. So now the github project repository should be online, but you still need to tell Github that you want this to be a website.
		- Super short instructions: Go to the project repository page online and click `Settings`. In there you can find a section called `GitHub Pages`. Choose `Master branch` in the `Source` dropdown and it's done. It should tell you what the website address is right there.
		- You can find more comprehensive instructions [here](https://pages.github.com/). In this article just select `Project site` and `Start from scratch` to get the right instructions. You can skip to step 4 since the repository is already up and the files uploaded.
	4. When you've got all this done and the project repository is set as a website, you can share the address with anyone. And to be clear, they don't need a github account to view the gallery.

	**What if I want to upload my updated gallery again?**

	This is super simple. You just save it locally again, replace the files in this Github project folder on your computer and then in the Github Desktop client open the audible library project: commit changes → push origin → Done.

</details>

## Project goals

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
  - [x] Sorting
  - [ ] Audio player for the sample audio
    - [ ] Ability to play the full mp3 files saved by OpenAudible.
      - I'm not sure how feasible this idea is, but it would be cool if the player could play the full audiobook if they exist in the gallery folder.
- [x] Spreadsheet:
  - [x] CSV export _Right now you can select all cells and copy it to clipboard. No export button yet._
  - [ ] Making the CSV compatible with the import feature in Goodreads
    - To make sure the imported books get the best chance of finding a match in Goodreads it should include the International Standard Book Number (ISB), that audible doesn't provide in the website, so the plan is to fetch it from the Google books API and place it in the spreadsheet.
- [x] Ability to save the output page locally as a standalone web gallery.
  - The purpose of this is so that you can share it with others by uploading it online or possibly sharing via email or something.
  - [x] Mobile support
- [x] ~~Firefox support.~~ I've now checked that at least the basic functionality of the extension works in Firefox.

____
____

## Misc info

If you are interested in downloading/converting the audio files to mp3's, try [OpenAudible](https://openaudible.org/). It's the simplest.

**Are you looking for something to manage/stream/download/listen audibooks?**

> First of all, these are both kinda advanced and depending on your usage may require an always on server computer.

[Booksonic](https://booksonic.org/) might be the first thing you want to check. I believe it's a fork of [Subsonic](http://www.subsonic.org/) made specifically for Audibobooks. I haven't looked into it in a while, but I believe Subsonic's mobile app should work with Booksonic too, which I think people have used specifically on ios, since booksonic doesn't have an ios client.

Another route is [Plex Media Server](https://www.plex.tv/). It's okay for this purpose, but it doesn't have a real audiobook support. For the best experience with PMS, you need [Prologue](https://prologue-app.com/), which is ios only. PMS does allow you to download books if you have plex pass.
