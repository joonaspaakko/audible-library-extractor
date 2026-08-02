<template>
<gallery-modal @closeModal="$emit('closeComp')">

  <div class="export-group">

    <div class="top-wrapper">
      <div class="icon-wrapper" :style="{ fontSize: iconSize/1.2  + 'px', lineHeight: iconSize/1.2  + 'px', paddingRight: iconSize / 2.5 + 'px' }">
        <fa6-solid-file-excel/>
      </div>
      <div class="text-wrapper" ref="textWrapper">
        <h2>Spreadsheet export</h2>

        <div class="description">
          Export your library as a spreadsheet. Downloads as XLSX by default, which is supported by Google Sheets, Excel, and most other spreadsheet apps.
        </div>
      </div>
    </div>

    <fieldset class="option-fieldset">
      <legend>What to export</legend>

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

      <div class="format-callout">
        <div class="format-callout-body">{{ dataSourceActive.description }}</div>
      </div>

    </fieldset>

    <fieldset class="option-fieldset">
      <legend>How to export</legend>

      <div class="options format-options">
        <label v-for="item in settings.compatibility" :key="item.key">
          <input type="radio" name="compatibility" v-model="settings.compatibilityChecked" :value="item.key" @change="inputChanged">
          <div class="visual-radiobutton">
            <div class="icon">
              <ic-baseline-circle/>
            </div>
          </div>
          <span class="option-label">
            <span class="primary">
              {{ item.label || item.key }}
            </span>
            <span v-if="item.subtext" class="option-subtext">{{ item.subtext }}</span>
          </span>
        </label>
      </div>

    <div class="format-callout">
      <div class="format-callout-body">
        <template v-if="settings.compatibilityChecked === 'Goodreads'">
          {{ compatibilityActive.description }}
          <span v-if="goodreadsUseISBN"> ISBN detected in your library — using ISBN for matching.</span>
          <span v-else> No ISBNs found in your library — using ASIN for matching.</span>
          <div class="format-callout-links">
            <a class="callout-link-btn" target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/csv-export/goodreads-import">
              <span>Learn how to import into Goodreads</span>
              <mdi-open-in-new/>
            </a>
          </div>
        </template>
        <template v-else-if="settings.compatibilityChecked === 'With formulas'">
          {{ compatibilityActive.description }}
          <div class="format-callout-links">
            <a class="callout-link-btn" target="_blank" rel="noopener noreferrer" href="https://joonaspaakko.gitbook.io/audible-library-extractor/gallery/csv-export/google-sheets-import">
              <span>Learn how to import into Google Sheets</span>
              <mdi-open-in-new/>
            </a>
          </div>
        </template>
        <template v-else>
          {{ compatibilityActive.description }}
        </template>
      </div>
    </div>

    </fieldset>

    <div class="buttons-footer">
      <div class="btn-wrapper">

        <div class="split-btn-wrapper" :class="{ saving: !!bundling, disabled: !!bundling || !saveBtnEnabled }">

          <button class="save-btn save-csv split-btn-main" @click="saveButtonClicked( saveFormat )" :class="{ saving: !!bundling }" :disabled="!!bundling || !saveBtnEnabled">
            <fa6-solid-circle-notch v-if="bundling" spin />
            <fa6-solid-download v-else />
            <span class="btn-label">
              Download {{ saveFormat.toUpperCase() }}
              <span class="btn-filename">{{ filename( saveFormat ) }}</span>
            </span>
          </button>

          <button v-if="settings.compatibilityChecked === 'Default'" class="split-btn-chevron" @click="formatDropdownOpen = !formatDropdownOpen" :disabled="!!bundling || !saveBtnEnabled">
            <fa6-solid-chevron-down />
          </button>

          <div v-if="formatDropdownOpen" class="format-dropdown" v-click-outside="() => formatDropdownOpen = false">
            <button @click="pickFormat('xlsx')" :class="{ selected: saveFormat === 'xlsx' }">
              <span>XLSX</span>
              <span class="format-dropdown-sub">Excel, Google Sheets, etc.</span>
            </button>
            <button @click="pickFormat('csv')" :class="{ selected: saveFormat === 'csv' }">
              <span>CSV</span>
              <span class="format-dropdown-sub">Plain text, any app</span>
            </button>
          </div>

        </div>


      </div>
    </div>

  </div>

</gallery-modal>
</template>

