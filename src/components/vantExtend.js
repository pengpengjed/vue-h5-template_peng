export default {
  install(Vue) {
    // 默认设置Picker不允许Html
    const VanPicker = Vue.component('VanPicker')
    VanPicker.options.props.allowHtml.default = false

    // 标签页
    const VanTabs = Vue.component('VanTabs')
    VanTabs.options.props.animated.default = true
    VanTabs.options.props.swipeable.default = true
    VanTabs.mixin({
      mounted() {
        setTimeout(() => {
          this.resize()
        }, 600)
      }
    })

    // 输入框
    // window.vant.Field.props.formatter = {
    //   type: Function,
    //   default: function(value) {
    //     value = this.$utility.inputValidate(value);
    //     return value;
    //   }
    // };

    // 日历
    const VanCalendar = Vue.component('VanCalendar')
    VanCalendar.mixin({
      props: {
        // 是否默认滚动到选中日期
        autoIntoView: { type: Boolean, default: true }
      }
    })
    VanCalendar.options.methods.scrollIntoViewOld = VanCalendar.options.methods.scrollIntoView
    VanCalendar.options.methods.scrollIntoView = function () {
      if (this.autoIntoView) {
        this.scrollIntoViewOld()
      }
    }
    const VanOverlay = Vue.component('VanOverlay')
    const originalRender = VanOverlay.options.render
    VanOverlay.options.render = (...args) => {
      // 你的自定义逻辑
      if (args[1].parent.show) {
        window.storeInstance.commit('setOverlay', true)
      } else {
        window.storeInstance.commit('setOverlay', false)
      }
      // 调用原始的 render 方法，确保遮罩层正常渲染
      return originalRender.apply(this, args)
    }

    // 轮播图
    const VanSwipe = Vue.component('VanSwipe')
    VanSwipe.mixin({
      mounted() {
        setTimeout(() => {
          this.resize()
        }, 20)
      }
    })
  }
}
