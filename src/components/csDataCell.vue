<template>
  <van-cell
    :title="title"
    class="cs-data-cell"
    :class="{ editable: editable, clearable: clearable }"
    :is-link="!disabled"
    @click="onCellClick"
    :required="required"
  >
    <van-loading size="22px" v-if="componentLoading" />
    <div v-else :class="{ 'no-data': !hasSelectedValue }">
      <template v-if="multiple">
        <div class="multiple_box">
          <template v-if="!isStringValue">
            <div v-for="text in componentText" :key="text">{{ text }}</div>
          </template>
          <div v-else class="multipetoStringValue">
            {{ componentText.join(',') }}
          </div>
          <van-icon v-if="closeAll" color="#c9d0dc" @click.stop="onClear" name="clear" />
        </div>
      </template>
      <div class="picker-single-value" v-else>
        <input
          type="text"
          class="input-text"
          v-if="editable && !disabled"
          :value="componentValue ? componentText : ''"
          @click.stop="onInputClick"
          @change="onInputKeyUp"
          placeholder="请选择或者输入"
        />
        <span v-else>{{ componentText }}</span>
        <van-icon name="cross" @click.stop="onClearClick" v-if="hasSelectedValue && clearable" />
      </div>
    </div>

    <van-popup v-model="popupVisible" position="bottom" get-container="body" v-if="!disabled" @click-overlay="onCancel">
      <!--单选-->
      <template v-if="!multiple">
        <van-picker
          :columns="pickerColumns"
          @confirm="onConfirm"
          @cancel="onCancel"
          :default-index="pickerValue"
          show-toolbar
          :title="pickerTitle"
          ref="picker"
        >
          <input
            class="picker-search"
            v-model="keyword"
            slot="title"
            type="text"
            placeholder="请输入关键字搜索"
            v-if="searchable"
          />
        </van-picker>
      </template>
      <!--多选-->
      <template v-else>
        <div class="cs-data-popup-multiple">
          <div class="header">
            <button class="button_cancel" @click="onCancel">取消</button>
            <div class="title">
              <input
                class="picker-search"
                v-model="keyword"
                type="text"
                placeholder="请输入关键字搜索"
                v-if="searchable"
              />
              <span v-else>请选择</span>
            </div>
            <button class="button_confirm" @click="onConfirm">确定</button>
          </div>
          <div class="content">
            <van-checkbox-group v-model="pickerValue">
              <van-cell-group :key="cellKey">
                <van-cell
                  @click="toggle(pickerIndex)"
                  v-for="(item, pickerIndex) in pickerColumns"
                  clickable
                  :key="item[valueField]"
                  :title="item[textField]"
                >
                  <template #right-icon>
                    <van-checkbox :name="item[valueField]" ref="checkboxes" />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-checkbox-group>
          </div>
        </div>
      </template>
    </van-popup>
  </van-cell>
</template>

