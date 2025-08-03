<template>
  <div class="card-container-wrapper">
    <CsCellGroup
      v-for="groupItem in processedGroup"
      :key="groupItem.groupKey"
      :cardWrapperStyle="cardWrapperStyle"
      :titleName="groupItem.groupName"
    >
      <template #card-header="{ title }" v-if="$scopedSlots['card-header']">
        <slot name="card-header" :title="title">
          {{ title }}
        </slot>
      </template>
      <CsForm
        :colConfig="groupItem.colConfig"
        :formData="sourceData"
        :wrapper-style="{
          backgroundColor: '#f5f9ff'
        }"
      >
        <template v-for="(_, slotName) in $scopedSlots" #[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps" />
        </template>
      </CsForm>
    </CsCellGroup>
  </div>
</template>
<script>
import CsCellGroup from './csCellGroup.vue'
import CsForm from './csForm.vue'

export default {
  name: 'BasicInfoCard',
  components: {
    CsCellGroup,
    CsForm
  },
  props: {
    group: {
      type: Array,
      required: true,
      default: () => [],
      validator: value => value.every(item => 'groupKey' in item && 'groupName' in item && 'colConfig' in item)
    },
    sourceData: {
      type: Object,
      required: true,
      default: () => ({})
    },
    cardWrapperStyle: {
      type: Object,
      default: () => ({})
    }
  },
  mounted() {
    // console.log('this.$scopedSlots', this.$scopedSlots)
  },
  computed: {
    processedGroup() {
      return this.group.map(group => ({
        ...group,
        colConfig: group.colConfig || []
      }))
    }
  },
  methods: {
    getFormData(groupKey) {
      const groupItem = this.processedGroup.find(item => item.groupKey === groupKey)
      if (!groupItem) return {}

      return groupItem.colConfig.reduce((acc, item) => {
        if (item.value) {
          acc[item.value] = this.sourceData[groupKey]?.[item.value] || ''
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="less" scoped>
.card-container-wrapper {
  margin-bottom: 50px;
  ::v-deep.van-cell-group__title {
    padding: 5px 14px 14px;
    font-size: 16px;
    color: #333333;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 5px;
      bottom: 5px;
      width: 4px;
      height: 14px;
      background: #6a74f3;
      border-radius: 2px;
    }
  }

  ::v-deep.van-cell-group {
    background-color: #e7f0ff;
    padding: 10px 5px;
    border-radius: 10px;
  }
}
</style>
