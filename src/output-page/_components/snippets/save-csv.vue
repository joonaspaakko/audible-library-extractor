<template>
  <div class="export-group">

    <h2><font-awesome :icon="['fas', 'file-csv']" /> CSV (Spreadsheet)</h2>

    <div class="description">
      CSV is a generic file format for tabular data that is supported by any proper spreadsheet application. That said Excels CSV import is not the greatest. My recommendation would be Google Sheets, but if you want to have it in a desktop application, my recommendation would be Libre Office.
    </div>

    <h3>Data source:</h3>

    <div class="options">
      <label v-for="source in settings.dataSources" :key="source.key" v-tippy="{ allowHTML: true, maxWidth: 500 }" :content="source.tippy">
        <input type="radio" name="dataSources" v-model="settings.dataSourcesChecked" :value="source.key" @change="inputChanged"> {{ source.key }}
      </label>
    </div>

    <h3>Compatibility:</h3>

    <div class="options">
      <label v-for="item in settings.compatibility" :key="item.key" v-tippy="{ allowHTML: true, maxWidth: 500 }" :content="item.tippy">
        <input type="radio" name="compatibility" v-model="settings.compatibilityChecked" :value="item.key" @change="inputChanged"> {{ item.key }}
      </label>
    </div>

    <div class="buttons-footer">
      <div class="btn-wrapper">
        <button class="save-btn" style="background-color: #0e9d59; border-color: #0e9d59 !important;" @click="saveButtonClicked"  :class="{ saving: bundling }" :disabled="bundling || !saveBtnEnabled">
          <span>{{ filename}}</span>
          <i class="fas fa-download"></i>
        </button>
        
        <div>
          <a class="github-btn" target="_blank" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/csv-export#import-to-google-sheets"> 
            <span>Google Sheets import</span>
            <font-awesome :icon="['fas', 'share-square']" />
          </a>
          <a class="github-btn" target="_blank" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/csv-export#import-to-goodreads"> 
            <span>Goodreads import</span>
            <font-awesome :icon="['fab', 'goodreads']" />
          </a>
        </div>
        
      </div>
    </div>
    
  </div>
</template>

<script>

import stringifyArray from "@output-mixins/stringifyArray";
import makeCoverUrl from "@output-mixins/makeCoverUrl";
import makeUrl from "@output-mixins/makeFullUrl";
import prepareKeys from "@output-mixins/prepareKeys.js";
import slugify from "@output-mixins/slugify";
import makeGoodReadsUrl from "@output-mixins/goodReadsSearchUrl";

