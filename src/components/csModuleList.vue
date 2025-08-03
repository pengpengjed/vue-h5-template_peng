<template>
  <div class="cs-module-list">
    <div class="header">
      <span>模块管理</span>
      <van-icon class="btn-refresh" name="replay" @click="refresh()" />
      <van-icon class="btn-close" name="cross" @click="onCloseClick" />
    </div>
    <div class="content">
      <van-loading v-if="loading">正在加载</van-loading>
      <template v-else>
        <van-cell-group v-if="moduleList.length">
          <van-cell v-for="item in moduleList" :key="item.identifier">
            <template #title>
              <div>
                {{ item.name }} <span class="version">{{ item.version }}</span>
              </div>
            </template>

            <span class="status" :class="'status' + item.cubeStatus">{{ statusMap[item.cubeStatus] }}</span>

            <template #label>
              <div>{{ item.identifier }}</div>
            </template>
          </van-cell>
        </van-cell-group>
        <div v-else class="no-data-tips">暂无数据</div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CsModuleList',
  data() {
    return {
      loading: false,
      moduleList: [],
      statusMap: {
        1: '准备就绪',
        2: '待更新',
        3: '未加载',
        4: '正在下载'
      }
    }
  },
  created() {
    this.load()
    console.log(123)
  },
  methods: {
    onCloseClick() {
      this.$emit('close')
    },
    refresh() {
      this.load()
    },
    load() {
      if (this.loading) {
        return
      }

      this.loading = true
      if (this.isInApp) {
        this.$native.Imap.getH5ModuleList()
          .then(res => {
            this.moduleList = res.modules || []
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        this.moduleList = [
          { identifier: 'com.csair.eplm.flightHome', name: '南航智飞', version: 'v1.0', cubeStatus: 1 },
          { identifier: 'com.csair.eplm.personalFile', name: '个人档案', version: 'v1.0', cubeStatus: 2 },
          { identifier: 'com.csair.eplm.approvalRelease', name: '审批发布', version: 'v1.0', cubeStatus: 3 },
          { identifier: 'com.csair.eplm.ebpreflyt', name: '网上准备', version: 'v1.0', cubeStatus: 4 },
          { identifier: 'com.csair.eplm.empCards', name: '我的证件', version: 'v1.0', cubeStatus: 1 },
          { identifier: 'com.csair.eplm.trainApplyPersonal', name: '个人申请', version: 'v1.0', cubeStatus: 1 },
          { identifier: 'com.csair.eplm.trainApplyAgent', name: '代理申请', version: 'v1.0', cubeStatus: 1 },
          { identifier: 'com.csair.eplm.trainCourseware', name: '训练课件', version: 'v1.0', cubeStatus: 2 },
          { identifier: 'com.csair.eplm.trainEvaluate', name: '训练评估', version: 'v1.0', cubeStatus: 3 },
          { identifier: 'com.csair.eplm.trainMonitor', name: '训练监控', version: 'v1.0', cubeStatus: 4 },
          { identifier: 'com.csair.eplm.airlineCheck', name: '航线检查', version: 'v1.0', cubeStatus: 1 },
          { identifier: 'com.csair.eplm.assessmentConfirm', name: '考核确认', version: 'v1.0', cubeStatus: 1 }
        ]
        setTimeout(() => {
          this.loading = false
        }, 200)
      }
    }
  }
}
</script>

<style lang="less">
.cs-module-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  .header {
    background-color: #3788fe;
    height: 40px;
    line-height: 40px;
    padding-left: 20px;
    position: relative;
    color: #ffffff;
    border-radius: 20px 20px 0 0;
    font-size: 16px;
    .btn-refresh {
      line-height: 20px;
      font-size: 14px;
      margin-left: 10px;
    }
    .btn-close {
      position: absolute;
      right: 20px;
      line-height: 20px;
      top: 10px;
      font-size: 14px;
    }
  }
  .content {
    flex: 1;
    overflow: auto;
  }
  .van-loading {
    margin: 30px;
  }
  .van-cell-group {
    .van-cell {
      .van-cell__title {
        .version {
          font-size: 10px;
          margin-left: 3px;
        }
      }
      .van-cell__value {
        flex: none;
        .status1 {
          color: #67c23a;
        }
        .status2 {
          color: #e6a23c;
        }
        .status3 {
          color: #f56c6c;
        }
      }
      .van-cell__label {
        margin-top: 0;
      }
    }
  }
}
</style>
