<template>
  <div title="申请详情">
    <div class="application-detail">
      <!-- 内容区域 -->
      <div class="popup-content">
        <!-- 学员基本信息 -->
        <div class="section">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">学员基本信息</span>
          </div>
          <van-cell-group>
            <van-cell title="姓名" :value="detailData.studentBasicInfo.name" />
            <van-cell title="员工号" :value="detailData.studentBasicInfo.employeeId" />
            <van-cell title="技术等级" :value="detailData.studentBasicInfo.technicalLevel" />
            <van-cell title="分部" :value="detailData.studentBasicInfo.division" />
            <van-cell title="注册基地" :value="detailData.studentBasicInfo.registrationBase" />
            <van-cell title="运行基地" :value="detailData.studentBasicInfo.operatingBase" />
            <van-cell title="训练基地" :value="detailData.studentBasicInfo.trainingBase" />
            <van-cell title="状态" :value="detailData.studentBasicInfo.status">
              <template #value>
                <van-tag :type="getStatusType(detailData.studentBasicInfo.status)">
                  {{ detailData.studentBasicInfo.status }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </div>

        <!-- 申请详情 -->
        <div class="section">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">申请详情</span>
          </div>
          <van-cell-group>
            <van-cell title="训练机型" :value="detailData.applicationDetails.trainingAircraftModel" />
            <van-cell title="分类" :value="detailData.applicationDetails.category" />
            <van-cell title="提纲" :value="detailData.applicationDetails.outline" />
            <van-cell title="阶段" :value="detailData.applicationDetails.stage" />
            <van-cell title="科目" :value="detailData.applicationDetails.subject" />
            <van-cell title="说明" :value="detailData.applicationDetails.description" />
            <van-cell title="申请时间" :value="detailData.applicationDetails.applicationTime" />
            <van-cell title="流水号" :value="detailData.applicationDetails.serialNumber" />
            <van-cell title="训练大纲版本" :value="detailData.applicationDetails.trainingOutlineVersion" />
            <van-cell title="手册版本" :value="detailData.applicationDetails.manualVersion" />
          </van-cell-group>

          <!-- 附件 -->
          <div
            class="attachments-section"
            v-if="detailData.applicationDetails.attachments && detailData.applicationDetails.attachments.length > 0"
          >
            <div class="attachments-title">附件</div>
            <div class="attachments-list">
              <div
                v-for="attachment in detailData.applicationDetails.attachments"
                :key="attachment.id"
                class="attachment-item"
                @click="previewAttachment(attachment)"
              >
                <van-icon name="description" />
                <span class="attachment-name">{{ attachment.name }}</span>
                <span class="attachment-size">{{ attachment.size }}</span>
              </div>
            </div>
          </div>

          <!-- 关联已完成训练 -->
          <div
            class="associated-training-section"
            v-if="
              detailData.applicationDetails.associatedCompletedTraining &&
              detailData.applicationDetails.associatedCompletedTraining.length > 0
            "
          >
            <div class="associated-training-title">关联已完成训练</div>
            <div class="associated-training-list">
              <div
                v-for="(training, index) in detailData.applicationDetails.associatedCompletedTraining"
                :key="index"
                class="training-item"
              >
                <span class="training-subject">{{ training.subjectName }}</span>
                <span class="training-date">{{ training.trainingDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 准入条件 -->
        <div class="section">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">准入条件</span>
          </div>
          <AccessConditionText :value="detailData.admissionConditions.content" :editable="false" :rows="6" />
        </div>

        <!-- 电子化准入条件 -->
        <div class="section">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">电子化准入条件</span>
          </div>

          <!-- 校验结果 -->
          <div class="validation-result">
            <!-- <van-tag :type="detailData.electronicAdmissionConditions.data.result === '通过' ? 'success' : 'danger'" size="medium">
              {{ detailData.electronicAdmissionConditions.data.result }}
            </van-tag> -->
          </div>

          <!-- 准入条件管理器 -->
          <AccessConditionManager
            :data="detailData.electronicAdmissionConditions.data"
            :type="detailData.electronicAdmissionConditions.type"
            :editable="false"
            @show-detail="handleShowDetail"
            @condition-change="handleConditionChange"
            @confirm-satisfaction="handleConfirmSatisfaction"
            @cancel-confirmation="handleCancelConfirmation"
            @preview-file="previewMaterial"
            @upload-attachment="handleUploadAttachment"
          />
        </div>

        <!-- 训练详情 -->
        <div class="section" v-if="detailData.trainingDetails">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">训练详情</span>
          </div>
          <van-cell-group>
            <van-cell title="训练阶段" :value="detailData.trainingDetails.trainingStage" />
            <van-cell
              v-if="detailData.trainingDetails.checklist"
              title="科目"
              :value="detailData.trainingDetails.checklist.subject"
            />
            <van-cell
              v-if="detailData.trainingDetails.checklist"
              title="检查单"
              :value="detailData.trainingDetails.checklist.checklistName"
            >
              <template #right-icon>
                <van-button
                  v-if="detailData.trainingDetails.checklist.isCompleted"
                  type="primary"
                  size="small"
                  @click="viewChecklist(detailData.trainingDetails.checklist)"
                >
                  查看检查单
                </van-button>
              </template>
            </van-cell>
            <van-cell
              v-if="detailData.trainingDetails.checklist"
              title="训练日期"
              :value="detailData.trainingDetails.checklist.trainingDate"
            />
          </van-cell-group>
        </div>
      </div>

      <!-- 记录按钮 -->
      <div class="records-button" @click="showInspectionHistory">
        <van-icon name="records" />
        <span>记录</span>
      </div>

      <!-- 训练记录弹框 -->
      <training-records v-model="showTrainingRecords" :application-data="currentApplication" />
    </div>

    <!-- 检查历史弹窗 -->
    <van-popup v-model="showHistoryPopup" position="bottom" :style="{ height: '70%' }" round closeable>
      <div class="inspection-history-popup">
        <div class="popup-header">
          <h3>检查历史</h3>
          <van-icon name="cross" @click="showHistoryPopup = false" />
        </div>
        <div class="history-content">
          <div v-for="record in detailData.inspectionHistory" :key="record.id" class="history-item">
            <div class="history-header">
              <span class="history-subject">{{ record.subject }}</span>
              <van-tag v-if="record.result" :type="record.result === '通过' ? 'success' : 'danger'" size="small">
                {{ record.result }}
              </van-tag>
            </div>
            <div class="history-details">
              <div class="detail-row">
                <span class="detail-label">检查单：</span>
                <span class="detail-value">{{ record.checklistName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">训练日期：</span>
                <span class="detail-value">{{ record.trainingDate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">检查日期：</span>
                <span class="detail-value">{{ record.inspectionDate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">检查员：</span>
                <span class="detail-value">{{ record.inspector }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">机型：</span>
                <span class="detail-value">{{ record.aircraftModel }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">提纲：</span>
                <span class="detail-value">{{ record.outline }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import AccessConditionText from '../../components/access-condition-text/index.vue'
import AccessConditionManager from '../../components/access-condition-manager/index.vue'
import TrainingRecords from './training-records.vue'

export default {
  name: 'ApplicationDetail',
  components: {
    AccessConditionText,
    AccessConditionManager,
    TrainingRecords
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
    /* applicationData: {
      type: Object,
      default: () => ({})
    } */
  },
  data() {
    return {
      currentApplication: {},
      showHistoryPopup: false,
      showTrainingRecords: false,
      detailData: {
        studentBasicInfo: {},
        applicationDetails: {},
        admissionConditions: {},
        electronicAdmissionConditions: {},
        trainingDetails: {},
        inspectionHistory: []
      }
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
    value(val) {
      if (val && this.applicationData.id) {
        this.loadDetailData()
      }
    }
  },
  created() {
    console.log('this.$route.query.applicationData', this.$route.query.applicationData)
    // 优先使用 applicationData，如果没有则使用 currentApplication
    const appData = this.$route.query.applicationData || this.$route.query.currentApplication
    this.currentApplication = JSON.parse(appData)
    console.log('this.currentApplication', this.currentApplication)
    this.loadDetailData()
  },
  methods: {
    async loadDetailData() {
      try {
        // 模拟API调用，实际项目中应该调用真实的API
        const response = await this.$http.post('/api/training-application/detail', {
          applicationId: this.applicationData.id
        })
        this.detailData = response.data
      } catch (error) {
        console.error('加载详情数据失败:', error)
        // 使用mock数据作为fallback
        this.loadMockData()
      }
    },
    loadMockData() {
      // 导入mock数据
      import('../mockData/applicationDetailData.json')
        .then(mockData => {
          this.detailData = mockData.default || mockData
        })
        .catch(error => {
          console.error('加载mock数据失败:', error)
          this.$toast('加载数据失败')
        })
    },
    getStatusType(status) {
      const statusMap = {
        审批中: 'warning',
        已完成: 'success',
        审批不通过: 'danger',
        待提交: 'default',
        已撤回: 'default'
      }
      return statusMap[status] || 'default'
    },
    handleClose() {
      this.visible = false
      this.showHistoryPopup = false
    },
    previewAttachment(attachment) {
      this.$toast(`预览附件：${attachment.name}`)
      // 实际项目中应该实现文件预览功能
    },
    previewMaterial(material) {
      this.$toast(`预览材料：${material.name}`)
      // 实际项目中应该实现文件预览功能
    },
    viewChecklist(checklist) {
      this.$toast(`查看检查单：${checklist.checklistName}`)
      // 实际项目中应该跳转到检查单详情页面
    },
    showInspectionHistory() {
      this.showHistoryPopup = true
    },
    handleShowDetail(data) {
      console.log('显示详情:', data)
      // 根据需要处理显示详情逻辑
    },
    handleConditionChange(data) {
      console.log('条件变化:', data)
      // 根据需要处理条件变化逻辑
    },
    handleConfirmSatisfaction(data) {
      console.log('确认满足:', data)
      // 根据需要处理确认满足逻辑
    },
    handleCancelConfirmation(data) {
      console.log('取消确认:', data)
      // 根据需要处理取消确认逻辑
    },
    handleUploadAttachment(file) {
      console.log('上传附件:', file)
      // 根据需要处理上传附件逻辑
    }
  }
}
</script>

<style lang="less" scoped>
.application-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .section {
      margin-bottom: 24px;

      .section-title {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .title-bar {
          width: 4px;
          height: 16px;
          background: #1989fa;
          margin-right: 8px;
          border-radius: 2px;
        }

        .title-text {
          font-size: 16px;
          font-weight: 600;
          color: #323233;
        }
      }
    }

    .attachments-section,
    .associated-training-section {
      margin-top: 12px;

      .attachments-title,
      .associated-training-title {
        font-size: 14px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 8px;
      }

      .attachments-list,
      .associated-training-list {
        .attachment-item,
        .training-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: #f7f8fa;
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: pointer;

          &:hover {
            background: #e8f3ff;
          }

          .van-icon {
            margin-right: 8px;
            color: #1989fa;
          }

          .attachment-name,
          .training-subject {
            flex: 1;
            font-size: 14px;
            color: #323233;
          }

          .attachment-size,
          .training-date {
            font-size: 12px;
            color: #969799;
          }
        }
      }
    }

    .validation-result {
      margin-bottom: 16px;
      text-align: center;
    }

    .tag-based-conditions,
    .free-combination-conditions {
      .condition-result,
      .group-relationship,
      .combination-formula,
      .system-judgment {
        margin-bottom: 12px;

        .result-label,
        .relationship-label,
        .formula-label,
        .judgment-label {
          font-weight: 600;
          margin-right: 8px;
        }

        .formula-text {
          color: #323233;
        }
      }

      .groups-list,
      .condition-list {
        .group-item,
        .condition-item {
          margin-bottom: 16px;
          padding: 12px;
          background: #f7f8fa;
          border-radius: 4px;

          .group-name,
          .condition-name {
            font-weight: 600;
            margin-bottom: 8px;
            display: block;

            &.met {
              color: #07c160;
            }

            &.unmet {
              color: #ee0a24;
            }
          }

          .condition-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .condition-rules {
            font-size: 14px;
            color: #646566;
            margin-bottom: 8px;
          }

          .manual-confirmation {
            border-top: 1px solid #ebedf0;
            padding-top: 8px;

            .confirmation-info {
              display: flex;
              flex-direction: column;
              gap: 4px;
              font-size: 12px;
              color: #969799;
              margin-bottom: 8px;
            }

            .confirmation-materials {
              .materials-title {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 4px;
              }

              .materials-list {
                .material-item {
                  display: flex;
                  align-items: center;
                  padding: 4px 8px;
                  background: #fff;
                  border-radius: 2px;
                  margin-bottom: 4px;
                  cursor: pointer;

                  &:hover {
                    background: #e8f3ff;
                  }

                  .van-icon {
                    margin-right: 4px;
                    color: #1989fa;
                  }

                  span {
                    font-size: 12px;
                    color: #323233;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .records-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: #1989fa;
    color: white;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
    cursor: pointer;
    z-index: 1000;

    .van-icon {
      font-size: 20px;
      margin-bottom: 2px;
    }

    span {
      font-size: 10px;
    }

    &:hover {
      background: #1677ff;
    }
  }
}

.inspection-history-popup {
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

  .history-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .history-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #f7f8fa;
      border-radius: 4px;

      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .history-subject {
          font-weight: 600;
          color: #323233;
        }
      }

      .history-details {
        .detail-row {
          display: flex;
          margin-bottom: 4px;

          .detail-label {
            font-size: 12px;
            color: #969799;
            width: 80px;
            flex-shrink: 0;
          }

          .detail-value {
            font-size: 12px;
            color: #323233;
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
