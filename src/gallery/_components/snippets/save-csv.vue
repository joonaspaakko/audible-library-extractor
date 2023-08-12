<template>
<gallery-modal @closeModal="$emit('closeComp')">
  
  <div class="export-group">

    <div class="top-wrapper">
      <div class="icon-wrapper" :style="{ fontSize: iconSize/1.2  + 'px', lineHeight: iconSize/1.2  + 'px', paddingRight: iconSize / 2.5 + 'px' }">
        <fa6-solid-file-csv/>
      </div>
      <div class="text-wrapper" ref="textWrapper">
        <h2> Spreadsheet</h2>

        <div class="description">
          CSV is a generic file format for tabular data that is supported by any proper spreadsheet application. 
        </div>
      </div>
    </div>

    <h3>Data source:</h3>

    <div class="options">
      <label v-for="source in settings.dataSources" :key="source.key">
        <input type="radio" name="dataSources" v-model="settings.dataSourcesChecked" :value="source.key" @change="inputChanged"> 
        <div class="visual-radiobutton">
          <div class="icon">
            <ic-baseline-circle/>
          </div>
        </div>
        <span>{{ source.key }}</span>
      </label>
    </div>
    
    <div class="description" style="margin-top: 10px;">
      {{ dataSourceActive.description }}
    </div>

    <h3>Format:</h3>

    <div class="options">
      <label v-for="item in settings.compatibility" :key="item.key">
        <input type="radio" name="compatibility" v-model="settings.compatibilityChecked" :value="item.key" @change="inputChanged"> 
        <div class="visual-radiobutton">
          <div class="icon">
            <ic-baseline-circle/>
          </div>
        </div>
        <span>{{ item.label || item.key }}</span>
      </label>
    </div>
    
    <div class="description" style="margin-top: 10px;">
      {{ compatibilityActive.description }}
    </div>
    
    <div v-if="settings.compatibilityChecked === 'Goodreads'">
      <h3>Goodreads identifier:</h3>
  
      <!-- <div class="warning">
        If you have already imported books with ISBN, you may want to exclude ASIN, because books imported (and matched) with ASIN will be added as a duplicate entry.
      </div> -->
      
      <div class="options">
        <label v-for="item in settings.goodreadsIdentifier" :key="item.key">
          <input type="checkbox" name="goodreadsIdentifier" v-model="item.checked" @change="inputChanged($event, item, settings.goodreadsIdentifier)"> 
          <div class="visual-checkbox">
              <span class="icon">
                <fa-solid-check/>
              </span>
            </div>
          <span>{{ item.label || item.key }}</span>
        </label>
      </div>
      
      <div class="description" style="margin-top: 10px;" v-if="GoodreadsIdentifiersClicked">
        <strong>{{ GoodreadsIdentifiersClicked.key }}:</strong> <span v-html="GoodreadsIdentifiersClicked.description"></span>
      </div>
    </div>

    <div class="buttons-footer">
      <div class="btn-wrapper">
        <button class="save-btn save-csv" @click="saveButtonClicked"  :class="{ saving: bundling }" :disabled="bundling || !saveBtnEnabled">
          <span>{{ filename}}</span>
          <fa6-solid-circle-notch v-if="bundling" spin />
          <fa6-solid-download v-else />
        </button>
        
        <div>
          <a class="github-btn" target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/csv-export/google-sheets-import"> 
            <span>Google Sheets import</span>
            <fa6-solid-share-from-square/>
          </a>
          <a class="github-btn" target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/csv-export/goodreads-import"> 
            <span>Goodreads import</span>
            <fa6-solid-share-from-square/>
          </a>
        </div>
        
      </div>
    </div>
    
  </div>
  
</gallery-modal>
</template>

<script>
import stringifyArray from "@output-mixins/gallery-stringifyArray.js";
import makeCoverUrl from "@output-mixins/gallery-makeCoverUrl.js";
import makeUrl from "@output-mixins/gallery-makeFullUrl.js";
import prepareKeys from "@output-mixins/gallery-prepareKeys.js";
import slugify from "@output-mixins/gallery-slugify.js";
import makeGoodReadsUrl from "@output-mixins/gallery-goodReadsSearchUrl.js";
import modal from '@output-snippets/gallery-modal.vue';

