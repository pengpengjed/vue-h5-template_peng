<template>
  <div class="application-list-item" @click="handleItemClick">
    <div class="item-header">
      <div class="employee-info">
        <span class="name">{{ item.employeeName }}({{ item.employeeId }})</span>
        <span class="type">{{ item.type }}</span>
      </div>
      <div class="arrow">
        <van-icon name="arrow" />
      </div>
    </div>

    <div class="item-content">
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

      <div class="info-row">
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
      </div>
    </div>

    <div class="item-footer">
      <div class="status-tag" :class="getStatusClass(item.statusCode)">
        {{ item.status }}
      </div>

      <div v-if="item.canWithdraw" class="action-buttons">
        <van-button type="danger" size="small" @click.stop="handleWithdraw"> 撤回 </van-button>
      </div>

      <div v-if="item.canReapply" class="action-buttons">
        <van-button type="danger" size="small" @click.stop="handleReapply"> 重新发起 </van-button>
      </div>
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
  margin: 8px 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .employee-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .name {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      .type {
        background: #e8f4fd;
        color: #1890ff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .arrow {
      color: #ccc;
    }
  }

  .item-content {
    .info-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.4;

      .label {
        color: #666;
        min-width: 70px;
        flex-shrink: 0;
      }

      .value {
        color: #333;
        flex: 1;
      }
    }
  }

  .item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;

    .status-tag {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;

      &.status-completed {
        background: #f6ffed;
        color: #52c41a;
      }

      &.status-pending {
        background: #fff7e6;
        color: #fa8c16;
      }

      &.status-approving {
        background: #e6f7ff;
        color: #1890ff;
      }

      &.status-rejected {
        background: #fff2f0;
        color: #ff4d4f;
      }

      &.status-withdrawn {
        background: #f5f5f5;
        color: #999;
      }
    }

    .action-buttons {
      .van-button {
        margin-left: 8px;
      }
    }
  }
}
</style>
