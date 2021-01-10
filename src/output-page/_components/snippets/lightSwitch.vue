<template>
  <div class="light-switch">
    <div
      class="icon"
      @click="lightSwitchToggle(false)"
      :content="tippyContent"
      v-tippy="{ placement: 'top' }"
    >
      <font-awesome fas :icon="lightSwitchIcon" />
    </div>
  </div>
</template>

<script>
export default {
  name: "lightSwitch",
  data: function() {
    return {
      tippyContent: ""
    };
  },

  created: function() {
    this.tippyContent =
      "Toggle " +
      (this.$store.state.sticky.lightSwitch
        ? "<strong>light</strong>"
        : "light") +
      " and " +
      (!this.$store.state.sticky.lightSwitch
        ? "<strong>dark</strong>"
        : "dark") +
      " theme";
    this.lightSwitchToggle(true);
  },

  computed: {
    lightSwitchIcon: function() {
      return this.$store.state.sticky.lightSwitch ? "sun" : "moon";
    }
  },

  methods: {
    lightSwitchToggle: function(onLoad) {
      if (!onLoad) {
        this.$store.commit("stickyProp", {
          key: "lightSwitch",
          value: this.$store.state.sticky.lightSwitch ? 0 : 1
        });

        if (!this.$store.state.sticky.lightSwitchSetByUser)
          this.$store.commit("stickyProp", {
            key: "lightSwitchSetByUser",
            value: true
          });
      } else {
        this.autoLightsOff();
      }

      const html = document.querySelector("html");
      html.classList.remove("theme-light");
      html.classList.remove("theme-dark");
      html.classList.add(
        !this.$store.state.sticky.lightSwitch ? "theme-dark" : "theme-light"
      );
    },

    autoLightsOff: function() {
      if (
        window.matchMedia("(prefers-color-scheme)").media !== "not all" &&
        this.$store.state.sticky.lightSwitch &&
        !this.$store.state.sticky.lightSwitchSetByUser
      ) {
        this.$store.commit("stickyProp", { key: "lightSwitch", value: 0 });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/_variables.scss";

.light-switch > div {
  outline: none;
  &:focus,
  &:active {
    color: $audibleOrange;
  }
}
</style>
