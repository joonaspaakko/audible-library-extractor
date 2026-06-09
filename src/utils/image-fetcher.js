import axios from 'axios';
import axiosRetry from 'axios-retry';

const http = axios.create();
axiosRetry( http, { retries: 3, retryDelay: retryCount => retryCount * 500 } );

export function fetchAsArrayBuffer( url ) {
  return http.get( url, { responseType: 'arraybuffer' }).then( r => r.data );
}

export function fetchAsDataUrl( url ) {
  return http.get( url, { responseType: 'blob' }).then( r => {
    return new Promise(( resolve, reject ) => {
      const reader = new FileReader();
      reader.onload  = () => resolve( reader.result );
      reader.onerror = reject;
      reader.readAsDataURL( r.data );
    });
  });
}
