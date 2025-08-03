<template>
  <van-popup
    v-model="visible"
    position="center"
    :style="{ width: '90%', maxWidth: '400px' }"
    round
    closeable
    @close="handleClose"
  >
    <div class="withdraw-dialog">
      <div class="dialog-header">
        <h3 class="dialog-title">撤回说明</h3>
      </div>

      <div class="dialog-content">
        <van-field
          v-model="withdrawReason"
          type="textarea"
          placeholder="请输入撤回原因"
          :maxlength="200"
          :rows="4"
          show-word-limit
          autosize
        />
      </div>

      <div class="dialog-footer">
        <van-button type="primary" plain size="large" @click="handleWithdrawOnly" :disabled="!withdrawReason.trim()">
          仅撤回
        </van-button>
        <van-button type="primary" size="large" @click="handleWithdrawAndEdit" :disabled="!withdrawReason.trim()">
          撤回并编辑
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script>
export default {
  name: 'WithdrawDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    applicationData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      withdrawReason: ''
    }
  },
  computed: {
    visible: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.withdrawReason = ''
      }
    }
  },
  methods: {
    handleClose() {
      this.visible = false
      this.withdrawReason = ''
    },

    handleWithdrawOnly() {
      if (!this.withdrawReason.trim()) {
        this.$toast('请输入撤回原因')
        return
      }

      this.$dialog
        .confirm({
          title: '确认撤回',
          message: '确定要撤回该申请吗？',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        .then(() => {
          this.$emit('withdraw-only', {
            applicationId: this.applicationData.id,
            reason: this.withdrawReason.trim()
          })
          this.handleClose()
        })
        .catch(() => {
          // 用户取消
        })
    },

    handleWithdrawAndEdit() {
      if (!this.withdrawReason.trim()) {
        this.$toast('请输入撤回原因')
        return
      }

      this.$dialog
        .confirm({
          title: '确认撤回',
          message: '确定要撤回该申请并进入编辑页面吗？',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        .then(() => {
          this.$emit('withdraw-and-edit', {
            applicationId: this.applicationData.id,
            reason: this.withdrawReason.trim(),
            applicationData: this.applicationData
          })
          this.handleClose()
        })
        .catch(() => {
          // 用户取消
        })
    }
  }
}
</script>

<style lang="less" scoped>
.withdraw-dialog {
  padding: 20px;

  .dialog-header {
    text-align: center;
    margin-bottom: 20px;

    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }

  .dialog-content {
    margin-bottom: 24px;

    .van-field {
      background: #f8f9fa;
      border-radius: 8px;

      ::v-deep .van-field__control {
        background: transparent;
      }
    }
  }

  .dialog-footer {
    display: flex;
    gap: 12px;

    .van-button {
      flex: 1;
    }
  }
}
</style>
