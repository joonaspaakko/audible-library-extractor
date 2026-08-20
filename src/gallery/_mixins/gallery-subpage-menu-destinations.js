// SUBPAGE MENU DESTINATIONS
// Shared by the desktop subpage menu bar and the mobile menu accordion.
// Destinations always come from the live router, never from the route table: sub pages can be
// disabled per gallery (extras.subPageStates), so the static table lists routes that may never
// have been registered.

export function getSubpageMenuDestinations( router, source ) {

  const subPages = _.filter( router.options.routes, ( route ) => {

    const childMeta = _.get( route, 'children[0].meta' );

    // subPage: categories/series/authors/narrators/publishers, scoped to whichever source owns them.
    // subPageBar: collections/podcasts, which only ever belong under the library.
    if ( _.get( childMeta, 'subPage' ) ) return true;
    if ( _.get( childMeta, 'subPageBar' ) ) return source === 'library';
    return false;

  });

  return _.map( _.orderBy( subPages, 'meta.order', 'asc' ), ( route ) => {
    return {
      key       : _.get( route, 'children[0].name' ),
      label     : _.get( route, 'children[0].meta.title' ),
      indexName : _.get( route, 'children[0].name' ),
      detailName: _.get( route, 'children[1].name' ),
      icon      : _.get( route, 'meta.icon' ),
      subPageBar: !!_.get( route, 'children[0].meta.subPageBar' ),
    };
  });

}

// Route names are shared between library and wishlist, so the source has to match too.
// Without it every "Series" tab would light up regardless of which collection it browses.
export function isDestinationActive( destination, source, route, stickySource ) {

  const nameMatch     = route.name === destination.indexName || route.name === destination.detailName;
  const currentSource = route.query.subPageSource || stickySource;

  return nameMatch && currentSource === source;

}

// Which collection the current page belongs to. Library and wishlist own themselves, sub
// pages fall back to whichever collection they're listing.
export function currentSubpageMenuSource( route, stickySource ) {

  const routeSource = _.get( route, 'meta.subpageMenuSource' );
  if ( routeSource ) return routeSource;

  // subPage: the categories/series/authors/narrators/publishers sub pages, scoped to library or wishlist.
  // subPageBar: collections/podcasts, which only show the bar itself and never scope by source.
  if ( _.get( route, 'meta.subPage' ) || _.get( route, 'meta.subPageBar' ) ) {
    return route.query.subPageSource || stickySource;
  }

  return null;

}

export function subpageMenuSourceAvailable( store, source ) {

  const data = store.state.audibledata;

  return !!( data[ source ] || _.get( data, 'extras.pages.' + source ) );

}
