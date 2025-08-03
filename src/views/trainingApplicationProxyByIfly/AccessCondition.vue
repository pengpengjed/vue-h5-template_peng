<template>
  <div class="access-condition-container">
    <AccessConditionManager
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
  </div>
</template>

<script>
import AccessConditionManager from './components/access-condition-manager/index.vue'

import accessConditionType1Data from './mockData/accessConditionType1Data.json'
import accessConditionType2Data from './mockData/accessConditionType2Data.json'
export default {
  components: { AccessConditionManager },
  data() {
    return {
      accessConditionType: 1, // 1: 按标签配置, 2: 自由组合
      localAccessConditions: {},
      accessConditionData: accessConditionType1Data
    }
  },
  methods: {
    // 处理类型变更
    handleTypeChange(type) {
      this.accessConditionType = type
      if (type === 1) {
        this.accessConditionData = accessConditionType1Data
      } else if (type === 2) {
        this.accessConditionData = accessConditionType2Data
      }
    },
    // 处理保存条件
    handleSaveConditions(result) {
      console.log('保存的条件数据:', result)

      // 这里可以调用API保存数据
      this.$toast.success('条件保存成功')
    },

    // 处理条件变更
    handleConditionChange(condition, parentNode) {
      console.log('条件变更:', condition, parentNode)
    },

    // 处理条件详情显示
    handleShowDetail(condition) {
      console.log('显示条件详情:', condition)
    },

    // 处理公式变更
    handleFormulaChange(formula) {
      console.log('公式变更:', formula)
    }
  }
}
</script>

<style lang="scss" scoped>
.access-condition-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .access-condition-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}
</style>
