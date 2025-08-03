<template>
  <van-cell :title="title" class="cs-address-cell" is-link>
    <div class="address-select" @click="onSelectClick">
      <input
        type="text"
        class="van-field__control"
        :value="selectValue.join(separator)"
        :placeholder="isCityType ? '请选择省/市' : '请选择省/市/区'"
        readonly
        :disabled="disabled"
      />
      <van-icon name="cross" @click.stop="onClearClick" v-if="hasSelectedValue && clearable" />
    </div>
    <div class="address-input" v-if="!isCityType">
      <van-field
        type="textarea"
        v-model="inputValue"
        rows="1"
        autosize
        :placeholder="placeholder"
        @change="onInputChange"
        :disabled="disabled"
      />
    </div>

    <!-- 弹出层 -->
    <van-popup v-model="popupVisible" position="bottom" get-container="body" :style="{ height: '40%' }">
      <van-picker
        ref="picker"
        show-toolbar
        title="标题"
        value-key="value"
        :columns="columns"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>
  </van-cell>
</template>

<script>
import CsAddressData from './csAddressData'
import CsCityData from './csCityData'
export default {
  name: 'csAddressCell',
  props: {
    // 绑定值
    value: {
      type: String
    },
    // 标题文本
    title: {
      type: String
    },
    // 分隔符
    separator: {
      type: String,
      default: '/'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 水印
    placeholder: {
      type: String,
      default: '请输入详细地址'
    },
    // 类型
    type: {
      type: String,
      default: 'address' // address - 地址，city - 城市
    },
    // 设置是否可清空选中值
    clearable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      popupVisible: false,
      selectValue: [],
      inputValue: '',
      columns: []
    }
  },
  created() {
    this.columns = this.isCityType ? CsCityData : CsAddressData
  },
  mounted() {
    this.initValue()
  },
  methods: {
    initValue: function () {
      if (this.value) {
        let valueArray = this.value.split(this.separator)
        let selectValue = [],
          inputValue = ''

        // 数据初始化
        if (!this.isCityType) {
          // 地址选择
          if (valueArray.length === 4) {
            // 完整地址
            selectValue = [valueArray[0], valueArray[1], valueArray[2]]
            inputValue = valueArray[3]
          } else if (valueArray.length === 3) {
            if (valueArray[0].indexOf('市') !== -1 || valueArray[0].indexOf('行政区') !== -1) {
              // 直辖市或者特别行政区
              selectValue = [valueArray[0], valueArray[0], valueArray[1]]
              inputValue = valueArray[2]
            } else {
              // 没有详细地址
              selectValue = [valueArray[0], valueArray[1], valueArray[2]]
            }
          } else if (valueArray.length === 2) {
            if (valueArray[0].indexOf('市') !== -1 || valueArray[0].indexOf('行政区') !== -1) {
              // 直辖市或者特别行政区
              selectValue = [valueArray[0], valueArray[0], valueArray[1]]
            } else {
              inputValue = this.value
            }
          } else {
            inputValue = this.value
          }
        } else {
          // 城市选择
          if (valueArray.length === 2) {
            selectValue = [valueArray[0], valueArray[1]]
          } else {
            if (valueArray[0].indexOf('市') !== -1 || valueArray[0].indexOf('行政区') !== -1) {
              // 直辖市或者特别行政区
              selectValue = [valueArray[0], valueArray[0]]
            }
          }
        }

        this.selectValue = selectValue
        this.inputValue = inputValue
      } else {
        this.selectValue = []
        this.inputValue = ''
      }
    },
    onSelectClick() {
      if (!this.disabled) {
        this.popupVisible = true
        this.$nextTick(() => {
          this.$refs.picker.setValues(this.selectValue)
        })
      }
    },
    onCancel() {
      this.popupVisible = false
    },
    onConfirm(value) {
      this.selectValue = value
      this.emitEvent()
      this.popupVisible = false
    },
    onInputChange() {
      this.emitEvent()
    },
    onClearClick() {
      this.selectValue = []
      this.inputValue = ''
      this.emitEvent()
    },
    emitEvent() {
      let selectValue = [].concat(this.selectValue)
      // 直辖市或者特别行政区数据把重复的市去掉
      if (selectValue.length && (selectValue[0].indexOf('市') !== -1 || selectValue[0].indexOf('行政区') !== -1)) {
        selectValue.splice(0, 1)
      }
      let address = selectValue.join(this.separator)

      // 把输入框的分隔符替换
      this.inputValue = this.inputValue.replaceAll(this.separator, '\\')
      if (this.inputValue) {
        address += this.separator + this.inputValue
      }
      this.$emit('input', address)
      this.$emit('change', address)
    }
  },
  computed: {
    isCityType() {
      return this.type === 'city'
    },
    hasSelectedValue() {
      return this.selectValue.length || this.initValue.length
    }
  },
  watch: {
    value() {
      this.initValue()
    }
  }
}
</script>

<style lang="less">
.cs-address-cell {
  .address-select {
    display: flex;
    flex-direction: row;
    align-items: center;
    & > input {
      flex: 1;
      width: auto;
    }
    & > .van-icon-cross {
      padding: 0 3px;
      font-size: 15px;
      color: #d43f3a;
      margin-top: -2px;
    }
  }
  .address-input {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
