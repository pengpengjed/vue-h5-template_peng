<template>
  <div class="cs-image-upload">
    <div class="cs-image-upload__value">
      <slot name="imageUploader" :data="imageList">
        <van-loading size="24px" v-if="loading">加载中...</van-loading>
        <ul class="image-list">
          <!--已上传图片列表-->
          <li class="image-list-item" v-for="(item, index) in uploadedImageList" :key="item.id">
            <van-image
              class="image"
              :src="item[urlField]"
              @click="onImagePreview(index, true)"
              fit="cover"
              radius="8px"
            ></van-image>
            <span class="icon" :class="{ active: item.checked }" v-if="checked">
              <van-icon name="success" @click="checkedClick(item, index)" />
            </span>
            <van-icon name="clear" @click="onUploadedImageRemove(item, index)" v-if="!disabled" />
          </li>
          <!--未上传图片列表-->
          <template v-if="!disabled">
            <li class="image-list-item" v-for="(item, index) in imageList" :key="index">
              <van-image class="image" :src="item.url" @click="onImagePreview(index, false)" fit="cover" radius="8px" />
              <van-icon name="clear" @click="onImageRemove(index)" />
            </li>
            <li class="image-list-item" v-if="isCanUpload">
              <template v-if="isInApp">
                <div class="van-uploader" @click="onAddImageClick"><van-icon name="plus" /></div>
              </template>
              <template v-else>
                <van-uploader :after-read="onImageRead">
                  <slot name="uploader">
                    <van-icon name="plus" />
                  </slot>
                </van-uploader>
              </template>
            </li>
          </template>
        </ul>
      </slot>
    </div>

    <div class="cs-image-upload__desc" v-if="$slots.desc">
      <slot name="desc"></slot>
    </div>
  </div>
</template>

