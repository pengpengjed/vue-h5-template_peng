<template>
  <van-tabbar
    v-model="tabIndex"
    route
    :fixed="false"
    :class="{
      'pad-tabbar': true,
      isMasking: showOverlay,
      'small-tabbar': !showTabs,
    }"
    :style="{ width: showTabs ? lTabsWidth : sTabsWidth }"
    :before-change="beforeChange"
  >
    <div class="app-icon">
      <img src="../../theme/images/tabs/app_icon.png" alt="" />
      <div class="app-text" v-show="showTabs">IFLY</div>
      <i :class="showTabs ? 'close' : 'open'" @click="toggle"></i>
    </div>
    <van-tabbar-item
      @click="goPage('/message')"
      icon-prefix="icon"
      icon="message"
      :to="isCAS ? '/asm/message' : '/message'"
      :badge="messageBadge"
      replace
      ><span v-show="showTabs">消息</span></van-tabbar-item
    >
    <van-tabbar-item @click="goPage('/schedule')" v-if="!isCAS" icon-prefix="icon" icon="schedule" to="/schedule"
      ><span v-show="showTabs" replace>任务</span></van-tabbar-item
    >
    <van-tabbar-item
      @click="goPage(isCAS ? '/asm/workbench' : '/workbench')"
      icon-prefix="icon"
      icon="workbench"
      :to="isCAS ? '/asm/workbench' : '/workbench'"
      ><span v-show="showTabs" replace>工作台</span></van-tabbar-item
    >
    <!-- <van-tabbar-item @click="goPage('/mine')" v-if="!isCAS" icon-prefix="icon" icon="mine" to="/mine"
      ><span v-show="showTabs" replace>我的</span></van-tabbar-item
    > -->
    <div icon-prefix="icon" class="setting">
      <div class="set-item" @click="onScanClick">
        <img src="../../theme/images/tabs/scan.png" alt="" />
        <span v-show="showTabs">扫一扫</span>
      </div>
      <van-popover v-model="showPopover" trigger="click" placement="right" :offset="[-60, 0]" class="setting-pop" :overlay="true">
        <CsSetting @close="showPopover = false" />
        <template #reference>
          <div class="set-item">
            <img src="../../theme/images/tabs/setting.png" alt="" />
            <span v-show="showTabs">设置</span>
          </div>
        </template>
      </van-popover>
      <div class="set-item" @click="onLogoutClick">
        <img src="../../theme/images/tabs/exit.png" alt="" />
        <span v-show="showTabs">退出</span>
      </div>
    </div>
  </van-tabbar>
</template>

