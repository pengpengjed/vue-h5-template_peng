<template>
  <div class="cell-wrapper" :class="wrapperClass" :style="{ ...wrapperStyle }">
    <VanRow class="form-wrapper">
      <VanCol v-for="(item, index) in colConfig" :key="index" :span="item.span || 24" class="form-item">
        <template v-if="item.type === 'divider'">
          <slot name="divider"></slot>
        </template>
        <template v-else>
          <VanRow>
            <VanCol class="form-label" :style="item.formLabelCusStyle ? item.formLabelCusStyle : {}" v-if="item.label">
              <slot :name="`${item.value}-label`" :value="item.label">
                {{ item.label }}
              </slot>
            </VanCol>
            <VanCol
              :span="item.fullRow ? 24 : ''"
              class="form-value"
              :style="item.formValCusStyle ? item.formValCusStyle : {}"
              :class="{ 'full-row': item.fullRow }"
            >
              <slot :name="item.value" :value="formData[item.value]" :formData="formData">
                <!-- 默认内容 -->
                <template v-if="$slots[item.value] && formData[item.value]">
                  {{ formData[item.value] }}
                </template>
                <template v-else>
                  {{ getValue(formData[item.value], item.formatter) }}
                </template>
              </slot>
            </VanCol>
          </VanRow>
        </template>
      </VanCol>
    </VanRow>
    <div class="action-container" v-if="$slots.action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CsForm',
  props: {
    colConfig: {
      type: Array,
      required: true,
      default: () => []
    },
    formData: {
      type: Object,
      required: true,
      default: () => ({})
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    wrapperStyle: {
      type: Object,
      default: () => ({})
    },
    emptyText: {
      type: String,
      default: '-'
    }
  },
  methods: {
    getNestedValue(obj, path) {
      return Array.isArray(path)
        ? path.reduce((acc, key) => {
            return acc && acc[key]
          }, obj)
        : (obj && obj[path]) || ''
    },
    getValue(value, formatter) {
      if (!value) {
        return this.emptyText
      }
      if (formatter && typeof formatter === 'function') {
        return formatter(value)
      }
      return value
    }
  }
}
</script>

<style lang="less" scoped>
.cell-wrapper {
  position: relative;
}
.action-container {
  position: absolute;
  right: -13px;
  top: 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.divider {
  width: 100%;
  border-top: 1px dashed #ddd;
  margin: 12px 0;
}
.form-wrapper {
  padding: 10px 0;

  .form-item {
    padding: 0 10px 10px;
    color: #444444;
    font-size: 12px;

    &:last-child {
      padding-bottom: 0;
    }

    .form-label {
      word-break: keep-all;
      color: #646566;
    }

    .form-value {
      flex: 1;
      word-break: break-word;
      &.full-row {
        display: block;
        margin-top: 4px;
        padding-left: 0;
      }
    }
  }
}
</style>
