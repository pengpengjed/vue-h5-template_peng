<template>
  <div class="training-application-container">
    <!-- 滑动提示 -->
    <ScrollTip />

    <!-- 标签栏 -->
    <van-tabs v-model="active">
      <van-tab title="发起申请">
        <!-- 表单 -->
        <h2>申请科目</h2>
        <TrainApplyForm ref="TrainApplyFormRef" @submit="formSubmit" @change="fieldChange"></TrainApplyForm>
        <!-- 准入条件 -->
        <h2>准入条件</h2>
        <AccessConditionText :value="accessConditionContent" label="准入条件" :editable="false" />
        <!-- 电子准入条件 -->
        <div class="electronic-access-conditions">
          <div class="section-header">
            <h2>电子准入条件</h2>
          </div>
          <AccessConditionManager
            ref="accessConditionManagerRef"
            :data="accessConditionData"
            :type="accessConditionType"
            :editable="true"
            @type-change="handleTypeChange"
            @save="handleSaveConditions"
            @condition-change="handleConditionChange"
            @show-detail="handleShowDetail"
            @formula-change="handleFormulaChange"
          />
        </div>

        <!-- 学员 -->
        <h2>学员</h2>
        <div class="students-wrapper">
          <StudentManager
            :selected-students="selectedStudents"
            @remove-student="handleRemoveStudent"
            @student-change="handleStudentChange"
          />
        </div>
        <!-- 说明 -->
        <h2>说明</h2>
        <van-field type="textarea" label="" placeholder="" v-model="desc" />
        <!-- 附件 -->
        <h2>附件</h2>
        <van-field label="上传附件" class="van-cell-vertical attachment-cell" name="fileList" :value="fileList">
          <template #input>
            <CsFileUpload
              ref="upload"
              v-model="fileList"
              @change="onFileChange"
              @file-preview="onFilePreview"
              :limitSize="20"
              :accept-exts="acceptExts"
            >
              <template #tip>
                <div><i class="icon-upload-tips"></i>添加附件（{{ acceptExts.join('、') }}）</div>
              </template>
            </CsFileUpload>
          </template>
        </van-field>
      </van-tab>
      <van-tab title="已申请"></van-tab>
    </van-tabs>
    <!-- <template #footer>
    <div class="button-bar">
      <van-button type="info" native-type="button" @click="onSubmit">提交</van-button>
    </div>
  </template> -->
  </div>
</template>

<script>
import TrainApplyForm from './trainApplyForm.vue'
import AccessConditionManager from './components/access-condition-manager/index.vue'
import StudentManager from './components/student-manager/index.vue'
import accessConditionType1Data from './mockData/accessConditionType1Data.json'
import accessConditionType2Data from './mockData/accessConditionType2Data.json'
import AccessConditionText from './components/access-condition-text/index.vue'
import ScrollTip from './components/scroll-tip/index.vue'

