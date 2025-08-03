<template>
  <van-empty class="cs-empty" :description="description" :image="image" />
</template>

<script>
export default {
  name: 'CsEmpty',
  props: {
    image: {
      type: String,
      default: () => require('../theme/images/empty-image-default.png')
    },
    description: {
      type: String,
      default: '暂无数据'
    }
  }
}
</script>

<style lang="less">
.cs-empty {
  .van-empty__image {
    height: auto;
    width: 200px;
    img {
      width: 100%;
      height: auto;
      display: block;
      border: 0;
    }
  }
  .van-empty__description {
    margin-top: 10px;
  }
}
</style>
