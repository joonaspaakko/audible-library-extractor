
import aleLibraryView from "@output-comps/gallery-library-view.vue";
const aleGallery     = () => import("@output-pages/gallery-root.vue");
const aleCollections = () => import("@output-pages/gallery-collections.vue");
const aleCategories  = () => import("@output-pages/subPages/gallery-categories.vue");
const aleSubPage     = () => import("@output-pages/subPages/gallery-sub-page.vue");
import { seriesConfig, authorsConfig, narratorsConfig, publishersConfig } from "@output-pages/subPages/gallery-sub-page-configs.js";

// ICON IMPORTS
import IconFaSolidBook         from '~icons/fa6-solid/book?raw';
import IconFaRegularFolderOpen from '~icons/fa6-regular/folder-open?raw';
import IconFaSolidBookmark     from '~icons/fa6-solid/bookmark?raw';
import IconFaSolidPodcast      from '~icons/fa6-solid/podcast?raw';
import IconFaSolidHome         from '~icons/fa6-solid/house?raw';
// Sub-page icons — kept in sync with the search scope icons in gallery-search.vue
import IconFaSolidFolder       from '~icons/fa6-solid/folder?raw';
import IconFaSolidLayerGroup   from '~icons/fa6-solid/layer-group?raw';
import IconFaSolidUserPen      from '~icons/fa6-solid/user-pen?raw';
import IconFaSolidMicrophone   from '~icons/fa6-solid/microphone?raw';
import IconFaSolidBuilding     from '~icons/fa6-solid/building?raw';

export default {
  library: { 
    name: "library", path: "/library", component: aleGallery, meta: { gallery: true, title: 'Library', icon: IconFaSolidBook, subpageMenuSource: 'library' }
  },
  
  collections: {
    path: "/collections",
    component: aleLibraryView,
    meta: {
      icon: IconFaRegularFolderOpen,
      nestedGroup: 'subPages',
      order: -2,
    },
    children: [
      { name: "collections", path: "", component: aleCollections, meta: { subPageBar: true, title: 'Collections' } },
      { name: "collection", path: ":collection", component: aleGallery, meta: { gallery: true, subPageBar: true, title: 'Collections' } }
    ]
  },
  
  wishlist: {
    path: "/wishlist",
    component: aleLibraryView,
    meta: {
      icon: IconFaSolidBookmark,
      subpageMenuSource: 'wishlist',
    },
    children: [
      { name: "wishlist", path: "", component: aleGallery, meta: { gallery: true, title: 'Wishlist' } },
    ]
  },
  
  podcasts: {
    path: "/podcasts",
    component: aleLibraryView,
    meta: {
      icon: IconFaSolidPodcast,
      nestedGroup: 'subPages',
      order: -1,
    },
    children: [
      { name: "podcasts", path: "", component: aleGallery, meta: { gallery: true, subPageBar: true, title: 'Podcasts' } },
    ]
  },
  
  subPages: {
    categories: {
      path: "/categories",
      meta: {
        icon: IconFaSolidFolder,
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
        icon: IconFaSolidLayerGroup,
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
        icon: IconFaSolidUserPen,
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
        icon: IconFaSolidMicrophone,
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
        icon: IconFaSolidBuilding,
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