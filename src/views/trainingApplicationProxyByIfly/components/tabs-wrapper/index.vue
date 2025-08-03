<template>
  <div class="tab-content-wrapper-container">
    <van-tabs v-model="active">
      <van-tab title="发起申请"> </van-tab>
      <van-tab title="已申请"> </van-tab>
    </van-tabs>
    <div class="tab-content-wrapper" v-if="active === 0">
      <slot name="applying" />
    </div>
    <div class="tab-content-wrapper" v-else>
      <slot name="hasApplied" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'tab-content-wrapper',
  props: {
    active: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  methods: {},
  computed: {},
  mounted() {}
}
</script>

<style lang="less" scoped>
.tab-content-wrapper-container {
  padding: 0px 10px;
  ::v-deep .van-tabs {
    .van-tabs__wrap {
      height: 65px;
    }
    .van-tabs__nav {
      padding: 0 80px;
      background: transparent;
    }
    .van-tab {
      padding: unset;
      font-size: 18px;
      .van-tab__text {
        padding: 20px 0;
        color: #8493a7;
        font-weight: 400;
      }
    }
    .van-tab--active {
      .van-tab__text {
        color: #444444;
        font-weight: 400;
        z-index: 0;
      }
    }
    .van-tabs__line {
      background-color: #5897ff;
      height: 6px;
      border-radius: unset;
      bottom: 22px;
      width: 72px;
      z-index: -1;
    }

    /* .van-tab__pane {
      padding: 0px 10px;
    } */
  }
  .tab-content-wrapper {
    background-color: #fff;
    border-top: 10px solid #5897ff;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 10px;
  }
}
// 标签栏
</style>
