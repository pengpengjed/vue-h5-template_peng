<template>
  <van-popup
    class="cs-popup"
    @closed="handleClosed"
    v-model="popupVisible"
    :position="position"
    :get-container="getContainer"
    :close-on-click-overlay="closeOnClickOverlay"
    :safe-area-inset-bottom="safeAreaInsetBottom"
  >
    <div class="cs-popup__header" v-if="showHeader">
      <slot name="header">
        <span class="cs-popup__button">
          <span class="leftBtn" v-if="showCloseButton" @click="onCloseClick">{{ closeButtonText }}</span>
        </span>
        <span class="cs-popup__title">
          <slot name="title">{{ title }}</slot>
        </span>
        <span class="cs-popup__button">
          <span class="rightBtn" v-if="showConfirmButton" @click="onConfirmClick">{{ confirmButtonText }}</span>
        </span>
      </slot>
    </div>
    <div class="cs-popup__body">
      <slot></slot>
    </div>
    <div class="cs-popup__footer" v-if="$slots.footer">
      <slot name="footer"></slot>
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
      default: 'bottom'
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
      default: '关闭'
    },
    // 确定按钮文本
    confirmButtonText: {
      type: String,
      default: '确定'
    },
    // 是否在点击遮罩层后关闭
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    },
    // 是否开启IOS底部安全区适配
    safeAreaInsetBottom: {
      type: Boolean,
      default: true
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
.cs-popup {
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
  }

  .cs-popup__button {
    width: 60px;
    text-align: center;
  }

  .cs-popup__title {
    flex: 1;
    text-align: center;
  }

  .cs-popup__body {
    flex: 1;
    overflow: auto;
    position: relative;
  }
}
</style>
