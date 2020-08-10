
import slugify from './slugify'
export default {
	mixins: [
		slugify
	],
	methods: {
		buildCategories: function( book ) {
			
			const vue = this;
			const categories = {};
			// Make category arrays
			categories.parent = [];
			_.each(vue.library.books, function (book, index) {

				if (book.categories) {
					// Parent categories...
					const parentCategory = book.categories[0].name;
					// If parent category object doesn't exist, make it
					let parentObj = _.find(categories.parent, ['name', parentCategory]);
					if (!parentObj) {
						parentObj = categories.parent.push({
							name: parentCategory,
							slug: vue.slugify(parentCategory),
							books: [],
						});
					}
					parentObj = _.find(categories.parent, ['name', parentCategory]);
					// Push books to array
					parentObj.books.push(book);

					// Child categories...
					if (book.categories[1]) {
						if (!parentObj.sub) parentObj.sub = [];
						const childCategory = book.categories[1].name;
						// If child category object doesn't exist, make it
						let childObj = _.find(parentObj.sub, ['name', childCategory]);
						if (!childObj) {
							childObj = parentObj.sub.push({
								name: childCategory,
								slug: vue.slugify(childCategory),
								books: [],
							});
						}
						childObj = _.find(parentObj.sub, ['name', childCategory]);
						// Push books to array
						childObj.books.push(book);
					}

				}
			});

			// Sort all category arrays
			categories.parent = _.orderBy(categories.parent, 'name', 'asc');
			_.each(categories.parent, function (category, index) {
				category.sub = _.orderBy(category.sub, 'name', 'asc');
			});
			
			return categories;
		},
	}
}
