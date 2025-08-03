<template>
  <van-cell class="apply-form-attachment">
    <div slot="title" v-if="showTitle">{{ titleText || "附件" }}</div>
    <div class="container" :class="{ 'table-view': tableView, 'view-only': !uploadable }">
      <div class="head" v-if="uploadable">
        <div class="button" @click="onSelectClick(null)"><van-icon name="add-o" size="18px" />点击上传附件</div>
      </div>
      <!-- 如果允许上传或者有接口返回的数据则展示 -->
      <ul class="attachment-list" v-if="componentAttachmentList.length || uploadable">
        <!--查看附件列表-->
        <li v-for="(item, index) in componentAttachmentList" :key="index" class="attachment-item active">
          <div @click="onAttachmentClick(item)">{{ item.fileName }}</div>
          <van-icon v-if="removeable" name="delete" class="btn-clear" @click.stop="onRemoveAttachment(item, index)" />
        </li>

        <!--上传附件列表-->
        <template v-if="uploadable">
          <li v-for="(item, index) in fileList" :key="index" class="attachment-item" :class="{ active: item.file }">
            <div @click="onUploadItemClick(item)">{{ item.file ? item.file.name : item.name }}</div>
            <van-icon v-if="item.file" name="delete" class="btn btn-clear" @click.stop="onRemoveFileItem(item, index)" />
            <van-icon v-else name="add" class="btn btn-add" @click.stop="onSelectClick(index)"></van-icon>
          </li>
        </template>
      </ul>
      <div class="nodata-tip" v-if="!fileList.length && !attachmentList.length">暂无附件</div>
      <div class="upload-remark" v-if="uploadable">支持类型：{{ acceptExts.join(", ") }}</div>
    </div>

    <van-popup v-model="dialogVisible" class="choose-uplpad-way-dialog" position="bottom" get-container="body">
      <div class="head">
        <span></span>
        <span class="title">上传</span>
        <span @click="dialogVisible = false">取消</span>
      </div>
      <div class="container">
        <div class="item" @click="onDialogFileClick"><i class="icon file"></i><span>上传文件</span></div>
        <div class="item" @click="onDialogPhotoClick">
          <!-- <van-uploader ref="uploader" :after-read="onRead" :accept="isRelease ? 'image/*' : '*'">
            <i class="icon image"></i><span>上传图片</span>
          </van-uploader> -->
          <template v-if="isInApp"> <i class="icon image"></i><span>上传图片</span> </template>
          <template v-else>
            <van-uploader ref="uploader" :after-read="onRead" :accept="isRelease ? 'image/*' : '*'">
              <i class="icon image"></i><span>上传图片</span>
            </van-uploader>
          </template>
        </div>
      </div>
    </van-popup>
  </van-cell>

  <!-- <van-popup v-model="popupVisible" position="right" class="files-popup" get-container="body" :overlay="false">
      <div class="popup-files-body">
        <van-nav-bar title="文件列表" left-arrow @click-left="onNavBarClickLeft" :fixed="false">
          <van-uploader ref="uploader" :after-read="onRead" slot="right">
            <van-icon name="photograph" size="20px" />
          </van-uploader>
        </van-nav-bar>
        <div class="content">
          <van-loading v-if="sharedFileLoading" class="shared-file-loading" />
          <template v-else>
            <van-cell-group v-if="sharedFileList.length">
              <van-cell
                v-for="(item, index) in sharedFileList"
                :key="index"
                :title="item.fileName"
                @click="onSharedFileItemClick(item)"
              >
                <div slot="label" class="file-label">
                  <span>{{ item.createDate }}</span>
                  <span>{{ item.fileSize }}</span>
                </div>
              </van-cell>
            </van-cell-group>
            <div class="nodata-tip" v-else>
              <span>暂无文件</span>
            </div>
          </template>
        </div>
      </div>
    </van-popup> -->
</template>

