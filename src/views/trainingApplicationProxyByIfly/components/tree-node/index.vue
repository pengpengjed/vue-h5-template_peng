<template>
  <div class="tree-node">
    <!-- 分组节点 -->
    <div class="group-node" v-if="nodeData.accessConditionLevel">
      <div class="group-header">
        <span class="group-title">{{ getGroupTitle() }}</span>
        <van-tag
          class="relationTag"
          color="#EAF7EE"
          text-color="#333333"
          v-if="nodeData.accessConditionRelational === 1"
          size="large"
        >
          并且
        </van-tag>
        <van-tag class="relationTag" color="#EAF7EE" text-color="#333333" v-else size="large">或者</van-tag>
      </div>

      <!-- 当前分组的条件列表 -->
      <div class="conditions-list" v-if="nodeData.labelList && nodeData.labelList.length > 0">
        <template v-for="condition in nodeData.labelList">
          <div class="conditions-list-item" :key="condition.id">
            <div class="condition-item" :class="getConditionClass(condition)">
              {{ condition.conditionContent }}
            </div>
            <div class="action-buttons" v-if="!ifModify">
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
            </div>
          </div>

          <div
            v-if="condition.status === 'manual' && condition.attachment"
            class="conditions-list-item"
            :key="condition.id"
          >
            <!-- 附件名称 -->
            <div
              v-if="condition.attachment"
              class="condition-item condition-item-file"
              @click="previewFile(condition.attachment)"
            >
              <van-icon :name="require('../../theme/images/icon-file.svg')" size="15px" />
              {{ condition.attachment.name }}
            </div>
            <van-button
              style="padding: 2px 12px; font-size: 10px; line-height: 15px"
              v-if="condition.status === 'manual' && condition.attachment"
              type="info"
              size="mini"
              @click="uploadAttachment(condition)"
            >
              重新上传
            </van-button>
          </div>
        </template>
      </div>

      <!-- 子分组 -->
      <div class="children-container" v-if="nodeData.childrenList && nodeData.childrenList.length > 0">
        <div class="children-wrapper">
          <tree-node
            v-for="child in nodeData.childrenList"
            :key="child.id"
            :node-data="child"
            :level="level + 1"
            :if-modify="ifModify"
            :pageType="pageType"
            @show-detail="handleShowDetail"
            @condition-change="handleChildConditionChange"
            @confirm-satisfaction="handleConfirmSatisfaction"
            @cancel-confirmation="handleCancelConfirmation"
            @preview-file="handlePreviewFile"
          />
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
            <van-cell title="条件名称" :value="currentCondition.conditionLabel.labelName" />
            <van-cell title="条件内容" :value="currentCondition.conditionContent" />
            <van-cell title="操作符" :value="getOperatorText(currentCondition.businessOperator)" />
            <van-cell title="比较值" :value="currentCondition.businessValue" />
            <van-cell title="单位" :value="currentCondition.conditionLabel.unit || '无'" />
            <van-cell title="标签代码" :value="currentCondition.conditionLabel.labelCode || '无'" />
            <van-cell title="关联标签" :value="currentCondition.conditionLabel.relatedLabel || '无'" />
            <van-cell title="备注" :value="currentCondition.remark || '无'" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import accessConditionBase from '../../mixins/accessConditionBase'
