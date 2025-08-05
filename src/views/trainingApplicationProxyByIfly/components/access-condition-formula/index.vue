<template>
  <div class="access-condition-formula">
    <div class="divider" v-if="isReview" />
    <!-- 组合公式 -->
    <!-- 例子：组合公式：条件1且（条件2或条件3） -->
    <div class="formula-section">
      <div :class="{ 'formula-content': isOnlyShow, 'formula-content-plus': isReview }">
        <span>组合公式：</span>
        <span v-if="isOnlyShow">{{ formulaText }}</span>
        <span v-if="isReview" v-html="formulaTextPlus" />
      </div>
    </div>

    <!-- 条件列表 -->
    <div class="conditions-section">
      <div class="conditions-content">
        <template v-if="pageType === 1">
          <div
            v-for="(condition, index) in conditionsList"
            :key="condition.id || index"
            :title="`条件${index + 1}`"
            :label="condition.conditionContent"
            :value="getConditionValue(condition)"
            :class="{ 'selected-condition': condition.selectFlag }"
            class="conditions-content-view"
          >
            {{ `条件${index + 1}：` }}{{ condition.conditionContent }}
          </div>
        </template>
        <div class="conditions-list" v-else>
          <template v-for="(condition, index) in conditionsList">
            <div
              class="condition-item-wrapper"
              :class="getConditionWrapperClass(condition)"
              :key="condition.id || index"
            >
              <!-- 第一行：条件序号 + 图标 + 条件内容 -->
              <div class="condition-header">
                <div class="condition-number-container" :class="getConditionNumberClass(condition)">
                  <span class="condition-number" @click="ifModify && addConditionToFormula(index + 1)">
                    条件{{ index + 1 }}
                  </span>
                  <img
                    :src="getConditionIcon(condition)"
                    :class="getConditionIconClass(condition)"
                    @click="handleIconClick(condition)"
                    class="condition-status-icon"
                    alt="状态图标"
                  />
                  <!-- 编辑模式下的复选框 -->
                  <van-checkbox
                    v-if="ifModify"
                    v-model="condition.selectFlag"
                    @change="handleConditionSelect(condition, $event)"
                    class="condition-checkbox"
                  />
                </div>
                <div class="condition-content">
                  {{ condition.conditionContent }}
                </div>
              </div>

              <!-- 第二行：操作按钮 -->
              <div class="condition-actions" v-if="!ifModify && hasActionButtons(condition)">
                <!-- 确认满足按钮 -->
                <van-button
                  v-if="condition.status === 'error'"
                  type="info"
                  size="mini"
                  @click="confirmSatisfaction(condition)"
                >
                  确认满足
                </van-button>

                <!-- 取消确认按钮 -->
                <van-button
                  v-if="condition.status === 'manual'"
                  type="info"
                  plain
                  size="mini"
                  @click="cancelConfirmation(condition)"
                >
                  取消确认
                </van-button>

                <!-- 上传按钮 -->
                <van-button
                  v-if="condition.status === 'manual' && condition.hasAttachment"
                  type="info"
                  size="mini"
                  @click="uploadAttachment(condition)"
                >
                  上传
                </van-button>
              </div>

              <!-- 第三行：附件信息 -->
              <div
                class="condition-attachment"
                v-if="condition.status === 'manual' && condition.attachment && condition.attachment.name"
              >
                <div class="attachment-info" @click="previewFile(condition.attachment)">
                  <img :src="require('../../theme/images/icon-file.svg')" class="file-icon" alt="文件图标" />
                  <span class="attachment-name">{{ condition.attachment.name }}</span>
                </div>
                <van-button type="info" size="mini" @click="uploadAttachment(condition)"> 重新上传 </van-button>
              </div>
            </div>
          </template>
        </div>
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

    <!-- 确认满足弹窗 -->
    <van-dialog
      v-model="showConfirmDialog"
      title="确认满足条件"
      show-cancel-button
      cancel-button-text="取消"
      :show-confirm-button="false"
      :close-on-click-overlay="false"
    >
      <div class="confirm-content">
        <p>系统无法校验该准入条件，需要人工确认该条件满足。</p>
        <p>请选择确认方式：</p>
        <div class="confirm-buttons">
          <van-button type="default" size="normal" @click="handleConfirmWithoutUpload" class="confirm-btn">
            不上传
          </van-button>
          <van-button type="primary" size="normal" @click="handleConfirmWithUpload" class="confirm-btn">
            上传
          </van-button>
        </div>
      </div>
      <template #cancel>
        <van-button @click="showConfirmDialog = false">取消</van-button>
      </template>
    </van-dialog>

    <!-- 文件上传弹窗 -->
    <cs-file-upload-popup
      v-model="showUploadDialog"
      :accept-exts="acceptedFileTypes"
      :limit-size="10"
      @read-file="onFileSelected"
    />
  </div>
