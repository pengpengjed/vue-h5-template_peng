<template>
  <div class="app-setting">
    <div class="button-setting" @click="popupVisible = true"><van-icon name="setting-o" /></div>
    <van-popup v-model="popupVisible" get-container="body" position="bottom">
      <div class="app-setting-container" style="height: 300px">
        <van-cell-group>
          <van-cell title="字体设置" class="van-cell-vertical">
            <div style="padding: 20px 35px;">
              <van-slider v-model="sliderValue" :min="-10" max="20" :step="10">
                <template #button>
                  <div class="custom-slider-button">{{ fontModeText[sliderValue.toString()].text }}</div>
                </template>
              </van-slider>
            </div>
          </van-cell>
          <van-cell title="数据缓存">
            <van-button type="info" size="mini" @click="onClearCacheClick">清空</van-button>
          </van-cell>
          <van-cell title="关联用户" v-if="!isSTM && !relateUser && userRight['sys_ehome_relate']">
            <div class="switch-simulate-user">
              <input type="text" v-model="relateId" placeholder="请输入关联用户账号" />
              <van-button type="info" size="mini" @click="onSwitchUserClick">关联</van-button>
            </div>
          </van-cell>
          <van-cell title="调试器" v-if="!isProductionPlatform">
            <van-switch v-model="vConsoleEnabled" style="float:right;" size="24px" @change="onVconsoleChange" />
          </van-cell>
        </van-cell-group>
        <div style="text-align: center; margin-top: 10px">
          <van-button type="danger" plain hairline size="small" @click="onLogoutClick">退出登录</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import VConsole from "vconsole";
export default {
  name: "AppSetting",
  data() {
    return {
      popupVisible: false,
      sliderValue: 0,
      fontModeText: {
        "-10": { text: "小", mode: "S" },
        "0": { text: "标准", mode: "N" },
        "10": { text: "大", mode: "L" },
        "20": { text: "超大", mode: "XL" }
      },
      relateId: "",
      userRight: {},
      moduleUpgrade: {
        progerss: 0,
        current: "",
        upgrading: false
      },
      vConsoleEnabled: false
    };
  },
  created() {
    this.loadRight();
    const fontMode = this.$localStorage.getItem("FDPT_FONT_MODE");
    if (fontMode === "S") {
      this.sliderValue = -10;
    } else if (fontMode === "N") {
      this.sliderValue = 0;
    } else if (fontMode === "L") {
      this.sliderValue = 10;
    } else if (fontMode === "XL") {
      this.sliderValue = 20;
    }
    this.vConsoleEnabled = this.$localStorage.getItem(this.$storeKeys.vConsoleEnabled) || false;
  },
  methods: {
    onLogoutClick() {
      this.popupVisible = false;
      this.$eplmApp
        .logout()
        .then(() => {
          // this.$router.push("/login");
          this.reloadModule();
        })
        .catch(() => {});
    },
    loadRight() {
      this.getRights()
        .then(right => {
          this.userRight = right;
        })
        .catch(() => {});
    },
    dispatchEvent() {
      const customEvent = new CustomEvent("fontModeChange", {});
      window.dispatchEvent(customEvent);
    },
    onClearCacheClick() {
      // 弹出确认窗口
      this.$dialog
        .confirm({
          title: "提示",
          message: "您确认要清空数据缓存，并重载模块吗？"
        })
        .then(() => {
          this.popupVisible = false;
          // 清空缓存
          this.$localStorage.clear();
          this.$sessionStorage.clear();
          // 重载页面
          // window.location.reload();
          window.location.href = `${this.$utility.getModuleUrl()}?r=${new Date().getTime()}`;
        })
        .catch(() => {});
    },
    onSwitchUserClick() {
      if (!this.relateId) {
        this.alertMessage("请输入关联用户账号");
        return;
      } else if (this.relateId.length > 9) {
        this.alertMessage("请输入有效的关联用户账号");
        return;
      } else if (this.relateId === this.userId) {
        this.alertMessage("不能关联自己");
        return;
      }
      this.popupVisible = false;
      this.$dialog.confirm({
        title: "提示",
        message: `您确定要关联【${this.relateId}】用户吗？`,
        beforeClose: (action, done) => {
          if (action === "confirm") {
            this.getIebTokenRelate(this.relateId)
              .then(res => {
                const operationRights = {};
                if (res.OperationResourceSet) {
                  res.OperationResourceSet.forEach(item => {
                    operationRights[item] = true;
                  });
                }
                let accountMessage = window.$sessionStorage.getItem(this.$storeKeys.loginUser) || {};
                // 设置关联用户缓存数据
                this.$localStorage.setItem(this.$storeKeys.relateUser, {
                  userId: this.userId,
                  relateId: this.relateId,
                  token: res.Data,
                  isCAS: res.isCAS || false,
                  isCSG: res.orgUnitBase === "CSG",
                  isCKG: res.orgUnitBase === "CKG",
                  stdNum: res.stdNum || "",
                  tempStaffNum: res.tempStaffNum || "",
                  rights: operationRights,
                  ssotoken: accountMessage.ssotoken // 从APP外壳得到的token
                });
                done();
                // 刷新页面
                window.location.reload();
              })
              .catch(() => {
                done();
              });
          } else {
            done();
          }
        }
      });
      // this.confirmMessage(`您确定要关联【${this.relateId}】用户吗？`)
      //   .then(() => {})
      //   .catch(() => {});
    },
    onVconsoleChange(value) {
      if (value) {
        window.vConsoleInstance = new VConsole();
        this.$localStorage.setItem(this.$storeKeys.vConsoleEnabled, true);
      } else {
        if (window.vConsoleInstance) {
          window.vConsoleInstance.destroy();
        }
        this.$localStorage.setItem(this.$storeKeys.vConsoleEnabled, false);
      }
    }
  },
  watch: {
    sliderValue() {
      this.$localStorage.setItem(this.$storeKeys.fontMode, this.fontModeText[this.sliderValue.toString()].mode);
      window.setRem();
      this.$nextTick(() => {
        this.dispatchEvent();
      });
    }
  },
  computed: {
    relateUser() {
      return this.relateUserId || "";
    }
    // switchServerEnable() {
    //   return this.$env.VUE_APP_SWITCH_SERVER === "true";
    // }
  }
};
</script>

