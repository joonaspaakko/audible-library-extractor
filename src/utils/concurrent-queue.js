// Runs processor(item) on each item with at most `limit` calls in flight at once.
// processor must return a Promise. Resolves when every item is done.
export function concurrentQueue( items, limit, processor ) {
  return new Promise(( resolve, reject ) => {
  
    const total = items.length;
    if ( total === 0 ) { resolve(); return; }

    let nextIndex   = 0;
    let activeCount = 0;
    let completed   = 0;

    function next() {
      while ( activeCount < limit && nextIndex < total ) {
      
        const item = items[nextIndex++];
        activeCount++;
        processor( item ).then(() => {
          activeCount--;
          completed++;
          if ( completed === total ) resolve();
          else next();
        })
        .catch( reject );
        
      }
    }

    next();
    
  });
}
