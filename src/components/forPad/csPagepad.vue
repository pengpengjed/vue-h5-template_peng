<template>
  <div class="page-wrap-pad">
    <CsTabbar />
    <div class="cs-page" @click="onClick" @touchmove="onTouchMove" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <!-- header -->
      <div class="cs-page__header" v-show="showHeader">
        <slot name="nav-bar" v-if="showNavBar">
          <van-nav-bar @click-left="onClickLeft" @click-right="onClickRight">
            <!-- left -->
            <template #left v-if="showBack">
              <div class="slot-left">
                <slot name="navBarLeft">
                  <div class="button-back"></div>
                </slot>
              </div>
            </template>
            <!-- title -->
            <template #title>
              <slot name="title">
                <span>{{ title }}</span>
              </slot>
            </template>
            <!-- right -->
            <template #right>
              <div class="slot-right" v-if="showRight">
                <slot name="navBarRight">
                  <div class="app-function">
                    <div class="app-function-item">
                      <van-icon name="weapp-nav" @click.stop="onMoreClick" />
                    </div>
                    <div class="app-function-item" v-if="!isHomeModule">
                      <van-icon name="cross" @click="onCloseClick" />
                    </div>
                    <div class="app-function-item" v-if="isHomeModule && isLogined">
                      <van-icon name="apps-o" @click="onToolsClick" />
                    </div>
                  </div>
                </slot>
              </div>
            </template>
          </van-nav-bar>
        </slot>
        <slot name="header"></slot>
      </div>
      <!-- body -->
      <div class="cs-page__body" ref="body" @scroll="onScroll">
        <slot :height="bodyHeight" :width="bodyWidth"></slot>
      </div>
      <!-- footer -->
      <div v-if="$slots.footer" class="cs-page__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import CsTabbar from './csTabbar.vue'
export default {
  name: "csPage",
  components:{
    CsTabbar
  },
  props: {
    // 页面标题
    title: {
      type: String,
      default: ""
    },
    // 是否显示导航栏
    showNavBar: {
      type: Boolean,
      default: true
    },
    // 设置是否显示头部
    showHeader: {
      type: Boolean,
      default() {
        return true; // this.$env.VUE_APP_PLATFORM === "development";
      }
    },
    // 设置是否显示返回按钮
    showBack: {
      type: Boolean,
      default: true
    },
    // 配置回退几步
    backSteps: {
      type: Number,
      default: 1
    },
    // 是否右侧操作按钮
    showRight: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      bodyHeight: 0,
      scrollTop: 0
    };
  },
  created() {
    this.setTitle();
  },
  activated() {
    this.setTitle();
    // 恢复滚动位置
    if (this.scrollTop && this.$refs.body) {
      this.$refs.body.scrollTop = this.scrollTop;
    }
  },
  mounted() {
    this.init();
    window.addEventListener("resize", this.init);
  },
  methods: {
    init() {
      if (this.$refs.body) {
        this.bodyHeight = this.$refs.body.offsetHeight;
      }
      // this.$root.$emit('pageResize',this.isLandscape())
    },
    setTitle() {
      if (this.title) {
        this.$store.commit("setTitle", this.title);
      }
    },
    getBodyEl() {
      return this.$refs.body;
    },
    onClickLeft(e) {
      if (this.showBack) {
        if (this.$utility.isIOS()) {
          window.isIosSysBack = false; // 设置是否IOS系统手势返回
          this.$nextTick(() => {
            this.$eplmApp.goBack();
          });
        } else {
          this.$eplmApp.goBack();
        }
      }
      this.$toast.clear();
      this.$emit("nav-bar-click-left", e);
    },
    onClickRight(e) {
      this.$emit("nav-bar-click-right", e);
    },
    onScroll(e) {
      // 记住滚动位置
      const el = e.target;
      const scrollTop = el.scrollTop;
      this.scrollTop = scrollTop;
      // 传递事件
      this.$emit("scroll", e);
    },
    onClick(e) {
      this.$emit("click", e);
    },
    onTouchStart(e) {
      this.$emit("touchstart", e);
    },
    onTouchMove(e) {
      this.$emit("touchmove", e);
    },
    onTouchEnd(e) {
      this.$emit("touchend", e);
    },
    getScrollTop() {
      return this.$refs.body.scrollTop;
    },
    setScrollTop(offset) {
      if (this.$refs.body) {
        // this.$refs.body.scrollTop = offset;
        window.$(this.$refs.body).animate({ scrollTop: offset });
      }
    },
    onMoreClick() {
      this.$root.$emit("show-app-more");
    },
    onCloseClick() {
      if (this.isRelease) {
        this.$native.Navigate.exitCurrentModule();
      }
    },
    onToolsClick() {
      this.$root.$emit("show-app-tools");
    },
    // 横屏
    isLandscape() {
      return window.innerWidth > window.innerHeight;
    },

  },
  computed: {
    isLogined() {
      return this.$store.getters.isLogined;
    },
    headerStyle() {
      return { "padding-top": this.statusBarHeight / 14 + "rem" };
    }
  },
  watch: {
    title() {
      this.setTitle();
    }
  },
  destroyed() {
    window.removeEventListener("resize", this.init);
  }
};
</script>

