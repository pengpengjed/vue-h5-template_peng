export default {
  props: {
    /* 页面类型：
      1、申请选择科目后显示纯查看 
      2、点击学员后显示准入条件详情
    */
    pageType: {
      type: Number,
      default: 1,
      require: true
    }
  },
  data() {
    return {
      PAGETYPEMAP: {}
    };
  },
  computed: {
    isOnlyShow() {
      return this.pageType === 1;
    },
    isReview() {
      return this.pageType === 2;
    }
  }
};
