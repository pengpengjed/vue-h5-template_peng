<template>
  <div class="cs-tree-cell van-cell">
    <van-cell :title="title" @click="onCellClick" :is-link="!disabled">
      <!-- <span>{{ componentValue ? selectedText : '请选择' }}</span> -->
      <div :class="{ 'no-data': !componentValue }" v-if="!componentValue">请选择</div>
      <template v-else>
        <div v-for="item in selectedText" :key="item" class="checked-item">{{ item }}</div>
      </template>
    </van-cell>
    <van-popup class="cs-tree-popup" v-model="popupVisible" position="bottom" get-container="body" v-if="!disabled">
      <!-- <van-nav-bar title="请选择" left-arrow @click-left="onNavBarClickLeft" @click-right="onNavBarClickRight"></van-nav-bar> -->
      <div class="cs-tree-popup_header">
        <span>请选择</span>
        <span class="btn-close" @click="onNavBarClickLeft">关闭</span>
      </div>
      <cs-search
        v-if="searchable"
        v-model="keyword"
        placeholder="请输入搜索关键词"
        @search="onSearch"
        @clear="onSearch"
      ></cs-search>
      <div class="cs-tree-popup_body" :class="{ searchable: searchable }">
        <van-loading size="24px" v-if="loading">加载中...</van-loading>
        <template v-else>
          <template v-if="treeData && treeData.length">
            <cs-tree-node
              v-for="item in treeData"
              :id-field="idField"
              :text-field="textField"
              :parent-field="parentField"
              :children-field="childrenField"
              :key="item.id"
              :value="item"
              :selected-value="selectedValue"
              :data-loader="loadData"
              :async="async"
              :multiple="multiple"
              :recursion="recursion"
              :merge-checked-value="mergeCheckedValue"
              :only-leaf-check="onlyLeafCheck"
              @input="onNodeInput(item, $event)"
            ></cs-tree-node>
          </template>
          <div class="no-data-tip" v-else>暂无数据</div>
        </template>
      </div>
      <!-- <div class="button-bar">
        <van-button type="info" @click="onNavBarClickLeft">关闭</van-button>
      </div> -->
    </van-popup>
  </div>
</template>

