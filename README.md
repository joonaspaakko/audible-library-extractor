# audible-library-extractor
Browser extension that extracts your Audible library as a locally viewable web gallery. [Youtube video](https://youtu.be/SxqG8BXIsg0) showing everything the extension does right now.

**Install / Usage ( Chrome only for now)**:

1. Go to `chrome://extensions`
2. Turn on the developer mode from the top right
3. Drag the zip file in the browser window to install
4. Go to `audible.com` → login → open your library
5. In the library, you’ll find an orange button at the top right above where the list of books starts, in the filter section. Click it.
6. In the next view the only button that doesn't work yet is the update button.
7. After the extraction is done (if it goes through…) the current tab is closed and a new output page for the gallery is opened
	- You should hopefully see a gallery with all of your books with various details.

**End goal**

> Just the big mile markers. There's will be many minor and major features, challenges and issues to patch between each of these.

- [x] Library scanning (scraping): 
  - [x] Extract the whole library and its relevant data
	- [ ] Library can be updated just checking what's new and adding those in with the rest. Right now it's all or nothing.
- [x] Gallery:
  - [x] A locally viewable callery display library data
  - [ ] Lazy loading for images
  - [ ] Search / Filter
  - [ ] Sorting (Right now it shows them in the order they were added to your library) 
  - [ ] Google books API's summary(?) _Not sure about this yet, but I never liked most provided by Audible_
- [ ] Spreadsheet:
  - [ ] CSV export
  - [ ] Goodreads import compatibility in (Fetching ISB from Google books API)
- [ ] Firefox support
