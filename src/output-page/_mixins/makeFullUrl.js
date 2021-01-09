
export default {
	methods: {
		makeFullUrl: function( inputURL ) {
			
			const url = new Url(this.$store.state.urlOrigin + inputURL );
			url.query.ipRedirectOverride = true;
			url.query.overrideBaseCountry = true;
			return url.toString();
			
		},
		makeUrl: function( type, input ) {
			const base = this.$store.state.urlOrigin;
			let newUrl = '';
			
			switch( type ) {
				case 'store':
				case 'book':
					newUrl = base +'/pd/' + input;
					break;
				case 'author':
					if ( input.url ) newUrl = base + '/author/' + input.url;
					break;
				case 'narrator':
					if ( input.name ) newUrl = base + '/search?searchNarrator=' + decodeURIComponent( input.name );
					break;
				case 'series':
					if ( input.asin ) newUrl = base + '/series/' + input.asin;
					break;
				case 'publisher':
					if ( input.name ) newUrl = base + '/search?searchProvider=' + decodeURIComponent( input.name );
					break;
			}
			
			if ( !newUrl ) { return ''; }
			else {
				let url = new Url( newUrl );
				url.query.ipRedirectOverride = true;
				url.query.overrideBaseCountry = true;
				return url.toString();
			}
			
		},
	},
}
