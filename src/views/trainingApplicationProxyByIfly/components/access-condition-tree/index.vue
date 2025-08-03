<template>
  <div class="access-condition-tree">
    <!-- 根节点关系标识 -->
    <div class="root-relation" v-if="rootData.accessConditionRelational">
      <VanTag class="relationTag" color="#EAF7EE" text-color="#333333" size="large">
        {{ rootData.accessConditionRelational === 1 ? '并且' : '或者' }}
      </VanTag>
      <!-- <span class="relation-text">满足以下所有分组条件</span> -->
    </div>

    <!-- 分组列表 -->
    <div class="groups-container" v-if="groupsList.length > 0">
      <tree-node
        v-for="group in groupsList"
        :key="group.id"
        :node-data="group"
        :level="0"
        :if-modify="ifModify"
        @show-detail="handleShowDetail"
        @condition-change="handleConditionChange"
        @confirm-satisfaction="handleConfirmSatisfaction"
        @cancel-confirmation="handleCancelConfirmation"
        @preview-file="handlePreviewFile"
      />
    </div>

    <!-- 空状态 -->
    <van-empty v-else description="暂无准入条件数据" />

    <!-- 全局条件详情弹窗 -->
    <van-popup v-model="showGlobalDetail" position="bottom" :style="{ height: '70%' }">
      <div class="global-detail-popup">
        <div class="popup-header">
          <h3>条件详情</h3>
          <van-icon name="cross" @click="showGlobalDetail = false" />
        </div>
        <div class="detail-content" v-if="currentGlobalCondition">
          <van-cell-group>
            <van-cell title="条件名称" :value="currentGlobalCondition.conditionLabel?.labelName" />
            <van-cell title="条件内容" :value="currentGlobalCondition.conditionContent" />
            <van-cell title="操作符" :value="getOperatorText(currentGlobalCondition.businessOperator)" />
            <van-cell title="比较值" :value="currentGlobalCondition.businessValue" />
            <van-cell title="单位" :value="currentGlobalCondition.conditionLabel?.unit || '无'" />
            <van-cell title="标签代码" :value="currentGlobalCondition.conditionLabel?.labelCode || '无'" />
            <van-cell title="关联标签" :value="currentGlobalCondition.conditionLabel?.relatedLabel || '无'" />
            <van-cell title="备注" :value="currentGlobalCondition.remark || '无'" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import TreeNode from '../tree-node/index.vue'

