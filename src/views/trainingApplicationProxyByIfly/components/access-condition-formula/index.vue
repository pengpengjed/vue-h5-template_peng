<template>
  <div class="access-condition-formula">
    <!-- 组合公式 -->
    <div class="formula-section">
      <div class="section-title">
        <div class="title-bar"></div>
        <span class="title-text">组合公式</span>
      </div>
      <div class="formula-content">
        <van-cell-group>
          <van-cell :title="formulaText" />
        </van-cell-group>
      </div>
    </div>

    <!-- 条件列表 -->
    <div class="conditions-section">
      <div class="section-title">
        <div class="title-bar"></div>
        <span class="title-text">条件列表</span>
      </div>
      <div class="conditions-content">
        <van-cell-group>
          <van-cell
            v-for="(condition, index) in conditionsList"
            :key="condition.id || index"
            :title="`条件${index + 1}`"
            :label="condition.conditionContent"
            :value="getConditionValue(condition)"
            :class="{ 'selected-condition': condition.selectFlag }"
          >
            <template #right-icon>
              <div class="condition-actions">
                <!-- 校验状态图标 -->
                <van-icon
                  :name="getConditionIcon(condition)"
                  :class="getConditionIconClass(condition)"
                  @click="showConditionDetail(condition)"
                />

                <!-- 编辑模式下的复选框 -->
                <van-checkbox
                  v-if="ifModify"
                  v-model="condition.selectFlag"
                  @change="handleConditionSelect(condition, $event)"
                  :disabled="!ifModify"
                />

                <!-- 操作按钮 -->
                <div class="action-buttons" v-if="!ifModify">
                  <!-- 确认满足按钮 -->
                  <van-button
                    v-if="condition.status === 'error'"
                    type="primary"
                    size="mini"
                    @click="confirmSatisfaction(condition)"
                  >
                    确认满足
                  </van-button>

                  <!-- 取消确认按钮 -->
                  <van-button
                    v-if="condition.status === 'manual'"
                    type="default"
                    size="mini"
                    @click="cancelConfirmation(condition)"
                  >
                    取消确认
                  </van-button>

                  <!-- 上传按钮 -->
                  <van-button
                    v-if="condition.status === 'manual' && condition.attachment"
                    type="primary"
                    size="mini"
                    @click="uploadAttachment(condition)"
                  >
                    上传
                  </van-button>

                  <!-- 附件名称 -->
                  <span v-if="condition.attachment" class="attachment-name" @click="previewFile(condition.attachment)">
                    {{ condition.attachment.name }}
                  </span>
                </div>
              </div>
            </template>
            <template #title v-if="ifModify">
              <span class="condition-number" @click="addConditionToFormula(index + 1)" :class="{ clickable: ifModify }">
                条件{{ index + 1 }}
              </span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <!-- 编辑模式下的组合公式编辑区域 -->
    <div class="formula-edit-section" v-if="ifModify">
      <div class="section-title">
        <div class="title-bar"></div>
        <span class="title-text">编辑组合公式</span>
      </div>

      <!-- 运算符按钮 -->
      <div class="operator-buttons">
        <van-button
          v-for="operator in operatorList"
          :key="operator.value"
          :class="operator.className"
          size="small"
          @click="addOperator(operator)"
        >
          {{ operator.label }}
        </van-button>
      </div>

      <!-- 组合公式编辑区域 -->
      <div class="combination-formula-edit">
        <div class="formula-display">
          <span class="formula-label">组合公式：</span>
          <div class="formula-items">
            <span
              v-for="(item, index) in combinationList"
              :key="index"
              :class="item.className"
              @click="selectFormulaItem(index)"
            >
              {{ item.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 条件详情弹窗 -->
    <van-popup v-model="showDetail" position="bottom" :style="{ height: '60%' }">
      <div class="detail-popup">
        <div class="popup-header">
          <h3>条件详情</h3>
          <van-icon name="cross" @click="showDetail = false" />
        </div>
        <div class="detail-content" v-if="currentCondition">
          <van-cell-group>
            <van-cell title="条件名称" :value="currentCondition.conditionName" />
            <van-cell title="条件内容" :value="currentCondition.conditionContent" />
            <van-cell title="条件类型" :value="getConditionTypeText(currentCondition.conditionType)" />
            <van-cell title="业务类型" :value="currentCondition.businessTypeName" />
            <van-cell title="机型" :value="currentCondition.baseTypeName || '本机型'" />
            <van-cell title="时间范围" :value="getTimeRangeText(currentCondition)" />
            <van-cell title="条件项" :value="currentCondition.businessFieldName" />
            <van-cell title="分类" :value="currentCondition.businessCategoryName" />
            <van-cell title="操作符" :value="currentCondition.businessOperatorName" />
            <van-cell title="比较值" :value="currentCondition.businessValue1" />
            <van-cell title="单位" :value="currentCondition.businessUnitName" />
            <van-cell title="备注" :value="currentCondition.remark || '无'" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  name: 'AccessConditionFormula',
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
      showDetail: false,
      currentCondition: null,
      combinationList: [],
      selectedFormulaIndex: null,
      operatorList: [
        {
          label: '(',
          className: 'operator-bracket',
          value: '(',
          type: 'bracket'
        },
        {
          label: ')',
          className: 'operator-bracket',
          value: ')',
          type: 'bracket'
        },
        {
          label: '或',
          className: 'operator-or',
          value: '|',
          type: 'logic'
        },
        {
          label: '且',
          className: 'operator-and',
          value: '&',
          type: 'logic'
        }
      ]
    }
  },
  computed: {
    // 生成组合公式文本
    formulaText() {
      // 优先使用 conditionalExpressionDesc
      if (this.data.conditionalExpressionDesc) {
        return this.data.conditionalExpressionDesc
      }

      // 如果没有描述，根据 conditionalExpression 生成
      if (this.data.conditionalExpression) {
        return this.parseConditionalExpression(this.data.conditionalExpression)
      }

      return '暂无组合公式'
    },

    // 获取所有条件列表
    conditionsList() {
      // 优先使用 accessConditionDetailList
      if (this.data.accessConditionDetailList && this.data.accessConditionDetailList.length > 0) {
        return this.data.accessConditionDetailList
      }

      // 如果没有 detailList，尝试从 groupList 中提取
      const conditions = []
      this.traverseConditions(this.data.accessConditionZhftcGroupList || [], conditions)
      return conditions
    }
  },
  watch: {
    data: {
      handler(newData) {
        this.initCombinationList(newData)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 初始化组合公式列表
    initCombinationList(data) {
      if (!data.conditionalExpression) {
        this.combinationList = []
        return
      }

      const expression = data.conditionalExpression
      const combinationList = []
      let currentNumber = ''

      for (let i = 0; i < expression.length; i++) {
        const char = expression[i]

        if (char === '|' || char === '&' || char === '(' || char === ')') {
          // 如果有累积的数字，先添加条件
          if (currentNumber) {
            const conditionIndex = parseInt(currentNumber) - 1
            const condition = this.conditionsList[conditionIndex]
            combinationList.push({
              label: `条件${currentNumber}`,
              className: 'formula-condition',
              value: currentNumber,
              type: 'condition',
              content: condition ? condition.conditionContent : ''
            })
            currentNumber = ''
          }

          // 添加操作符
          const operator = this.operatorList.find(op => op.value === char)
          if (operator) {
            combinationList.push({
              label: operator.label,
              className: `formula-${operator.type}`,
              value: char,
              type: operator.type
            })
          }
        } else if (/\d/.test(char)) {
          currentNumber += char
        }
      }

      // 处理最后的数字
      if (currentNumber) {
        const conditionIndex = parseInt(currentNumber) - 1
        const condition = this.conditionsList[conditionIndex]
        combinationList.push({
          label: `条件${currentNumber}`,
          className: 'formula-condition',
          value: currentNumber,
          type: 'condition',
          content: condition ? condition.conditionContent : ''
        })
      }

      this.combinationList = combinationList
    },

    // 解析条件表达式
    parseConditionalExpression(expression) {
      if (!expression) return '暂无组合公式'

      // 替换操作符
      let result = expression.replace(/\|/g, ' 或 ').replace(/&/g, ' 且 ').replace(/\(/g, ' ( ').replace(/\)/g, ' ) ')

      // 清理多余空格
      result = result.replace(/\s+/g, ' ').trim()

      return result
    },

    // 递归遍历所有条件（用于兼容旧数据结构）
    traverseConditions(groups, conditions) {
      groups.forEach(group => {
        if (group.labelList && group.labelList.length > 0) {
          conditions.push(...group.labelList)
        }
        if (group.childrenList && group.childrenList.length > 0) {
          this.traverseConditions(group.childrenList, conditions)
        }
      })
    },

    // 获取条件显示值
    getConditionValue(condition) {
      const operator = condition.businessOperatorName || this.getOperatorText(condition.businessOperator)
      const value = condition.businessValue1
      const unit = condition.businessUnitName || ''
      return `${operator} ${value}${unit}`
    },

    // 获取操作符文本
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

    // 获取条件类型文本
    getConditionTypeText(type) {
      const typeMap = {
        1: '训练类',
        2: '资格类',
        3: '飞行经历类',
        4: '其他类'
      }
      return typeMap[type] || '未知类型'
    },

    // 获取时间范围文本
    getTimeRangeText(condition) {
      if (!condition.timeRangeType) return '无'

      const timeRangeTypeMap = {
        1: '年',
        2: '月',
        3: '日',
        4: '无限制'
      }

      const timeRangeType = timeRangeTypeMap[condition.timeRangeType] || '未知'

      if (condition.timeRangeType === 4) {
        return timeRangeType
      }

      return `${condition.timeRangeValue || 0}${timeRangeType}`
    },

    // 显示条件详情
    showConditionDetail(condition) {
      this.currentCondition = condition
      this.showDetail = true
      this.$emit('show-detail', condition)
    },

    // 处理条件选择
    handleConditionSelect(condition, selected) {
      condition.selectFlag = selected
      this.$emit('condition-change', condition, selected)
    },

    // 添加操作符到组合公式
    addOperator(operator) {
      if (this.selectedFormulaIndex !== null) {
        // 在选中位置插入
        this.combinationList.splice(this.selectedFormulaIndex + 1, 0, {
          label: operator.label,
          className: `formula-${operator.type}`,
          value: operator.value,
          type: operator.type
        })
        this.selectedFormulaIndex++
      } else {
        // 添加到末尾
        this.combinationList.push({
          label: operator.label,
          className: `formula-${operator.type}`,
          value: operator.value,
          type: operator.type
        })
      }
      this.updateConditionalExpression()
    },

    // 选择组合公式中的项目
    selectFormulaItem(index) {
      this.selectedFormulaIndex = index
    },

    // 更新条件表达式
    updateConditionalExpression() {
      const expression = this.combinationList.map(item => item.value).join('')
      this.$emit('formula-change', expression)
    },

    // 获取表单数据
    getFormData() {
      const selectedConditions = this.conditionsList.filter(condition => condition.selectFlag)
      const conditionalExpression = this.combinationList.map(item => item.value).join('')

      return {
        conditionalExpression,
        conditionalExpressionDesc: this.generateExpressionDesc(),
        accessConditionDetailList: selectedConditions
      }
    },

    // 生成表达式描述
    generateExpressionDesc() {
      return this.combinationList.map(item => item.label).join(' ')
    },

    // 添加条件到组合公式
    addConditionToFormula(conditionNumber) {
      const conditionIndex = conditionNumber - 1
      const condition = this.conditionsList[conditionIndex]
      if (condition) {
        this.combinationList.push({
          label: `条件${conditionNumber}`,
          className: 'formula-condition',
          value: conditionNumber.toString(),
          type: 'condition',
          content: condition.conditionContent
        })
        this.updateConditionalExpression()
      }
    },

    // 获取条件图标
    getConditionIcon(condition) {
      if (condition.status === 'error') {
        return 'close-circle'
      } else if (condition.status === 'manual') {
        return 'info-o'
      } else {
        return 'success'
      }
    },

    // 获取条件图标类名
    getConditionIconClass(condition) {
      if (condition.status === 'error') {
        return 'icon-error'
      } else if (condition.status === 'manual') {
        return 'icon-manual'
      } else {
        return 'icon-success'
      }
    },

    // 确认条件满足
    confirmSatisfaction(condition) {
      this.$emit('confirm-satisfaction', condition)
    },

    // 取消条件确认
    cancelConfirmation(condition) {
      this.$emit('cancel-confirmation', condition)
    },

    // 上传附件
    uploadAttachment(condition) {
      this.$emit('upload-attachment', condition)
    },

    // 预览文件
    previewFile(file) {
      this.$emit('preview-file', file)
    }
  }
}
</script>

<style lang="scss" scoped>
.access-condition-formula {
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .title-bar {
      width: 4px;
      height: 18px;
      background: #3986ff;
      margin-right: 8px;
      border-radius: 2px;
    }

    .title-text {
      font-size: 16px;
      font-weight: 500;
      color: #5a709b;
    }
  }

  .formula-section {
    margin-bottom: 24px;

    .formula-content {
      ::v-deep .van-cell {
        background-color: #f8f9fa;
        border-radius: 6px;
        border-left: 3px solid #3986ff;

        .van-cell__title {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }
      }
    }
  }

  .conditions-section {
    margin-bottom: 24px;

    .conditions-content {
      ::v-deep .van-cell {
        margin-bottom: 8px;
        background-color: #ffffff;
        border-radius: 6px;
        border: 1px solid #e8e8e8;

        &.selected-condition {
          background-color: #e7f6ff;
          border-color: #3986ff;
        }

        .condition-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .attachment-name {
          color: #3986ff;
          cursor: pointer;
          font-size: 13px;
          text-decoration: underline;

          &:hover {
            color: #2968c8;
          }
        }

        .van-cell__title {
          font-weight: 500;
          color: #333;
          font-size: 14px;

          .condition-number {
            &.clickable {
              cursor: pointer;
              color: #3986ff;
              text-decoration: underline;

              &:hover {
                color: #2968c8;
              }
            }
          }
        }

        .van-cell__label {
          color: #666;
          font-size: 13px;
          margin-top: 4px;
        }

        .van-cell__value {
          color: #3986ff;
          font-weight: 500;
          font-size: 13px;
        }

        .van-icon {
          color: #3986ff;
          cursor: pointer;
          font-size: 16px;
        }
      }
    }
  }

  .formula-edit-section {
    margin-bottom: 24px;

    .operator-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      .van-button {
        &.operator-bracket {
          background-color: #faf2e4;
          border-color: #eadeca;
          color: #444444;
        }

        &.operator-or,
        &.operator-and {
          background-color: #eaf7ee;
          border-color: #a5cfb8;
          color: #444444;
        }
      }
    }

    .combination-formula-edit {
      .formula-display {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #e8e8e8;

        .formula-label {
          font-weight: 500;
          color: #333;
          white-space: nowrap;
        }

        .formula-items {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          span {
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;

            &.formula-condition {
              background-color: #3ebaff;
              color: white;
            }

            &.formula-bracket {
              background-color: #faf2e4;
              border: 1px solid #eadeca;
              color: #444444;
            }

            &.formula-logic {
              background-color: #eaf7ee;
              border: 1px solid #a5cfb8;
              color: #444444;
            }

            &:hover {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }

  .detail-popup {
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
