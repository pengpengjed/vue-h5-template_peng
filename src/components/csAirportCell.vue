<template>
  <van-cell class="cs-airport-cell" :title="title" :is-link="!disabled" @click="onCellClick" :required="required" :icon="icon">
    <div class="picker-cell-value">
      <template v-if="selectedItem">
        <span class="componentText">{{ componentText }}</span>
        <van-icon class="clearIcon" color="#c0c4cc" name="clear" @click.stop="onClearClick" v-if="clearable" />
      </template>
      <div v-else class="nodata">请选择</div>
    </div>
    <van-popup class="airport-picker-popup" v-model="popupVisible" get-container="body" position="bottom">
      <div class="container">
        <div class="header">
          <div class="button" @click="popupVisible = false">关闭</div>
          <div class="search">
            <input type="text" placeholder="请输入关键字搜索" v-model="keyword" />
          </div>
          <div class="button"><div @click="onClearClick" v-if="clearable">清空</div></div>
        </div>
        <div class="content">
          <div class="airport-index">
            <div class="index-content">
              <van-index-bar :sticky="false" v-if="!isPagnation">
                <template v-for="(airports, index) in airportIndexData">
                  <template v-if="airports.length">
                    <van-index-anchor :index="index" :key="index" />
                    <van-cell
                      v-for="item in airports"
                      :key="index + '_' + item.value"
                      :title="`${item.name} (${item.value})`"
                      :class="{ 'index-actived': getItemClass(item) }"
                      @click="onPickerItemClick(item)"
                    />
                  </template>
                </template>
              </van-index-bar>
              <csPagingList
                v-bind="$attrs"
                v-on="$listeners"
                v-else
                ref="csPagingListRef"
                :otherParams="queryParams"
                :url="url"
              >
                <template #default="{data}">
                  <van-cell
                    v-for="item in data"
                    :key="index + '_' + item.value"
                    :title="`${item.name} (${item.value})`"
                    :class="{ 'index-actived': getItemClass(item) }"
                    @click="onPickerItemClick(item)"
                  />
                </template>
              </csPagingList>
            </div>
          </div>
          <!--搜索列表-->
          <div class="airport-search" v-show="keyword.trim() && !isPagnation">
            <van-cell-group>
              <van-cell
                v-for="item in airportSearchData"
                :key="item.value"
                :title="`${item.name} (${item.value})`"
                v-show="searchFilter.test(item.value) || searchFilter.test(item.keyword)"
                @click="onPickerItemClick(item)"
              ></van-cell>
            </van-cell-group>
          </div>
        </div>
      </div>
    </van-popup>
  </van-cell>
</template>

