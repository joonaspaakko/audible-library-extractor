export default {
  methods: {
    getDataFromCarousel: function(parentBook, audible, key, carouselID) {
      const carousel = audible.querySelector( "#adbl-web-carousel-c" + carouselID );

      if (carousel) {
        const books = [];
        const flyouts = carousel.querySelectorAll(".carousel-product");

        _.each(flyouts, function(el) {
          
          const book = {};
          
          let image = el.querySelector('[id^="product-carousel-image"]');
          if ( image ) image = image.getAttribute("src") || image.getAttribute("data-lazy");
          if ( !image ) return false;

          let coverId = image.match(/\/images\/I\/(.*)._SL/);
          if (coverId && coverId[1]) coverId = "" + DOMPurify.sanitize( coverId[1] );
          if ( !coverId ) return false;
          book.cover = coverId;
          
          let bookASIN = el.querySelector("[data-asin]");
          if ( bookASIN ) bookASIN = bookASIN.getAttribute("data-asin");
          if ( bookASIN ) bookASIN = "" + DOMPurify.sanitize( bookASIN );
          if ( !bookASIN ) return false;
          book.asin = bookASIN;
          
          // As long as we have all of the above, we can return the book
          
          const list = el.querySelector("[id^=product-list-flyout] ul");
          let listItems, subHeading;
          if ( list ) {
            listItems = list.querySelectorAll("li:not(.bc-size-base)");
            if ( listItems ) {
              subHeading = list.querySelector("li.bc-size-base:nth-child(2)");
              if ( subHeading ) {
                let shTrailingComma = subHeading.querySelector('.bc-pub-offscreen');
                if ( shTrailingComma ) shTrailingComma.remove();
              }
              if ( subHeading ) subHeading = subHeading.textContent;
              if ( subHeading ) subHeading = DOMPurify.sanitize(subHeading.trim());
              if ( subHeading ) book.subHeading = subHeading;
            }
          }
          
          if ( listItems ) {
            _.each(listItems, function(el, i) {
              
              let trailingComma = el.querySelector('.bc-pub-offscreen');
              if ( trailingComma ) trailingComma.remove();
              
              let text = el.textContent;
              if ( text ) text = DOMPurify.sanitize(text.trimAll());
              if ( text && !el.querySelector("h2") ) text = text.trimToColon();
              if ( !text ) return false;
              
              var line = i + 1;
              switch (line) {
                case 1:
                  book.title = text;
                  break;
                case 2:
                  book.authors = text;
                  break;
                case 3:
                  book.narrators = text;
                  break;
                case 4:
                  book.length = text;
                  break;
              }
              
            });
          }
                    
          books.push(book);
          
        });

        if (books.length > 0) parentBook[key] = books;
        
      }
      
    },
  }
};
