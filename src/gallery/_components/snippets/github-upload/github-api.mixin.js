import axios from 'axios';

export default {
  methods: {
    /**
     * Makes an authenticated request to the GitHub REST API.
     * All auth headers live here so the individual wrappers below stay minimal.
     * @param {string} method HTTP method
     * @param {string} path API path (without base URL)
     * @param {Object|null} data Request body
     * @param {Object|null} params Query parameters
     * @returns {Promise}
     */
    ghRequest( method, path, data = null, params = null ) {
      return axios({
        method,
        url: `https://api.github.com/${path}`,
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        ...( data && { data } ),
        ...( params && { params } ),
      });
    },

    /** @param {string} path @param {Object|null} params */
    ghGet( path, params = null ) { return this.ghRequest( 'get', path, null, params ); },

    /** @param {string} path @param {Object} data */
    ghPost( path, data ) { return this.ghRequest( 'post', path, data ); },

    /** @param {string} path @param {Object} data */
    ghPut( path, data ) { return this.ghRequest( 'put', path, data ); },
  },
};
