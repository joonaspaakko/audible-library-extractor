
let githubIssues = 'https://github.com/joonaspaakko/audible-library-extractor/issues/';

export default {
  data: function() {
    return {

      changeLog: [
        {
          version: 'v.1.0.0',
          highlights: `Full extraction recommended due to data structure changes and store page fixes that restore previously lost data. This is a major release featuring direct GitHub uploads, a completely overhauled collage maker (formerly the wallpaper creator), and many more improvements. More changes are planned before this release is finalized.`,
          categories: [
            {
              label: 'Extraction',
              items: [
                {
                  title: `Fixed documentation button in extraction settings and right-click context menu not working.`,
                  type: 'fixed',
                  issue: 165,
                },
                {
                  title: `Fixed merging discontinued books with series.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed/cleaned up store page release date fetching.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed extractions sometimes saving an empty result.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed fetching "people also bought" carousel data.`,
                  type: 'fixed',
                  issue: 180,
                },
                {
                  title: `Fixed plus catalog availability from wishlist books.`,
                  description: `A class was changed on Audible's end.`,
                  type: 'fixed',
                  issue: 181,
                },
                {
                  title: `Fixed wishlist extraction failing and gallery not opening after library extraction.`,
                  type: 'fixed',
                  issue: 178,
                },
                {
                  title: `Now extracts the purchase date (added date) from purchase history.`,
                  description: `Comes with a matching filter and sorter in the gallery.`,
                  type: 'added',
                },
                {
                  title: `Migrated data structure from library.books to audibledata.library for better management.`,
                  description: `Automatic migration for old data structures on first load. This change isn't really visible to users, but I wanted to mention it just as a heads up: this is a big structural change that touches just about every step of the extraction process and how data is displayed in the gallery, so it could potentially cause issues here and there.`,
                  type: 'improved',
                },
                {
                  title: `Store page added extraction failsafes.`,
                  type: 'improved',
                },
                {
                  title: `Reduced the number of requests needed for series extraction.`,
                  description: `Should stabilize the extraction process by quite a bit.`,
                  type: 'improved',
                  issue: 169,
                },
              ],
            },
            {
              label: 'Gallery',
              items: [
                {
                  title: `Fixed animated background grid's last row not always being a full row.`,
                  type: 'fixed',
                  issue: 167,
                },
                {
                  title: `Series sub page removed deduped total to reduce confusion.`,
                  description: `There was a disparity between the total on the series list sub page and what you'd see in each individual series page.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed minor standalone gallery load errors.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed carousel gallery rendering.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed randomized sample covers on category pages being squished when they don't fit on screen.`,
                  description: `Decided to handle this by letting it overflow and function like a manually scrollable carousel instead.`,
                  type: 'fixed',
                  issue: 161,
                },
                {
                  title: `Fixed "my reviews" section above the summary causing content overflow on mobile.`,
                  type: 'fixed',
                  issue: 162,
                },
                {
                  title: `Fixed typo "unkown" → "unknown".`,
                  type: 'fixed',
                  issue: 187,
                },
                {
                  title: `Added direct GitHub upload to the standalone gallery save modal.`,
                  description: `No more manually downloading zips and uploading them to GitHub yourself.`,
                  type: 'added',
                },
                {
                  title: `Added many new filters for sub pages.`,
                  type: 'added',
                },
                {
                  title: `Added reset button for sub page filters.`,
                  type: 'added',
                },
                {
                  title: `Added a "covers per row" setting to grid view.`,
                  type: 'added',
                },
                {
                  title: `Added a "cover size" setting to grid view.`,
                  type: 'added',
                },
                {
                  title: `Added a list/stacked details mode to grid view.`,
                  type: 'added',
                },
                {
                  title: `Added a secondary sort value to grid view.`,
                  description: `For example, you can still see the book series name while sorting by length.`,
                  type: 'added',
                },
                {
                  title: `Added a segmented side scroller with a position label.`,
                  description: `Shows how far you're scrolled and also works as a quick jump to any part of the page.`,
                  type: 'added',
                },
                {
                  title: `Added search autocomplete with suggestions that also understand inline @scopes.`,
                  type: 'added',
                },
                {
                  title: `The standalone gallery now packs heavier book data into a handful of ~1MB chunk files.`,
                  description: `Summaries and carousel data used to be saved as thousands of tiny per-book files. Chunking makes GitHub uploads and page loads a lot faster. Chunks are also stored in IndexedDB to reduce file fetching.`,
                  type: 'improved',
                },
                {
                  title: `Global settings are now available on any page and open in a drawer.`,
                  description: `Previously they only lived inside the book details view.`,
                  type: 'improved',
                },
                {
                  title: `Reworked the extension tools menu.`,
                  type: 'improved',
                },
                {
                  title: `Replaced the cover blurb hot corner with a long press that lets you drag across multiple covers.`,
                  description: `Works on desktop and mobile.`,
                  type: 'improved',
                },
                {
                  title: `All views now use virtual scrolling for much better scrolling performance.`,
                  description: `Applies to grid, spreadsheet, sub pages and collections.`,
                  type: 'improved',
                },
                {
                  title: `Rewrote search, replacing Fuse with MiniSearch.`,
                  description: `Faster and supports advanced operators: exact match, exclude, starts/ends with, exact phrases, OR, and inline @scopes.`,
                  type: 'improved',
                },
                {
                  title: `Range slider now steps by one increment when clicking min/max labels.`,
                  description: `Previously it snapped straight to the absolute min/max.`,
                  type: 'improved',
                },
                {
                  title: `Animated background grid now loads in more gently.`,
                  description: `It waits for its images and lets the page content load first before it starts animating, so it doesn't slow down the initial page load.`,
                  type: 'improved',
                },
                {
                  title: `Animated background grid no longer flickers when foreground books are hovered over.`,
                  type: 'improved',
                },
                {
                  title: `Animated background grid added more variability and randomness when you don't have many covers.`,
                  type: 'improved',
                },
                {
                  title: `Changed tooltip styles.`,
                  type: 'improved',
                },
                {
                  title: `Book details: brought back sideways swipe to move between books.`,
                  type: 'improved',
                },
                {
                  title: `Book details: links now default to the gallery.`,
                  description: `Links that lead to Audible get an external link icon.`,
                  type: 'improved',
                },
                {
                  title: `The "formulas" CSV export now uses the XLSX file format.`,
                  description: `Retains formula compatibility with Google Sheets. Should also work with Excel.`,
                  type: 'improved',
                  issue: 133,
                },
              ],
            },
            {
              label: 'Collage maker',
              items: [
                {
                  title: `Fixed ERR_INSUFFICIENT_RESOURCES when exporting images with many covers (+400).`,
                  type: 'fixed',
                  issue: 163,
                },
                {
                  title: `Fixed text element control box visibility.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed text element snapping.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed selecting a text element inside the right side panel de-selecting it immediately.`,
                  type: 'fixed',
                },
                {
                  title: `Text elements auto-reserve whitespace on canvas sides based on orientation and location.`,
                  description: `Makes it easier to add text without having to figure out how to make space for it.`,
                  type: 'added',
                },
                {
                  title: `Replaced old toast notifications with a "notification center" panel.`,
                  description: `Makes it a bit easier to show multiple tips on how you can interact with the editor.`,
                  type: 'added',
                },
                {
                  title: `Added panning mode indicator.`,
                  description: `Holding down spacebar allows you to always pan across any elements.`,
                  type: 'added',
                },
                {
                  title: `Added right-click context menu for relisten and hide actions.`,
                  description: `"Remove" was changed to "hide" using the pre-existing tier-list hide container.`,
                  type: 'added',
                },
                {
                  title: `Added momentum to canvas panning.`,
                  type: 'added',
                },
                {
                  title: `Renamed the "Wallpaper creator" to "Collage maker".`,
                  type: 'improved',
                },
                {
                  title: `The gallery menu button now prompts you to pick a source on pages with no books.`,
                  description: `Previously it was just disabled.`,
                  type: 'improved',
                },
                {
                  title: `Improved zooming with the scroll wheel.`,
                  description: `Changed it to center to the cursor.`,
                  type: 'improved',
                },
                {
                  title: `Constrained canvas panning so you can't shoot past the canvas into infinity.`,
                  type: 'improved',
                },
                {
                  title: `Settings panel sliders and rapidly changing number inputs now work smoother with a large amount of covers.`,
                  type: 'improved',
                },
                {
                  title: `Export settings now appear in a dialog before every save.`,
                  type: 'improved',
                },
                {
                  title: `Options panel now has collapsible sections, collapsed by default.`,
                  description: `Better informs users about each option.`,
                  type: 'improved',
                },
                {
                  title: `Double-clicking any side of a text bounding box moves that side to a corresponding canvas edge.`,
                  description: `With some exceptions.`,
                  type: 'improved',
                },
                {
                  title: `Hovering over "cover padding" + "canvas padding" headings in the options panel now shows the current padding in the canvas.`,
                  type: 'improved',
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.12',
          highlights: `Full extraction recommended in order to extract subcategories.`,
          categories: [
            {
              items: [
                {
                  title: `Gallery (mobile): vertical scrolling doesn't always work with book details open.`,
                  type: 'fixed',
                  issue: 144,
                },
                {
                  title: `Fixed publisher subpage in the gallery failing to open if any book is missing publishers.`,
                  type: 'fixed',
                  issue: 160,
                },
                {
                  title: `Fixed randomized thumbnail missing from gallery categories page if subcategory is missing from book data.`,
                  type: 'fixed',
                  issue: 159,
                },
                {
                  title: `Added tags to gallery categories page.`,
                  type: 'added',
                  issue: 158,
                },
                {
                  title: `Fixed a bug where the sub category was not extracted.`,
                  type: 'fixed',
                  issue: 157,
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.11',
          highlights: `This mostly ended up being a bug fix release. It's recommended to remove all extracted data and do a full extraction after updating to this version. You may want to export raw data beforehand just to be safe.`,
          categories: [
            {
              items: [
                {
                  title: `Added new audible domains to the extraction whitelist: ".es" and ".com.br"`,
                  type: 'added',
                },
                {
                  title: `Added a slow extraction toggle in the extraction settings.`,
                  description: `Because of an issue where the extraction was interrupted and you were subsequently banned for the next 10-15 minutes, I added a new button in the extraction settings to toggle on slow extraction, which could help with such issues in the future. I also slowed down series extraction so that the regular (fast) extraction would work better. It might also make sense to try extracting library and wishlist separately.`,
                  type: 'added',
                  issue: 110,
                },
                {
                  title: `The filter list now shows duration in years, months and days.`,
                  description: `Hovering over it shows what that is in hours. The duration is calculated from book length, which obviously doesn't count for re-listens, and discontinued books don't have the data to calculate that.`,
                  type: 'improved',
                },
                {
                  title: `Some fields are no longer being extracted from the website.`,
                  type: 'fixed',
                  issue: 154,
                },
                {
                  title: `Wishlist extraction doesn't work.`,
                  type: 'fixed',
                  issue: 152,
                },
                {
                  title: `No extraction button.`,
                  type: 'fixed',
                  issue: 151,
                },
                {
                  title: `Newly added items have no thumbnail when extracted.`,
                  type: 'fixed',
                  issue: 150,
                },
                {
                  title: `"Ratings" only captures the first digit.`,
                  type: 'fixed',
                  issue: 147,
                },
                {
                  title: `Wallpaper creator: star rating flowing into the next row if cover size is relatively small.`,
                  type: 'fixed',
                  issue: 145,
                },
                {
                  title: `Gallery (mobile): scroll swiping doesn't always work.`,
                  type: 'fixed',
                  issue: 144,
                },
                {
                  title: `Gallery wishlist: pre-order book covers seem to be missing.`,
                  type: 'fixed',
                  issue: 142,
                },
                {
                  title: `Gallery sorting sometimes highlights the wrong item.`,
                  type: 'fixed',
                  issue: 141,
                },
                {
                  title: `Extract your own written reviews.`,
                  description: `There's a filter in the gallery for books you've reviewed and a button above the summary if your review is available for the book in question.`,
                  type: 'added',
                  issue: 140,
                },
                {
                  title: `Wishlist price sorter.`,
                  type: 'added',
                  issue: 139,
                },
                {
                  title: `New range filter for wishlist price.`,
                  type: 'added',
                  issue: 138,
                },
                {
                  title: `New filter for wishlist books that are on sale.`,
                  type: 'added',
                  issue: 137,
                },
                {
                  title: `Number of ratings extracted with faulty data.`,
                  type: 'fixed',
                  issue: 134,
                },
                {
                  title: `Book details: my books in the series list's owned counter counts wishlist books as owned.`,
                  type: 'fixed',
                  issue: 131,
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.10',
          categories: [
            {
              items: [
                {
                  title: `Search bar total books tooltip: added total listening time for the books in the selection.`,
                  type: 'added',
                },
                {
                  title: `Fixed an issue where the collections page was visible in the navigation even though it was empty.`,
                  type: 'fixed',
                },
                {
                  title: `Fixed an issue that could prevent the series sub page from loading in some cases.`,
                  type: 'fixed',
                },
                {
                  title: `It's difficult to navigate back from book details "Links lead to my library" links.`,
                  type: 'fixed',
                  issue: 127,
                },
                {
                  title: `Clock keeps spinning after all tasks completed.`,
                  type: 'fixed',
                  issue: 130,
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.9',
          highlights: `Full extraction recommended.`,
          categories: [
            {
              items: [
                {
                  title: `Book details: added a switch at the top right (above the book title) for switching between links leading to Audible or the library.`,
                  type: 'improved',
                },
                {
                  title: `Better series merging for discontinued books.`,
                  type: 'improved',
                },
                {
                  title: `Mobile usage improvements.`,
                  description: `The mobile menu is a bit cleaner, and you can copy a link to the current page even if it's saved to your phone's home screen, which is when there's no address bar to copy it from normally.`,
                  type: 'improved',
                },
                {
                  title: `Wallpaper creator: new "tier list" mode and a clearer preset selector that shows up every time it's opened.`,
                  type: 'added',
                },
                {
                  title: `Collections now have some premade collections.`,
                  type: 'improved',
                },
                {
                  title: `The special "standalone gallery" can no longer be viewed locally due to build tool changes.`,
                  description: `This changes nothing for the extension gallery. You can still upload it to GitHub or your own web server and it works just as before.`,
                  type: 'removed',
                },
                {
                  title: `Books are now saved after extracting every book in the library or the wishlist.`,
                  description: `Wishlist extraction also now happens just before the wishlist is extracted.`,
                  type: 'improved',
                },
                {
                  title: `All filters with multi-select dropdown lists now have the option to exclude.`,
                  type: 'added',
                },
                {
                  title: `The book details sidebar now lists any collections that the book belongs to, if any.`,
                  type: 'added',
                },
                {
                  title: `Book details carousel now has clickable labels that show you useful info.`,
                  description: `The labels are: "from this series", "book in library", "series in library", "book in wishlist", and all except the first one open a page of the gallery when clicked.`,
                  type: 'added',
                },
                {
                  title: `The tooltip in the book details carousel is now grouped.`,
                  description: `Lets you switch between books faster because you don't have to wait for the tooltip to close and then open again slowly for the next one.`,
                  type: 'improved',
                },
                {
                  title: `Rating sorts are now visually a bit nicer and have a backup sort for when multiple books have an equal rating.`,
                  description: `More ratings gives more credibility to the rating, so within a "group" of books with the same rating, the first book will have the most ratings and the last will have the least. Number of ratings sort uses the average rating as the second sort. The area where you see the rating will in some cases also contain extra ratings info when hovered over or clicked on mobile.`,
                  type: 'improved',
                },
                {
                  title: `All important build tools were updated in this version.`,
                  description: `Involved breaking changes and a lot of rewrites, so keep an eye out for new and old issues.`,
                  type: 'improved',
                },
                {
                  title: `Removed the small unintended global CSS changes the extension used to apply to the library.`,
                  description: `Things like text shifting a tiny, barely noticeable amount.`,
                  type: 'fixed',
                },
                {
                  title: `Converting progress text from German "Beendet" to English "Finished".`,
                  type: 'fixed',
                  issue: 125,
                },
                {
                  title: `Series sub page shows false totals.`,
                  type: 'fixed',
                  issue: 120,
                },
                {
                  title: `Missing extraction button on the library page.`,
                  type: 'fixed',
                  issue: 111,
                },
                {
                  title: `Not extracting data for (library): authors, narrators or book numbers.`,
                  type: 'fixed',
                  issue: 105,
                },
                {
                  title: `Extract podcasts too.`,
                  type: 'fixed',
                  issue: 93,
                },
                {
                  title: `Need to login to extract wishlist. After login: "audible redirected you too many times".`,
                  type: 'fixed',
                  issue: 92,
                },
                {
                  title: `Gallery filters: slider not working with other filters.`,
                  type: 'fixed',
                  issue: 91,
                },
                {
                  title: `Wishlist cannot be extracted.`,
                  type: 'fixed',
                  issue: 90,
                },
                {
                  title: `Collections: archived books no longer fetched.`,
                  type: 'fixed',
                  issue: 89,
                },
                {
                  title: `Extractor freezing on "Fetching series order".`,
                  type: 'fixed',
                  issue: 87,
                },
                {
                  title: `Standalone gallery: saved with collections excluded (occasionally?) loads up blank.`,
                  type: 'fixed',
                  issue: 81,
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.8',
          highlights: `The "Audible Library Extractor" button in Audible's website now looks like a button and was moved above the search input, because Audible continually made small changes and it could no longer fit where it used to be.`,
          categories: [
            {
              items: [
                {
                  title: `Extraction comes up with 20 books (single page).`,
                  description: `Note: Audible changed things.`,
                  type: 'fixed',
                  issue: 72,
                },
                {
                  title: `Wishlist extraction discards all data and the wishlist gallery page comes up empty.`,
                  description: `Note: Audible changed things.`,
                  type: 'fixed',
                  issue: 71,
                },
                {
                  title: `Wallpaper creator showing a blank page if user hadn't extracted collections.`,
                  type: 'fixed',
                  issue: 69,
                },
                {
                  title: `Some "unavailable" books not marked properly.`,
                  description: `Note: this bug was introduced in v.0.2.7.`,
                  type: 'fixed',
                  issue: 68,
                },
                {
                  title: `Top menu disappears sometimes on certain pages.`,
                  type: 'fixed',
                  issue: 67,
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.7',
          highlights: `
            You should do a full extraction after updating to this version. There are a few new data points that the partial extraction will not update on any old books.
            <br><br>
            I added global context menu items so you can easily open the gallery by right-clicking anywhere inside any tab and choosing "Audible Library Extractor > Gallery page".
            <br><br>
            There's now a wallpaper creator in the extension gallery. Look for it in the top menu.
          `,
          categories: [
            {
              items: [
                {
                  title: `Added import and export for raw data.`,
                  description: `Data is stored in your browser, but if you for example get a new computer you could export data on your current computer and import it on the new one instead of doing a full extraction.`,
                  type: 'added',
                },
                {
                  title: `Added dropdown list type filters.`,
                  description: `Lets you filter books by properties like language or format.`,
                  type: 'added',
                },
                {
                  title: `You can now collapse & expand book cover and information in the book details view.`,
                  type: 'improved',
                },
                {
                  title: `"My books in the library" list now shows if any books you don't own are available in the Plus Catalog.`,
                  description: `You can also now open book links in a new tab, which wasn't possible before.`,
                  type: 'improved',
                },
                {
                  title: `Added genre / theme tags.`,
                  description: `These are little pill shaped text buttons you see below the summary on some store pages.`,
                  type: 'added',
                },
                {
                  title: `Added better archive handling.`,
                  description: `Filters and sorting for archived books. Standalone gallery now has an option to exclude archived books / the archived collection.`,
                  type: 'added',
                },
                {
                  title: `Added whispersync data.`,
                  description: `A color dot on the covers if you own the Kindle version, whispersync filters, whispersync sorters, and a whispersync label inside the book details view.`,
                  type: 'added',
                },
                {
                  title: `Extraction can not complete: Cannot read properties of null (reading 'getAttribute').`,
                  type: 'fixed',
                  issue: 66,
                },
                {
                  title: `Image editor (wallpaper generator).`,
                  type: 'added',
                  issue: 62,
                },
                {
                  title: `"Audible Library Extractor" text button is cut off in the Audible library page.`,
                  type: 'fixed',
                  issue: 60,
                },
                {
                  title: `Wishlist extraction stops right when it's about to start.`,
                  type: 'fixed',
                  issue: 56,
                },
                {
                  title: `Partial library update doesn't merge old series data with new series data properly.`,
                  type: 'fixed',
                  issue: 54,
                },
                {
                  title: `Collections larger than 20 titles are not getting extracted properly.`,
                  type: 'fixed',
                  issue: 50,
                },
                {
                  title: `Sub pages don't show up in the stand-alone gallery if saved with wishlist and any sub pages while excluding library.`,
                  type: 'fixed',
                  issue: 49,
                },
                {
                  title: `My books in the series list: links lead to empty pages inside the gallery (sometimes).`,
                  description: `Related to sub page source.`,
                  type: 'fixed',
                  issue: 48,
                },
                {
                  title: `Merged the library data update button with the full extraction button.`,
                  description: `Now wishlist has a partial extraction too!`,
                  type: 'improved',
                  issue: 47,
                },
                {
                  title: `After opening a link to the gallery on a page with book details open, the next chunk of books wouldn't load when scrolling far enough down.`,
                  type: 'fixed',
                  issue: 46,
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.6',
          highlights: `If you want to filter wishlist by Plus Catalog titles, you'll have to extract the <strong>wishlist</strong> again. The "My books in the series" list can now show all books in the series, but this too requires a full extraction of the <strong>library</strong>. <br><br>Performance improvement <a href='${ githubIssues }41' target='_blank' rel='noopener noreferrer'>#41</a> changes the way books are loaded in: they're loaded in chunks as you scroll down. This unfortunately means you can't just jump to the beginning of your library at the bottom like you could before. If you must, there's a workaround: in the address bar you should see a url parameter like this "?y=347". The number keeps track of how far you're scrolled. Change it to an obnoxiously high number, like "?y=9999999", and press enter or refresh the page and it will load the entire library at once.`,
          categories: [
            {
              items: [
                {
                  title: `New documentation`,
                  description: `<a href="https://joonaspaakko.gitbook.io/audible-library-extractor/" target="_blank" rel="noopener noreferrer">https://joonaspaakko.gitbook.io/audible-library-extractor/</a>`,
                  type: 'info',
                },
                {
                  title: `Improved filters with range sliders and you can enable multiple filters at the same time.`,
                  type: 'improved',
                  issue: 25,
                },
                {
                  title: `Stand-alone gallery save options that allow you to exclude pages.`,
                  type: 'added',
                  issue: 30,
                },
                {
                  title: `CSV export.`,
                  description: `Importable: Goodreads, Google Sheets, Excel, etc.`,
                  type: 'added',
                  issue: 26,
                },
                {
                  title: `Firefox: ISBN+Wishlist extraction stops the entire extraction process.`,
                  type: 'fixed',
                  issue: 35,
                },
                {
                  title: `Easier way to get back to the gallery (and Audible library) using the extension icon context menu.`,
                  type: 'added',
                  issue: 38,
                },
                {
                  title: `Improved gallery performance, especially on slightly older mobile devices.`,
                  type: 'improved',
                  issue: 41,
                },
                {
                  title: `Certain links to Audible not working due to missing encoding.`,
                  type: 'fixed',
                  issue: 44,
                },
                {
                  title: `Wishlist series hyperlink doesn't lead anywhere.`,
                  type: 'fixed',
                  issue: 43,
                },
                {
                  title: `Child category heading shows up in parent category page.`,
                  type: 'fixed',
                  issue: 42,
                },
                {
                  title: `Missing cover images causing various issues in the gallery.`,
                  description: `Mostly affects long time Audible users.`,
                  type: 'fixed',
                  issue: 40,
                },
                {
                  title: `Extension icon active state (color icon) is triggering whenever.`,
                  type: 'fixed',
                  issue: 37,
                },
                {
                  title: `Release date sorter not working on mobile (iOS).`,
                  type: 'fixed',
                  issue: 36,
                },
                {
                  title: `Wishlist extraction stops and halts the whole extraction part 2.`,
                  type: 'fixed',
                  issue: 34,
                },
                {
                  title: `Book details open in the wrong position, breaking the grid at certain browser widths.`,
                  type: 'fixed',
                  issue: 33,
                },
                {
                  title: `Sorting is taken over by search order if you have an active search and then change filters or search scope.`,
                  type: 'fixed',
                  issue: 31,
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.5',
          categories: [
            {
              items: [
                {
                  title: `Series/sub page fails to show the right content.`,
                  type: 'fixed',
                  issue: 28,
                },
                {
                  title: `The Great Courses (books) omitted.`,
                  type: 'fixed',
                  issue: 27,
                },
                {
                  title: `Search overrides sorting URL parameter on page load.`,
                  type: 'fixed',
                  issue: 24,
                },
                {
                  title: `Wishlist scraping errored out due to fetching second level domain names like ".co.uk" wrong.`,
                  type: 'fixed',
                  issue: 23,
                },
                {
                  title: `Categories page empty (sometimes).`,
                  type: 'fixed',
                  issue: 22,
                },
                {
                  title: `View mode button showing up on pages it shouldn't.`,
                  type: 'fixed',
                  issue: 21,
                },
                {
                  title: `Filter and sorter menu disappearing behind the bottom mobile nav.`,
                  type: 'fixed',
                  issue: 20,
                },
                {
                  title: `Partial library scan breaking series.`,
                  type: 'fixed',
                  issue: 19,
                },
              ],
            },
          ],
        },
        {
          version: 'v.0.2.4',
          categories: [
            {
              items: [
                { title: `First public beta version`, type: 'info' },
              ],
            },
          ],
        },
      ],

    };
  },
  methods: {
    changelogIssueUrl: function( issue ) {
      return githubIssues + issue;
    },
  },
};
