<template>
  <div class="access-condition-manager">
    <!-- 切换按钮 -->
    <!-- <div class="type-switch">
      <VanButton :type="accessConditionType === 1 ? 'primary' : 'default'" size="small" @click="switchConditionType(1)">
        按标签配置
      </VanButton>
      <VanButton :type="accessConditionType === 2 ? 'primary' : 'default'" size="small" @click="switchConditionType(2)">
        自由组合
      </VanButton>
    </div> -->

    <!-- accessConditionType === 1 -->
    <div class="access-conditions-wrapper" v-if="accessConditionType === 1">
      <!-- 手指引导 -->
      <div class="finger-guide" v-if="showFingerGuide">
        <img src="../../theme/images/icon-tips.png" alt="手指引导" class="finger-guide-icon" />
        <div class="guide-text">左右滑动查看全部</div>
      </div>

      <AccessConditionTree
        ref="accessConditionTreeRef"
        v-if="accessConditionData"
        :data="accessConditionData"
        :if-modify="isEditMode"
        @show-detail="handleShowDetail"
        @condition-change="handleConditionChange"
        @confirm-satisfaction="handleConfirmSatisfaction"
        @cancel-confirmation="handleCancelConfirmation"
        @preview-file="handlePreviewFile"
        @upload-attachment="handleUploadAttachment"
      />
      <VanEmpty v-else description="暂无准入条件数据" />

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="accessConditionData && editable">
        <VanButton v-if="!isEditMode" type="primary" size="small" @click="toggleEditMode"> 编辑条件 </VanButton>
        <div v-else class="edit-actions">
          <VanButton type="primary" size="small" @click="saveConditions">保存</VanButton>
          <VanButton type="default" size="small" @click="cancelEdit">取消</VanButton>
        </div>
      </div>
    </div>

    <!-- accessConditionType === 2 -->
    <div class="access-conditions-wrapper" v-if="accessConditionType === 2">
      <AccessConditionFormula
        v-if="accessConditionData"
        :data="accessConditionData"
        :if-modify="isEditMode"
        :pageType="pageType"
        @show-detail="handleShowDetail"
        @condition-change="handleConditionChange"
        @formula-change="handleFormulaChange"
        @confirm-satisfaction="handleConfirmSatisfaction"
        @cancel-confirmation="handleCancelConfirmation"
        @preview-file="handlePreviewFile"
        @upload-attachment="handleUploadAttachment"
        ref="accessConditionFormulaRef"
      />
      <VanEmpty v-else description="暂无准入条件数据" />

      <!-- 操作按钮 -->
      <div class="action-buttons" v-if="accessConditionData && editable">
        <VanButton v-if="!isEditMode" type="primary" size="small" @click="toggleEditMode"> 编辑条件 </VanButton>
        <div v-else class="edit-actions">
          <VanButton type="primary" size="small" @click="saveConditions">保存</VanButton>
          <VanButton type="default" size="small" @click="cancelEdit">取消</VanButton>
        </div>
      </div>
    </div>

    <!-- 文件上传弹窗 -->
    <csFileUploadPopup
      v-model="showFileUpload"
      :accept-exts="acceptedFileTypes"
      :limit-size="10"
      @read-file="onFileRead"
    />

    <!-- 文件预览弹窗 -->
    <van-popup v-model="showFilePreview" position="center" :style="{ width: '90%', height: '80%' }">
      <div class="file-preview-popup">
        <div class="preview-header">
          <h3>{{ previewFileName }}</h3>
          <van-icon name="cross" @click="showFilePreview = false" />
        </div>
        <div class="preview-content">
          <iframe v-if="previewFileUrl" :src="previewFileUrl" width="100%" height="100%"></iframe>
          <div v-else class="preview-placeholder">
            <van-icon name="description" size="48" />
            <p>文件预览功能开发中...</p>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import AccessConditionTree from '../access-condition-tree/index.vue'
import AccessConditionFormula from '../access-condition-formula/index.vue'

