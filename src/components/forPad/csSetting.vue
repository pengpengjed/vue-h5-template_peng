<template>
  <div class="cs-app-more-pad">
    <div class="title">设置</div>
    <div class="cs-app-more-list">
      <!-- <div class="css-app-more-item" style="width: 100%" v-if="isHomeModule">
          <div style="padding: 20px 35px">
            <van-slider v-model="sliderValue" :min="-1" max="2" :step="1">
              <template #button>
                <div class="custom-slider-button">{{ fontModeText[sliderValue.toString()].text }}</div>
              </template>
            </van-slider>
          </div>
          <div class="text">字体设置</div>
        </div> -->
      <div class="css-app-more-item" @click="onReloadClick">
        <div class="text">重新载入</div>
        <van-icon name="arrow"></van-icon>
      </div>
      <div class="css-app-more-item" @click="onClearClick">
        <div class="text">清除缓存</div>
        <van-icon name="arrow"></van-icon>
      </div>
      <!-- 不在APP内 或者 app的测试环境Home模块 -->
      <div class="css-app-more-item" @click="onExchangeClick" v-if="switchServerEnable">
        <div class="text">切换服务</div>
        <van-icon name="arrow"></van-icon>
      </div>
      <template v-if="isHomeModule">
        <!-- 只在Home模块出现 -->
        <div class="css-app-more-item" v-if="!isProductionPlatform">
          <div class="text">调试器</div>
          <div style="flex: 1;textAlign: right;">
            <van-switch v-model="vConsoleEnabled" size="18px" @change="onVconsoleChange" />
          </div>
        </div>
        <div class="css-app-more-item" @click="onRelateClick" v-if="!isSTM && !relateUser && userRight['sys_ehome_relate']">
          <div class="text">关联用户</div>
          <van-icon name="arrow"></van-icon>
        </div>
      </template>
      <div class="css-app-more-item" @click="onModuleClick">
        <div class="text">模块管理</div>
        <van-icon name="arrow"></van-icon>
      </div>
      <div class="css-app-more-item" @click="onAboutClick" v-if="isHomeModule">
        <div class="text">关于我们</div>
        <van-icon name="arrow"></van-icon>
      </div>
    </div>
    <!-- 关联用户 -->
    <van-dialog
      v-model="relateDialogVisible"
      title="关联用户"
      get-container="body"
      show-cancel-button
      class="relate-user-dialog-pad"
      :before-close="onRelateBeforeClose"
    >
      <van-form ref="relateForm" v-if="relateDialogVisible">
        <van-field v-model="relateForm.staffNum" placeholder="请输入关联员工号" required :rules="relateRules.staffNum">
          <template #left-icon>
            <van-icon name="contact" />
          </template>
        </van-field>
      </van-form>
    </van-dialog>

    <!-- 切换服务器，仅开发环境开启 -->
    <van-popup
      v-if="switchServerEnable"
      v-model="serverPopupVisible"
      get-container="body"
      class="app-server-popup-pad"
    >
      <CsServerList @close="serverPopupVisible = false"></CsServerList>
    </van-popup>

    <!-- 模块管理列表 -->
    <van-popup  v-model="modulePopupVisible"  get-container="body" class="app-module-popup-pad">
      <CsModuleList @close="modulePopupVisible = false"></CsModuleList>
    </van-popup>
    <!-- 关于我们 -->
    <van-popup  v-model="aboutPopupVisible"  get-container="body" class="app-module-popup-pad">
      <cs-about @close="aboutPopupVisible = false"></cs-about>
    </van-popup>
  </div>
</template>