<script>
export default {
  props: {
  },
  data() {
    return {
      tabIndex: 2,
      lTabsWidth: '120px',
      sTabsWidth: '60px',
      showPopover: false,
    }
  },
  computed: {
    showTabs() {
      return this.$store.getters.showTabs;
    },
    showOverlay() {
      return this.$store.getters.showOverlay;
    },
  },
  created() {
    if (this.showTabs) {
      document.documentElement.style.setProperty('--nav-width', '120px');
    } else {
      document.documentElement.style.setProperty('--nav-width', '60px');
    }
  },
  methods: {
    toggle() {
      // 触发toggle
      this.$root.$emit('toggle', this.showTabs)
      // 修改状态
      this.$store.commit("setTabs", this.showTabs);
      // 持久缓存
      this.$localStorage.setItem('showTabs', this.showTabs)
      if (this.showTabs) {
        document.documentElement.style.setProperty('--nav-width', '120px');
      } else {
        document.documentElement.style.setProperty('--nav-width', '60px');
      }
    },
    onScanClick() {
      this.getQrCode().then(data => {
        this.$root.$emit("app-scan", data);
      });
    },
    getQrCode() {
      return new Promise((resolve, reject) => {
        // 调原生扫码
        if (this.isInApp) {
          this.$native.EmasBarcodeScanner.scan({ class: "qrcode" })
            .then(res => {
              // let result = res.scan_result ? JSON.parse(res.scan_result) : {};
              // 如果扫描结果为对象字符串则自动转为对象
              let result = res.scan_result || "";
              try {
                let obj = JSON.parse(result);
                result = obj;
              } catch (err) {
                //
              }
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        } else {
          let err = "不在App内，不能扫一扫";
          this.alertMessage(err);
          reject(err);
        }
      });
    },
    goPage(e) {
      console.log(e);
      // 首页不做处理
      if (this.isHomeModule) return
      // 其他页面跳转首页进入固定tab
      if(this.isTestPlatform){
        window.location.href = 'https://ceph-test-emasn.csair.com:7480/emas-cdn/app/nmobile-eplmFlightHome-pad/flightHomePad/index.html#?toTabs='+e
      }else if(this.isProductionPlatform){
        window.location.href = 'https://cdn-emasn.csair.com/csair-emas-cdn/app/nmobile-eplmFlightHome-pad/flightHomePad/index.html#?toTabs='+e
      }
    },
    beforeChange() {
      if (!this.isHomeModule) {
        return false
      } else {
        return true
      }
    },
    onLogoutClick() {
      this.$eplmApp
        .logout()
        .then(() => {
          // this.$router.push("/login");
          this.reloadModule();
        })
        .catch(() => { });
    },
  }
}
</script>

<style lang="less">
.pad-tabbar {
  height: 56px;
  // box-shadow: 0px 0px 8px 0px #ced5e4;
  flex-direction: column;
  height: 100%;
  width: 120px;
  //   left: 0;
  //   position: absolute;
  background: linear-gradient(to bottom, #e3efff 0%, #b7dcff 100%);
  transition: width 0.2s ease-in-out;
  z-index: 9999;
  box-sizing: border-box;
  will-change: width; /* 提前告知浏览器可能的变化 */
  transform: translateZ(0); /* 或使用 translate3d(0, 0, 0) */
  backface-visibility: hidden;
  perspective: 1000px;
  float: left;
  .app-icon {
    height: 77px;
    line-height: 77px;
    text-align: center;
    border-bottom: 1px solid #98b3ff;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    -webkit-white-space: nowrap; /* WebKit (旧版 Safari/Chrome) */
    -moz-white-space: nowrap; /* Gecko (旧版 Firefox) */
    -ms-white-space: nowrap; /* Trident (IE10+) */
    white-space: nowrap; /* 标准 */
    margin-bottom: 10px;
    img {
      width: 40px;
      height: 40px;
      display: inline-block; /* 强制文本不换行 */
    }
    .app-text {
      font-size: 15px;
      font-weight: 700;
      color: #000;
      margin-left: 10px;
      white-space: nowrap;
      overflow: hidden;
      display: inline-block; /* 强制文本不换行 */
    }
    .open {
      background-image: url("../../theme/images/tabs/zhankai.png");
      background-size: cover;
      background-repeat: no-repeat;
      background-position: 0 0;
      position: absolute;
      bottom: -10px;
      right: -4px;
      width: 20px;
      height: 20px;
    }
    .close {
      background-image: url("../../theme/images/tabs/shouqi.png");
      background-size: cover;
      background-repeat: no-repeat;
      background-position: 0 0;
      position: absolute;
      bottom: -10px;
      right: -4px;
      width: 20px;
      height: 20px;
    }
  }
  &::after {
    border: 0;
  }
  .setting {
    flex: 1 !important;
    background: url("../../theme/images/tabs/tabbar_bg.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-color: transparent;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    padding: 0 10px;
    padding-bottom: 15px;
    text-align: center;

    .set-item {
      margin: 10px 0;
      height: 30px;
      line-height: 30px;
      border-radius: 40px;
      background-color: #fff;
      white-space: nowrap;
      overflow: hidden;
      span {
        margin-left: 10px;
        color: #567dfe;
        font-size: 12px;
      }
      img {
        width: 16px;
        height: 16px;
        vertical-align: middle;
      }
    }
  }
  .van-tabbar-item {
    padding: 15px 0;
    flex: unset;
    margin: 10px 0;
    flex-direction: row;

    .van-tabbar-item__icon {
      .icon {
        width: 20px;
        height: 20px;
        display: block;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: 0 0;
      }

      .icon-message {
        background-image: url("../../theme/images/tabs/message.png");
      }
      .icon-schedule {
        background-image: url("../../theme/images/tabs/schedule.png");
      }
      .icon-workbench {
        background-image: url("../../theme/images/tabs/workbench.png");
      }
      .icon-module {
        background-image: url("../../theme/images/tabs/module.png");
      }
      .icon-mine {
        background-image: url("../../theme/images/tabs/mine.png");
      }
      .van-info {
        white-space: nowrap;
      }
    }
    .van-tabbar-item__icon {
      width: 40px;
      .icon {
        margin-left: auto;
      }
    }
    .van-tabbar-item__text {
      font-size: 12px;
      flex: 1;
      color: #98b3ff;
      white-space: nowrap;
      margin-left: 10px;
    }
  }

  .van-tabbar-item--active {
    background: url("../../theme/images/tabs/tab_icon_active_bg.png") no-repeat center center;
    background-size: 110px 105px;
    z-index: 2;
    position: relative;
    padding-left: 4px;
    .van-tabbar-item__icon {
      margin-left: 10px;
      .icon {
        width: 36px;
        height: 36px;
      }
      .icon-message {
        background-image: url("../../theme/images/tabs/message_active.png");
      }
      .icon-schedule {
        background-image: url("../../theme/images/tabs/schedule_active.png");
      }
      .icon-workbench {
        background-image: url("../../theme/images/tabs/workbench_active.png");
      }
      .icon-module {
        background-image: url("../../theme/images/tabs/module_active.png");
      }
      .icon-mine {
        background-image: url("../../theme/images/tabs/mine_active.png");
      }
    }
    .van-tabbar-item__text {
      color: #205aff;
      font-weight: 600;
    }
  }
}
.isMasking {
  .van-tabbar-item--active {
    background: url("../../theme/images/tabs/tab_icon_active_over_bg.png") no-repeat center center;
    background-size: 110px 105px;
    transition: 0.3s;
  }
}
.small-tabbar {
  .van-tabbar-item--active {
    background: url("../../theme/images/tabs/tab_icon_active_small_bg.png") no-repeat center center transparent;
    background-size: cover;
    padding-left: 17px;
    margin-left: 0;
  }
}
.small-tabbar.isMasking {
  .van-tabbar-item--active {
    background: url("../../theme/images/tabs/tab_icon_active_small_over_bg.png") no-repeat center center transparent;
    background-size: cover;
    transition: 0.3s;
  }
}
.van-popover {
  margin-left: 20px !important;
  overflow: visible;
  border-radius: 10px !important;
  .van-popover__arrow {
    /* transform: translateY(-78px); */
    transform: translate(-100%, 50px) !important;
  }
}
</style>