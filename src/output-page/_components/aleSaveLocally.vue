<template>
  <div
    id="ale-save-locally"
    class="icon"
    style="cursor: default;"
  >
    <font-awesome @click="modalOpen = true" fas icon="save" style="cursor: pointer;" />
    
    <div id="save-locally-overlay" v-if="modalOpen">
      <div class="outer-wrap">
        <div class="inner-wrap">
          
          <save-gallery></save-gallery>
          <save-csv></save-csv>
          
          <div class="close-btn" @click="modalOpen = false" v-shortkey.once="['esc']" @shortkey="modalOpen = false">
            <font-awesome fas icon="times" />
          </div>
          
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import saveGallery from "@output-snippets/save-gallery.vue";
import saveCsv from "@output-snippets/save-csv.vue";

export default {
  name: "aleSaveLocally",
  components: {
    saveGallery,
    saveCsv,
  },
  data: function() {
    return {
      modalOpen: false,
    };
  },
  
};
</script>

<style lang="scss">
@import "~@/_variables.scss";

#bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: url("https://assets.codepen.io/154942/ale-gallery-overlay-bg.png");
  background-position: center top;
  background-repeat: no-repeat;
  filter: blur(3px);
}

#save-locally-overlay {
  width: 100%;
  min-height: 100%;
  height: 100%;
  padding: 70px 25px;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(#888, 0.6);
  overflow: auto;

  .outer-wrap {
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    justify-content: center;
    align-content: center;
  }

  .inner-wrap {
    height: unset;
    display: inline-block !important;
    font-size: 14px;
    line-height: 17px;
    font-weight: 300;
    max-width: 600px;
    background: #454545;
    border-radius: 4px;
    box-shadow: 2px 15px 35px 5px rgba(#000, 0.4);
    border: 1px solid rgba(#000, 0.2);
    color: #f1f1f1;
    position: relative;
    z-index: 0;
    text-align: left;

    .close-btn {
      cursor: pointer;
      position: absolute;
      top: 0px;
      right: 10px;
      z-index: 5;
      padding: 5px 10px;
      border: 1px solid #222;
      border-top: none;
      display: inline-block;
      border-radius: 0 0 4px 4px;
      background: #505050;
    }

    .export-group {
      padding: 55px 60px;
      padding-bottom: 50px;
      border-top: 1px solid rgba(#fff, 0.07);
      border-bottom: 1px solid rgba(#000, 0.25);
      &:first-child {
        border-top: none;
      }
      
      h2 svg {
        padding-right: 5px;
      }
    }

    h2 {
      font-size: 1.4em;
      font-weight: 200;
      margin: 0 0 10px 0;
      display: inline-block;
      width: 100%;
    }
    h3 {
      font-size: 1.2em;
      font-weight: 400;
      margin: 20px 0 0 0;
      display: inline-block;
      width: 100%;
    }

    .description {
      font-size: 0.9em;
      color: rgba(#fff, 0.55);
      font-weight: 400;
    }

    .options {
      margin-top: 15px;
      label {
        -webkit-touch-callout: none; 
        -webkit-user-select: none; 
        -khtml-user-select: none; 
        -moz-user-select: none; 
        -ms-user-select: none; 
        user-select: none; 
        outline: none;
        cursor: pointer;
        display: inline-block;
        margin-left: 20px;
        &:first-child { margin-left: 0; }
      }
      .opt-group {
        padding-top: 10px;
        &:first-child {  padding-top: 0; }
      }
      // &.label-100 label { width: 100px; }
      &.opt-groups {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        label { 
          margin-left: 0; 
          padding-top: 5px;
          &:first-child {  padding-top: 0; } 
        }
        .opt-group {
          padding-top: 0px;
          margin-left: 20px;
          &:first-child { margin-left: 0; }
          display: flex;
          flex-direction: column;
        }
      }
    }

    .buttons-footer {
      display: block;
      width: 100%;
      margin-top: 30px;
      // text-align: left;
      text-align: center;
      position: relative;
      right: -10px;
    }

    .btn-wrapper {
      // display: inline-block;
      display: inline-flex;
      flex-direction: column;
      align-items: stretch;
      align-content: stretch;
      font-size: 14px;
      .github-btn,
      .save-btn {
        cursor: pointer;
        flex: 1;
        display: inline-block;
        @include themify($themes) {
          background: themed(audibleOrange);
        }
        color: #fff;
        border: none;
        border-radius: 3px;
        padding: 9px 25px;
        text-decoration: none;
        span {
          padding-right: 7px;
        }
        box-sizing: border-box;
      }
      
      button { outline: none; }
      button[disabled="disabled"] {
        cursor: not-allowed;
        background: #606060 !important;
        @include themify($themes) {
          border: 2px dashed themed(audibleOrange);
        }
      }
      .save-btn.saving {
        background: #606060 !important;
        -webkit-animation: vibrate-1 0.3s linear infinite both;
        animation: vibrate-1 0.3s linear infinite both;
        @include themify($themes) {
          border: 2px dashed themed(audibleOrange);
        }
      }
      /* ----------------------------------------------
      * Generated by Animista on 2021-5-5 23:7:36
      * Licensed under FreeBSD License.
      * See http://animista.net/license for more info. 
      * w: http://animista.net, t: @cssanimista
      * ---------------------------------------------- */

      @-webkit-keyframes vibrate-1{0%{-webkit-transform:translate(0);transform:translate(0)}20%{-webkit-transform:translate(-2px,2px);transform:translate(-2px,2px)}40%{-webkit-transform:translate(-2px,-2px);transform:translate(-2px,-2px)}60%{-webkit-transform:translate(2px,2px);transform:translate(2px,2px)}80%{-webkit-transform:translate(2px,-2px);transform:translate(2px,-2px)}100%{-webkit-transform:translate(0);transform:translate(0)}}@keyframes vibrate-1{0%{-webkit-transform:translate(0);transform:translate(0)}20%{-webkit-transform:translate(-2px,2px);transform:translate(-2px,2px)}40%{-webkit-transform:translate(-2px,-2px);transform:translate(-2px,-2px)}60%{-webkit-transform:translate(2px,2px);transform:translate(2px,2px)}80%{-webkit-transform:translate(2px,-2px);transform:translate(2px,-2px)}100%{-webkit-transform:translate(0);transform:translate(0)}}
      
      .github-btn {
        // border: 2px solid #666; 
        margin-top: 7px;
        margin-left: 2px; &:first-child { margin-left: 0; }
        // background: #9818b7;
        // background: linear-gradient(to bottom, #9818b7 0%,#642c95 100%);
        // background: #f1f1f1; 
        // border: 2px solid #9818b7; 
        // border: 2px solid #666; 
        // color: #444;
        background: transparent;
        // border: 2px solid #606060; 
        background: #606060 !important;
        color: #e1e1e1 !important;
        
      }
      
      &.btn-row {
        display: flex;
        width: 100%;
        flex-direction: row;
        align-items: stretch;
        align-content: stretch;
        justify-content: stretch;
        justify-items: stretch;
        .save-btn { 
          flex: 1; 
          white-space: nowrap; 
          margin-top: 0; 
          margin-left: 5px; 
          &:first-child { margin-left: 0; } 
        }
      }
      
      .file-desc,
      .file-desc a {
        margin-top: 6px;
        text-align: center;
        font-size: 12px;
        color: rgba(#fff, 0.25);
      }
    }
  }
}
</style>