<script>
import { IndexBar, IndexAnchor } from "vant";
import csPagingList from "./csPagingList.vue";
import pinyin from "pinyin";
export default {
  name: "csAirportCell",
  components: {
    VanIndexBar: IndexBar,
    VanIndexAnchor: IndexAnchor,
    csPagingList
  },
  props: {
    // 设置绑定值
    value: {
      type: String
    },
    // 设置标题
    title: {
      type: String
    },
    // 设置是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 设置是否为必填
    required: {
      type: Boolean,
      default: false
    },
    // 设置是否可清空选中值
    clearable: {
      type: Boolean,
      default: false
    },
    // 请求地址
    url: {
      type: String,
      default: "/restapp/rird/enum/port"
    },
    // 是否组件初始化请求数据
    immediateResquest: {
      type: Boolean,
      default: true
    },
    // 是否启用分页
    isPagnation: {
      type: Boolean,
      default: false
    },
    storeKey: {
      type: String,
      default: () => {
        return Math.random().toString(36).substring(2, 9);
      }
    },
    // 左侧图标
    icon: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      componentValue: "",
      popupVisible: false,
      keyword: "",
      airportIndexData: {},
      airportSearchData: [],
      airportType: "internal",
      selectedItem: null,
      airportIndexDataSessionKey: "AIRPORT_INDEX_DATA_SESSION_KEY",
      airportSearchDataSessionKey: "AIRPORT_SEARCH_DATA_SESSION_KEY",

      queryParams: {
        // 搜索参数
        str: "" // 搜索关键字
      },
      debounceTimer: null,
      debounceDelay: 500 // 防抖延迟时间，单位毫秒
    };
  },
  created() {
    this.componentValue = this.value;
    this.immediateResquest && this.loadData();
  },
  methods: {
    /**
     * 分页模式请求数据
     */
    queryHandle(str) {
      this.isPagnation && (this.queryParams.str = str || "");
      this.$nextTick(() => {
        this.$refs.csPagingListRef && this.$refs.csPagingListRef?.refresh();
      });
    },
    /**
     * 输入框防抖
     */
    handleInput(str) {
      if (!this.isPagnation) return;
      clearTimeout(this.debounceTimer); // 使用统一的timer变量
      this.debounceTimer = setTimeout(() => {
        this.queryHandle(str);
      }, this.debounceDelay);
    },
    async initData() {
      let findSource = [];
      if (this.value) {
        if (!this.immediateResquest && !this.isPagnation) {
          let airportIndexData = this.$sessionStorage.getItem(this.airportIndexDataSessionKey);
          let airportSearchData = this.$sessionStorage.getItem(this.airportSearchDataSessionKey);
          if (airportIndexData && airportSearchData) {
            this.airportIndexData = airportIndexData;
            this.airportSearchData = airportSearchData;
            findSource = airportSearchData;
          }
        }
        if (this.isPagnation) {
          this.queryParams.str = this.value;
          this.keyword = this.value;
          const res = await this.$http.get({ url: this.url, data: { ...this.queryParams } });
          res.dataList && (findSource = res.dataList);
        }
        for (let item of findSource) {
          if (item.value === this.value) {
            this.selectedItem = item;
            break;
          }
        }
      }
    },
    /**
     * 非分页模式加载数据
     */
    loadData() {
      // 使用缓存数据
      let airportIndexData = this.$sessionStorage.getItem(this.airportIndexDataSessionKey);
      let airportSearchData = this.$sessionStorage.getItem(this.airportSearchDataSessionKey);
      if (airportIndexData && airportSearchData) {
        this.airportIndexData = airportIndexData;
        this.airportSearchData = airportSearchData;
        this.initData();
        return Promise.resolve();
      }
      // 远程获取数据
      return this.$http
        .get(this.url)
        .then(data => {
          let airportIndexData = {};
          let airportSearchData = [];
          for (var i = 0; i < 25; i++) {
            airportIndexData[String.fromCharCode(65 + i)] = [];
          }
          (data || []).forEach(item => {
            let pinyinStr = this.getPinYin(item.name);
            item.keyword = `${item.name} ${item.value} ${pinyinStr} ${pinyinStr.toUpperCase()}`;

            let indexValue = pinyinStr.substring(0, 1).toUpperCase();
            if (!airportIndexData[indexValue]) {
              airportIndexData[indexValue] = [];
            }
            airportIndexData[indexValue].push(item);
            airportSearchData.push(item);
          });
          this.airportIndexData = airportIndexData;
          this.airportSearchData = airportSearchData;
          // 保存缓存数据
          this.$sessionStorage.setItem(this.airportIndexDataSessionKey, this.airportIndexData);
          this.$sessionStorage.setItem(this.airportSearchDataSessionKey, this.airportSearchData);
          // 初始化默认值
          this.initData();
        })
        .catch(err => {
          console.error("加载机场数据失败:", err);
          this.hideLoading();
          return Promise.reject(err);
        });
    },
    getPinYin(name) {
      let result = [];
      let tmp = pinyin(name, {
        style: pinyin.STYLE_NORMAL
      });
      tmp.forEach(item => {
        result = [...result, ...item];
      });
      return result.join("");
    },
    async onCellClick() {
      this.showLoading("数据加载中...");
      !this.isPagnation && (await this.loadData());
      this.open();
    },
    open() {
      this.popupVisible = true;
      this.hideLoading();
    },
    onPickerItemClick(item) {
      this.componentValue = item.value;
      this.selectedItem = item;
      this.$emit("select", item);
      this.popupVisible = false;
      this.keyword = "";

      this.queryParams.str = "";
    },
    onClearClick() {
      this.componentValue = "";
      this.selectedItem = null;
      this.keyword = "";
      // this.popupVisible = false;
    },
    getItemClass(item) {
      return this.selectedItem && item.value === this.selectedItem.value;
    }
  },
  beforeDestroy() {
    this.debounceTimer && clearTimeout(this.debounceTimer);
  },
  computed: {
    searchFilter() {
      return new RegExp(this.keyword, "i");
    },
    componentText() {
      if (this.selectedItem) {
        return `${this.selectedItem.name} (${this.selectedItem.value})`;
      } else {
        return "";
      }
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler(newValue) {
        this.componentValue = newValue;
        this.initData(); // 重新初始化选中项
      }
    },
    componentValue(newValue) {
      this.$emit("input", newValue);
    },
    keyword: {
      deep: true,
      immediate: true,
      handler(newValue) {
        if (this.isPagnation) {
          this.queryParams.str = newValue;
        }
        this.handleInput(newValue);
      }
    }
  }
};
</script>

<style lang="less">
.cs-airport-cell {
  .clearIcon {
    margin-left: 5px;
  }
  .picker-cell-value {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    & > span {
      flex: 1;
    }
    .nodata {
      color: #969799;
    }
  }
}

.airport-picker-popup {
  width: 100%;
  height: 90%;
  .container {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .header {
      display: flex;
      padding: 2px 0px;
      background-color: #1989fa;
      align-items: center;
      border-radius: 20px 20px 0 0;
      .button {
        width: 60px;
        line-height: 36px;
        text-align: center;
        color: #ffffff;
        font-size: 14px;
      }
      .search {
        flex: 1;
        padding: 0px 10px;
        input {
          width: 100%;
          padding: 3px 5px;
          border-radius: 4px;
          background-color: #ffffff;
        }
      }
    }
    .content {
      flex: 1;
      position: relative;
      overflow: auto;
      .van-index-anchor {
        background-color: #f2f2f2;
      }
    }
    .airport-index {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .index-content {
        flex: 1;
        position: relative;
        overflow: auto;
      }
      .van-index-bar__sidebar {
        top: unset;
        bottom: 5%;
        transform: translateY(0px);
      }
      .index-actived {
        color: #0583f0;
      }
    }
    .airport-search {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: #fff;
      top: 0;
      left: 0;
      z-index: 2;
    }
  }
}
</style>
