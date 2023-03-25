
import aleLibraryView from "@output-comps/gallery-library-view.vue";
const aleGallery     = () => import( /* webpackPreload: true */ /* webpackChunkName: "gallery" */ "@output-pages/gallery-root.vue");
const aleCollections = () => import( /* webpackChunkName: "collections" */ "@output-pages/gallery-collections.vue");
const aleCategories  = () => import( /* webpackChunkName: "categories" */ "@output-pages/subPages/gallery-categories.vue");
const aleSeries      = () => import( /* webpackChunkName: "series" */ "@output-pages/subPages/gallery-series.vue");
const aleAuthors     = () => import( /* webpackChunkName: "authors" */ "@output-pages/subPages/gallery-authors.vue");
const aleNarrators   = () => import( /* webpackChunkName: "narrators" */ "@output-pages/subPages/gallery-narrators.vue");
const alePublishers  = () => import( /* webpackChunkName: "publishers" */ "@output-pages/subPages/gallery-publishers.vue");

export default {
  library: { 
    name: "library", path: "/library", component: aleGallery, meta: { gallery: true, title: 'Library', icon: 'fa-solid fa-book' } 
  },
  
  collections: {
    path: "/collections",
    component: aleLibraryView,
    meta: {
      icon: 'fa-regular fa-folder-open',
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
      icon: 'fa-solid fa-bookmark',
    },
    children: [
      { name: "wishlist", path: "", component: aleGallery, meta: { gallery: true, title: 'Wishlist' } },
    ]
  },
  
  subPages: {
    categories: {
      path: "/categories",
      meta: {
        icon: 'fa-solid fa-indent',
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
        icon: 'fa-solid fa-list-ol',
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
        icon: 'fa-solid fa-user-group',
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
        icon: 'fa-solid fa-users',
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
        icon: 'fa-solid fa-book',
        nestedGroup: 'subPages',
      },
      children: [
        { name: "publishers", path: "", component: alePublishers, meta: { subPage: true, title: 'Publishers' } },
        { name: "publisher", path: ":publisher", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Publishers' } }
      ],
    },
  },
  
  fallback: {
    path: '/:pathMatch(.*)*',
    name:'404', 
    component: aleLibraryView,
    meta: {},
  }
};