<template>
  <van-cell class="cs-file-uploader van-cell-vertical" :title="title" :required="required">
    <div class="file-accept-tips" v-if="!disabled">
      <slot name="tip">
        <div>支持类型：{{ acceptExts.join(', ') }}</div>
      </slot>
    </div>
    <template v-if="from === 'pad'">
      <div class="file-list">
        <template v-if="fileList.length">
          <div class="file-list-item" v-for="(item, index) in fileList" :key="item.id" @click="onFileClick(item)">
            <slot name="file-item" :file="item">
              {{ item.name }}
            </slot>
            <i v-if="!disabled" class="button-delete" @click.stop="onRemoveClick(item, index)"></i>
          </div>
        </template>
        <div class="button" v-if="!disabled" @click="onUploadClick"><van-icon name="add-o" />点击上传附件</div>
      </div>
    </template>
    <template v-else>
      <div class="button" v-if="!disabled" @click="onUploadClick"><van-icon name="add-o" />点击上传附件</div>
      <div class="file-list" v-if="fileList.length">
        <div class="file-list-item" v-for="(item, index) in fileList" :key="item.id" @click="onFileClick(item)">
          <slot name="file-item" :file="item">
            {{ item.name }}
          </slot>
          <i v-if="!disabled" class="button-delete" @click.stop="onRemoveClick(item, index)"></i>
        </div>
      </div>
    </template>

    <div v-if="disabled && (!fileList || !fileList.length)" class="no-data-tips">— 暂无数据 —</div>

    <cs-file-upload-popup
      v-model="popupVisible"
      :accept-exts="acceptExts"
      @read-file="onReadFile"
      :limitSize="limitSize"
    ></cs-file-upload-popup>
  </van-cell>
</template>

<script>
export default {
  name: 'csFileUploader',
  props: {
    title: {
      type: String,
      default: ''
    },
    // 设置是否必填
    required: {
      type: Boolean,
      default: false
    },
    value: {
      type: [Array, Object], // {name: '', file: null, url: ''}
      default: function () {
        return []
      }
    },
    // 匹配附件文件类型
    acceptExts: {
      type: Array,
      default: () => ['png', 'jpg', 'jpeg', 'xls', 'xlsx', 'doc', 'docx', 'pdf']
    },
    // 最大文件上传数据数量限制，0为无限上传
    limit: {
      type: Number,
      default: 0
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否允许文件名重复
    isAllowRepetition: {
      type: Boolean,
      default: false
    },
    // 单个文件限制大小
    limitSize: {
      type: Number,
      default: 30
    },
    // 总上传文件限制大小
    limitTotalSize: {
      type: Number,
      default: 50
    },
    from: {
      type: String,
      default: 'app'
    }
  },
  data() {
    return {
      popupVisible: false,
      fileList: [],
      removeFileList: []
    }
  },
  created() {
    this.initFileList()
  },
  methods: {
    // 重设数据（为避免多次操作附件时数据冲突，可能需手动调此方法）
    reset() {
      this.initFileList()
      this.removeFileList = []
    },
    initFileList() {
      if (this.value) {
        if (Array.isArray(this.value)) {
          let fileList = []
          this.value.forEach(item => {
            let newValue = Object.assign({ status: 'success', id: new Date().getTime() }, item)
            fileList.push(newValue)
          })
          this.fileList = fileList
        } else {
          let newValue = Object.assign({ status: 'success', id: new Date().getTime() }, this.value)
          this.fileList = [newValue]
        }
      }
    },
    onUploadClick() {
      if (this.limit && this.fileList.length >= this.limit) {
        // 有文件数据量限制
        this.alertMessage('已达到文件上传数量限制')
        return
      }
      this.popupVisible = true
    },
    onFileClick(item) {
      this.$emit('file-preview', item)
    },
    onRemoveClick(item, index) {
      if (item.status === 'success') {
        this.removeFileList.push(item)
      }
      this.fileList.splice(index, 1)
      this.emitInputEvent()
      this.$emit('change', this.fileList)
    },
    onReadFile(file) {
      // 判断文件名是否有重复
      if (!this.isAllowRepetition) {
        let isExist = false
        for (let item of this.fileList) {
          if (item.name === file.name) {
            isExist = true
            break
          }
        }
        if (isExist) {
          this.alertMessage('文件已存在')
          return
        }
      }
      if (this.fileList.length) {
        const limitTotalSize = this.limitTotalSize * 1024 * 1024
        const total = this.fileList.reduce((total, fileItem) => {
          if (fileItem.file && fileItem.file.size) {
            return total + fileItem.file.size
          }
        }, file.file.size)
        if (total > limitTotalSize) {
          this.alertMessage(`上传总文件大小不能超过${this.limitTotalSize}M`)
          return
        }
      }
      // 添加文件到列表
      file.status = 'ready'
      file.id = new Date().getTime()
      this.fileList.push(file)
      this.emitInputEvent()
      this.$emit('change', this.fileList, file)
    },
    getFileList() {
      return this.fileList
    },
    getRemoveFiles() {
      return this.removeFileList
    },
    getUploadFiles() {
      let uploadFiles = []
      this.fileList.forEach(item => {
        if (item.status === 'ready') {
          uploadFiles.push(item)
        }
      })
      return uploadFiles
    },
    emitInputEvent() {
      this.$emit('input', this.fileList)
    }
  },
  watch: {
    value: {
      deep: true,
      handler() {
        this.initFileList()
      }
    }
  }
}
</script>

<style lang="less">
.cs-file-uploader {
  .file-accept-tips {
    font-size: 12px;
    color: #ff9c2c;
    line-height: 17px;
    padding: 3px 5px;
  }
  .van-cell__value {
    background-color: #ffffff;
    padding: 6px 10px;
    border-radius: 4px;
    .button {
      height: 36px;
      margin: 10px 0;
      line-height: 36px;
      border-radius: 18px;
      background-color: #ffffff;
      color: #4591fe;
      text-align: center;
      border: 1px solid #e8e8e8;
      .van-icon {
        margin-right: 10px;
        font-size: 18px;
        vertical-align: middle;
        margin-top: -5px;
      }
    }
  }
  .file-list {
    .file-list-item {
      position: relative;
      line-height: 18px;
      padding: 5px;
      padding-left: 25px;
      padding-right: 30px;
      color: #3788fe;
      margin: 5px 0;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-size: 12px;
      text-align: left;
      &::before {
        content: '';
        display: block;
        width: 18px;
        height: 18px;
        position: absolute;
        left: 4px;
        top: 4px;
        background: url('../theme/images/icon_attachment.png') no-repeat center center transparent;
        background-size: cover;
      }
      .button-delete {
        display: block;
        width: 16px;
        height: 16px;
        position: absolute;
        right: 0px;
        top: 3px;
        padding: 3px 5px;
        &::before {
          content: '';
          display: block;
          width: 16px;
          height: 16px;
          background: url('../theme/images/icon_delete.png') no-repeat center center transparent;
          background-size: cover;
        }
      }
    }
  }
}
</style>
