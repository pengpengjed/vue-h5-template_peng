<template>
  <VanPullRefresh v-model="refreshing" class="cs-pull-refresh-list" :disabled="disabled" @refresh="onRefresh">
    <template v-if="loading">
      <VanLoading size="16">加载中...</VanLoading>
    </template>
    <template v-else>
      <template v-if="dataList && dataList.length">
        <slot :data="dataList"></slot>
      </template>
      <template v-else>
        <CsEmpty :description="emptyDescription" />
      </template>
    </template>
  </VanPullRefresh>
</template>

<script>
export default {
  props: {
    // ajax请求地址
    url: {
      type: String
    },
    // 查询参数
    queryParams: {
      type: Object
    },
    // ajax请求方法
    method: {
      type: String,
      default: "post" // 对应utils目录里面http中的方法
    },
    // 设置加载返回数据列表字段，由于有些接口返回数据格式不同，会返回一个实体，里面某个字段才是列表数据
    dataField: {
      type: String
    },
    // 数据处理，可对数据进行个性化处理
    dataHandle: {
      type: Function
    },
    // 设置是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 无数据提示文本
    emptyDescription: {
      type: String,
      default: "暂无数据"
    },
    // 查询参数有变动时，自动加载列表
    autoLoad: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      refreshing: false,
      loading: false,
      dataList: []
    };
  },
  created() {
    if (this.autoLoad) {
      this.load();
    }
  },
  methods: {
    load(isRefresh = false) {
      return new Promise((resolve, reject) => {
        if (!this.url) {
          reject(new Error("CsPullRefreshList组件未设置url"));
        }

        this.loading = !isRefresh;
        this.$http[this.method]({
          url: this.url,
          data: this.queryParams
        })
          .then(data => {
            if (this.dataField) {
              data = data[this.dataField] || [];
            }
            data = data || [];
            // 判断是否需要对数据进行个性化处理
            if (this.dataHandle) {
              data.forEach(item => {
                this.dataHandle(item);
              });
            }

            this.dataList = data;

            this.$emit("load-success", data);
            resolve(data);
          })
          .catch(err => {
            reject(err);
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    refresh() {
      this.refreshing = true;
      this.load(true).finally(() => {
        this.refreshing = false;
      });
    },
    onRefresh() {
      this.refresh();
    }
  },
  watch: {
    queryParams: {
      deep: true,
      handler() {
        if (this.autoLoad) {
          this.load();
        }
      }
    }
  }
};
</script>

<style lang="less">
.cs-pull-refresh-list {
  .van-loading {
    line-height: 50px;
  }
}
</style>