<script>
import AttachmentBase from "./mixins/attachmentBase";
import FileUtil from "../utils/fileUtil";
import ImageUtil from "../utils/imageUtil";
import AttachmentUtil from "../utils/attachmentUtil";

export default {
  name: "ApplyFormFileUploader",
  mixins: [AttachmentBase],
  props: {
    //上传附件接口地址
    url: {
      type: String
    },
    // 标题名称
    titleText: {
      type: String
    },
    // 附件列表数据
    attachmentList: {
      type: Array,
      default: () => []
    },
    // 训练申请表单数据，用于训练申请的附件下载
    form: {
      type: Object,
      default: () => {}
    },
    // 是否可以上传
    uploadable: {
      type: Boolean,
      default: false
    },
    // 表格视图
    tableView: {
      type: Boolean,
      default: true
    },
    // 是否显示标题
    showTitle: {
      type: Boolean,
      default: true
    },
    // 必需上传的附件列表，用于训练申请附件上传
    requiredFiles: {
      type: Array,
      default: () => []
    },
    // 是否可以删除附件
    removeable: {
      type: Boolean,
      default: false
    },
    maxCount: {
      type: Number
    },
    // 匹配附件文件类型
    acceptExts: {
      type: Array,
      default: () => ["png", "jpg", "jpeg", "xls", "xlsx", "doc", "docx", "pdf"]
    },
    // 自定义获取附件路径方法，返回Promise
    fileUrlLoader: {
      type: Function
    },
    // 附件存在APP的目录
    attachmentDirectory: {
      type: String,
      default: "applyForm"
    },
    // 附件文件ID字段
    fileIdField: {
      type: String
    },
    // 附件文件名称字段
    fileNameField: {
      type: String,
      default: "attachmentTemplateName"
    },
    // 是否物理删除
    physicsDelete: {
      type: Boolean,
      default: true
    },
    // 自定义附件删除处理事件，返回Promise
    removeAttachmentHandler: {
      type: Function
    },
    // 是否判断文件名重复
    repeat: {
      type: Boolean,
      default: false
    },
    // 是否是历史记录
    history: {
      type: Boolean,
      default: false
    },
    // 是否是模拟机
    isSimulator: {
      type: Boolean,
      default: false
    },
    // 单个文件限制大小
    limitSize: {
      type: Number,
      default: 30,
    },
    // 总上传文件限制大小
    limitTotalSize: {
      type: Number,
      default: 50,
    },
  },
  data() {
    return {
      componentAttachmentList: [], // 附件列表
      fileList: [], // 文件列表
      imageList: [], // 图片列表
      dialogVisible: false, // 弹出框显示
      // popupVisible: false,
      // sharedFileList: [],
      // sharedFileLoading: false,
      requiredFileIndex: null, // 必须上传的附件序号
      removeFileList: [] //已上传附件被删除的列表
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      // 组件数据初始化
      this.componentAttachmentList = this.attachmentList;
      const fileList = [];
      if (this.requiredFiles && this.requiredFiles.length) {
        this.requiredFiles.forEach(item => {
          fileList.push({
            name: item[this.fileNameField],
            templateName: item[this.fileNameField],
            required: true,
            file: null
          });
        });
      }
      const uploadFiles = [];
      this.fileList.forEach(item => {
        if (!item.required) {
          uploadFiles.push(item);
        }
      });
      this.fileList = [...fileList, ...uploadFiles];
    },
    onRead(file) {
      // H5选择附件后回调函数
      const uploadFile = file.file;
      if (this.requiredFileIndex !== null) {
        this.fileList[this.requiredFileIndex].file = uploadFile;
        this.popupVisible = false;
      } else {
        if (!this.isValidFileType(uploadFile.name)) {
          this.alertMessage("不支持该类型的文件上传");
          return;
        }
        if (uploadFile.type.indexOf("image") !== -1) {
          // 压缩上传图片
          ImageUtil.compressImage(uploadFile, this.getFileName(uploadFile))
            .then(res => {
              this.fileList.push({
                name: uploadFile.name,
                required: false,
                file: res.file,
                previewUrl: res.previewUrl
              });
              this.$nextTick(() => {
                this.popupVisible = false;
              });
            })
            .catch(err => {
              console.log(err);
              this.alertMessage("图片压缩失败，请重试");
            });
        } else {
          if (this.repeat) {
            const repeatArr = this.fileList.filter(el => {
              return el.name === uploadFile.name;
            });
            if (repeatArr.length) {
              this.alertMessage("请勿重复提交文件名相同的文件");
              return;
            }
          }
          this.fileList.push({
            name: uploadFile.name,
            required: false,
            file: uploadFile
          });
          this.popupVisible = false;
        }
      }
    },
    onSelectClick(index) {
      if (index === null && this.maxCount) {
        if (this.fileList.length >= this.maxCount) {
          this.alertMessage("已达到附件上传的最大数");
          return;
        }
      }
      // 选择按钮事件
      this.requiredFileIndex = index;
      // this.popupVisible = true;
      this.dialogVisible = true;
    },
    onDialogFileClick() {
      // 点击原生接口上传文件事件
      if (this.isInApp) {
        this.chooseFile();
      } else {
        this.alertMessage("不在APP内不能选择文件");
      }
      this.dialogVisible = false;
    },
    onDialogPhotoClick() {
      // 点击上传图片事件
      if (this.isInApp) {
        this.chooseImage();
      }
      this.dialogVisible = false;
    },
    // loadAppFiles() {
    //   // 调用原生接口选择文件
    //   // this.sharedFileLoading = true;
    //   this.listAppSharedFile()
    //     .then(res => {
    //       // this.listSharedFileMessage = '列表文件成功: ' + JSON.stringify(res)
    //       // const data = res;
    //       // data.forEach(item => {
    //       //   item.fileSize = FileUtil.getFileSize(item.fileLength);
    //       // });
    //       // this.sharedFileList = data;
    //       console.log("已选择文件列表", res);
    //       if (res.length) {
    //         const item = res[0];
    //         if (!this.isValidFileType(item.fileName)) {
    //           this.alertMessage("不支持该类型的文件上传");
    //           return;
    //         }
    //         this.readFile(item);
    //       }
    //     })
    //     .catch(() => {
    //       // this.listSharedFileMessage = '列表文件失败: ' + JSON.stringify(res)
    //       // this.sharedFileList = [];
    //     })
    //     .finally(() => {
    //       // this.sharedFileLoading = false;
    //     });
    // },
    chooseFile() {
      AttachmentUtil.chooseFile(this.limitSize)
        .then(res => {
          if (res.length) {
            const item = res[0];
            if (!this.isValidFileType(item.fileName)) {
              this.alertMessage("不支持该类型的文件上传");
              return;
            }
            if(this.fileList.length){
              const limitTotalSize = this.limitTotalSize * 1024 * 1024;
              const total = this.fileList.reduce((total,fileItem)=>{
                  if(fileItem.file && fileItem.file.size){
                    return total + fileItem.file.size
                  }
              },item.size)
              if(total > limitTotalSize){
                this.alertMessage(`上传总文件大小不能超过${this.limitTotalSize}M`);
                return;
              }
            }
            this.readFile(item);
          }
        })
        .catch(() => {});
    },
    chooseImage() {
      AttachmentUtil.chooseImage(this.limitSize)
        .then(res => {
          if (res.length) {
            const item = res[0];
            if (!this.isValidFileType(item.fileName)) {
              this.alertMessage("不支持该类型的文件上传");
              return;
            }
            if(this.fileList.length){
              const limitTotalSize = this.limitTotalSize * 1024 * 1024;
              const total = this.fileList.reduce((total,fileItem)=>{
                  if(fileItem.file && fileItem.file.size){
                    return total + fileItem.file.size
                  }
              },item.size)
              if(total > limitTotalSize){
                this.alertMessage(`上传总文件大小不能超过${this.limitTotalSize}M`);
                return;
              }
            }
            this.readFile(item);
          }
        })
        .catch(() => {});
    },
    onUploadItemClick(item) {
      // 上传文件点击事件
      if (!item.file) return;
      if (item.filePath) {
        this.previewFile(item.filePath);
      } else if (item.file.type.indexOf("image") !== -1) {
        if (item.previewUrl) {
          ImageUtil.previewImageByUrl(item.previewUrl);
        } else {
          ImageUtil.previewImageByFile(item.file);
        }
      }
    },
    // onSharedFileItemClick(item) {
    //   if (!this.isValidFileType(item.fileName)) {
    //     this.alertMessage("不支持该类型的文件上传");
    //     return;
    //   }
    //   this.readFile(item);
    // },
    readFile(item) {
      // 读取文件二进制流，转换成File用于上传
      // this.loadContentOfFile(item.filePath)
      //   .then(data => {
      const file = FileUtil.getFileByBase64(item.base64File, item.fileName);
      if (this.requiredFileIndex !== null) {
        this.fileList[this.requiredFileIndex].file = file;
        this.fileList[this.requiredFileIndex].filePath = item.rawName; // 记住文件路径，用于预览文件
      } else {
        if (this.repeat) {
          const repeatArr = this.fileList.filter(el => {
            return el.name === item.fileName;
          });
          if (repeatArr.length) {
            this.alertMessage("请勿重复提交文件名相同的文件");
            return;
          }
        }
        this.fileList.push({
          name: item.fileName,
          required: false,
          file: file,
          filePath: item.rawName // 记住文件路径，用于预览文件
        });
      }
      // })
      // .catch(() => {
      //   this.alertMessage("读取文件失败");
      // })
      // .finally(() => {
      //   this.popupVisible = false;
      // });
    },
    onRemoveAttachment(item, index) {
      // 删除已上传附件事件
      this.$dialog.confirm({
        title: "提示",
        message: "您确定要删除附件吗？",
        beforeClose: (action, done) => {
          if (action === "confirm") {
            if (this.physicsDelete) {
              // 物理删除附件
              // 自定义删除事件
              if (this.removeAttachmentHandler) {
                this.removeAttachmentHandler(item)
                  .then(() => {
                    this.componentAttachmentList.splice(index, 1);
                    done();
                  })
                  .catch(res => {
                    done();
                    this.alertMessage(res.message);
                  });
              } else {
                // 默认训练附件删除
                let url, params;
                if (this.isSimulator) {
                  url = this.$api.trainApply.deleteSimTrainApproveFileBySelf;
                  params = {
                    staffNum: this.userId,
                    attachSimId: item.attachSimId
                  };
                } else {
                  url = this.$api.trainApply.deleteTrainApproveFileBySelf;
                  params = {
                    staffNum: this.userId,
                    trainPlanApplyFilesId: item.trainPlanApplyFilesId
                  };
                }
                this.$http
                  .post(url, params)
                  .then(() => {
                    this.componentAttachmentList.splice(index, 1);
                    done();
                  })
                  .catch(res => {
                    done();
                    this.alertMessage(res.message);
                  });
              }
            } else {
              // 只删除附件列表数据
              this.removeFileList.push(item);
              this.componentAttachmentList.splice(index, 1);
              done();
            }
          } else {
            done();
          }
        }
      });
    },
    // 获取删除已上传的文件
    getRemoveFiles() {
      return this.removeFileList;
    },
    onRemoveFileItem(item, index) {
      // 删除未上传附件事件
      this.$dialog
        .confirm({
          title: "提示",
          message: "您确定要删除附件吗？"
        })
        .then(() => {
          if (item.required) {
            item.file = null;
          } else {
            this.fileList.splice(index, 1);
          }
        })
        .catch(() => {});
    },
    isValidFileType(fileName) {
      // 判断文件是否可上传
      const fileExtend = FileUtil.getFileExtend(fileName);
      if (fileExtend) {
        for (let i = 0, len = this.acceptExts.length; i < len; i++) {
          if (this.acceptExts[i] === fileExtend) {
            return true;
          }
        }
      } else {
        return false;
      }
    },
    getFileName(file) {
      // 存在相同的名称，自动添加相应数字
      let fileName = file.name;
      const index = fileName.lastIndexOf(".");
      const name = fileName.substring(0, index);
      const ext = fileName.substring(index);

      let maxCount = 0;
      this.fileList.forEach(item => {
        if (item.name === fileName) {
          if (item.file.name === fileName && maxCount === 0) {
            maxCount = 1;
          } else {
            const tmpIndex =
              parseInt(
                item.file.name
                  .replace(name, "")
                  .replace(ext, "")
                  .replace("_", "")
              ) + 1;
            if (maxCount < tmpIndex) {
              maxCount = tmpIndex;
            }
          }
        }
      });
      if (maxCount > 0) {
        fileName = `${name}_${maxCount < 10 ? "0" + maxCount : maxCount}${ext}`;
      }
      return fileName;
    },
    upload(file) {
      // 上传附件
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file, file.name);
        this.$http
          .postFormData(this.url, formData)
          .then(res => {
            resolve(res);
          })
          .catch(err => reject(err));
      });
    },
    getFiles() {
      // 获取已选择的附件列表
      const files = [];
      const uploadFiles = [...this.fileList, ...this.imageList];
      uploadFiles.forEach(item => {
        if (item.file) {
          files.push(item.file);
        }
      });
      return files;
    },
    getAttachmentList() {
      // 获取已上传的附件列表
      return this.componentAttachmentList;
    },
    checkValid() {
      // 检查文件是否合法
      for (let i = 0, len = this.fileList.length; i < len; i++) {
        if (!this.fileList[i].file) {
          return false;
        }
      }
      return true;
    },
    // 查看附件
    onAttachmentClick(item) {
      const fileId = this.fileIdField ? item[this.fileIdField] : item.trainPlanApplyFilesId || item.attachSimId;
      const file = {
        fileId: fileId,
        fileName: item.fileName,
        filePath: `downloadFiles/${this.attachmentDirectory}/${fileId}/`,
        fileUrl: "",
        size: 0,
        rawData: item
      };
      this.viewAttachment(file);
    },
    getFileUrl(file) {
      // 获取附件路径，用于调原生接口下载
      if (this.fileUrlLoader) {
        return new Promise((resolve, reject) => {
          this.fileUrlLoader(file)
            .then(res => {
              resolve(res);
            })
            .catch(err => {
              reject(err);
            });
        });
      } else {
        return new Promise((resolve, reject) => {
          const url = !this.isTrainEvaluate
            ? this.$api.trainApply[this.history ? "downloadTrainApplyFileHistory" : "downloadTrainApplyFile"]
            : this.$api.trainApply.downloadZhftcApproveFile;
          const params = {
            staffNum: this.form.empid || this.form.staffID,
            fileName: file.fileName,
            [!this.isTrainEvaluate ? "trainPlanApplyFilesId" : "attachSimId"]: file.fileId
          };

          this.$http
            .post(url, params)
            .then(res => {
              resolve(res);
            })
            .catch(res => {
              reject(res);
            });
        });
      }
    }
  },
  computed: {
    isTrainEvaluate() {
      // 是否是训练评估
      return this.form && this.form.zhftcSimuInfoList;
    }
  },
  watch: {
    uploadable(newValue) {
      // 监视是否可上传字段
      if (!newValue) {
        this.fileList = [];
        this.imageList = [];
      } else {
        this.init();
      }
    },
    requiredFiles() {
      // 监视必须上传文件字段
      this.init();
    },
    attachmentList() {
      // 监视附件列表字段
      this.componentAttachmentList = this.attachmentList;
    }
  }
};
</script>

