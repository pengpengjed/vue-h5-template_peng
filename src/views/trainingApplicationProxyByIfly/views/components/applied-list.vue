<template>
  <div class="applied-list">
    <!-- 搜索框 -->
    <div class="search-section">
      <VanSearch
        v-model="searchKeyword"
        show-action
        placeholder="请输入员工号/姓名/科目/机型进行搜索"
        ref="VanSearchRef"
        left-icon=" "
        @search="handleSearch"
        @clear="handleClear"
      >
        <template #action>
          <van-icon name="search" color="#3788FE" size="20" @click="handleSearch" />
        </template>
      </VanSearch>
    </div>

    <!-- 列表 -->
    <div class="list-section">
      <cs-paging-list
        ref="pagingList"
        :load="loadData"
        :page-size="20"
        :local-pagination="true"
        :store-key="'training-application-applied-list'"
        @load-success="handleLoadSuccess"
      >
        <template #default="{ data }">
          <application-list-item
            v-for="item in data"
            :key="item.id"
            :item="item"
            @item-click="handleItemClick"
            @withdraw="handleWithdraw"
            @reapply="handleReapply"
          />
        </template>
      </cs-paging-list>
    </div>

    <!-- 撤回弹框 -->
    <withdraw-dialog
      v-model="showWithdrawDialog"
      :application-data="currentApplication"
      @withdraw-only="handleWithdrawOnly"
      @withdraw-and-edit="handleWithdrawAndEdit"
    />

    <!-- 详情弹框 -->
    <!-- <application-detail-dialog v-model="showDetailDialog" :application-data="currentApplication" /> -->
  </div>
</template>

<script>
import ApplicationListItem from './application-list-item.vue'
import WithdrawDialog from './withdraw-dialog.vue'
// import ApplicationDetailDialog from "./application-detail-dialog.vue";
import appliedListData from '../mockData/appliedListData.json'
import CsPagingList from '@/components/csPagingList.vue'

export default {
  name: 'AppliedList',
  components: {
    ApplicationListItem,
    WithdrawDialog,
    CsPagingList
    // ApplicationDetailDialog
  },
  data() {
    return {
      searchKeyword: '',
      showWithdrawDialog: false,
      // showDetailDialog: false,
      currentApplication: {},
      allData: appliedListData.list
    }
  },
  methods: {
    // 加载数据方法
    loadData(pageIndex, pageSize) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            // 搜索过滤
            let filteredData = this.allData
            if (this.searchKeyword) {
              const keyword = this.searchKeyword.toLowerCase()
              filteredData = filteredData.filter(
                item =>
                  item.employeeId.toLowerCase().includes(keyword) ||
                  item.employeeName.toLowerCase().includes(keyword) ||
                  item.subject.toLowerCase().includes(keyword) ||
                  item.trainingAircraftModel.toLowerCase().includes(keyword)
              )
            }

            resolve(filteredData)
          } catch (error) {
            console.error('加载数据失败:', error)
            reject(error)
          }
        }, 300)
      })
    },

    handleSearch() {
      this.$refs.pagingList.refresh()
    },

    handleClear() {
      this.searchKeyword = ''
      this.$refs.pagingList.refresh()
    },

    handleLoadSuccess(data) {
      console.log('列表数据加载成功:', data)
      if (!data || data.length === 0) {
        this.$toast('暂无数据')
      }
    },

    handleItemClick(item) {
      console.log('点击列表项:', item)
      this.currentApplication = item
      this.$router.push({
        path: '/trainingApplicationProxyByIfly/applicationDetail',
        query: {
          applicationData: JSON.stringify(this.currentApplication),
          currentApplication: JSON.stringify(this.currentApplication) // 添加这一行保持兼容
        }
      })
      // this.showDetailDialog = true;
    },

    handleWithdraw(item) {
      this.currentApplication = item
      this.showWithdrawDialog = true
    },

    handleReapply(item) {
      this.$dialog
        .confirm({
          title: '重新发起',
          message: '确定要重新发起该申请吗？',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        .then(() => {
          // 这里应该调用重新发起的API
          this.$toast.success('重新发起成功')
          this.$refs.pagingList.refresh()
        })
        .catch(() => {
          // 用户取消
        })
    },

    handleWithdrawOnly(data) {
      // 这里应该调用撤回API
      console.log('仅撤回:', data)
      this.$toast.success('撤回成功')
      this.$refs.pagingList.refresh()
    },

    handleWithdrawAndEdit(data) {
      // 这里应该调用撤回API，然后跳转到编辑页面
      console.log('撤回并编辑:', data)
      this.$toast.success('撤回成功，即将跳转到编辑页面')

      // 模拟跳转到编辑页面，并传递数据
      setTimeout(() => {
        this.$emit('edit-application', data.applicationData)
      }, 1000)
    }
  },

  watch: {
    searchKeyword() {
      // 防抖搜索
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.handleSearch()
      }, 300)
    }
  }
}
</script>

<style lang="less" scoped>
.applied-list {
  // height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  .search-section {
    ::v-deep.van-search {
      margin: 0;
      background: #fff !important;
      border: 1px solid #31b2fe;
      .van-field__left-icon {
        margin-right: 14px;
      }
      .van-search__content {
        background: inherit;
        padding-left: 6px;
      }
      .van-field__body {
        height: 100%;
      }
      .van-search__action {
        background-color: transparent;
      }
    }
  }

  .list-section {
    position: relative;
    flex: 1;
    .cs-paging-list {
      flex: 1;
      // overflow: hidden;
    }
  }
}
</style>
