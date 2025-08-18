# csDynamicForm 动态表单组件使用指南

## 组件介绍

`csDynamicForm` 是一个基于 Vue 和 Vant UI 的动态表单组件，支持通过配置生成各种表单字段，内置选择器、验证、事件处理等功能。

## 基本用法

### 1. 导入组件

```vue
<template>
  <div>
    <cs-dynamic-form
      v-model="formData"
      :form-config="formConfig"
      :data-fetchers="dataFetchers"
      :local-data-source="localDataSource"
      @submit="handleSubmit"
      @field-change="handleFieldChange"
      @error="handleError"
      ref="dynamicForm"
    />
  </div>
</template>

<script>
import csDynamicForm from '@/components/csDynamicForm.vue'
import FormConfigBuilder, { createSelectClickHandler, createShowCondition } from '@/components/csFormConfigBuilder.js'

export default {
  components: {
    csDynamicForm
  },
  // ...
}
</script>
```

### 2. 数据结构

```javascript
data() {
  return {
    // 表单数据
    formData: {
      name: '',
      type: '',
      category: ''
    },
    
    // 本地数据源
    localDataSource: {
      typeList: [
        { value: '1', text: '类型1' },
        { value: '2', text: '类型2' }
      ]
    },
    
    // API数据获取方法
    dataFetchers: {
      fetchCategories: this.fetchCategories,
      fetchOptions: this.fetchOptions
    }
  }
}
```

### 3. 表单配置

#### 使用FormConfigBuilder（推荐）

```javascript
computed: {
  formConfig() {
    const builder = new FormConfigBuilder()
    
    return builder
      // 输入字段
      .addInputField({
        label: '姓名',
        value: 'name',
        required: true,
        placeholder: '请输入姓名'
      })
      
      // 选择字段（本地数据）
      .addSelectField({
        label: '类型',
        value: 'type',
        required: true,
        optionConfig: {
          valueField: 'value',
          textField: 'text'
        },
        onClick: createSelectClickHandler({
          dataKey: 'typeList'
        })
      })
      
      // 选择字段（API数据）
      .addSelectField({
        label: '分类',
        value: 'category',
        required: true,
        optionConfig: {
          valueField: 'id',
          textField: 'name'
        },
        isShow: createShowCondition(['type']), // 依赖type字段
        onClick: createSelectClickHandler({
          apiMethod: 'fetchCategories',
          dependencies: ['type'],
          dependencyMessage: '请先选择类型',
          enableSearch: true
        })
      })
      
      // 数字字段
      .addNumberField({
        label: '年龄',
        value: 'age',
        required: true
      })
      
      // 文本域
      .addTextareaField({
        label: '备注',
        value: 'remark',
        attrs: {
          rows: 3,
          maxlength: 200
        }
      })
      
      .build()
  }
}
```

#### 直接配置（灵活度更高）

```javascript
formConfig: [
  {
    label: '姓名',
    value: 'name',
    placeholder: '请输入姓名',
    type: 'input',
    rules: [{ required: true, message: '请输入姓名' }],
    attrs: {
      required: true
    }
  },
  {
    label: '类型',
    value: 'type',
    placeholder: '请选择类型',
    type: 'select',
    rules: [{ required: true, message: '请选择类型' }],
    optionConfig: {
      valueField: 'value',
      textField: 'text'
    },
    attrs: {
      rightIcon: 'arrow',
      readonly: true,
      clickable: true,
      required: true
    },
    onClick: async (config, formData, { showPicker, localDataSource }) => {
      const listData = localDataSource.typeList
      showPicker(config, listData)
    }
  }
]
```

### 4. 事件处理

```javascript
methods: {
  // 表单提交
  handleSubmit(formData, event) {
    console.log('表单提交:', formData)
    // 处理提交逻辑
  },
  
  // 字段值变化
  handleFieldChange(fieldName, value, item) {
    console.log('字段变化:', fieldName, value, item)
    // 处理字段变化逻辑
  },
  
  // 错误处理
  handleError(error, config) {
    console.error('表单错误:', error, config)
    this.$toast('操作失败')
  },
  
  // API数据获取
  async fetchCategories(params) {
    // 根据params获取数据
    const response = await api.getCategories(params)
    return response.data
  }
}
```

## 高级用法

### 1. 自定义字段显示条件

