<template>
<div id="changelog">
 
  <button
    class="button is-small is-text settings-btn"
    v-tippy="{ 
      allowHTML: true, 
      trigger: 'click',
      interactive: true,
    }"
    :content="getChangelog()"
  >
    <ph-code-bold class="icon" />
    <span>Changelog</span>
  </button>
  
</div>
</template>
 
<script>
import changelog from "@output-mixins/changelog.js";

export default {
  mixins: [ changelog ],
  data: function() {
    return {
      
    };
  },
  
  methods: {
    
    getChangelog: function() {
      
      let changelogInnerHTML = '';
      
      _.each( this.changeLog, function( versionBlock ) {
        
        changelogInnerHTML += '<strong style="display: inline-block; width: 100%; font-size: 16px;">'+ versionBlock.version +'</strong>';
        changelogInnerHTML += versionBlock.highlights ? '<div style="padding: 6px; margin: 6px 0 7px; color: rgb(128 93 54); background: rgb(246, 153, 50, .06); border: 1px solid rgb(246, 153, 50, .2);">'+ versionBlock.highlights +'</div>' : '';
        changelogInnerHTML += '<ul class="ale-changelog-list" style="display: inline-block; width: 100%; box-sizing: border-box;">';
        _.each( versionBlock.changes, function( change ) {
          if ( change.divider ) {
            changelogInnerHTML += '<li style="height: 0px; border: 1px dashed #f1f1f1; margin: 5px 0; width: 100%;"></li>';
          }
          else {
            let linkText;
            if ( change.link ) linkText = change.highlight ? ('<strong>' + change.link.text + '</strong>') : change.link.text;
            changelogInnerHTML += '<li class="'+ (change.class || '') +'">'+
              (change.link ? '<a target="_blank" rel="noopener noreferrer" href="'+ change.link.href +'">'+ linkText +'</a>: ' : '') + 
              (change.description || '')
            +'</li>';
          }
        });
        changelogInnerHTML += '</ul>';
        changelogInnerHTML += '<br><br>';
      });
      
      let changelogHTML = '<div style="text-align: left; max-height: 350px; overflow: scroll; padding: 20px;">'+ changelogInnerHTML +'</div>';
      return changelogHTML;
      
    },
    
  }
}
</script>
 
<style scoped src="@node/bulma/css/bulma.css"></style>

<style lang="scss">
 
.ale-changelog-list {
  li { position: relative; z-index: 1; }
  li:before {
    content: '';
    position: absolute;
    z-index: 4;
    top: 4px;
    height: 9px;
    width: 9px;
    left: -16px;
    display: none;
    border-radius: 9999999px;
    background: red;
  }
  li.fixed:before    { background: #f25954; display: block; }
  li.improved:before { background: #ba23ca; display: block; }
  li.added:before    { background: #10c064; display: block; }
  li.removed:before    { background: #f25500; display: block; }
}

.changelog {
  .icon {
    font-size: 16px;
    margin-right: 10px !important;
    background: #f5f5f5;
    padding: 4px;
    border-radius: 20px;
  }
}

</style>