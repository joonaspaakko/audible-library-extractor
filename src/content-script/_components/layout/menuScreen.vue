<template>
  <div id="ale-menu-screen" v-visible="!loading">
    <b-collapse animation="slide" class="panel" :open="settingsOpen">
      <div class="extract-settings">
        <div class="settings-heading fade-in">
          <span class="title is-4">Extraction Settings</span>
        </div>
        <b-field grouped class="setting-checkboxes">
          <span v-for="setting in mainSteps" :key="setting.name" v-tippy :content="setting.tippy" >
            <b-checkbox :value="setting.value" :disabled="setting.disabled" :type="setting.type" @input="settingChanged($event, setting.name)" >
              {{ setting.label }}
            </b-checkbox>
          </span>
        </b-field>

        <b-field grouped class="setting-checkboxes" v-if="extras.length">
          <span v-for="setting in extras" :key="setting.name" v-tippy :content="setting.tippy" >
            <b-checkbox :value="setting.value" :disabled="setting.disabled" :type="setting.type" @input="settingChanged($event, setting.name)" >
              {{ setting.label }}
            </b-checkbox>
          </span>
        </b-field>

        <b-message class="description">
          You can fetch <strong>collections</strong> and
          <strong>wishlist</strong> now and discard them later when saving the
          gallery as a stand-alone website. <strong>ISBNs</strong> are merged
          with the library books and can't be removed later, not that there
          should be any need to do that.
          <!-- You can fetch <b-tag type="is-warning">collections</b-tag> and <b-tag type="is-warning">wishlist</b-tag> now and discard them later when saving the gallery as a stand-alone website. <b-tag type="is-warning">ISBNs</b-tag> are merged with the library books and can't be removed later, not that there should be any need to do that. -->
        </b-message>
      </div>
    </b-collapse>

    <div class="extract-wrapper">
      <b-field class="extract-btn">
        <b-button @click="takeNextStep('extract')" type="is-info" class="extract control" expanded size="is-large" >
          Start extracting
        </b-button>
        <div class="control">
          <b-button @click="takeNextStep('extract')" type="is-dark" icon-right="arrow-alt-circle-down" icon-pack="far" size="is-large" ></b-button>
        </div>
      </b-field>

      <b-field class="other-btns">
        <b-button
          :disabled="!storageHasData"
          @click="takeNextStep('update')"
          class="control"
          size="is-small"
          icon-right="sync-alt"
          icon-pack="fas"
          v-tippy
          content="<strong>Usable after one full extraction.</strong> <br>A faster extraction that primarily add new books but also updates data that is likely to change."
        >
          Partial extraction
        </b-button>
        <b-button
          :disabled="!storageHasData"
          @click="takeNextStep('output')"
          class="control"
          size="is-small"
          icon-right="share-square"
          icon-pack="fas"
          v-tippy
          content="<strong>Usable after one full extraction.</strong> <br>Skips scanning and goes sraight to the library gallery."
        >
          Output page
        </b-button>
      </b-field>
    </div>

    <b-button
    class="settings-btn"
    @click="settingsOpen = !settingsOpen"
    :class="{ open: settingsOpen }"
    size="is-small"
    type="is-text"
    icon-left="cog"
    icon-pack="fas"
    >
      Settings
    </b-button>

    <div id="footer" class="is-small has-text-grey-light">
      Find more information in the <a href="https://github.com/joonaspaakko/audible-library-extractor">Github repository</a> page. <br />
      Post issues, questions, and suggestion at: <a href="https://github.com/joonaspaakko/audible-library-extractor/issues">Github issues</a>.
    </div>
  </div>
</template>

<script>
import Vue from "vue";

// FONTAWESOME
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faShareSquare,
  faSyncAlt,
  faTimes,
  faCog
} from "@fortawesome/free-solid-svg-icons";
import { faArrowAltCircleDown } from "@fortawesome/free-regular-svg-icons";
library.add(faShareSquare, faSyncAlt, faArrowAltCircleDown, faTimes, faCog);
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
Vue.component("font-awesome", FontAwesomeIcon);