```javascript
// 单个字段依赖
isShow: createShowCondition(['fieldName'])

// 多个字段依赖（且关系）
isShow: createShowCondition(['field1', 'field2'], 'and')

// 多个字段依赖（或关系）
isShow: createShowCondition(['field1', 'field2'], 'or')

// 自定义逻辑
isShow: function() {
  return this.formData.type === 'special' && this.formData.level > 1
}
```

### 2. 复杂的onClick处理

```javascript
onClick: async (config, formData, { showPicker, toast, isEmpty, dataFetchers, localDataSource }) => {
  // 1. 验证依赖条件
  if (isEmpty(formData.prerequisite)) {
    return toast('请先选择前置条件')
  }
  
  // 2. 显示加载状态
  const loading = toast.loading('加载中...')
  
  try {
    // 3. 获取数据
    let listData = []
    if (localDataSource.cachedData) {
      listData = localDataSource.cachedData
    } else {
      listData = await dataFetchers.fetchData(formData)
    }
    
    // 4. 数据处理
    listData = listData.filter(item => item.status === 'active')
    
    // 5. 显示选择器
    showPicker(config, listData, true) // 第三个参数启用搜索
    
  } catch (error) {
    toast('加载数据失败')
  } finally {
    loading.clear()
  }
}
```

### 3. 表单验证

```javascript
// 组件实例方法
async validateForm() {
  const isValid = await this.$refs.dynamicForm.validate()
  if (isValid) {
    // 验证通过
    this.submitForm()
  } else {
    this.$toast('请检查表单输入')
  }
}
```

### 4. 动态设置字段值

```javascript
// 设置单个字段
this.$refs.dynamicForm.setFieldValue('fieldName', 'value', 'displayText')

// 获取表单数据
const formData = this.$refs.dynamicForm.getFormData()

// 重置表单
this.$refs.dynamicForm.resetForm()
```

## API 参考

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value/v-model | 表单数据 | Object | {} |
| formConfig | 表单配置 | Array | [] |
| dataFetchers | 数据获取方法集合 | Object | {} |
| localDataSource | 本地数据源 | Object | {} |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| input | 表单数据变化 | (formData) |
| change | 表单数据变化 | (formData) |
| submit | 表单提交 | (formData, event) |
| field-change | 字段值变化 | (fieldName, value, item) |
| error | 错误事件 | (error, config) |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate | 表单验证 | - |
| resetForm | 重置表单 | - |
| setFieldValue | 设置字段值 | (fieldName, value, text) |
| getFieldValue | 获取字段值 | (fieldName) |
| getFormData | 获取表单数据 | - |

## 最佳实践

### 1. 配置组织

将复杂的表单配置拆分为多个方法：

```javascript
computed: {
  formConfig() {
    return [
      ...this.getBasicFields(),
      ...this.getAdvancedFields(),
      ...this.getConditionalFields()
    ]
  }
},

methods: {
  getBasicFields() {
    // 基础字段配置
  },
  
  getAdvancedFields() {
    // 高级字段配置
  },
  
  getConditionalFields() {
    // 条件字段配置
  }
}
```

### 2. 数据缓存

对频繁请求的数据进行缓存：

```javascript
data() {
  return {
    dataCache: new Map()
  }
},

methods: {
  async fetchDataWithCache(key, fetcher, params) {
    if (this.dataCache.has(key)) {
      return this.dataCache.get(key)
    }
    
    const data = await fetcher(params)
    this.dataCache.set(key, data)
    return data
  }
}
```

### 3. 错误处理

统一的错误处理机制：

```javascript
methods: {
  handleError(error, config) {
    // 记录错误日志
    console.error('Form Error:', {
      field: config.value,
      error: error.message,
      timestamp: new Date().toISOString()
    })
    
    // 用户友好的错误提示
    const userMessage = this.getErrorMessage(error, config)
    this.$toast(userMessage)
  },
  
  getErrorMessage(error, config) {
    const errorMap = {
      'NETWORK_ERROR': '网络连接失败，请检查网络',
      'TIMEOUT': '请求超时，请重试',
      'AUTH_ERROR': '权限不足'
    }
    
    return errorMap[error.code] || `加载${config.label}失败`
  }
}
```

这样就完成了一个功能完整、易于使用的动态表单组件封装！