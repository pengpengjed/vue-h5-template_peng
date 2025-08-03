<template>
  <div class="cs-module-list">
    <div class="header">
      <span>关于我们</span>
      <van-icon class="btn-close" name="cross" @click="onCloseClick" />
    </div>
    <div class="content">
      <div class="logo-wrap">
        <img src="../theme/images/app_logo.png" alt="" class="logo" />
        <span class="app-name"
          >南航智飞 <span class="appVersion">v{{ appVersion }}</span></span
        >
      </div>
      <div class="text1">飞行千里万里 | 服务零距离</div>
      <div class="text-wrap">
        <div class="text2"><span class="weight">服务</span> 如影随形</div>
        <div class="text2">零距离<span class="weight">贴心</span>守护</div>
        <div class="text2">让每一次飞行都成为温馨记忆</div>
        <div class="text2">延伸服务触角，只为与您更近一步</div>
      </div>
      <img src="../theme/images/air.png" alt="" class="airimg" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CsAbout',
  data() {
    return {
      appVersion: '0.0.2'
    }
  },
  created() {
    this.init()
  },
  methods: {
    onCloseClick() {
      this.$emit('close')
    },
    init() {
      if (this.isInApp) {
        this.$native.EmasInformation.getInformation().then(data => {
          this.appVersion = data.appVersion
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.content {
  background-image: url('../theme/images/aboutUs.png');
  background-size: cover;
  padding: 20px 20px 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  .logo-wrap {
    display: flex;
    align-items: center;
    .logo {
      width: 60px;
      height: 60px;
    }
    .appVersion {
      font-size: 12px;
      margin-left: 5px;
    }
    .app-name {
      font-size: 26px;
      color: #0a336c;
      margin-left: 20px;
      font-weight: bold;
      letter-spacing: 3px;
    }
  }
  .text1 {
    color: #7d97bc;
    font-size: 16px;
    letter-spacing: 4px;
  }
  .text2 {
    color: #0a336c;
    font-size: 15px;
    letter-spacing: 2px;
    margin-top: 10px;
    .weight {
      font-size: 18px;
      font-weight: bold;
      color: #638dfd;
    }
  }
  .airimg {
    width: 120px;
  }
}
</style>