// VUE-TIPPY
import VueTippy, { TippyComponent } from "vue-tippy";
Vue.use(VueTippy, {
  arrow: true,
  placement: "top",
  trigger: "mouseenter focus",
  theme: "light-border",
  zIndex: 9999999991,
  maxWidth: 670,
  onShow: options => {
    return !!options.props.content;
  },
  boundary: "viewport",
  flipDuration: 0
});
Vue.component("tippy", TippyComponent);
import "tippy.js/themes/light-border.css";

import Buefy from "buefy";
import "buefy/dist/buefy.css";
Vue.use(Buefy, {
  defaultIconComponent: "font-awesome",
  defaultIconPack: "fas"
});

export default {
  name: "menuScreen",
  props: ["storageHasData", "storageConfig"],
  data() {
    return {
      settingsOpen: false,
      extrasOn: false,
      extractSettings: [
        {
          name: "library",
          value: true,
          label: "Library",
          type: "is-success",
          disabled: true
        },
        {
          name: "seriesOrder",
          value: true,
          label: "Series Order",
          type: "is-success",
          disabled: true,
          tippy: "<div style='text-align: left;'><strong>Always a full extract, even when updating.</strong></div>"
        },
        {
          name: "collections",
          value: true,
          label: "Collections",
          type: "is-success",
          disabled: false,
          tippy: "<div style='text-align: left;'><strong>Always a full extract, even when updating.</strong></div>"
        },
        {
          name: "isbn",
          value: false,
          label: "ISBN",
          type: "is-danger",
          disabled: false,
          tippy: "<div style='text-align: left;'><strong>Very slow process with +200 books.</strong> Only fetch these if you need them. <br>Attempts to fetch ISBNs for every book in your library. <br>Only books that are missing ISBNs are processed during a partial extraction. <br>You should only need them if you plan to import the books to Goodreads.</div>"
        },
        {
          name: "isbn-update",
          value: true,
          label: "Add missing ISBNs on full extract",
          type: "is-success",
          disabled: false,
          extra: true,
          onStorageHasData: true,
          parent: "isbn",
          tippy: "<div style='text-align: left;'><strong>Will potentially save a lot of time.</strong> <br>Keeps previously extracted ISBNs and only tries to add ISBNs to all books without ISBNs. <br>ISBNs are not likely to change and since you've already done a full extract, might as well use the existing ISBNs. <br>Disable if you want to refresh the whole list of ISBNs during a full extract.</div>"
        },
        {
          name: "wishlist",
          value: false,
          label: "Wishlist",
          type: "is-warning",
          disabled: false,
          tippy: "<div style='text-align: left;'><strong>Slow process...</strong> <br><strong>Always a full extract, even when updating.</strong></div>"
        }
      ],
      loading: true
    };
  },

  computed: {
    mainSteps: function() {
      return _.filter(this.extractSettings, function(o) {
        return !o.extra;
      });
    },

    extras: function() {
      const vue = this;
      return _.filter(vue.extractSettings, function(o) {
        if (o.extra && o.onStorageHasData && vue.storageHasData) {
          const parentChecked = _.find(vue.mainSteps, { name: o.parent }).value;
          if (parentChecked) return o;
        }
      });
    }
  },

  mounted: function() {
    // Just to make sure that accidental clicks don't do anything when the overlay is opened
    // - If the button that opens the overlay was perfectly aligned with any of the buttons in this component, a double click would start doing things prematurely
    const vue = this;
    this.$nextTick(function() {
      setTimeout(function() {
        vue.loading = false;
      }, 1000);
    });

    // Updates default values from browser storage
    if (this.storageConfig && this.storageConfig.steps) {
      _.each(this.storageConfig.steps, function(step) {
        let foundOriginalDolly = _.find(vue.extractSettings, {
          name: step.name
        });
        foundOriginalDolly.value = step.value;
      });
    }
  },

  methods: {
    extrasParentOn: function(setting) {
      var parentChecked = _.find(this.mainSteps, { name: setting.parent })
        .value;
      return parentChecked;
    },

    takeNextStep: function(step) {
      this.$root.$emit("do-next-step", {
        step: step,
        config: {
          steps: _.map(this.extractSettings, function(o) {
            return { name: o.name, value: o.value, extra: o.extra };
          })
        }
      });
    },

    settingChanged: function(inputValue, inputName) {
      const currentSetting = _.find(this.extractSettings, { name: inputName });
      currentSetting.value = inputValue;
    }
  }
};
</script>

