<template>
  <van-cell class="cs-datetime-cell" :title="title" @click="onCellClick" :required="required">
    <div class="picker-cell-value">
      <template v-if="componentValue">
        <span>{{ componentValue }}</span>
        <van-icon name="cross" @click.stop="onClearClick" v-if="clearable && !disabled" />
      </template>
      <span v-else class="nodata">请选择</span>
    </div>
    <template v-if="!disabled" #right-icon>
      <van-icon name="calender-o" class="van-cell__right-icon" size="20px" />
    </template>

    <van-popup v-model="popupVisible" position="bottom" v-if="!disabled" get-container="body">
      <van-datetime-picker
        v-model="currentDate"
        :type="type"
        title="选择时间"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>
  </van-cell>
  <!-- <div class="datetime-picker-cell van-cell">
    
  </div> -->
</template>

<script>
import utility from "../utils/utility";
export default {
  name: "DatetimePickerCell",
  props: {
    // 值，用于v-model
    value: {
      type: String,
      default: ""
    },
    // 标题
    title: {
      type: String
    },
    // 设置是否必填
    required: {
      type: Boolean,
      default: false
    },
    // 时间类型
    type: {
      type: String,
      default: "date" // 可选值有：date, time, year-month, month-day
    },
    // 最小日期
    minDate: {
      type: Date
    },
    // 最大日期
    maxDate: {
      type: Date
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否显示默认日期
    isDefault: {
      type: Boolean,
      default: true
    },
    // 是否显示清空按钮
    clearable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      popupVisible: false,
      currentDate: new Date(),
      componentValue: ""
    };
  },
  created() {
    this.componentValue = this.value;
    this.initDate();
  },
  methods: {
    initDate() {
      if (this.componentValue) {
        switch (this.type) {
          case "time":
            this.currentDate = new Date(Date.parse(`${utility.formatDate(new Date(), "yyyy/MM/dd")} ${this.componentValue}`));
            break;
          case "year-month":
            this.currentDate = new Date(Date.parse(`${this.componentValue.replace(/-/g, "/")}/01`));
            break;
          case "month-day":
            this.currentDate = new Date(Date.parse(`${new Date().getFullYear()}/${this.componentValue.replace(/-/g, "/")}`));
            break;
          case "datetime":
          case "date":
          default:
            this.currentDate = new Date(Date.parse(this.componentValue.replace(/-/g, "/")));
            break;
        }
      } else if (this.isDefault && !this.clearable) {
        this.currentDate = new Date();
        this.setDate();
      }
    },
    setDate() {
      let formatter = "";
      switch (this.type) {
        case "datetime":
          formatter = "yyyy-MM-dd hh:mm";
          break;
        case "time":
          formatter = "hh:mm";
          break;
        case "year-month":
          formatter = "yyyy-MM";
          break;
        case "month-day":
          formatter = "MM-dd";
          break;
        case "date":
        default:
          formatter = "yyyy-MM-dd";
          break;
      }
      this.componentValue = utility.formatDate(this.currentDate, formatter);
    },
    formatter(type, val) {
      if (type === "year") {
        return `${val}年`;
      } else if (type === "month") {
        return `${val}月`;
      } else if (type === "day") {
        return `${val}日`;
      }
      return val;
    },
    onCellClick() {
      if (this.disabled) return;

      this.initDate();
      this.popupVisible = true;
    },
    onCancel() {
      this.initDate();
      this.popupVisible = false;
    },
    onConfirm() {
      this.setDate();
      this.popupVisible = false;
    },
    onClearClick() {
      this.componentValue = "";
    }
  },
  watch: {
    value(newValue) {
      this.componentValue = newValue;
      this.initDate();
    },
    componentValue(newValue) {
      this.$emit("input", newValue);
      this.$nextTick(() => {
        this.$emit("change", newValue);
      });
    }
  }
};
</script>

<style lang="less">
.cs-datetime-cell {
  &.van-cell {
    // padding: 0 !important;
    .van-cell__right-icon {
      line-height: 24px;
      color: #337ab7;
    }
  }
  .picker-cell-value {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    line-height: 1.5;
    // color: #323233;
    & > span {
      flex: 1;
    }
    & > .van-icon {
      font-size: 15px;
      color: #d43f3a;
      padding: 0 3px;
      margin-left: 5px;
      margin-top: -2px;
    }
    .nodata {
      color: #c8c9cc;
    }
  }
  .van-icon-calendar-o {
    margin-top: -3px;
  }
}
</style>