<script>
import writeXlsxFile from 'write-excel-file/browser';
import { downloadBlob } from '@utils/download.js';
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

  directives: {
    clickOutside: {
      mounted( el, binding ) {
        el.clickOutsideHandler = ( event ) => {
          if ( !el.contains( event.target ) ) binding.value( event );
        };
        document.addEventListener( 'mousedown', el.clickOutsideHandler );
      },
      unmounted( el ) {
        document.removeEventListener( 'mousedown', el.clickOutsideHandler );
      },
    },
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
        compatibilityChecked: 'With formulas',
        compatibility: [
          { key: 'Default',       label: 'Default',       subtext: '', description: "Plain data, works in any spreadsheet app." },
          { key: 'With formulas', label: 'With formulas', subtext: '', description: "Adds cover images and hyperlinks using spreadsheet formulas. Formula-based images only render correctly in Google Sheets." },
          { key: 'Goodreads',     label: 'Goodreads',     subtext: '', description: "Goodreads-compatible columns. Book status maps to shelves: not started (to-read), started (currently-reading), finished (read). Categories become shelves too." },
        ],
      },
      bundling: null,
      iconSize: 20,
      formatDropdownOpen: false,
      preferredFormat: 'xlsx',
    };
  },
  
  mounted: function() {
    
    if ( this.$store.state.sticky.exportSettingsCSVdataSources ) {
      this.settings.dataSourcesChecked = this.$store.state.sticky.exportSettingsCSVdataSources;
    }
    if ( this.$store.state.sticky.exportSettingsCSVcompatibility ) {
      this.settings.compatibilityChecked = this.$store.state.sticky.exportSettingsCSVcompatibility;
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
    
    goodreadsUseISBN: function() {
      return _.some( this.dataSource, function( book ) {
        return _.find( book.isbns, { type: 'ISBN_10' }) || _.find( book.isbns, { type: 'ISBN_13' });
      });
    },

    googleSheets: function() {
      return this.settings.compatibilityChecked === 'With formulas';
    },

    saveFormat: function() {
      if ( this.settings.compatibilityChecked === 'Goodreads' ) return 'csv';
      if ( this.settings.compatibilityChecked === 'With formulas' ) return 'xlsx';
      return this.preferredFormat;
    },
    
    
    dataSource: function() {
      switch ( this.settings.dataSourcesChecked ) {
        case "Library":
          return this.$store.state.audibledata.library;
          break;
        case "Wishlist":
          return this.$store.state.audibledata.wishlist;
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
    pickFormat: function( format ) {
      this.preferredFormat = format;
      this.formatDropdownOpen = false;
      this.saveButtonClicked( format );
    },

    filename: function( format ) {

      let suffix = '';
      if ( this.settings.dataSourcesChecked === 'Library' ) {
        suffix = 'library';
      }
      else if ( this.settings.dataSourcesChecked === 'Wishlist' ) {
        suffix = 'wishlist';
      }
      else if ( this.settings.dataSourcesChecked === 'Current page' ) {
        let pageTitle = this.$store.state.pageTitle ? this.slugify( this.$store.state.pageTitle ) : null;
        let routeName = this.$route.name;
        suffix = pageTitle || routeName;
      }

      if ( suffix !== '' ) suffix = '-' + suffix;

      return 'ALE-spreadsheet' + suffix + '.' + format;

    },

    saveButtonClicked: function( format ) {
      if ( !this.bundling ) {

        const vue = this;
        vue.bundling = format;

        let dataSource = JSON.parse( JSON.stringify( this.dataSource ) );
        let keys = this.prepKeys( dataSource );
        let rows = this.processData( keys, dataSource );
        let headers = _.map( keys, function( key ) { return _.includes(['isbn', 'isbn10', 'isbn13', 'asin'], key) ? key.toUpperCase() : _.startCase(key); });

        if ( format === 'xlsx' ) {
          this.saveXlsx( keys, headers, rows ).then( function() {
            vue.bundling = null;
          });
        }
        else {
          let csv = Papa.unparse({
            fields: headers,
            data: rows,
            quotes: false,
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ",",
            header: true,
            newline: "\r\n",
            skipEmptyLines: false,
            columns: null,
          });

          downloadBlob( new Blob([csv], { type: "text/csv;charset=utf-8" }), this.filename( format ) );

          setTimeout( function() {
            vue.bundling = null;
          }, 1000);
        }

      }
    },

    saveXlsx: function( keys, headers, rows ) {

      const vue = this;

      const narrowImageKeys = [ 'sample', 'webPlayer', 'searchInGoodreads' ];
      const rowHeight = 26; // points, approx. 35px

      const columns = _.map( keys, function( key ) {
        if ( key === 'cover' ) return { width: 5 }; // approx. 35px
        if ( _.includes( narrowImageKeys, key ) ) return { width: 4.3 }; // approx. 30px
        return {};
      });

      const headerRow = _.map( headers, function( h ) {
        return { type: String, value: h, fontWeight: 'bold' };
      });

      const dataRows = _.map( rows, function( row ) {
        return _.map( row, function( cell, index ) {
          let value = ( cell == null ? '' : String( cell ) );
          let cellObject;
          if ( value.startsWith('=') ) cellObject = { type: 'Formula', value: value.slice(1) };
          else if ( value.startsWith("'") ) cellObject = { type: String, value: value.slice(1) };
          else cellObject = { type: String, value: value };

          cellObject.alignVertical = 'center';
          if ( keys[index] === 'cover' || _.includes( narrowImageKeys, keys[index] ) ) cellObject.align = 'center';
          cellObject.height = rowHeight;

          return cellObject;
        });
      });

      return writeXlsxFile( [ headerRow, ...dataRows ], { columns } ).toBlob().then( function( blob ) {
        downloadBlob( blob, vue.filename('xlsx') );
      });

    },
    
    inputChanged: function() {
      
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
                
              case "titleShort":
                let titleShort = book[key] || book.title || '';
                if ( titleShort && book.asin && vue.googleSheets ) {
                  titleShort = vue.googleSheetsLinkify( titleShort, vue.makeUrl('book', book.asin) );
                }
                return titleShort;
                break;
                
              case "sample":
                let sample = book[key] || (book.asin ? ('https://www.audible.com/webplayer?asin=' + book.asin + '&isSample=true') : '');
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
      
      const useISBN = this.goodreadsUseISBN;

      return _.map( dataSource, function( book ) {

        const get = {
          isbn10: _.get(_.find( book.isbns, { type: "ISBN_10" }), 'identifier'),
          isbn13: _.get(_.find( book.isbns, { type: "ISBN_13" }), 'identifier'),
          asin  : book.asin,
        };
        
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
              return useISBN ? ( get.isbn10 || '' ) : '';
              break;
            case "isbn13":
              return useISBN ? ( get.isbn13 || '' ) : '';
              break;

            case "asin":
              return !useISBN ? ( get.asin || '' ) : '';
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
        case 'With formulas':
        case 'Default':
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
          
          const rawData = this.settings.compatibilityChecked === 'Default';
          
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
.option-fieldset {
  border-radius: 6px;
  padding: 10px 12px 12px;
  margin-bottom: 10px;
  @include themify($themes) {
    border: 1px solid rgba(themed(frontColor), .15);
  }

  legend {
    padding: 0 6px;
    font-size: .8em;
    font-weight: 600;
    letter-spacing: .03em;
    text-transform: uppercase;
    @include themify($themes) {
      color: rgba(themed(frontColor), .4);
    }
  }
}

.options {
  display: flex;
  flex-direction: row;
}

.format-options {
  gap: 8px;

  label {
    align-items: flex-start !important;
  }
}

.option-label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.option-subtext {
  font-size: .75em;
  opacity: .6;
  margin-top: 1px;
  white-space: nowrap;
}

.btn-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
  padding-right: 10px;
}

.btn-filename {
  font-size: .7em;
  opacity: .7;
  font-weight: normal;
  margin-top: 1px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.split-btn-wrapper {
  display: flex;
  flex-direction: row;
  position: relative;
  flex: 1;

  .split-btn-main {
    flex: 1;
    justify-content: flex-start !important;
    border-radius: 3px 0 0 3px !important;
    padding-right: 12px !important;
    gap: 10px;
  }

  &:not(:has(.split-btn-chevron)) .split-btn-main {
    border-radius: 3px !important;
  }

  .split-btn-chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    border: none;
    border-left: 1px solid rgba(#fff, .2);
    border-radius: 0 3px 3px 0;
    cursor: pointer;
    color: #fff;
    background: #0e9d59;
    &:hover { background: #0b8a4e; }
    &:disabled { cursor: not-allowed; opacity: .6; }

    svg {
      width: 12px;
      height: 12px;
    }
  }

  .format-dropdown {
    position: absolute;
    bottom: calc( 100% + 6px );
    left: 0;
    right: 0;
    border-radius: 4px;
    overflow: hidden;
    z-index: 10;
    @include themify($themes) {
      background: themed(backColor);
      border: 1px solid rgba(themed(frontColor), .15);
      box-shadow: themed(shadowSmall);
    }

    button {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      padding: 9px 14px;
      border: none;
      cursor: pointer;
      background: transparent;
      @include themify($themes) {
        color: themed(frontColor);
        &:hover { background: rgba(themed(frontColor), .07); }
      }
      &.selected {
        @include themify($themes) { background: rgba(themed(frontColor), .05); }
        > span:first-child::after {
          content: ' ✓';
          opacity: .5;
        }
      }
      & + button {
        @include themify($themes) {
          border-top: 1px solid rgba(themed(frontColor), .1);
        }
      }
    }

    .format-dropdown-sub {
      font-size: .75em;
      opacity: .55;
      margin-top: 1px;
    }
  }
}

.format-callout {
  margin-top: 13px;

  .format-callout-body {
    padding: 6px 10px;
    font-size: .85em;
    line-height: 1.5;
    border-radius: 0 0 4px 4px;
    margin: 20px -12px -12px;
    @include themify($themes) {
      border-top: 1px solid rgba(themed(frontColor), .15);
      background: rgba(themed(frontColor), .04);
      color: rgba(themed(frontColor), .6);
    }
  }

  .format-callout-links {
    margin-top: 8px;

    .callout-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 9px;
      border-radius: 3px;
      font-size: .85em;
      text-decoration: none !important;
      @include themify($themes) {
        color: rgba(themed(frontColor), .8) !important;
        background: rgba(themed(frontColor), .09);
        &:hover {
          color: rgba(themed(frontColor), 1) !important;
          background: rgba(themed(frontColor), .15);
        }
      }

      svg {
        width: .9em;
        height: .9em;
        flex-shrink: 0;
      }
    }
  }
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
  padding-bottom: 20px;
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
