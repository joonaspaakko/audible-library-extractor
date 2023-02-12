var zipFolder = require('zip-folder');
var color = require('picocolors');
var pkg = require('./package.json');
var fs = require('fs');

// REMOVE PREVIOUS ZIP FILES
// Doesn't care what zip it is. Any zip is removed (from the root).
const root = fs.readdirSync('./');
const files = root.filter( ( elm ) => elm.match(/.*\.(zip?)/ig));
files.forEach(function( file ) {
    fs.rmSync('./'+ file, { force: true }); 
});

// // Fish 
// const files = root.filter( ( elm ) => elm.match(/.*\.(zip?)/ig));
// files.forEach(function( file ) {
//     fs.rmSync('./'+ file, { force: true }); 
// });

// MAKE A NEW ZIP FILE FROM './dist'
var version = pkg.version ? '-'+pkg.version : '';
var draft = pkg.draft ? '-draft' : '';
var filename = `${pkg.name}${version}${draft}.zip`;
var padding = 3;
var repeatString = (str, num) => {
    return num > 0 ? Array(num+1).join(str) : "";
};
var horizontalLineLength = Math.ceil((filename.length/2) + (padding*2));
var horizontalLine = ' ' + repeatString('— ', horizontalLineLength );
horizontalLineLength = horizontalLine.length;

var msg = ["Extension zipped","successfully!"];
var msgLength = msg.join(" ").length;
var msgDiff = Math.ceil((horizontalLineLength - msgLength) / 2);
var msgPadding = repeatString(' ', msgDiff);
var msgPaddingMinus = (msgLength + (msgDiff*2)) > horizontalLineLength ? 1 : 0;

var filenameLength = filename.length;
var filenameDiff = Math.ceil((horizontalLineLength - filenameLength) / 2);
var filenamePadding = repeatString(' ', filenameDiff);
var filenamePaddingMinus = (filenameLength + (filenameDiff*2)) > horizontalLineLength ? 1 : 0;

zipFolder('./dist', './'+ filename, function(err) {
    if(err) {
        console.log('Zip failed!', err);
    } else {
        console.log(' ');
        console.log( color.gray(`+${horizontalLine}+`) );
        console.log( color.gray('|') + repeatString(' ', horizontalLineLength) + color.gray('|') );
        console.log( color.gray('|')+color.green(`${msgPadding}${msg[0]} ${color.bold(msg[1])}${msgPadding.substring(msgPaddingMinus)}`) + color.gray('|') );
        console.log( color.gray('|')+ color.yellow( filenamePadding + color.bold(filename) + filenamePadding.substring(filenamePaddingMinus) ) + color.gray('|') );
        console.log( color.gray('|') + repeatString(' ', horizontalLineLength) + color.gray('|') );
        console.log( color.gray(`+${horizontalLine}+`) );
        console.log(' ');
    }
});
