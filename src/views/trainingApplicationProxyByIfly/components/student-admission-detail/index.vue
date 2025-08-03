<template>
  <van-popup
    :value="visible"
    @input="$emit('update:visible', $event)"
    position="bottom"
    :style="{ height: '90%' }"
    round
  >
    <div class="student-admission-detail">
      <!-- 头部 -->
      <div class="popup-header">
        <h3>准入条件详情</h3>
        <van-icon name="cross" @click="closePopup" />
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <!-- 基本信息 -->
        <div class="basic-info-section">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">基本信息</span>
          </div>
          <van-cell-group>
            <van-cell title="训练机型" :value="studentInfo.fleetCd" />
            <van-cell title="提纲" :value="studentInfo.outlineName" />
            <van-cell title="科目" :value="studentInfo.subjectsName" />
            <van-cell title="学员" :value="`${studentInfo.studentName} (${studentInfo.employeeId})`">
              <template #right-icon>
                <van-button type="primary" size="small" @click="showStudentSelector">切换学员</van-button>
              </template>
            </van-cell>
          </van-cell-group>
        </div>

        <!-- 技术信息 -->
        <div class="technical-info-section">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">技术信息</span>
          </div>
          <div class="technical-info-box">
            <van-cell-group>
              <van-cell title="技术等级" :value="studentInfo.technicalLevel" />
              <van-cell title="分部" :value="studentInfo.division || '无'" />
              <van-cell title="注册基地" :value="studentInfo.registrationBase" />
              <van-cell title="运行基地" :value="studentInfo.operatingBase" />
              <van-cell title="训练基地" :value="studentInfo.trainingBase" />
            </van-cell-group>
          </div>
        </div>

        <!-- 准入条件 -->
        <div class="access-condition-section">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">准入条件</span>
          </div>
          <div class="access-condition-content">
            <van-cell-group>
              <van-cell :title="accessConditionContent" />
            </van-cell-group>
          </div>
        </div>

        <!-- 电子化准入条件 -->
        <div class="electronic-access-condition-section">
          <div class="section-title">
            <div class="title-bar"></div>
            <span class="title-text">电子化准入条件</span>
          </div>

          <!-- 校验结果 -->
          <div class="validation-result">
            <van-tag :type="validationResult.isValid ? 'success' : 'danger'" size="medium">
              {{ validationResult.isValid ? '准入条件校验通过' : '准入条件校验不通过' }}
            </van-tag>
          </div>

          <!-- 电子化准入条件管理器 -->
          <AccessConditionManager
            :data="electronicAccessConditionData"
            :type="electronicAccessConditionData.accessConditionType"
            :editable="false"
            @show-detail="handleShowDetail"
            @condition-change="handleConditionChange"
            @formula-change="handleFormulaChange"
            @confirm-satisfaction="handleConfirmSatisfaction"
            @cancel-confirmation="handleCancelConfirmation"
            @preview-file="handlePreviewFile"
            @upload-attachment="handleUploadAttachment"
            ref="accessConditionManagerRef"
          />
        </div>
      </div>
    </div>

    <!-- 学员选择器弹窗 -->
    <van-popup
      :value="showStudentSelector"
      @input="showStudentSelector = $event"
      position="bottom"
      :style="{ height: '60%' }"
    >
      <div class="student-selector">
        <div class="selector-header">
          <h3>选择学员</h3>
          <van-icon name="cross" @click="showStudentSelector = false" />
        </div>
        <div class="selector-content">
          <van-radio-group v-model="selectedStudentId">
            <van-cell-group>
              <van-cell
                v-for="student in availableStudents"
                :key="student.employeeId"
                :title="`${student.name} (${student.employeeId})`"
                :label="student.trainingInfo"
                clickable
                @click="selectStudent(student)"
              >
                <template #right-icon>
                  <van-radio :name="student.employeeId" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </div>
        <div class="selector-actions">
          <van-button type="primary" @click="confirmStudentSelection">确认选择</van-button>
          <van-button type="default" @click="showStudentSelector = false">取消</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 文件上传弹窗 -->
    <csFileUploadPopup
      v-model="showFileUpload"
      :accept-exts="acceptedFileTypes"
      :limit-size="10"
      @read-file="onFileRead"
    />

    <!-- 文件预览弹窗 -->
    <van-popup v-model="showFilePreview" position="center" :style="{ width: '90%', height: '80%' }">
      <div class="file-preview-popup">
        <div class="preview-header">
          <h3>{{ previewFileName }}</h3>
          <van-icon name="cross" @click="showFilePreview = false" />
        </div>
        <div class="preview-content">
          <iframe v-if="previewFileUrl" :src="previewFileUrl" width="100%" height="100%"></iframe>
          <div v-else class="preview-placeholder">
            <van-icon name="description" size="48" />
            <p>文件预览功能开发中...</p>
          </div>
        </div>
      </div>
    </van-popup>
  </van-popup>
