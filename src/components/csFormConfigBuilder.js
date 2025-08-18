/**
 * 表单配置构建器
 * 用于简化动态表单的配置创建
 */

export class FormConfigBuilder {
  constructor() {
    this.config = []
  }

  /**
   * 添加选择字段
   * @param {Object} options - 配置选项
   * @param {string} options.label - 字段标签
   * @param {string} options.value - 字段值
   * @param {string} options.placeholder - 占位符
   * @param {boolean} options.required - 是否必填
   * @param {Object} options.optionConfig - 选项配置
   * @param {Function} options.onClick - 点击处理函数
   * @param {Function} options.isShow - 显示条件函数
   * @param {Object} options.attrs - 额外属性
   */
  addSelectField(options) {
    const {
      label,
      value,
      placeholder = `请选择${label}`,
      required = false,
      optionConfig = {},
      onClick,
      isShow,
      attrs = {}
    } = options

    const fieldConfig = {
      label,
      value,
      placeholder,
      type: 'select',
      optionConfig: {
        valueField: 'value',
        textField: 'text',
        ...optionConfig
      },
      attrs: {
        rightIcon: 'arrow',
        readonly: true,
        clickable: true,
        required,
        ...attrs
      }
    }

    if (required) {
      fieldConfig.rules = [{ required: true, message: placeholder }]
    }

    if (onClick && typeof onClick === 'function') {
      fieldConfig.onClick = onClick
    }

    if (isShow && typeof isShow === 'function') {
      fieldConfig.isShow = isShow
    }

    this.config.push(fieldConfig)
    return this
  }

  /**
   * 添加输入字段
   * @param {Object} options - 配置选项
   */
  addInputField(options) {
    const {
      label,
      value,
      placeholder = `请输入${label}`,
      required = false,
      type = 'text',
      isShow,
      attrs = {}
    } = options

    const fieldConfig = {
      label,
      value,
      placeholder,
      type,
      attrs: {
        required,
        ...attrs
      }
    }

    if (required) {
      fieldConfig.rules = [{ required: true, message: placeholder }]
    }

    if (isShow && typeof isShow === 'function') {
      fieldConfig.isShow = isShow
    }

    this.config.push(fieldConfig)
    return this
  }

  /**
   * 添加文本域字段
   * @param {Object} options - 配置选项
   */
  addTextareaField(options) {
    return this.addInputField({
      ...options,
      attrs: {
        type: 'textarea',
        autosize: true,
        ...options.attrs
      }
    })
  }

  /**
   * 添加数字字段
   * @param {Object} options - 配置选项
   */
  addNumberField(options) {
    return this.addInputField({
      ...options,
      type: 'number',
      attrs: {
        type: 'digit',
        ...options.attrs
      }
    })
  }

  /**
   * 添加日期选择字段
   * @param {Object} options - 配置选项
   */
  addDateField(options) {
    const {
      label,
      value,
      placeholder = `请选择${label}`,
      required = false,
      dateType = 'date', // date, datetime, time
      minDate,
      maxDate,
      isShow,
      attrs = {}
    } = options

    const fieldConfig = {
      label,
      value,
      placeholder,
      type: 'date',
      dateType,
      attrs: {
        rightIcon: 'arrow',
        readonly: true,
        clickable: true,
        required,
        ...attrs
      },
      onClick: (config, formData, { showDatePicker }) => {
        showDatePicker && showDatePicker(config, { dateType, minDate, maxDate })
      }
    }

    if (required) {
      fieldConfig.rules = [{ required: true, message: placeholder }]
    }

    if (isShow && typeof isShow === 'function') {
      fieldConfig.isShow = isShow
    }

    this.config.push(fieldConfig)
    return this
  }

  /**
   * 添加自定义字段
   * @param {Object} fieldConfig - 字段配置
   */
  addCustomField(fieldConfig) {
    this.config.push(fieldConfig)
    return this
  }

  /**
   * 获取配置
   */
  build() {
    return [...this.config]
  }

  /**
   * 清空配置
   */
  clear() {
    this.config = []
    return this
  }
}

/**
 * 创建选择字段的点击处理函数
 * @param {Object} options - 选项
 * @param {string} options.dataKey - 本地数据的key
 * @param {string} options.apiMethod - API方法名
 * @param {Array} options.dependencies - 依赖字段
 * @param {string} options.dependencyMessage - 依赖提示信息
 * @param {boolean} options.enableSearch - 是否启用搜索
 */
export function createSelectClickHandler(options = {}) {
  const {
    dataKey,
    apiMethod,
    dependencies = [],
    dependencyMessage = '请先选择前置条件',
    enableSearch = false
  } = options

  return async function (config, formData, { showPicker, toast, isEmpty, dataFetchers, localDataSource }) {
    // 检查依赖字段
    if (dependencies.length > 0) {
      const missingDeps = dependencies.filter(dep => isEmpty(formData[dep]))
      if (missingDeps.length > 0) {
        toast(dependencyMessage)
        return
      }
    }

    let listData = []

    try {
      if (dataKey) {
        // 使用本地数据
        const keyToUse = config.optionConfig?.keyField || dataKey
        listData = localDataSource[keyToUse] || []
      } else if (apiMethod && dataFetchers[apiMethod]) {
        // 使用API获取数据
        const params = dependencies.reduce((acc, dep) => {
          acc[dep] = formData[dep]
          return acc
        }, {})
        listData = await dataFetchers[apiMethod](params)
      }

      showPicker(config, listData, enableSearch)
    } catch (error) {
      console.error(`Failed to load data for ${config.label}:`, error)
      toast(`加载${config.label}数据失败`)
    }
  }
}

/**
 * 创建条件显示函数
 * @param {Array} fields - 依赖字段数组
 * @param {string} logic - 逻辑关系 'and' | 'or'
 */
export function createShowCondition(fields, logic = 'and') {
  return {
    type: 'showCondition',
    fields,
    logic,
    check: function (formData) {
      const isEmpty = val => val === '' || val === undefined || val === null

      if (logic === 'or') {
        return fields.some(field => !isEmpty(formData[field]))
      } else {
        return fields.every(field => !isEmpty(formData[field]))
      }
    }
  }
}

// 默认导出构建器类
export default FormConfigBuilder
