<template>
  <van-popup v-model="visible" position="bottom" :style="{ height: '90%' }" round closeable>
    <div class="training-records">
      <div class="popup-header">
        <h3>记录详情</h3>
        <van-icon name="cross" @click="close" />
      </div>

      <van-tabs v-model="activeTab">
        <!-- 检查历史 -->
        <van-tab title="检查历史">
          <div class="check-history-list">
            <div v-for="record in checkHistoryList" :key="record.id" class="check-history-item">
              <div class="history-header">
                <span class="history-subject">{{ record.subject }}</span>
                <van-tag :type="record.result === '通过' ? 'success' : 'danger'" size="small">
                  {{ record.result }}
                </van-tag>
              </div>
              <div class="history-details">
                <div class="detail-row">
                  <span class="detail-label">训练阶段：</span>
                  <span class="detail-value">{{ record.trainingStage }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">训练机型：</span>
                  <span class="detail-value">{{ record.aircraftModel }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">提纲：</span>
                  <span class="detail-value">{{ record.outline }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">训练日期：</span>
                  <span class="detail-value">{{ record.trainingDate }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">检查日期：</span>
                  <span class="detail-value">{{ record.checkDate }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">检查员：</span>
                  <span class="detail-value">{{ record.inspector }}</span>
                </div>
                <div v-if="record.checklistAvailable" class="checklist-action">
                  <van-button type="primary" size="small" @click="viewChecklist(record)"> 查看检查单 </van-button>
                </div>
              </div>
            </div>
          </div>
        </van-tab>

        <!-- 审批记录 -->
        <van-tab title="审批记录">
          <div class="approval-records-list">
            <div v-for="(record, index) in approvalRecordsList" :key="index" class="approval-record-item">
              <div class="record-node" :class="record.nodeType">
                <div class="node-header">
                  <span class="node-name">{{ record.nodeName }}</span>
                  <van-tag v-if="record.nodeType === 'pending'" type="warning" size="small"> 待处理 </van-tag>
                </div>
                <div class="node-details">
                  <div class="detail-row">
                    <span class="detail-label">接收时间：</span>
                    <span class="detail-value">{{ record.receiveTime }}</span>
                  </div>
                  <div v-if="record.nodeType !== 'start' && record.nodeType !== 'pending'" class="approval-details">
                    <div class="detail-row">
                      <span class="detail-label">操作人：</span>
                      <span class="detail-value"> {{ record.operator.employeeId }} - {{ record.operator.name }} </span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">操作时间：</span>
                      <span class="detail-value">{{ record.operationTime }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">操作结果：</span>
                      <van-tag :type="record.result === '审批通过' ? 'success' : 'danger'" size="small">
                        {{ record.result }}
                      </van-tag>
                    </div>
                    <div v-if="record.comment" class="detail-row">
                      <span class="detail-label">审批意见：</span>
                      <span class="detail-value">{{ record.comment }}</span>
                    </div>
                  </div>
                  <div v-if="record.nodeType === 'pending'" class="pending-node-action">
                    <van-button type="primary" size="small" @click="showPendingNodeOperators(record)">
                      查看处理人员
                    </van-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </van-popup>
</template>

<script>
export default {
  name: 'TrainingRecords',
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
      activeTab: 0,
      checkHistoryList: [],
      approvalRecordsList: []
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
  methods: {
    close() {
      this.visible = false
    },
    loadRecords() {
      // 模拟加载记录数据，实际应从API获取
      this.checkHistoryList = this.getCheckHistoryList()
      this.approvalRecordsList = this.getApprovalRecordsList()
    },
    getCheckHistoryList() {
      // 根据需求文档生成检查历史数据
      return [
        {
          id: '1',
          subject: '日韩区域英语通信资格',
          result: '通过',
          trainingStage: '航线检查',
          aircraftModel: '320',
          outline: '英语通信单飞航线检查',
          trainingDate: '2024-01-20',
          checkDate: '2024-01-21',
          inspector: '李四',
          checklistAvailable: true
        }
      ]
    },
    getApprovalRecordsList() {
      // 根据需求文档生成审批记录数据
      return [
        {
          nodeName: '申请发起',
          nodeType: 'start',
          receiveTime: '2024-01-15 10:30:00',
          operator: {
            employeeId: '111222',
            name: '张三'
          }
        },
        {
          nodeName: '一级审批',
          nodeType: 'approved',
          receiveTime: '2024-01-15 14:20:00',
          operator: {
            employeeId: '222333',
            name: '李四'
          },
          operationTime: '2024-01-15 15:30:00',
          result: '审批通过',
          comment: '同意申请'
        },
        {
          nodeName: '二级审批',
          nodeType: 'pending',
          receiveTime: '2024-01-15 16:00:00'
        }
      ]
    },
    viewChecklist(record) {
      // 查看检查单的逻辑
      this.$toast(`查看检查单：${record.checklistAvailable ? record.subject : '暂无检查单'}`)
    },
    showPendingNodeOperators(record) {
      // 显示待处理节点的操作人员列表
      this.$toast(`查看${record.nodeName}的处理人员`)
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.loadRecords()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.training-records {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #ebedf0;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .van-icon {
      font-size: 20px;
      color: #969799;
      cursor: pointer;
    }
  }

  .check-history-list,
  .approval-records-list {
    padding: 16px;

    .check-history-item,
    .approval-record-item {
      background-color: #f7f8fa;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;

      .history-header,
      .node-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .history-subject,
        .node-name {
          font-weight: 600;
          color: #323233;
        }
      }

      .history-details,
      .node-details {
        .detail-row {
          display: flex;
          margin-bottom: 8px;

          .detail-label {
            width: 100px;
            color: #969799;
            font-size: 14px;
          }

          .detail-value {
            flex: 1;
            color: #323233;
            font-size: 14px;
          }
        }

        .checklist-action,
        .pending-node-action {
          margin-top: 12px;
          text-align: right;
        }
      }

      .approval-details {
        border-top: 1px solid #ebedf0;
        padding-top: 12px;
        margin-top: 12px;
      }
    }
  }
}
</style>