<script>
export default {
  name: 'csDataCell',
  props: {
    isStringValue: {
      type: Boolean,
      default: false
    },
    closeAll: {
      type: Boolean,
      default: false
    },
    // 绑定值
    value: {},
    // 绑定文本
    text: {
      type: String,
      default: ''
    },
    // 设置标题
    title: {
      type: String
    },
    // 设置是否必填
    required: {
      type: Boolean,
      default: false
    },
    itemData: {
      type: Object,
      default: () => {}
    },
    // 下拉选项数据
    options: {
      type: Array,
      default: () => []
    },
    // 远程接口请求方式
    method: {
      type: String,
      default: 'post'
    },
    // 设置远程数据接口地址
    url: {
      type: String
    },
    // 调用远程接口时的参数
    queryParams: {
      type: Object,
      default: () => {}
    },
    // 远程返回数据不合要求时，可用该接口返回正确的数据格式
    dataHandler: {
      type: Function
    },
    // 设置文本字段
    textField: {
      type: String,
      default: 'text'
    },
    // 设置值字段
    valueField: {
      type: String,
      default: 'value'
    },
    // 标志返回数据是否是字符串数组
    isStringArrayData: {
      type: Boolean,
      default: false
    },
    // 设置显示搜索框
    searchable: {
      type: Boolean,
      default: false
    },
    // 设置是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 显示加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 设置是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 设置弹出层的标题
    pickerTitle: {
      type: String,
      default: '请选择'
    },
    // 设置是否可清空选中值
    clearable: {
      type: Boolean,
      default: false
    },
    // 设置是否可手动输入
    editable: {
      type: Boolean,
      default: false
    },
    //是否默认展示绑定的值
    isShowValueTxt: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cellKey: 0,
      componentValue: '',
      componentOptions: [],
      componentLoading: false,
      popupVisible: false,
      pickerValue: null, // 单选--使用值的index，多选--使用值的数组
      oldPickerValue: null,
      keyword: '',
      isExistValue: true
    }
  },
  created() {
    this.componentLoading = this.loading
    if (this.multiple && !Array.isArray(this.value)) {
      this.componentValue = this.value ? [this.value] : []
    } else {
      this.componentValue = this.value
    }
    this.componentOptions = this.options
    this.initPickerValue()
    this.loadData()
  },
  methods: {
    toggle(index) {
      console.log(index, this.$refs.checkboxes[index], '  this.$refs.checkboxes')
      this.$nextTick(() => {
        this.$refs.checkboxes[index].toggle()
      })
    },
    onClear() {
      this.$emit('onClear')
    },
    loadData() {
      if (!this.url) return

      this.componentLoading = true
      this.$http[this.method](this.url, this.queryParams)
        .then(data => {
          // 如果是字符串数组，需转为对象数组
          if (this.isStringArrayData) {
            let tmpOptions = []
            data.forEach(item => {
              tmpOptions.push({
                [this.valueField]: item,
                [this.textField]: item
              })
            })
            data = tmpOptions
          }
          // 数据处理
          if (this.dataHandler) {
            this.componentOptions = this.dataHandler(data)
          } else {
            this.componentOptions = data
          }
          // 初始化选中值
          if (this.componentValue) {
            this.initPickerValue()
          }
          this.$emit('load-success', data) // 成功加载远程数据后回调
          this.componentLoading = false
        })
        .catch(() => {
          this.componentLoading = false
        })
    },
    onCellClick() {
      if (this.disabled) return

      if (this.$refs.picker) {
        this.$refs.picker.setIndexes([this.pickerValue])
      }
      this.$emit('isClick', true)
      this.oldPickerValue = this.pickerValue
      this.popupVisible = true
    },
    onCancel() {
      this.pickerValue = this.oldPickerValue
      this.popupVisible = false
    },
    onConfirm(text) {
      if (!this.multiple) {
        // 单选
        for (let i = 0, len = this.componentOptions.length; i < len; i++) {
          if (text === this.componentOptions[i][this.textField]) {
            this.pickerValue = i
            break
          }
        }
        this.popupVisible = false
        if (this.oldPickerValue !== this.pickerValue) {
          this.componentValue = this.componentOptions[this.pickerValue][this.valueField]
          this.$emit('input', this.componentValue)
          this.$emit('select', this.componentValue) // 添加select事件，点击确认才触发
        }
      } else {
        // 多选
        this.popupVisible = false
        this.componentValue = this.pickerValue
        this.$emit('input', this.componentValue)
        this.$emit('select', this.componentValue) // 添加select事件，点击确认才触发
      }
    },
    initPickerValue() {
      if (this.componentOptions.length && this.componentValue) {
        if (this.multiple) {
          // 多选，使用值的数组
          this.pickerValue = this.componentValue
        } else {
          // 单选，使用值所在options中的index
          let pickerValue = null
          for (let i = 0, len = this.componentOptions.length; i < len; i++) {
            const item = this.componentOptions[i]
            if (item[this.valueField] === this.componentValue) {
              pickerValue = i
              break
            }
          }
          this.pickerValue = pickerValue
        }
      } else {
        this.pickerValue = this.multiple ? [] : null
      }
    },
    onClearClick() {
      this.pickerValue = null
      this.componentValue = ''
      this.$emit('input', this.componentValue)
    },
    onInputClick() {},
    onInputKeyUp(event) {
      this.componentValue = event.target.value
      this.$emit('input', this.componentValue)
    },
    getSelectedItem() {
      for (let item of this.componentOptions) {
        if (item[this.valueField] === this.componentValue) {
          return item
        }
      }
    },
    isOptionsExistValue() {
      let isExist = false
      for (let item of this.componentOptions) {
        if (item[this.valueField] === this.componentValue) {
          isExist = true
          break
        }
      }
      return isExist
    }
  },
  computed: {
    componentText() {
      if (this.componentValue && this.pickerValue === null && !this.multiple && this.text) {
        // 有绑定值，但是没找到选项
        return this.text
      } else if (
        this.componentOptions.length &&
        ((!this.multiple && this.pickerValue !== null) || (this.multiple && this.pickerValue.length))
      ) {
        if (this.multiple) {
          const text = []
          ;(this.popupVisible ? this.oldPickerValue : this.pickerValue).forEach(value => {
            for (let i = 0, len = this.componentOptions.length; i < len; i++) {
              if (value === this.componentOptions[i][this.valueField]) {
                text.push(this.componentOptions[i][this.textField])
                break
              }
            }
          })
          return text
        } else {
          return this.componentOptions[this.pickerValue][this.textField]
        }
      } else if (this.editable) {
        return this.componentValue
      } else {
        let text = '请选择'
        if (this.multiple) {
          text = ['请选择']
        } else if (this.isShowValueTxt && this.value) {
          text = this.value
        }
        return text
      }
    },
    pickerColumns() {
      const columns = []
      const keyword = this.keyword.toUpperCase()
      this.componentOptions.forEach(item => {
        if (keyword) {
          if (item[this.textField].toUpperCase().indexOf(keyword) > -1) {
            columns.push(this.multiple ? item : item[this.textField])
          }
        } else {
          this.cellKey++
          columns.push(this.multiple ? item : item[this.textField])
        }
      })
      return columns
    },
    hasSelectedValue() {
      return (
        (!this.multiple && this.pickerValue !== null) ||
        (this.multiple && this.pickerValue.length) ||
        (this.editable && this.componentValue) ||
        (!this.multiple && this.componentValue && this.pickerValue === null && this.text)
      )
    }
  },
  watch: {
    value(newValue) {
      if (this.multiple && !Array.isArray(newValue)) {
        this.componentValue = newValue ? [newValue] : []
      } else {
        this.componentValue = newValue
      }
      this.initPickerValue()
    },
    options: {
      deep: true,
      handler(newValue) {
        this.componentOptions = newValue
        this.initPickerValue()
      }
    },
    componentValue() {
      if (this.pickerValue !== null) {
        this.$emit(
          'itemData',
          Object.assign(this.itemData ? this.itemData : {}, {
            chooseData: this.componentOptions[this.pickerValue] ? this.componentOptions[this.pickerValue] : {}
          })
        )
        this.$emit('change', this.componentOptions[this.pickerValue])
      } else if (this.editable) {
        this.$emit('change', this.componentValue)
      } else {
        this.$emit('change', '')
      }
    },
    componentOptions() {
      // 判断选项是否存在绑定值，不存在绑定值则显示绑定文本
      this.isExistValue = this.isOptionsExistValue()
    },
    url() {
      this.loadData()
    },
    loading(newValue) {
      this.componentLoading = newValue
    },
    queryParams: {
      deep: true,
      handler: () => {
        this.loadData()
      }
    }
  }
}
</script>

