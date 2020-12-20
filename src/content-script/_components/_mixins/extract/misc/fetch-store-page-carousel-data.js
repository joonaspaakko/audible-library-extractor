export default {
  methods: {
    
    // TODO: make sure this is as efficient as possible
    
    // People who bought this also bought... Popup contents
    getDataFromCarousel: function( parentBook, audible, key, carouselID ) {
      
      const carousel = $( audible.querySelector('#adbl-web-carousel-c'+ carouselID ) );
      
      if ( carousel.length > 0 ) {
        const books = [];
        
        const carouselItem = carousel.find('.responsive-product-square');
        const flyout = carouselItem.next('[id^=product-list-flyout]');
        const popover = flyout.find('.bc-popover-inner');
        
        popover.each(function() {
          
          const book = {};
          const flyout = $(this).closest('[id^=product-list-flyout]');
          const image = flyout.prev('.responsive-product-square').find('[id^="product-carousel-image"]');
          const cover = image.attr('src') || image.attr('data-lazy');
          const url = image.parent('a').attr('href');
          book.cover = cover.match(/\/images\/I\/(.*)._SL/)[1];
          book.url = url.split('?')[0];
          
          var list = $(this).find('ul');
          var listItems = list.find('li:not(.bc-size-base)');
          var subHeading = list.find('li.bc-size-base:nth-child(2)');
          if (subHeading.length > 0) book.subHeading = subHeading.text().trim();
          listItems.length = 4;
          $(listItems).each(function (i) {
            
            // const _this = this.querySelector('h2') || this;
            let text = this.textContent.trimAll();
            
            if (!this.querySelector('h2')) {
              text = text.trimToColon();
            }
            
            var line = (i + 1);
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
          books.push( book );
        });
        
        if ( books.length > 0 ) parentBook[key] = books;
        
      }
      
    },
    
  }
}