import { createRouter, createWebHashHistory } from 'vue-router';
import store from "@output-modules/store/gallery-store-index.js";
import { openDB, validateCache, db, prefetchSplitData } from '@output-mixins/gallery-load-split-book-data.js';

import allRoutes from '@output-modules/gallery-routes.js';

export default function( libraryData, store ) {
  if ( libraryData ) {
    
    let routes = [];
    
    // HOME PAGE REDIRECT
    if ( libraryData.library ) {
      routes.push({ path: "/", redirect: "/library" });
    }
    else if ( libraryData.wishlist ) {
      routes.push({ path: "/", redirect: "/wishlist" });
    }
    
    // LIBRARY
    if ( libraryData.library ) {
      routes.push( allRoutes.library );
    }
    
    // WISHLIST
    // If library data is not fetched put wishlish before sub pages menu item
    if ( !libraryData.library && libraryData.wishlist ) {
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
    else if ( libraryData.library || libraryData.wishlist ) {
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
    if ( libraryData.library && libraryData.wishlist ) {
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

      let pageDbInstance = null;
      let validatedCacheID = null;
      const loadedPages = {};

      async function getPageDatabase( cacheID ) {
        if ( !pageDbInstance ) pageDbInstance = await openDB();
        if ( validatedCacheID !== cacheID ) {
          await validateCache( pageDbInstance, cacheID );
          if ( validatedCacheID !== null ) {
            _.each( loadedPages, (v, key) => delete loadedPages[key]);
          }
          validatedCacheID = cacheID;
        }
        return pageDbInstance;
      }

      async function loadPage( file, cacheID ) {
        const key = file.keyOverride || file.name;

        if ( loadedPages[key] ) return;

        const database = await getPageDatabase( cacheID );

        const tx = database.transaction(db.stores.pages, 'readonly');
        const cached = await new Promise((resolve, reject) => {
          const req = tx.objectStore(db.stores.pages).get(key);
          req.onsuccess = () => resolve(req.result ?? null);
          req.onerror   = () => reject(req.error);
        });

        let data;
        if ( cached ) {
          data = cached.data;
        } else {
          const res = await fetch(`data/${file.name}.${cacheID}.json`);
          if ( !res.ok ) throw new Error(res.status);
          data = await res.json();
          const writeTx = database.transaction(db.stores.pages, 'readwrite');
          await new Promise((resolve, reject) => {
            const req = writeTx.objectStore(db.stores.pages).put({ name: key, data });
            req.onsuccess = () => resolve();
            req.onerror   = () => reject(req.error);
          });
        }

        store.commit('buildStandaloneData', [{ key, value: data }]);
        loadedPages[key] = true;
      }

      let getJSON = function( to, from, next, files, afterError ) {

        const cacheID = libraryData.extras.cacheID;
        const pending = _.filter( files, file => !loadedPages[file.keyOverride || file.name] );

        Promise.all( pending.map(file => loadPage(file, cacheID)) ).catch(function() {
          if ( !afterError ) {
            setTimeout(function() {
              getJSON( to, from, next, files, 'afterError' );
            }, 1000);
          }
        })
        .finally(function() {
          viewRefreshClean(to, from, next);
          // First route's data is in; warm summary chunks in the background so book
          // details open instantly and summaries are ready for search. peopleAlsoBought
          // is intentionally left lazy. Self-dedupes, so calling it each route is fine.
          prefetchSplitData( libraryData.extras.splitFields, cacheID, { only: ['summary'] });
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
          else if ( libraryData.library ) {
            loaderArray.push({name: 'library'});
          }
          
          if ( libraryData.series      ) loaderArray.push({name: 'series'});
          if ( libraryData.collections ) loaderArray.push({name: 'collections'}); 
          if ( libraryData.userReviews ) loaderArray.push({name: 'userReviews'}); 
          
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