export default {
  name: 'trainingApplicationProxyByIfly',
  components: { TrainApplyForm, AccessConditionManager, StudentManager, AccessConditionText, ScrollTip },
  data() {
    return {
      active: 0,
      accessConditionContent: `飞行经历
（1） 总飞行经历时间不得少于 800 小时的驾驶员，或者毕业于按照
CCAR-141 部批准的整体课程，并完成 50 小时在局方认可的高性能
多发飞机上的飞行训练或者等效训练，总飞行训练时间不少于 280
小时。
（2） 在原最大起飞重量在 136 吨（含）以下组类 II 飞机上担任副驾驶飞
行 250 小时的驾驶员。
（3） 在组类 II 机型担任机长飞行不足一年，或相应机长飞行经历时间不
足 500 小时的驾驶员`,
      accessConditionType: 1, // 1: 按标签配置, 2: 自由组合
      localAccessConditions: {},
      accessConditionData: accessConditionType1Data,
      currentConfig: {
        fleetCd: '',
        syllabusVersionConfId: null,
        syllabusConfId: '',
        syllabusSubjectsConfId: ''
      },
      desc: '',
      fileList: [],
      acceptExts: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'bmp'],
      selectedStudents: [
        {
          employeeId: '333555',
          name: '张三',
          trainingInfo: '副驾驶初始理论训练',
          status: 'success',
          fleetCd: '320',
          outlineName: '副驾驶初始',
          subjectsName: '副驾驶初始理论训练',
          technicalLevel: '320: A1类副驾驶; 330: 飞行教员A',
          division: '一分部',
          registrationBase: '北京',
          operatingBase: '广州',
          trainingBase: '广州'
        },
        {
          employeeId: '333556',
          name: '李四',
          trainingInfo: '副驾驶初始理论训练',
          status: 'error',
          fleetCd: '320',
          outlineName: '副驾驶初始',
          subjectsName: '副驾驶初始理论训练',
          technicalLevel: '320: A1类副驾驶',
          division: '二分部',
          registrationBase: '上海',
          operatingBase: '深圳',
          trainingBase: '深圳'
        },
        {
          employeeId: '333557',
          name: '王五',
          trainingInfo: '副驾驶初始理论训练',
          status: 'manual',
          fleetCd: '320',
          outlineName: '副驾驶初始',
          subjectsName: '副驾驶初始理论训练',
          technicalLevel: '320: A1类副驾驶',
          division: '三分部',
          registrationBase: '广州',
          operatingBase: '广州',
          trainingBase: '广州'
        }
      ]
    }
  },
  methods: {
    onFileChange() {
      this.$refs.form.validate('fileList').catch(() => {})
    },
    onFilePreview(item) {
      // downLoadFile
      // 查看已上传的附件
      const file = {
        fileId: item.id,
        fileName: item.name,
        filePath: `downloadFiles/applyForExtension/${item.id}/`,
        fileUrl: '',
        size: 0
      }
      // 附件下载地址，ready是手动选择的，否则是从接口获取的
      if (item.status === 'ready') {
        file.fileUrl = item.url
        this.showLoading('正在加载', false)
        this.$attachmentUtil.viewFile({
          fileName: '',
          filePath: item.path
        })
      } else {
        this.showLoading('正在加载', false)
        file.fileUrl = this.$api.applyForExtension.downLoadFile + '?id=' + file.fileId
        this.$attachmentUtil.viewAttachment(file)
      }
    },
    fieldChange(fieldValue, val) {
      if (fieldValue === 'syllabusSubjectsConfId') {
        console.log('fieldValue, val', fieldValue, val)
      }
    },
    formSubmit(formData) {
      console.log('formData', formData)
    },

    // 处理类型变更
    handleTypeChange(type) {
      this.accessConditionType = type
      if (type === 1) {
        this.accessConditionData = accessConditionType1Data
      } else if (type === 2) {
        this.accessConditionData = accessConditionType2Data
      }
    },

    // 处理保存条件
    handleSaveConditions(result) {
      console.log('保存的条件数据:', result)

      // 这里可以调用API保存数据
      this.$toast.success('条件保存成功')
    },

    // 处理条件变更
    handleConditionChange(condition, parentNode) {
      console.log('条件变更:', condition, parentNode)
    },

    // 处理条件详情显示
    handleShowDetail(condition) {
      console.log('显示条件详情:', condition)
    },

    // 处理公式变更
    handleFormulaChange(formula) {
      console.log('公式变更:', formula)
    },

    // 切换条件类型
    switchConditionType(type) {
      this.accessConditionType = type
      if (type === 1) {
        this.accessConditionData = accessConditionType1Data
      } else if (type === 2) {
        this.accessConditionData = accessConditionType2Data
      }
    },

    // 处理学员变更
    handleStudentsChanged(students) {
      this.selectedStudents = students
      console.log('学员列表变更:', students)
    },

    // 移除学员
    handleRemoveStudent(employeeId) {
      this.selectedStudents = this.selectedStudents.filter(student => student.employeeId !== employeeId)
      console.log('移除学员:', employeeId)
    },

    // 处理学员变更
    handleStudentChange(student) {
      console.log('学员变更:', student)
    }
  },
  created() {}
}
</script>

<style lang="scss" scoped>
.training-application-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.trainingApplicationProxyByIfly {
  width: 100%;
  height: 100%;
  margin: 0;

  .conditions-wrapper {
    ::v-deep.van-cell {
      background-color: #f2f2f2;
    }
  }

  .electronic-access-conditions {
    margin: 16px 0;

    .section-header {
      margin-bottom: 16px;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }
  }

  .students-wrapper {
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin: 16px 0;
  }
}
</style>
