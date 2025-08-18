<template>
  <div class="cs-dynamic-form">
    <van-form @submit="onSubmit" ref="form">
      <template v-for="(config, idx) in displayFormConfig">
        <van-field
          :key="config.value + '_' + idx"
          :label="config.label"
          :placeholder="config.placeholder"
          :rules="config.rules"
          :value="getDisplayValue(config)"
          :name="config.value"
          v-bind="config.attrs"
          @click="handleFieldClick(config)"
        />
      </template>
    </van-form>

    <!-- 选择器 -->
    <cs-popup-picker
      v-model="formData[currentConfig.value]"
      ref="csPopupPicker"
      :selectOptsObj="selectOptsObj"
      @change="onPickChange"
    />
  </div>
</template>

<script>
import CsPopupPicker from '@/components/csPopupPicker.vue'

export default {
  name: 'csDynamicForm',
  components: {
    CsPopupPicker
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    formConfig: {
      type: Array,
      default: () => []
    },
    dataFetchers: {
      type: Object,
      default: () => ({})
    },
    localDataSource: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formData: this.normalizeFormData(this.value),
      selectOptsObj: {
        list: [],
        valueField: '',
        textField: '',
        isPickerTitleSearch: false
      },
      currentConfig: {
        type: Object,
        default: () => ({})
      },
      isHandlingClick: false
    }
  },
  computed: {
    // 过滤显示的表单配置
    displayFormConfig() {
      if (!this.formConfig || !Array.isArray(this.formConfig)) {
        return []
      }
      return this.formConfig.filter(config => this.getIsDisplay(config.isShow))
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.formData = this.normalizeFormData(newValue)
      },
      deep: true,
      immediate: true
    },
    formData: {
      handler(newValue) {
        this.$emit('input', newValue)
        this.$emit('change', newValue)
      },
      deep: true
    }
  },
  methods: {
    // 规范化表单数据
    normalizeFormData(value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {}
      }
      return { ...value }
    },

    // 判断是否为空
    isEmpty(val) {
      return val === '' || val === undefined || val === null
    },

    // 判断字段是否显示
    getIsDisplay(isShow) {
      if (this.isEmpty(isShow)) {
        return true
      } else if (typeof isShow === 'boolean') {
        return isShow
      } else if (typeof isShow === 'function') {
        return isShow.call(this)
      } else if (isShow && isShow.type === 'showCondition') {
        return isShow.check(this.formData)
      }
      return false
    },

    // 获取显示值
    getDisplayValue(config) {
      if (!config || !this.formData) {
        return ''
      }

      let value
      if (config.type === 'select') {
        value = this.formData[config.value + 'Text'] || this.formData[config.value]
      } else {
        value = this.formData[config.value]
      }

      // 确保返回字符串类型，避免数组等其他类型
      if (Array.isArray(value)) {
        return value.join(', ')
      } else if (value === null || value === undefined || value === '') {
        return ''
      } else {
        return String(value)
      }
    },

    // 表单提交
    onSubmit(e) {
      this.$emit('submit', this.formData, e)
    },

    // 处理字段点击
    async handleFieldClick(config) {
      if (this.isHandlingClick) {
        return
      }

      if (config.type !== 'select' || !config.onClick) {
        return
      }

      this.isHandlingClick = true
      this.currentConfig = config

      try {
        const context = {
          showPicker: this.showPicker,
          toast: this.$toast,
          isEmpty: this.isEmpty,
          dataFetchers: this.dataFetchers,
          localDataSource: this.localDataSource
        }

        await config.onClick.call(this, config, this.formData, context)
      } catch (error) {
        console.error('Field click handler error:', error)
        this.$emit('error', error, config)
      } finally {
        this.isHandlingClick = false
      }
    },

    // 显示选择器
    showPicker(config, listData, enableSearch = false) {
      this.selectOptsObjChange(config.optionConfig, listData, enableSearch)
      this.$refs.csPopupPicker.showPicker()
    },

    // 更新选择器配置
    selectOptsObjChange(optionConfig, listData, isPickerTitleSearch = false) {
      this.$set(this.selectOptsObj, 'list', listData || [])
      this.$set(this.selectOptsObj, 'valueField', optionConfig.valueField || '')
      this.$set(this.selectOptsObj, 'textField', optionConfig.textField || '')
      this.$set(this.selectOptsObj, 'isPickerTitleSearch', isPickerTitleSearch)
    },

    // 处理选择器变化
    onPickChange(value, item) {
      if (!this.currentConfig || !this.currentConfig.value) {
        return
      }

      const fieldName = this.currentConfig.value

      // 设置值
      this.$set(this.formData, fieldName, value)

      // 设置显示文本
      if (item && this.selectOptsObj.textField) {
        this.$set(this.formData, fieldName + 'Text', item[this.selectOptsObj.textField])
      }

      // 触发字段变化事件
      this.$emit('field-change', fieldName, value, item)
    },

    // 验证表单
    validate() {
      return this.$refs.form.validate()
    },

    // 重置表单
    resetForm() {
      this.$refs.form.resetValidation()
      Object.keys(this.formData).forEach(key => {
        this.$set(this.formData, key, '')
      })
    },

    // 设置字段值
    setFieldValue(fieldName, value, text) {
      this.$set(this.formData, fieldName, value)
      if (text) {
        this.$set(this.formData, fieldName + 'Text', text)
      }
    },

    // 获取表单数据
    getFormData() {
      return { ...this.formData }
    }
  }
}
</script>

<style scoped>
.cs-dynamic-form {
  width: 100%;
}
</style>
