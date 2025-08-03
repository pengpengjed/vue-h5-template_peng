<template>
  <div class="scroll-tip" v-if="showTip">
    <div class="tip-container">
      <img src="./tip-scrollY.png" alt="左右滑动提示" class="tip-image" />
      <div class="tip-text">左右滑动查看更多</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScrollTip',
  data() {
    return {
      showTip: false
    }
  },
  mounted() {
    // 检查是否是第一次访问
    const hasVisited = localStorage.getItem('hasVisitedScrollTip')
    if (!hasVisited) {
      this.showTip = true
      // 3秒后隐藏提示
      setTimeout(() => {
        this.showTip = false
        // 标记已访问
        localStorage.setItem('hasVisitedScrollTip', 'true')
      }, 3000)
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-tip {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;

  .tip-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: fadeInOut 3s ease-in-out;
    backdrop-filter: blur(10px);

    .tip-image {
      width: 50px;
      height: 50px;
      margin-bottom: 10px;
      filter: brightness(1.2);
    }

    .tip-text {
      color: white;
      font-size: 13px;
      text-align: center;
      white-space: nowrap;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
  }
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  80% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