<style lang="less">
.cs-data-cell {
  .multiple_box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .multipetoStringValue {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }
  }
  &.van-cell {
    .van-loading {
      margin: 0;
      text-align: right;
    }
    // padding: 0 !important;
    .picker-single-value {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      & > span {
        flex: 1;
      }
      & > .van-icon {
        font-size: 14px;
        color: #d43f3a;
        line-height: 1.5;
        // vertical-align: middle;
        // margin-top: -3px;
        position: absolute;
        right: 0;
        top: 0;
      }
      .nodata {
        color: #c8c9cc;
      }
    }
  }
  .picker-search {
    border: 1px solid #e8e8e8;
    margin: 5px;
    padding: 5px;
    background-color: #fbfbfb;
    border-radius: 3px;
    flex: 1;
    line-height: 24px;
    font-size: 14px;
  }
  .no-data {
    color: #c8c9cc;
  }
  &.clearable {
    .picker-single-value {
      padding-right: 20px;
    }
    .no-data {
      .picker-single-value {
        padding-right: 0;
      }
    }
  }
}
.cs-data-popup-multiple {
  height: 265px;
  display: flex;
  flex-direction: column;
  .header {
    display: flex;
    flex-direction: row;
    height: 45px;
    line-height: 45px;
    button {
      height: 45px;
      line-height: 45px;
      padding: 0 20px;
      background-color: transparent;
      border: none;
      cursor: pointer;
    }
    .button_cancel {
      color: #aeb3bf;
    }
    .button_confirm {
      color: #3889ff;
    }
    .title {
      flex: 1;
      font-weight: 500;
      font-size: 16px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: #202533;
      input {
        border-radius: 15px;
        height: 30px;
        background: #f2f2f2;
        padding: 0px 10px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        line-height: 30px;
        text-align: center;
      }
    }
  }
  .content {
    flex: 1;
    overflow: auto;
  }
}
</style>
