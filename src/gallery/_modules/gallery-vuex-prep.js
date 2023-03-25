import store from "@output-modules/store/gallery-store-index.js";

export default function ( libraryData ) {
  
  // window.localStorage.clear();

  // Overwrite sticky defaults with local storage values
  store.commit("fromLocalStorage");
  // Listen for sticky commits and push them to local storage
  store.subscribe(function(mutation, state) {
    if ( 
      mutation.type === "stickyProp" || 
      mutation.type === 'updatePlayerProgress' 
    ) {
      localStorage.setItem("aleSettings", JSON.stringify( state.sticky ));
    }
    else if ( mutation.type === "prop" ) {
      _.each( _.isArray(mutation.payload) ? mutation.payload : [mutation.payload], function( payload ) {
        const mutationKey = _.get(payload, 'key', '');
        const arrayFirstItem_sticky = _.get(mutationKey, '0') === 'sticky';
        const startsWith_sticky = arrayFirstItem_sticky || !!mutationKey.match(/^sticky\./i);
        if ( startsWith_sticky ) localStorage.setItem("aleSettings", JSON.stringify(state.sticky));
      });
    }
  });
  
  const standalone = document.querySelector("html.standalone-gallery");
  
  store.commit("prop", [
    { key: "library", value: libraryData, freeze: standalone ? false : true },
    { key: "standalone", value: !!standalone },
    { key: "displayMode", value: window.matchMedia("(display-mode: standalone)").matches },
    { key: "urlOrigin", value: "https://audible" + libraryData.extras["domain-extension"] },
    { key: "extractSettings", value: libraryData.config },
  ]);
  
       if ( !libraryData.extras.pages.wishlist ) store.commit("stickyProp", { key: "subPageSource", value: 'library'  });
  else if ( !libraryData.extras.pages.books    ) store.commit("stickyProp", { key: "subPageSource", value: 'wishlist' });
  
  if ( !libraryData.books && libraryData.wishlist ) store.commit("stickyProp", { key: "subPageSource", value: 'wishlist' });

};