<script>
import ImageUtil from '../utils/imageUtil'
import FileUtil from '../utils/fileUtil'
import AttachmentUtil from '../utils/attachmentUtil'
export default {
  name: 'ImageUploader',
  // components: {
  //   VanImage
  // },
  props: {
    // 设置是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 设置是否可选
    checked: {
      type: Boolean,
      default: false
    },
    // 设置是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 设置图片地址字段
    urlField: {
      type: String,
      default: 'url'
    },
    // 设置上传的图片列表
    uploadedImages: {
      type: Array,
      default: () => []
    },
    // 设置删除图片处理方法
    removeImageHandler: {
      type: Function // 返回Promise
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
    // 最大文件数量
    maxCount: {
      type: Number
    },
    // beforeReadFile接收参数(data，done)，回调done(false)不添加到图片列表
    beforeReadFile: {
      type: Function
    }
  },
  data() {
    return {
      uploadedImageList: [],
      imageList: [],
      removeImageList: []
    }
  },
  created() {
    this.uploadedImageList = [...this.uploadedImages]
  },
  methods: {
    // 重设数据（为避免多次操作附件时数据冲突，可能需手动调此方法）
    reset() {
      this.uploadedImageList = [...this.uploadedImages]
      this.removeImageList = []
    },
    onAddImageClick() {
      this.chooseImage()
    },
    chooseImage() {
      AttachmentUtil.chooseImage(this.limitSize)
        .then(res => {
          const item = res[0]
          if (this.imageList.length) {
            const limitTotalSize = this.limitTotalSize * 1024 * 1024
            const total = this.imageList.reduce((total, fileItem) => {
              if (fileItem.file && fileItem.file.size) {
                return total + fileItem.file.size
              }
            }, item.size)
            if (total > limitTotalSize) {
              this.alertMessage(`上传总文件大小不能超过${this.limitTotalSize}M`)
              return
            }
          }
          if (res.length) {
            const item = res[0]
            this.readFile(item)
          }
        })
        .catch(() => {})
    },
    readFile(item) {
      // 读取文件二进制流，转换成File用于上传
      const file = FileUtil.getFileByBase64(item.base64File, item.fileName)
      ImageUtil.compressImage(file, item.fileName).then(data => {
        this.appendImage(data)
      })
    },
    onImageRead(res) {
      // console.log("图片选择", res);
      if (Array.isArray(res)) {
        // IOS图库可以选择多张
        for (const item of res) {
          const fileName = this.getFileName(item.file)
          ImageUtil.compressImage(item.file, fileName).then(data => {
            this.appendImage(data)
          })
        }
      } else {
        const fileName = this.getFileName(res.file)
        ImageUtil.compressImage(res.file, fileName).then(data => {
          this.appendImage(data)
        })
      }
    },
    appendImage(data) {
      const done = res => {
        if (res !== false) {
          this.imageList.push({
            url: data.previewUrl,
            file: data.file
          })
          this.$emit('change', this.imageList)
        }
      }

      if (this.beforeReadFile) {
        this.beforeReadFile(data, done)
      } else {
        done()
      }
    },
    getFileName(file) {
      const ext = FileUtil.getFileExtend(file.name)
      return `${new Date().getTime()}.${ext}`
    },
    onImagePreview(index, isUploaded) {
      const images = []
      this.uploadedImageList.forEach(item => {
        images.push(item[this.urlField])
      })
      this.imageList.forEach(item => {
        images.push(item.url)
      })

      window.vant &&
        window.vant.ImagePreview &&
        window.vant.ImagePreview({
          images,
          showIndex: true,
          startPosition: isUploaded ? index : this.uploadedImageList.length + index
        })
    },
    onImageRemove(index) {
      this.$dialog
        .confirm({
          title: '提示',
          message: '您确定要删除图片吗？'
        })
        .then(() => {
          this.imageList.splice(index, 1)
        })
        .catch(() => {})
    },
    checkedClick(item) {
      item.checked = !item.checked
      this.$emit('checkedClick', item)
    },
    onUploadedImageRemove(item, index) {
      this.$dialog
        .confirm({
          title: '提示',
          message: '您确定要删除图片吗？'
        })
        .then(() => {
          // 添加删除图片列表
          this.removeImageList.push(item)

          if (this.removeImageHandler) {
            this.removeImageHandler(item)
              .then(() => {
                this.uploadedImageList.splice(index, 1)
                this.$nextTick(() => {
                  this.$emit('remove-success', index)
                })
              })
              .catch(err => {
                this.alertMessage(err.message || err)
              })
          } else {
            this.uploadedImageList.splice(index, 1)
            this.$nextTick(() => {
              this.$emit('remove-success', index)
            })
          }
        })
        .catch(() => {})
    },
    getFiles() {
      const files = []
      this.imageList.forEach(item => {
        files.push(item.file)
      })
      return files
    },
    getUploadImages() {
      return this.imageList
    },
    getRemoveImages() {
      return this.removeImageList
    }
  },
  computed: {
    isCanUpload() {
      const uploadedCount = this.uploadedImageList.length + this.imageList.length
      return !this.maxCount || uploadedCount < this.maxCount
    }
  },
  watch: {
    uploadedImages(newValue) {
      this.uploadedImageList = [...newValue]
    }
  }
}
</script>

<style lang="less">
.cs-image-upload {
  .van-loading {
    margin: 20px auto 0;
    display: block;
  }
  .image-list {
    overflow: hidden;
    margin: 0px;
    padding: 8px 5px;
    background-color: #ffffff;

    .image-list-item {
      float: left;
      padding: 5px;
      position: relative;

      & > .image {
        // border-radius: 8px;
        width: 80px;
        height: 80px;
        display: block;
        // background-position: center;
        // background-repeat: no-repeat;
        // background-size: cover;
        // object-fit: cover;
      }
      & > .van-icon-clear {
        position: absolute;
        right: -3px;
        top: 0px;
        color: #d9534f;
        font-size: 18px;
        background-color: #ffffff;
        display: block;
        // line-height: 16px;
        border-radius: 100%;
      }
      .icon {
        &.active {
          background-color: #1989fa;
          border-color: #1989fa;
          .van-icon-success {
            color: #fff;
          }
        }
        position: absolute;
        right: -3px;
        top: 0px;
        font-size: 18px;
        background-color: #ffffff;
        height: 26px;
        line-height: 32px;
        width: 26px;
        text-align: center;
        border-radius: 50%;
        border: 1px solid #f3f3f3;
        .van-icon-success {
          color: #666;
        }
      }
      & > .van-uploader {
        width: 80px;
        height: 80px;
        text-align: center;
        line-height: 80px;
        background-color: #e8e8e8;
        border-radius: 8px;
        .van-uploader__input-wrapper {
          width: 100%;
        }
      }

      & > .van-uploader .van-icon {
        font-size: 40px;
        line-height: 40px;
        vertical-align: middle;
        color: #999999;
      }
    }
  }

  .cs-image-upload__desc {
    margin-left: 10px;
    font-size: 12px;
    color: #67768b;
    line-height: 22px;
  }
}
</style>
