<template>
  <div class="cs-tree-node" :class="{ extend: !comValue.collapse }">
    <div class="cs-tree-node_content">
      <!-- <div class="cs-tree-node_span" v-for="i in level" :key="i"></div> -->
      <van-loading v-if="loading" size="16px" />
      <div class="cs-tree-node_span" v-else-if="isLeaf"></div>
      <van-icon name="play" v-else class="cs-tree-node_arrow" @click.stop="onExtend" />
      <van-checkbox
        v-model="checked"
        :disabled="comValue.disabled || (onlyLeafCheck && !isLeaf)"
        shape="square"
        @click="onCheckboxClick"
      ></van-checkbox>
      <!-- <van-icon name="card" class="icon" @click="onNodeNameClick" /> -->
      <div class="cs-tree-node_name" @click.stop="onExtend" :class="{ highlight: comValue.highlight }">
        {{ comValue[textField] }}
      </div>
    </div>
    <div class="cs-tree-node_children" ref="children" :style="{ height: bodyHeight }">
      <template v-for="child in comValue[childrenField]">
        <cs-tree-node
          :key="child[idField]"
          :level="level + 1"
          :value="child"
          :id-field="idField"
          :text-field="textField"
          :parent-field="parentField"
          :children-field="childrenField"
          :selected-value="selectedValue"
          :data-loader="dataLoader"
          :async="async"
          :multiple="multiple"
          :parent-checked="comValue.checked"
          :parent-full-path="comValue.fullPath"
          :merge-checked-value="mergeCheckedValue"
          :recursion="recursion"
          :only-leaf-check="onlyLeafCheck"
          @select-node="onSelectNode"
          @unselect-node="onUnselectNode"
          @input="onNodeInput(child, $event)"
        ></cs-tree-node>
      </template>
    </div>
  </div>
</template>

