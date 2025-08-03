<template>
  <div
    class="card-item-wrapper"
    :style="{
      marginBottom: getNumOrStringStyle(cardMarginBottm),
      borderRadius: getNumOrStringStyle(cardRadius),
      ...cardWrapperStyle
    }"
    :class="{
      'card-item-wrapper-clickable': clickable
    }"
    @click="clickHandle($event)"
  >
    <VanCellGroup :title="titleName">
      <template #title v-if="$scopedSlots['card-header']">
        <slot name="card-header" :title="titleName"></slot>
      </template>
      <slot />
    </VanCellGroup>
  </div>
</template>

<script>
export default {
  name: "CardComponent",
  props: {
    titleName: {
      type: String,
      required: true
    },
    cardWrapperStyle: {
      type: Object,
      default: () => ({})
    },
    cardMarginBottm: {
      type: String || Number,
      default: "10px"
    },
    cardRadius: {
      type: String || Number,
      default: "20px"
    },
    clickable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  methods: {
    getNumOrStringStyle(param) {
      if (typeof param === "number") {
        return `${param}px`;
      } else {
        return param;
      }
    },
    clickHandle(event) {
      if (!this.clickable) {
        return;
      }
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      this.$emit("click", this.titleName, event);
    }
  }
};
</script>

<style lang="less" scoped>
.card-item-wrapper-clickable {
  transition: all 0.5s ease;

  &:active {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transform: scale(0.98);
  }

}
.card-item-wrapper:last-child {
  margin-bottom: 0;
}
.van-cell-group__title {
  padding: 2px 0px 10px;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  position: relative;
}
</style>
