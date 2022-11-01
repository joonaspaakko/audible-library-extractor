<template>
  <div class="light-switch text-button">
    <div
      class="icon"
      @click="lightSwitchToggle(false)"
    >
      
      <fa6-solid-sun v-if="$store.state.sticky.lightSwitch" />
      <fa6-solid-moon v-else />
      
    </div>
  </div>
</template>

<script>
export default {
  name: "lightSwitch",
  data: function() {
    return {
      tippyContent: "",
    };
  },

  created: function() {      
    this.lightSwitchToggle(true);
  },

  methods: {
    lightSwitchToggle: function(onLoad) {
      if (!onLoad) {
        
        this.$store.commit("stickyProp", { key: "lightSwitch", value: this.$store.state.sticky.lightSwitch ? 0 : 1 });

        if (!this.$store.state.sticky.lightSwitchSetByUser) this.$store.commit("stickyProp", { key: "lightSwitchSetByUser", value: true });
        
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


.light-switch > div {
  outline: none;
  &:focus,
  &:active {
    color: $audibleOrange;
  }
}
</style>
