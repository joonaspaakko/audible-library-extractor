<template>
  <div id="ale-spreadsheet">
    <b-table 
    v-if="data"
    :loading="loading"
    :data="data" 
    :headers="headers"
    :columns="columns"
    :bordered="true"
    :striped="true"
    :narrowed="true"
    :focusable="true"
    :mobile-cards="true"
    :sticky-header="true"
    pagination-size="is-small"
    custom-row-key="added"
    pagination-position="both"
    :paginated="true"
    :per-page="pageSize"
    :pagination-simple="true"
    default-sort="added"
    default-sort-direction="desc"
    aria-page-label="Page"
    aria-next-label="Next page"
    aria-previous-label="Previous page"
    aria-current-label="Current page"
    detailed
    detail-key="asin"
    :show-detail-icon="true"
    @details-open="detailsOpened"
    icon-pack="fas"
    sortIcon="chevron-up"
    sortIconSize="is-small"
    :height="tableHeight"
    >
      <template slot="detail" slot-scope="props">
        <div class="detail-size-wrapper" :style="{ maxWidth: detailsWidth }">
          <article class="media">
              <figure class="media-left">
                <span class="cover-image">
                  <img :src="makeCoverUrl(props.row.coverUrl)">
                </span>
              </figure>
              <div class="media-content">
                <div class="content">
                    <h3 class="title">{{ props.row.title }}</h3>
                    <div>
                      <small>{{ props.row.releaseDate }}</small> • <small>{{ props.row.length }}</small>
                    </div>
                    <div class="authors" v-if="props.row.authors">
                      <strong>Authors:</strong>
                      <span v-html="props.row.authors"></span>
                    </div>
                    <div class="narrators" v-if="props.row.narrators">
                      <strong>Narrators:</strong>
                      <span v-html="props.row.narrators"></span>
                    </div>
                    <div class="summary" v-html="props.row.summary"></div>
                </div>
              </div>
            </article>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>

import Vue from 'vue';
import { Table, Icon, ConfigProgrammatic } from 'buefy';
// import 'buefy/dist/buefy.css'

Vue.use( Table,);
Vue.use( Icon );

ConfigProgrammatic.setOptions({
  defaultIconComponent: 'font-awesome',
  defaultIconPack: 'fas',
});

// import Buefy from 'buefy';
// // import 'buefy/dist/buefy.css';
// Vue.use(Buefy, {
//   defaultIconComponent: 'font-awesome',
//   defaultIconPack: 'fas',
// });

import makeFullUrl from '../../_mixins/makeFullUrl';
import makeCoverUrl from '../../_mixins/makeCoverUrl';

