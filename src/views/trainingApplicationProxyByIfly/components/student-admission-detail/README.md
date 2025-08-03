# 学员准入条件详情功能

## 功能概述

学员准入条件详情功能允许用户查看和管理学员的准入条件详情，包括基本信息、技术信息、准入条件和电子化准入条件。

## 主要功能

### 1. 基本信息显示
- 训练机型、提纲、科目、学员信息
- 支持切换学员功能
- 显示学员的基础信息

### 2. 技术信息显示
- 技术等级：机型+技术等级（如320A1类副驾驶）
- 分部信息
- 注册基地、运行基地、训练基地

### 3. 准入条件显示
- 根据选中的科目加载准入条件内容
- 仅查看模式，不可编辑

### 4. 电子化准入条件
支持两种配置样式：

#### 按标签组合配置（Type 1）
- 显示分组条件和逻辑关系
- 每个条件显示校验状态图标（✅❌❓）
- 支持确认满足、取消确认操作
- 支持文件上传和预览

#### 按自由组合配置（Type 2）
- 显示组合公式
- 条件列表显示校验状态
- 支持条件选择和公式编辑
- 支持文件上传和预览

## 校验状态说明

### 状态图标
- ✅ **成功**：条件满足，显示绿色
- ❌ **失败**：条件不满足，显示红色
- ❓ **手动确认**：人工确认满足，显示橙色

### 操作按钮
- **确认满足**：点击后弹出文件上传选择
- **取消确认**：取消人工确认，恢复失败状态
- **上传**：上传佐证材料
- **附件名称**：点击预览已上传的文件

## 文件上传功能

### 支持格式
- PDF、DOC、DOCX
- XLS、XLSX
- PNG、JPG、JPEG、BMP

### 限制条件
- 文件大小：最大10MB
- 每个条件仅支持1个文件
- 重复上传会替换已有文件

## 组件结构

```
student-admission-detail/
├── index.vue                 # 主组件
├── README.md                # 说明文档
└── components/              # 子组件
    ├── access-condition-manager/    # 准入条件管理器
    ├── access-condition-tree/       # 树形条件组件
    ├── access-condition-formula/    # 公式条件组件
    └── tree-node/                  # 树节点组件
```

## 使用方法

### 1. 在父组件中引入
```vue
<template>
  <StudentAdmissionDetail
    :visible.sync="showDetail"
    :student-data="currentStudent"
    @student-change="handleStudentChange"
  />
</template>

<script>
import StudentAdmissionDetail from './components/student-admission-detail/index.vue'

export default {
  components: {
    StudentAdmissionDetail
  }
}
</script>
```

### 2. Props 参数
- `visible`: 控制弹窗显示/隐藏
- `studentData`: 学员数据对象

### 3. Events 事件
- `student-change`: 学员切换事件
- `update:visible`: 弹窗显示状态变更

## 数据结构

### 学员数据格式
```javascript
{
  employeeId: '333555',
  name: '张三',
  trainingInfo: '副驾驶初始理论训练',
  status: 'success', // success, error, manual
  fleetCd: '320',
  outlineName: '副驾驶初始',
  subjectsName: '副驾驶初始理论训练',
  technicalLevel: '320: A1类副驾驶; 330: 飞行教员A',
  division: '一分部',
  registrationBase: '北京',
  operatingBase: '广州',
  trainingBase: '广州'
}
```

### 准入条件数据格式
```javascript
{
  accessConditionType: 1, // 1: 按标签配置, 2: 自由组合
  accessConditionDetailDTO: {
    accessConditionZhftcGroupList: [
      {
        id: 1,
        accessConditionRelational: 2, // 1: 并且, 2: 或者
        accessConditionLevel: '分组1',
        labelList: [
          {
            id: 1,
            conditionContent: 'CAO英语等级大于4级',
            businessOperator: 1,
            businessValue: '4',
            selectFlag: true,
            status: 'success' // success, error, manual
          }
        ]
      }
    ]
  }
}
```

## 样式特点

### 1. 响应式设计
- 适配移动端屏幕
- 弹窗高度自适应

### 2. 视觉层次
- 清晰的信息分组
- 渐变背景色
- 状态图标颜色区分

### 3. 交互反馈
- 按钮悬停效果
- 文件上传进度
- 操作成功提示

## 扩展功能

### 1. 数据持久化
- 支持保存学员确认状态
- 支持文件上传到服务器
- 支持历史记录查看

### 2. 权限控制
- 根据用户角色显示不同操作
- 支持审批流程
- 支持批量操作

### 3. 数据同步
- 与后端系统数据同步
- 实时更新学员状态
- 支持离线缓存

## 注意事项

1. **文件上传**：需要配置服务器端文件上传接口
2. **数据加载**：需要实现学员数据的API接口
3. **权限验证**：需要根据业务需求配置操作权限
4. **性能优化**：大量学员数据时需要考虑分页加载
5. **错误处理**：需要处理网络异常和数据异常情况 