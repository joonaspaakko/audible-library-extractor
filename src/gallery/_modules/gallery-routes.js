
import aleLibraryView from "@output-comps/gallery-library-view.vue";
const aleGallery     = () => import("@output-pages/gallery-root.vue");
const aleCollections = () => import("@output-pages/gallery-collections.vue");
const aleCategories  = () => import("@output-pages/subPages/gallery-categories.vue");
const aleSubPage     = () => import("@output-pages/subPages/gallery-sub-page.vue");
import { seriesConfig, authorsConfig, narratorsConfig, publishersConfig } from "@output-pages/subPages/gallery-sub-page-configs.js";

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
  
  podcasts: {
    path: "/podcasts",
    component: aleLibraryView,
    meta: {
      icon: 'fa-solid fa-podcast',
    },
    children: [
      { name: "podcasts", path: "", component: aleGallery, meta: { gallery: true, title: 'Podcasts' } },
    ]
  },
  
  subPages: {
    categories: {
      path: "/categories",
      meta: {
        icon: 'fa-solid fa-indent',
        nestedGroup: 'subPages',
        order: 0,
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
        order: 1,
      },
      children: [
        { name: "all-series", path: "", component: aleSubPage, props: { routeConfig: seriesConfig }, meta: { subPage: true, title: 'Series' } },
        { name: "series", path: ":series", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Series' } }
      ],
    },
    authors: {
      path: "/authors",
      component: aleLibraryView,
      meta: { 
        icon: 'fa-solid fa-user-group',
        nestedGroup: 'subPages',
        order: 2,
      },
      children: [
        { name: "authors", path: "", component: aleSubPage, props: { routeConfig: authorsConfig }, meta: { subPage: true, title: 'Authors' } },
        { name: "author", path: ":author", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Authors' } }
      ],
    },
    narrators: {
      path: "/narrators",
      component: aleLibraryView,
      meta: {
        icon: 'fa-solid fa-users',
        nestedGroup: 'subPages',
        order: 3,
      },
      children: [
        { name: "narrators", path: "", component: aleSubPage, props: { routeConfig: narratorsConfig }, meta: { subPage: true, title: 'Narrators' } },
        { name: "narrator", path: ":narrator", component: aleGallery, meta: { gallery: true, subPage: true, title: 'Narrators' } }
      ],
    },
    publishers: {
      path: "/publishers",
      component: aleLibraryView,
      meta: {
        icon: 'fa-solid fa-book',
        nestedGroup: 'subPages',
        order: 4,
      },
      children: [
        { name: "publishers", path: "", component: aleSubPage, props: { routeConfig: publishersConfig }, meta: { subPage: true, title: 'Publishers' } },
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