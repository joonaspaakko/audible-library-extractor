<template>
  <div id="ale-spreadsheet">
    <hot-table
      v-if="!loading"
      :settings="options"
      :colHeaders="colHeaders"
      :columns="columns"
      ref="hotTableComponent"
    ></hot-table>
    <!-- <hot-table
      v-if="!loading"
      :settings="options"
      :colHeaders="colHeaders"
      :columns="columns"
      ref="hotTableComponent"
    ></hot-table> -->
    <font-awesome-icon class="loading-icon" v-else icon="spinner" spin />
  </div>
</template>

<script>
import { HotTable } from '@handsontable/vue';
// import Handsontable from 'handsontable';
import makeFullUrl from '../../_mixins/makeFullUrl'

export default {
  name: 'aleSpreadsheet',
  props: ['library', 'general'],
  mixins: [
    makeFullUrl,
  ],
  components: {
    HotTable,
  },
  
  created: function() {
    this.general.loadingSpreadsheet = true;    
  },
  
  mounted: function() {
    
    // const maxHeight = $('#ale-spreadsheet').height() - 26;
    // const initialRows = Math.floor( maxHeight / 22 );
    // this.options.data = this.library.books.slice(0,initialRows+15);
    // this.pageSize = this.options.data.length;
    
    
    const vue = this;
    vue.$nextTick(function() {
      setTimeout(function() {
        
        vue.prepareKeys();
        vue.prepareColheaders();
        vue.options.data = vue.prepareColumns2();
        vue.prepareColumns();
        console.log( vue.columns );
        vue.options.afterInit = vue.afterInit();
        // vue.options.afterScrollVertically = vue.afterScrollVertically();
        Eventbus.$on('csvExportStarted', vue.exportSpreadsheet );
        
        vue.loading = false;
        vue.$nextTick(function() {
          
        
          vue.hot = vue.$refs.hotTableComponent.hotInstance;
          // vue.plugins.export = vue.hot.getPlugin('exportFile');
          vue.plugins.resize = vue.hot.getPlugin('manualColumnResize');
          vue.plugins.resize.setManualSize(30, 25);
          vue.hot.render();
          
        });
      }, 10);
    });
    
  },
  
  beforeDestroy: function() {
    
    this.hot = null;
    // this.plugins.export = null;
    this.plugins.resize = null;
    
    Eventbus.$off('csvExportStarted', this.exportSpreadsheet );
    
  },
  
  data: function() {
    return {
      loading: true,
      // pageSize: null,
      // listenForScroll: true,
      hot: null,
      plugins: {
        export: null,
        // resize: null,
      },
      keys: null,
      colHeaders: null,
      columns: null,
      options: {
        licenseKey: 'non-commercial-and-evaluation',
        // width: '100vw',
        // height: '100vh',
        data: null,
        // data: this.library.books,
        // data: Handsontable.helper.createSpreadsheetData(1000, 40),
        // search: true,
        readOnly: false,
        filters: true,
        // https://handsontable.com/docs/7.4.2/demo-searching.html
        // https://handsontable.com/docs/7.4.2/demo-filtering.html
        dropdownMenu: ['filter_by_condition', 'filter_action_bar'], // Caution: Filters initial column contents, not rendered
        columnSorting: true,
        // manualColumnMove: true,
        // manualRowMove: true,
        allowInsertRow: false,
        allowInsertColumn: false,
        allowRemoveRow: false,
        allowRemoveColumn: false,
        // autoColumnSize: true,
        // autoRowSize: true,
        manualRowResize: true,
        manualColumnResize: true,
        // fixedRowsTop: 0,
        // fixedColumnsLeft: 2,
        rowHeaders: true,
        colHeader: true,
        currentRowClassName: 'currentRow',
        rowHeights: 20,
        rowHeight: 20,
        defaultRowHeight: 20,
        afterInit: null,
        afterScrollVertically: null,
      }
    }
  },
  methods: {
    
    afterInit: function() {
      const vue = this;
      return function() {
        vue.general.loadingSpreadsheet = false;        
      }
    },
    
    // afterScrollVertically: function() {
    //   const vue = this;
    //   return function() {
        
    //     var rows = this.countRows();
    //     if ( rows >= vue.library.books.length ) vue.listenForScroll = false;
    //     if ( rows < vue.library.books.length && vue.listenForScroll ) {
          
    //       var lastVisibleRow = this.getPlugin('AutoRowSize').getLastVisibleRow()+1;
    //       const threshold = rows - 10;
          
    //       if ( lastVisibleRow >= threshold ) {
    //         const lazyLoaded = vue.library.books.slice( rows-1, rows + (vue.pageSize*2) );
    //         vue.options.data = vue.options.data.concat( lazyLoaded );
    //         this.render();
    //       }
    //     }
        
    //   }
    // },
    
    exportSpreadsheet: function() {
      this.plugins.export.downloadFile('csv', {
				filename: 'My Audible library', columnHeaders: true
			});
    },
		
    prepareKeys: function() {
      const vue = this;
      // Gets all keys from the books array
      var keys = _.union(_.flatten(_.map(vue.library.books, (e) => _.keys(e))));
    
      // These are placed in the front of the table and the leftover columns follows alphabetical order
      var priorityKeys = [
        "sample",
        "titleShort",
        "title",
        "blurb",
        "authors",
        "narrators",
        "categories",
        "series",
        "summary",
        "length",
        "progress",
        "added",
        "releaseDate",
        "publishers",
        "myRating",
        "rating",
        "ratings",
      ];
      var leftoverKeys = _.remove( keys, function( key ) {
        return !_.includes(priorityKeys, key );
      });
      
      keys = priorityKeys.concat( leftoverKeys );
      priorityKeys = null;
      leftoverKeys = null;
      
      // Columns we don't want to show in the table
      var removeKeys = [
        'url',
        'coverUrl',
        'moreLikeThis',
        'peopleAlsoBought',
        'summary',
        'asin',
        'title',
        'blurb',
      ];
      keys = _.remove( keys, function( key ) {
        return !_.includes(removeKeys, key );
      });
      vue.keys = keys;

    },
    prepareColheaders: function() {
      
      this.colHeaders = _.map( this.keys, function( key ) {
        let header = key;
        if ( key === 'sample' ) header = '';
        return _.startCase( header );
      });
      
    },
    
    prepareColumns2: function() {
      
      const vue = this;
      const books = [];
      _.map(vue.library.books, function( book ) {
        const newBook = [];
        _.each( vue.keys, function( key, i ) {
          switch ( key ) {
            case 'authors':
            case 'narrators':
            case 'categories':
            case 'series':
            case 'publishers':
              newBook.push( 
                vue.stringifyArray({
                  array: book[ key ],
                  key: 'name', 
                  delimiter: (key === 'categories') ? ' > ' : ', ',
                })
              );
              break;
            
            case 'progress':
              newBook.push( (book[ key ] == 0) ? 'Not started' : book[ key ] );
              break;
              
            default:
              newBook.push( book[ key ] );
          }
        });
        books.push( newBook );
      });
      
      return books;
      
    },
    
    prepareColumns: function() {
      
      const vue = this;
      vue.columns = _.map(vue.keys, function( key ) {
        const column = {};
        switch ( key ) {
          case 'blurb':
            // column.readOnly = false;
            break;
          case 'authors':
          case 'narrators':
          case 'categories':
          case 'series':
          case 'publishers':
            // column.data = function( book ) {
            //   return vue.stringifyArray({
            //     array: book[ key ],
            //     key: 'name', 
            //     delimiter: (key === 'categories') ? ' > ' : ', ',
            //   });
            // };
            // column.renderer = vue.renderers().linkifyArray;
            break;
          
          case 'progress':
            // column.data = function( book ) {
            //   return (book[ key ] == 0) ? 'Not started' : book[ key ];
            // };
            break;
          
          case 'sample':
            column.renderer = vue.renderers().sample;
            column.width = '28px';
            // column.filters = false;
            // column.dropdownMenu = false;
            break;
          
          case 'title':
            // column.renderer = vue.renderers().title;
            break;
            
          default:
        }
        
        // if ( !column.data ) {
        //   column.data = function( book ) {
        //     return book[ key ] || '';
        //   };
        // }
        if ( !column.renderer ) column.renderer = vue.renderers().general;
        if ( !column.type ) column.type = 'text';
        if ( !column.className ) column.className = "htLeft htTop";
        return column;
      });
      
    },
    
    stringifyArray: function( config ) {
      if ( config.array ) {
        if ( !config.key ) config.key = 'name';
        if ( !config.delimiter ) config.delimiter = ', ';
        return _.map( config.array, config.key ).join( config.delimiter );
      }
    },
    
    // linkifyArray: function( config ) { 
    //   const vue = this;
    //   if ( config.array ) {
        
    //     _.each( config.array, function( o, index ) {
          
    //       if ( index > 0 ) config.parent.append( $('<span>', { text: config.delimiter }) );
    //       const link = $('<a>', {
    //         target: '_blank',
    //         href: vue.makeFullUrl(o[ config.url ]),
    //         text: o[ config.text ],
    //       });
    //       config.parent.append( link );
          
    //     });
        
    //   }
    // },
    
    // linkifyArray_Original: function( config ) { 
    //   const vue = this;
    //   if ( config.array ) {
    //     return _.map( config.array, function( o ) {
    //       return '<a target="_blank" href="'+ vue.makeFullUrl(o[ config.url ]) +'">'+ o[ config.text ] +'</a>'
    //     }).join( config.delimiter );
    //   }
    // },
    
    // stringifyArray: function( array, delimiter ) {
    //   if ( array ) {
    //     var html = '';
    //     _.each(array, function(item, index ) {
    //       html += item.name;
    //       if ( index < array.length-1 ) html += (delimiter || ', ');
    //       // html += '<a href="'+ item.url +'" target="_blank">'+ item.name +'</a>';
    //       // if ( index < array.length-1 ) html += (delimiter || ', ');
    //     });
    //     return html;
    //   }
    // },
    
        
    getTableData( instance, row, col ) {
      
      // Physical row and col are fetched to avoid issues when sorting...
      const physicalRow = instance.toPhysicalRow( row );
      const physicalCol = instance.toPhysicalColumn( col );
      const rowData = instance.getSourceDataAtRow( physicalRow, physicalCol );
      const colKey = _.camelCase( instance.getColHeader( physicalCol ) );
      const cellData = rowData[ colKey ];
      
      return {
        row: rowData,
        cell: cellData,
        key: colKey,
      }
      
    },
    
    empty( el ) {
      var child;
      while (child = el.lastChild) {
        el.removeChild(child);
      }
    },
    
    cellWrapper: function() {
      // return $('<div>', { class: 'td-inner-wrap' });
      const wrapper = document.createElement('div');
      wrapper.classList.add('td-inner-wrap');
      return wrapper;
    },
    
    renderers: function() {
      const vue = this;
      return {
        linkifyArray: function( instance, td, row, col, prop, value, cellProperties ) {
          if ( value ) {
            
            vue.empty(td);
            const wrapper = vue.cellWrapper();
            const tdData = vue.getTableData( instance, row, col );
            console.log( tdData )
            _.each( tdData.cell, function( book, index ) {
              
              if ( index > 0 ) {
                const delimiter = document.createElement('span');
                delimiter.textContent = (tdData.key === 'categories') ? ' > ' : ', ';
                wrapper.appendChild( delimiter );
              }
              const link = document.createElement('a');
              link.setAttribute('target', '_blank');
              link.setAttribute('href', vue.makeFullUrl( book.url ));
              link.textContent = book.name;
              wrapper.appendChild( link );
              console.log( wrapper );
            });
              
            // if ( colKey == 'categories' ) console.log( wrapper[0] );
            td.appendChild( wrapper );
            
          }
        },
        
        general: function(instance, td, row, col, prop, value, cellProperties) {
          
          vue.empty(td);
          const wrapper = vue.cellWrapper()
          if ( value ) wrapper.textContent = value;
          td.appendChild( wrapper );
          
        },
        
        
        title: function(instance, td, row, col, prop, value, cellProperties) {
          
          vue.empty(td);
          const tdData = vue.getTableData( instance, row, col );
          const content = vue.cellWrapper();
          if ( value ) {
            const bookURL = tdData.row.url;
            // const bookURL = instance.getSourceDataAtRow( row, col ).url;
            if ( bookURL ) {
              content.append(
                $('<a>', { 
                  target: '_blank',
                  href: vue.makeFullUrl( bookURL ),
                  text: value,
                })
              );
            }
            else {
              content.append( value );
            }
          }
          $(td).append( content );
          
        },
        
        sample: function(instance, td, row, col, prop, value, cellProperties) {
          vue.empty(td);
          const wrapper = vue.cellWrapper();
          
          if ( value ) {
            const sampleLink = document.createElement('a');
            sampleLink.setAttribute('target', '_blank');
            sampleLink.setAttribute('href', value);
            sampleLink.classList.add('spreadsheet-play-sample');
            const playIcon = document.createElement('img');
            playIcon.setAttribute('src', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1OTYgNTk2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzIyMjt9LmNscy0ye2ZpbGw6I2ZmZjt9PC9zdHlsZT48L2RlZnM+PGc+PGc+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjk4LDU3MUEyNzMsMjczLDAsMCwxLDEwNSwxMDVhMjczLDI3MywwLDAsMSwzODYuMSwzODYuMUEyNzEuMTgsMjcxLjE4LDAsMCwxLDI5OCw1NzFaTTIyNyw0MDAuMzIsNDAwLjA5LDMwMSwyMjcsMTk1Ljc1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTI5OCw1MGMxMzcsMCwyNDgsMTExLDI0OCwyNDhTNDM1LDU0NiwyOTgsNTQ2LDUwLDQzNSw1MCwyOTgsMTYxLDUwLDI5OCw1ME0yMjYuMSw0MjZhMjMuNzgsMjMuNzgsMCwwLDAsMTEuNi0zbDE3Ni0xMDFjMTYuNC05LjEsMTYuNC0zMi44LDAtNDJsLTE3Ni0xMDdhMjMuOCwyMy44LDAsMCwwLTExLjYtM0EyNCwyNCwwLDAsMCwyMDIsMTk0VjQwMmEyNCwyNCwwLDAsMCwyNC4xLDI0TTI5OCwwQTI5OC4wNywyOTguMDcsMCwwLDAsMTgyLDU3Mi41NywyOTguMDgsMjk4LjA4LDAsMCwwLDQxNCwyMy40MywyOTYuMjYsMjk2LjI2LDAsMCwwLDI5OCwwWiIvPjwvZz48L2c+PC9zdmc+');
            sampleLink.appendChild( playIcon );
            wrapper.appendChild( sampleLink );
            
            sampleLink.addEventListener('click', function(e) {
              e.preventDefault();
              const sampleUrl = this.getAttribute('href');
              const book = _.find( vue.library.books, ['sample', sampleUrl]);
              Eventbus.$emit('playSample', {
                from: 'aleSpredsheet',
                route: vue.$route,
                book: book,
              });
              
            });
            
            td.appendChild( wrapper );
            
          }          
        },
        cover: function(instance, td, row, col, prop, value, cellProperties) {
          instance.dom.empty(td);
          
          var book = ale_booksArray[ row ];
          var td = $(td);
          td
            //.html('<a target="_blank" href="'+ value +'"><small>cover</small>')
            //.attr('data-tippy-content','<img src="'+ value +'" alt="">')
            .addClass('htCenter htMiddle td-cover-image');
          
          var coverEl = $('<a>', {
            target: '_blank',
            href: value,
            text: 'cover',
            'data-tippy-content': '<img src="'+ value +'" alt="">',
            css: {
              display: 'block',
              fontSize: '1em'
            }
          }).appendTo( td );
          
        }
      }
    }
    
  },
}
</script>

<style lang="scss">
@import '~@/_variables.scss';
@import '~handsontable/dist/handsontable.full.css';

#ale-spreadsheet {
  display: flex;
  justify-content: center;
  justify-items: center;
  align-content: center;
  align-items: center;
  position: absolute;
	z-index: 888;
  top: 100px;
  right: 30px;
  bottom: 30px;
  left: 30px;
  overflow: hidden;
  @include themify($themes) {
    background: lighten( themed(backColor), 15);
    box-shadow: themed(shadowMedium), themed(shadowSmall);
  } 
  
  .handsontable {
    th, td {
      max-width: 300px;
      min-width: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      // white-space: nowrap;
      height: 20px;
    }
    .td-inner-wrap {
      width: 100%;
      height: 20px;
      // overflow: hidden;
    }
  }
  
  .loading-icon {
    font-size: 40px;
    @include themify($themes) {
      color: themed(audibleOrange);
    } 
    
  }
  
} // #ale-spreadsheet

