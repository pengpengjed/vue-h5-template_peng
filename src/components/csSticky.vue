<template>
  <van-sticky class="cs-sticky" :offset-top="topHeight" :z-index="zIndex">
    <slot></slot>
  </van-sticky>
</template>

<script>
export default {
  name: "CsSticky",
  props: {
    offsetTop: {
      type: [Number, String]
    },
    zIndex: {
      type: Number
    }
  },
  data() {
    return {
      topHeight: ""
    };
  },
  created() {
    if (this.offsetTop) {
      this.topHeight = this.offsetTop;
    } else {
      this.topHeight = this.bodyOffsetTop;
    }
  },
  mounted() {}
};
</script>

<style lang="less"></style>
