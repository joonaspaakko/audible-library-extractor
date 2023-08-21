import { createRouter, createWebHashHistory } from 'vue-router';
import store from "@output-modules/store/gallery-store-index.js";

import allRoutes from '@output-modules/gallery-routes.js';

export default function( libraryData, store ) {
  if ( libraryData ) {
    
    let routes = [];
    
    // HOME PAGE REDIRECT
    if ( libraryData.books ) {
      routes.push({ path: "/", redirect: "/library" });
    }
    else if ( libraryData.wishlist ) {
      routes.push({ path: "/", redirect: "/wishlist" });
    }
    
    // LIBRARY
    if ( libraryData.books ) {
      routes.push( allRoutes.library );
    }
    
    // WISHLIST
    // If library data is not fetched put wishlish before sub pages menu item
    if ( !libraryData.books && libraryData.wishlist ) {
      routes.push( allRoutes.wishlist );
    }
    
    // SUB PAGES
    var subPages = allRoutes.subPages;
    
    // Standalone-gallery SUBPAGES
    let subPageStates = _.get( libraryData, 'extras.subPageStates' );
    if ( subPageStates ) {
      _.each(subPageStates, function( item ) {
        if ( item.enabled ) routes.push( subPages[ item.key ] );
      });
    }
    // Extension-gallery SUBPAGES
    else if ( libraryData.books || libraryData.wishlist ) {
      _.each(subPages, function( subPage ) {
        routes.push( subPage );
      });
    }
    
    // COLLECTIONS
    if ( libraryData.collections ) {
      routes.push( allRoutes.collections );
    }
    
    // PODCASTS
    if ( libraryData.podcasts || store.getters.podcasts.length ) {
      routes.push( allRoutes.podcasts );
    }
    
    // WISHLIST
    // If library is also extracted, push wishlist as the last menu item
    if ( libraryData.books && libraryData.wishlist ) {
      routes.push( allRoutes.wishlist );
    }
    
    routes.push( allRoutes.fallback );

    const router = createRouter({
      history: createWebHashHistory(import.meta.env.BASE_URL),
      routes,
      scrollBehavior(to, from, savedPosition) {
        if (savedPosition ) {
          return savedPosition;
        } else {
          if (from && to.name === from.name && _.isEqual(to.params, from.params)) {
            return;
          } else {
            return { x: 0, y: 0 };
          }
        }
      }
    });
    
    // Tries to load relevant JSON data from a file before each route change on the standalone site
    const standalone = document.querySelector("html.standalone-gallery");
    if ( standalone ) {
      
      function loadScript(file) {
        return new Promise(function(resolve, reject) {
          let script = document.createElement('script');
          script.src = (file.prefix || "data/") + file.name +"."+ libraryData.extras.cacheID +".js";
          script.type = "text/javascript";
          script.onload = function() {
            resolve(file);
            script = null;
          };
          script.onerror = function() {
            reject(file);
            script = null;
          };
          document.body.appendChild(script);
        });
      }
      
      let getJSON = function( to, from, next, files, afterError ) {
        
        // Exclude JSON that's already been loaded
        files = _.filter( files, function( file ){ return window[file.name+'JSON'] !== true; });
        
        // save all Promises as array
        let promises = [];
        files.forEach(function(file) {
          promises.push(loadScript(file));
        });
        
        Promise.all(promises).catch(function() {
          if ( !afterError ) {
            setTimeout(function() {
              getJSON( to, from, next, files, 'afterError' );
            }, 1000);
          }
        }).finally(function() {
          
          let storageArray = _.map( files, function( file ) { 
            return {
              key: (file.keyOverride || file.name),
              value: window[file.name+'JSON'],
            }; 
          });
          store.commit("buildStandaloneData", storageArray);
          _.each( files, function( file ) { window[file.name+'JSON'] = true; });
          viewRefreshClean(to, from, next);
          
        });
        
      };
      
      router.beforeEach((to, from, next) => {
        
        beforeEach( to, from, next );
        
        const routeChanged = from.name !== to.name;
        const bookChanged = _.get(from, 'query.book') !== _.get(to, 'query.book');
        const subPageSourceChanged = from.query.subPageSource !== to.query.subPageSource;
        
        if ( to.name && ( routeChanged || bookChanged || subPageSourceChanged ) ) {
          
          
          const loaderArray = [];
          const openingWishlist = to.name === 'wishlist' || 
                                  to.query.subPageSource === 'wishlist' || 
                                  to.meta.subPage && !to.query.subPageSource && store.state.sticky.subPageSource === 'wishlist';
          
          if ( libraryData.wishlist && openingWishlist ) {
            loaderArray.push({name: 'wishlist'}); 
          }
          else if ( libraryData.books ) {
            loaderArray.push({name: 'library', keyOverride: 'books'}); 
          }
          
          if ( libraryData.series      ) loaderArray.push({name: 'series'});
          if ( libraryData.collections ) loaderArray.push({name: 'collections'}); 
          
          getJSON( to, from, next, loaderArray);
        
        }
        else { 
          viewRefreshClean(to, from, next);
        }
      });
      
    }
    else {
      
      router.beforeEach((to, from, next) => {
        beforeEach( to, from, next );
        viewRefreshClean( to, from, next );
      });
      
    }
    
    router.afterEach((to, from, next) => {
      
      afterEach();
      
      if ( from.name !== to.name ) {
        
        const navForward = store.state.navHistory.forward;
        const navBack = store.state.navHistory.back;
        
        if ( 
          from.name && from.name !== navForward[ navForward.length-1]  && from.name !== navBack[ navBack.length-1 ] 
        ) {
          store.commit('navHistory', { key: 'back', value: from.name, pushOnly: true });
        }
        
        if ( !store.state.navHistory.btnNavigation ) store.commit('prop', { key: 'navHistory.forward', value: [] });
        store.commit('prop', { key: 'navHistory.btnNavigation', value: false });
        
      }
    });
    
    return router;
  
  }
};

function viewRefreshClean( to, from, next ) {
  if ( to.query.refresh ) { 
    delete to.query.refresh;
    next(to);
  }
  else {
    next();
  }
}

function beforeEach( to, from, next ) {
  if ( to.query.refresh ) { 
    store.commit('prop', [
      { key: 'showRoute', value: false },
      { key: 'refreshViewTimeStamp', value: new Date().getTime() },
    ]);
  }
}
function afterEach() {
  store.commit('prop', [
    { key: 'showRoute', value: true },
  ]);
}