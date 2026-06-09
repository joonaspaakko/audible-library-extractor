export default {
  methods: {
    getDataFromCarousel: function(parentBook, audible, key, sectionName) {

      const carousel = audible.querySelector( `adbl-product-carousel[skip-link-title="${sectionName}"]` );
      if ( !carousel ) return;

      const books = [];
      const items = carousel.querySelectorAll("adbl-product-grid-item");

      _.each( items, ( item ) => {

        const book = {};

        // ASIN
        const asinEl = item.querySelector("[data-asin]");
        if ( !asinEl ) return;
        const asin = DOMPurify.sanitize( asinEl.getAttribute("data-asin") );
        if ( !asin ) return;
        book.asin = asin;

        // COVER
        const img = item.querySelector("adbl-product-image img");
        if ( img ) {
          const src = DOMPurify.sanitize( img.getAttribute("src") || "" );
          const coverId = _.get( src.match(/\/images\/I\/(.*)._SL/), "[1]" );
          if ( coverId ) book.cover = coverId;
        }
        if ( !book.cover ) return;

        // TITLE
        const titleEl = item.querySelector("adbl-metadata[slot='title'] a");
        if ( titleEl ) book.title = DOMPurify.sanitize( titleEl.textContent.trim() );

        // AUTHOR
        const authorLinks = item.querySelectorAll("adbl-metadata[slot='author'] a");
        if ( authorLinks.length ) {
          const names = [];
          _.each( authorLinks, ( a ) => {
            const name = DOMPurify.sanitize( a.textContent.trim() );
            if ( name ) names.push( name );
          });
          if ( names.length ) book.authors = names.join(", ");
        }

        books.push( book );

      });

      if ( books.length > 0 ) parentBook[key] = books;

    },
  }
};