export default {
  name: 'aleSpreadsheet',
  props: ['library', 'gallery', 'general', 'booksArray'],
  mixins: [
    makeFullUrl,
    makeCoverUrl,
  ],
  
  computed: {
    
    // computedHeaders: function() {
    //   return _.filter( this.headers, function( header ) {
    //     console.log( header );
    //   });
    // },
    
    tableData: function() {
      const vue = this;
      
      return _.map(vue.booksArray, function( book ) {
        const newBook = {};
        _.each( vue.keys, function( key, i ) {
          
          const sourceData = book[ key ];
          
          switch ( key ) {
            case 'authors':
            case 'narrators':
            case 'categories':
            case 'series':
            case 'publishers':
              newBook[ key ] = vue.linkifyArray({
                array: sourceData,
                url: 'url', 
                text: 'name', 
                delimiter: (key === 'categories') ? ' > ' : ', ',
              });
              break;
            
            case 'progress':
              newBook[ key ] = (sourceData == 0) ? 'Not started' : sourceData;
              break;
              
            case 'titleShort': 
              const sample = book.sample ? '<a class="play-sample" href="'+ book.sample +'" target="_blank">' +
                '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1OTYgNTk2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzIyMjt9LmNscy0ye2ZpbGw6I2ZmZjt9PC9zdHlsZT48L2RlZnM+PGc+PGc+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjk4LDU3MUEyNzMsMjczLDAsMCwxLDEwNSwxMDVhMjczLDI3MywwLDAsMSwzODYuMSwzODYuMUEyNzEuMTgsMjcxLjE4LDAsMCwxLDI5OCw1NzFaTTIyNyw0MDAuMzIsNDAwLjA5LDMwMSwyMjcsMTk1Ljc1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTI5OCw1MGMxMzcsMCwyNDgsMTExLDI0OCwyNDhTNDM1LDU0NiwyOTgsNTQ2LDUwLDQzNSw1MCwyOTgsMTYxLDUwLDI5OCw1ME0yMjYuMSw0MjZhMjMuNzgsMjMuNzgsMCwwLDAsMTEuNi0zbDE3Ni0xMDFjMTYuNC05LjEsMTYuNC0zMi44LDAtNDJsLTE3Ni0xMDdhMjMuOCwyMy44LDAsMCwwLTExLjYtM0EyNCwyNCwwLDAsMCwyMDIsMTk0VjQwMmEyNCwyNCwwLDAsMCwyNC4xLDI0TTI5OCwwQTI5OC4wNywyOTguMDcsMCwwLDAsMTgyLDU3Mi41NywyOTguMDgsMjk4LjA4LDAsMCwwLDQxNCwyMy40MywyOTYuMjYsMjk2LjI2LDAsMCwwLDI5OCwwWiIvPjwvZz48L2c+PC9zdmc+">' +
              '</a>' : '<span class="play-sample-placeholder"></span>';
              
              newBook[ key ] = 
                sample +
                '<a href="'+ vue.makeFullUrl(book.url) +'" target="_blank">' +
                  book.titleShort
                '</a>';
              break;
              
            default:
              newBook[ key ] = sourceData;
          }
        });
        return newBook;
      });  
    }
  },
  
  data: function() {
    return {
      loading: true,      
      keys: null,
      headers: null,
      data: null,
      columns: null,
      tableHeight: 500,
      detailsWidth: '300px',
      pageSize: 50,
    }
  },
  
  created: function() {
    Eventbus.$on('afterWindowResize', this.onWindowResize );
  },
	
	beforeDestroy: function() {
	 	Eventbus.$off('afterWindowResize', this.onWindowResize );
    $('#ale-spreadsheet').on('click', ".play-sample", this.sampleClick);
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
        vue.prepareColumns();
        vue.prepareData();
        
        vue.loading = false;
        vue.$nextTick(function() {
           
          vue.detailsWidth = $('.table-wrapper').width() + 'px';
          vue.tableHeight = vue.calculateTableHeight();
          $('#ale-spreadsheet').on('click', ".play-sample", vue.sampleClick);
          
        });
      }, 10);
    });
    
  },
  
  methods: {
    
    onWindowResize: function( msg ) {
			if ( msg.widthChanged ) {
        this.detailsWidth = $('.table-wrapper').width() + 'px';
      }
      this.tableHeight = this.calculateTableHeight( msg.height );
    },
    
    calculateTableHeight: function( winHeight ) {
      return (winHeight || $(window).height()) - 
        $('#ale-menu-actions').outerHeight(true) -
        ( $('.b-table .top.level').height()*2 ) -
        parseInt( $('.b-table .top.level').css('margin-bottom') ) *2;
    },
    
    detailsOpened: function( row, index ) {
      
    },
    
    sampleClick: function( e ) {
      const vue = this;
      e.preventDefault();
      const sampleUrl = $( e.currentTarget ).attr('href');
      const book = _.find( vue.library.books, ['sample', sampleUrl]);
      Eventbus.$emit('playSample', {
        from: 'aleSpredsheet',
        route: vue.$route,
        book: book,
      });
    },
    
    exportSpreadsheet: function() {
      // this.plugins.export.downloadFile('csv', {
			// 	filename: 'My Audible library', columnHeaders: true
			// });
    },
		
    prepareKeys: function() {
      const vue = this;
      // Gets all keys from the books array
      var keys = _.union(_.flatten(_.map(vue.library.books, (e) => _.keys(e))));
    
      // These are placed in the front of the table and the leftover columns follows alphabetical order
      var priorityKeys = [
        "added",
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
        'moreLikeThis',
        'peopleAlsoBought',
        'sample', // Slipped into titleShort in prepareData() method so they can be in a fixed column together
      ];
      keys = _.remove( keys, function( key ) {
        return !_.includes(removeKeys, key );
      });
      vue.keys = keys;

    },
    
    prepareData: function() {
      
      const vue = this;
      vue.data = _.map(vue.library.books, function( book ) {
        const newBook = {};
        _.each( vue.keys, function( key, i ) {
          
          const sourceData = book[ key ];
          
          switch ( key ) {
            case 'authors':
            case 'narrators':
            case 'categories':
            case 'series':
            case 'publishers':
              newBook[ key ] = vue.linkifyArray({
                array: sourceData,
                url: 'url', 
                text: 'name', 
                delimiter: (key === 'categories') ? ' > ' : ', ',
              });
              break;
            
            case 'progress':
              newBook[ key ] = (sourceData == 0) ? 'Not started' : sourceData;
              break;
              
            case 'titleShort': 
              const sample = book.sample ? '<a class="play-sample" href="'+ book.sample +'" target="_blank">' +
                '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1OTYgNTk2Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzIyMjt9LmNscy0ye2ZpbGw6I2ZmZjt9PC9zdHlsZT48L2RlZnM+PGc+PGc+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjk4LDU3MUEyNzMsMjczLDAsMCwxLDEwNSwxMDVhMjczLDI3MywwLDAsMSwzODYuMSwzODYuMUEyNzEuMTgsMjcxLjE4LDAsMCwxLDI5OCw1NzFaTTIyNyw0MDAuMzIsNDAwLjA5LDMwMSwyMjcsMTk1Ljc1WiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTI5OCw1MGMxMzcsMCwyNDgsMTExLDI0OCwyNDhTNDM1LDU0NiwyOTgsNTQ2LDUwLDQzNSw1MCwyOTgsMTYxLDUwLDI5OCw1ME0yMjYuMSw0MjZhMjMuNzgsMjMuNzgsMCwwLDAsMTEuNi0zbDE3Ni0xMDFjMTYuNC05LjEsMTYuNC0zMi44LDAtNDJsLTE3Ni0xMDdhMjMuOCwyMy44LDAsMCwwLTExLjYtM0EyNCwyNCwwLDAsMCwyMDIsMTk0VjQwMmEyNCwyNCwwLDAsMCwyNC4xLDI0TTI5OCwwQTI5OC4wNywyOTguMDcsMCwwLDAsMTgyLDU3Mi41NywyOTguMDgsMjk4LjA4LDAsMCwwLDQxNCwyMy40MywyOTYuMjYsMjk2LjI2LDAsMCwwLDI5OCwwWiIvPjwvZz48L2c+PC9zdmc+">' +
              '</a>' : '<span class="play-sample-placeholder"></span>';
              
              newBook[ key ] = 
                sample +
                '<a href="'+ vue.makeFullUrl(book.url) +'" target="_blank">' +
                  book.titleShort
                '</a>';
              break;
              
            default:
              newBook[ key ] = sourceData;
          }
        });
        return newBook;
      });
      
    },
    
    prepareHeaders: function() {
      
      const vue = this;
      vue.headers = _.map(vue.keys, function( key ) {
        const header = {
          text: key,
          align: 'left',
          sortable: false,
          value: 'name'
        };
        
        switch ( key ) {
          case 'blurb':
            // column.readOnly = false;
            break;
          case 'authors':
          case 'narrators':
          case 'categories':
          case 'series':
          case 'publishers':
            column.renderHtml = true;
            // column['cell-class'] = 'nowrap-links';
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
          case 'length':
          case 'releaseDate':
            // column.data = function( book ) {
            //   return (book[ key ] == 0) ? 'Not started' : book[ key ];
            // };
            // column['cell-class'] = 'nowrap';
            break;
          
          case 'sample':
            column.sticky = true;
            column.renderHtml = true;
            column.width = '28';
            break;
          
          case 'title':
          case 'titleShort':
            column.sticky = true;
            column.renderHtml = true;
            break;
            
          default:
        }
        
        column.sortable = true;
        column['cell-class'] = 'custom-td custom-' + _.kebabCase( key );
        if ( !column.field ) column.field = key;
        if ( !column.label ) column.label = _.startCase( key );
        return column;
      });
      
    },
    
    prepareColumns: function() {
      
      const vue = this;
      
      // These won't show up in the table columns/rows/cells, but as long as
      // the data is there, I can access it in the details view...
      // The data being there depends on prepareData() method.
      const hideFromColumns = [
        'title',
        'blurb',
        'sample',
        'coverUrl',
        'summary',
        'asin',
      ];
      const dollyKees = _.clone( vue.keys );
      const filteredKeys = _.remove( dollyKees, function( key ) {
        return !_.includes(hideFromColumns, key );
      });
      
      vue.columns = _.map(filteredKeys, function( key ) {
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
            column.renderHtml = true;
            // column['cell-class'] = 'nowrap-links';
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
          case 'length':
          case 'releaseDate':
            // column.data = function( book ) {
            //   return (book[ key ] == 0) ? 'Not started' : book[ key ];
            // };
            // column['cell-class'] = 'nowrap';
            break;
          
          case 'sample':
            column.sticky = true;
            column.renderHtml = true;
            column.width = '28';
            break;
            
          case 'added':
            column.label = 'id';
            break;
          
          case 'title':
          case 'titleShort':
            column.sticky = true;
            column.renderHtml = true;
            break;
            
          default:
        }
        
        column.searchable = true;
        column.sortable = true;
        column['cell-class'] = 'custom-td custom-' + _.kebabCase( key );
        if ( !column.field ) column.field = key;
        if ( !column.label ) column.label = _.startCase( key );
        
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
    linkifyArray: function( config ) { 
      const vue = this;
      if ( config.array ) {
        return _.map( config.array, function( o ) {
          return '<a target="_blank" href="'+ vue.makeFullUrl(o[ config.url ]) +'">'+ o[ config.text ] +'</a>'
        }).join( config.delimiter );
      }
    },
    
    empty( el ) {
      var child;
      while (child = el.lastChild) {
        el.removeChild(child);
      }
    },
    
  },
}
</script>

<style lang="scss">
@import '~@/_variables.scss';

#ale-spreadsheet {
  margin: 0 30px;
  margin-top: -40px;
  position: relative;
  
  .table-wrapper {
    // overflow: auto;
    @include themify($themes) {
      background: lighten( themed(backColor), 15);
      box-shadow: themed(shadowMedium), themed(shadowSmall);
    } 
    .table tr.detail {
      .detail-container,
      > td {
        padding: 0;
      }
      .detail-size-wrapper {
        max-width: 800px;
        position: -webkit-sticky;
        position: sticky;
        left: 0px;
        article {
          padding: 1rem;
        }
      }
      .detail-container {
        .cover-image img {
          width: 200px;
        }
        .title, 
        strong {
          @include themify($themes) {
            color: themed(frontColor);
          } 
        }
        .title {
          margin: 0 0 5px 0;
          font-size: 1.6em;
        }
        .summary {
          padding-top: 10px;
        }
      }
    }
  }
  .pagination-ellipsis,
  .pagination a {
    @include themify($themes) {
      background: lighten( themed(backColor), 15);
    } 
  }
  .pagination-link.is-current {
    @include themify($themes) {
      color: themed(audibleOrange);
    } 
  }
  .pagination {
    @include themify($themes) {
      color: themed(frontColor);
    } 
    small {
      font-size: 0.99em;
    }
  }
  .pagination-previous, .pagination-next, .pagination-link {
    box-shadow: 1px 2px 6px rgba(#000, .2);
    @include themify($themes) {
      border-color: rgba( themed(frontColor), .2);
    } 
  }
  
  td.break-all {
    word-break: break-all;
  }
  td.nowrap {
    white-space: nowrap;
  }
  td.nowrap-links a {
    white-space: nowrap;
  }
  
  td.custom-td {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  td.custom-title,
  td.custom-title-short {
    max-width: 350px;
  }
  td.custom-categories,
  td.custom-series {
    max-width: none;
  }
  
  .table {
    background-color: transparent !important;
  }
  
  @media screen and (max-width: 768px) {
    td.custom-td {
      max-width: none;
      overflow: visible;
      white-space: normal;
    }
    
    .table-wrapper {
      // overflow: auto;
      @include themify($themes) {
        background: transparent !important;
        box-shadow: none !important;
      }
    }
    .table {
      border: none !important;
    }
    .table tbody tr {
      @include themify($themes) {
        background: lighten( themed(backColor), 15);
        box-shadow: themed(shadowMedium), themed(shadowSmall);
      } 
    }
  }
  
  .chevron-cell { 
    line-height: 0; 
    padding-top: 0;
    padding-bottom: 0;
  }
  
  .play-sample {
    img {
      display: inline-block;
      width: 18px;
      vertical-align: middle;
      position: relative;
      top: -1px;
      margin-right: 7px;
      
    }
  }
  
  .play-sample-placeholder {
    display: inline-block;
    width: 20px;
    margin-right: 7px;
  }
  
  .th-wrap {
    overflow: visible;
    white-space: nowrap;
    text-overflow: ellipsis;
    .control { width: 100%; }
    input {
      font-family: 'Montserrat', sans-serif !important;
      font-size: 14px !important;
      line-height: 23px !important;
      padding: 1px 5px !important;
      height: 23px !important;
      @include themify($themes) {
        background: darken( themed(backColor), .1);
      } 
    }
  }
  
  
} // #ale-spreadsheet


.theme-light #ale-spreadsheet {
  
  .b-table .table {
    a {
      // color: saturate( $audibleOrange, 100%);
      color: #252525;
      &:visited {
        // color: desaturate( darken( adjust-hue( $audibleOrange, -45deg ), 10%), 10%);
        color: lighten( #252525, 45% );
      }
    }
  }
  
  .table.is-striped tbody tr:not(.is-selected):nth-child(even) td.is-sticky,
  .table.is-striped tbody tr:not(.is-selected):nth-child(even) {
    background: desaturate( darken( $lightBackColor, 1), 100 );
  }
  
}
.theme-dark #ale-spreadsheet {
  
  .b-table .table {
    a {
      // color: saturate( $audibleOrange, 100%);
      color: #e1e1e1;
      &:visited {
        // color: desaturate( darken( adjust-hue( $audibleOrange, -45deg ), 10%), 10%);
        color: darken( #e1e1e1, 45% );
      }
    }
  }
  
  .b-table .table.is-bordered th.is-current-sort, .b-table .table.is-bordered th.is-sortable:hover,
  .table.is-bordered td, .table.is-bordered th,
  .b-table .table {
    border-color: lighten( $darkBackColor, 7.3 );
  }
  
  .b-table .table-wrapper.has-sticky-header tr:first-child th,
  .b-table .table td.is-sticky {
    background: lighten( $darkBackColor, 5.5 );
    color: $darkFrontColor;
  }
  
  .table td, .table th {
    background: lighten( $darkBackColor, 4 );
    color: darken( $darkFrontColor, 2 );
  }
  
  .table.is-striped tbody tr:not(.is-selected):nth-child(even) td.is-sticky,
  .table.is-striped tbody tr:not(.is-selected):nth-child(even) td {
    background: lighten( $darkBackColor, 2);
  }
  
}

</style>
