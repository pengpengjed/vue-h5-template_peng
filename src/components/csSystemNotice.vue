<template>
  <div class="cs-system-notice">
    <van-popup
      v-model="popupShow"
      class="cs-system-notice-popup"
      :class="{ 'stop-server': isStopServer }"
      :close-on-click-overlay="false"
      get-container="body"
      :closeable="false"
      close-icon="close"
    >
      <div class="cs-system-notice-popup__header">
        <div class="cs-system-notice-popup__title">
          <template v-if="isStopServer">尊敬的用户：</template>
          <template v-else>{{ currentNotice.title }}</template>
        </div>
        <!-- <div class="cs-system-notice-popup__time">2024-03-10</div> -->
      </div>
      <div class="cs-system-notice-popup__body">
        <!-- 停服公告内容 -->
        <template v-if="isStopServer && !networkStatus">
          <p>当前网络不可用，请检查你的网络设置</p>
        </template>
        <template v-if="isStopServer && networkStatus">
          <h3>系统正在升级中，请稍后再试。</h3>
          <p>如有疑问：请在E家联系飞行门户坐席号(_SSO_T_23012)</p>
        </template>
        <!-- 公告内容 -->
        <template v-else>
          <div class="cs-system-notice-popup__content">{{ currentNotice.content }}</div>
        </template>
        <!-- <div class="notice-time">2024-03-12</div> -->
      </div>
      <div class="cs-system-notice-popup__footer">
        <template v-if="isStopServer">
          <div class="button" @click="onCloseClick">关闭</div>
        </template>
        <template v-else>
          <div class="button" @click="onReadClick">已阅 （{{ showIndex + 1 }}/{{ noticeList.length }}）</div>
        </template>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  name: 'CsSystemNotice',
  props: {},
  data() {
    return {
      popupShow: false,
      isStopServer: false, // 是否是停服公告
      showIndex: 0,
      noticeList: [],
      channel: 3, // 2-移动飞行，3-南航智飞
      networkStatus: true
    }
  },
  mounted() {
    window.addEventListener('online', () => {
      this.networkStatus = true
      console.log('用户重新上线')
    })
    window.addEventListener('offline', () => {
      this.networkStatus = false
      console.log('用户离线')
    })
  },
  methods: {
    onCloseClick() {
      this.popupShow = false
    },
    onReadClick() {
      if (this.showIndex + 1 < this.noticeList.length) {
        this.showIndex++
      } else {
        this.setReaded()
        this.popupShow = false
      }
    },
    load() {
      return new Promise((resolve, reject) => {
        this.$http
          .get({
            url: '/restapp/announcementRestFul/findByAfterLogin',
            data: {
              channel: this.channel
            },
            headers: {
              handleError: false
            }
          })
          .then(data => {
            this.noticeList = data || []
            resolve(data)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    setReaded() {
      let noticeId = []
      this.noticeList.forEach(item => {
        noticeId.push(item.id)
      })
      this.$http
        .put({
          url: '/restapp/announcementRestFul/saveUserWatch',
          data: {
            channel: this.channel,
            watchId: noticeId
          },
          headers: {
            handleError: false
          }
        })
        .catch(() => {})
    },
    show({ isStopServer, isLogin }) {
      // 有loading的toast时，关闭不了dialog，所以弹出dialog时先关掉toast,dialog
      this.$toast.clear()
      this.$dialog.close()

      this.isStopServer = isStopServer
      if (this.isStopServer) {
        this.popupShow = true
      } else {
        // 加载通告数据
        this.load(isLogin)
          .then(() => {
            if (this.noticeList && this.noticeList.length) {
              // 有公告才显示
              this.popupShow = true
            }
          })
          .catch(() => {})
      }
    }
  },
  computed: {
    currentNotice() {
      if (this.noticeList.length) {
        return this.noticeList[this.showIndex]
      } else {
        return {}
      }
    }
  }
}
</script>

<style lang="less">
.cs-system-notice-popup {
  border-radius: 8px;
  width: 80%;
  overflow: visible;
  .van-popup__close-icon--top-right {
    top: unset;
    right: unset;
    font-size: 22px;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    color: #ffffff;
  }
  .cs-system-notice-popup__header {
    height: 80px;
    text-align: center;
    color: #333333;
    background: url('../theme/images/systemNotice/notice_bg_normal.png') no-repeat center center transparent;
    background-size: cover;
    border-radius: 8px 8px 0 0;
  }
  .cs-system-notice-popup__title {
    line-height: 22px;
    padding: 46px 0 0 30px;
    text-align: left;
    font-size: 18px;
  }
  .cs-system-notice-popup__time {
    display: none;
  }
  .cs-system-notice-popup__body {
    font-size: 14px;
    line-height: 1.5;
    // text-indent: 28px;
    padding: 10px 30px 0;
    margin: 10px 0;
    // min-height: 100px;
    max-height: 50vh;
    overflow: auto;
    color: #666666;
    .notice-time {
      text-align: right;
      padding: 5px 0 10px;
    }
  }
  .cs-system-notice-popup__content {
    white-space: break-spaces;
  }
  .cs-system-notice-popup__footer {
    padding: 10px 10px 20px;
    text-align: center;
    .button {
      width: 200px;
      height: 40px;
      background: linear-gradient(90deg, #b0aaf9 0%, #4273ff 100%);
      border-radius: 20px;
      text-align: center;
      color: #ffffff;
      line-height: 40px;
      margin: 0 auto;
    }
  }

  // 升级通告样式1
  &.upgrade1 {
    overflow: visible;
    .cs-system-notice-popup__header {
      height: 150px;
      background-image: url('../theme/images/systemNotice/notice_bg_upgrade_1.png');
      position: relative;
      &::before {
        content: '';
        width: 117px;
        height: 179px;
        display: block;
        background: url('../theme/images/systemNotice/notice_upgrade_icon_1.png') no-repeat center center transparent;
        background-size: cover;
        position: absolute;
        top: -28px;
        right: 39px;
        z-index: 2;
      }
    }
    .cs-system-notice-popup__title {
      width: 110px;
      height: 72px;
      background: url('../theme/images/systemNotice/notice_upgrade_text1.png') no-repeat center center transparent;
      background-size: cover;
      padding: 0;
      position: absolute;
      left: 25px;
      top: 25px;
      color: transparent;
    }
    .cs-system-notice-popup__body {
      margin-top: 0;
    }
  }

  // 升级通告样式2
  &.upgrade2 {
    overflow: visible;
    .cs-system-notice-popup__header {
      height: 150px;
      background-image: url('../theme/images/systemNotice/notice_bg_upgrade_2.png');
      position: relative;
      &::before {
        content: '';
        width: 64px;
        height: 150px;
        display: block;
        background: url('../theme/images/systemNotice/notice_upgrade_icon_2.png') no-repeat center center transparent;
        background-size: cover;
        position: absolute;
        top: -35px;
        right: 46px;
        z-index: 2;
      }
    }
    .cs-system-notice-popup__title {
      width: 132px;
      height: 24px;
      background: url('../theme/images/systemNotice/notice_upgrade_text2.png') no-repeat center center transparent;
      background-size: cover;
      padding: 0;
      position: absolute;
      left: 25px;
      top: 25px;
      color: transparent;
    }
    .cs-system-notice-popup__time {
      color: #ffffff;
      position: absolute;
      left: 25px;
      top: 60px;
      display: block;
    }
    .cs-system-notice-popup__body {
      margin-top: 0;
    }
  }

  // 停服通告样式
  &.stop-server {
    .van-popup__close-icon--top-right {
      display: none;
    }
    .cs-system-notice-popup__header {
      background-image: url('../theme/images/systemNotice/notice_bg_stop.png');
    }
    .cs-system-notice-popup__body {
      text-indent: 0;
      h3 {
        color: #444444;
        margin-bottom: 5px;
        font-size: 15px;
      }
      .notice-time {
        display: none;
      }
    }
  }
}
</style>
