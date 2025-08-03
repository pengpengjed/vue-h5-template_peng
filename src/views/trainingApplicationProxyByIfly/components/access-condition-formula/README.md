# AccessConditionFormula 组件

## 功能描述

AccessConditionFormula 组件用于显示和编辑电子化准入条件的组合公式和条件列表。该组件支持两种模式：

1. **查看模式**：显示组合公式和条件列表，支持查看条件详情
2. **编辑模式**：支持选择条件、编辑组合公式

## 数据结构

组件期望的数据结构如下：

```javascript
{
  "id": 28,
  "conditionalExpression": "1|2|3", // 组合公式表达式
  "conditionalExpressionDesc": "条件1或条件2或条件3", // 组合公式描述
  "accessConditionDetailList": [ // 条件详情列表
    {
      "id": 1000223,
      "conditionType": 1,
      "conditionName": "训练类",
      "accessConditionNumber": 1,
      "businessType": 2,
      "businessTypeName": "本机型",
      "baseType": 1,
      "baseTypeName": null,
      "timeRangeType": 1,
      "timeRangeTypeName": "年",
      "timeRangeValue": 1,
      "businessFieldType": 2,
      "businessFieldValue": "JZZJXLLBK1",
      "businessFieldName": "机长转机型训练理论（第1次补考）",
      "businessCategory": 1,
      "businessCategoryName": "通过",
      "businessOperator": 1,
      "businessOperatorName": "大于",
      "businessValue1": "1",
      "businessUnit": 6,
      "businessUnitName": "次数",
      "conditionContent": "本机型1年内机长转机型训练理论（第1次补考）通过大于1次",
      "selectFlag": false
    }
  ]
}
```

## 使用方法

### 基本用法

```vue
<template>
  <AccessConditionFormula :data="accessConditionData" @show-detail="handleShowDetail" />
</template>

<script>
import AccessConditionFormula from './components/access-condition-formula/index.vue'

export default {
  components: {
    AccessConditionFormula
  },
  data() {
    return {
      accessConditionData: {
        // 你的数据
      }
    }
  },
  methods: {
    handleShowDetail(condition) {
      console.log('显示条件详情:', condition)
    }
  }
}
</script>
```

### 编辑模式

```vue
<template>
  <AccessConditionFormula
    :data="accessConditionData"
    :if-modify="isEditMode"
    @show-detail="handleShowDetail"
    @condition-change="handleConditionChange"
    @formula-change="handleFormulaChange"
    ref="accessConditionFormulaRef"
  />
</template>

<script>
export default {
  data() {
    return {
      isEditMode: false,
      accessConditionData: {
        // 你的数据
      }
    }
  },
  methods: {
    // 切换编辑模式
    toggleEditMode() {
      this.isEditMode = true
    },

    // 保存条件
    saveConditions() {
      const formData = this.$refs.accessConditionFormulaRef.getFormData()
      console.log('保存的数据:', formData)
    },

    // 处理条件变更
    handleConditionChange(condition, selected) {
      console.log('条件变更:', condition, selected)
    },

    // 处理公式变更
    handleFormulaChange(formula) {
      console.log('公式变更:', formula)
    }
  }
}
</script>
```

## Props

| 参数     | 类型    | 默认值 | 说明               |
| -------- | ------- | ------ | ------------------ |
| data     | Object  | -      | 准入条件数据，必需 |
| ifModify | Boolean | false  | 是否为编辑模式     |

## Events

| 事件名           | 参数                | 说明                   |
| ---------------- | ------------------- | ---------------------- |
| show-detail      | condition           | 显示条件详情时触发     |
| condition-change | condition, selected | 条件选择状态变更时触发 |
| formula-change   | formula             | 组合公式变更时触发     |

## Methods

| 方法名      | 参数 | 返回值 | 说明                                         |
| ----------- | ---- | ------ | -------------------------------------------- |
| getFormData | -    | Object | 获取表单数据，包含条件表达式和选中的条件列表 |

## 功能特性

### 查看模式

- 显示组合公式
- 显示条件列表
- 支持查看条件详情
- 显示条件的操作符、比较值、单位等信息

### 编辑模式

- 支持选择/取消选择条件
- 支持编辑组合公式
- 提供运算符按钮（括号、或、且）
- 支持点击条件编号添加到公式
- 支持点击公式项目进行选择
- 实时更新组合公式

### 组合公式编辑

- 支持添加括号进行分组
- 支持使用"或"、"且"逻辑运算符
- 支持点击条件编号添加到公式
- 支持在指定位置插入运算符
- 自动生成公式描述

## 样式定制

组件使用 less 编写样式，主要样式类：

- `.access-condition-formula` - 主容器
- `.formula-section` - 组合公式区域
- `.conditions-section` - 条件列表区域
- `.formula-edit-section` - 编辑模式下的公式编辑区域
- `.selected-condition` - 选中的条件样式
- `.formula-condition` - 公式中的条件样式
- `.formula-bracket` - 公式中的括号样式
- `.formula-logic` - 公式中的逻辑运算符样式

## 注意事项

1. 数据中的 `conditionalExpression` 应该使用数字表示条件编号，使用 `|` 表示"或"，使用 `&` 表示"且"
2. 条件编号从 1 开始，对应 `accessConditionDetailList` 中的索引+1
3. 编辑模式下，需要手动调用 `getFormData()` 方法获取最终数据
4. 组件会自动处理数据格式转换和验证
