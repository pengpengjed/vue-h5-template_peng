<template>
  <van-search
    class="cs-search"
    v-model="keyword"
    @input="onInputChange"
    @search="onSearch"
    @clear="onClear"
    :placeholder="placeholder"
    :show-action="showAction"
    :left-icon="leftIcon"
  >
    <template #action>
      <slot name="action">
        <div @click="onSearch">{{ actionText }}</div>
      </slot>
    </template>
  </van-search>
</template>

<script>
export default {
  name: 'CsSearch',
  props: {
    value: {
      type: String
    },
    placeholder: {
      type: String
    },
    showAction: {
      type: Boolean,
      default: true
    },
    actionText: {
      type: String,
      default: '搜索'
    },
    leftIcon: {
      type: String,
      default: 'search'
    }
  },
  data() {
    return {
      keyword: ''
    }
  },
  created() {
    this.keyword = this.value
  },
  methods: {
    onInputChange() {
      this.$emit('input', this.keyword)
    },
    onSearch(e) {
      this.$emit('search', e)
    },
    onClear(e) {
      this.keyword = ''
      this.$emit('clear', e)
    }
  },
  watch: {
    value(newValue) {
      this.keyword = newValue
    }
  }
}
</script>
