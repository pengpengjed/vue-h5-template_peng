<template>
  <div class="trainApplyForm">
    <van-form @submit="onSubmit">
      <template v-for="(config, idx) in formConfig">
        <van-field
          v-if="getIsDisplay(config.isShow)"
          :key="Math.random() + idx"
          :label="config.label"
          :placeholder="config.placeholder"
          :rules="config.rules"
          :value="getDisplayValue(config)"
          :name="config.value"
          v-bind="config.attrs"
          @click="
            () => {
              config.onClick && config.onClick(config)
            }
          "
        />
      </template>
    </van-form>
    <!-- 选择器 -->
    <CsPopupPicker
      v-model="formData[currentConfig.value]"
      ref="CsPopupPicker"
      @select="onPickChange"
      :options="selectOptsObj.list"
      :valueField="selectOptsObj.valueField"
      :textField="selectOptsObj.textField"
      :isPickerTitleSearch="selectOptsObj.isPickerTitleSearch"
    />
  </div>
</template>

<script>
import selectOptsLocalObj from './mockData/selectOpts.json'
import outlineConf from './mockData/outlineConf.json'
import syllabusSubject from './mockData/syllabusSubject.json'
import publishTypeOption from './mockData/publishTypeOption.json'
export default {
  name: 'trainApplyForm',
  props: {
    /* formConfig: {
      type: Array,
      default: () => []
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    selectOptsObj: {
      type: Object,
      default: () => ({})
    },
    currentConfig: {
      type: Object,
      default: () => ({})
    } */
  },
  data() {
    const { isEmpty } = this.$utility
    return {
      formData: {
        fleetCd: '', // 训练机型
        trainClassValue: '', // 分类
        syllabusConfId: '', // 提纲
        cataValue: '', // 阶段
        syllabusSubjectsConfId: '', // 科目
        qualificationType: '', // 资格类型
        checkQualification: '' // 检查资格
      },
      publishTypeOption: [],
      formConfig: [
        {
          label: '训练机型',
          value: 'fleetCd',
          placeholder: '请选择训练机型',
          rules: [{ required: true, message: '请选择训练机型' }],
          type: 'select',
          optionConfig: {
            keyField: 'fleetList',
            valueField: 'detailCode',
            textField: 'detailName'
          },
          attrs: {
            readonly: true,
            clickable: true
          },
          onClick: config => {
            const { optionConfig } = config
            const listData = this.selectOptsLocalObj[optionConfig.keyField]
            const params = {
              config,
              callback: this.selectOptsObjChange,
              ifShowPicker: true,
              listData
            }
            this.handleFieldClick(params)
          }
        },
        {
          label: '分类',
          value: 'trainClassValue',
          placeholder: '请选择分类',
          rules: [{ required: true, message: '请选择分类' }],
          type: 'select',
          optionConfig: {
            keyField: 'trainClassList',
            valueField: 'field1Value',
            textField: 'field2Value'
          },
          attrs: {
            readonly: true,
            clickable: true
          },
          onClick: config => {
            const { optionConfig } = config
            const listData = this.selectOptsLocalObj[optionConfig.keyField]
            const params = {
              config,
              callback: this.selectOptsObjChange,
              ifShowPicker: true,
              listData
            }
            this.handleFieldClick(params)
          }
        },
        {
          label: '提纲',
          value: 'syllabusConfId',
          placeholder: '请选择提纲',
          rules: [{ required: true, message: '请选择提纲' }],
          type: 'select',
          optionConfig: {
            valueField: 'id',
            textField: 'outlineName'
          },
          attrs: {
            readonly: true,
            clickable: true
          },
          onClick: async config => {
            const { fleetCd, trainClassValue } = this.formData
            if (isEmpty(fleetCd) && isEmpty(trainClassValue)) {
              return this.$toast('请先选择训练机型和分类')
            }
            const syllabusConfList = await this.fetchSyllabusConfList({
              fleetCd: fleetCd,
              trainClassValue: trainClassValue
            })
            const params = {
              config,
              callback: this.selectOptsObjChange,
              ifShowPicker: true,
              listData: syllabusConfList,
              isPickerTitleSearch: true
            }
            this.handleFieldClick(params)
          }
        },
        {
          label: '阶段',
          value: 'cataValue',
          placeholder: '请选择阶段',
          rules: [{ required: true, message: '请选择阶段' }],
          type: 'select',
          optionConfig: {
            keyField: 'trainStageList',
            valueField: 'field1Value',
            textField: 'field2Value'
          },
          attrs: {
            readonly: true,
            clickable: true
          },
          onClick: config => {
            const { optionConfig } = config
            const listData = this.selectOptsLocalObj[optionConfig.keyField]
            const params = {
              config,
              callback: this.selectOptsObjChange,
              ifShowPicker: true,
              listData,
              isPickerTitleSearch: true
            }
            this.handleFieldClick(params)
          }
        },
        {
          label: '科目',
          value: 'syllabusSubjectsConfId',
          placeholder: '请选择科目',
          rules: [{ required: true, message: '请选择科目' }],
          type: 'select',
          optionConfig: {
            valueField: 'id',
            textField: 'subjectsName'
          },
          attrs: {
            readonly: true,
            clickable: true
          },
          onClick: async config => {
            const { fleetCd, trainClassValue, syllabusConfId } = this.formData
            if (isEmpty(fleetCd) && isEmpty(trainClassValue) && isEmpty(syllabusConfId)) {
              return this.$toast('请先选择训练机型、分类、提纲')
            }
            const syllabusSubjectList = await this.fetchSyllabusSubject({
              fleetCd: fleetCd,
              trainClassValue: trainClassValue,
              syllabusConfId: syllabusConfId
            })
            const params = {
              config,
              callback: this.selectOptsObjChange,
              ifShowPicker: true,
              listData: syllabusSubjectList,
              isPickerTitleSearch: true
            }
            this.handleFieldClick(params)
          }
        },
        {
          isShow: () => {
            const { syllabusSubjectsConfId } = this.formData
            return !isEmpty(syllabusSubjectsConfId)
          },
          label: '资格类型',
          value: 'qualificationType',
          placeholder: '请选择资格类型',
          rules: [{ required: true, message: '请选择资格类型' }],
          type: 'select',
          optionConfig: {
            valueField: 'publishTypeId',
            textField: 'publishTypeName'
          },
          attrs: {
            readonly: true,
            clickable: true
          },
          onClick: async config => {
            const { syllabusSubjectsConfId } = this.formData
            if (isEmpty(syllabusSubjectsConfId)) {
              return this.$toast('请先选择科目')
            }
            const publishTypeOption = await this.fetchPublishTypeOption({
              syllabusSubjectsConfId: syllabusSubjectsConfId
            })
            this.publishTypeOption = publishTypeOption
            const params = {
              config,
              callback: this.selectOptsObjChange,
              ifShowPicker: true,
              listData: publishTypeOption
            }
            this.handleFieldClick(params)
          }
        },
        {
          isShow: () => {
            const { qualificationType } = this.formData
            return !isEmpty(qualificationType)
          },
          label: '检查资格',
          value: 'checkQualification',
          placeholder: '请选择检查资格',
          rules: [{ required: true, message: '请选择检查资格' }],
          type: 'select',
          optionConfig: {
            valueField: 'publishId',
            textField: 'publishName'
          },
          attrs: {
            readonly: true,
            clickable: true
          },
          onClick: async config => {
            const { qualificationType } = this.formData
            if (isEmpty(qualificationType)) {
              return this.$toast('请先选择资格类型')
            }
            console.log('this.publishTypeOption', this.publishTypeOption)
            console.log('qualificationType', qualificationType)
            const checkQualificationList = this.publishTypeOption.find(
              item => item.publishTypeId === qualificationType
            ).publishTypeItemList
            const params = {
              config,
              callback: this.selectOptsObjChange,
              ifShowPicker: true,
              listData: checkQualificationList,
              isPickerTitleSearch: true
            }
            this.handleFieldClick(params)
          }
        }
      ],
      selectOptsObj: {
        list: [],
        valueField: '',
        textField: '',
        isPickerTitleSearch: false
      },
      currentConfig: {
        label: '',
        value: '',
        placeholder: '',
        optionConfig: {
          keyField: '',
          valueField: '',
          textField: ''
        }
      }
    }
  },
  methods: {
    initOpts() {
      this.selectOptsLocalObj = selectOptsLocalObj
    },
    showPopPick() {
      this.$refs.CsPopupPicker.toggle()
    },
    getIsDisplay(isShow) {
      if (this.$utility.isEmpty(isShow)) {
        return true
      } else if (typeof isShow === 'boolean') {
        return isShow
      } else if (typeof isShow === 'function') {
        return isShow()
      }
      return false
    },

    getDisplayValue(config) {
      if (config.type === 'select') {
        return this.formData[config.value + 'Text']
      } else {
        return this.formData[config.value]
      }
    },
    onSubmit(e) {
      console.log('submit', e)
      console.log('this.formData', this.formData)
      this.$emit('submit', this.formData)
    },
    onPickChange(value, item) {
      console.log('onPickChange', value, item)
      // 同时更新显示文本
      if (item && this.currentConfig && this.currentConfig.type === 'select') {
        this.$set(this.formData, this.currentConfig.value + 'Text', item[this.selectOptsObj.textField])
        this.$emit('change', this.currentConfig.value, this.formData[this.currentConfig.value])
      }
    },

    /**
     * 处理字段点击事件
     * @param {Object} config - 字段配置对象
     * @param {Function} [callback=()=>{}] - 回调函数
     * @param {boolean} [ifShowPicker=false] - 是否显示选择器
     * @param {Array} listData - 列表数据
     */
    async handleFieldClick(
      params = { config: {}, callback: () => {}, ifShowPicker: false, listData: [], isPickerTitleSearch: false }
    ) {
      const { config, callback, ifShowPicker, listData, isPickerTitleSearch } = params
      Object.assign(this.currentConfig, config)
      const { optionConfig } = config
      callback(optionConfig, listData, isPickerTitleSearch)
      !!ifShowPicker && this.showPopPick()
    },
    selectOptsObjChange(optionConfig, listData, isPickerTitleSearch) {
      const { valueField, textField } = optionConfig
      this.selectOptsObj.list = listData
      this.selectOptsObj.valueField = valueField
      this.selectOptsObj.textField = textField
      this.selectOptsObj.isPickerTitleSearch = isPickerTitleSearch
    },
    fetchSyllabusConfList(fleetCd, trainClassValue) {
      console.log('fleetCd, trainClassValue', fleetCd, trainClassValue)
      // 模拟接口
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(outlineConf)
        }, 300)
      })
    },
    fetchSyllabusSubject(fleetCd, trainClassValue, syllabusConfId) {
      console.log('fleetCd, trainClassValue, syllabusConfId', fleetCd, trainClassValue, syllabusConfId)
      // 模拟接口
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(syllabusSubject)
        }, 300)
      })
    },
    fetchPublishTypeOption(syllabusSubjectsConfId) {
      console.log('syllabusSubjectsConfId', syllabusSubjectsConfId)
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(publishTypeOption)
        }, 300)
      })
    }
  },
  computed: {},
  mounted() {
    this.initOpts()
  }
}
</script>

<style lang="scss" scoped>
.trainApplyForm {
}
</style>
