
export default {
	methods: {
		makeFullUrl: function( inputURL ) {
			const url = new Url(this.general.urlOrigin + inputURL );
			url.query.ipRedirectOverride = true;
			url.query.overrideBaseCountry = true;
			return url.toString();
			
		},
	}
}
