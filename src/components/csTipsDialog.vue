<template>
  <van-dialog
    :className="className"
    v-model="visible"
    :title="title"
    :showConfirmButton="showConfirmButton"
    :showCancelButton="showCancelButton"
    :confirmButtonText="confirmButtonText"
    :cancelButtonText="cancelButtonText"
    :cancelButtonColor="cancelButtonColor"
    :confirmButtonColor="confirmButtonColor"
    @cancel="onClose"
    @confirm="confirm"
  >
    <img v-if="showIcon" class="btn-tishi" src="../theme/images/icon-tishi.png" alt="" />
    <div class="text" v-if="tips" v-html="tips"></div>
    <slot></slot>
  </van-dialog>
</template>
<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    //是否显示icon
    showIcon: {
      type: Boolean,
      default: true
    },
    //提示内容
    tips: {
      type: String,
      default: ""
    },
    //自定义类名
    className: {
      type: String,
      default: "tip-dialog"
    },
    title: {
      type: String,
      default: "提示"
    },
    //取消按钮文案
    cancelButtonText: {
      type: String,
      default: "关闭"
    },
    //确认按钮文案
    confirmButtonText: {
      type: String,
      default: "确认"
    },
    //是否展示确认按钮
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    //取消按钮颜色
    cancelButtonColor: {
      type: String,
      default: "#666666"
    },
    //确认按钮颜色
    confirmButtonColor: {
      type: String,
      default: "#367aff"
    },
    //是否展示取消按钮
    showCancelButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false
    };
  },
  watch: {
    value(val) {
      if (val) {
        this.visible = val;
      }
    }
  },
  methods: {
    onClose() {
      this.visible = false;
      this.$emit("input");
      this.$emit("close");
    },
    confirm() {
      this.$emit("confirm");
    }
  }
};
</script>

<style lang="less" scoped>
.tip-dialog {
  border-radius: 2px;
  /deep/ .van-hairline--top::after {
    border-color: #ecedee;
  }
  /deep/ .van-dialog__header {
    margin-bottom: 20px;
    padding: 0;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background-color: #367aff;
    color: #fff;
    font-size: 16px;
    font-weight: normal;
  }
  /deep/ .van-dialog__content {
    text-align: center;
  }
  .btn-tishi {
    margin-bottom: 10px;
    width: 16px;
    height: 16px;
  }
  .text {
    color: #333333;
    font-size: 14px;
  }
  /deep/ .van-dialog__footer {
    margin-top: 20px;
  }
}
</style>
