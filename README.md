# Audible Library Extractor (Chrome extension)

Browser extension that extracts your Audible library as a locally viewable web gallery. Here's a video showing the scanning process and a little bit of the gallery: [Youtube video](https://youtu.be/SxqG8BXIsg0) and here's another video showing off the search: [Youtube video](https://youtu.be/5qyvEVIXYrY).

Note: this extension is not for extracting the audio files from your library.

**Install / Usage ( Chrome only for now)**:

1. Go to `chrome://extensions`
2. Turn on the developer mode from the top right
3. [`Download`](https://github.com/joonaspaakko/audible-library-extractor/releases)/drag the zip file in the browser window to install
4. Go to `audible.com` → login → open your library
5. In the library, you’ll find an orange button at the top right above where the list of books starts, in the filter section. Click it.
6. In the next view the only button that doesn't work yet is the update button.
7. After the extraction is done (if it goes through…) the current tab is closed and a new output page for the gallery is opened
	- You should hopefully see a gallery with all of your books with various details.

**End goal**

> Just the big mile markers. There's will be many minor and major features, challenges, and issues to patch between each one listed below.

- [x] Library scanning (scraping):
  - [x] Extract the whole library and its relevant data
  - [ ] Library update - _A partial scan that only goes through newly added titles and merges them with the rest._
- [x] Gallery:
  - [x] A locally viewable gallery
  - [x] Lazy loading for images
  - [x] Search
    - [x] Search scopes - _So you can increase search accuracy._
		- [ ] Autocomplete - _For example, if you search for "sci", the autocomplete gives you a few likely options for the full sentence, like "Sci-Fi & Fantasy", "Sci-Fi: Contemporary"._
	- [x] Filter buttons:
  - [x] Sorting ~~Right now it shows them in the order they were added to your library, but search shuffles the deck.~~
	- [ ] Audio player for the sample audio
  - [ ] Google books API's summary(?) _Not sure about this yet, but I never liked most provided by Audible_
- [ ] Spreadsheet:
  - [ ] CSV export
  - [ ] Goodreads import compatibility for the CSV (=Fetching ISB from Google books API)
- [ ] Ability to save the output page locally.
- [ ] Firefox support
