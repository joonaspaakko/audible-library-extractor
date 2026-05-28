export async function storageGet( rootKey, path ) {
  const data = await chrome.storage.local.get( rootKey );
  return path ? _.get( data[ rootKey ], path ) : data[ rootKey ];
}

export async function storageSet( rootKey, path, value ) {
  const data = await chrome.storage.local.get( rootKey );
  const obj  = data[ rootKey ] || {};
  _.set( obj, path, value );
  return chrome.storage.local.set({ [ rootKey ]: obj });
}

export async function storageUnset( rootKey, path ) {
  const data = await chrome.storage.local.get( rootKey );
  const obj  = data[ rootKey ];
  if ( obj ) {
    _.unset( obj, path );
    return chrome.storage.local.set({ [ rootKey ]: obj });
  }
}
