import fs from 'fs';

const gallerySingleFile = process.env.gallerySingleFile;
const wallpaperSingleFile = process.env.wallpaperSingleFile;
const buildSingleFile = gallerySingleFile || wallpaperSingleFile;

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