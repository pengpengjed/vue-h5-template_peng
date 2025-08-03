<template>
  <div class="cs-datetime-cell-ex van-cell">
    <van-cell :title="title" @click="onCellClick">
      <!-- <span>{{ componentValue ? componentValue : "请选择" }}</span> -->
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
    </van-cell>
    <van-popup v-model="popupVisible" position="bottom" v-if="!disabled" get-container="body">
      <van-picker
        ref="picker"
        show-toolbar
        title="选择时间"
        :columns="pickerColumns"
        class="datetime-ex-popup-picker"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>
  </div>
</template>

<script>
export default {
  name: "DatetimePickerCellEx",
  props: {
    // 设置绑定值
    value: {
      type: String,
      default: ""
    },
    // 设置标题
    title: {
      type: String
    },
    // 设置可选的最小时间
    minDate: {
      type: Date
    },
    // 设置可选的最大时间
    maxDate: {
      type: Date
    },
    // 设置是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 设置是否有默认值，设为true时，当value为空时，默认为当前时间
    isDefault: {
      type: Boolean,
      default: true
    },
    // 设置是否可清空选中值
    clearable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      popupVisible: false,
      currentDate: new Date(),
      componentValue: "",
      pickerColumns: [
        { values: [], defaultIndex: 0, className: "date-column" }, // 第一列
        { values: [], defaultIndex: 0 }, // 第二列
        { values: [], defaultIndex: 0 } // 第三列
      ],
      pickerMinDate: new Date(),
      pickerMaxDate: new Date(),
      weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
    };
  },
  created() {
    this.componentValue = this.value;
    if (this.componentValue) {
      this.currentDate = this.$utility.parseDate(this.componentValue);
    }
    this.ininColumns();
  },
  methods: {
    ininColumns() {
      if (this.minDate) {
        this.pickerMinDate = this.minDate;
      } else {
        this.pickerMinDate.setDate(this.pickerMinDate.getDate() - 10);
      }

      if (this.maxDate) {
        this.pickerMaxDate = this.maxDate;
      } else {
        this.pickerMaxDate.setDate(this.pickerMaxDate.getDate() + 60);
      }

      // 添加日期列
      let tmpDate = new Date(this.pickerMinDate.getFullYear(), this.pickerMinDate.getMonth(), this.pickerMinDate.getDate());
      let dateIndex = 0;
      while (tmpDate.getTime() < this.pickerMaxDate.getTime()) {
        this.pickerColumns[0].values.push(`${this.$utility.formatDate(tmpDate, "yyyy-MM-dd")} ${this.weekday[tmpDate.getDay()]}`);
        // 设置日期选择中项
        if (this.currentDate && this.currentDate.toString().slice(0, 10) === tmpDate.toString().slice(0, 10)) {
          this.pickerColumns[0].defaultIndex = dateIndex;
        }
        // 设置下一个日期
        tmpDate.setDate(tmpDate.getDate() + 1);
        dateIndex++;
      }

      //添加小时列
      for (let i = 0; i < 24; i++) {
        this.pickerColumns[1].values.push(i < 10 ? "0" + i : i);
      }
      // 设置小时选中项
      if (this.currentDate) {
        this.pickerColumns[1].defaultIndex = this.currentDate.getHours();
      }
      //添加分钟列
      for (let i = 0; i < 60; i++) {
        this.pickerColumns[2].values.push(i < 10 ? "0" + i : i);
      }
      // 设置分钟选中项
      if (this.currentDate) {
        this.pickerColumns[2].defaultIndex = this.currentDate.getMinutes();
      }
    },
    initDate() {
      let dateIndex = 0;
      let tmpDate = new Date(this.pickerMinDate.getFullYear(), this.pickerMinDate.getMonth(), this.pickerMinDate.getDate());
      while (tmpDate.getTime() < this.pickerMaxDate.getTime()) {
        if (this.currentDate && this.currentDate.toString().slice(0, 10) === tmpDate.toString().slice(0, 10)) {
          break;
        }
        // 设置下一个日期
        tmpDate.setDate(tmpDate.getDate() + 1);
        dateIndex++;
      }

      // 设置小时选中项
      let hourIndex = 0;
      if (this.currentDate) {
        hourIndex = this.currentDate.getHours();
      }

      // 设置分钟选中项
      let miniteIndex = 0;
      if (this.currentDate) {
        miniteIndex = this.currentDate.getMinutes();
      }
      if (this.$refs.picker) {
        this.$refs.picker.setIndexes([dateIndex, hourIndex, miniteIndex]);
      } else {
        this.pickerColumns[0].defaultIndex = dateIndex;
        this.pickerColumns[1].defaultIndex = hourIndex;
        this.pickerColumns[2].defaultIndex = miniteIndex;
      }
    },
    setDate() {
      let values = this.$refs.picker.getValues();
      this.currentDate = this.$utility.parseDate(`${values[0].substring(0, 10)} ${values[1]}:${values[2]}`);
      this.componentValue = this.$utility.formatDate(this.currentDate, "yyyy-MM-dd hh:mm");
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
      if (this.componentValue) {
        this.currentDate = this.$utility.parseDate(this.componentValue);
      }
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
.cs-datetime-cell-ex {
  &.van-cell {
    padding: 0 !important;
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
    // color: #323233;
    & > span {
      flex: 1;
    }
    & > .van-icon {
      font-size: 15px;
      color: #d43f3a;
      padding: 0 3px;
      margin-left: 5px;
    }
    .nodata {
      color: #969799;
    }
  }
}
.datetime-ex-popup-picker {
  .date-column {
    flex: none;
    width: 200px;
  }
}
</style>
