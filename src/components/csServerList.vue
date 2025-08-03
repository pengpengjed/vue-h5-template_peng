<template>
  <div class="cs-server-list">
    <div class="header">
      <span name="button" @click="onCloseClick">关闭</span>
      <span name="title">选择服务器</span>
      <span name="button" @click="onConfirmClick">确定</span>
    </div>
    <div class="content">
      <van-tabs v-model="active" class="page-tabs">
        <van-tab title="飞行门户">
          <van-cell-group>
            <van-cell v-for="item in serverList.ieb" :key="item.name" @click="onServerItemClick(item)">
              <template v-if="item.name === '默认'">
                <span>{{ item.name }}</span>
              </template>
              <template v-else>
                <span>{{ item.url }}</span>
                <span>({{ item.name }})</span>
              </template>

              <div class="cell-description" v-if="item.description">
                <span>{{ item.description }}</span>
              </div>

              <template #right-icon v-if="item.checked">
                <van-icon name="success" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-tab>
        <van-tab title="天健系统">
          <van-cell-group>
            <van-cell v-for="item in serverList.ifly" :key="item.name" @click="onIflyServerItemClick(item)">
              <template v-if="item.name === '默认'">
                <span>{{ item.name }}</span>
              </template>
              <template v-else>
                <span>{{ item.url }}</span>
                <span>({{ item.name }})</span>
              </template>

              <div class="cell-description" v-if="item.description">
                <span>{{ item.description }}</span>
              </div>

              <template #right-icon v-if="item.checked">
                <van-icon name="success" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServerList',
  data() {
    return {
      serverList: { ieb: [], ifly: [] },
      prevIebUrl: '',
      prevIflyUrl: ''
    }
  },
  created() {
    // 飞行门户
    const testServer = [
      { name: '测试', url: 'https://iebtest.csair.com', checked: false },
      { name: '安测', url: 'https://eplmtest.csair.com', checked: false }
    ]
    const devServer = [
      { name: '廖永强', url: 'http://10.95.15.113:880', checked: false },
      { name: '周波', url: 'http://10.95.15.87:882', checked: false },
      { name: '武永超', url: 'http://10.95.15.137:881', checked: false },
      { name: '黄南华', url: 'http://10.95.23.18:8080', checked: false },
      { name: '万波80', url: 'http://10.95.15.90:8080', checked: false },
      { name: '万波90', url: 'http://10.95.15.90:9090', checked: false },
      { name: '陈文强', url: 'http://10.95.15.147:8081', checked: false },
      { name: '陈文强', url: 'http://10.95.15.147:8060', checked: false },
      { name: '董理', url: 'http://10.95.15.148:9095', checked: false },
      { name: '邓伟楠', url: 'http://10.95.15.227:8080', checked: false },
      { name: '陈湘', url: 'http://10.95.15.167:881', checked: false },
      { name: '余晓杨', url: 'http://10.95.15.244:881', checked: false },
      { name: '黄嘉颖', url: 'http://10.95.15.154:880', checked: false },
      { name: '邓颖辉', url: 'http://10.95.15.89:8060', checked: false },
      { name: '吴佳乐', url: 'http://10.95.15.243:8060', checked: false },
      { name: '吴大伟', url: 'http://10.95.15.213:8061', checked: false }
    ]
    // 天健系统
    const iflyTestServer = [
      { name: '测试', url: 'https://iflytest.csair.com/api', checked: false },
      { name: '安测', url: 'https://iflydev.csair.com/api', checked: false }
    ]
    const iflyDevServer = [
      { name: '周波', url: 'http://10.95.15.87:8060', checked: false },
      { name: '武永超', url: 'http://10.95.15.137:8060', checked: false },
      { name: '万波', url: 'http://10.95.15.90:8060', checked: false },
      { name: '陈文强', url: 'http://10.95.15.147:8060', checked: false },
      { name: '董理', url: 'http://10.95.15.148:8060', checked: false },
      { name: '黄民乾', url: 'http://10.95.15.105:8060', checked: false },
      { name: '黄依婷', url: 'http://10.95.13.244:8060', checked: false },
      { name: '廖永强', url: 'http://10.95.15.113:8060', checked: false },
      { name: '余晓杨', url: 'http://10.95.15.244:8060', checked: false },
      { name: '冯世昌', url: 'http://10.95.15.199:8060', checked: false },
      { name: '邓颖辉', url: 'http://10.95.15.89:8060', checked: false },
      { name: '吴佳乐', url: 'http://10.95.15.243:8060', checked: false },
      { name: '陈伟楠', url: 'http://10.95.15.251:8060', checked: false },
      { name: '黄嘉颖', url: 'http://10.95.15.154:8060', checked: false },
      { name: '杨启正', url: 'http://10.95.15.88:8060', checked: false },
      { name: '周凤翔', url: 'http://10.95.15.252:8060', checked: false },
      { name: '叶军', url: 'http://10.95.15.82:8060', checked: false },
      { name: '吴大伟', url: 'http://10.95.15.213:8060', checked: false },
      { name: '廖凯林', url: 'http://10.95.15.206:8060', checked: false },
      { name: '张国海', url: 'http://10.95.15.115:8060', checked: false }
    ]

    if (this.isInApp && this.isTestPlatform) {
      // 测试环境
      this.serverList.ieb = [{ name: '默认', url: '', checked: false }, ...testServer]
      this.serverList.ifly = [{ name: '默认', url: '', checked: false }, ...iflyTestServer]
    } else if (!this.isInApp) {
      // 开发环境
      this.serverList.ieb = [{ name: '默认', url: '', checked: false }, ...testServer, ...devServer]
      this.serverList.ifly = [{ name: '默认', url: '', checked: false }, ...iflyTestServer, ...iflyDevServer]
    }
    this.init()
  },
  methods: {
    init() {
      // 飞行门户
      const url = this.$localStorage.getItem(this.$storeKeys.webApiHost) || ''
      this.prevIebUrl = url
      for (let item of this.serverList.ieb) {
        if (item.url === url) {
          item.checked = true
          break
        }
      }
      // 天健系统
      const iflyUrl = this.$localStorage.getItem(this.$storeKeys.iflyWebApiHost) || ''
      this.prevIflyUrl = iflyUrl
      for (let item of this.serverList.ifly) {
        if (item.url === iflyUrl) {
          item.checked = true
          break
        }
      }
    },
    onCloseClick() {
      // 还原选中
      this.serverList.ieb.forEach(item => {
        item.checked = item.url === this.prevIebUrl
      })
      this.serverList.ifly.forEach(item => {
        item.checked = item.url === this.prevIflyUrl
      })
      this.$emit('close')
    },
    onConfirmClick() {
      // 飞行门户
      for (const item of this.serverList.ieb) {
        if (item.checked) {
          if (item.url) {
            this.$localStorage.setItem(this.$storeKeys.webApiHost, item.url)
          } else {
            this.$localStorage.removeItem(this.$storeKeys.webApiHost)
          }
          break
        }
      }
      // 天健系统
      for (const item of this.serverList.ifly) {
        if (item.checked) {
          if (item.url) {
            this.$localStorage.setItem(this.$storeKeys.iflyWebApiHost, item.url)
          } else {
            this.$localStorage.removeItem(this.$storeKeys.iflyWebApiHost)
          }
          break
        }
      }

      // 清除关联用户，不同服务器token不共享
      this.$localStorage.removeItem(this.$storeKeys.relateUser)
      this.$emit('close')
      window.location.reload()
    },
    onServerItemClick(item) {
      this.serverList.ieb.forEach(node => {
        node.checked = false
      })
      item.checked = true
      // if (item.url) {
      //   this.$localStorage.setItem(this.$storeKeys.webApiHost, item.url);
      // } else {
      //   this.$localStorage.removeItem(this.$storeKeys.webApiHost);
      // }
      // // 清除关联用户，不同服务器token不共享
      // this.$localStorage.removeItem(this.$storeKeys.relateUser);
      // this.$emit("close");
      // window.location.reload();
    },
    onIflyServerItemClick(item) {
      this.serverList.ifly.forEach(node => {
        node.checked = false
      })
      item.checked = true
      // if (item.url) {
      //   this.$localStorage.setItem(this.$storeKeys.iflyWebApiHost, item.url);
      // } else {
      //   this.$localStorage.removeItem(this.$storeKeys.iflyWebApiHost);
      // }
      // // 清除关联用户，不同服务器token不共享
      // this.$localStorage.removeItem(this.$storeKeys.relateUser);
      // this.$emit("close");
      // window.location.reload();
    }
  }
}
</script>

<style lang="less">
.cs-server-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  .header {
    background-color: #3788fe;
    height: 40px;
    line-height: 40px;
    position: relative;
    text-align: center;
    color: #ffffff;
    font-size: 16px;
    display: flex;
    flex-direction: row;

    span[name='title'] {
      flex: 1;
    }
    span[name='button'] {
      line-height: 40px;
      font-size: 14px;
      padding: 0 20px;
    }
  }
  .content {
    flex: 1;
    overflow: auto;
    position: relative;
  }
  .van-cell-group {
    .van-cell {
      .van-cell__value {
        span + span {
          margin-left: 10px;
        }
      }
      .van-icon-success {
        color: #1989fa;
        line-height: 24px;
      }
      .cell-description {
        font-size: 12px;
        color: #969799;
        line-height: 18px;
        margin-top: 4px;
      }
    }
  }
}
</style>