<script>
import csTreeNode from './csTreeNode'
export default {
  name: 'CsTreeCell',
  componentName: 'CsTreeCell',
  components: {
    csTreeNode
  },
  props: {
    // 用于绑定v-model
    value: {
      type: [Object, Array]
    },
    // 树节点数据
    data: {
      type: Array,
      default: () => []
    },
    // 标题
    title: {
      type: String
    },
    // 远程数据接口地址
    url: {
      type: String
    },
    // 调用远程接口参数
    queryParams: {
      type: Object,
      default: () => {}
    },
    // 设置ID字段
    idField: {
      type: String,
      default: 'id'
    },
    // 设置文本字段
    textField: {
      type: String,
      default: 'text'
    },
    // 设置父节点字段
    parentField: {
      type: String,
      default: 'parentId'
    },
    // 设置子节点字段
    childrenField: {
      type: String,
      default: 'children'
    },
    // 设置是否自动判断根节点
    autoRoot: {
      type: Boolean,
      default: true
    },
    // 设置根节点值
    rootId: {
      type: String,
      default: ''
    },
    // 设置多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 自定义数据加载
    dataLoader: {
      type: Function
    },
    // 设置是否同步加载子节点
    async: {
      type: Boolean,
      default: false
    },
    // 设置是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 设置是否排序
    sort: {
      type: Boolean,
      default: false
    },
    // 设置排序字段
    sortField: {
      type: String,
      default: 'orderNo'
    },
    // 设置排序方式
    sortType: {
      type: String,
      default: 'asc' // 顺序 asc, 倒序 desc
    },
    // 设置是否合并选中值，设为合并的话，只返回父节点，不返回子节点
    mergeCheckedValue: {
      type: Boolean,
      default: true
    },
    // 设置是否递归
    recursion: {
      type: Boolean,
      default: true
    },
    // 设置是否只有叶子节点可选
    onlyLeafCheck: {
      type: Boolean,
      default: false
    },
    // 是否显示搜索框（高亮显示匹配的节点，并展开父节点）
    searchable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      keyword: '',
      popupVisible: false,
      treeData: [],
      treeMap: {},
      componentValue: '',
      selectedValue: '',
      selectedText: '',
      selectedNodeMap: new Map(),
      timeObject: null,
      loading: false,
      loaded: false
    }
  },
  created() {
    this.$on('selectNode', this.onSelectNode)
    this.$on('unselectNode', this.onUnselectNode)
    // if (this.data && this.data.length) {
    //   this.treeData = [...this.data];
    //   this.treeToArray(this.treeData);
    //   console.log(this.treeMap);
    // }
    this.initValue()
  },
  computed: {
    componentText() {
      return this.selectedNode[this.textField]
    }
  },
  methods: {
    initData() {
      if (this.url || this.dataLoader) {
        this.loading = true
        this.loadData({ [this.idField]: this.rootId || '' })
          .then(data => {
            if (this.sort && this.sortField) {
              this.sortData(data)
            }
            data.forEach(item => {
              item.checked = false
            })

            const rootId = this.autoRoot ? this.autoGetRootId(data) : this.rootId
            this.treeData = this.async ? data : this.arrayToTree(data, rootId) // this.getChildrenNodes(data, rootId);
            // this.treeData = this.async ? data : this.translateDataToTree(data)
            // console.log(this.treeData, data)
            this.loading = false
            this.loaded = true
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    autoGetRootId(data) {
      for (let i = 0; i < data.length; ) {
        const parentId = data[i][this.parentField]
        let isExists = false
        for (let j = 0, len = data.length; j < len; j++) {
          if (parentId === data[j][this.idField]) {
            isExists = true
            break
          }
        }
        if (isExists) {
          i++
        } else {
          return parentId
        }
      }
      return ''
    },
    sortData(data) {
      data.sort((a, b) => {
        const x = Number(a[this.sortField])
        const y = Number(b[this.sortField])
        if (this.sortType === 'asc') {
          return x - y
        } else {
          return y - x
        }
      })
      return data
    },
    loadData(node) {
      return new Promise((resolve, reject) => {
        if (this.dataLoader) {
          this.dataLoader(node)
            .then(data => {
              resolve(data)
            })
            .catch(err => {
              reject(err)
            })
        } else if (this.url) {
          this.$http
            .post(this.url, Object.assign({}, this.queryParams, { [this.idField]: node[this.idField] }))
            .then(data => {
              resolve(data)
            })
            .catch(err => {
              reject(err)
            })
        }
      })
    },
    // exist (rows, parentId) {
    //   for (let i = 0; i < rows.length; i++) {
    //     if (rows[i][this.idField] === parentId) return true
    //   }
    //   return false
    // },
    // translateDataToTree (data) {
    //   var parents = []
    //   for (let i = 0; i < data.length; i++) {
    //     const row = data[i]
    //     if (!this.exist(data, row[this.parentField])) {
    //       parents.push(row)
    //     }
    //   }
    //   const children = data.filter(
    //     value => value[this.parentField] !== 'undefined' && value[this.parentField] != null || value[this.parentField] !== ''
    //   )
    //   const translator = (parents, children) => {
    //     parents.forEach(parent => {
    //       children.forEach((current, index) => {
    //         if (current[this.parentField] === parent[this.idField]) {
    //           const temp = JSON.parse(JSON.stringify(children))
    //           temp.splice(index, 1)
    //           translator([current], temp)
    //           typeof parent.children !== 'undefined'
    //             ? parent.children.push(current)
    //             : (parent.children = [current])
    //         }
    //       })
    //     })
    //   }

    //   translator(parents, children)

    //   return parents
    // },
    arrayToTree(array, rootId) {
      const tree = [] // 用于存放结果
      this.treeMap = {}

      for (const item of array) {
        let id = item[this.idField]
        // item[this.childrenField] = item[this.childrenField] || [];
        this.treeMap[id] = Object.assign(
          {
            [this.childrenField]: item[this.childrenField] || [],
            highlight: false, // 是否高亮显示
            visible: true, // 是否显示
            collapse: true // 默认设为折叠
          },
          item
        )
      }

      for (const item of array) {
        let id = item[this.idField]
        let parentId = item[this.parentField]
        if (item[this.parentField] === rootId) {
          tree.push(this.treeMap[id])
        } else if (this.treeMap[parentId]) {
          this.treeMap[parentId][this.childrenField].push(this.treeMap[id])
        }
      }
      return tree
    },
    treeToArray(data) {
      let res = []
      const dfs = tree => {
        tree.forEach(item => {
          if (item[this.childrenField]) {
            dfs(item[this.childrenField])
            delete item[this.childrenField]
          }
          res.push(Object.assign({}, item))
        })
      }
      dfs(data)
      return res
    },
    // getChildrenNodes(data, parentId) {
    //   // 递归获取树数据
    //   const treeData = [];
    //   data.forEach(item => {
    //     if (item[this.parentField].toString() === parentId.toString()) {
    //       const children = this.getChildrenNodes(data, item[this.idField]);
    //       const node = Object.assign({ [this.childrenField]: children }, item);
    //       treeData.push(node);
    //     }
    //   });
    //   return treeData;
    // },
    // 设置选中项的文本名称
    setText(text) {
      // this.selectedNode[this.textField] = text
      this.selectedText = text.split(',')
    },
    onSearch() {
      for (let id in this.treeMap) {
        let item = this.treeMap[id]
        item.highlight = this.keyword && item[this.textField].indexOf(this.keyword) !== -1 // 设置高亮
        item.collapse = true // 设置折叠
      }
      for (let id in this.treeMap) {
        let item = this.treeMap[id]
        // 高亮显示则把父节点展开
        if (item.highlight) {
          let parentNode = this.treeMap[item[this.parentField]]
          while (parentNode) {
            parentNode.collapse = false
            parentNode = this.treeMap[parentNode[this.parentField]]
          }
        }
      }
    },
    onCellClick() {
      if (this.disabled) return

      if (!this.loaded) {
        this.initData()
      }
      this.popupVisible = true
    },
    onNavBarClickLeft() {
      this.popupVisible = false
    },
    onNavBarClickRight() {},
    initValue() {
      // console.log('initValu', this.value)
      this.componentValue = this.value
      this.selectedNodeMap.clear()
      if (Array.isArray(this.componentValue)) {
        this.componentValue.forEach(item => {
          this.selectedNodeMap.set(item[this.idField], item)
        })
      } else if (this.componentValue && this.componentValue[this.idField]) {
        this.selectedNodeMap.set(this.componentValue[this.idField], this.componentValue)
      }
      this.initSelectedValueAndText()
    },
    nodeMapToComponentValue() {
      const selectedNodes = Array.from(this.selectedNodeMap.values())
      if (this.multiple) {
        // this.componentValue = selectedNodes
        if (this.mergeCheckedValue) {
          // 合并选中值
          // console.log('mergeCheckedValue', selectedNodes)
          selectedNodes.sort((a, b) => {
            return a.level > b.level ? 1 : 0
          })
          const componentValue = []
          for (const item of selectedNodes) {
            // 判断父项是否有选中
            let parentChecked = false
            const parents = item.fullPath.split(',')
            if (componentValue.length) {
              for (const valueItem of componentValue) {
                for (const parent of parents) {
                  if (parent === valueItem[this.idField].toString()) {
                    parentChecked = true
                    break
                  }
                }
                if (parentChecked) {
                  break
                }
              }
            }
            if (!parentChecked) {
              componentValue.push(item)
            }
          }
          this.componentValue = componentValue
        } else {
          this.componentValue = selectedNodes
        }
      } else {
        this.componentValue = selectedNodes.length ? selectedNodes[0] : null
      }
      // console.log('setComponentValue', this.componentValue)
    },
    initSelectedValueAndText() {
      const selectedValues = []
      const selectedTexts = []

      if (Array.isArray(this.componentValue)) {
        for (const item of this.componentValue) {
          selectedValues.push(item[this.idField])
          selectedTexts.push(item[this.textField])
        }
      } else if (this.componentValue) {
        selectedValues.push(this.componentValue[this.idField])
        selectedTexts.push(this.componentValue[this.textField])
      }
      this.selectedValue = selectedValues.join(',')
      this.selectedText = selectedTexts
    },
    onNodeInput(item, event) {
      Object.assign(item, event)
    },
    onSelectNode(node) {
      // console.log('select', node[this.textField])
      if (!this.multiple) {
        this.selectedValues = ''
        this.selectedNodeMap.clear()
      }
      this.selectedNodeMap.set(node[this.idField], node)
      this.nodeMapToComponentValue()
      this.initSelectedValueAndText()
      if (!this.multiple) {
        this.popupVisible = false
      }
      this.$emit('select-node', node)
    },
    onUnselectNode(node) {
      // console.log('unselcet', node[this.textField])
      if (this.selectedNodeMap.has(node[this.idField])) {
        this.selectedNodeMap.delete(node[this.idField])
      }
      this.nodeMapToComponentValue()
      this.initSelectedValueAndText()
      this.$emit('unselect-node', node)
    }
  },
  watch: {
    value: {
      deep: true,
      handler() {
        // console.log('valueChange', newValue, oldValue)
        this.initValue()
      }
    },
    componentValue(newValue) {
      // console.log('componentValueChange', newValue)
      this.$emit('input', newValue)
    },
    data(newValue) {
      if (newValue && newValue.length) {
        this.treeData = this.arrayToTree(newValue, this.rootId)
      } else {
        this.treeData = []
      }
    }
    // selectedNode: {
    //   deep: true,
    //   handler (newValue) {
    //     this.$emit('node-select', newValue)
    //   }
    // }
  }
}
</script>

<style lang="less">
.cs-tree-cell {
  &.van-cell {
    padding: 0 !important;
    .van-cell__value {
      flex: 2;
      .checked-item {
        padding: 3px 0;
        line-height: 17px;
      }
      .no-data {
        color: #c8c9cc;
      }
    }
  }
}
.cs-tree-popup {
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
  .cs-tree-popup_header {
    background-color: #3788fe;
    border-radius: 20px 20px 0 0;
    height: 46px;
    line-height: 30px;
    padding: 8px 0;
    color: #ffffff;
    box-sizing: border-box;
    position: relative;
    text-align: center;

    .btn-close {
      width: 80px;
      text-align: center;
      position: absolute;
      right: 0;
      top: 10px;
      line-height: 26px;
    }
  }
  .cs-tree-popup_body {
    flex: 1;
    overflow: auto;
    padding: 0px 10px;
    margin: 10px 0;
    &.searchable {
      margin-top: 0;
    }
    & > .van-loading {
      margin: 20px auto;
      text-align: center;
      display: block;
    }
    .no-data-tip {
      line-height: 40px;
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