html.theme-dark {
  
  .handsontable tbody th {
    background-color: lighten( $darkBackColor, 2) !important;
    color: lighten( $darkFrontColor, 5) !important;
    border-color: lighten( $darkBackColor, 14) !important;
  }
  .handsontable thead th {
    background-color: lighten( $darkBackColor, 6) !important;
    color: lighten( $darkFrontColor, 8) !important;
    border-color: lighten( $darkBackColor, 14) !important;
  }
  
  .handsontable .changeType,
  .handsontable .htUISelectCaption,
  .handsontable tr td {
    background-color: lighten( $darkBackColor, 7) !important;
    border-color: lighten( $darkBackColor, 17) !important;
    color: darken( $darkFrontColor, 10) !important;
    a { color: $audibleOrange; }
    a:visited { color: darken( $audibleOrange, 20); }
  }
  .handsontable .changeType {
    color: $darkBackColor !important;
    background-color: $audibleOrange !important;
  }
  .ht_master tr td {
    background-color: lighten( $darkBackColor, 4) !important;
    border-color: lighten( $darkBackColor, 14) !important;
    color: darken( $darkFrontColor, 15) !important;
  }
	// Sort - Arrow down
	.handsontable span.colHeader.columnSorting.descending::before {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAYAAAD+MdrbAAAAlklEQVR4Ae3SgQWDMRQE4CILdIlMEgqdJIUOk07TSbJEFihe30OgTnrV8MMdB/p89L+cLvfrsvaRb/cCBQoUKPBIUKBAgX7zsH1pASbvcwMWRpp/6+ztf2A9jPkNJ5q9w37P8GY4iv9QvC/jE7dltXKgN+NTqWdDLt/odwiXB4vSIFweLMqDaHmwKA+C5cGiJIjRGmVu33JaAuqWzL7ZAAAAAElFTkSuQmCC');
	}
	// Sort - Arrow up
	.handsontable span.colHeader.columnSorting.ascending::before {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAoCAYAAAD+MdrbAAAAj0lEQVR42u2TsQmAMBBFLbJAlsgkARsn0cZh4jROkiVcwOK8IiD4lX+pbO7Bh0DCax4ZxnWiE5FFN1veWmRZd7ZlKiSypDuk0c7JJkRZ1FVBqi4SIciCbpcP2l3oEW7CKUx4FzWD5d+LmsHyWLQLLE+KMrA8FGWw8qRoN4V/vQfsvQtd6EIXutCFLnThj8IL2/8C642rXg4AAAAASUVORK5CYII=');
	}
  
  .handsontable td.currentRow,
  .handsontable td.current,
  .handsontable td.highlight {
    background: darken( $darkBackColor, 5 ) !important;
  }
  
  td.htFiltersMenuActionBar.highlight,
  td.htFiltersMenuCondition.highlight { background: lighten( $darkBackColor, 4) !important; }
  
} // .theme-dark

html.theme-light {
  
  .handsontable .changeType,
  .handsontable .htUISelectCaption,
  .handsontable tr td {
    background-color: darken( #fff, 1) !important;
    color: $lightFrontColor !important;
  }
  .ht_master tr td {
    background-color: #fff !important;
    color: $lightFrontColor !important;
  }
  
  .handsontable td.currentRow,
  .handsontable td.current,
  .handsontable td.highlight {
    color: #000 !important;
    background: #e1e1e1 !important;
    // font-weight: 500;
    // background: desaturate( lighten( $audibleOrange, 40 ), 30) !important;
  }
  
  td.htFiltersMenuActionBar.highlight,
  td.htFiltersMenuCondition.highlight { background:#fff !important; }
  
} // .thene-light


</style>
