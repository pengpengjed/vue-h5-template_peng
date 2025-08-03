import Vue from "vue";
import iflyUtil from "./iflyUtil";
const VueBase = Vue.prototype;

const attachmentUtil = {
  viewAttachment: function (file) {
    if (!file.fileUrl) {
      VueBase.hideLoading();
      setTimeout(() => {
        VueBase.alertMessage("找不到文件路径");
      }, 300);
      return;
    }
    if (!file.fileId) {
      file.fileId = new Date().getTime();
    }
    // 记录原文件名
    file.rawFileName = file.fileName;
    file.fileName = this.getFileName(file.fileName);

    if (VueBase.isInApp) {
      // ios传相对路径，android传绝对路径
      this.getSaveFilePath(file.filePath).then(filePath => {
        file.filePath = filePath;

        let saveFileName = `${file.filePath}${file.fileName}`;
        VueBase.$native.File.getSavedFileInfo({ filePath: saveFileName })
          .then(() => {
            // 先删除已存在同路径的文件
            VueBase.$native.File.removeSavedFile({ filePath: saveFileName })
              .then(res => {
                console.log("删除文件成功", res);
                this.downloadFile(file);
              })
              .catch(err => {
                console.log("删除文件失败", err);
                this.downloadFile(file);
              });
          })
          .catch(err => {
            console.log("不存在文件", err);
            // 不存在文件，直接下载
            this.downloadFile(file);
          });
      });
    } else {
      // 用于调试接口
      this.downloadFile(file);
    }
  },
  viewFile(file) {
    // 20240509 杨工要求跟e家的方式一样，安卓（pdf应用内打，其它第三方应用打开），苹果（全部应用内打开）
    let openMode = "inside"; // 默认应用内打开
    let fileExt = VueBase.$fileUtil.getFileExtend(file.fileName);
    if (VueBase.$utility.isAndroid() && fileExt !== "pdf") {
      // 安卓，除pdf格式都使用第三方应用打开
      openMode = "outside";
    }

    VueBase.$native.File.openDocument({
      filePath: `${file.filePath}${file.fileName}`,
      openMode
    })
      .then(() => {
        VueBase.hideLoading();
      })
      .catch(res => {
        VueBase.hideLoading();
        VueBase.alertMessage(res.error);
      });
  },
  downloadFile: function (file) {
    if (!VueBase.isInApp) {
      // 开发环境对接口进行调试
      // 临时目录里的文件，采用旧方案下载
      if (file.fileUrl.indexOf("/tempfile") !== -1) {
        this.deleteTempFile(file);
        VueBase.hideLoading();
        VueBase.alertMessage("不在APP内，不支持查看附件");
      } else {
        // 接口返回文件流的方式，使用blob的方式下载
        VueBase.$http
          .fetchBlob({
            url: file.fileUrl
          })
          .then(blob => {
            VueBase.$fileUtil.downloadBlob(blob, file.fileName);
            VueBase.hideLoading();
          })
          .catch(() => {
            VueBase.hideLoading();
          });
      }

      return;
    }

    // 文件下载地址
    let downUrl = "";
    const headers = { "content-type": "application/json" };
    if (iflyUtil.isIflyRequest(file.fileUrl)) {
      // 天健系统附件下载
      // 设置url
      const iflyWebApiHost = window.$localStorage.getItem(VueBase.$storeKeys.iflyWebApiHost);
      downUrl = `${iflyWebApiHost || VueBase.$env.VUE_APP_IFLY_HOST}${file.fileUrl}`;
      // 用户token
      const token = window.$sessionStorage.getItem(VueBase.$storeKeys.iflyToken);
      headers["IFLY-TOKEN"] = token;
      // 关联用户
      const relateUser = window.$localStorage.getItem(VueBase.$storeKeys.relateUser);
      if (relateUser && relateUser.iflyRelateToken) {
        headers["RELEVANCE-TOKEN"] = relateUser.iflyRelateToken;
      }
    } else {
      // 飞行门户附件下载
      // 设置url
      if (file.fileUrl.indexOf("http") === -1) {
        const webApiHost = window.$localStorage.getItem(VueBase.$storeKeys.webApiHost);
        downUrl = `${webApiHost || VueBase.$env.VUE_APP_HOST}${file.fileUrl}`;
      } else {
        downUrl = file.fileUrl;
      }
      // 用户token
      const token = window.$sessionStorage.getItem(VueBase.$storeKeys.iebToken);
      headers.staffNum = VueBase.userId;
      headers.token = token;
    }

    // 调原生接口下载附件
    VueBase.$native.EmasNetwork.downloadFile({
      fileId: file.fileId,
      directory: file.filePath,
      fileName: file.fileName,
      header: headers,
      unZip: false,
      deleteZip: false,
      timeout: 180000,
      url: this.getDownUrl(downUrl),
      method: "GET",
      progressEventName: "eplmDownloadFileProgress"
    })
      .then(() => {
        VueBase.hideLoading();
        this.deleteTempFile(file);
        this.viewFile(file);
      })
      .catch(res => {
        console.log("附件下载失败", res);
        VueBase.hideLoading();
        this.deleteTempFile(file);
        VueBase.alertMessage(res.error);
      });
  },
  getDownUrl(url) {
    // IOS需要转码
    // if (VueBase.$utility.isAndroid()) {
    //   return url;
    // } else {
    //   return encodeURI(url);
    // }
    // 智飞App都需要encode
    return encodeURI(url);
  },
  getFileName(fileName) {
    // 应用内打开，安卓pdf类型且文件名带有%的附件有问题，需把%去掉
    let fileExt = VueBase.$fileUtil.getFileExtend(fileName);
    if (VueBase.$utility.isAndroid() && fileExt === "pdf" && fileName.indexOf("%") !== -1) {
      try {
        // 尝试解码
        fileName = decodeURI(fileName);
      } catch {
        // 解码失败，直接把%字符去掉
        fileName = fileName.replace(/%/g, "");
      }
      // 判断转换之后是否没有文件名
      // 没有文件名，生成随机文件名
      if (fileName.indexOf(".") === 0) {
        fileName = `${new Date().getTime()}${fileName}`;
      }
      return fileName;
    } else {
      return fileName;
    }
  },
  getSaveFilePath: async function (filePath) {
    // ios传相对路径，android传绝对路径
    return new Promise(resolve => {
      // if (Utility.isAndroid()) {
      VueBase.$native.File.getDirectory({ private: true })
        .then(res => {
          let directory = res.directory;
          // console.log("getDirectory", directory);
          resolve(`${directory}/${filePath}`);
        })
        .catch(() => {
          resolve(filePath);
        });
      // } else {
      //   resolve(filePath);
      // }
    });
  },
  getFileUrl(file) {
    return new Promise(resolve => {
      resolve(file);
    });
  },
  deleteTempFile(file) {
    // 不是临时目录里的文件，不需要调接口删除
    if (!file.fileUrl || file.fileUrl.indexOf("/tempfile") === -1) {
      return;
    }

    VueBase.$http
      .post(
        VueBase.$api.base.deleteTempFile,
        {
          url: file.fileUrl
        },
        { fileKey: file.fileKey }
      )
      .then(() => { })
      .catch(() => { });
  },
  listAppSharedFile() {
    return this.chooseFile();
  },
  chooseFile(limitSize = 30) {
    // 选择文件
    return new Promise((resolve, reject) => {
      VueBase.$native.File.chooseFile({})
        .then(res => {
          // console.log("chooseFile", res);
          if (res.tempFiles && res.tempFiles.length) {
            let tempFile = res.tempFiles[0];
            // 单个限制大小
            const fileSize = limitSize * 1024 * 1024;
            if (tempFile.size > fileSize) {
              VueBase.alertMessage(`单个文件大小不能超过${limitSize}M`);
              reject("文件超过大小限制");
              return;
            }
            console.log("chooseFile", res);
            this.getContentFormFile(tempFile)
              .then(fileList => {
                resolve(fileList);
              })
              .catch(err => {
                reject(err);
              });

            // VueBase.$native.File.getContentFormFile({
            //   fileName: tempFile.name,
            //   directory: tempFile.path.replace(`/${tempFile.name}`, "") // 返回的路径包含文件名，需把文件名去掉
            // })
            //   .then(contentRes => {
            //     console.log("getContentFormFile", contentRes);
            //     let fileList = [
            //       {
            //         base64File: contentRes.content,
            //         fileName: tempFile.name,
            //         rawName: tempFile.name
            //       }
            //     ];
            //     console.log("fileList", fileList);
            //     resolve(fileList);
            //   })
            //   .catch(err => {
            //     reject(err);
            //   });
          } else {
            reject(res);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  chooseImage(limitSize = 30) {
    // 选择图片
    return new Promise((resolve, reject) => {
      VueBase.$native.EmasImage.chooseImage({ count: 1, sourceType: ["album", "camera"], compressLimit: 0 })
        .then(res => {
          // console.log("chooseImage", res);
          if (res.tempFiles && res.tempFiles.length) {
            let tempFile = res.tempFiles[0];
            // 单个限制大小
            const fileSize = limitSize * 1024 * 1024;
            if (tempFile.size > fileSize) {
              VueBase.alertMessage(`单个文件大小不能超过${limitSize}M`);
              reject("文件超过大小限制");
              return;
            }
            this.getContentFormFile(tempFile)
              .then(fileList => {
                resolve(fileList);
              })
              .catch(err => {
                reject(err);
              });
          } else {
            reject(res);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  getContentFormFile(tempFile) {
    return new Promise((resolve, reject) => {
      VueBase.$native.File.getContentFormFile({
        fileName: tempFile.name,
        directory: tempFile.path.replace(`/${tempFile.name}`, "") // 返回的路径包含文件名，需把文件名去掉
      })
        .then(contentRes => {
          // console.log("getContentFormFile", contentRes);
          // android返回的文件名格式为 "原始文件名_串号.扩展名"，现需返加原始文件名
          if (VueBase.$utility.isAndroid()) {
            let startIndex = tempFile.name.lastIndexOf("_");
            if (startIndex !== -1) {
              let endIndex = tempFile.name.lastIndexOf(".");
              let fileExt = tempFile.name.substring(endIndex);
              tempFile.name = `${tempFile.name.substring(0, startIndex)}${fileExt}`;
            }
          }

          let fileList = [
            {
              base64File: contentRes.content,
              fileName: tempFile.name,
              rawName: tempFile.name,
              size: tempFile.size,
              url: tempFile.url,
              path: tempFile.path
            }
          ];
          // console.log("fileList", fileList);
          resolve(fileList);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  previewFile(filePath) {
    this.getSaveFilePath(filePath).then(saveFilePath => {
      VueBase.$native.File.openDocument({
        filePath: saveFilePath
        // openMode: VueBase.$utility.isAndroid() ? "outside" : "inside" // inside, outside
      });
    });
  }
};

export default attachmentUtil;
