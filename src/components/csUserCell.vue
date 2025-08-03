<template>
  <div class="van-cell cs-user-cell" :class="{ multiple: multiple }">
    <van-cell @click="onCellClick" :is-link="!multiple">
      <!--标题-->
      <div slot="title">
        <span>{{ title }}</span>
        <div v-if="multiple" class="button">
          <van-icon name="add-o" />
        </div>
      </div>
      <!--单选选中值-->
      <div v-if="!multiple" class="picker-single-value">
        <span>{{ componentValue ? componentValue : '请选择' }}</span>
        <van-icon name="cross" @click.stop="onClearClick" v-if="componentValue && clearable" />
      </div>

      <!--多选选中列表-->
      <div slot="label" v-if="multiple">
        <div class="selected-user-list" v-if="multiple">
          <slot name="userList" :data="selectedUsers">
            <div v-for="(item, index) in selectedUsers" :key="item.staffNum">
              <div class="selected-user-item">
                <div>
                  <van-icon name="contact" @click="onRemoveUser(index)" />
                  <div>{{ item.personName }}</div>
                  <div>{{ item.staffNum }}</div>
                  <van-icon name="clear" @click="onRemoveUser(index)" />
                </div>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </van-cell>
    <slot name="userSingle" :data="userSingleData"></slot>

    <van-popup class="cs-user-popup" v-model="popupVisible" position="bottom" get-container="body">
      <!-- <van-nav-bar title="人员选择" left-arrow @click-left="onNavBarClickLeft"></van-nav-bar> -->
      <van-search
        placeholder="请输入关键词搜索"
        v-model="keyword"
        background="#f2f2f2"
        @search="loadData"
        show-action
        :class="{ active: keyword }"
      >
        <div slot="action" @click="loadData">搜索</div>
      </van-search>
      <div class="content">
        <van-loading v-if="loading" />
        <van-cell-group v-else-if="dataList.length">
          <van-cell
            v-for="item in dataList"
            :title="`${item.personName}（${item.staffNum}）`"
            :label="item.orgUnitFullName"
            :key="item.staffNum"
            @click="onSelectUser(item)"
          />
        </van-cell-group>
        <div class="tips" v-else>{{ loaded ? '没有搜索到相关数据' : '请先搜索再进行人员选择' }}</div>
      </div>
      <div class="button-bar">
        <van-button type="info" @click="onNavBarClickLeft">关闭</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
export default {
  name: 'csUserCell',
  props: {
    // 设置标题
    title: {
      type: String
    },
    // 绑定值
    value: {},
    // 设置是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 多选时，设置已选择的用户列表
    userList: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 设置关键字变更之后，是否主动加载数据
    isVoluntarily: {
      type: Boolean,
      default: false
    },
    // 设置是否可清空选中值
    clearable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      componentValue: '',
      popupVisible: false,
      keyword: '',
      selectedUsers: [],
      dataList: [],
      loading: false,
      loaded: false,
      userSingleData: []
    }
  },
  created() {
    this.componentValue = this.value
  },
  methods: {
    loadData() {
      if (!this.keyword) {
        this.alertMessage('请输入关键词搜索')
        return
      }
      if (this.loading) {
        return
      }
      this.loading = true
      this.loaded = true
      this.$http
        .postJson(this.$api.base.toAddCirculateStaffListPageForApprove, {
          personName: this.keyword
        })
        .then(data => {
          this.dataList = data.queryEmpInfoList || []
        })
        .finally(() => {
          this.loading = false
        })
    },
    onCellClick() {
      this.keyword = ''
      this.dataList = []
      this.popupVisible = true
    },
    onClearClick() {
      this.componentValue = ''
      this.$emit('input', this.componentValue)
    },
    onNavBarClickLeft() {
      this.popupVisible = false
    },
    onSelectUser(user) {
      if (!this.multiple) {
        this.componentValue = user.staffNum

        this.$emit('input', user.staffNum)
        this.popupVisible = false
        this.userSingleData = []
        this.userSingleData.push(user)
        return
      }
      let isExists = false
      for (let i = 0, len = this.selectedUsers.length; i < len; i++) {
        const el = this.selectedUsers[i]
        if (el) {
          if (el.staffNum === user.staffNum) {
            isExists = true
            break
          }
        }
      }
      if (!isExists) {
        this.selectedUsers.push(user)
      }
      this.popupVisible = false
    },
    onRemoveUser(index) {
      this.$dialog
        .confirm({
          title: '警告',
          message: '您确定删除吗？'
        })
        .then(() => {
          if (!this.multiple) {
            this.componentValue = ''
            this.$emit('input', '')
            this.userSingleData = []
            return
          }
          this.selectedUsers.splice(index, 1)
        })
        .catch(() => {})
    }
  },
  watch: {
    value(newValue) {
      this.componentValue = newValue
    },
    selectedUsers(newValue) {
      const value = []
      newValue.forEach(item => {
        if (item) {
          value.push(item.staffNum)
        }
      })
      this.$emit('input', value)
    },
    userList() {
      this.selectedUsers = this.userList
    },
    keyword() {
      if (this.isVoluntarily && this.keyword) {
        this.loadData()
      }
    }
  }
}
</script>