</template>

<script>
import accessConditionBase from '../../mixins/accessConditionBase'
import csFileUploadPopup from '@/components/csFileUploadPopup.vue'

export default {
  name: 'AccessConditionFormula',
  mixins: [accessConditionBase],
  components: {
    csFileUploadPopup
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
      showDetail: false,
      currentCondition: null,
      combinationList: [],
      selectedFormulaIndex: null,
      showConfirmDialog: false,
      showUploadDialog: false,
      pendingCondition: null,
      acceptedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'bmp'],
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

    // 满足条件用绿色标识，不满足条件用红色标识
    formulaTextPlus() {
      return this.generateFormulaWithStatus()
    },

    // 获取所有条件列表
    conditionsList() {
      console.log(
        'this.data.accessConditionDetailList',
        JSON.parse(JSON.stringify(this.data.accessConditionDetailList))
      )
      // 优先使用 accessConditionDetailList
      if (this.data.accessConditionDetailList && this.data.accessConditionDetailList.length > 0) {
        return this.data.accessConditionDetailList
      }

      // 如果没有 detailList，尝试从 groupList 中提取
      const conditions = []
      this.traverseConditions(this.data.accessConditionZhftcGroupList || [], conditions)
      console.log('conditions', conditions)
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
    // 格式化条件状态显示
    formatConditionStatus(text, condition) {
      if (!condition) return text
      const color = condition.status === 'success' ? '#10b981' : '#dc2626'
      return `<span style="color: ${color}">${text}</span>`
    },

    // 生成带状态标记的公式文本
    generateFormulaWithStatus() {
      if (!this.data.conditionalExpression) {
        return '暂无组合公式'
      }

      const expression = this.data.conditionalExpression
      let result = ''
      let currentNumber = ''
      let conditionsMap = {}

      // 创建条件索引映射
      this.conditionsList.forEach((condition, index) => {
        conditionsMap[index + 1] = condition
      })

      for (let i = 0; i < expression.length; i++) {
        const char = expression[i]

        if (char === '|' || char === '&' || char === '(' || char === ')') {
          // 处理累积的数字
          if (currentNumber) {
            const condition = conditionsMap[parseInt(currentNumber)]
            result += this.formatConditionStatus(`条件${currentNumber}`, condition)
            currentNumber = ''
          }

          // 添加操作符
          result += char === '|' ? ' 或 ' : char === '&' ? ' 且 ' : char
        } else if (/\d/.test(char)) {
          currentNumber += char
        }
      }

      // 处理最后的数字
      if (currentNumber) {
        const condition = conditionsMap[parseInt(currentNumber)]
        result += this.formatConditionStatus(`条件${currentNumber}`, condition)
      }

      return result
    },
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
      if (condition.status === 'success') {
        return require('../../theme/images/icon-pass.png')
      } else if (condition.status === 'error') {
        return require('../../theme/images/icon-fail.png')
      } else if (condition.status === 'manual') {
        return require('../../theme/images/icon-question.png')
      } else {
        // 默认根据某些业务逻辑判断
        return require('../../theme/images/icon-fail.png')
      }
    },

    // 获取条件图标类名
    getConditionIconClass(condition) {
      if (condition.status === 'success') {
        return 'icon-success'
      } else if (condition.status === 'error') {
        return 'icon-error'
      } else if (condition.status === 'manual') {
        return 'icon-manual'
      } else {
        return 'icon-error'
      }
    },

    // 获取条件单元格类名
    getConditionCellClass(condition) {
      if (condition.status === 'success') {
        return 'condition-success'
      } else if (condition.status === 'error') {
        return 'condition-error'
      } else if (condition.status === 'manual') {
        return 'condition-manual'
      } else {
        return 'condition-error'
      }
    },

    // 获取条件包装器类名
    getConditionWrapperClass(condition) {
      return {
        'selected-condition': condition.selectFlag
      }
    },

    // 获取条件序号容器类名
    getConditionNumberClass(condition) {
      if (condition.status === 'success') {
        return 'condition-number-success'
      } else if (condition.status === 'error') {
        return 'condition-number-error'
      } else if (condition.status === 'manual') {
        return 'condition-number-manual'
      } else {
        return 'condition-number-error'
      }
    },

    // 判断是否有操作按钮
    hasActionButtons(condition) {
      return (
        condition.status === 'error' ||
        condition.status === 'manual' ||
        (condition.status === 'manual' && condition.hasAttachment)
      )
    },

    // 处理图标点击
    handleIconClick(condition) {
      if (condition.status === 'manual') {
        // 显示toast提示
        this.$toast('系统无法校验该准入条件，人工确认满足')
      } else {
        // 显示条件详情
        this.showConditionDetail(condition)
      }
    },

    // 确认条件满足
    confirmSatisfaction(condition) {
      this.pendingCondition = condition
      this.showConfirmDialog = true
    },

    // 处理不上传确认
    handleConfirmWithoutUpload() {
      if (this.pendingCondition) {
        this.pendingCondition.status = 'manual'
        this.pendingCondition.hasAttachment = false
        this.pendingCondition.attachment = null
        this.$emit('confirm-satisfaction', this.pendingCondition, false)
      }
      this.showConfirmDialog = false
      this.pendingCondition = null
    },

    // 处理上传确认
    handleConfirmWithUpload() {
      if (this.pendingCondition) {
        this.pendingCondition.status = 'manual'
        this.pendingCondition.hasAttachment = true
        this.showUploadDialog = true
      }
      this.showConfirmDialog = false
    },

    // 取消条件确认
    cancelConfirmation(condition) {
      condition.status = 'error'
      condition.hasAttachment = false
      condition.attachment = null
      this.$emit('cancel-confirmation', condition)
    },

    // 上传附件
    uploadAttachment(condition) {
      this.pendingCondition = condition
      this.showUploadDialog = true
    },

    // 文件选择回调
    onFileSelected(fileData) {
      if (this.pendingCondition) {
        this.pendingCondition.attachment = {
          name: fileData.name,
          file: fileData.file,
          url: fileData.url,
          path: fileData.path
        }
        this.$emit('upload-attachment', this.pendingCondition, fileData)
      }
      this.showUploadDialog = false
      this.pendingCondition = null
    },

    // 预览文件
    previewFile(file) {
      this.$emit('preview-file', file)
    }
  }
}
</script>

