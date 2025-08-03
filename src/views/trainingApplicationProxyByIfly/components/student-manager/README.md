# 学员管理组件

## 功能特性

### 1. 直接输入员工号
- 支持6位数字员工号输入
- 多个员工号换行输入
- 实时验证员工号格式
- 点击确定后执行完整验证流程

### 2. 添加人员弹窗
- 支持员工号、姓名、姓名简拼模糊搜索
- 系统推荐人员列表
- 已选人员管理
- 关联训练选择

### 3. 学员列表管理
- 显示已选学员信息
- 准入条件校验状态显示
- 支持移除学员
- 实时更新学员数量

### 4. 数据权限验证
- 员工号存在性验证
- 数据权限范围验证
- 重复添加检查
- 准入条件校验

## 组件结构

```
student-manager/
├── index.vue              # 主组件
└── README.md              # 使用说明
```

## 使用方法

### 基础使用

```vue
<template>
  <student-manager 
    :current-config="currentConfig"
    @students-changed="handleStudentsChanged"
  />
</template>

<script>
import StudentManager from './components/student-manager/index.vue'

export default {
  components: {
    StudentManager
  },
  data() {
    return {
      currentConfig: {
        fleetCd: 'B737',
        syllabusVersionConfId: 1,
        syllabusConfId: 'outline1',
        syllabusSubjectsConfId: 'subject1'
      }
    }
  },
  methods: {
    handleStudentsChanged(students) {
      console.log('学员列表变更:', students)
    }
  }
}
</script>
```

## API 接口

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| currentConfig | Object | {} | 当前配置信息（机型、大纲版本等） |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| students-changed | (students) | 学员列表变更事件 |

## 验证流程

### 1. 员工号格式验证
- 必须是6位数字
- 支持多个员工号换行输入
- 自动过滤非数字字符

### 2. 员工号存在性验证
- 调用API验证员工号是否存在
- 不存在时提示"员工号不存在"

### 3. 数据权限验证
- 根据登录者权限验证员工号访问权限
- 权限不足时提示"无该员工号的数据权限"
- 权限匹配规则：
  - 基地权限：注册基地或运行基地
  - 机队权限：机队信息
  - 分部权限：分部信息
  - 空值处理：机队或分部为空可查看，基地为空不可查看

### 4. 重复添加检查
- 检查员工号是否已在已选列表中
- 存在时更新现有记录
- 不存在时添加新记录

### 5. 准入条件校验
- 根据当前配置进行准入条件校验
- 显示校验结果状态
- 成功：绿色显示"已通过 准入条件校验"
- 失败：红色显示"未通过 准入条件校验"

## 添加人员弹窗功能

### 1. 搜索功能
- 支持员工号、姓名、姓名简拼模糊搜索
- 清空搜索条件时显示推荐人员列表
- 实时搜索结果更新

### 2. 系统推荐人员
- 默认显示登录者权限范围内的人员
- 推荐逻辑：当前机型提纲下最近一次训练科目的人员
- 不限制大纲版本

### 3. 已选人员管理
- 按添加时间倒序排列
- 显示姓名+员工号+关联训练信息
- 支持移除操作

### 4. 关联训练选择
- 系统默认选择"无上一科目"
- 支持手动选择关联训练
- 选择逻辑：
  - 第一个科目：默认"无上一科目"
  - 非第一个科目：默认最近一笔科目记录
- 训练日期取值逻辑：
  - 有课程科目：取第一节课程开始时间
  - 无课程科目：取排班航班首段日期
  - 第三方训练：取检查员填单日期

### 5. 流水号管理
- 选择关联训练：使用关联科目流水号
- 选择"无上一科目"：生成唯一流水号

## 数据结构

### 学员信息
```javascript
{
  employeeId: "123456",           // 员工号
  name: "张三",                   // 姓名
  trainingInfo: "副驾驶初始升级训练 2025-02-11", // 训练信息
  status: "success"               // 状态：success/error
}
```

### 当前配置
```javascript
{
  fleetCd: "B737",                // 机型
  syllabusVersionConfId: 1,       // 大纲版本ID
  syllabusConfId: "outline1",     // 提纲ID
  syllabusSubjectsConfId: "subject1" // 科目ID
}
```

## 样式定制

组件使用Less预处理器，可以通过以下方式定制样式：

```scss
.student-manager {
  // 标题样式
  .header {
    .title {
      color: #333;
      font-size: 16px;
    }
  }
  
  // 学员列表样式
  .student-list {
    .student-item {
      background: #fff;
      border: 1px solid #e8e8e8;
      
      .name-id {
        &.success {
          color: #07c160; // 成功状态颜色
        }
        
        &.error {
          color: #ee0a24; // 失败状态颜色
        }
      }
    }
  }
  
  // 弹窗样式
  .add-personnel-dialog {
    .dialog-header {
      background: #f8f9fa;
    }
    
    .personnel-item {
      &:hover {
        background: #e9ecef;
      }
    }
  }
}
```

## 注意事项

1. 员工号必须是6位数字格式
2. 数据权限验证基于登录者权限范围
3. 准入条件校验需要当前配置信息
4. 关联训练选择影响流水号生成
5. 系统推荐人员基于当前机型提纲
6. 支持无限添加学员，但建议控制数量
7. 所有验证失败都会显示相应提示信息 