<style lang="less">
.cs-user-cell {
  width: 100%;
  flex-wrap: wrap;
  padding: 0px !important;
  &.multiple {
    .van-cell__title {
      width: 100% !important;
    }
  }
  .van-cell {
    // color: #888;
    // .van-cell__value {
    //   text-align: right !important;
    // }
    .van-icon {
      line-height: inherit;
    }
    .van-icon-clear {
      color: #f76262;
    }
    .van-cell__right-icon {
      font-size: 16px;
    }
    .picker-single-value {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      & > span {
        flex: 1;
      }
      & > .van-icon {
        font-size: 15px;
        color: #d43f3a;
      }
      .nodata {
        color: #969799;
      }
    }
  }
  .button {
    height: 24px;
    line-height: 24px;
    font-size: 24px;
    // text-align: right;
    float: right;
    .van-icon {
      font-size: 24px;
    }
  }
  .selected-user-list {
    overflow: hidden;
    width: 100%;

    .selected-user-item {
      width: 25%;
      float: left;
      box-sizing: border-box;
      padding: 10px 0;
      color: #555555;
      overflow: hidden;
      font-size: 14px;
      & > div {
        text-align: center;
        position: relative;
        /* border: 1px solid #e8e8e8; */
        padding: 10px 10px 0;
        box-sizing: border-box;
        border-radius: 4px;
        /* background-color: #f8f8f8; */
        /* box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.1); */
        height: 86px;
        .van-icon-contact {
          font-size: 36px;
          line-height: 36px;
          color: #337ab7;
          display: block;
        }
        & > div {
          height: 20px;
          line-height: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          &:first-of-type {
            color: #555555;
          }
          &:last-of-type {
            color: #999999;
            font-size: 12px;
          }
        }
        .van-icon-clear {
          position: absolute;
          right: 50%;
          top: 4px;
          font-size: 16px;
          color: #d9534f;
          margin-right: -18px;
          width: 16px;
          height: 16px;
        }
      }
    }
  }
}
.cs-user-popup {
  height: 90%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .van-nav-bar {
    background-color: #3697de;
    .van-icon,
    .van-nav-bar__title {
      color: #ffffff;
    }
  }

  .van-search {
    .van-icon {
      line-height: 24px;
    }
  }

  .content {
    flex: 1;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .van-loading {
      display: block;
      margin: 15px auto;
      text-align: center;
    }
    .tips {
      padding: 15px;
      text-align: center;
      color: #888888;
    }
  }
  .button-bar {
    margin: 10px;
    border: 0;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.15);
    padding: 0px;
    .van-button {
      width: 100%;
      height: 40px;
      line-height: 40px;
      border-radius: 20px;
    }
  }
}
</style>
