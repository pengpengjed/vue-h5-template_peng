import vantExtend from './vantExtend'
const customComponents = {
  CsPage: require('./csPage'),
  CsPagingList: require('./csPagingList'),
  CsFileUpload: require('./csFileUpload'),
  CsFileUploadPopup: require('./csFileUploadPopup'),
  CsDataCell: require('./csDataCell'),
  CsDatetimeCell: require('./csDatetimeCell'),
  CsDatetimeCellEx: require('./csDatetimeCellEx'),
  CsTreeCell: require('./csTreeCell'),
  CsTreeNode: require('./csTreeNode'),
  CsUserCell: require('./csUserCell'),
  CsImageUpload: require('./csImageUpload'),
  CsAddressCell: require('./csAddressCell'),
  CsAirportCell: require('./csAirportCell'),
  CsSearch: require('./csSearch'),
  // CsAppSetting: require("./csAppSetting"),
  CsServerList: require('./csServerList'),
  CsModuleList: require('./csModuleList'),
  CsSystemNotice: require('./csSystemNotice'),
  CsEmpty: require('./csEmpty'),
  CsSticky: require('./csSticky'),
  CsPopup: require('./csPopup'),
  CsPopupPicker: require('./csPopupPicker'),
  CsPullRefreshList: require('./csPullRefreshList'),
  // AirportPickerCell: require("./airportPickerCell"),
  ApplyFormAttachment: require('./applyFormAttachment'),
  CsAbout: require('./csAbout'),
  CsSetting: require('./forPad/csSetting'),
  CsPagepad: require('./forPad/csPagepad'),
  CsPopuppad: require('./forPad/csPopuppad'),
  CsCellGroup: require('./csCellGroup.vue'),
  CsForm: require('./csForm.vue'),
  CsGroupForm: require('./csGroupForm.vue'),
  csTipsDialog: require('./csTipsDialog')
}

export default {
  install(Vue) {
    Vue.use(vantExtend)
    //注册自定义组件
    for (const componentName in customComponents) {
      const module = customComponents[componentName]
      const component = r => require.ensure([], () => r(module), 'customComponents')
      Vue.component(componentName, component)
    }
  }
}
