<template>
  <div id="ale-spreadsheet">
		<hot-table
      :settings="options"
      :colHeaders="colHeaders"
      :columns="columns"
      ref="hotTableComponent"
		></hot-table>
  </div>
</template>

<script>
import { HotTable } from '@handsontable/vue';
import Handsontable from 'handsontable';

export default {
  name: 'aleSpreadsheet',
  props: ['library'],
  components: {
    HotTable
  },
  created: function() {
    
    this.prepareKeys();
    this.prepareColheaders();
    this.prepareColumns();
    
    Eventbus.$on('csvExportStarted', this.exportSpreadsheet );
  	
  },
  
  mounted: function(){
    this.hot = this.$refs.hotTableComponent.hotInstance;
		this.plugins.export = this.hot.getPlugin('exportFile');
  },
  
  beforeDestroy: function() {
    
    this.hot = null;
    this.plugins.export = null;
    
    Eventbus.$off('csvExportStarted', this.exportSpreadsheet );
    
  },
  
  data: function() {
    return {
      hot: null,
      plugins: {
        export: null,
      },
      keys: null,
      colHeaders: null,
      columns: null,
      options: {
        licenseKey: 'non-commercial-and-evaluation',
        // width: '100vw',
        // height: '100vh',
        data: this.library.books,
        // data: Handsontable.helper.createSpreadsheetData(1000, 40),
        // search: true,
        readOnly: true,
        filters: true,
        // https://handsontable.com/docs/7.4.2/demo-searching.html
        // https://handsontable.com/docs/7.4.2/demo-filtering.html
        dropdownMenu: ['filter_by_condition', 'filter_action_bar'], // Caution: Filters initial column contents, not rendered
        columnSorting: true,
        manualColumnMove: true,
        manualRowMove: true,
        allowInsertRow: false,
        allowInsertColumn: false,
        allowRemoveRow: false,
        allowRemoveColumn: false,
        // autoColumnSize: true,
        // autoRowSize: true,
        manualRowResize: true,
        manualColumnResize: true,
        fixedRowsTop: 0,
        fixedColumnsLeft: 1,
        contextMenu: ['copy', 'hide'],
        rowHeaders: true,
        currentRowClassName: 'currentRow',
        // colWidths: '300px',
        // modifyColWidth: function(width, col){
        //   if(width > 300){
        //   	return 300
        //   }
        // },
        afterRender: function() {
          
          $('#ale-spreadsheet td').each(function() {
            $(this).attr('title', $(this).html() );
          });
          
        }
      }
    }
  },
  methods: {
		
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
        "title",
        "authors",
        "narrators",
        "categories",
        "series",
        "bookNumbers",
        "summary",
        "length",
        "progress",
        "dateAdded",
        "releaseDate",
        "publisher",
        "ownRating",
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
        'summary',
        'url',
        'storePageMissing',
        'moreLikeThis',
        'peopleAlsoBought',
        'changesSinceAdded',
        'downloadUrl',
        'coverUrl',
        'downloaded'
      ];
      keys = _.remove( keys, function( key ) {
        return !_.includes(removeKeys, key );
      });
      vue.keys = keys;

    },
    prepareColheaders: function() {
      
      const vue = this;
      const colHeaders = [];
      _.forEach(vue.keys, function(key) {
        colHeaders.push( _.startCase( key ) );
      });
      vue.colHeaders = colHeaders;
      
    },
    prepareColumns: function() {
      
      const vue = this;
      vue.columns = _.map(vue.keys, function( key ) {
        var data = null;
        switch ( key ) {
          case 'authors':
          case 'narrators':
          case 'categories':
          case 'series':
            data = function( book ) {
              // console.log( book );
              var delimiter = key === 'categories' ? ' > ' : null;
              return vue.stringifyArray( book[ key ], delimiter );
            };
            break;
          default:
            data = key;
        }
        return {
          data: data
        };
      });
      
    },
    
    stringifyArray: function( array, delimiter ) {
      if ( array ) {
        var html = '';
        array.forEach((item, index ) => {
          html += item.name;
          if ( index < array.length-1 ) html += (delimiter || ', ');
          // html += '<a href="'+ item.url +'" target="_blank">'+ item.name +'</a>';
          // if ( index < array.length-1 ) html += (delimiter || ', ');
        });
        return html;
      }
    },
    
    renderers: function() {
      return {
        link: function(instance, td, row, col, prop, value, cellProperties) {
          Handsontable.dom.empty(td);
        },
        cover: function(instance, td, row, col, prop, value, cellProperties) {
          Handsontable.dom.empty(td);
          
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
  position: absolute;
	z-index: 888;
  top: 100px;
  right: 30px;
  bottom: 30px;
  left: 30px;
  overflow: hidden;
  
  .handsontable {
  }
  
  th, td {
    max-width: 300px;
    min-width: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    color: $audibleOrange !important;
    // font-weight: 600;
  }
  
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
    font-weight: 500;
  }
  
} // .thene-light


</style>
