export default {
  methods: {
    // Titles scraped from different Audible pages can end up with mismatched
    // HTML entity encoding (one "&", the other "&amp;") for otherwise identical
    // text, so plain string equality isn't enough to detect a duplicate.
    decodeHTMLEntities: function(string) {
      const el = document.createElement("textarea");
      el.innerHTML = string;
      return el.value;
    }
  }
};