export default {
  name: 'AccessConditionManager',
  components: {
    AccessConditionTree,
    AccessConditionFormula
  },
  props: {
    // 准入条件数据
    data: {
      type: Object,
      default: () => ({})
    },
    // 准入条件类型：1-按标签配置，2-自由组合
    type: {
      type: Number,
      default: 1
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false
    },
    // 页面类型：1： 代申请选择科目后显示纯查看
    pageType: {
      type: Number,
      default: 1,
      require: true
    }
  },
  data() {
    return {
      accessConditionType: this.type,
      accessConditionData: this.data,
      isEditMode: false,
      originalConditions: null,
      // 手指引导相关
      showFingerGuide: false,
      fingerGuideTimer: null,
      // 文件上传相关
      showFileUpload: false,
      showFilePreview: false,
      previewFileUrl: '',
      previewFileName: '',
      acceptedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'bmp'],
      currentCondition: null
    }
  },
  watch: {
    data: {
      handler(newData) {
        this.accessConditionData = newData
      },
      immediate: true,
      deep: true
    },
    type: {
      handler(newType) {
        this.accessConditionType = newType
        // 当类型为1时显示手指引导
        if (newType === 1) {
          this.showFingerGuideWithAutoHide()
        }
      },
      immediate: true
    },
    accessConditionType: {
      handler(newType) {
        // 当类型为1时显示手指引导
        if (newType === 1) {
          this.showFingerGuideWithAutoHide()
        } else {
          this.hideFingerGuide()
        }
      }
    }
  },
  methods: {
    // 显示手指引导并自动隐藏
    showFingerGuideWithAutoHide() {
      // 清除之前的定时器
      if (this.fingerGuideTimer) {
        clearTimeout(this.fingerGuideTimer)
      }

      // 显示手指引导
      this.showFingerGuide = true

      // 3秒后自动隐藏
      this.fingerGuideTimer = setTimeout(() => {
        this.showFingerGuide = false
        this.fingerGuideTimer = null
      }, 3000)
    },

    // 隐藏手指引导
    hideFingerGuide() {
      if (this.fingerGuideTimer) {
        clearTimeout(this.fingerGuideTimer)
        this.fingerGuideTimer = null
      }
      this.showFingerGuide = false
    },

    // 切换条件类型
    switchConditionType(type) {
      this.accessConditionType = type
      this.$emit('type-change', type)
    },

    // 切换编辑模式
    toggleEditMode() {
      this.isEditMode = true
      // 保存原始数据用于取消时恢复
      this.originalConditions = JSON.parse(JSON.stringify(this.accessConditionData))
    },

    // 取消编辑
    cancelEdit() {
      this.isEditMode = false
      // 恢复原始数据
      if (this.originalConditions) {
        this.accessConditionData = this.originalConditions
      }
    },

    // 保存条件
    saveConditions() {
      if (this.accessConditionType === 1) {
        // 按标签配置模式
        const treeRef = this.$refs.accessConditionTreeRef
        if (treeRef) {
          const formData = treeRef.getFormData()
          const selectedIds = treeRef.getLabelListIds()
          const selectedConditions = treeRef.getLabelListConditions()

          const result = {
            type: 1,
            formData,
            selectedIds,
            selectedConditions
          }

          this.$emit('save', result)
          this.isEditMode = false
        }
      } else if (this.accessConditionType === 2) {
        // 自由组合模式
        const formulaRef = this.$refs.accessConditionFormulaRef
        if (formulaRef) {
          const formData = formulaRef.getFormData()

          const result = {
            type: 2,
            formData
          }

          this.$emit('save', result)
          this.isEditMode = false
        }
      }
    },

    // 处理条件变更
    handleConditionChange(condition, parentNode) {
      this.$emit('condition-change', condition, parentNode)
    },

    // 处理条件详情显示
    handleShowDetail(condition) {
      this.$emit('show-detail', condition)
    },

    // 处理公式变更
    handleFormulaChange(formula) {
      this.$emit('formula-change', formula)
    },

    // 获取当前数据
    getFormData() {
      if (this.accessConditionType === 1) {
        const treeRef = this.$refs.accessConditionTreeRef
        return treeRef ? treeRef.getFormData() : null
      } else if (this.accessConditionType === 2) {
        const formulaRef = this.$refs.accessConditionFormulaRef
        return formulaRef ? formulaRef.getFormData() : null
      }
      return null
    },

    // 设置数据
    setFormData(data) {
      this.accessConditionData = data
    },

    // 设置条件类型
    setConditionType(type) {
      this.accessConditionType = type
    },

    // 文件上传相关方法
    showFileUploadDialog(condition) {
      this.currentCondition = condition
      this.showFileUpload = true
    },

    onFileRead(fileData) {
      if (this.currentCondition) {
        this.currentCondition.attachment = {
          name: fileData.name,
          url: fileData.url || URL.createObjectURL(fileData.file),
          size: fileData.file.size
        }
        this.currentCondition.status = 'manual'
        this.showFileUpload = false
        this.currentCondition = null
      }
    },

    previewFile(attachment) {
      this.previewFileUrl = attachment.url
      this.previewFileName = attachment.name
      this.showFilePreview = true
    },

    cancelConfirmation(condition) {
      condition.status = 'error'
      if (condition.attachment) {
        delete condition.attachment
      }
    },

    confirmSatisfaction(condition) {
      this.currentCondition = condition
      this.showFileUpload = true
    },

    // 处理确认满足事件
    handleConfirmSatisfaction(condition) {
      this.$emit('confirm-satisfaction', condition)
    },

    // 处理取消确认事件
    handleCancelConfirmation(condition) {
      this.$emit('cancel-confirmation', condition)
    },

    // 处理预览文件事件
    handlePreviewFile(file) {
      this.$emit('preview-file', file)
    },

    // 处理上传附件事件
    handleUploadAttachment(condition) {
      this.$emit('upload-attachment', condition)
    }
  },
  beforeDestroy() {
    // 清理定时器
    if (this.fingerGuideTimer) {
      clearTimeout(this.fingerGuideTimer)
    }
  }
}
</script>

<style lang="less" scoped>
.access-condition-manager {
  .access-conditions-wrapper {
    min-height: 300px;
    padding: 14px;
    background-color: #f8f9fa;
    border-radius: 8px;
    overflow: hidden;

    // 手指引导样式
    .finger-guide {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: fadeInOut 3s ease-in-out;
      pointer-events: none;

      .finger-guide-icon {
        width: 80px;
        height: 80px;
        animation: slideLeftRight 2s infinite ease-in-out;
      }

      .guide-text {
        margin-top: 12px;
        font-size: 16px;
        font-weight: bold;
        color: #333;
        text-align: center;
        background: rgba(255, 255, 255, 0.9);
        padding: 8px 16px;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }

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

  // 手指引导动画
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    80% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
  }

  @keyframes slideLeftRight {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-15px);
    }
    75% {
      transform: translateX(15px);
    }
  }
}

.file-preview-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;

    h3 {
      margin: 0;
    }

    .van-icon {
      cursor: pointer;
      font-size: 18px;
    }
  }

  .preview-content {
    flex: 1;
    padding: 16px;

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;

      .van-icon {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
