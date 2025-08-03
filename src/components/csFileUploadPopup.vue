<template>
  <van-popup
    v-model="popupVisible"
    class="cs-file-upload-popup choose-uplpad-way-dialog"
    position="bottom"
    get-container="body"
  >
    <div class="head">
      <span></span>
      <span class="title">上传</span>
      <span @click="popupVisible = false">取消</span>
    </div>
    <div class="container">
      <div class="item" @click="onDialogFileClick"><i class="icon file"></i><span>上传文件</span></div>
      <div class="item" @click="onDialogPhotoClick">
        <template v-if="isInApp"> <i class="icon image"></i><span>上传图片</span> </template>
        <template v-else>
          <van-uploader ref="uploader" :after-read="onRead" :accept="isRelease ? 'image/*' : '*'">
            <i class="icon image"></i><span>上传图片</span>
          </van-uploader>
        </template>
      </div>
    </div>
  </van-popup>
</template>

<script>
import FileUtil from '../utils/fileUtil'
import ImageUtil from '../utils/imageUtil'
import AttachmentUtil from '../utils/attachmentUtil'
export default {
  name: 'csFileUploadPopup',
  props: {
    isCompressImageFileType: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: false
    },
    // 匹配附件文件类型
    acceptExts: {
      type: Array,
      default: () => ['png', 'jpg', 'jpeg', 'xls', 'xlsx', 'doc', 'docx', 'pdf']
    },
    // 单个文件限制大小
    limitSize: {
      type: Number,
      default: 30
    }
  },
  data() {
    return {
      popupVisible: false,
      fileList: []
    }
  },
  methods: {
    onDialogFileClick() {
      // 点击原生接口上传文件事件
      if (this.isInApp) {
        this.chooseFile()
      } else {
        this.alertMessage('不在APP内不能选择文件')
      }
      this.popupVisible = false
    },
    onDialogPhotoClick() {
      // 点击上传图片事件
      if (this.isInApp) {
        this.chooseImage()
      }
      this.popupVisible = false
    },
    isValidFileType(fileName) {
      // 判断文件是否可上传
      const fileExtend = FileUtil.getFileExtend(fileName)
      if (fileExtend) {
        for (let i = 0, len = this.acceptExts.length; i < len; i++) {
          if (this.acceptExts[i] === fileExtend) {
            return true
          }
        }
      } else {
        return false
      }
    },
    isVideoType(item) {
      let isVideo = false
      const white = ['mp4', 'MP4', 'mov', 'MOV', 'hevc', 'HEVC']
      const fileExtend = FileUtil.getFileExtend(item.fileName)
      if (white.includes(fileExtend)) {
        isVideo = true
      }
      return isVideo
    },
    chooseFile() {
      AttachmentUtil.chooseFile(this.limitSize)
        .then(res => {
          if (res.length) {
            const item = res[0]
            if (!this.isValidFileType(item.fileName)) {
              this.alertMessage('不支持该类型的文件上传')
              return
            }
            if (this.isCompressImageFileType) {
              this.readFile(item, !this.isVideoType(item))
              return
            }
            this.readFile(item, false)
          }
        })
        .catch(() => {})
    },
    chooseImage() {
      AttachmentUtil.chooseImage(this.limitSize)
        .then(res => {
          if (res.length) {
            const item = res[0]
            if (!this.isValidFileType(item.fileName)) {
              this.alertMessage('不支持该类型的文件上传')
              return
            }
            if (this.isCompressImageFileType) {
              this.readFile(item, !this.isVideoType(item))
              return
            }
            this.readFile(item, true)
          }
        })
        .catch(() => {})
    },
    onRead(file) {
      // H5选择附件后回调函数
      const uploadFile = file.file
      if (!this.isValidFileType(uploadFile.name)) {
        this.alertMessage('不支持该类型的文件上传')
        return
      }
      if (uploadFile.type.indexOf('image') !== -1) {
        // 压缩上传图片
        ImageUtil.compressImage(uploadFile, uploadFile.name)
          .then(res => {
            this.$emit('read-file', {
              name: uploadFile.name,
              file: res.file,
              url: res.previewUrl
            })
          })
          .catch(() => {
            this.alertMessage('图片压缩失败，请重试')
          })
      } else {
        this.$emit('read-file', {
          name: uploadFile.name,
          file: uploadFile
        })
      }
    },
    readFile(item, isImage = false) {
      console.log(item)
      // 读取文件二进制流，转换成File用于上传
      const file = FileUtil.getFileByBase64(item.base64File, item.fileName)

      if (isImage) {
        // 添加图片压缩
        ImageUtil.compressImage(file, item.fileName)
          .then(res => {
            this.$emit('read-file', {
              name: item.fileName,
              file: res.file,
              url: res.previewUrl,
              path: item.path
            })
          })
          .catch(() => {
            this.alertMessage('图片压缩失败，请重试')
          })
      } else {
        this.$emit('read-file', {
          name: item.fileName,
          file: file,
          url: item.rawName, // 记住文件路径，用于预览文件
          path: item.path
        })
      }
    }
  },
  watch: {
    value(newValue) {
      this.popupVisible = newValue
    },
    popupVisible(newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>
