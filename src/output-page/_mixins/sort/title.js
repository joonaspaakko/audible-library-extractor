
export default {
	methods: {
		sortTitle: function( params ) {
			
			return _.orderBy(params.books, function( o ) {
				if ( o.title ) {
					var titleLowercase = o.title.toLowerCase();
					const getThe = titleLowercase.match(/^the /);
					const getA = titleLowercase.match(/^a /);
					const getAn = titleLowercase.match(/^an /);
					const replacements = getThe && /^the / || getA && /^a / || getAn && /^an /;
					if ( replacements ) titleLowercase = titleLowercase.replace( replacements,'');
					return titleLowercase;
				}
				else { return null; }
			}, params.direction);
			
		}
	}
}
