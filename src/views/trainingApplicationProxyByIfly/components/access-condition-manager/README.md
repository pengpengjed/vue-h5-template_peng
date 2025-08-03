# 准入条件管理组件

## 功能特性

### 1. 统一管理
- 封装了两种准入条件显示模式
- 统一的切换和操作界面
- 统一的数据管理和事件处理

### 2. 模式切换
- 按标签配置模式（树形结构）
- 自由组合模式（公式展示）
- 一键切换，数据自动适配

### 3. 编辑功能
- 统一的编辑模式控制
- 保存和取消操作
- 数据回滚机制

### 4. 事件管理
- 统一的事件处理机制
- 支持条件变更、详情查看等事件
- 完整的数据保存流程

## 组件结构

```
access-condition-manager/
├── index.vue              # 主组件
├── README.md              # 使用说明
└── dependencies/
    ├── access-condition-tree/     # 树形结构组件
    └── access-condition-formula/  # 公式展示组件
```

## 使用方法

### 基础使用

```vue
<template>
  <access-condition-manager
    ref="accessConditionManagerRef"
    :data="accessConditionData"
    :type="accessConditionType"
    :editable="true"
    @type-change="handleTypeChange"
    @save="handleSaveConditions"
    @condition-change="handleConditionChange"
    @show-detail="handleShowDetail"
    @formula-change="handleFormulaChange"
  />
</template>

<script>
import AccessConditionManager from './components/access-condition-manager/index.vue'

export default {
  components: {
    AccessConditionManager
  },
  data() {
    return {
      accessConditionType: 1,
      accessConditionData: {
        accessConditionRelational: 1,
        accessConditionZhftcGroupList: [...]
      }
    }
  },
  methods: {
    handleTypeChange(type) {
      console.log('条件类型变更:', type)
    },
    
    handleSaveConditions(result) {
      console.log('保存条件:', result)
    },
    
    handleConditionChange(condition, parentNode) {
      console.log('条件变更:', condition, parentNode)
    },
    
    handleShowDetail(condition) {
      console.log('显示详情:', condition)
    },
    
    handleFormulaChange(formula) {
      console.log('公式变更:', formula)
    }
  }
}
</script>
```

## API 接口

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | Object | {} | 准入条件数据 |
| type | Number | 1 | 条件类型：1-按标签配置，2-自由组合 |
| editable | Boolean | false | 是否可编辑 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| type-change | (type) | 条件类型变更事件 |
| save | (result) | 保存条件事件 |
| condition-change | (condition, parentNode) | 条件变更事件 |
| show-detail | (condition) | 显示条件详情事件 |
| formula-change | (formula) | 公式变更事件 |

### Methods

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getFormData | - | Object | 获取当前数据 |
| setFormData | data | - | 设置数据 |
| setConditionType | type | - | 设置条件类型 |

## 数据格式

### 保存结果格式

#### 按标签配置模式 (type: 1)
```javascript
{
  type: 1,
  formData: {
    accessConditionRelational: 1,
    accessConditionZhftcGroupList: [...]
  },
  selectedIds: [1, 2, 3],
  selectedConditions: ['条件1', '条件2', '条件3']
}
```

#### 自由组合模式 (type: 2)
```javascript
{
  type: 2,
  formData: {
    accessConditionRelational: 1,
    accessConditionZhftcGroupList: [...]
  }
}
```

## 功能说明

### 1. 模式切换
- 点击"按标签配置"或"自由组合"按钮切换模式
- 切换时会触发 `type-change` 事件
- 数据会根据模式自动适配

### 2. 编辑功能
- 点击"编辑条件"进入编辑模式
- 编辑模式下显示"保存"和"取消"按钮
- 保存时触发 `save` 事件
- 取消时自动回滚数据

### 3. 数据管理
- 支持通过 props 传入数据
- 支持通过方法动态设置数据
- 支持获取当前数据状态

### 4. 事件处理
- 所有子组件事件都会向上冒泡
- 统一的事件处理接口
- 支持自定义事件处理逻辑

## 样式定制

组件使用Less预处理器，可以通过以下方式定制样式：

```less
.access-condition-manager {
  // 切换按钮样式
  .type-switch {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  // 内容区域样式
  .access-conditions-wrapper {
    min-height: 300px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin: 16px 0;
    
    // 操作按钮样式
    .action-buttons {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      
      .edit-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
```

## 注意事项

1. 组件内部管理编辑状态，无需外部控制
2. 数据变更会自动同步到子组件
3. 保存操作会返回完整的结果数据
4. 支持两种模式的完整功能
5. 所有事件都是可选的，按需监听
6. 组件会自动处理数据回滚和状态管理 