export default {
  name: 'AccessConditionTree',
  components: {
    TreeNode
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    ifModify: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showGlobalDetail: false,
      currentGlobalCondition: null,
      treeData: {
        accessConditionRelational: 1,
        accessConditionZhftcGroupList: []
      }
    }
  },
  computed: {
    rootData() {
      return this.treeData
    },
    groupsList() {
      return this.rootData.accessConditionZhftcGroupList || []
    }
  },
  watch: {
    data: {
      handler(newData) {
        this.setFormData(newData)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getOperatorText(operator) {
      const operatorMap = {
        1: '大于',
        2: '大于等于',
        3: '等于',
        4: '小于等于',
        5: '等于是'
      }
      return operatorMap[operator] || '未知'
    },

    handleShowDetail(condition) {
      this.currentGlobalCondition = condition
      this.showGlobalDetail = true
    },

    handleConditionChange(condition, parentNode) {
      // 触发条件变更事件
      this.$emit('condition-change', condition, parentNode)
    },

    // 处理确认满足
    handleConfirmSatisfaction(condition) {
      this.$emit('confirm-satisfaction', condition)
    },

    // 处理取消确认
    handleCancelConfirmation(condition) {
      this.$emit('cancel-confirmation', condition)
    },

    // 处理文件预览
    handlePreviewFile(attachment) {
      this.$emit('preview-file', attachment)
    },

    /**
     * 获取当前树结构全部数据（含选中状态）
     * @returns {Object}
     */
    getFormData() {
      return this.treeData
    },

    /**
     * 获取所有已选中的条件ID（递归遍历所有分组）
     * @returns {Array}
     */
    getLabelListIds() {
      const ids = []
      const traverse = nodes => {
        nodes.forEach(node => {
          // 收集当前节点的labelList ID（仅selectFlag为true的项）
          if (node.labelList) {
            ids.push(...node.labelList.filter(item => item.selectFlag).map(item => item.id))
          }
          // 递归遍历子节点
          if (node.childrenList?.length) {
            traverse(node.childrenList)
          }
        })
      }
      traverse(this.treeData.accessConditionZhftcGroupList)
      return ids
    },

    /**
     * 获取所有已选中的条件内容（递归遍历所有分组）
     * @returns {Array}
     */
    getLabelListConditions() {
      const conditions = []
      const traverse = nodes => {
        nodes.forEach(node => {
          // 收集当前节点的labelList conditionContent（仅selectFlag为true的项）
          if (node.labelList) {
            conditions.push(...node.labelList.filter(item => item.selectFlag).map(item => item.conditionContent))
          }
          // 递归遍历子节点
          if (node.childrenList?.length) {
            traverse(node.childrenList)
          }
        })
      }
      traverse(this.treeData.accessConditionZhftcGroupList)
      return conditions
    },

    /**
     * 设置树结构数据（回显/重置）
     * @param {Object} record
     */
    setFormData(record) {
      if (record && JSON.stringify(record) !== '{}') {
        Object.assign(this.treeData, record, {
          accessConditionZhftcGroupList: []
        })
        if (record.accessConditionZhftcGroupList) {
          this.treeData.accessConditionZhftcGroupList = this.deepAddChecked(record.accessConditionZhftcGroupList)
        }
        this.setTreeIndex(this.treeData.accessConditionZhftcGroupList, 1)
      }
    },

    /**
     * 通过condition设置selectFlag，并复用setFormData
     * @param {Object} record 数据记录
     * @param {Array} condition 条件数组
     */
    setFormDataByConditions(record, condition) {
      this.setFormData(record)
      // 类型兼容：全部转为字符串，避免类型不一致导致includes失效
      const conditionSet = Array.isArray(condition) ? new Set(condition.map(String)) : new Set()
      const setChecked = nodes => {
        nodes.forEach(node => {
          if (node.labelList) {
            node.labelList.forEach(item => {
              // id类型兼容
              item.selectFlag = conditionSet.size > 0 ? conditionSet.has(String(item.conditionContent)) : false
            })
          }
          if (node.childrenList && node.childrenList.length) {
            setChecked(node.childrenList)
          }
        })
      }
      setChecked(this.treeData.accessConditionZhftcGroupList)
      this.setTreeIndex(this.treeData.accessConditionZhftcGroupList, 1)
    },

    /**
     * 递归为每个条件项补充selectFlag字段，保证健壮性
     * @param {Array} nodes
     * @returns {Array}
     */
    deepAddChecked(nodes) {
      return nodes.map(node => ({
        ...node,
        labelList: node.labelList?.map(item => ({
          ...item,
          selectFlag: !!item.selectFlag // 保证布尔值
        })),
        childrenList: node.childrenList ? this.deepAddChecked(node.childrenList) : []
      }))
    },

    /**
     * 递归设置分组索引，便于前端展示
     * @param {Array} node
     * @param {Number|null} level
     * @param {String|Number} parentIndex
     */
    setTreeIndex(node, level, parentIndex) {
      for (let i = 0; i < node.length; i++) {
        if (level) {
          node[i].index = i + 1
        } else {
          node[i].index = parentIndex + '.' + (i + 1)
        }
        if (node[i].childrenList && node[i].childrenList.length) {
          this.setTreeIndex(node[i].childrenList, null, node[i].index)
        }
      }
    },

    /**
     * 获取所有已选中的条件对象（递归）
     * @returns {Array}
     */
    getSelectedConditions() {
      const result = []
      const traverse = nodes => {
        nodes.forEach(node => {
          if (node.labelList) {
            node.labelList.forEach(item => {
              if (item.selectFlag) {
                result.push(item)
              }
            })
          }
          if (node.childrenList) {
            traverse(node.childrenList)
          }
        })
      }
      traverse(this.treeData.accessConditionZhftcGroupList)
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.relationTag {
  border: 1px solid #a5cfb8;
}
.access-condition-tree {
  .root-relation {
    display: flex;
    align-items: center;
    // padding: 12px 16px;
    color: white;
    border-radius: 8px;
    margin-bottom: 20px;

    .relation-text {
      margin-left: 12px;
      font-weight: 500;
      font-size: 14px;
    }
  }

  .groups-container {
    padding: 0 20px;
  }

  .global-detail-popup {
    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      h3 {
        margin: 0;
        color: white;
      }

      .van-icon {
        cursor: pointer;
        color: white;
        font-size: 18px;
      }
    }

    .detail-content {
      padding: 16px;

      ::v-deep .van-cell {
        padding: 12px 0;

        .van-cell__title {
          color: #666;
          font-size: 14px;
        }

        .van-cell__value {
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
