<template>
  <div id="save-locally-overlay" ref="modalGrandpa" @click="closeOverlay">
    
    <div class="outer-wrap" ref="modalPapa">
      <div class="inner-wrap">
        
        <save-gallery></save-gallery>
        <save-csv></save-csv>
        
        <div class="close-btn" @click="close" v-shortkey.once="['esc']" @shortkey="close">
          <fa-solid-times/>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "aleSaveLocally",
  props: [ 'toggled' ],
  data: function() {
    return {
      modalOpen: true,
    };
  },
  created: function() {
    
    if ( this.$store.getters.saveStandaloneAfter ) this.toggleModal( true );
    
  },
  
  methods: {
    
    toggleModal: function( value ) {
      
      this.$emit('closeComp', value === undefined ? value : !this.toggle);
      
    },
    
    close: function() {
      if ( this.$store.state.bundlingGallery ) window.location.reload();
      else this.toggleModal( false );
    },
    closeOverlay: function( e ) {
      let vue = this;
      if ( e.target === this.$refs.modalGrandpa || e.target === this.$refs.modalPapa ) {
        vue.close();
      }
    }
  },
  
};
</script>

<style lang="scss">


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
    font-weight: 400;
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
      font-weight: 400;
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
      .save-gallery {
        @include themify($themes) {
          background: themed(audibleOrange);
        }
      }
      .save-csv {
        background-color: #0e9d59; 
        border-color: #0e9d59;
      }
      .github-btn,
      .save-btn {
        overflow: hidden;
        position: relative;
        z-index: 0;
        cursor: pointer;
        flex: 1;
        display: inline-block;
        color: #fff !important;
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
        cursor: not-allowed !important;
        // background: #606060;
        // @include themify($themes) {
        //   border: 2px dashed themed(audibleOrange);
        // }
      }
      .save-btn.saving {
        -webkit-animation: vibrate-1 0.3s linear infinite both;
        animation: vibrate-1 0.3s linear infinite both;
        .progress {
          position: absolute;
          z-index: 1;
          bottom: 0;
          right: 0;
          left: 0;
          width: 0%;
          height: 3px;
          background: rgba(#fff, .7);
        }
      }
      /* ----------------------------------------------
      * Generated by Animista on 2021-5-5 23:7:36
      * Licensed under FreeBSD License.
      * See http://animista.net/license for more info. 
      * w: http://animista.net, t: @cssanimista
      * ---------------------------------------------- */

      @-webkit-keyframes vibrate-1{0%{-webkit-transform:translate(0);transform:translate(0)}20%{-webkit-transform:translate(-1px,1px);transform:translate(-1px,1px)}40%{-webkit-transform:translate(-1px,-1px);transform:translate(-1px,-1px)}60%{-webkit-transform:translate(1px,1px);transform:translate(1px,1px)}80%{-webkit-transform:translate(1px,-1px);transform:translate(1px,-1px)}100%{-webkit-transform:translate(0);transform:translate(0)}}@keyframes vibrate-1{0%{-webkit-transform:translate(0);transform:translate(0)}20%{-webkit-transform:translate(-1px,1px);transform:translate(-1px,1px)}40%{-webkit-transform:translate(-1px,-1px);transform:translate(-1px,-1px)}60%{-webkit-transform:translate(1px,1px);transform:translate(1px,1px)}80%{-webkit-transform:translate(1px,-1px);transform:translate(1px,-1px)}100%{-webkit-transform:translate(0);transform:translate(0)}}
      
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
        background: #606060;
        color: #e1e1e1;
        
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
