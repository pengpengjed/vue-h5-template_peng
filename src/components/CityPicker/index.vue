<template>
  <transition name="city-picker">
    <div v-show="showUp" class="city-picker" v-on:click.self="close">
      <div class="inner-box flex-column">
        <input type="hidden" v-bind:value="myCity" v-on:input="$emit('input', $event.target.value)" />

        <div class="search-bar flex">
          <input
            v-model="keyword"
            class="flex-1"
            type="search"
            style="width: 85%"
            name
            placeholder="机场三字码，如 CAN 或 can"
          />
          <span class="colse-btn" v-on:click="close">关闭</span>
        </div>

        <div class="tab flex">
          <div class="flex-1 item" :class="{ active: type === 'internal' }" @click="type = 'internal'">
            国内（含港澳台）
          </div>
          <div class="flex-1 item" :class="{ active: type === 'international' }" @click="type = 'international'">
            国际
          </div>
        </div>

        <div class="city-pad flex-1">
          <div class="city-box oy">
            <ul class="list-unstyled">
              <li v-for="(cities, index) in cityData[type]" :key="index">
                <div class="title" :class="'title-' + index">{{ index }}</div>
                <ul class="city-list">
                  <li v-for="(city, idx) in cities" :key="city.CODE + city.CITY + idx" @click="select(city)">
                    {{ city.CITY + '（' + city.CODE + '）' }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <div class="index-bar">
            <ul class="list-unstyled">
              <li v-for="(cities, key) in cityData[type]" :key="key" @click="setIndex(key)">{{ key }}</li>
            </ul>
          </div>
        </div>

        <div class="filter-pad oy" v-show="keyword.trim()">
          <ul class="city-list">
            <li
              v-for="(city, index) in lvSheet"
              @click="select(city)"
              :key="city.CODE + city.CITY + index"
              v-show="filter.test(city.CODE) || filter.test(city.keyword)"
            >
              {{ city.CITY + '（' + city.CODE + '）' }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.city-picker {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 900;
  padding-top: 4em;
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 16px;
}

.flex-column {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-flex;
  flex-direction: column;
}

.flex {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  display: -webkit-flex;
}
.flex-1 {
  flex: 1;
}
.flex-2 {
  flex: 2;
}
.flex-3 {
  flex: 3;
}
.inner-box {
  height: 100%;
  background: #fff;
  transform: translateY(0);
}
.search-bar {
  padding: 0.5em 0.75em;
  align-items: center;
  background: #42a5f5;
}
input {
  padding: 0.375em 0.75em;
  line-height: 1.5;
}
.search-icon {
  margin-right: 0.625em;
}
.search-bar input {
  border: none;
  outline: none;
}
.colse-btn {
  color: #fff;
  display: inline-block;
  margin-left: 0.8em;
}
.oy {
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.tab {
  text-align: center;
}
.tab .item {
  padding: 0.6em 0.75em;
  border-bottom: 4px solid #dad9d9;
}
.tab .active {
  color: #42a5f5;
  border-bottom-color: #42a5f5;
}
.city-pad {
  position: relative;
  overflow-y: hidden;
}
.city-box {
  height: 100%;
}
.title {
  background: #f5f5f5;
  padding: 0.25em 0.625em;
}
.city-list {
  list-style: none;
  padding: 0 0.625em;
}
.city-list li {
  border-bottom: 1px dashed #e3e3e3;
  padding: 0.45em 0;
}
.city-list li:last-child {
  border-color: transparent;
}

.index-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0.6em;
  text-align: center;
  font-size: 12px;
}
.filter-pad {
  position: absolute;
  top: 52px;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 200;
}

.city-picker-enter-active,
.city-picker-leave-active {
  transition: background-color 0.5s;
}
.city-picker-enter, .city-picker-leave-to /* .fade-leave-active below version 2.1.8 */ {
  background-color: rgba(0, 0, 0, 0);
}
.city-picker-enter-active .inner-box,
.city-picker-leave-active .inner-box {
  transition: transform 0.5s;
}
.city-picker-enter .inner-box,
.city-picker-leave-to .inner-box {
  transform: translateY(100%);
}
</style>

<script>
export default {
  name: 'city-picker',

  props: ['value', 'showUp'],
  data() {
    return {
      lvSheet: [],
      keyword: '',

      cityData: {},
      type: 'internal',

      myCity: this.value
    }
  },
  computed: {
    filter() {
      return new RegExp(this.keyword, 'i')
    }
  },
  methods: {
    close() {
      this.$emit('close')
      this.keyword = ''
    },
    setIndex(key) {
      var node = document.querySelector('.title-' + key)
      var scroller = document.querySelector('.city-box')
      scroller.scrollTop = node.offsetTop
    },
    select(item) {
      var city = {
        code: item.CODE,
        city: item.CITY
      }
      this.myCity = city
      this.$emit('select', city)
      this.keyword = ''
    },

    ajCityData() {
      // 根据 远程api接口，请求城市清单  feilong 修订
      var moni = 1
      if (moni) {
        var res = require('./citydata.json') // 规范的 citydata
        this.cityData = res

        var gld = require('./gld.json') // 规范的 过滤单
        this.lvSheet = gld.data
      } else {
        var requrl = this.appSetting.apiHost + this.appSetting.apiPath1 + 'queryALLCities'
        this.$axios({
          method: 'post',
          url: requrl,
          data: {}
        }).then(response => {
          this.newCityData(response.data)
          this.$toast.clear()
        })
      }
    },

    newCityData(resData) {
      // 根据接口返回数据，重新组织json

      function sortByPinyin(a, b) {
        // 排序
        // let keyA, keyB
        const keyA = a[3].toLowerCase()
        const keyB = b[3].toLowerCase()
        if (keyA < keyB) {
          return -1
        }
        if (keyA > keyB) {
          return 1
        }
        return 0
      }

      const newResJson = {
        // 所需规范的 城市清单 json格式 feilong
        internal: {
          热门: [],
          A: [],
          B: [],
          C: [],
          D: [],
          E: [],
          F: [],
          G: [],
          H: [],
          I: [],
          J: [],
          K: [],
          L: [],
          M: [],
          N: [],
          O: [],
          P: [],
          Q: [],
          R: [],
          S: [],
          T: [],
          U: [],
          V: [],
          W: [],
          X: [],
          Y: [],
          Z: []
        },
        international: {
          热门: [],
          A: [],
          B: [],
          C: [],
          D: [],
          E: [],
          F: [],
          G: [],
          H: [],
          I: [],
          J: [],
          K: [],
          L: [],
          M: [],
          N: [],
          O: [],
          P: [],
          Q: [],
          R: [],
          S: [],
          T: [],
          U: [],
          V: [],
          W: [],
          X: [],
          Y: [],
          Z: []
        }
      }

      for (var k in resData) {
        // 调整并分组 feilong
        var dd = resData[k]
        dd[3] = window.PinyinHelper.convertToPinyinString(dd[1], ' ', window.PinyinFormat.WITHOUT_TONE) // 根据中文名获得拼音
        var zukey = dd[3].charAt(0).toUpperCase()
        if (dd[2] === '1') {
          newResJson.internal[zukey].push(dd)
        } else {
          newResJson.international[zukey].push(dd)
        }
      }

      let cities // 某组比如热门 下的 城市二维数组
      for (var l in newResJson) {
        // 排序并精简 feilong
        var region = newResJson[l]
        for (var groupName in region) {
          cities = region[groupName]

          if (cities.length) {
            cities.sort(sortByPinyin)
          } else {
            delete region[groupName]
          }
        }
      }

      this.cityData = newResJson // 国际国内分组城市清单

      this.lvSheet = resData // 过滤单
    }
  },

  watch: {
    value(newv) {
      this.myCity = newv
    },

    myCity(newv) {
      if (newv) {
        this.$emit('input', newv)
      }
    }
  },

  created() {
    // 只需请求一次 feilong.org
    this.ajCityData()
  }
}
</script>