<style lang="less" scoped>
.access-condition-formula {
  .divider {
    margin-left: 10px;
    width: 90px;
    height: 7px;
    background: url('../../theme/images/icon-divider.png') 100% 100% no-repeat transparent;
    background-size: contain;
    margin-bottom: 6px;
  }

  .formula-section {
    margin-bottom: 6px;
    .formula-content {
      color: #00304d;
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
    }
    .formula-content-plus {
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
    }
  }

  .conditions-section {
    margin-bottom: 24px;

    .conditions-content {
      .conditions-content-view {
        color: #333333;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        display: flex;
      }

      .conditions-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .condition-item-wrapper {
          background-color: #ffffff;
          border-radius: 6px;
          border: 1px solid #e8e8e8;
          padding: 12px;
          margin-bottom: 8px;

          &.selected-condition {
            background-color: #e7f6ff;
            border-color: #3986ff;
          }

          .condition-header {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 8px;

            .condition-number-container {
              position: relative;
              min-width: 60px;
              padding: 6px 16px;
              border-radius: 2px;
              display: flex;
              align-items: center;
              justify-content: center;

              .condition-number {
                font-size: 12px;
                font-weight: 500;
                color: #fff;
                line-height: 1;
              }

              .condition-status-icon {
                position: absolute;
                top: -2px;
                right: -2px;
                width: 16px;
                height: 16px;
                cursor: pointer;
              }

              .condition-checkbox {
                margin-left: 8px;
              }

              &.condition-number-success {
                background-color: #10b981;
                border: 1px solid #94dcce;
              }

              &.condition-number-error {
                background-color: #dc2626;
                border: 1px solid #f0c6bb;
              }

              &.condition-number-manual {
                background-color: #f59e0b;
                border: 1px solid #f0dcbb;
              }
            }

            .condition-content {
              flex: 1;
              font-size: 12px;
              color: #444444;
              line-height: 1.5;
              padding-top: 6px;
            }
          }

          .condition-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;

            ::v-deep .van-button {
              padding: 2px 12px;
              font-size: 10px;
              line-height: 15px;
            }
          }

          .condition-attachment {
            display: flex;
            align-items: center;
            gap: 8px;

            .attachment-info {
              display: flex;
              align-items: center;
              gap: 4px;
              background: #ddeeff;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              flex: 1;

              .file-icon {
                width: 15px;
                height: 15px;
              }

              .attachment-name {
                font-size: 12px;
                color: #3986ff;
                text-decoration: underline;

                &:hover {
                  color: #2968c8;
                }
              }
            }

            ::v-deep .van-button {
              padding: 2px 12px;
              font-size: 10px;
              line-height: 15px;
            }
          }
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

  // 确认满足弹窗样式
  .confirm-content {
    padding: 16px;
    text-align: center;

    p {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 14px;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .confirm-buttons {
      margin-top: 20px;
      display: flex;
      gap: 12px;
      justify-content: center;

      .confirm-btn {
        flex: 1;
        max-width: 100px;
      }
    }
  }
}
</style>