<style lang="less">
.apply-form-attachment {
  /* background-color: #f5f5f5;
  margin-bottom: 11px; */
  position: relative;
  flex-direction: column;
  .container {
    text-align: left;
  }
  .head {
    display: flex;
    margin-top: 10px;
    .button {
      flex: 1;
      padding: 5px;
      border: 1px solid #ecf4ff;
      background-color: #ffffff;
      text-align: center;
      color: #3889ff;
      border-radius: 4px;
      .van-icon {
        vertical-align: middle;
        margin-top: -3px;
        margin-right: 5px;
      }
    }
  }
  .attachment-list {
    list-style: none;
    text-align: left;
    .attachment-item {
      background-color: #ffffff;
      border-bottom: 1px solid #ecf4ff;
      border-radius: 4px;
      // margin: 5px 0;
      padding: 8px 5px;
      display: flex;
      flex-direction: row;
      line-height: 22px;
      align-items: center;
      color: #202533;
      & > div {
        flex: 1;
        word-break: break-all;
        .active {
          color: #246ecc;
        }
      }
      .btn {
        font-size: 18px;
        line-height: 18px;
        vertical-align: middle;
        padding: 2px 5px;
        margin-right: -5px;
        &.btn-clear {
          color: #d43f3a;
        }
        &.btn-add {
          color: #5cb85c;
        }
      }
      &.active {
        color: #3889ff;
      }
    }
  }
  .upload-remark {
    padding: 8px 5px;
    // background-color: #ffffff;
    font-size: 13px;
    color: #696f79;
  }
  .view-only {
    .attachment-list {
      border: 1px solid #c0c0c0;
      border-radius: 2px;
      margin-top: 5px;
      padding: 5px 5px 5px 30px;
      &::before {
        content: "";
        width: 16px;
        height: 16px;
        display: block;
        position: absolute;
        left: 12px;
        top: 18px;
        background: url("../theme/images/attachment.png") no-repeat center center transparent;
        background-size: cover;
      }
      .attachment-item {
        position: relative;
        color: #3889ff;
        margin: 0;
        padding: 5px 5px 5px 5px;
        border-bottom: 0px;
      }
    }
  }
}

