export default {
  methods: {
    getDataFromCarousel: function(parentBook, audible, key, carouselID) {
      const carousel = audible.querySelector( "#adbl-web-carousel-c" + carouselID );

      if (carousel) {
        const books = [];
        const flyouts = carousel.querySelectorAll("[id^=product-list-flyout]");

        flyouts.forEach(function(el) {
          const book = {};
          const imageWrapper = el.previousElementSibling;
          const image = imageWrapper.querySelector('[id^="product-carousel-image"]');
          const cover = image.getAttribute("src") || image.getAttribute("data-lazy");

          const coverId = cover.match(/\/images\/I\/(.*)._SL/);
          if (coverId && coverId[1]) book.cover = DOMPurify.sanitize( coverId[1] );

          book.asin = "" + DOMPurify.sanitize(imageWrapper.querySelector("[data-asin]").getAttribute("data-asin"));

          var list = el.querySelector("ul");
          var listItems = list.querySelectorAll("li:not(.bc-size-base)");
          var subHeading = list.querySelector("li.bc-size-base:nth-child(2)");
          if (subHeading) book.subHeading = DOMPurify.sanitize(subHeading.textContent.trim());
          listItems.forEach(function(el, i) {
            let text = DOMPurify.sanitize(el.textContent.trimAll());

            if (!el.querySelector("h2")) {
              text = text.trimToColon();
            }

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
          books.push(book);
        });

        if (books.length > 0) parentBook[key] = books;
      }
    }
  }
};
