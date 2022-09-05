
import aleLibraryView from "@output-comps/aleLibraryView";
const aleGallery     = () => import( /* webpackPreload: true */ /* webpackChunkName: "gallery" */ "@output-pages/aleGallery");
const aleCollections = () => import( /* webpackChunkName: "collections" */ "@output-pages/aleCollections");
const aleCategories  = () => import( /* webpackChunkName: "categories" */ "@output-pages/subPages/aleCategories");
const aleSeries      = () => import( /* webpackChunkName: "series" */ "@output-pages/subPages/aleSeries");
const aleAuthors     = () => import( /* webpackChunkName: "authors" */ "@output-pages/subPages/aleAuthors");
const aleNarrators   = () => import( /* webpackChunkName: "narrators" */ "@output-pages/subPages/aleNarrators");
const alePublishers  = () => import( /* webpackChunkName: "publishers" */ "@output-pages/subPages/alePublishers");

export default {
  library: { 
    name: "library", path: "/library", component: aleGallery, meta: { gallery: true, title: 'Library', icon: [ 'fas', 'book' ] } 
  },
  
  collections: {
    path: "/collections",
    component: aleLibraryView,
    meta: {
      icon: [ 'fas', 'folder-open' ],
    },
    children: [
      { name: "collections", path: "", component: aleCollections, meta: { title: 'Collections' } },
      { name: "collection", path: ":collection", component: aleGallery, meta: { gallery: true, title: 'Collections' } }
    ]
  },
  
  wishlist: {
    path: "/wishlist",
    component: aleLibraryView,
    meta: {
      icon: [ 'fas', 'bookmark' ],
    },
    children: [
      { name: "wishlist", path: "", component: aleGallery, meta: { gallery: true, title: 'Wishlist' } },
    ]
  },
  
  subPages: {
    categories: {
      path: "/categories",
      meta: {
        icon: [ 'fas', 'indent' ],
        nestedGroup: 'subPages',
      },
      component: aleLibraryView,
      children: [
        { name: "categories", path: "", component: aleCategories, meta: { subPage: true, title: 'Categories' } },
        { name: "category", path: ":parent/:child?", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Categories' } }
      ],
    },
    series: {
      path: "/series",
      component: aleLibraryView,
      meta: {
        icon: [ 'fas', 'list-ol' ],
        nestedGroup: 'subPages',
      },
      children: [
        { name: "all-series", path: "", component: aleSeries, meta: { subPage: true, title: 'Series' } },
        { name: "series", path: ":series", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Series' } }
      ],
    },
    authors: {
      path: "/authors",
      component: aleLibraryView,
      meta: { 
        icon: [ 'fas', 'user-friends' ],
        nestedGroup: 'subPages',
      },
      children: [
        { name: "authors", path: "", component: aleAuthors, meta: { subPage: true, title: 'Authors' } },
        { name: "author", path: ":author", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Authors' } }
      ],
    },
    narrators: {
      path: "/narrators",
      component: aleLibraryView,
      meta: {
        icon: [ 'fas', 'users' ],
        nestedGroup: 'subPages',
      },
      children: [
        { name: "narrators", path: "", component: aleNarrators, meta: { subPage: true, title: 'Narrators' } },
        { name: "narrator", path: ":narrator", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Narrators' } }
      ],
    },
    publishers: {
      path: "/publishers",
      component: aleLibraryView,
      meta: {
        icon: [ 'fas', 'book' ],
        nestedGroup: 'subPages',
      },
      children: [
        { name: "publishers", path: "", component: alePublishers, meta: { subPage: true, title: 'Publishers' } },
        { name: "publisher", path: ":publisher", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Publishers' } }
      ],
    },
  },
  
  fallback: {
    path: '*',
    name:'404', 
    component: aleLibraryView,
  }
};