.choose-uplpad-way-dialog {
  .head {
    display: flex;
    flex-direction: row;
    line-height: 50px;
    & > span {
      font-size: 16px;
      color: #aeb3bf;
      padding: 0 15px;
      width: 50px;
      text-align: center;
      &.title {
        color: #202533;
        flex: 1;
      }
    }
  }
  .container {
    display: flex;
    flex-direction: row;
    .item {
      flex: 1;
      margin: 20px;
      border-radius: 4px;
      padding: 5px;
      text-align: center;
      color: #202533;
      font-size: 14px;
      .icon {
        width: 44px;
        height: 44px;
        margin: 10px auto;
        display: block;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        &.image {
          background-image: url("../theme/images/uploader_image.png");
        }
        &.file {
          background-image: url("../theme/images/uploader_file.png");
        }
      }
      span {
        display: block;
      }
    }
  }
}

.apply-form-attachment:not(.table-view) .head .button button {
  margin-top: -3px;
  height: 24px;
  line-height: 22px;
  min-width: unset;
}
.apply-form-attachment:not(.table-view) .head .button button .van-icon {
  font-size: 16px;
  line-height: 22px;
}
// .apply-form-attachment .van-cell .van-cell__title {
//   word-break: break-all;
// }
// .apply-form-attachment .van-cell .van-cell__value {
//   width: 60px;
//   flex: none;
// }
// .apply-form-attachment .van-cell .van-cell__value .btn-clear {
//   font-size: 18px;
//   line-height: 18px;
//   vertical-align: middle;
//   color: #d43f3a;
// }
.apply-form-attachment .van-cell.active .van-cell__title {
  color: #246ecc;
}
.apply-form-attachment .van-cell.nodata-tip .van-cell__title {
  text-align: center;
  color: #888888;
}
.apply-form-attachment .button-cell {
  font-size: 14px;
  line-height: 24px;
  background-color: #fff;
  padding: 10px 15px;
  text-align: center;
  /* border-top: 1px solid #f5f5f5; */
}
.apply-form-attachment .button-cell .van-icon {
  vertical-align: middle;
  margin-top: -3px;
}
.apply-form-attachment.table-view {
  margin: 10px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  overflow: hidden;
}
.apply-form-attachment.table-view .head {
  padding: 10px 15px;
  background-color: #f5f5f5;
}
.apply-form-attachment.table-view .upload-remark {
  background-color: #fbfbfb;
  padding: 6px 12px;
}
.apply-form-attachment.table-view.view-only .van-cell-group {
  margin-bottom: -1px;
}
.apply-form-attachment .van-button {
  height: 24px;
  min-width: unset;
  font-size: 13px;
  line-height: 22px;
}
.apply-form-attachment .van-button .van-icon {
  font-size: 16px;
  line-height: 22px;
}
/*.apply-form-attachment .image-list {
  overflow: hidden;
  margin: 0px;
  padding: 10px 15px;
  background-color: #ffffff;
}
.apply-form-attachment .image-list .image-list-item {
  float: left;
  padding: 5px;
  position: relative;
}
.apply-form-attachment .image-list .image-list-item > img {
  border-radius: 8px;
  width: 80px;
  height: 80px;
  display: block;
}
.apply-form-attachment .image-list .image-list-item > .van-icon-clear {
  position: absolute;
  right: -3px;
  top: -3px;
  color: #969799;
  font-size: 18px;
  background-color: #ffffff;
  display: block;
  line-height: 16px;
  border-radius: 100%;
}
.apply-form-attachment .image-list .image-list-item > .van-uploader {
  width: 80px;
  height: 80px;
  text-align: center;
  line-height: 80px;
  background-color: #e8e8e8;
  border-radius: 8px;
}
.apply-form-attachment .image-list .image-list-item > .van-uploader .van-icon {
  font-size: 30px;
  line-height: 30px;
  vertical-align: middle;
  color: #999999;
}*/
// .files-popup {
//   width: 100%;
//   height: 100%;
//   box-sizing: border-box;
// }
// .files-popup .van-nav-bar {
//   background-color: #3697de;
// }
// .files-popup .van-nav-bar .van-icon-arrow-left,
// .files-popup .van-nav-bar .van-nav-bar__title,
// .files-popup .van-nav-bar .van-icon {
//   color: #ffffff;
// }
// .files-popup .popup-files-body {
//   /* padding-top: 46px; */
//   position: relative;
//   display: flex;
//   flex-direction: column;
//   align-items: flex-start;
//   height: 100%;
//   overflow: hidden;
// }
// .files-popup .popup-files-body .van-nav-bar {
//   width: 100%;
//   box-sizing: border-box;
// }
// .files-popup .popup-files-body .content {
//   width: 100%;
//   flex: 1;
//   overflow: auto;
//   box-sizing: border-box;
// }
// .files-popup .popup-files-body .file-label {
//   display: flex;
// }
// .files-popup .popup-files-body .file-label > span {
//   flex: 1;
// }
// .files-popup .popup-files-body .file-label > span:last-of-type {
//   text-align: right;
// }
// .files-popup .popup-files-body .shared-file-loading {
//   text-align: center;
//   display: block;
//   width: 100%;
//   margin: 23px 0;
// }
// .files-popup .nodata-tip {
//   padding: 15px 15px;
//   text-align: center;
//   color: #888888;
// }
// .apply-form-attachment .debug-message {
//   padding: 10px;
//   word-break: break-all;
//   color: #555555;
//   line-height: 20px;
// }
</style>
