<template>
  <div class="access-condition-text">
    <VanField
      v-if="editable"
      v-model="localValue"
      type="textarea"
      :rows="rows"
      :autosize="autosize"
      :label="label"
      :placeholder="placeholder"
      @input="handleInput"
    />
    <VanField
      v-else
      :value="value"
      type="textarea"
      :rows="rows"
      :autosize="autosize"
      :label="label"
      :placeholder="placeholder"
      readonly
    />
  </div>
</template>

<script>
export default {
  name: 'AccessConditionText',
  props: {
    value: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入准入条件'
    },
    rows: {
      type: Number,
      default: 10
    },
    autosize: {
      type: Boolean,
      default: true
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localValue: this.value
    }
  },
  watch: {
    value(val) {
      this.localValue = val
    }
  },
  methods: {
    handleInput(val) {
      this.$emit('input', val)
      this.$emit('change', val)
    }
  }
}
</script>

<style scoped>
.access-condition-text {
  margin: 16px 0;
}
</style>