<style lang="scss">
#ale-menu-screen {
  max-width: 650px;
  margin: 0 auto;

  .has-text-grey-light {
    a {
      text-decoration: underline;
      color: #b5b5b5;
    }
    a:visited {
      color: darken(#b5b5b5, 10);
    }
  }

  .extract-wrapper {
    width: 300px;
    margin: 35px auto 0;
  }

  .extract-btn {
    margin-bottom: 0px !important;
    display: inline-flex;
    width: 100%;
    button.extract {
      padding: 5px 15px 4px !important;
      border-radius: 4px 0 0 4px;
    }
  }

  .extract-settings {
    position: relative;
    z-index: 1;
    padding-top: 10px;
    margin: 0 auto 20px auto;
    border: 2px solid #e1e1e1;
    border-radius: 6px;

    span.check {
      top: -1px;
      position: relative;
    }

    .title {
      &.is-4 {
        margin-bottom: 2px;
      }
      &.is-6 {
        margin-bottom: 7px;
        color: #666;
      }
    }
    .field {
      justify-content: center;
    }
    .description {
      line-height: 22px;
      margin: 0;
      .message-body {
        border: none !important;
      }
      &.darker-gray {
        border-radius: 0;
        background: rgba(#000, 0.1);
        border-color: rgba(#000, 0.12);
        border-style: solid;
        border-width: 2px;
        border-right: none;
        border-left: none;
        .media-content {
          color: rgba(#000, 0.57);
        }
      }
      .tag {
        background-color: #d5e9f8 !important;
        color: #1d72aa !important;
      }
    }

    .settings-heading {
      z-index: 2;
      position: absolute;
      left: 0;
      right: 0;
      top: -13px;
      span {
        display: inline-block;
        padding: 0 5px;
        background: #fff;
      }
    }
    /* ----------------------------------------------
		* Generated by Animista on 2020-12-19 21:31:49
		* Licensed under FreeBSD License.
		* See http://animista.net/license for more info. 
		* w: http://animista.net, t: @cssanimista
		* ---------------------------------------------- */
    .fade-in {
      -webkit-animation: fade-in 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) 0.25s
        both;
      animation: fade-in 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) 0.25s both;
    }
    @-webkit-keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    .setting-checkboxes {
      margin: 40px 0;
    }
  }

  .other-btns {
    max-width: 300px;
    margin: 6px auto 0;
    button {
      height: auto;
      padding-top: 9px;
      padding-bottom: 9px;
      flex-grow: 1;
    }
  }

  #footer {
    font-size: 0.9em;
    line-height: 1.3em;
    padding: 50px 0 10px;
    &,
    & a {
      transition: color 150ms ease;
    }
    &:hover {
      color: #717171 !important;
      a {
        color: darken(#717171, 5) !important;
      }
    }
  }

  .settings-btn {
    margin-top: 25px;
    transition: all 180ms ease-out;
    &:focus {
      box-shadow: none !important;
    }
    &.open {
      background: #444;
      color: #fff;
      border-radius: 5px;
    }
  }
}
</style>
