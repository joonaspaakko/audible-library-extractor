
let githubIssues = 'https://github.com/joonaspaakko/audible-library-extractor/issues/';

function issue( number, prefix ) {
  prefix = prefix || 'Fixed';
 return { text: prefix+ ' #'+number, href: githubIssues+number }; 
}

export default {
  data: function() {
    return {
      
      changeLog: [
        {
          version: 'v.1.0.0',
          highlights: `Full extraction recommended due to data structure changes and store page fixes that restore previously lost data. This is a major release featuring direct GitHub uploads, a completely overhauled collage maker (formerly the wallpaper creator), and many more improvements. More changes are planned before this release is finalized.`,
          changes: [
            // EXTRACTION
            {
              description: `Fixed documentation button in extraction settings and right-click context menu not working.`,
              class: 'fixed',
              link: issue(165),
            },
            {
              description: `Extraction: Fixed merging discontinued books with series.`,
              class: 'fixed',
            },
            {
              description: `Extraction: Fixed/cleaned up store page release date fetching.`,
              class: 'fixed',
            },
            {
              description: `Extraction: Fixed extractions sometimes saving an empty result.`,
              class: 'fixed',
            },
            {
              description: `Extraction: Fixed fetching "people also bought" carousel data.`,
              class: 'fixed',
              link: issue(180),
            },
            {
              description: `Extraction: Fixed plus catalog availability from wishlist books (a class was changed).`,
              class: 'fixed',
              link: issue(181),
            },
            {
              description: `Extraction: Fixed wishlist extraction failing and gallery not opening after library extraction.`,
              class: 'fixed',
              link: issue(178),
            },
            {
              description: `Extraction: Now extracts the purchase date (added date) from purchase history, with a matching filter and sorter in the gallery.`,
              class: 'added',
            },
            {
              description: `Extraction: Migrated data structure from library.books to audibledata.library for better management. Automatic migration for old data structures on first load. This change is not really visible to users, but I wanted to mention it just as a heads up to say that a big structural change happened and this could potentially cause issues here and there as it touches just about every step of the extraction process and how data is displayed in the gallery etc.`,
              class: 'improved',
            },
            {
              description: `Extraction: Store page added extraction failsafes.`,
              class: 'improved',
            },
            {
              description: `Extraction: reduced the number requests needed for series extraction which should stabilize the extraction process by quite a bit.`,
              class: 'improved',
              link: issue(169),
            },

            // GALLERY
            {
              description: `Gallery: Animated background grid fixed last row not always being a full row.`,
              class: 'fixed',
              link: issue(167),
            },
            {
              description: `Gallery: Series sub page removed deduped total to reduce confusion with disparity on the series list sub page and what you see in each individual series page.`,
              class: 'fixed',
            },
            {
              description: `Gallery: Fixed minor standalone gallery load errors.`,
              class: 'fixed',
            },
            {
              description: `Gallery: Fixed carousel gallery rendering.`,
              class: 'fixed',
            },
            {
              description: `Gallery: Fixed randomized sample covers in the first page of categories being squished when they don't fit on the screen. Decided to handle this by letting it overflow and function like a manually scrollable carousel.`,
              class: 'fixed',
              link: issue(161),
            },
            {
              description: `Gallery: Fixed "my reviews" section above the summary causing content overflow on mobile.`,
              class: 'fixed',
              link: issue(162),
            },
            {
              description: `Gallery: Fixed typo "unkown" → "unknown".`,
              class: 'fixed',
              link: issue(187),
            },
            {
              description: `Added direct GitHub upload to the standalone gallery save modal so users don't need to manually download zips and upload them to GitHub.`,
              class: 'added',
            },
            {
              description: `Gallery: Added many new filters for sub pages.`,
              class: 'added',
            },
            {
              description: `Gallery: Added reset button for sub page filters.`,
              class: 'added',
            },
            {
              description: `Gallery: Added a "covers per row" setting to grid view.`,
              class: 'added',
            },
            {
              description: `Gallery: Added a "cover size" setting to grid view.`,
              class: 'added',
            },
            {
              description: `Gallery: Added a list/stacked details mode to grid view.`,
              class: 'added',
            },
            {
              description: `Gallery: Added a secondary sort value to grid view so you can, for example, still see the book series name while sorting by length.`,
              class: 'added',
            },
            {
              description: `Gallery: Added a segmented side scroller with a position label that shows how far you're scrolled and also works as a quick jump to any part of the page.`,
              class: 'added',
            },
            {
              description: `Gallery: Added search autocomplete with suggestions that also understand inline @scopes.`,
              class: 'added',
            },
            {
              description: `Gallery: The standalone gallery now packs the heavier book data (summaries and carousel data) into a handful of ~1MB chunk files instead of thousands of tiny per-book files, which makes GitHub uploads and page loads a lot faster. Chunks are also stored in IndexedDB to reduce file fetching.`,
              class: 'improved',
            },
            {
              description: `Gallery: Global settings are now available on any page and open in a drawer instead of living just inside the book details view.`,
              class: 'improved',
            },
            {
              description: `Gallery: Reworked the extension tools menu.`,
              class: 'improved',
            },
            {
              description: `Gallery: Replaced the cover blurb hot corner with a long press that lets you drag across multiple covers. Works on desktop and mobile.`,
              class: 'improved',
            },
            {
              description: `Gallery: All views (grid, spreadsheet, sub pages and collections) now use virtual scrolling for much better scrolling performance.`,
              class: 'improved',
            },
            {
              description: `Gallery: Rewrote the search, replacing Fuse with MiniSearch. It's faster and supports advanced operators: exact match, exclude, starts/ends with, exact phrases, OR, and inline @scopes.`,
              class: 'improved',
            },
            {
              description: `Gallery: Range slider now steps by one increment when clicking min/max labels instead of snapping to absolute min/max.`,
              class: 'improved',
            },
            {
              description: `Gallery: Animated background grid now loads in more gently so it doesn't slow down the initial page load. It waits for its images and lets the page content load first before it starts animating.`,
              class: 'improved',
            },
            {
              description: `Gallery: Animated background grid no longer flickers when foreground books are hovered over.`,
              class: 'improved',
            },
            {
              description: `Gallery: Animated background grid added more variability and randomness when user doesn't have many covers.`,
              class: 'improved',
            },
            {
              description: `Gallery: Changed tooltip styles.`,
              class: 'improved',
            },
            {
              description: `Gallery book details: Brought back sideways swipe to move between books.`,
              class: 'improved',
            },
            {
              description: `Gallery book details: Links now default to the gallery, and links that lead to Audible get an external link icon.`,
              class: 'improved',
            },
            {
              description: `Gallery: The "formulas" CSV export now uses the XLSX file format to retain formular compatibility with Google Sheets. Should also work with Excel.`,
              class: 'improved',
              link: issue(133),
            },

            // COLLAGE MAKER
            {
              description: `Collage maker: Fixed ERR_INSUFFICIENT_RESOURCES when exporting images with many covers (+400).`,
              class: 'fixed',
              link: issue(163),
            },
            {
              description: `Collage maker: Fixed text element control box visibility.`,
              class: 'fixed',
            },
            {
              description: `Collage maker: Fixed text element snapping.`,
              class: 'fixed',
            },
            {
              description: `Collage maker: Fixed selecting text element inside the right side panel de-selecting it immediately.`,
              class: 'fixed',
            },
            {
              description: `Collage maker: text elements auto-reserve whitespace on canvas sides based on orientation and location, making it easier to add text without having to figure out how to make space for it.`,
              class: 'added',
            },
            {
              description: `Collage maker: Replaced old toast notifications with a "notification center" (panel) that makes it a bit easier to show multiple tips on how you can interact with the editor.`,
              class: 'added',
            },
            {
              description: `Collage maker: Added panning mode indicator (holding down spacebar allows you to always pan across any elements).`,
              class: 'added',
            },
            {
              description: `Collage maker: Added right-click context menu for relisten and hide actions ("remove" changed to "hide" using pre-existing tier-list hide container).`,
              class: 'added',
            },
            {
              description: `Collage maker: Added momentum to canvas panning.`,
              class: 'added',
            },
            {
              description: `Collage maker: Renamed the "Wallpaper creator" to "Collage maker".`,
              class: 'improved',
            },
            {
              description: `Collage maker: The gallery menu button now prompts you to pick a source on pages with no books instead of being disabled.`,
              class: 'improved',
            },
            {
              description: `Collage maker: Improved zooming with the scroll wheel and changed it to center to the cursor.`,
              class: 'improved',
            },
            {
              description: `Collage maker: Constrained canvas panning so you can't shoot past the canvas into infinity.`,
              class: 'improved',
            },
            {
              description: `Collage maker: Settings panel sliders and rapidly changing number inputs now work smoother with a large amount of covers.`,
              class: 'improved',
            },
            {
              description: `Collage maker: Export settings now appear in a dialog before every save.`,
              class: 'improved',
            },
            {
              description: `Collage maker: Options panel now has collapsible sections (collapsed by default) to better inform users about each option.`,
              class: 'improved',
            },
            {
              description: `Collage maker: Double-clicking any side of text bounding box moves that side to a corresponding canvas edge (with some exceptions).`,
              class: 'improved',
            },
            {
              description: `Collage maker: Hovering over "cover padding" + "canvas padding" headings in the options panel now shows the current padding in the canvas.`,
              class: 'improved',
            },
          ],
        },
        {
          version: 'v.0.2.12',
          highlights: `Full extraction recommended in order to extract subcategories.`,
          changes: [
            {
              description: `Gallery (mobile): vertical scrolling doesn't always work with book details open.`,
              class: 'fixed',
              link: issue(144), 
            },
            {
              description: `Fixed publisher subpage in the gallery failing to open if any book is missing publishers.`,
              class: 'fixed',
              link: issue(160), 
            },
            {
              description: `Fixed randomized thumbnail missing from gallery categories page if subcategory is missing from book data.`,
              class: 'fixed',
              link: issue(159), 
            },
            {
              description: `Added tags to gallery categories page.`,
              class: 'fixed',
              link: issue(158), 
            },
            {
              description: `Fixed a bug where the sub category was not extracted.`,
              class: 'fixed',
              link: issue(157), 
            },
          ],
        },
        {
          version: 'v.0.2.11',
          highlights: `This mostly ended up being a bug fix release. It's recommended to remove all extracted data and do a full extraction after updating to this version. You may want to export raw data beforehand just to be safe.`,
          changes: [
            {
              description: `Added new audible domains to the extraction whitelist: ".es" and ".com.br"`,
              class: 'added',
            },
            {
              description: `Because of this issue where the extraction was interrupted and you were subsequently banned for the next 10-15 minutes I added a new button in the extraction settings where you may toggle on slow extraction that could help with such issues in the future. I also slowed down series extraction so that the regular (fast) extraction would work better. It might also make sense to try extracting library and wishlist separately.`,
              class: 'added',
              link: issue(110),  
            },
            {
              description: `The filter list now shows duration in years, months and days. Hovering over it shows what that is in hours. The duration is calculated from book length, which obviously doesn't count for re-listens, and discontinued don't have the data to calculate that.`,
              class: 'improved',
            },
            {
              description: `Some fields are no longer being extracted from the website.`,
              class: 'fixed',
              link: issue(154), 
            },
            {
              description: `Wishlist extraction doesn't work.`,
              class: 'fixed',
              link: issue(152), 
            },
            {
              description: `No Extraction Button.`,
              class: 'fixed',
              link: issue(151), 
            },
            {
              description: `Newly added items have no thumbnail when extracted.`,
              class: 'fixed',
              link: issue(150), 
            },
            {
              description: `Ratings" only captures the first digit.`,
              class: 'fixed',
              link: issue(147), 
            },
            {
              description: `Wallpaper Creator: star rating flowing into the next row, if cover size is relatively small.`,
              class: 'fixed',
              link: issue(145), 
            },
            {
              description: `Gallery (mobile): scroll swiping doesn't always work.`,
              class: 'fixed',
              link: issue(144), 
            },
            {
              description: `Gallery wishlist: pre-order book covers seem to be missing.`,
              class: 'fixed',
              link: issue(142), 
            },
            {
              description: `Gallery sorting sometimes highlights the wrong item.`,
              class: 'fixed',
              link: issue(141), 
            },
            {
              description: `Extract user's own written reviews. There's a filter in the gallery for books you've reviewed and theres a button above summary if your review is available for the book in question.`,
              class: 'added',
              link: issue(140, 'added'), 
            },
            {
              description: `Wishlist price sorter.`,
              class: 'added',
              link: issue(139, 'Added'), 
            },
            {
              description: `New range filter for wishlist price.`,
              class: 'added',
              link: issue(138, 'Added'), 
            },
            {
              description: `New filter for wishlist books that are on sale.`,
              class: 'added',
              link: issue(137, 'Added'), 
            },
            {
              description: `Number of ratings extracted with faulty data.`,
              class: 'fixed',
              link: issue(134), 
            },
            {
              description: `Book details: my books in the series list's owned counter counts wishlist books as owned.`,
              class: 'fixed',
              link: issue(131), 
            },
          ],
        },
        {
          version: 'v.0.2.10',
          highlights: ``,
          changes: [
            {
              description: `Search bar total books tooltip: added total listening time for the books in the selection.`,
              class: 'added',
            },
            {
              description: `Fixed an issue where collections page was visible in the navigation, even though it was empty.`,
              class: 'fixed',
            },
            {
              description: `Fixed an issue that could prevent the series sub page from loading in some cases.`,
              class: 'fixed',
            },
            {
              description: `It's not impossible but difficult to navigate back from book details "Links lead to my library" links.`,
              class: 'fixed',
              link: issue(127), 
            },
            {
              description: `Clock keeps spinning after all tasks completed.`,
              class: 'fixed',
              link: issue(130), 
            },
          ],
        },
        {
          version: 'v.0.2.9',
          highlights: `Full extraction recommended.`,
          changes: [
            {
              description: `Gallery book details: at the top right (above the book title) for switching between links leading to audible or the library`,
              class: 'improved',
            },
            {
              description: `Better series merging for discontinued books.`,
              class: 'improved',
            },
            {
              description: `Gallery: mobile usage has some minor improvements here and there; the mobile menu is a bit cleaner, you can copy a link to the current page in even if it's saved to your phone's home screen, which is when there's no addressbar or anything to copy it normally.`,
              class: 'improved',
            },
            {
              description: `Wallpaper creator: a new "tier list" mode and a clearer preset selector that shows up every time it's opened.`,
              class: 'added',
            },
            {
              description: `Gallery: collections now have some premade collections.`,
              class: 'improved',
            },
            {
              description: `Gallery: as of this version, the special "standalone gallery" cannot be viewed locally due to the build tool changes. This changes nothing for the extension gallery and you can still upload it to github or your own web server and it's work just as before.`,
              class: 'removed',
            },
            {
              description: `Extraction process: books will now be saved after extracting every book in the library or the wishlist. Also wishlist extraction happens just before wishlist is extracted.`,
              class: 'improved',
            },
            {
              description: `Gallery: all the filters with multi-select dropdown lists now have the option to exclude.`,
              class: 'added',
            },
            {
              description: `Gallery: the book details sidebar now lists any collections that the book belongs to, if any.`,
              class: 'added',
            },
            {
              description: `Gallery: book details carousel now has clickable labels that show you useful info. The labels are: "from this series", "book in library", "series in library", "book in wishlist", and all except the first one open a page of the gallery when clicked.`,
              class: 'added',
            },
            {
              description: `Gallery: the tooltip in the book details carousel is now grouped so that you can switch between books faster because you don't have to wait for the tooltip to close and the open for the next one all slowly.`,
              class: 'improved',
            },
            {
              description: `Gallery: rating sorts are now visually a bit nicer and also have a backup sort for when multiple books have an equal rating. The very basic logic is that more ratings gives more credibility to the rating, so if you have a "group" of books with the same rating, let's say 4; the first book will have the most ratings and the last book of the group will have the least ratings. Number of ratings sort uses the average rating as the second sort. Also, the area where you see the rating will in some cases contain extra ratings related info when hovered over or clicked on mobile.`,
              class: 'improved',
            },
            {
              description: `All important build tools were updated in this version, which involved breaking changes and involved a lot of revwrites, so keep an eye out for new and old issues.`,
              class: 'improved',
            },
            {
              description: `Up to this version the extension used to add global CSS styling that slightly modified the CSS in the library. It added very small unnoticable changes, like shifting text a little bit, but now it's fixed.`,
              class: 'fixed',
            },
            {
              description: `Converting progress text from German "Beendet" to English "Finished" `,
              class: 'fixed',
              link: issue(125), 
            },
            {
              description: `Series sub page shows false totals.`,
              class: 'fixed',
              link: issue(120), 
            },
            {
              description: `Missing extraction button on the library page.`,
              class: 'fixed',
              link: issue(111), 
            },
            {
              description: `Not extracting data for (library): authors, narrators or book numbers.`,
              class: 'fixed',
              link: issue(105), 
            },
            {
              description: `Extract podcasts too.`,
              class: 'fixed',
              link: issue(93), 
            },
            {
              description: `Need to login to extract wishlist. After login: "audible redirected you too many times".`,
              class: 'fixed',
              link: issue(92), 
            },
            {
              description: `Gallery filters: slider not working with other filters.`,
              class: 'fixed',
              link: issue(91), 
            },
            {
              description: `Wishlist cannot be extracted.`,
              class: 'fixed',
              link: issue(90), 
            },
            {
              description: `Collections: archived books no longer fetched.`,
              class: 'fixed',
              link: issue(89), 
            },
            {
              description: `Extractor Freezing on "Fetching series order".`,
              class: 'fixed',
              link: issue(87), 
            },
            {
              description: `Standalone gallery: saved with collections excluded (occasionally?) loads up blank.`,
              class: 'fixed',
              link: issue(81), 
            },
          ],
        },
        {
          version: 'v.0.2.8',
          highlights: `The "Audible Library Extractor" button in Audible's website now looks like a button and was moved above the search input, because Audible continually made small changes and it could no longer fit where it used to be.`,
          changes: [
            {
              description: `Extraction comes up with 20 books (single page). Note: audible changed things`,
              class: 'fixed',
              link: { text: 'Fixed #72', href: githubIssues+'72' }, 
            },
            {
              description: `Wishlist extraction discards all data and the wishlist gallery page comes up empty. Note: audible changed things`,
              class: 'fixed',
              link: { text: 'Fixed #71', href: githubIssues+'71' }, 
            },
            {
              description: `Wallpaper creator showing a blank page (if used hadn't extracted collections).`,
              class: 'fixed',
              link: { text: 'Fixed #69', href: githubIssues+'69' }, 
            },
            {
              description: `Some "unavailable" books not marked properly. Note: this bug was introduced in v.0.2.7`,
              class: 'fixed',
              link: { text: 'Fixed #68', href: githubIssues+'68' }, 
            },
            {
              description: `Top menu disappears sometimes on certain pages bug`,
              class: 'fixed',
              link: { text: 'Fixed #67', href: githubIssues+'67' }, 
            },
          ],
        },
        {
          version: 'v.0.2.7',
          highlights: `
            You should do a full extraction after updating to this version. There are a a few new data points that the partial extraction will not update to any old books.
            <br><br>
            I added global context menu items so you can easily open the gallery by right-clicking anywhere inside any tab and choose "Audible Library Extractor > Gallery page".
            <br><br>
            There's now a wallpaper creator in the extension gallery. Look for it in the top menu.
          `,
          changes: [
            {
              description: `Added import and export for raw data. Data is stored in your browser, but if you for example get a new computer you could export data on your current computer and import it on the new one and you don't have to do a full extraction.`,
              class: 'added'
            },
            {
              description: `Added dropdown list type filters, which allow you to filter books by properties like the language or format etc...`,
              class: 'added'
            },
            {
              description: `You can now collapse & expand book cover and information in the book details view.`,
              class: 'improved'
            },
            {
              description: `"My books in the library" list now shows you if any books you don't own are available in the Plus Catalog. Also you can now open book links to a new tab, which wasn't possible before. `,
              class: 'improved'
            },
            {
              description: "Added genre / theme tags. These are little pill shaped text btns you see below the summary on some store pages.",
              class: 'added'
            },
            {
              description: "Added better Archive handling. Filters and sorting for archived books. Standalone gallery now has an option to exclude archived books / archived collection.",
              class: 'added'
            },
            {
              description: "Added whispersync data: 1. Color dot on the covers if you own the Kindle version. 2. Whispersync filters 3. Whispersync sorters 4. Whispersync label inside the book details view",
              class: 'added'
            },
            {
              link: { text: 'Fixed #66', href: githubIssues+'66' }, 
              description: "Extraction can not complete: Cannot read properties of null (reading 'getAttribute').",
              class: 'fixed'
            },
            {
              link: { text: 'Added #62', href: githubIssues+'62' }, 
              description: 'Image editor (wallpaper generator).',
              class: 'added'
            },
            {
              link: { text: 'Fixed #60', href: githubIssues+'60' }, 
              description: '"Audible Library Extractor" text button is cut off in Audible library page.',
              class: 'fixed'
            },
            {
              link: { text: 'Fixed #56', href: githubIssues+'56' }, 
              description: "Wishlist extraction stops right when it's about to start.",
              class: 'fixed'
            },
            {
              link: { text: 'Fixed #54', href: githubIssues+'54' }, 
              description: "Partial library update doesn't merge old series data with new series data properly.",
              class: 'fixed'
            },
            {
              link: { text: 'Fixed #50', href: githubIssues+'50' }, 
              description: "Collections larger than 20 titles are not getting extracted properly.",
              class: 'fixed'
            },
            {
              link: { text: 'Fixed #49', href: githubIssues+'49' }, 
              description: "Sub pages don't show up in the the stand-alone gallery if you saved it with wishlist and any sub pages while excluding library.",
              class: 'fixed'
            },
            {
              link: { text: 'Fixed #48', href: githubIssues+'48' }, 
              description: "My books in the series list: links lead to empty pages inside the gallery (sometimes). Related to sub page source.",
              class: 'fixed'
            },
            {
              link: { text: 'Improved #47', href: githubIssues+'47' }, 
              description: "Merged the library data update button with the full extraction button. Now wishlist has a partial extraction too!",
              class: 'improved'
            },
            {
              link: { text: 'Fixed #46', href: githubIssues+'46' }, 
              description: "After opening a link to the gallery on a page with book details open, the next chunk of books would not load when scrolling far enough down.",
              class: 'fixed'
            },
          ],
        },
        {
          version: 'v.0.2.6',
          highlights: "If you want to filter wishlist by Plus Catalog titles, you'll have to extract the <strong>wishlist</strong> again. The 'My books in the series' list can now show all books in the series, but this too requires a full extraction of the <strong>library</strong>. <br><br>Performance improvement <a href='https://github.com/joonaspaakko/audible-library-extractor/issues/41'>#41</a> changes the way the books are loaded in: they are loaded in chunks as you scroll down. This unfortunately makes it so you can't just jump to the beginning of your library at the bottom like you could before. If you must, you can get around this: in the address bar you should see a url parameter like this '?y=347'. The number keeps track of how far you're scrolled. Change that to and obnoxiously high number, like '?y=9999999' and press enter or refresh the page and it will load the entire library at once.",
          changes: [
            { 
              link: { text: 'New documentation', href: 'https://joonaspaakko.gitbook.io/audible-library-extractor/' }, 
              description: '<a href="https://joonaspaakko.gitbook.io/audible-library-extractor/" target="_blank" rel="noopener noreferrer">https://joonaspaakko.gitbook.io/audible-library-extractor/</a>',
              highlight: true,
              class: 'info'
            },
            { 
              link: { text: 'Improved #25', href: githubIssues+'25' }, 
              description: 'Improved filters with range sliders and you can enable multiple filters at the same time',
              highlight: true,
              class: 'improved'
            },
            { 
              link: { text: 'Added #30', href: githubIssues+'30' }, 
              description: 'Stand-alone gallery save options that allow you to exclude pages',
              highlight: true,
              class: 'added'
            },
            { 
              link: { text: 'Added #26', href: githubIssues+'26' }, 
              description: 'CSV export (Importable: goodreads, googlesheets, excel, etc...)',
              highlight: true,
              class: 'added'
            },
            { 
              link: { text: 'Fixed #35', href: githubIssues+'35' }, 
              description: "Firefox: ISBN+Wishlist extraction stops the entire extraction process",
              highlight: true,
              class: 'fixed'
            },
            { 
              link: { text: 'Added #38', href: githubIssues+'38' }, 
              description: "Easier way to get back to the gallery (and Audible library) using the extension icon context menu",
              highlight: true,
              class: 'added'
            },
            { 
              link: { text: 'Improved #41', href: githubIssues+'41' }, 
              description: "Improved gallery performance, especially on slightly older mobile devices.",
              highlight: true,
              class: 'improved'
            },
            // {
            //   divider: true
            // },
            { 
              link: { text: 'Fixed #44', href: githubIssues+'44' }, 
              description: "Certain links to Audible not working due to missing encoding",
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #43', href: githubIssues+'43' }, 
              description: "Wishlist series hyperlink doesn't lead anywhere",
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #42', href: githubIssues+'42' }, 
              description: "Child category heading shows up in parent category page",
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #40', href: githubIssues+'40' }, 
              description: "Missing cover images causing various issues in the gallery (mostly affects long time Audible users)",
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #37', href: githubIssues+'37' }, 
              description: "Extension icon active state (color icon) is triggering whenever",
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #36', href: githubIssues+'36' }, 
              description: "Release date sorter not working on mobile (ios)",
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #34', href: githubIssues+'34' }, 
              description: 'Wishlist extraction stops and halts the whole extraction part 2',
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #33', href: githubIssues+'33' }, 
              description: 'Book details open in the wrong position breaking the grid at certain browser widths' ,
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #31', href: githubIssues+'31' }, 
              description: 'Sorting is taken over by search order If you have an active search and then change filters or search scope',
              class: 'fixed'
            },
          ]
        },
        {
          version: 'v.0.2.5',
          changes: [
            { 
              link: { text: 'Fixed #28', href: githubIssues+'28' }, 
              description: 'Series/sub page fails to show the right content',
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #27', href: githubIssues+'27' }, 
              description: 'The Great Courses (books) omitted',
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #24', href: githubIssues+'24' }, 
              description: 'Search overrides sorting URL parameter on page load',
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #23', href: githubIssues+'23' }, 
              description: 'Wishlist scraping errored out due to fetching second lvl domain names like “.co.uk” wrong',
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #22', href: githubIssues+'22' }, 
              description: 'Categories page empty (sometimes)',
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #21', href: githubIssues+'21' }, 
              description: 'View mode button showing up on pages it shouldn’t',
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #20', href: githubIssues+'20' }, 
              description: 'Filter and sorter menu disappearing behind the bottom mobile nav',
              class: 'fixed'
            },
            { 
              link: { text: 'Fixed #19', href: githubIssues+'19' }, 
              description: 'Partial library scan breaking series',
              class: 'fixed'
            },
          ]
        },
        {
          version: 'v.0.2.4',
          changes: [
            { description: 'First public beta version' }
          ]
        }
      ]
      
    }
  }
};
