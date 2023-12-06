
let githubIssues = 'https://github.com/joonaspaakko/audible-library-extractor/issues/';

function issue( number ) {
 return { text: 'Fixed #'+number, href: githubIssues+number }; 
}

export default {
  data: function() {
    return {
      
      changeLog: [
        {
          version: 'v.0.2.11',
          highlights: `Requires a full library extraction to fix number of ratings. Wishlist should update them just fine with just the partial extraction.`,
          changes: [
            {
              description: `Gallery sorting sometimes highlights the wrong item.`,
              class: 'fixed',
              link: issue(141), 
            },
            {
              description: `Not extracting wishlist pre-order covers.`,
              class: 'fixed',
              link: issue(142), 
            },
            {
              description: `Wishlist price sorter.`,
              class: 'added',
              link: issue(139), 
            },
            {
              description: `New range filter for wishlist price.`,
              class: 'added',
              link: issue(138), 
            },
            {
              description: `New filter for wishlist books that are on sale.`,
              class: 'added',
              link: issue(137), 
            },
            {
              description: `Number of ratings extracted with faulty data.`,
              class: 'fixed',
              link: issue(134), 
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
              description: `Extraction provess: books will now be saved after extracting every book in the library or the wishlist. Also wishlist extraction happens just before wishlist is extracted.`,
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
            I added global context menu items so you can easily open the gallery by right-clicking anywhere inside any tab and choose "Audible Library Extracor > Gallery page".
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
              description: 'Filter and sorter menu disappearing behing the bottom mobile nav',
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