<script>
import Emitter from "./mixins/emitter";
export default {
  name: "CsTreeNode",
  mixins: [Emitter],
  props: {
    value: {
      type: [Object, Array],
      default: () => {}
    },
    idField: {
      type: String,
      default: "id"
    },
    textField: {
      type: String,
      default: "text"
    },
    parentField: {
      type: String,
      default: "parentId"
    },
    childrenField: {
      type: String,
      default: "children"
    },
    level: {
      type: Number,
      default: 0
    },
    selectedValue: {
      type: String,
      default: ""
    },
    multiple: {
      type: Boolean,
      default: false
    },
    dataLoader: {
      type: Function
    },
    async: {
      type: Boolean,
      default: false
    },
    parentChecked: {
      type: [Number, Boolean],
      default: 0 // 0 未选中， 1 选中，2 中间状态（子项不是全部选中）
    },
    parentFullPath: {
      type: String,
      default: ""
    },
    mergeCheckedValue: {
      type: Boolean,
      default: true
    },
    recursion: {
      type: Boolean,
      default: false
    },
    // 设置是否只有叶子节点可选
    onlyLeafCheck: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      comValue: {},
      bodyHeight: "0px",
      loading: false,
      isLoaded: false,
      checked: false,
      emmitEventable: true,
      timeObject: null
    };
  },
  created() {
    this.comValue = Object.assign(
      {
        fullPath: this.parentFullPath ? `${this.parentFullPath},${this.value[this.idField]}` : this.value[this.idField].toString()
      },
      this.value
    );
    this.checked = this.comValue.checked;
    this.initChecked();
  },
  computed: {
    isLeaf() {
      if (this.async && !this.isLoaded) {
        return false;
      } else {
        return !this.value[this.childrenField] || this.value[this.childrenField].length === 0;
      }
    }
    // isSelected () {
    //   return this.selectedNode && this.selectedNode[this.idField] === this.value[this.idField]
    // }
  },
  methods: {
    loadData(fn) {
      if (this.dataLoader) {
        this.loading = true;
        this.dataLoader(this.value)
          .then(data => {
            this.comValue[this.childrenField] = data;
            this.loading = false;
            this.isLoaded = true;
            if (fn) fn();
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
    onExtend() {
      // if (this.async && !this.isLoaded) {
      //   this.loadData(() => {
      //     this.$nextTick(() => {
      //       this.bodyHeight = this.$refs.children.offsetHeight;
      //       this.comValue.collapse = !this.comValue.collapse;
      //     });
      //   });
      // } else {
      //   if (!this.bodyHeight) {
      //     this.bodyHeight = this.$refs.children.offsetHeight;
      //   }
      //   this.comValue.collapse = !this.comValue.collapse;
      // }
      if (this.async && !this.isLoaded) {
        this.loadData(() => {
          this.$nextTick(() => {
            this.comValue.collapse = !this.comValue.collapse;
            this.emitInputEvent();
            this.setHeightAnimate();
          });
        });
      } else {
        this.comValue.collapse = !this.comValue.collapse;
        this.emitInputEvent();
        this.setHeightAnimate();
      }
    },
    emitInputEvent() {
      this.$emit("input", this.comValue);
    },
    onNodeInput(item, event) {
      Object.assign(item, event);
      this.emitInputEvent();
    },
    setHeightAnimate() {
      let height = this.$refs.children.scrollHeight + this.$refs.children.scrollTop + "px";
      clearTimeout(this.timeObject);
      if (!this.comValue.collapse) {
        this.bodyHeight = "0px";
        this.timeObject = setTimeout(() => {
          this.bodyHeight = height;

          this.timeObject = setTimeout(() => {
            this.bodyHeight = "";
          }, 500);
        }, 50);
      } else {
        this.bodyHeight = height;
        this.timeObject = setTimeout(() => {
          this.bodyHeight = "0px";
        }, 50);
      }
    },
    // resizeHeight(height) {
    //   if (!this.bodyHeight) {
    //     this.bodyHeight = this.$refs.children.offsetHeight + 0.5;
    //   }
    //   this.bodyHeight += height;
    //   // 继续向上传递事件
    //   this.$emit("resize", height);
    // },
    // onNodeNameClick() {
    //   // this.$emit('select-node', this.value)
    //   this.checked = !this.checked;
    //   this.comValue.checked = this.checked ? 1 : 0;
    //   this.setChildChecked();
    //   this.emitEvant();
    // },
    onCheckboxClick() {
      this.comValue.checked = this.checked ? 1 : 0;
      this.setChildChecked();
      this.emitEvant();
    },
    onSelectNode(nodes) {
      const node = nodes[nodes.length - 1];
      if (this.multiple && this.recursion) {
        let hasChild = false;
        let isAllChildChecked = true; // 判断是否所有子项都选中
        for (const item of this.comValue.children || []) {
          if (item[this.idField] === node[this.idField]) {
            item.checked = true;
            hasChild = true;
          }
          if (!item.checked) {
            isAllChildChecked = false;
          }
        }

        if (hasChild) {
          this.checked = isAllChildChecked;
          this.comValue.checked = isAllChildChecked ? 1 : 2;
          if (this.comValue.checked === 1) {
            nodes.push(this.comValue);
          }
        }
      }
      // 继续向上传递事件
      this.$emit("select-node", nodes);
    },
    onUnselectNode(nodes) {
      const node = nodes[nodes.length - 1];
      if (this.multiple && this.recursion) {
        let hasChecked = false;
        let hasChild = false;
        for (const item of this.comValue.children || []) {
          if (item[this.idField] === node[this.idField]) {
            item.checked = false;
            hasChild = true;
          }
          if (item.checked) {
            hasChecked = true;
          }
        }
        if (hasChild) {
          this.checked = false;
          this.comValue.checked = hasChecked ? 2 : node.checked;
          nodes.push(this.comValue);
        }
      }
      // 继续向上传递事件
      this.$emit("unselect-node", nodes);
    },
    setChildChecked() {
      if (!this.recursion) return;

      (this.comValue.children || []).forEach(item => {
        item.checked = this.checked;
      });
    },
    emitEvant() {
      if (this.checked) {
        this.$emit("select-node", [this.comValue]);
      } else {
        this.$emit("unselect-node", [this.comValue]);
      }
    },
    initChecked() {
      this.emmitEventable = false;

      if (!this.multiple) {
        this.checked = this.comValue[this.idField].toString() === this.selectedValue;
      } else {
        const selectedArray = this.selectedValue.split(",");
        for (const value of selectedArray) {
          if (value === this.comValue[this.idField].toString()) {
            this.checked = true;
            this.comValue.checked = 1;
            break;
          }
        }
      }
      this.$nextTick(() => {
        this.emmitEventable = true;
      });
    }
  },
  watch: {
    value: {
      deep: true,
      handler(newValue) {
        // 判断是否需要自动展开或折叠
        if (newValue.collapse !== this.comValue.collapse) {
          this.$nextTick(() => {
            this.setHeightAnimate();
          });
        }
        Object.assign(this.comValue, newValue);
      }
    },
    parentChecked(newValue) {
      if (this.multiple && this.recursion) {
        if (newValue === 0) {
          this.checked = false;
          this.comValue.checked = 0;
          this.setChildChecked();
        } else if (newValue === 1) {
          this.checked = true;
          this.comValue.checked = 1;
          this.setChildChecked();
        }
      }
    },
    checked(newValue) {
      if (!this.emmitEventable) return;

      const eventName = newValue ? "selectNode" : "unselectNode";
      this.dispatch("CsTreeCell", eventName, this.comValue);
    },
    selectedValue() {
      if (!this.multiple) {
        this.initChecked();
      }
      // this.initChecked()
      // 如果是合并选中值且子项为选中，判断父项是否选中，如果没选中，则传递选中事件
      if (this.mergeCheckedValue && this.checked) {
        this.$nextTick(() => {
          let parentChecked = false;
          if (this.parentFullPath && this.selectedValue) {
            const parents = this.parentFullPath.split(",");
            const values = this.selectedValue.split(",");
            for (const parent of parents) {
              for (const value of values) {
                if (value.toString() === parent.toString()) {
                  parentChecked = true;
                }
              }
              if (parentChecked) {
                break;
              }
            }
          }
          this.dispatch("CsTreeCell", !parentChecked ? "selectNode" : "unselectNode", this.comValue);
        });
      } else {
        this.initChecked();
      }
    }
  }
};
</script>

<style lang="less">
.cs-tree-node {
  position: relative;
  color: #555555;
  font-size: 14px;
  .van-loading {
    margin: 0px;
    width: 24px;
    text-align: center;
  }
  .cs-tree-node_content {
    display: flex;
    flex-direction: row;
    line-height: 36px;
    align-items: center;
    // border-bottom: 1px solid #f2f2f2;
    box-sizing: border-box;
    padding: 0 5px;
    .cs-tree-node_span {
      display: block;
      width: 20px;
      height: 20px;
    }
    .cs-tree-node_arrow {
      width: 20px;
      text-align: center;
      height: 20px;
      line-height: 20px;
      transition: transform 0.5s;
      color: #c0c4cc;
      margin-top: -3px;
      font-size: 14px;
    }
    .cs-tree-node_name {
      flex: 1;
      padding: 5px 0px 5px 5px;
      line-height: 20px;
      word-break: break-all;
      &.highlight {
        color: #e6a23c;
      }
    }
    .van-checkbox {
      .van-checkbox__icon {
        height: 16px;
        font-size: 14px;
        .van-icon {
          width: 16px;
          height: 16px;
          line-height: 1.2;
          border-radius: 4px;
          // margin: 0 5px 0px 3px;
          margin: 0;
        }
      }
    }
  }
  .cs-tree-node_children {
    position: relative;
    overflow: hidden;
    transition: 0.5s;
    padding-left: 20px;
  }
  &.extend {
    & > .cs-tree-node_content > .cs-tree-node_arrow {
      transform: rotate(90deg);
    }
  }
  // &.actived {
  //   & > .cs-tree-node_content {
  //     background-color: #0a8dec;
  //     color: #ffffff;
  //   }
  // }
}
</style>
