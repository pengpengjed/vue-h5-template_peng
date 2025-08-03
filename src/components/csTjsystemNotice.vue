<template>
<transition name="notice">
<van-overlay :show="overlay" v-if="overlay" z-index="99" :lock-scroll="false">
  <div class="cs-system-notice">
      <div class="cs-system-notice-popup__header">
        <div class="cs-system-notice-popup__title">
          <template >{{ currentNotice.noticeTitle }}</template>
        </div>
        <!-- <div class="cs-system-notice-popup__time">2024-03-10</div> -->
      </div>
      <div class="cs-system-notice-popup__body">
        <!-- 公告内容 -->
          <div class="cs-system-notice-popup__content">{{ currentNotice.noticeContent }}</div>
        <!-- <div class="notice-time">2024-03-12</div> -->
      </div>
      <div class="cs-system-notice-popup__footer">
          <div class="button" @click="onReadClick">已阅 （{{ showIndex + 1 }}/{{ noticeList.length }}）</div>
      </div>
  </div>
</van-overlay>
</transition>
</template>

<script>
export default {
  name: "CsTjsystemNotice",
  props: {
    noticeList:{
        type:Array,
        default:()=>[]
    },
    onClose: {
      type: Function,
      default: () => { }
    }
  },
  data() {
    return {
      showIndex: 0,
      popupShow:true,
      overlay:true
    };
  },
  mounted(){
  },
  methods: {
    onReadClick() {
      if (this.showIndex + 1 < this.noticeList.length) {
        this.showIndex++;
        this.setReaded();
      } else {
        this.setReaded();
        this.overlay = false
        this.onClose()
      }
    },
    setReaded() {
      this.$http
        .put({
          url: "/info-manage-app/ifly/info/manage/notice/mobile/read",
          data: {
            channel: this.channel,
            noticeId: this.currentNotice.id
          },
          headers: {
            handleError: false
          }
        })
        .catch(() => {});
    },
  },
  computed: {
    currentNotice() {
      if (this.noticeList.length) {
        return this.noticeList[this.showIndex];
      } else {
        return {};
      }
    }
  }
};
</script>

<style lang="less" scoped>
.notice-enter-active, .notice-leave-active {
  transition: opacity 0.3s;
}
.notice-enter, .notice-leave-to {
  opacity: 0;
}
.cs-system-notice {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 22.85714rem;
    overflow: hidden;
    font-size: 1.14286rem;
    background-color: #fff;
    border-radius: 1.14286rem;
    transform: translate3d(-50%, -50%, 0);
    backface-visibility: hidden;
    transition: .3s;
    transition-property: transform, opacity;
    transition: ease-in 0.3s;
    z-index: 2000;
    
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
    background: url("../theme/images/systemNotice/notice_bg_normal.png") no-repeat center center transparent;
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
}
</style>
