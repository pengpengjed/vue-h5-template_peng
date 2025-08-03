<template>
  <div id="relateUserBar" class="relate-user-bar" :style="barStyle" v-if="relateUser">
    <div
      @touchstart.stop.prevent="onSimulateUserTouchStart"
      @touchmove.stop="onSimulateUserTouchMove"
      @touchend.stop="onSimulateUserTouchEnd"
    >
      <span>{{ relateUser }}</span>
    </div>
    <span class="btn-close" @click.stop.prevent="onLogoutSimulateClick" v-if="isHomeModule"><i></i></span>
  </div>
</template>

<script>
export default {
  name: "RelateUserBar",
  data() {
    return {
      simulateUserPoints: {
        offset: { x: 0, y: 0 },
        start: { x: 0, y: 0 },
        end: { x: 0, y: 0 }
      }
    };
  },
  methods: {
    // 关联用户退出点击事件
    onLogoutSimulateClick() {
      this.confirmMessage(`您确定要退出关联用户吗？`)
        .then(() => {
          // 天健退出关联
          this.$http.delete({ url: "/login-app/mobile/loginUserInfo/relevance" }).catch(err => console.log(err));

          setTimeout(() => {
            this.$localStorage.removeItem(this.$storeKeys.relateUser);
            // window.location.reload();
            let url = window.location.href;
            let index = url.indexOf("#/");
            if (index !== -1) {
              url = url.substring(0, index);
            }
            window.location.href = url;
          }, 100);
        })
        .catch(() => {});
    },
    // 关联用户色块拖动开始事件
    onSimulateUserTouchStart(e) {
      if (e.touches.length) {
        this.simulateUserPoints.start.x = e.touches[0].clientX;
        this.simulateUserPoints.start.y = e.touches[0].clientY;
        this.simulateUserPoints.end.x = e.touches[0].clientX;
        this.simulateUserPoints.end.y = e.touches[0].clientY;
      }
    },
    // 关联用户色块拖动移动事件
    onSimulateUserTouchMove(e) {
      if (e.touches.length) {
        this.simulateUserPoints.end.x = e.touches[0].clientX;
        this.simulateUserPoints.end.y = e.touches[0].clientY;
      }
      this.setSimulateUserOffset();
    },
    // 关联用户色块拖动结束事件
    onSimulateUserTouchEnd(e) {
      if (e.touches.length) {
        this.simulateUserPoints.end.x = e.touches[0].clientX;
        this.simulateUserPoints.end.y = e.touches[0].clientY;
      }
      this.setSimulateUserOffset();
    },
    // 计算关联用户色块拖动的偏移量
    setSimulateUserOffset() {
      const el = document.getElementById("relateUserBar");
      let offsetX = this.simulateUserPoints.end.x - this.simulateUserPoints.start.x;
      let offsetY = this.simulateUserPoints.end.y - this.simulateUserPoints.start.y;
      // 计算偏移量
      this.simulateUserPoints.offset.x += offsetX;
      this.simulateUserPoints.offset.y += offsetY;
      // 设置样式
      el.style.transform = `translate(${this.simulateUserPoints.offset.x}px, ${this.simulateUserPoints.offset.y}px)`;
      // 设置开始位置为当前结束点的位置
      this.simulateUserPoints.start.x = this.simulateUserPoints.end.x;
      this.simulateUserPoints.start.y = this.simulateUserPoints.end.y;
    }
  },
  computed: {
    relateUser() {
      return this.relateUserId || "";
    },
    barStyle() {
      return { top: (this.statusBarHeight + 5) / 14 + "rem" };
    }
  }
};
</script>

<style lang="less">
.relate-user-bar {
  position: absolute;
  // pointer-events: none;
  z-index: 999999;
  top: 5px;
  left: 50%;
  width: 140px;
  margin-left: -70px;
  background-color: #d9534f;
  color: #ffffff;
  text-align: center;
  height: 28px;
  border-radius: 100px;
  box-sizing: border-box;
  line-height: 28px;
  box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);
  // border: 1px solid #d43f3a;
  // margin-top: 2px;
  opacity: 0.8;
  .btn-close {
    font-size: 16px;
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: visible;
    z-index: 2;
    padding: 3px;
    & > i {
      display: block;
      height: 16px;
      width: 16px;
      box-sizing: border-box;
      background: url(data:image/png;base64,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)
        no-repeat center center;
      background-size: cover;
    }
  }
}
</style>
