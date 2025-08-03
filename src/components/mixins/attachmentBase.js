// import { fileInformation } from "../../utils/cordovaApi";
// import Utility from "../../utils/utility";
import attachmentUtil from "../../utils/attachmentUtil";

export default {
  name: "AttachmentBase",
  methods: {
    viewAttachment(file) {
      // this.$toast.loading({
      //   message: "请稍候",
      //   duration: 0
      // });
      this.showLoading("正在加载", false);

      this.getFileUrl(file)
        .then(res => {
          // if (!res.url) {
          //   this.alertMessage("找不到文件路径");
          //   return;
          // }
          file.fileUrl = res.url;
          file.size = res.size;
          attachmentUtil.viewAttachment(file);
        })
        .catch(res => {
          this.$toast.clear();
          this.alertMessage(res.resultDesc);
        });

      // if (!file.fileId) {
      //   file.fileId = new Date().getTime();
      // }

      // file.directoryKey = `ATTACHMENT_DIRECTORY_${file.fileId}`;
      // const directory = window.$localStorage.getItem(file.directoryKey);
      // if (directory) {
      //   file.filePath = file.filePath.replace(`/${file.fileId}/`, `/${directory}/`);
      // }

      // this.downloadMessage = "";
      // if (this.isRelease) {
      //   this.$native.FileManager.listFile({ fileDir: file.filePath })
      //     .then(() => {
      //       // this.viewFile(file)
      //       this.$native.FileManager.deleteFile({ fileDir: file.filePath })
      //         .then(() => {
      //           this.downloadFile(file);
      //         })
      //         .catch(() => {
      //           this.downloadFile(file);
      //         });
      //     })
      //     .catch(() => {
      //       this.downloadFile(file);
      //     });
      // } else {
      //   // 用于调试接口
      //   this.downloadFile(file);
      // }
    },
    // viewFile(file) {
    //   this.$native.FileManager.viewFile({ fileDir: `${file.filePath}${file.fileName}` })
    //     .then(() => {
    //       this.$toast.clear();
    //     })
    //     .catch(res => {
    //       this.$toast.clear();
    //       this.alertMessage(res.error);
    //     });
    // },
    // downloadFile(file) {
    //   this.getFileUrl(file)
    //     .then(res => {
    //       if (!res.url) {
    //         this.alertMessage("找不到文件路径");
    //         return;
    //       }
    //       file.fileUrl = res.url;
    //       file.size = res.size;

    //       // // 获取旧目录
    //       // let oldDirectory = window.$localStorage.getItem(file.directoryKey);
    //       // if (!oldDirectory) {
    //       //   oldDirectory = file.fileId;
    //       // }
    //       // // 设置新目录
    //       // const newDirectory = new Date().getTime(); // Utility.newGuid();
    //       // window.$localStorage.setItem(file.directoryKey, newDirectory);

    //       // file.filePath = file.filePath.replace(`/${oldDirectory}/`, `/${newDirectory}/`);

    //       if (!this.isRelease) {
    //         this.deleteTempFile(file);
    //         this.$toast.clear();
    //         this.alertMessage("不在APP内，不支持查看附件");
    //         return;
    //       }

    //       this.$native.FileManager.downFile({
    //         fileId: file.fileId,
    //         fileName: `${file.filePath}${file.fileName}`,
    //         downUrl: `${this.$env.VUE_APP_FILE_HOST || this.$env.VUE_APP_HOST}${file.fileUrl}`,
    //         totalLength: file.size
    //       })
    //         .then(() => {
    //           this.deleteTempFile(file);
    //           this.viewFile(file);
    //         })
    //         .catch(res => {
    //           this.deleteTempFile(file);
    //           this.$toast.clear();
    //           this.alertMessage(res.error);
    //         });
    //     })
    //     .catch(res => {
    //       this.$toast.clear();
    //       this.alertMessage(res.resultDesc);
    //     });
    // },
    getFileUrl(file) {
      return new Promise(resolve => {
        resolve(file);
      });
    },
    // deleteTempFile(file) {
    //   this.$http
    //     .post(
    //       this.$api.base.deleteTempFile,
    //       {
    //         url: file.fileUrl
    //       },
    //       { fileKey: file.fileKey }
    //     )
    //     .then(() => {})
    //     .catch(() => {});
    // },
    listAppSharedFile() {
      // return new Promise((resolve, reject) => {
      //   this.$native.FileInformation.getFileArray({
      //     count: "1",
      //     justImage: "false",
      //     isBase64: "true"
      //   })
      //     .then(res => {
      //       let data = res.data || res;
      //       data = data.ret || data;
      //       const fileList = data.filelist || data;
      //       resolve(fileList);
      //     })
      //     .catch(res => {
      //       reject(res);
      //     });
      // });
      return attachmentUtil.listAppSharedFile();
    },
    previewFile(filePath) {
      // this.$native.FileInformation.previewFile({ filePath });
      attachmentUtil.previewFile(filePath);
    }
  }
};
