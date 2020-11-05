
export default {
	methods: {
		sortStringNameProp: function( params ) {
			// FIXME: Found out it happened because the sort is case sensitive...
			// FIXME: Publisher sort not executing
			const keyMinusName = params.sortKey.replace('.name','');
			return _.orderBy(params.books, function( o ) {
				console.log('%c' + '-----' + '', 'background-image: linear-gradient(90deg,#ff006b, #ff53ab); color: #fff; padding: 2px 5px; border-radius: 8px;', o, keyMinusName);
				return o[ keyMinusName ] ? o[ keyMinusName ][0].name.toLowerCase() : false;
			}, params.direction);
			
		}
	}
}
