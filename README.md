
# Audible Library Extractor

Automatically generates a searchable gallery & spreadsheet by scanning your audible library. The goal with this project is to help your show others what you have in your Audible library. Once the library has been scanned, you can immediately privately view the gallery. From there you can extract the files that you can share with others by uploading the files online or perhaps sharing the files via email, if you want to get old school about it. Here's an old video showing how what the extension extraction process looks like [Youtube video](https://youtu.be/SxqG8BXIsg0).

You can check my Audible library [here](https://joonaspaakko.github.io/my-audible-library/). 

- The extension automatically generates a searchable gallery & spreadsheet by scanning your audible library
- The gallery is mainly designed to help you share what you have in your library, but it's also designed to help you find books to listen to
- The spreadsheet is a view mode in the gallery, but you can also save it as a CSV file through the gallery. You could also select each cell and copy & paste into a spreadsheet application if you want to skip dealing with files.
- The gallery generates a list of all the books you own in the series of the book you're viewing and marks the one's you have finished. This helps a lot when trying to figure out which book comes next in a series.
- The gallery works on mobile devices
- Only handles metadata, so it doesn't extract the audio files

## How to install developement releases

<details>
  <summary>Read more...</summary>

> These instructions are for [all releases](https://github.com/joonaspaakko/audible-library-extractor/releases) you can find on GitHub.

I would not recommend installing these developement releases, but if you have to, here's how:

### Chrome
  
0. Get the latest audible-library-extractor zip file from the [releases page](https://github.com/joonaspaakko/audible-library-extractor/releases).
1. Go to `chrome://extensions`.
  - Should also be in `Window > Extensions`
2. Turn on the developer mode from the top right
3. Drag the zip file in the browser window to install

### Firefox

> This is a temporary installation that will be gone after a restart.

0. Get the latest audible-library-extractor zip file from the [releases page](https://github.com/joonaspaakko/audible-library-extractor/releases).
1. `Tools > Add-ons`
2. Gear icon on the top right → `Debug Addons`
3. Same spot in the top right `Load Temporary Add-on...`
4. Locate and add the release `.zip` file.

</details>

## How to use the extension

> Check this video if you can't make sense of the list of steps below: [Youtube video](https://youtu.be/SxqG8BXIsg0). First 10 seconds should tell you all you need to know.

1. Go to your Audible library
2. Click the orange `Audible library extractor` button
	- The button is at the top right above where the list of books starts
3. In the next view you can start the extraction process by pressing the big blue button.
4. After the extraction is done the current tab is closed and a new output page for the gallery is opened.

### Region support?

I would love for this to work on all of the different regions but as of now I would expect it to only work in any English Audible websites. The gallery is in English only.

______	

## Save gallery locally

The gallery can be saved easily by clicking the save icon at the top of the extensions output page. One option for sharing the gallery would be to send the exported zip file via email and once the zip is unpacked the index.html inside can be opened in a browser and viewed locally by anyone you send the files to.

The slightly more advanced way to share it, but way more versatile option would be to upload the gallery online. If you already have a web hosting plan, there's nothing to it, you should know what to do. Just upload the files to and you're done. But for all others, I would recommend Github Pages because you can get this website running for free with a reasonable domain name even, but that said it is not exactly the simplest process.

As an example, here's [my Audible library in Github](https://joonaspaakko.github.io/my-audible-library/).

### Uploading your gallery to Github as a website

<details>
  <summary>Read more...</summary>

This is a fairly complex process if you've never used Github/Git to make repositories, but it is a free way to get your site on the internets, so there's that. The complexity comes mostly from how Git/Github works and what it's mainly for. You don't need to touch any code, it's just a matter of learning how it works and clicking your way through the process._

> Be aware that Github Pages only work on public repositories on the free account. This means that the repository/the files are more freely available than on a more traditional hosting platform. For example the repository for my audible library website I linked to above is accessible from this address [https://github.com/joonaspaakko/my-audible-library](https://github.com/joonaspaakko/my-audible-library). Anyone can clone (fork) this repository and use it as they please. In this instance it shouldn't be a problem because this extension doesn't gather any information that could be used against you in any way.


> If you know how to make a regular repository in Github but haven’t used GitHub Pages before, jump straight to step 3.

1. You need a (free) [github account ](https://github.com/join).
2. For things to not get totally out of hand in terms of complexity, you will definitely want to use the [Github Desktop client](https://desktop.github.com/).
	1. In Github Desktop you first make the repository `File > New repository`, which you can think of as a project folder in your account. The only thing you need to add when creating a new repository is the name for the project, for example I named mine `my-audible-library`.
	2. If you select the project you should see a button that opens the project folder in your computer. Click the button and put the zip file you got from the extension’s gallery in that folder.
		- You need to unpack the zip file here. Then you can remove the zip file.
	3. Now when you open Github Desktop, it should show you that new files were added to the project.
	4. In the bottom left there's `Summary, Description, and Commit to master`. This is where you basically save the changes in your project.
		1. You need to always give summary before you can commit (save). In this case you don't have to be descriptive at all. You can make summary a `-` for all your commits if you want. It doesn’t matter much in this case.
		2. When you click `Commit to master`, you're almost there. The changes are now saved locally, but you then have to upload the files to Github…
		3. Upload the files with the `Push origin` button.
3. So now the Github project repository should be online, but you still need to tell Github that you want this to be a website.
	- Super short instructions: 
		1. Go to the project repository page online and click `Settings`. 
		2. In there you can find a section called `GitHub Pages`. 
		3. Choose `Master branch` in the `Source` dropdown and when that’s done. It should tell you what the website address is, which should be along the lines of `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME`.
	- You can find more comprehensive instructions [here](https://pages.github.com/). To get the right instructions just select `Project site` and `Start from scratch`. You can skip to step 4 in the Github article.
4. When you've got all this done and the project repository is set as a website, you can share the address with anyone. And to be clear, they don't need a Github account to view the gallery.


**What if I want to upload my updated gallery again?**

This is super simple. You just save it locally again, replace the files in this Github project folder on your computer and then in the Github Desktop client open the audible library project: `commit changes` → `push origin` → Done.

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

If you are interested in downloading/converting the audio files to mp3's, possibly the simplest option is [OpenAudible](https://openaudible.org/).

**Looking for something to manage/stream/download/listen audibooks?**

> First of all, these are both kinda advanced and depending on your usage may require an always on server computer.

[Booksonic](https://booksonic.org/) might be the first thing you want to check. I believe it's a fork of [Subsonic](http://www.subsonic.org/) made specifically for Audibobooks. I haven't looked into it in a while, but I believe Subsonic's mobile app should work with Booksonic too, which I think people have used specifically on ios, since booksonic doesn't have an ios client.

Another route is [Plex Media Server](https://www.plex.tv/). It's okay for this purpose, but it doesn't have a real audiobook support. For the best experience with PMS, you need [Prologue](https://prologue-app.com/), which is ios only. PMS does allow you to download books if you have plex pass.
