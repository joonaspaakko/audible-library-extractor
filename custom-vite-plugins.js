import fs from 'fs';

const gallerySingleFile = process.env.gallerySingleFile;
const wallpaperSingleFile = process.env.wallpaperSingleFile;
const buildSingleFile = gallerySingleFile || wallpaperSingleFile;

export const customFilePathsJSON = {
	name: 'Custom file paths json',
	writeBundle(opts, bundle) {
		if ( buildSingleFile ) return;

		const byFileName = {};
		for (const [, o] of Object.entries(bundle)) {
			byFileName[ o.fileName ] = o;
		}

		function collectDeps( fileName, seen = new Set() ) {
			if ( seen.has( fileName ) ) return seen;
			seen.add( fileName );
			const chunk = byFileName[ fileName ];
			if ( !chunk || chunk.type !== 'chunk' ) return seen;
			for ( const imp of [ ...( chunk.imports || [] ), ...( chunk.dynamicImports || [] ) ] ) {
				collectDeps( imp, seen );
			}
			for ( const css of chunk.viteMetadata?.importedCss || [] ) {
				seen.add( css );
			}
			for ( const asset of chunk.viteMetadata?.importedAssets || [] ) {
				seen.add( asset );
			}
			return seen;
		}

		const galleryEntry = Object.values( bundle ).find(
			c => c.type === 'chunk' && c.isEntry && /^assets\/gallery\.[^/]+\.js$/.test( c.fileName )
		);

		let galleryFiles = [];
		if ( galleryEntry ) {
			const deps = collectDeps( galleryEntry.fileName );
			for ( const fileName of [ ...deps ] ) {
				const chunk = byFileName[ fileName ];
				if ( chunk?.type === 'asset' && fileName.endsWith('.css') && chunk.source ) {
					const matches = chunk.source.matchAll( /url\(['"]?(?!data:|https?:|#)([^'")\s?#]+)['"]?\)/g );
					for ( const [ , ref ] of matches ) {
						const assetPath = 'assets/' + ref.split('/').pop();
						if ( byFileName[ assetPath ] ) deps.add( assetPath );
					}
				}
			}
			galleryFiles = [ ...deps ].sort();
		}

		const contents = 'window.galleryFilePaths = ' + JSON.stringify( galleryFiles, null, 2 ) + ';';
		fs.writeFileSync('./dist/file-paths.js', contents);
	}
};

// Single file builds are done first and the regular build is done last. When a signle file build is
// generated, it's moved to the project root with a different name. And during the regular build,
// all single file html files are moved back in done last,
export const customSingleFileGallery = {
	name: 'Custom single file gallery',
	// Before build
	generateBundle(ops, bundle) {
	},
	// After build
	writeBundle(opts, bundle) {
		// Preserving single file builds in the root folder until the entire build process finishes...
		if ( buildSingleFile ) {
			try {
				fs.renameSync('./dist/gallery.html', './single-file-gallery.html');
			} catch(e) {}
			try {
				fs.renameSync('./dist/animated-wallpaper.html', './single-file-animated-wallpaper.html');
			} catch(e) {}
		}
		// Regular build → move single file builds back to the dist folder...
		else {
			try {
				fs.renameSync('./single-file-gallery.html', './dist/single-file-gallery.html' );
			} catch(e) {}
			try {
				fs.renameSync('./single-file-animated-wallpaper.html', './dist/single-file-animated-wallpaper.html' );
			} catch(e) {}
		}
	}
};