export default {
  name: "saveCsv",
  mixins: [
    stringifyArray, 
    makeCoverUrl, 
    makeUrl, 
    prepareKeys, 
    slugify, 
    makeGoodReadsUrl
  ],
  components: {
    modal,
  },
  data: function() {
    return {
      settings: {
        dataSourcesChecked: 'Library',
        dataSources: [
          { key: 'Library', description: 'Export library data as spreadsheet. Uses default sorting "added": new books at the top.'},
          { key: 'Wishlist', description: 'Export wishlist data as spreadsheet.  Uses default sorting "added": new books at the top.'},
          { key: 'Current page', description: 'Export contents from any page with books. Active: search, filtering, and sorting affect this source.' },
        ],
        compatibilityChecked: 'Google Sheets',
        compatibility: [
          { key: 'Raw data', description: "Raw data with no special formulas, so it will work in any spreadsheet application." },
          { key: 'Google Sheets', description: `Adds Google Sheets compatible formulas that add icons and links. If you don't like the formulas, you can use of course "raw data" instead.` },
          { key: 'Goodreads', description: "This spreadsheet includes Goodreads relevant columns and removes any books that don't have ISBNs since Goodreads won't import books without them. Book status determines the bookshelve: not started (to-read), started(currently-reading), finished (read). Book categories are divided into shelves as well." },
        ],
        goodreadsIdentifier: [
          { key: 'ISBN',  checked: true, clicked: false, description: `You need to do the ISBN extraction in your Audible Library in order to use this.` },
          { key: 'ASIN',  checked: true,  clicked: false, description: `These days Goodreads accepts imports with ASIN, which in this case will give you an exact match.` },
          { key: 'MERGE', checked: true, clicked: false, description: `Goodreads will add one book per matched identifier, so with all 3 you can potentially add 3 duplicate entries. This merge option will pick just one of them in this order of priority: ISBN 10, ISBN 13, ASIN. <br><br>The potential issue with this is that we have no way of knowing which one of these identifiers actually matches a book. So you by <strong>unchecking</strong> this option you risk getting multiple duplicates and by cecking <strong>checking</strong> it, you risk getting less matches with fewer duplicates. <br><br>Removing duplicates in Goodreads is very time consuming when you have more than like 10. I have ~1000 books and I got like 300 duplicates without this merge option.` },
        ] 
      },
      bundling: false,
      iconSize: 20,
    };
  },
  
  mounted: function() {
    
    if ( this.$store.state.sticky.exportSettingsCSVdataSources ) {
      this.settings.dataSourcesChecked = this.$store.state.sticky.exportSettingsCSVdataSources;
    }
    if ( this.$store.state.sticky.exportSettingsCSVcompatibility ) {
      this.settings.compatibilityChecked = this.$store.state.sticky.exportSettingsCSVcompatibility;
    }
    if ( this.$store.state.sticky.exportSettingsGoodreadsIdentifier ) {
      this.settings.goodreadsIdentifier = this.$store.state.sticky.exportSettingsGoodreadsIdentifier;
    }
    
    this.iconSize = this.$refs.textWrapper.offsetHeight;
    
  },
  
  computed: {
    
    dataSourceActive() {
      return _.find( this.settings.dataSources, { key: this.settings.dataSourcesChecked });
    },
    compatibilityActive() {
      return _.find( this.settings.compatibility, { key: this.settings.compatibilityChecked });
    },
    
    activeGoodreadsIdentifiers() {
      return _.filter(this.settings.goodreadsIdentifier, { checked: true });
    },
    GoodreadsIdentifiersClicked() {
      return _.find( this.settings.goodreadsIdentifier, { clicked: true });
    },
    
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
      else if ( this.settings.dataSourcesChecked === 'Current page' ) {
        let pageTitle = this.$store.state.pageTitle ? this.slugify( this.$store.state.pageTitle ) : null;
        let routeName =  this.$route.name;
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
        case "Current page":
          return this.$store.getters.collection;
          break;
      }
      
    },
    
    saveBtnEnabled: function() {
      if ( this.settings.dataSourcesChecked === 'Current page' ) {
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
          fields: _.map( keys, function( key ) { return _.includes(['isbn', 'isbn10', 'isbn13', 'asin'], key) ? key.toUpperCase() : _.startCase(key); }),
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
        
        // saveAs(new Blob([csv], {type: "text/csv;charset=utf-8"}), this.filename);
        saveAs(new File([csv], this.filename, {type: "text/csv;charset=utf-8"}));
        
        setTimeout(function() {
          vue.bundling = false;
        }, 1000);
        
      }
    },
    
    inputChanged: function( e, item, items ) {
      
      if ( this.$store.state.sticky.exportSettingsCSVdataSources !== this.settings.dataSourcesChecked ) {
        this.$store.commit('stickyProp', { key: 'exportSettingsCSVdataSources', value: this.settings.dataSourcesChecked });
      }
      if ( this.$store.state.sticky.exportSettingsCSVcompatibility !== this.settings.compatibilityChecked ) {
        this.$store.commit('stickyProp', { key: 'exportSettingsCSVcompatibility', value: this.settings.compatibilityChecked });
      }
      
      if ( item && items ) {
        _.each(items, ( item ) => {
          item.clicked = false;
        });
        item.clicked = true;
        this.$store.commit('stickyProp', { key: 'exportSettingsGoodreadsIdentifier', value: this.settings.goodreadsIdentifier });
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
              case "tags":
                // console.log( vue.stringifyArray( book[ key ], "name", key === "categories" ? " > " : null ) )
                return vue.stringifyArray( book[ key ], "name", key === "categories" ? " > " : null ) || '';
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
                if ( isbn10 ) {
                  if ( vue.googleSheets ) return "'" + isbn10.identifier;
                  else return isbn10.identifier;
                }
                else { return ''; }
                break;
              case "isbn13":
                const isbn13 = _.find( book.isbns, { type: "ISBN_13" });
                if ( isbn13 ) {
                  if ( vue.googleSheets ) return "'" + isbn13.identifier;
                  else return isbn13.identifier;
                }
                else { return ''; }
                break;
                
              case "peopleAlsoBought":
                if ( book.peopleAlsoBought ) return vue.stringifyArray( book.peopleAlsoBought, 'title' );
                else { return ''; }
                break;
                
              case "summary":
                return book.summary ? book.summary.replace(/(\n|\r)/g) : '';
                break;
                
              case "cover":
                let cover = !book.cover ? '' : vue.makeCoverUrl(book.cover);
                if ( book.cover && cover && book.asin && vue.googleSheets ) {
                  cover = vue.googleSheetsLinkifyImage( vue.makeUrl('book', book.asin), vue.makeCoverUrl(book.cover, 75), 0 );
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
                
              case "titleShort":
                let titleShort = book[key] || book.title || '';
                if ( titleShort && book.asin && vue.googleSheets ) {
                  titleShort = vue.googleSheetsLinkify( titleShort, vue.makeUrl('book', book.asin) );
                }
                return titleShort;
                break;
                
              case "sample":
                let sample = book[key] || '';
                if ( sample && vue.googleSheets ) {
                  sample = vue.googleSheetsLinkifyImage( sample, 'https://i.imgur.com/R2N6OTy.png', 20 ); 
                }
                return sample;
                break;
                
              case "searchInGoodreads":
                let goodreadsSearch = vue.makeGoodReadsUrl( book );
                if ( goodreadsSearch && vue.googleSheets ) goodreadsSearch = vue.googleSheetsLinkifyImage( goodreadsSearch, 'https://i.imgur.com/RPJRqNX.png', 20 );
                return goodreadsSearch || '';
                break;
                
              case "webPlayer":
                let webPlayerURL = book.asin ? ('https://www.audible.com/webplayer?asin=' + book.asin) : '';
                if ( webPlayerURL && vue.googleSheets ) webPlayerURL = vue.googleSheetsLinkifyImage( webPlayerURL, 'https://i.imgur.com/PdFLCdl.png', 20 );
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
              
              case "asin":
              case "length":
              case "progress":
              case "myRating":
              case "rating":
              case "ratings":
              case "isbn":
              case "isbn10":
              case "isbn13":
                if ( vue.googleSheets ) return "'" + (book[key] || '');
                else return (book[key] || '');
                break;
                
              case "storePageUrl":
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
    googleSheetsLinkifyImage: function( url, image, size ) {
      size = size || 0;
      let sizeString = size ? '; 4; '+size+'; '+size+'' : '';
      return '=HYPERLINK("'+ url +'"; IMAGE("'+ image +'"'+ sizeString +'))';
    },
    googleSheetsImagefy: function( url, size ) {
      size = size || 0;
      let sizeString = size ? '; 4; '+size+'; '+size+'' : '';
      return '=IMAGE("'+ url +'"'+ sizeString +')';
    },
    
    processDataGoodreads: function( keys, dataSource ) {
      
      let vue = this;
      
      const identifier = {
        merge: _.find(this.activeGoodreadsIdentifiers, { key: 'MERGE', checked: true }),
        ASIN : _.find(this.activeGoodreadsIdentifiers, { key: 'ASIN', checked: true }),
        ISBN : _.find(this.activeGoodreadsIdentifiers, { key: 'ISBN', checked: true }),
      };
      
      // // Filter out titles without ISBNs
      // dataSource = _.filter( dataSource, function( book ) {
      //   const isbn10 = _.find( book.isbns, { type: "ISBN_10" });
      //   const isbn13 = _.find( book.isbns, { type: "ISBN_13" });
      //   const asin = book.asin;
      //   return isbn10 || isbn13 || asin;
      // });
      
      
      return _.map( dataSource, function( book ) {
        
        let exportIDs = [];
        
        const get = {
          isbn10: _.get(_.find( book.isbns, { type: "ISBN_10" }), 'identifier'),
          isbn13: _.get(_.find( book.isbns, { type: "ISBN_13" }), 'identifier'),
          asin  : book.asin,
        };
        
        if ( identifier.merge && identifier.ASIN && identifier.ISBN ) {
               if ( get.isbn10 ) exportIDs.push('isbn10');
          else if ( get.isbn13 ) exportIDs.push('isbn13');
          else if ( get.asin ) exportIDs.push('asin');
        }
        else if ( identifier.merge && identifier.ISBN ) {
               if ( get.isbn10 ) exportIDs.push('isbn10');
          else if ( get.isbn13 ) exportIDs.push('isbn13');
        }
        else if ( identifier.ISBN ) {
          if ( get.isbn10 ) exportIDs.push('isbn10');
          if ( get.isbn13 ) exportIDs.push('isbn13');
        }
        else if ( identifier.asin ) {
          if ( get.asin ) exportIDs.push('asin');
        }
        else {
          exportIDs = ['asin', 'isbn10', 'isbn13'];
        }
        
        return _.map(keys, function( key ) {
          
          switch ( key ) {
            case "title":
              return book.title || book.titleShort || '';
              break;
              
            case "author":
            case "publisher":
              if ( book[ key+'s' ] ) return vue.stringifyArray( [book[ key+'s' ][0]], "name" ) || '';
              else { return '' }
              break;
            
            case "myRating":
              return book.myRating || '';
              break;
            
            case "averageRating":
              return book.rating || '';
              break;
            
            case "binding":
              return 'Audible Audio';
              break;
            
            case "yearPublished":
              return (book.releaseDate || '').split('-')[0];
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
              shelves.push('audible');
              shelves.push('audiobook');
              if ( book.fromPlusCatalog )shelves.push('audible-plus');
              let parentCategory = book.categories && book.categories[0] ? book.categories[0].name : null;
              if ( parentCategory ) shelves.push( vue.slugify(parentCategory));
              let childCategory = book.categories && book.categories[1] ? book.categories[1].name : null;
              if ( childCategory ) shelves.push(vue.slugify(childCategory));
              return shelves.join(' ');
              break;
            
            case "isbn":
              return _.includes(exportIDs, 'isbn10') ? get.isbn10 : '';
              break;
            case "isbn13":
              return _.includes(exportIDs, 'isbn13') ? get.isbn13 : '';
              break;
              
            case "asin":
              return _.includes(exportIDs, 'asin') ? get.asin : '';
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
            "tags",
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
            "whispersync",
            "fromPlusCatalog",
            "unavailable",
            "archived",
            "downloaded",
            "storePageChanged",
            "storePageMissing",
            "asin",
            "isbn10",
            "isbn13",
            "summary",
            "peopleAlsoBought",
          ];
          
          const rawData = this.settings.compatibilityChecked === 'Raw data';
          
          // Add extra column(s)
          if ( rawData ) priorityKeys.push('storePageUrl');
          
          // Moves urls to the back of the csv in raw data
          if ( rawData ) {
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
          keys = ['dateRead','myReview','title','bookshelves','author','publisher','myRating','averageRating','binding','yearPublished','dateAdded','isbn','isbn13', 'asin'];
          break;
      }
      
      return keys;
      
    },
    
  }
  
};
</script>


<style scoped lang="scss">
.options {
  display: flex;
  flex-direction: row;  
}

.options label {
  display: inline-flex !important;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  
  input {
    opacity: 0;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
  }
  
  .visual-radiobutton {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width:  15px;
    height: 15px;
    // border: 1px solid #fff;
    background: #292929;
    @include themify($themes) {
      border: 1px solid rgba(themed(frontColor), .25);
    }
    border-radius: 9999999999px;
    margin-right: 5px;
    .icon, svg {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 7px;
      height: 7px;
      color: #00ed00;
    }
  }
  
  .visual-radiobutton .icon { opacity: 0;  }
  input:checked ~ .visual-radiobutton .icon { opacity: 1; }
}

.options {
  
  .visual-checkbox {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width:  17px;
    height: 17px;
    background: #292929;
    @include themify($themes) {
      // background: themed(backColor);
      border: 1px solid rgba(themed(frontColor), .25);
    }
    // border: 1px solid #666;
    border-radius: 4px;
    margin-right: 5px;
  }
  
  .visual-checkbox .icon {
    display: none;
    color: #00ed00;
    svg {
      width: 80%;
    }
  }
  
  label input:checked ~ .visual-checkbox .icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  
  > .disabled {
    opacity: .6;
    cursor: default !important;
    .visual-checkbox .icon {
      color: inherit;
    }
  }
}

.top-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 35px;
  border-bottom: 2px solid rgba(#000, .15);
  margin-bottom: 5px;
}

.info-tooltip {
  opacity: .5;
  margin-left: 3px;
  display: inline-block;
  padding: 5px;
}

.warning {
  margin-top: 10px;
  border: 1px dashed #ff404e;
  border-radius: 6px;
  padding: 10px;
}

</style>