<style lang="less">
.app-setting {
  .button-setting {
    width: 28px;
    height: 28px;
    position: absolute;
    top: 10px;
    right: 10px;
    line-height: 30px;
    text-align: center;
    border-radius: 100px;
    // opacity: 0.7;
    // border: 1px solid #e8e8e8;
    background-color: #b5b5b5;
    color: #ffffff;
    box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);
    z-index: 9;
    .van-icon {
      font-size: 18px;
      display: block;
      line-height: 28px;
      &::before {
        display: block;
        line-height: 28px;
        // margin-top: -1px;
      }
    }
  }
}
.app-setting-container {
  height: 300px;
  overflow: auto;
  .custom-slider-button {
    width: 36px;
    // padding: 0 6px;
    color: #ffffff;
    font-size: 10px;
    line-height: 20px;
    text-align: center;
    background-color: #337ab7;
    border: 1px solid #2e6da4;
    border-radius: 100px;
  }
  .van-button {
    border-radius: 4px;
  }
  .switch-simulate-user {
    display: flex;
    flex-direction: row;
    align-items: center;
    input {
      margin-right: 10px;
      background-color: #f2f2f2;
      border-radius: 4px;
      flex: 1;
      border: 1px solid #e8e8e8;
      padding: 1px 6px;
      color: #333333;
      font-size: 13px;
      width: 100%;
    }
    // .cs-user-cell {
    //   margin-right: 10px;
    // }
    // .van-cell:not(.cs-user-cell) {
    //   padding: 2px 5px;
    //   background-color: #f2f2f2;
    //   border-radius: 4px;
    //   .van-cell__title {
    //     display: none;
    //   }
    //   .van-icon {
    //     display: none;
    //   }
    // }
  }
  .module-upgrade {
    display: flex;
    flex-direction: row;
    align-items: center;
    .progress {
      padding-top: 10px;
      flex: 1;
    }
  }
  .module-upgrading-tips {
    margin-top: 10px;
    font-size: 12px;
    text-align: left;
    line-height: 17px;
    color: #888888;
  }
}
</style>
