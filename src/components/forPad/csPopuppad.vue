<template>
  <van-popup
    class="cs-popup-pad"
    @closed="handleClosed"
    v-model="popupVisible"
    :position="position"
    round
    :get-container="getContainer"
    :close-on-click-overlay="closeOnClickOverlay"
  >
    <div class="cs-popup__header" v-if="showHeader">
      <slot name="header">
        <span class="cs-popup__title">
          <slot name="title">{{ title }}</slot>
        </span>
        <van-icon name="cross" :size="20" @click="onCloseClick" />
      </slot>
    </div>
    <div class="cs-popup__body">
      <slot></slot>
    </div>
    <div class="cs-popup__footer" v-if="showFooter">
      <slot name="footer">
        <button class="cs-popup__button cancel" v-if="showCloseButton" @click="onCloseClick">
          {{ closeButtonText }}
        </button>
        <button class="cs-popup__button confirm" v-if="showConfirmButton" @click="onConfirmClick">
          {{ confirmButtonText }}
        </button>
      </slot>
    </div>
  </van-popup>
</template>

<script>
export default {
  name: 'CsPopup',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {},
    // 弹出位置，可选值为 top bottom right left
    position: {
      type: String,
      default: 'center'
    },
    // 容器
    getContainer: {
      default: 'body'
    },
    // 显示头部
    showHeader: {
      type: Boolean,
      default: true
    },
    // 显示关闭按钮
    showCloseButton: {
      type: Boolean,
      default: true
    },
    // 显示确认按钮
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    // 关闭按钮文本
    closeButtonText: {
      type: String,
      default: '取消'
    },
    // 确定按钮文本
    confirmButtonText: {
      type: String,
      default: '提交'
    },
    // 是否在点击遮罩层后关闭
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      popupVisible: false
    }
  },
  created() {
    this.popupVisible = this.value
  },
  methods: {
    handleClosed() {
      this.$emit('closed')
    },
    onCloseClick() {
      this.$emit('close')
    },
    onConfirmClick() {
      this.$emit('confirm')
    }
  },
  watch: {
    value(newValue) {
      this.popupVisible = newValue
    },
    popupVisible(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$emit('input', newValue)
      }
    }
  }
}
</script>

<style lang="less">
.cs-popup-pad {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .cs-popup__header {
    height: 46px;
    line-height: 46px;
    background-color: #3788fe;
    color: #ffffff;
    display: flex;
    align-items: center;
    padding: 0 20px;
  }
  .cs-popup__footer {
    padding: 5px 15px 15px;
    text-align: right;
    .cs-popup__button {
      text-align: center;
      border: none;
      width: 100px;
      padding: 4px 10px;
      border-radius: 5px;
    }
    .cancel {
      background-color: #fff;
      color: #666666;
      margin-right: 10px;
      border: 1px solid #e4e7f3;
    }
    .confirm {
      background-color: #638dfd;
      color: #ffffff;
    }
  }

  .cs-popup__button_close {
    width: 60px;
    text-align: center;
  }
  .cs-popup__title {
    flex: 1;
    text-align: left;
  }

  .cs-popup__body {
    flex: 1;
    overflow: auto;
    position: relative;
  }
}
</style>
