
let githubIssues = 'https://github.com/joonaspaakko/audible-library-extractor/issues/';

export default {
  data: function() {
    return {
      
      changeLog: [
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
