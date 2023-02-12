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

export const customSingleFileGallery = {
	name: 'Custom single file gallery',
	// Before build
	generateBundle(ops, bundle) {
	},
	// After build
	writeBundle(opts, bundle) {
		if ( buildSingleFile ) {
			try {
				fs.renameSync('./dist/gallery.html', './single-file-gallery.html');
			} catch(e) {}
			try {
				fs.renameSync('./dist/animated-wallpaper.html', './single-file-animated-wallpaper.html');
			} catch(e) {}
		}
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