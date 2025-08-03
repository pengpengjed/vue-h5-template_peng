# 准入条件树结构组件

## 功能特性

### 1. 树结构展示
- 支持无限层级的嵌套分组展示
- 清晰的分组层级关系和连接线
- 展开/收起功能

### 2. 条件关系显示
- 显示分组间的"并且"和"或者"关系
- 使用不同颜色的标签区分关系类型
- 根节点关系标识

### 3. 条件详情查看
- 点击信息图标查看条件详细信息
- 包含条件名称、内容、操作符、比较值等
- 弹窗形式展示，用户体验友好

### 4. 条件多选功能
- 支持条件的多选/取消选择
- 编辑模式下显示复选框
- 实时更新选中状态

### 5. 数据管理
- 完整的数据获取和设置方法
- 支持条件回显和重置
- 递归处理复杂数据结构

## 组件结构

```
access-condition-tree/
├── index.vue              # 主容器组件
├── tree-node/
│   └── index.vue          # 递归树节点组件
└── README.md              # 使用说明
```

## 使用方法

### 1. 基础使用

```vue
<template>
  <access-condition-tree 
    :data="accessConditionData"
    :if-modify="false"
    @condition-change="handleConditionChange"
  />
</template>

<script>
import AccessConditionTree from './components/access-condition-tree/index.vue'

export default {
  components: {
    AccessConditionTree
  },
  data() {
    return {
      accessConditionData: {
        accessConditionRelational: 1,
        accessConditionZhftcGroupList: [...]
      }
    }
  },
  methods: {
    handleConditionChange(condition, parentNode) {
      console.log('条件变更:', condition, parentNode)
    }
  }
}
</script>
```

### 2. 编辑模式使用

```vue
<template>
  <access-condition-tree 
    ref="accessConditionTreeRef"
    :data="accessConditionData"
    :if-modify="isEditMode"
    @condition-change="handleConditionChange"
  />
  
  <!-- 操作按钮 -->
  <van-button @click="toggleEditMode">编辑条件</van-button>
  <van-button @click="saveConditions">保存</van-button>
</template>

<script>
export default {
  data() {
    return {
      isEditMode: false
    }
  },
  methods: {
    toggleEditMode() {
      this.isEditMode = true
    },
    
    saveConditions() {
      const treeRef = this.$refs.accessConditionTreeRef
      if (treeRef) {
        const formData = treeRef.getFormData()
        const selectedIds = treeRef.getLabelListIds()
        const selectedConditions = treeRef.getLabelListConditions()
        
        console.log('保存数据:', { formData, selectedIds, selectedConditions })
      }
    }
  }
}
</script>
```

## API 接口

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| data | Object | - | 准入条件数据 |
| ifModify | Boolean | false | 是否可编辑 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| condition-change | (condition, parentNode) | 条件变更事件 |

### Methods

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getFormData | - | Object | 获取完整数据 |
| getLabelListIds | - | Array | 获取选中条件ID列表 |
| getLabelListConditions | - | Array | 获取选中条件内容列表 |
| getSelectedConditions | - | Array | 获取选中条件对象列表 |
| setFormData | record | - | 设置数据 |
| setFormDataByConditions | (record, condition) | - | 根据条件设置数据 |

## 数据结构

```javascript
{
  "accessConditionRelational": 1, // 1: 并且, 2: 或者
  "accessConditionZhftcGroupList": [
    {
      "id": "分组ID",
      "accessConditionRelational": 1,
      "accessConditionLevel": "分组名称",
      "index": "分组索引",
      "labelList": [
        {
          "id": "条件ID",
          "conditionContent": "条件内容",
          "selectFlag": false, // 是否选中
          "businessOperator": 1, // 操作符
          "businessValue": "比较值",
          "conditionLabel": {
            "labelName": "标签名称",
            "labelCode": "标签代码",
            "unit": "单位",
            "relatedLabel": "关联标签"
          }
        }
      ],
      "childrenList": [] // 子分组
    }
  ]
}
```

## 样式定制

组件使用Less预处理器，可以通过以下方式定制样式：

```scss
.access-condition-tree {
  // 根节点关系标识样式
  .root-relation {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  // 分组节点样式
  .group-node {
    .group-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }
}
```

## 注意事项

1. 数据中的 `selectFlag` 字段用于控制条件是否选中
2. `accessConditionRelational` 字段控制关系类型（1=并且，2=或者）
3. 组件会自动为分组添加 `index` 字段用于显示
4. 编辑模式下需要手动处理数据保存逻辑
5. 组件支持无限嵌套，但建议控制层级深度以保持良好的用户体验 