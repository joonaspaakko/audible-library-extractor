<template>
  <div id="ale-save-locally" class="icon" @click="saveButtonClicked"
  content="<strong>Save the gallery locally.</strong> Check the readme in github for more instructions."
  v-tippy="{ placement: 'top',  arrow: true }"
  >
    <font-awesome-icon fas icon="save" />
  </div>
</template>

<script>

import jsZip from 'jszip'
import { saveAs } from 'file-saver';
import jsZipUtils from 'jszip-utils';

export default {
  name: 'aleSaveLocally',
  data: function() {
    return {
      zip: null,
    }
  },
  props: ['library'],
  created: function() {
    
    this.zip = new jsZip();
    
  },
	beforeDestroy: function() {
	 	this.zip = null;
	},
  
  methods: {
    
    saveButtonClicked: function() {
      
      const vue = this;
      const zip = vue.zip;
      
      const libraryData = JSON.stringify( vue.library );
      var indexHTML =
        '<!DOCTYPE html>' +
        '<html lang="en" class="theme-light standalone-gallery">' +
        '<head>' +
          '<meta charset="UTF-8">' +
          '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
          '<meta http-equiv="X-UA-Compatible" content="ie=edge">' +
          '<title>My Audible Library</title>' +
          '<script id="library-data" type="application/json">'+ libraryData +'<\/script>' +
          '<link rel="stylesheet" href="output-page.css">' +
        '</head>' +
        '<body>' +
          '<div id="audible-library-extractor"></div>' +
          '<script src="output-page.js"><\/script>' +
        '</body>' +
        '</html>';
      
      zip.file("index.html", indexHTML);
      
      // loading a file and add it in a zip file
      jsZipUtils.getBinaryContent("output-page.js", function (err, data) {
        if(err) { throw err; }
        zip.file("output-page.js", data, {binary:true});

        jsZipUtils.getBinaryContent("output-page.css", function (err, data) {
          if(err) { throw err; }
          zip.file("output-page.css", data, {binary:true});

          zip.generateAsync({type:"blob"}).then(function(content) {
            // see FileSaver.js
            saveAs(content, "ALE-gallery.zip");
          });
        });
      });
      
      // zip.file("index.html");
      // zip.file("output-page.css");
      // zip.file("output-page.js");
       
      // var img = zip.folder("images");
      // img.file("smile.gif", imgData, {base64: true});
       
      
    }
    
  },
}
</script>

<style lang="scss" scoped>
@import '~@/_variables.scss';

</style>