</template>

<script>
import AccessConditionManager from '../access-condition-manager/index.vue'

export default {
  name: 'StudentAdmissionDetail',
  components: {
    AccessConditionManager
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    studentData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showStudentSelector: false,
      showFileUpload: false,
      showFilePreview: false,
      selectedStudentId: '',
      previewFileUrl: '',
      previewFileName: '',
      acceptedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'bmp'],
      currentCondition: null,
      studentInfo: {
        fleetCd: '320',
        outlineName: '副驾驶初始',
        subjectsName: '副驾驶初始理论训练',
        studentName: '张三',
        employeeId: '333555',
        technicalLevel: '320: A1类副驾驶; 330: 飞行教员A',
        division: '一分部',
        registrationBase: '北京',
        operatingBase: '广州',
        trainingBase: '广州'
      },
      accessConditionContent:
        '飞行经历（1） 总飞行经历时间不得少于 800 小时的驾驶员，或者毕业于按照CCAR-141 部批准的整体课程，并完成 50 小时在局方认可的高性能多发飞机上的飞行训练或者等效训练，总飞行训练时间不少于 280小时。（2） 在原最大起飞重量在 136 吨（含）以下组类 II 飞机上担任副驾驶飞行 250 小时的驾驶员。（3） 在组类 II 机型担任机长飞行不足一年，或相应机长飞行经历时间不足 500 小时的驾驶员',
      electronicAccessConditionData: {
        accessConditionType: 1,
        accessConditionDetailDTO: {
          accessConditionZhftcGroupList: []
        }
      },
      validationResult: {
        isValid: true
      },
      availableStudents: [
        {
          employeeId: '333555',
          name: '张三',
          trainingInfo: '副驾驶初始理论训练'
        },
        {
          employeeId: '333556',
          name: '李四',
          trainingInfo: '副驾驶初始理论训练'
        },
        {
          employeeId: '333557',
          name: '王五',
          trainingInfo: '副驾驶初始理论训练'
        }
      ]
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initData()
      }
    },
    studentData: {
      handler(newData) {
        if (newData && Object.keys(newData).length > 0) {
          this.loadStudentData(newData)
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    initData() {
      this.selectedStudentId = this.studentData.employeeId || ''
      this.loadStudentData(this.studentData)
    },

    // 加载学员数据
    loadStudentData(studentData) {
      console.log('接收到的学员数据:', studentData)

      // 模拟加载学员数据
      this.studentInfo = {
        ...this.studentInfo,
        ...studentData
      }

      // 根据学员数据加载准入条件
      this.loadAccessConditions()
    },

    // 加载准入条件
    loadAccessConditions() {
      // 模拟加载准入条件数据
      // 这里应该根据实际的API调用获取数据
      if (this.studentInfo.employeeId === '333555') {
        // 使用 Type 1 数据（按标签配置）
        this.electronicAccessConditionData = {
          accessConditionType: 1,
          accessConditionRelational: 1,
          accessConditionZhftcGroupList: [
            {
              id: 1948207631607459800,
              accessConditionRelational: 1,
              accessConditionLevel: '分组1',
              childrenList: [
                {
                  id: 1948207631607459800,
                  accessConditionRelational: 1,
                  accessConditionLevel: '分组1.1',
                  childrenList: [
                    {
                      id: 1948207631611654100,
                      accessConditionRelational: 1,
                      accessConditionLevel: '分组1.1.1',
                      childrenList: [],
                      labelList: [
                        {
                          id: 72,
                          labelId: 2,
                          businessOperator: 1,
                          businessValue: '2',
                          conditionContent: '有效的汉语语言等级大于2级',
                          selectFlag: true,
                          status: 'success'
                        }
                      ]
                    }
                  ],
                  labelList: [
                    {
                      id: 71,
                      labelId: 1,
                      businessOperator: 1,
                      businessValue: '1',
                      conditionContent: '有效的ICAO英语语言等级大于1级',
                      selectFlag: true,
                      status: 'success'
                    }
                  ]
                }
              ],
              labelList: [
                {
                  id: 70,
                  labelId: 1,
                  businessOperator: 1,
                  businessValue: '1',
                  conditionContent: '有效的ICAO英语语言等级大于1级',
                  selectFlag: true,
                  status: 'success'
                }
              ]
            },
            {
              id: 1948207631611654100,
              accessConditionRelational: 1,
              accessConditionLevel: '分组2',
              childrenList: [
                {
                  id: 1948207631611654100,
                  accessConditionRelational: 1,
                  accessConditionLevel: '分组2.1',
                  childrenList: [],
                  labelList: [
                    {
                      id: 74,
                      labelId: 4,
                      businessOperator: 4,
                      businessValue: '1',
                      conditionContent: '持有商用驾驶员执照小于等于1',
                      selectFlag: false,
                      status: 'error'
                    }
                  ]
                }
              ],
              labelList: [
                {
                  id: 73,
                  labelId: 2,
                  businessOperator: 2,
                  businessValue: '2',
                  conditionContent: '有效的汉语语言等级大于等于2级',
                  selectFlag: true,
                  status: 'success'
                }
              ]
            },
            {
              id: 1948207631611654100,
              accessConditionRelational: 1,
              accessConditionLevel: '分组3',
              childrenList: [],
              labelList: [
                {
                  id: 75,
                  labelId: 3,
                  businessOperator: 5,
                  businessValue: '1',
                  conditionContent: '持有有效执照等于是',
                  selectFlag: true,
                  status: 'success'
                }
              ]
            }
          ]
        }
      } else if (this.studentInfo.employeeId === '333556') {
        // 使用 Type 2 数据（自由组合）
        this.electronicAccessConditionData = {
          accessConditionType: 2,
          conditionalExpression: '1|2|3',
          conditionalExpressionDesc: '条件1或条件2或条件3',
          accessConditionDetailList: [
            {
              id: 1000315,
              conditionType: 1,
              conditionName: '训练类',
              accessConditionNumber: 1,
              businessType: 2,
              businessTypeName: '本机型',
              businessFieldName: '机长转机型训练理论（第1次补考）',
              businessOperator: 1,
              businessOperatorName: '大于',
              businessValue1: '1',
              businessUnit: 6,
              businessUnitName: '次数',
              conditionContent: '本机型1年内机长转机型训练理论（第1次补考）通过大于1次',
              selectFlag: true,
              status: 'success'
            },
            {
              id: 1000316,
              conditionType: 1,
              conditionName: '训练类',
              accessConditionNumber: 2,
              businessType: 2,
              businessTypeName: '本机型',
              businessFieldName: '机长转机型训练模拟机',
              businessOperator: 1,
              businessOperatorName: '大于',
              businessValue1: '1',
              businessUnit: 6,
              businessUnitName: '次数',
              conditionContent: '本机型1年内机长转机型训练模拟机通过大于1次',
              selectFlag: false,
              status: 'error'
            },
            {
              id: 1000317,
              conditionType: 1,
              conditionName: '训练类',
              accessConditionNumber: 3,
              businessType: 2,
              businessTypeName: '本机型',
              businessFieldName: '机长转机型训练模拟机（第1次补考）',
              businessOperator: 1,
              businessOperatorName: '大于',
              businessValue1: '1',
              businessUnit: 6,
              businessUnitName: '次数',
              conditionContent: '本机型1年内机长转机型训练模拟机（第1次补考）通过大于1次',
              selectFlag: true,
              status: 'manual'
            }
          ]
        }
      } else {
        // 默认使用 Type 1 数据
        this.electronicAccessConditionData = {
          accessConditionType: 1,
          accessConditionRelational: 1,
          accessConditionZhftcGroupList: [
            {
              id: 1948207631607459800,
              accessConditionRelational: 1,
              accessConditionLevel: '分组1',
              childrenList: [],
              labelList: [
                {
                  id: 70,
                  labelId: 1,
                  businessOperator: 1,
                  businessValue: '1',
                  conditionContent: '有效的ICAO英语语言等级大于1级',
                  selectFlag: true,
                  status: 'success'
                }
              ]
            }
          ]
        }
      }

      console.log('加载的准入条件数据:', this.electronicAccessConditionData)
    },

    // 关闭弹窗
    closePopup() {
      this.$emit('update:visible', false)
    },

    // 显示学员选择器
    showStudentSelectorHandle() {
      this.showStudentSelector = true
    },

    // 选择学员
    selectStudent(student) {
      this.selectedStudentId = student.employeeId
    },

    // 确认学员选择
    confirmStudentSelection() {
      const selectedStudent = this.availableStudents.find(s => s.employeeId === this.selectedStudentId)
      if (selectedStudent) {
        this.loadStudentData(selectedStudent)
        this.showStudentSelector = false
        this.$emit('student-change', selectedStudent)
      }
    },

    // 处理条件详情显示
    handleShowDetail(condition) {
      console.log('显示条件详情:', condition)
    },

    // 处理条件变更
    handleConditionChange(condition, parentNode) {
      console.log('条件变更:', condition, parentNode)
    },

    // 处理公式变更
    handleFormulaChange(formula) {
      console.log('公式变更:', formula)
    },

    // 处理确认满足
    handleConfirmSatisfaction(condition) {
      console.log('确认满足条件:', condition)
      this.currentCondition = condition
      this.showFileUpload = true
    },

    // 处理取消确认
    handleCancelConfirmation(condition) {
      console.log('取消确认条件:', condition)
      // 这里可以添加取消确认的逻辑
    },

    // 处理预览文件
    handlePreviewFile(file) {
      console.log('预览文件:', file)
      this.previewFile(file)
    },

    // 处理上传附件
    handleUploadAttachment(condition) {
      console.log('上传附件:', condition)
      this.currentCondition = condition
      this.showFileUpload = true
    },

    // 文件大小超限
    // 文件上传相关方法
    onFileRead(fileData) {
      if (this.currentCondition) {
        this.currentCondition.attachment = {
          name: fileData.name,
          url: fileData.url || URL.createObjectURL(fileData.file),
          size: fileData.file.size
        }
        this.currentCondition.status = 'manual'
        this.showFileUpload = false
        this.currentCondition = null
      }
    },

    // 预览文件
    previewFile(attachment) {
      this.previewFileUrl = attachment.url
      this.previewFileName = attachment.name
      this.showFilePreview = true
    },

    // 取消确认
    cancelConfirmation(condition) {
      condition.status = 'error'
      if (condition.attachment) {
        delete condition.attachment
      }
    },

    // 确认满足
    confirmSatisfaction(condition) {
      this.currentCondition = condition
      this.showFileUpload = true
    }
  }
}
</script>

<style lang="less" scoped>
.student-admission-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    h3 {
      margin: 0;
      color: white;
    }

    .van-icon {
      cursor: pointer;
      color: white;
      font-size: 18px;
    }
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .title-bar {
        width: 4px;
        height: 18px;
        background: #3986ff;
        margin-right: 8px;
        border-radius: 2px;
      }

      .title-text {
        font-size: 16px;
        font-weight: 500;
        color: #5a709b;
      }
    }

    .basic-info-section,
    .technical-info-section,
    .access-condition-section,
    .electronic-access-condition-section {
      margin-bottom: 24px;
    }

    .technical-info-box {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 8px;
      padding: 16px;
      color: white;

      ::v-deep {
        .van-cell-group {
          background: unset;
        }
        .van-cell {
          background: transparent;
          color: white;

          .van-cell__title {
            color: rgba(255, 255, 255, 0.8);
          }

          .van-cell__value {
            color: white;
          }
        }
      }
    }

    .access-condition-content {
      ::v-deep .van-cell {
        background-color: #f8f9fa;
        border-radius: 6px;
        border-left: 3px solid #3986ff;
      }
    }

    .validation-result {
      margin-bottom: 16px;
      text-align: center;
    }
  }
}

.student-selector {
  height: 100%;
  display: flex;
  flex-direction: column;

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;

    h3 {
      margin: 0;
    }

    .van-icon {
      cursor: pointer;
      font-size: 18px;
    }
  }

  .selector-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .selector-actions {
    padding: 16px;
    display: flex;
    gap: 8px;
    border-top: 1px solid #eee;
  }
}

.file-preview-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;

    h3 {
      margin: 0;
    }

    .van-icon {
      cursor: pointer;
      font-size: 18px;
    }
  }

  .preview-content {
    flex: 1;
    padding: 16px;

    .preview-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;

      .van-icon {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
