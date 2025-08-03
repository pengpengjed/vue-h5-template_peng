import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

const fileMime = {
  png: 'image/png',
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf'
}

const fileUtil = {
  getFileSize(size) {
    if (!size) {
      return ''
    }

    const num = 1024.0

    if (size < num) {
      return size + ' B'
    }
    if (size < Math.pow(num, 2)) {
      return (size / num).toFixed(2) + ' KB'
    }
    if (size < Math.pow(num, 3)) {
      return (size / Math.pow(num, 2)).toFixed(2) + ' MB'
    }
    if (size < Math.pow(num, 4)) {
      return (size / Math.pow(num, 3)).toFixed(2) + ' GB'
    }
    return (size / Math.pow(num, 4)).toFixed(2) + ' TB'
  },
  getFileExtend(fileName) {
    let ext = ''
    const index = fileName.lastIndexOf('.')
    if (index !== -1) {
      ext = fileName.substring(index + 1).toLowerCase()
    }
    return ext
  },
  getFileType(fileName) {
    const fileExtend = fileUtil.getFileExtend(fileName)
    return fileMime[fileExtend]
  },
  arrayBufferToBlob(buffer, type) {
    return new Blob([buffer], { type: type })
  },
  base64ToBlob: function (baseString, type) {
    baseString = atob(baseString)
    var buffer = new ArrayBuffer(baseString.length)
    var uintArr = new Uint8Array(buffer)
    for (var i = 0; i < baseString.length; i++) {
      uintArr[i] = baseString.charCodeAt(i)
    }
    return new Blob([buffer], { type })
  },
  dataURItoBlob: function (dataURI) {
    const tmpArray = dataURI.split(',')
    var byteString = atob(tmpArray[1])
    var mimeString = tmpArray[0].split(':')[1].split(';')[0]
    var buffer = new ArrayBuffer(byteString.length)
    var uintArr = new Uint8Array(buffer)
    for (var i = 0; i < byteString.length; i++) {
      uintArr[i] = byteString.charCodeAt(i)
    }
    return new Blob([buffer], { type: mimeString })
  },
  blobToFile(blob, fileName, fileType) {
    const file = new File([blob], fileName, { type: fileType, lastModified: Date.now() })
    return file
  },
  getFileByBase64(baseString, fileName) {
    const fileType = fileUtil.getFileType(fileName)
    const blob = fileUtil.base64ToBlob(baseString, fileType)
    return fileUtil.blobToFile(blob, fileName, fileType)
  },
  htmlToPDF(el, options = {}) {
    return new Promise((resolve, reject) => {
      html2canvas(el, Object.assign({ allowTaint: true }, options))
        .then(canvas => {
          const contentWidth = canvas.width
          const contentHeight = canvas.height
          const pageHeight = (contentWidth / 592.28) * 841.89
          let leftHeight = contentHeight
          let position = 0
          const imgWidth = 595.28
          const imgHeight = (592.28 / contentWidth) * contentHeight
          const pageData = canvas.toDataURL('image/jpeg', 1.0)
          const PDF = new JsPDF('', 'pt', 'a4')
          if (leftHeight < pageHeight) {
            PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
          } else {
            while (leftHeight > 0) {
              PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
              leftHeight -= pageHeight
              position -= 841.89
              if (leftHeight > 0) {
                PDF.addPage()
              }
            }
          }
          resolve(PDF)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  PDFToFile(PDF, fileName) {
    const dataURI = PDF.output('datauristring')
    const blob = fileUtil.dataURItoBlob(dataURI)
    return fileUtil.blobToFile(blob, fileName, fileMime.pdf)
  },
  downloadBlob(blob, fileName) {
    // 创建blob链接
    const url = URL.createObjectURL(blob)
    // 创建超链接进行自动点击下载
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.style.display = 'none'
    a.href = url
    a.download = fileName
    a.click()
    // 销毁元素
    window.$(a).remove()
    // 释放blob链接
    URL.revokeObjectURL(url)
  }
}

export default fileUtil
