<template>
  <div class="application-list-item" @click="handleItemClick">
    <div class="item-header">
      <div class="employee-info">
        <div class="status-tag" :class="getStatusClass(item.statusCode)" />
        <span class="name">{{ item.employeeName }}（{{ item.employeeId }}）</span>
      </div>

      <div v-if="item.canWithdraw" class="action-buttons">
        <van-button style="padding: 2px 20px" type="danger" plain round size="small" @click.stop="handleWithdraw">
          撤回
        </van-button>
      </div>

      <div v-if="item.canReapply" class="action-buttons">
        <van-button style="padding: 2px 10px" type="danger" plain round size="small" @click.stop="handleReapply">
          重新发起
        </van-button>
      </div>
      <div class="arrow">
        <van-icon name="arrow" />
      </div>
    </div>

    <div class="item-content">
      <div class="tag-bar">
        <span class="type">{{ item.type }}</span>
        <span class="type">{{ item.trainingBase }}</span>
        <span class="type">{{ item.trainingAircraftModel }}</span>
        <span class="type">{{ item.division }}</span>
      </div>

      <div class="info-row">
        <span class="label">提纲：</span>
        <span class="value">{{ item.outline }}</span>
      </div>

      <div class="info-row">
        <span class="label">科目：</span>
        <span class="value">{{ item.subject }}</span>
      </div>

      <div v-if="item.qualificationType" class="info-row">
        <span class="label">资格类型：</span>
        <span class="value">{{ item.qualificationType }}</span>
      </div>

      <div v-if="item.inspectionQualification" class="info-row">
        <span class="label">检查资质：</span>
        <span class="value">{{ item.inspectionQualification }}</span>
      </div>

      <!-- <div class="info-row">
        <span class="label">训练机型：</span>
        <span class="value">{{ item.trainingAircraftModel }}</span>
      </div>

      <div class="info-row">
        <span class="label">训练基地：</span>
        <span class="value">{{ item.trainingBase }}</span>
      </div>

      <div class="info-row">
        <span class="label">分部：</span>
        <span class="value">{{ item.division }}</span>
      </div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApplicationListItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    getStatusClass(statusCode) {
      const statusMap = {
        completed: 'status-completed',
        pending: 'status-pending',
        approving: 'status-approving',
        rejected: 'status-rejected',
        withdrawn: 'status-withdrawn'
      }
      return statusMap[statusCode] || 'status-default'
    },

    handleItemClick() {
      this.$emit('item-click', this.item)
    },

    handleWithdraw() {
      this.$emit('withdraw', this.item)
    },

    handleReapply() {
      this.$emit('reapply', this.item)
    }
  }
}
</script>

<style lang="less" scoped>
.application-list-item {
  background: #fff;
  border-radius: 8px;
  margin: 10px 0;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ecedee;

    .employee-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .name {
        font-size: 16px;
        font-weight: 400;
        color: #333;
        line-height: 22px;
      }

      .status-tag {
        height: 25px;
        // margin-right: 10px;

        &.status-completed {
          width: 62px;
          background: url('../../theme/images/apply-successed.png') no-repeat 100% 100% transparent;
          background-size: contain;
        }

        &.status-pending {
          width: 52px;
          background: url('../../theme/images/apply-wait.png') no-repeat 100% 100% transparent;
          background-size: contain;
        }

        &.status-approving {
          width: 52px;
          background: url('../../theme/images/applying.png') no-repeat 100% 100% transparent;
          background-size: contain;
        }

        &.status-rejected {
          width: 72px;
          background: url('../../theme/images/apply-fail.png') no-repeat 100% 100% transparent;
          background-size: contain;
        }

        &.status-withdrawn {
          background: #f5f5f5;
          color: #999;
        }
      }
    }

    .arrow {
      color: #969799;
    }
  }

  .item-content {
    .tag-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      .type {
        background: #f7fcff;
        border: 1px solid #c2e9ff;
        color: #00304d;
        padding: 1px 8px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 400;
        line-height: 18px;
      }
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
      font-size: 14px;
      line-height: 1.4;

      .label {
        color: #666;
        // min-width: 70px;
        flex-shrink: 0;
      }

      .value {
        color: #333;
        flex: 1;
      }
    }
  }
}
</style>