<script>
import VConsole from "vconsole";
import { getIebTokenRelate, getIflyTokenRelate } from "@/core";
export default {
  name: "CsSetting",
  data() {
    return {
      vConsoleEnabled: false,
      relateDialogVisible: false,
      serverPopupVisible: false,
      modulePopupVisible: false,
      aboutPopupVisible:false,
      sliderValue: 0,
      fontModeText: {
        "-1": { text: "小", mode: "S" },
        "0": { text: "标准", mode: "N" },
        "1": { text: "大", mode: "L" },
        "2": { text: "超大", mode: "XL" }
      },
      relateForm: {
        staffNum: ""
      },
      relateRules: {
        staffNum: [
          { required: true, message: "请输入关联员工号" },
          {
            validator: val => {
              return val.length <= 9;
            },
            message: "请输入有效的关联员工号"
          },
          {
            validator: val => {
              return val !== this.userId;
            },
            message: "不能关联自己"
          }
        ]
      },
      userRight: {},
    };
  },
  created() {
    this.loadRight();
    const fontMode = this.$localStorage.getItem(this.$storeKeys.fontMode);
    if (fontMode === "S") {
      this.sliderValue = -1;
    } else if (fontMode === "N") {
      this.sliderValue = 0;
    } else if (fontMode === "L") {
      this.sliderValue = 1;
    } else if (fontMode === "XL") {
      this.sliderValue = 2;
    }
    this.vConsoleEnabled = this.$localStorage.getItem(this.$storeKeys.vConsoleEnabled) || false;
  },
  methods: {
    onCancelClick() {
      this.$emit("close");
    },
    onReloadClick() {
      this.reloadModule();
    },
    onClearClick() {
      this.$dialog
        .confirm({
          title: "提示",
          message: "您确认要清空数据缓存，并重载模块吗？"
        })
        .then(() => {
          window.$localStorage.clear();
          window.$sessionStorage.clear();
          this.reloadModule();
        })
        .catch(() => { });
    },
    onExchangeClick() {
      this.$emit("close");
      this.$nextTick(() => {
        this.serverPopupVisible = true;
      });
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
    },
    dispatchEvent() {
      const customEvent = new CustomEvent("fontModeChange", {});
      window.dispatchEvent(customEvent);
    },
    onRelateClick() {
      this.$emit("close");
      this.relateDialogVisible = true;
    },
    onRelateBeforeClose(action, done) {
      if (action === "confirm") {
        this.$refs.relateForm
          .validate()
          .then(() => {
            this.submitRelateUser()
              .then(() => {
                this.reloadModule();
                done();
              })
              .catch(() => {
                done(false);
              });
          })
          .catch(() => {
            done(false);
          });
      } else {
        done();
      }
    },
    submitRelateUser() {
      return new Promise((resolve, reject) => {
        if (!this.relateForm.staffNum) {
          this.alertMessage("请输入关联用户账号");
          return;
        } else if (this.relateForm.staffNum.length > 9) {
          this.alertMessage("请输入有效的关联用户账号");
          return;
        } else if (this.relateForm.staffNum === this.userId) {
          this.alertMessage("操作失败，目标账号与登录号相同");
          return;
        }

        // this.getIebTokenRelate(this.relateForm.staffNum)
        Promise.all([getIebTokenRelate(this.relateForm.staffNum), getIflyTokenRelate(this.relateForm.staffNum)])
          .then(([iebRes, iflyRes]) => {
            const operationRights = {};
            if (iebRes.OperationResourceSet) {
              iebRes.OperationResourceSet.forEach(item => {
                operationRights[item] = true;
              });
            }
            let accountMessage = window.$sessionStorage.getItem(this.$storeKeys.loginUser) || {};
            // 设置关联用户缓存数据
            this.$localStorage.setItem(this.$storeKeys.relateUser, {
              userId: this.userId,
              relateId: this.relateForm.staffNum,
              relateName: iebRes.chnName,
              token: iebRes.Data, // 飞行门户Token
              iflyToken: window.$sessionStorage.getItem(this.$storeKeys.iflyToken),
              iflyRelateToken: iflyRes, // 御风系统关联Token
              isCAS: iebRes.isCAS || false,
              isCSG: iebRes.orgUnitBase === "CSG",
              isCKG: iebRes.orgUnitBase === "CKG",
              stdNum: iebRes.stdNum || "",
              tempStaffNum: iebRes.tempStaffNum || "",
              rights: operationRights,
              ssotoken: accountMessage.ssotoken // 从APP外壳得到的token
            });
            resolve(iebRes);
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    },
    onLogoutClick() {
      this.$emit("close");
      this.$eplmApp
        .logout()
        .then(() => {
          // this.$router.push("/login");
          this.reloadModule();
        })
        .catch(() => { });
    },
    onModuleClick() {
      this.$emit("close");
      console.log(111);
      this.$nextTick(() => {
        this.modulePopupVisible = true;
      });
    },
    onAboutClick() {
      this.$emit("close");
      this.$nextTick(() => {
        this.aboutPopupVisible = true;
      });
    },
    loadRight() {
      this.getRights()
        .then(right => {
          this.userRight = right;
        })
        .catch(() => {});
    },
  },
  computed: {
    userRights() {
      return this.$store.getters.userRights;
    },
    relateUser() {
      return this.relateUserId || "";
    },
    isLogined() {
      // return this.$eplmApp.isLogined();
      return this.$route.name !== "login" && this.$route.name !== "loginForgetPassword";
    },
    switchServerEnable() {
      // 仅对开发环境 与 测试环境的home模块(有sys_server_switching权限) 开放
      if (
        !this.isInApp ||
        (this.isInApp && this.isTestPlatform && this.isHomeModule && this.userRights["sys_server_switching"])
      ) {
        // 开发环境
        return this.$env.VUE_APP_SWITCH_SERVER === "true";
      } else {
        return false;
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
  }
};
</script>

<style lang="less" scoped>
.cs-app-more-pad {
  padding: 0 0px 10px;
  background-color: #fff;
  width: 200px;
  border-radius: 10px;
  .title {
    text-align: center;
    padding: 5px 0;
    color: #fff;
    font-size: 15px;
    background-color: #638dfd;
  }
  .cs-app-more-list {
    padding: 0 10px;
    .css-app-more-item {
      text-align: left;
      padding: 5px 0px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      .van-icon {
        font-size: 14px;
        height: 22px;
        line-height: 22px;
        flex: 1;
        text-align: right;
      }
      .text {
        color: #666666;
        font-size: 12px;
        width: 100px;
      }

      &.btn-logout {
        margin: 0 20px;
        width: 100%;
        .van-button {
          height: 40px;
          border-radius: 20px;
          border: 1px solid #f6888d;
          color: #ff2020;
          display: block;
          width: 100%;
          .van-button__icon {
            vertical-align: middle;
            margin-top: -1px;
            margin-right: 5px;
          }
        }
      }
    }
  }

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

  .botton-bar {
    padding: 15px 15px 0px;
    text-align: center;
    border-top: 1px solid #e8e8e8;
    margin-top: 5px;
  }
}

.relate-user-dialog-pad {
  .van-form {
    margin: 15px;
    padding: 10px 5px;
    border-radius: 5px;
  }
  .van-icon-contact {
    color: #638dfd;
  }
  .van-cell {
    border: 1px solid #4273ff;
  }
  .van-field__label {
    padding: 3px;
    width: 55px;
    margin-right: 0;
  }
  .van-field__body {
    input {
      background-color: #f8f9fc;
      border-radius: 4px;
      padding: 3px 5px;
    }
  }
}
.app-server-popup-pad {
  height: 70%;
}

.app-module-popup {
  height: 80%;
  border-radius: 10px;
}
.cs-server-list{
  /deep/ .header{
    border-radius: 0 !important;
    background-color: #638dfd !important;
  }
}

.cs-module-list{
  /deep/ .header{
    border-radius: 0 !important;
    background-color: #638dfd !important;
  }

}
</style>
