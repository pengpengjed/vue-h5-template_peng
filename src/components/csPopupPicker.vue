<template>
  <CsPopup
    v-model="popupVisible"
    ref="popup"
    class="cs-popup-picker"
    :show-header="false"
    :close-on-click-overlay="false"
    :getContainer="getContainer"
  >
    <VanPicker
      ref="picker"
      :show-toolbar="showToolbar"
      :title="title"
      :confirm-button-text="confirmButtonText"
      :cancel-button-text="cancelButtonText"
      :columns="comOptions"
      :default-index="defaultIndex"
      :value-key="textField"
      @confirm="onConfirm"
      @cancel="onCancel"
      @change="onChange"
    >
      <template #title v-if="isPickerTitleSearch">
        <input type="text" v-model="searchValue" class="input" @input="onInput" placeholder="请输入关键字搜索" />
      </template>
    </VanPicker>
  </CsPopup>
</template>

<script>
export default {
  name: 'CsPopupPicker',
  props: {
    closeOnClickOverlay: {
      type: Boolean,
      default: false
    },
    isPickerTitleSearch: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: '请选择'
    },
    // 绑定值
    value: {
      type: String,
      default: ''
    },
    // 确定按钮文本
    confirmButtonText: {
      type: String,
      default: '确定'
    },
    // 取消按钮文本
    cancelButtonText: {
      type: String,
      default: '取消'
    },
    // 选项数组
    options: {
      type: Array,
      default: () => []
    },
    // 值字段
    valueField: {
      type: String,
      default: 'value'
    },
    // 文本字段
    textField: {
      type: String,
      default: 'text'
    },
    // 标志返回数据是否是字符串数组
    isStringArrayData: {
      type: Boolean,
      default: false
    },
    // 显示工具栏
    showToolbar: {
      type: Boolean,
      default: true
    },
    // 容器
    getContainer: {
      default: 'body'
    }
  },
  data() {
    return {
      copyComOptions: [],
      searchValue: '', //搜索值
      // columns: [],
      defaultIndex: 0,
      pickerIndex: 0,
      prevIndex: 0,
      popupVisible: false,
      comValue: '',
      comOptions: []
    }
  },
  created() {
    this.init()
  },
  methods: {
    clearInputValue() {
      this.searchValue = ''
    },
    onInput() {
      this.$emit('onInputChange', this.searchValue)
      this.filterOptions(this.searchValue)
    },
    //根据搜索结果过滤下拉选项
    filterOptions(searchValue) {
      this.comOptions = this.copyComOptions.filter(item => {
        return item[this.textField].indexOf(searchValue) > -1
      })
    },
    init() {
      // let columns = [];
      let comOptions = []
      let defaultIndex = 0
      if (this.isStringArrayData) {
        this.options.forEach((item, index) => {
          // columns.push(item);
          comOptions.push({ [this.valueField]: item, [this.textField]: item })
          // 获取选中项
          if (this.value && this.value === item) {
            defaultIndex = index
          }
        })
      } else {
        this.options.forEach((item, index) => {
          // columns.push(item[this.textField]);
          comOptions.push(item)
          // 获取选中项
          if (this.value && this.value === item[this.valueField]) {
            defaultIndex = index
          }
        })
      }
      // 初始值
      // this.columns = columns;
      this.comOptions = comOptions
      this.copyComOptions = [...comOptions]
      this.defaultIndex = defaultIndex
      this.pickerIndex = this.defaultIndex
    },
    toggle() {
      this.popupVisible = !this.popupVisible
    },
    show() {
      this.popupVisible = true
    },
    hide() {
      this.popupVisible = false
    },
    getPicker() {
      return this.$refs.picker
    },
    onConfirm(value, index) {
      // 设置值
      const selectedItem = this.comOptions[index]
      this.comValue = selectedItem[this.valueField]
      this.$emit('input', this.comValue)
      this.$emit('select', this.comValue, selectedItem)
      if (this.pickerIndex !== this.prevIndex) {
        this.$emit('change', this.comValue)
      }
      this.popupVisible = false
    },
    onCancel() {
      // 还原这前的选择
      if (this.$refs.picker) {
        this.$refs.picker.setIndexes([this.prevIndex])
      }
      this.pickerIndex = this.prevIndex
      this.popupVisible = false
    },
    onChange(picker, value, index) {
      // 选项选中变更
      this.pickerIndex = index
    }
  },
  watch: {
    value(newValue) {
      this.comValue = newValue
    },
    popupVisible(newValue) {
      if (newValue) {
        this.prevIndex = this.pickerIndex
        return
      }
      this.clearInputValue()
      this.init()
      // this.filterOptions(this.searchValue)
    },
    options: {
      handler() {
        this.init()
      },
      deep: true
    }
  }
}
</script>

<style lang="less">
.cs-popup-picker {
  height: unset;
}
</style>
