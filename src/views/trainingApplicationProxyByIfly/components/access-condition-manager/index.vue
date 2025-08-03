<template>
  <div class="access-condition-manager">
    <!-- 切换按钮 -->
    <div class="type-switch">
      <div class="switch-container">
        <van-button
          :class="['switch-btn', { active: accessConditionType === 1 }]"
          size="small"
          @click="switchConditionType(1)"
        >
          按标签配置
        </van-button>
        <van-button
          :class="['switch-btn', { active: accessConditionType === 2 }]"
          size="small"
          @click="switchConditionType(2)"
        >
          自由组合
        </van-button>
      </div>
    </div>

    <!-- accessConditionType === 1 -->
    <div class="access-conditions-wrapper" v-if="accessConditionType === 1">
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
    <van-popup v-model="showFileUpload" position="bottom" :style="{ height: '50%' }">
      <div class="file-upload-popup">
        <div class="upload-header">
          <h3>上传佐证材料</h3>
          <van-icon name="cross" @click="showFileUpload = false" />
        </div>
        <div class="upload-content">
          <van-uploader
            v-model="uploadedFiles"
            :max-count="1"
            :max-size="10 * 1024 * 1024"
            :accept="acceptedFileTypes"
            @oversize="onFileOversize"
            @delete="onFileDelete"
          />
          <div class="upload-tips">
            <p>支持格式：PDF、DOC、DOCX、XLS、XLSX、PNG、JPG、JPEG、BMP</p>
            <p>文件大小限制：10MB</p>
          </div>
        </div>
        <div class="upload-actions">
          <van-button type="primary" @click="confirmFileUpload">确认上传</van-button>
          <van-button type="default" @click="showFileUpload = false">取消</van-button>
        </div>
      </div>
    </van-popup>

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
    }
  },
  data() {
    return {
      accessConditionType: this.type,
      accessConditionData: this.data,
      isEditMode: false,
      originalConditions: null,
      // 文件上传相关
      showFileUpload: false,
      showFilePreview: false,
      uploadedFiles: [],
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
      },
      immediate: true
    }
  },
  methods: {
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

    onFileOversize() {
      this.$toast('文件大小不能超过10MB')
    },

    onFileDelete() {
      this.uploadedFiles = []
    },

    confirmFileUpload() {
      if (this.uploadedFiles.length > 0 && this.currentCondition) {
        const file = this.uploadedFiles[0]
        this.currentCondition.attachment = {
          name: file.file.name,
          url: URL.createObjectURL(file.file),
          size: file.file.size
        }
        this.currentCondition.status = 'manual'
        this.showFileUpload = false
        this.uploadedFiles = []
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
  }
}
</script>

<style lang="scss" scoped>
.relationTag {
  border: 1px solid #a5cfb8;
}
.access-condition-manager {
  .type-switch {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    padding: 0 16px;

    .switch-container {
      display: flex;
      background: #f5f5f5;
      border-radius: 6px;
      padding: 2px;
      gap: 0;

      .switch-btn {
        border: none;
        background: transparent;
        color: #666;
        border-radius: 4px;
        transition: all 0.3s ease;
        min-width: 80px;

        &.active {
          background: #fff;
          color: #1989fa;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        &:not(.active):hover {
          color: #333;
        }
      }
    }
  }

  .access-conditions-wrapper {
    min-height: 300px;
    padding: 20px;
    background-color: #f7fcff;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    margin: 0 16px 16px;

    .action-buttons {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: center;
      gap: 12px;

      .edit-actions {
        display: flex;
        gap: 12px;
      }

      .van-button {
        min-width: 80px;
        border-radius: 6px;
      }
    }
  }
}

.file-upload-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .upload-header {
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

  .upload-content {
    flex: 1;
    padding: 16px;

    .upload-tips {
      margin-top: 16px;
      color: #666;
      font-size: 12px;

      p {
        margin: 4px 0;
      }
    }
  }

  .upload-actions {
    padding: 16px;
    display: flex;
    gap: 8px;
    border-top: 1px solid #eee;
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
