<template>
  <div class="scroll-view-wapper" ref="wapper">
    <div class="scroll-view-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import IScroll from "iscroll/build/iscroll-probe";
export default {
  componentName: "ScrollView",
  name: "ScrollView",
  props: {
    click: {
      type: Boolean,
      default: true
    },
    probeType: {
      type: Number,
      default: 1 // 指定触发的频率，1、滚动不繁忙的时候触发; 2、滚动时每隔一定时间触; 3、每滚动一像素触发一次
    },
    bounce: {
      type: Boolean,
      default: true
    },
    mouseWheel: {
      type: Boolean,
      default: true
    },
    scrollbars: {
      type: Boolean,
      default: false
    },
    eventPassthrough: {
      type: [Boolean, String]
    }
  },
  data() {
    return {
      iscroll: null
    };
  },
  created() {
    this.$on("refresh-view", this.refresh);
  },
  mounted() {
    this.iscroll = new IScroll(this.$refs.wapper, {
      click: this.click,
      mouseWheel: this.mouseWheel,
      bounce: this.bounce,
      probeType: this.probeType,
      scrollbars: this.scrollbars,
      fadeScrollbars: true,
      eventPassthrough: this.eventPassthrough
    });
    this.iscroll.on("scrollStart", () => {
      this.emitEvant("scroll-start");
    });
    this.iscroll.on("scroll", () => {
      this.emitEvant("scroll");
    });
    this.iscroll.on("scrollEnd", () => {
      this.emitEvant("scroll-end");
    });
  },
  methods: {
    refresh() {
      setTimeout(() => {
        this.iscroll.refresh();
        this.emitEvant("scroll");
      }, 50);
    },
    emitEvant(eventName) {
      this.$emit(eventName, this.iscroll || {});
    }
  },
  destroyed() {
    if (this.iscroll) {
      this.iscroll.destroy();
      this.iscroll = null;
    }
  }
};
</script>

<style lang="less">
.scroll-view-wapper {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  touch-action: none;
  .scroll-view-content {
    overflow: hidden;
  }
}
</style>
