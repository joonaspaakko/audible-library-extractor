import fs from 'fs';

const buildSingleFile = process.env.buildSingleFile;

export const customFilePathsJSON = {
	name: 'Custom file paths json',
	writeBundle(opts, bundle) {
		if ( buildSingleFile ) return;
		
		const files = [];
		for (const [key, o] of Object.entries(bundle)) {
			files.push( o.fileName );
		}

		const contents = 'window.chunksFilePaths = ' + JSON.stringify(files.sort(), null, 2) + ';';
		fs.writeFileSync('./dist/file-paths.js', contents);
		
	}
};

export const customSingleFileGallery = {
	name: 'Custom single file gallery',
	// Before build
	generateBundle(ops, bundle) {
	},
	// After build
	writeBundle(opts, bundle) {
		if ( buildSingleFile ) {
			fs.renameSync('./dist/gallery.html', './single-file-gallery.html');
		}
		else {
			fs.renameSync('./single-file-gallery.html', './dist/single-file-gallery.html' );
		}
	}
};