<style lang="less">
:root{
  --nav-width: 120px;
}
.page-wrap-pad {
  display: flex;
  width: 100%;
  height: 100%;
  .cs-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow: hidden;
    height: 100%;
    top: 0;
    left: var(--nav-width);
    right: 0;
    width: auto;
    background-color: #ffffff;
    box-sizing: border-box;

    & > .cs-page__header {
      width: 100%;
      box-sizing: border-box;
      background-color: #ffffff;
      .van-nav-bar {
        // height: 46px;
        // line-height: 46px;
        width: 100%;
        box-sizing: border-box;
        background-color: #ffffff;
        // background-color: #676b6e;

        .van-nav-bar__left:active,
        .van-nav-bar__right:active,
        .van-nav-bar__text:active {
          background: none;
        }

        .van-icon,
        .van-nav-bar__left,
        .van-nav-bar__right {
          color: #181818;
          vertical-align: middle;
        }
        .van-nav-bar__text,
        .van-nav-bar__title {
          color: #333333;
          vertical-align: middle;
        }
        .van-icon-arrow-left {
          font-size: 24px;
          position: relative;
        }
        .van-nav-bar__right {
          .van-icon-more-o {
            font-size: 20px;
          }
        }
      }

      .button-back {
        background: url("../../theme/images/icon_back.png") no-repeat;
        background-size: cover;
        height: 10px;
        padding-right: 15px;
      }

      .app-function {
        height: 26px;
        border: 1px solid #dadada;
        border-radius: 13px;
        padding: 0px 5px;
        display: flex;
        box-sizing: border-box;
        .app-function-item {
          position: relative;
          padding: 0 8px;
          .van-icon {
            display: block;
            color: #333333;
            line-height: 26px;
            font-size: 14px;
          }
          .van-icon-ellipsis {
            font-weight: 600;
          }
          &::after {
            content: "";
            background-color: #dadada;
            width: 1px;
            height: 13px;
            position: absolute;
            right: 0;
            top: 5px;
          }
          &:last-child {
            &::after {
              display: none;
            }
          }
        }
      }
    }

    & > .cs-page__body {
      flex: 1;
      overflow: auto;
      width: 100%;
      box-sizing: border-box;
      position: relative;
    }

    & > .cs-page__footer {
      width: 100%;
      box-sizing: border-box;
    }

    .van-tabs {
      padding-top: 0px;
      .van-tab {
        font-size: 14px;
      }
    }

    .van-cell {
      .van-icon.van-icon-arrow {
        line-height: 1.5;
      }
    }
  }
}
</style>