export default {
  name: "saveCsv",
  mixins: [stringifyArray, makeCoverUrl, makeUrl, prepareKeys, slugify, makeGoodReadsUrl],
  mounted: function() {
    
    if ( this.$store.state.sticky.exportSettingsCSVdataSources ) {
      this.settings.dataSourcesChecked = this.$store.state.sticky.exportSettingsCSVdataSources;
    }
    if ( this.$store.state.sticky.exportSettingsCSVcompatibility ) {
      this.settings.compatibilityChecked = this.$store.state.sticky.exportSettingsCSVcompatibility;
    }
    
  },
  data: function() {
    return {
      settings: {
        dataSourcesChecked: 'Library',
        dataSources: [
          { key: 'Library' },
          { key: 'Wishlist' },
          { key: 'Current list', tippy: 'What you see is what you get. For example, in a series sub page this option would export the entire series as listed, unless you modify it by adding filters or by searching. Will be exported with the active sorting. <strong>This data source only works on gallery pages with books.</strong>' },
        ],
        compatibilityChecked: 'Google Sheets',
        compatibility: [
          { key: 'Google Sheets', tippy: "<strong>Google Sheets compatible formulas:</strong> <ul><li>Cover image + link to the store page in Audible</li><li>Sample audio icon + link</li><li>Web player icon + link</li><li>Goodreads search icon + link</li><li>Title has a link to store page in Audible</li></ul>" },
          { key: 'Raw data', tippy: "Basically the same as the Google Sheets output but without the formulas. If you don't like formulas, this would also work just as well in Google Sheets." },
          { key: 'Goodreads', tippy: "Removes any books that don't have ISBNs because Goodreads won't import without it. Each book is imported in bookshelves as per their status: not started (to-read), started(currently-reading), finished (read). The categories are divided into shelves as well." },
        ] 
      },
      bundling: false,
    };
  },
  
  computed: {
    
    googleSheets: function() {
      return this.settings.compatibilityChecked === 'Google Sheets';
    },
    
    filename: function() {
      
      let suffix = '';
      if ( this.settings.dataSourcesChecked === 'Library' ) {
        suffix = 'library';
      }
      else if ( this.settings.dataSourcesChecked === 'Wishlist' ) {
        suffix = 'wishlist';
      }
      else if ( this.settings.dataSourcesChecked === 'Current list' ) {
        let pageTitle = this.$store.state.pageTitle ? this.slugify( this.$store.state.pageTitle ) : null;
        let routeName =  this.$route.name;
        if ( routeName === 'gallery' ) routeName = 'library';
        suffix = pageTitle || routeName;
      }
      
      if ( suffix !== '' ) suffix = '-' + suffix;
      
      return "ALE-spreadsheet"+suffix+".csv";
      
    },
    
    dataSource: function() {
      switch ( this.settings.dataSourcesChecked ) {
        case "Library":
          return this.$store.state.library.books;
          break;
        case "Wishlist":
          return this.$store.state.library.wishlist;
          break;
        case "Current list":
          return this.$store.getters.collection;
          break;
      }
      
    },
    
    saveBtnEnabled: function() {
      if ( this.settings.dataSourcesChecked === 'Current list' ) {
        if ( this.$route.meta.gallery ) return true;
      }
      else if ( this.settings.dataSourcesChecked === 'Wishlist' && this.settings.compatibilityChecked === 'Goodreads' ) {
        return false;
      }
      else {
        return this.dataSource && this.dataSource.length > 0;
      }
    },
    
  },
  
  methods: {
    saveButtonClicked: function() {
      if ( !this.bundling ) {
        
        const vue = this;
        vue.bundling = true;
        
        let dataSource = JSON.parse(JSON.stringify(this.dataSource));
        let keys = this.prepKeys( dataSource );
        
        let csv = Papa.unparse({
          fields: _.map( keys, function( key ) { return (key === 'isbn10' && key === 'isbn13') ? key.toUpperCase() : _.startCase(key); }),
          data: this.processData( keys, dataSource ),
          quotes: false, //or array of booleans
          quoteChar: '"',
          escapeChar: '"',
          delimiter: ",",
          header: true,
          newline: "\r\n",
          skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
          columns: null, //or array of strings
        });
        
        // console.log('%c' + ' csv ' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;', csv);
        
        saveAs(new File([csv], {type: "text/csv;charset=utf-8"}), this.filename);
        
        setTimeout(function() {
          vue.bundling = false;
        }, 1000);
        
      }
    },
    
    inputChanged: function( e ) {
      
      if ( this.$store.state.sticky.exportSettingsCSVdataSources !== this.settings.dataSourcesChecked ) {
        this.$store.commit('stickyProp', { key: 'exportSettingsCSVdataSources', value: this.settings.dataSourcesChecked });
      }
      if ( this.$store.state.sticky.exportSettingsCSVcompatibility !== this.settings.compatibilityChecked ) {
        this.$store.commit('stickyProp', { key: 'exportSettingsCSVcompatibility', value: this.settings.compatibilityChecked });
      }
      
      
    },
    
    processData: function( keys, dataSource ) {
      
      let vue = this;
      
      if ( this.$store.state.sticky.exportSettingsCSVcompatibility === 'Goodreads' ) {
        return this.processDataGoodreads( keys, dataSource);
      }
      else {
        return _.map( dataSource, function( book ) {
          return _.map(keys, function( key ) {
            
            switch ( key ) {
              case "authors":
              case "narrators":
              case "categories":
              case "publishers":
                // console.log( vue.stringifyArray( book[ key ], "name", key === "categories" ? " > " : null ) )
                return vue.stringifyArray( book[ key ], "name", key === "categories" ? " > " : null ) || '';
                break;
                
              case "series":
                let series = book.series;
                if ( series ) series = _.map(series, function( series ) {
                  let numbers = series.bookNumbers ? (' (book '+ series.bookNumbers.join(", ") +')') : '';
                  return series.name + numbers;
                }).join(", ");
                return series;
                break;
              
              case "bookNumbers":
                let allNumbers = _.filter(book.series, "bookNumbers");
                allNumbers = _.map(allNumbers, "bookNumbers");
                allNumbers = _.flatten(allNumbers);
                if (_.isEmpty(allNumbers)) allNumbers = null;
                else if (_.isArray(allNumbers)) {
                  allNumbers = allNumbers.join(", ");
                }
                allNumbers = (allNumbers || '∞');
                if ( vue.googleSheets ) allNumbers = "'" + allNumbers;
                return book.series ? allNumbers : '';
                break;
            
              case "isbn10":
                const isbn10 = _.find( book.isbns, { type: "ISBN_10" });
                if ( isbn10 ) return isbn10.identifier;
                else { return ''; }
                break;
              case "isbn13":
                const isbn13 = _.find( book.isbns, { type: "ISBN_13" });
                if ( isbn13 ) return isbn13.identifier;
                else { return ''; }
                break;
                
              case "peopleAlsoBought":
                if ( book.peopleAlsoBought ) return vue.stringifyArray( book.peopleAlsoBought, 'title' );
                else { return ''; }
                break;
                
              case "asin":
                return book.asin || '';
                break;
                
              case "summary":
                return book.summary ? book.summary.replace(/(\n|\r)/g) : '';
                break;
                
              case "cover":
                let cover = vue.makeCoverUrl(book.cover) || '';
                if ( cover && book.asin && vue.googleSheets ) {
                  cover = vue.googleSheetsLinkifyImage( vue.makeUrl('book', book.asin), vue.makeCoverUrl(book.cover, 75) );
                }
                return cover;
                break;
                
              case "title":
                let title = book[key] || book.titleShort || '';
                if ( title && book.asin && vue.googleSheets ) {
                  title = vue.googleSheetsLinkify( title, vue.makeUrl('book', book.asin) );
                }
                return title;
                break;
                
              case "sample":
                let sample = book[key] || '';
                if ( sample && vue.googleSheets ) {
                  sample = vue.googleSheetsLinkifyImage( sample, 'https://i.imgur.com/R2N6OTy.png' ); 
                }
                return sample;
                break;
                
              case "searchInGoodreads":
                let goodreadsSearch = ( book.authors && book.titleShort && book.title ) ? vue.makeGoodReadsUrl( book ) : '';
                if ( goodreadsSearch && vue.googleSheets ) goodreadsSearch = vue.googleSheetsLinkifyImage( goodreadsSearch, 'https://i.imgur.com/RPJRqNX.png' );
                return goodreadsSearch || '';
                break;
                
              case "webPlayer":
                let webPlayerURL = book.asin ? ('https://www.audible.com/webplayer?asin=' + book.asin) : '';
                if ( webPlayerURL && vue.googleSheets ) webPlayerURL = vue.googleSheetsLinkifyImage( webPlayerURL, 'https://i.imgur.com/PdFLCdl.png' );
                return webPlayerURL || '';
                break;
                
              case "parentCategory":
                return book.categories && book.categories[0] ? book.categories[0].name : '';
                break;
                
              case "childCategory":
                return book.categories && book.categories[1] ? book.categories[1].name : '';
                break;
                
              case "storePage":
                return book.asin ? vue.makeUrl('book', book.asin) : '';
                break;
              
              default:
                return book[key] || '';
                break;
            }
            
          });
        });
      }
      
    },
    
    googleSheetsLinkify: function( string, url ) {
      return '=HYPERLINK("'+ url +'";"'+ string.replace(/\"/g,'""') +'")';
    },
    googleSheetsLinkifyImage: function( url, image ) {
      return '=HYPERLINK("'+ url +'"; IMAGE("'+ image +'"))';
    },
    googleSheetsImagefy: function( url ) {
      return '=IMAGE("'+ url +'")';
    },
    
    processDataGoodreads: function( keys, dataSource ) {
      
      let vue = this;
      
      // Filter out titles without ISBNs
      dataSource = _.filter( dataSource, function( book ) {
        const isbn10 = _.find( book.isbns, { type: "ISBN_10" });
        const isbn13 = _.find( book.isbns, { type: "ISBN_13" });
        return isbn10 || isbn13;
      });
      
      return _.map( dataSource, function( book ) {
        return _.map(keys, function( key ) {
          
          switch ( key ) {
            case "title":
              return book.title || book.titleShort || '';
              break;
              
            case "author":
            case "publisher":
              if ( book[ key+'s' ] ) return vue.stringifyArray( [book[ key+'s' ][0]], "name" ) || '';
              else { return '' }
              break;
            
            case "myRating":
              return book.myRating || '';
              break;
            
            case "binding":
              return 'Audible Audio';
              break;
            
            case "yearPublished":
              return book.releaseDate || '';
              break;
              
            // Added to goodreads...
            case "dateAdded":
              let date = new Date();
              let offset = date.getTimezoneOffset()
              date = new Date(date.getTime() - (offset*60*1000));
              return date.toISOString().split('T')[0];
              break;
            
            case "bookshelves":
              let shelves = [];
              let notStarted = !book.progress;
              let started = book.progress && !book.progress.toLowerCase().match('finished') ? true : false;
              let finished = book.progress && book.progress.toLowerCase().match('finished') ? true : false;
              let status = notStarted ? 'to-read' :
                           started ? 'currently-reading' :
                           finished ? 'read' : 'to-read';
              shelves.push( status );
              shelves.push('audible')
              shelves.push('audiobook')
              let parentCategory = book.categories && book.categories[0] ? book.categories[0].name : null;
              if ( parentCategory ) shelves.push( vue.slugify(parentCategory));
              let childCategory = book.categories && book.categories[1] ? book.categories[1].name : null;
              if ( childCategory ) shelves.push(vue.slugify(childCategory));
              return shelves.join(' ');
              break;
            
            case "isbn":
              const isbn10 = _.find( book.isbns, { type: "ISBN_10" });
              if ( isbn10 ) return isbn10.identifier;
              else { return ''; }
              break;
            case "isbn13":
              const isbn13 = _.find( book.isbns, { type: "ISBN_13" });
              if ( isbn13 ) return isbn13.identifier;
              else { return ''; }
              break;
              
            default:
              return '';
              break;
          }
          
        });
      });
      
    },
    
    prepKeys: function( dataSource ) {
      
      let keys = [];
      
      switch ( this.settings.compatibilityChecked ) {
        case 'Google Sheets':
        case 'Raw data':  
          let priorityKeys = [
            "added",
            "cover",
            "sample",
            "webPlayer",
            "searchInGoodreads",
            "title",
            "titleShort",
            "series",
            "bookNumbers",
            "blurb",
            "authors",
            "narrators",
            "categories",
            "parentCategory",
            "childCategory",
            "length",
            "progress",
            "releaseDate",
            "publishers",
            "myRating",
            "rating",
            "ratings",
            "favorite",
            "format",
            "language",
            "fromPlusCatalog",
            "unavailable",
            "downloaded",
            "storePage",
          ];
          
          if ( this.settings.compatibilityChecked === 'Raw data' ) {
            var hyperlinkKeys = [
              'sample',
              'webPlayer',
              'cover',
              'searchInGoodreads',
            ];
            priorityKeys = _.remove(priorityKeys, function(key) {
              return !_.includes( hyperlinkKeys, key);
            });
            priorityKeys = priorityKeys.concat(hyperlinkKeys);
          }
          
          keys = this.prepareKeys({
            collection: dataSource || [],
            removeKeys: ['isbns'],
            priorityKeys: priorityKeys,
          });
          break;
        case 'Goodreads':
          keys = ['dateRead','myReview','title','bookshelves','author','publisher','myRating','binding','yearPublished','dateAdded','isbn','isbn13'];
          break;
      }
      
      return keys;
      
    },
    
  }
  
};
</script>