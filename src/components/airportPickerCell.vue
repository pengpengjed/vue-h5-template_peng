<template>
  <van-cell class="airport-picker-cell" :title="title" :is-link="!disabled" @click="onCellClick" :required="required">
    <div class="picker-cell-value">
      <template v-if="selectedItem">
        <span>{{ componentText }}</span>
        <van-icon name="cross" @click.stop="onClearClick" v-if="clearable && !disabled" />
      </template>
      <div v-else class="nodata">请选择</div>
    </div>
    <van-popup class="airport-picker-popup" v-model="popupVisible" get-container="body" position="bottom">
      <div class="container">
        <div class="header">
          <div class="button" @click="popupVisible = false">关闭</div>
          <div class="search"><input type="text" placeholder="请输入关键字搜索" v-model="keyword" /></div>
          <div class="button"><div @click="onClearClick" v-if="clearable">清空</div></div>
        </div>
        <div class="content">
          <!--索引列表-->
          <div class="airport-index">
            <van-tabs v-model="airportType">
              <van-tab title="国内（含港澳台）" name="internal"></van-tab>
              <van-tab title="国际" name="international"></van-tab>
            </van-tabs>
            <div class="index-content">
              <van-index-bar :sticky="false">
                <template v-for="(airports, index) in airportIndexData[airportType]">
                  <template v-if="airports.length">
                    <van-index-anchor :index="index" :key="index" />
                    <van-cell
                      v-for="item in airports"
                      :key="index + '_' + item.CODE"
                      :title="`${item.CITY} (${item.CODE})`"
                      :class="{ 'index-actived': getItemClass(item) }"
                      @click="onPickerItemClick(item)"
                    />
                  </template>
                </template>
              </van-index-bar>
            </div>
          </div>
          <!--搜索列表-->
          <div class="airport-search" v-show="keyword.trim()">
            <van-cell-group>
              <van-cell
                v-for="item in airportSearchData"
                :key="item.CODE"
                :title="`${item.CITY} (${item.CODE})`"
                v-show="searchFilter.test(item.CODE) || searchFilter.test(item.keyword)"
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
import { IndexBar, IndexAnchor } from 'vant'
export default {
  name: 'airportPickerCell',
  components: {
    VanIndexBar: IndexBar,
    VanIndexAnchor: IndexAnchor
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
    }
  },
  data() {
    return {
      componentValue: '',
      popupVisible: false,
      keyword: '',
      airportIndexData: {},
      airportSearchData: [],
      airportType: 'internal',
      selectedItem: null
    }
  },
  created() {
    this.airportIndexData = require('./CityPicker/citydata.json') || {}
    this.airportSearchData = (require('./CityPicker/gld.json') || {}).data || []
    this.componentValue = this.value
    this.initData()
  },
  methods: {
    initData() {
      if (this.value) {
        for (let item of this.airportSearchData) {
          if (item.CODE === this.value) {
            this.selectedItem = item
            break
          }
        }
      }
    },
    onCellClick() {
      this.popupVisible = true
    },
    onPickerItemClick(item) {
      this.componentValue = item.CODE
      this.selectedItem = item
      this.$emit('select', item)
      this.popupVisible = false
    },
    onClearClick() {
      this.componentValue = ''
      this.selectedItem = null
      this.keyword = ''
      this.popupVisible = false
    },
    getItemClass(item) {
      return this.selectedItem && item.CODE === this.selectedItem.CODE
    }
  },
  computed: {
    searchFilter() {
      return new RegExp(this.keyword, 'i')
    },
    componentText() {
      if (this.selectedItem) {
        return `${this.selectedItem.CITY} (${this.selectedItem.CODE})`
      } else {
        return ''
      }
    }
  },
  watch: {
    value(newValue) {
      this.componentValue = newValue
    },
    componentValue(newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>

<style lang="less">
.airport-picker-cell {
  .picker-cell-value {
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