export default {
  name: 'TreeNode',
  mixins: [accessConditionBase],
  props: {
    nodeData: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    ifModify: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showDetail: false,
      currentCondition: null
    }
  },
  methods: {
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

    getGroupTitle() {
      // 根据层级生成分组标题
      if (this.nodeData.index) {
        return `分组${this.nodeData.index}`
      }
      return this.nodeData.accessConditionLevel || '分组'
    },

    getConditionLabel(condition) {
      const label = condition.conditionLabel
      if (!label) return ''

      let result = `标签代码: ${label.labelCode}`
      if (label.relatedLabel) {
        result += ` | 关联标签: ${label.relatedLabel}`
      }
      return result
    },

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

    // 获取条件图标
    getConditionIcon(condition) {
      switch (condition.status) {
        case 'success':
          return 'success'
        case 'error':
          return 'cross'
        case 'manual':
          return 'question-o'
        default:
          return 'question-o'
      }
    },

    // 获取条件图标样式
    getConditionIconClass(condition) {
      switch (condition.status) {
        case 'success':
          return 'icon-success'
        case 'error':
          return 'icon-error'
        case 'manual':
          return 'icon-manual'
        default:
          return 'icon-manual'
      }
    },

    getConditionClass(condition) {
      if (!this.isReview) return ''
      switch (condition.status) {
        case 'success':
          return 'condition-item-success'
        case 'error':
          return 'condition-item-error'
        case 'manual':
          return 'condition-item-manual'
        default:
          return 'condition-item-manual'
      }
    },

    showConditionDetail(condition) {
      this.currentCondition = condition
      this.showDetail = true
      this.$emit('show-detail', condition)
    },

    handleShowDetail(condition) {
      this.$emit('show-detail', condition)
    },

    handleChildConditionChange(condition, parentNode) {
      this.$emit('condition-change', condition, parentNode)
    },

    // 确认满足
    confirmSatisfaction(condition) {
      this.$emit('confirm-satisfaction', condition)
    },

    // 取消确认
    cancelConfirmation(condition) {
      this.$emit('cancel-confirmation', condition)
    },

    // 上传附件
    uploadAttachment(condition) {
      this.$emit('upload-attachment', condition)
    },

    // 预览文件
    previewFile(attachment) {
      this.$emit('preview-file', attachment)
    }
  }
}
</script>

<style lang="less" scoped>
.relationTag {
  border: 1px solid #a5cfb8;
}
.tree-node {
  .group-node {
    margin-bottom: 8px;

    .group-header {
      display: flex;
      align-items: center;
      flex-direction: row;
      // padding: 14px 16px;
      // background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #333;
      margin-bottom: 12px;
      // border-radius: 8px;
      // border: 1px solid #e8e8e8;
      transition: all 0.3s ease;
      gap: 10px;

      /* &:hover {
        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      } */

      .van-icon {
        margin-right: 10px;
        transition: transform 0.3s ease;
        cursor: pointer;
        color: #667eea;
        font-size: 16px;
      }

      .group-title {
        // flex: 1;
        font-weight: 500;
        font-size: 12px;
        color: #333333;
      }

      .van-tag {
        font-size: 12px;
        padding: 2px 8px;
      }
    }

    .conditions-list {
      margin-left: 24px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      width: 100vw;

      .conditions-list-item {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 8px;
        :last-child {
          margin-bottom: unset;
        }
      }

      .condition-item {
        background-color: #fff;
        min-width: 204px;
        padding: 6px 16px;
        box-sizing: border-box;
        font-weight: 400;
        color: #444444;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;

        &-success {
          border: 1px solid #94dcce;
          border-radius: 2px;
          position: relative;
          &::after {
            content: '';
            position: absolute;
            top: -1px;
            right: -1px;
            width: 16px;
            height: 16px;
            background-image: url('../../theme/images/icon-pass.png');
            background-size: contain;
            background-repeat: no-repeat;
          }
        }

        &-error {
          background: #fff7f7;
          border: 1px solid #f0c6bb;
          border-radius: 2px;
          position: relative;
          &::after {
            content: '';
            position: absolute;
            top: -1px;
            right: -1px;
            width: 16px;
            height: 16px;
            background-image: url('../../theme/images/icon-fail.png');
            background-size: contain;
            background-repeat: no-repeat;
          }
        }

        &-manual {
          background: #fffcf7;
          border: 1px solid #f0dcbb;
          border-radius: 2px;
          position: relative;
          &::after {
            content: '';
            position: absolute;
            top: -1px;
            right: -1px;
            width: 16px;
            height: 16px;
            background-image: url('../../theme/images/icon-question.png');
            background-size: contain;
            background-repeat: no-repeat;
          }
        }

        &-file {
          background: #ddeeff;
          border-radius: 4px;
        }
      }
      .action-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;

        ::v-deep {
          .van-button {
            padding: 2px 12px;
            font-size: 10px;
            line-height: 15px;
          }
        }
      }
    }

    .children-container {
      margin-left: 24px;
      // border-left: 2px dashed #ddd;
      padding-left: 20px;
      margin-top: 8px;

      .children-wrapper {
        position: relative;

        // &::before {
        //   content: '';
        //   position: absolute;
        //   left: -22px;
        //   top: 0;
        //   width: 2px;
        //   height: 100%;
        //   background: linear-gradient(to bottom, #667eea, transparent);
        // }
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

      h3 {
        margin: 0;
        color: #333;
      }

      .van-icon {
        cursor: pointer;
        color: #999;
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
