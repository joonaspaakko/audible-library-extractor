
// I feel like since this page is definitely what I would call a "danger-zone", 
// this is read-only access to the contents of the purchase history page.
// Which is to say the extension can't fiddle with this page, just "read" the page contents.
export default {
  methods: {
    getDataFromPurchaseHistory: function(hotpotato, libraryPagesFetched) {
      const vue = this;
      
      // this.$root.$emit("update-big-step", {
      //   title: "Library",
      //   stepAdd: 1
      // });
      
      // this.$root.$emit("update-progress", {
      //   step: 0,
      //   max: 0,
      //   text: this.$store.state.storageHasData.books ? "Updating old books and adding new books..." : "Scanning library for books..."
      // });
      
      vue.scrapingPrep({
        url: vue.purchaseHistoryUrl, 
        maxSize: 20,
        done: function(prep) {
        
          const requestURL = prep.urlObj.toString();
          console.log( prep )
          
        }
      });
      
    },
    
  }
};

