import EXIF from 'exif-js'
import FileUtil from './fileUtil'
// import { ImagePreview } from "vant";
import 'vant/lib/image-preview/style'

const imageUtil = {
  compressImage(file, fileName) {
    return new Promise((resolve, reject) => {
      EXIF.getData(file, function () {
        let orientation = EXIF.getTag(this, 'Orientation')

        const reader = new FileReader()
        const image = new Image()

        reader.readAsDataURL(file)
        reader.onload = function (e) {
          const maxLength = 1920 // 图像大小
          const quality = 0.8 // 图像质量
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          image.src = e.target.result
          image.onload = function () {
            let imageWidth = this.width
            let imageHeight = this.height

            if (imageWidth > maxLength || imageHeight > maxLength) {
              // 压缩图片
              if (imageWidth > maxLength) {
                imageHeight = maxLength * (imageHeight / imageWidth)
                imageWidth = maxLength
              }
              if (imageHeight > maxLength) {
                imageWidth = maxLength * (imageWidth / imageHeight)
                imageHeight = maxLength
              }
            }
            // 修复ios上传图片的时候 被旋转的问题
            if (!orientation) orientation = 1
            if (orientation === 6 && imageWidth < imageHeight) {
              // 如果是旋转了90度，但是图片宽度少于图片高度的话，不旋转（竖拍）
              orientation = 1
            }
            // debugger
            switch (orientation) {
              case 6:
                canvas.width = imageHeight
                canvas.height = imageWidth
                context.rotate(Math.PI / 2)
                context.drawImage(this, 0, -imageHeight, imageWidth, imageHeight)
                break
              case 8:
                canvas.width = imageHeight
                canvas.height = imageWidth
                context.rotate((3 * Math.PI) / 2)
                context.drawImage(this, -imageWidth, 0, imageWidth, imageHeight)
                break
              case 3:
                canvas.width = imageWidth
                canvas.height = imageHeight
                context.rotate(Math.PI)
                context.drawImage(this, -imageWidth, -imageHeight, imageWidth, imageHeight)
                break
              case 1:
              default:
                canvas.width = imageWidth
                canvas.height = imageHeight
                context.drawImage(this, 0, 0, imageWidth, imageHeight)
                break
            }

            const dataUrl = canvas.toDataURL(file.type, quality)
            const blob = FileUtil.dataURItoBlob(dataUrl)
            const newFile = FileUtil.blobToFile(blob, fileName || file.name, file.type)
            resolve({
              previewUrl: dataUrl,
              file: newFile
            })
          }
          image.onerror = function (err) {
            reject(err)
          }
        }
      })
    })
  },
  previewImageByUrl(url) {
    window.vant.ImagePreview({
      images: [url],
      showIndex: false
    })
  },
  previewImageByFile(file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = e => {
      window.vant.ImagePreview({
        images: [e.target.result],
        showIndex: false
      })
    }
  }
}

export default imageUtil
