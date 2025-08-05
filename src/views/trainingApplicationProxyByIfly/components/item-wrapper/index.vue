<template>
  <div class="item-wrapper-container">
    <!-- <slot name="item-wrapper-top-header"/> -->
    <div class="item-wrapper item-wrapper-warp" :style="{ background: bgConfig }" v-if="isContentInBox">
      <div class="item-wrapper-title" v-if="!(title === '')">
        <span class="item-wrapper-title-text">
          {{ title }}
        </span>
      </div>
      <slot />
    </div>
    <div class="item-wrapper" v-else>
      <ItemTitle :titleStr="title">
        <template #item-title-right>
          <slot name="item-title-right" />
        </template>
      </ItemTitle>
      <slot />
    </div>
  </div>
</template>

<script>
import ItemTitle from '../item-title/index.vue'
export default {
  name: 'itemWrapper',
  props: ['title', 'isContentInBox', 'bgConfig'],
  components: { ItemTitle },
  data() {
    return {}
  },
  methods: {},
  computed: {},
  mounted() {}
}
</script>

<style lang="less">
.item-wrapper-container {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: unset;
  }
  .item-wrapper {
    &-warp {
      position: relative;
      height: auto;
      width: 100%;
      background-color: #f7fcff;
      border: 1px solid #c2e9ff;
      border-radius: 5px;
      box-sizing: border-box;
      padding-top: 25px;
      .item-wrapper-title {
        padding: 2px 15px;
        position: absolute;
        left: -1px;
        top: -1px;
        display: inline-block;
        text-align: center;
        min-height: 20px;
        min-width: 50px;
        background: url('../../theme/images/bg-item-wrapper-title.png') no-repeat 100% 100% transparent;
        background-size: cover;

        &-text {
          font-weight: 400;
          font-size: 12px;
          line-height: 17px;
          color: #333;
        }
      }
    }
  }
}
</style>
