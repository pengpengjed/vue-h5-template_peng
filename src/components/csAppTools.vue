<template>
  <div class="cs-app-tools">
    <div class="cs-app-tools-item" @click="onScanClick">
      <van-icon name="scan" @click="onScanClick" /> <span>扫一扫</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CsAppTools',
  methods: {
    onScanClick() {
      this.getQrCode().then(data => {
        this.$root.$emit('app-scan', data)
      })
      this.$emit('close')
    },
    getQrCode() {
      return new Promise((resolve, reject) => {
        // 调原生扫码
        if (this.isInApp) {
          this.$native.EmasBarcodeScanner.scan({ class: 'qrcode' })
            .then(res => {
              // let result = res.scan_result ? JSON.parse(res.scan_result) : {};
              // 如果扫描结果为对象字符串则自动转为对象
              let result = res.scan_result || ''
              try {
                let obj = JSON.parse(result)
                result = obj
              } catch (err) {
                //
              }
              resolve(result)
            })
            .catch(err => {
              reject(err)
            })
        } else {
          let err = '不在App内，不能扫一扫'
          this.alertMessage(err)
          reject(err)
        }
      })
    }
  }
}
</script>

<style lang="less">
.cs-app-tools {
  padding: 0 0 0 16px;
  .cs-app-tools-item {
    border-bottom: 1px solid #e8e8e8;
    padding: 8px 10px 8px 0;
    .van-icon {
      margin-right: 5px;
      vertical-align: middle;
    }
    &:last-child {
      border-bottom: 0;
    }
  }
}
</style>
