<template>
  <div class="cs-paging-list" ref="list" @scroll="onScroll">
    <van-pull-refresh v-model="refreshing" @refresh="refresh(true)" :disabled="!refreshable || refreshDisabled">
      <van-list
        :offset="scrollOffset"
        :immediate-check="immediateCheck"
        v-model="loading"
        @load="loadData"
        :finished="finished"
        :finished-text="getFinishedText"
        :error.sync="error"
        error-text="请求失败，点击重新加载"
      >
        <slot :data="dataList"></slot>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
export default {
  name: 'csPagingList',
  props: {
    //合并回调
    megerCB: {
      type: [Function, Array]
    },
    //立即执行
    immediateCheck: {
      type: Boolean,
      default: true
    },
    // 远程数据地址
    url: {
      type: String
    },
    // 查询参数
    queryParams: {
      type: Object
    },
    // 其它参数
    otherParams: {
      type: Object
    },
    // 查询参数有变动时，自动加载列表
    autoLoad: {
      type: Boolean,
      default: true
    },
    // ajax请求方法
    method: {
      type: String,
      default: 'post' // 对应utils目录里面http中的方法
    },
    // 设置每页条数
    pageSize: {
      type: Number,
      default: 50
    },
    // 自定义数据加载方法
    load: {
      type: Function
    },
    // 设置加载返回数据列表字段，由于有些接口返回数据格式不同，会返回一个实体，里面某个字段才是列表数据
    dataField: {
      type: String
    },
    // 数据处理，可对数据进行个性化处理
    dataHandle: {
      type: Function
    },
    // 用于缓存数据
    storeKey: {
      type: String
    },
    // 设置是否分页
    pagination: {
      type: Boolean,
      default: true
    },
    // 本地数据分页
    localPagination: {
      type: Boolean,
      default: false
    },
    // 设置查询参数pageSize的参数名
    pageSizeField: {
      type: String,
      default: 'pageSize'
    },
    // 设置查询参数pageIndex的参数名
    pageIndexField: {
      type: String,
      default: 'pageCount'
    },
    // 设置是否可以刷新
    refreshable: {
      type: Boolean,
      default: true
    },
    // 查询参数监听器防抖开关
    debounce: {
      type: Boolean,
      default: false
    },
    finishedText: {
      type: String
    },
    // 固定参数
    scrollOffset: {
      type: [Number, String],
      default: 300
    },
    // 返回结果是否为json
    isReturnJSON: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pageIndex: 1,
      refreshing: false,
      refreshDisabled: false,
      loading: false,
      finished: false,
      error: false,
      dataList: [],
      localData: null, // 本地数据，用于本地分页
      scrollTop: 0,
      debounceTimer: null,
      debounceDelay: 300,
      originDataList: []
    }
  },
  created() {},
  activated() {
    // 恢复滚动位置
    if (this.scrollTop && this.$refs.list) {
      this.$refs.list.scrollTop = this.scrollTop
    }
  },
  mounted() {
    if (this.immediateCheck) {
      if (this.storeKey) {
        const storageData = this.$sessionStorage.getItem(this.storeKey)
        if (storageData) {
          this.pageIndex = storageData.pageIndex
          this.dataList = storageData.dataList
          this.finished = storageData.finished
          this.$emit('load-success', this.dataList)
        } else {
          this.loadData()
        }
      } else {
        this.loadData()
      }
    }
    // 自动滚动到上次的位置
    if (this.storeKey) {
      const scrollTop = this.$sessionStorage.getItem(`${this.storeKey}_SCROLLTOP`)
      if (scrollTop) {
        this.$nextTick(() => {
          this.$refs.list.scrollTop = scrollTop
        })
      }
    }
  },
  methods: {
    handleMergerData(data, mergerKeys) {
      const result = []
      for (const item of data) {
        const found = result.find(group => {
          return mergerKeys && mergerKeys.length > 0
            ? mergerKeys.every(everyItem => {
                return group[everyItem] === item[everyItem]
              })
            : false
        })
        if (!found) {
          const newGroup = {
            ...item,
            mergerList: [item]
          }
          result.push(newGroup)
        } else {
          found.mergerList.push(item)
        }
      }
      return result
    },
    loadData(isRefresh = false, pageSize = null) {
      if (!pageSize) {
        pageSize = this.pageSize
      }

      return new Promise((resolve, reject) => {
        // 本地数据分页
        if (this.localPagination && this.localData) {
          let data = []
          for (let i = (this.pageIndex - 1) * pageSize, len = this.pageIndex * pageSize; i < len; i++) {
            if (i < this.localData.length) {
              data.push(this.localData[i])
            } else {
              break
            }
          }
          // 判断是否需要对数据进行个性化处理
          if (this.dataHandle) {
            data.forEach(item => {
              this.dataHandle(item)
            })
          }
          if (this.megerCB) {
            this.originDataList = [...this.originDataList, ...data]
            this.dataList = Array.isArray(this.megerCB)
              ? this.handleMergerData(isRefresh ? data : [...this.originDataList], this.megerCB)
              : [...this.megerCB(isRefresh ? data : [...this.originDataList])]
          } else {
            this.dataList = isRefresh ? data : [...this.dataList, ...data]
          }
          this.finished = !this.pagination || data.length < pageSize
          this.loading = false
          this.pageIndex++
          this.error = false
          this.$emit('load-success', data)
          resolve(data)
          return
        }
        // 自定义加载方式
        if (this.load) {
          this.loading = !isRefresh
          this.load(this.pageIndex, pageSize)
            .then(data => {
              // 本地分页，第一次获取到数据
              if (this.localPagination) {
                this.localData = [...data]
                data = data.slice(0, pageSize)
              }
              this.dataList = isRefresh ? data : [...this.dataList, ...data]
              this.finished = !this.pagination || data.length < pageSize
              // 缓存数据
              if (this.storeKey) {
                this.$sessionStorage.setItem(this.storeKey, {
                  pageIndex: this.pageIndex,
                  dataList: this.dataList,
                  finished: this.finished
                })
              }
              this.pageIndex++
              this.error = false
              this.$emit('load-success', data)
              resolve(data)
            })
            .catch(err => {
              this.error = true
              reject(err)
            })
            .finally(() => {
              this.loading = false
            })
          return
        }

        // 默认加载数据方法
        if (!this.url) {
          reject(new Error('滚动列表组件未设置url'))
        }
        this.loading = !isRefresh
        // 设置分页参数
        const params =
          this.pagination && !this.localPagination
            ? { [this.pageSizeField]: pageSize, [this.pageIndexField]: this.pageIndex }
            : {}
        // 调用接口获取数据
        this.$http[this.method](this.url, Object.assign(params, this.otherParams, this.queryParams))
          .then(async data => {
            let result = JSON.parse(JSON.stringify(data))
            if (this.isReturnJSON && typeof data === 'string') {
              result = JSON.parse(data)
            }
            let total = 0
            if (result) {
              total = result.total
            }
            if (this.dataField) {
              result = result[this.dataField] || []
            }

            result = result || []
            // 本地分页，第一次获取到数据
            if (this.localPagination) {
              this.localData = [...result]
              result = result.slice(0, pageSize)
            }
            // 判断是否需要对数据进行个性化处理
            if (this.dataHandle) {
              const promises = result.map(item => {
                const ret = this.dataHandle(item)
                return ret instanceof Promise ? ret : Promise.resolve()
              })
              await Promise.all(promises)
            }
            if (this.megerCB) {
              this.originDataList = [...this.originDataList, ...result]
              this.dataList = Array.isArray(this.megerCB)
                ? this.handleMergerData(isRefresh ? result : [...this.originDataList], this.megerCB)
                : [...this.megerCB(isRefresh ? data : [...this.originDataList])]
            } else {
              this.dataList = isRefresh ? result : [...this.dataList, ...result]
            }
            this.finished = total === this.dataList.length ? true : !this.pagination || result.length < pageSize
            // 缓存数据
            if (this.storeKey) {
              this.$sessionStorage.setItem(this.storeKey, {
                pageIndex: this.pageIndex,
                dataList: this.dataList,
                finished: this.finished
              })
            }
            this.pageIndex++
            this.error = false
            this.$emit('load-success', result)
            resolve(result)
          })
          .catch(err => {
            this.error = true
            reject(err)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    refresh(emitRefreshEvent = false) {
      if (this.loading) {
        return
      }
      this.originDataList = []
      this.refreshing = true
      this.pageIndex = 1
      // this.finished = false
      this.$refs.list.scrollTop = 0
      if (this.localPagination) {
        this.localData = null
      }
      this.loadData(true).finally(() => {
        this.refreshing = false
        if (emitRefreshEvent) {
          this.$emit('refresh-success')
        }
      })
    },
    reload() {
      // 重载列表
      if (this.loading) {
        return
      }
      let tempIndex = this.pageIndex
      let pageSize = (this.pageIndex - 1) * this.pageSize
      this.pageIndex = 1
      if (this.localPagination) {
        this.localData = null
      }
      this.loadData(true, pageSize).finally(() => {
        this.pageIndex = tempIndex
      })
    },
    onScroll(e) {
      // 记住滚动位置
      const el = e.target
      const scrollTop = el.scrollTop
      this.scrollTop = scrollTop
      if (this.storeKey) {
        this.$sessionStorage.setItem(`${this.storeKey}_SCROLLTOP`, scrollTop)
      }
      // 传递事件
      this.$emit('scroll', e)
    },
    clearCache() {
      if (this.storeKey) {
        this.$sessionStorage.removeItem(this.storeKey)
        this.$sessionStorage.removeItem(`${this.storeKey}_SCROLLTOP`)
      }
    },
    // 获取数据列表
    getData() {
      return this.dataList
    },
    //重新赋值数据列表
    setData(list) {
      this.dataList = JSON.parse(JSON.stringify(list))
      this.$forceUpdate()
    }
  },
  computed: {
    getFinishedText() {
      if (this.finishedText) {
        return this.finishedText
      } else {
        return this.dataList.length ? '— 已加载全部数据 —' : '— 暂无数据 —'
      }
    }
  },
  watch: {
    queryParams: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          clearTimeout(this.debounceTimer)
          if (this.debounce) {
            this.debounceTimer = setTimeout(() => {
              if (this.autoLoad) {
                this.refreshable ? this.refresh(false) : this.reload()
              }
            }, this.debounceDelay)
          } else {
            if (this.autoLoad) {
              this.refreshable ? this.refresh(false) : this.reload()
            }
          }
        })
      }
    }
  }
}
</script>

<style lang="less">
.cs-paging-list {
  height: 100%;
  overflow: auto;
  position: absolute;
  width: 100%;
  box-sizing: border-box;

  .van-pull-refresh {
    .van-pull-refresh__head {
      & > div {
        margin-bottom: 10px;
      }
      .van-pull-refresh__loading {
        margin-bottom: 10px;
        & > span {
          margin-left: 10px;
        }
      }
    }
  }
  .scroll-loading {
    color: #90a4ef;
    padding: 10px 15px;
    text-align: center;
    display: block;
    margin: 0 auto;
  }
  .no-data-tip {
    padding: 15px;
    text-align: center;
    color: #888888;
  }
  .debug-message {
    position: fixed;
    left: 0;
    top: 100px;
    width: 100%;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.8);
    line-height: 30px;
    font-size: 13px;
    color: #ffffff;
    z-index: 9999999999;
    overflow: hidden;

    & > span {
      float: left;
      width: 50%;
    }
  }
  .van-list__loading,
  .van-list__finished-text,
  .van-list__error-text {
    color: #bcc2d2;
  }
}
</style>
