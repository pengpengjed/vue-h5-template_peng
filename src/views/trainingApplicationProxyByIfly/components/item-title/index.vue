<template>
  <div class="item-title-wrapper">
    <span class="item-title">{{ titleStr }}</span>
    <div class="item-title-right-wrapper">
      <slot name="item-title-right" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'item-title',
  props: ['titleStr'],
  data() {
    return {}
  },
  methods: {},
  computed: {},
  mounted() {}
}
</script>

<style lang="less" scoped>
.item-title-wrapper {
  margin: 5px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-title {
  display: inline-block;
  color: #5a709b;
  font-size: 14px;
  font-weight: 400;
  padding-left: 10px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 3px;
    width: 4px;
    height: 14px;
    background-color: #458cf5;
    border-radius: 5px;
  }
}
</style>
