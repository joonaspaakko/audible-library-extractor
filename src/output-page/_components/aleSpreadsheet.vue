<template>
  <div id="ale-spreadsheet">
		<hot-table
      :settings="options"
      :colHeaders="colHeaders"
      :columns="columns"
		></hot-table>
  </div>
</template>

<script>
import { HotTable } from '@handsontable/vue';

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
    
  },
  data: function() {
    return {
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
        colWidths: '300px',
        afterRender: function() {
          
          $('#ale-spreadsheet td').each(function() {
            $(this).attr('title', $(this).html() );
          });
          
        }
      }
    }
  },
  methods: {
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
  top: 200px;
  right: 30px;
  bottom: 30px;
  left: 30px;
  overflow: hidden;
  box-shadow: 0 7px 15px rgba( #000, .2 );
  
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

.theme-dark {
  .handsontable tr td {
    background-color: lighten( $darkBackColor, 7);
    border-color: lighten( $darkBackColor, 17);
  }
  .ht_master tr td {
    background-color: lighten( $darkBackColor, 4);
    border-color: lighten( $darkBackColor, 14);
  }
  .handsontable tbody th {
    background-color: lighten( $darkBackColor, 2);
    color: darken( $darkFrontColor, 5);
    border-color: lighten( $darkBackColor, 14);
  }
  .handsontable thead th {
    background-color: lighten( $darkBackColor, 6);
    color: $darkFrontColor;
    border-color: lighten( $darkBackColor, 14);
  }
} // .theme-dark

</style>
