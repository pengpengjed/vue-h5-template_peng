<template>
  <!-- 标签栏 -->
  <TabsWrapper :active="active">
    <template #applying>
      <!-- 表单 -->
      <ItemWrapper title="申请科目">
        <TrainApplyForm ref="TrainApplyFormRef" @submit="formSubmit" @change="fieldChange"></TrainApplyForm>
      </ItemWrapper>
      <!-- 准入条件 -->
      <ItemWrapper title="准入条件" :isContentInBox="true">
        <AccessConditionText v-model="accessConditionContent" label="" placeholder="" :editable="false" />
      </ItemWrapper>
      <!-- 电子准入条件 -->
      <div class="type-switch">
        <VanButton
          :type="accessConditionType === 1 ? 'primary' : 'default'"
          size="small"
          @click="switchConditionType(1)"
        >
          按标签配置
        </VanButton>
        <VanButton
          :type="accessConditionType === 2 ? 'primary' : 'default'"
          size="small"
          @click="switchConditionType(2)"
        >
          自由组合
        </VanButton>
      </div>
      <ItemWrapper title="电子准入条件" :isContentInBox="true">
        <AccessConditionManager
          ref="accessConditionManagerRef"
          :data="accessConditionData"
          :type="accessConditionType"
          :page-type="1"
          :editable="false"
          @type-change="handleTypeChange"
          @save="handleSaveConditions"
          @condition-change="handleConditionChange"
          @show-detail="handleShowDetail"
          @formula-change="handleFormulaChange"
        />
      </ItemWrapper>

      <!-- 学员 -->
      <ItemWrapper v-show="true" title="学员">
        <template #item-title-right>
          <VanButton color="#398AFF" size="mini" icon="add-o" round @click="showAddPersonnel">添加人员</VanButton>
        </template>
        <StudentManager
          ref="StudentManagerRef"
          :selected-students="selectedStudents"
          @remove-student="handleRemoveStudent"
          @student-change="handleStudentChange"
        />
      </ItemWrapper>

      <!-- 说明 -->
      <ItemWrapper title="说明">
        <div class="textarea-wrapper">
          <van-field type="textarea" label="" placeholder="请输入说明内容" v-model="desc" />
        </div>
      </ItemWrapper>

      <!-- 附件 -->
      <ItemWrapper title="附件" class="upload-wrapper">
        <van-field label="" class="van-cell-vertical attachment-cell" name="fileList" :value="fileList">
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
                <div class="tip-text">支持格式：{{ acceptExts.join('、') }}，单个附件不超过20M，总的附件不超过50M</div>
                <ItemWrapper title="附件模板" :isContentInBox="true">
                  <div class="file-list">
                    <div class="file-list-item" v-for="item in exampleList" :key="item.id" @click="onFileClick(item)">
                      <slot name="file-item" :file="item">
                        {{ item.name }}
                      </slot>
                    </div>
                  </div>
                </ItemWrapper>
              </template>
            </CsFileUpload>
          </template>
        </van-field>
      </ItemWrapper>
    </template>
    <template #hasApplied>
      <applied-list @edit-application="handleEditApplication" />
    </template>
  </TabsWrapper>
  <!-- <template #footer v-if="active === 0">
      <div class="button-bar">
        <van-button type="info" native-type="button" @click="onSubmit">提交</van-button>
      </div>
    </template> -->
</template>

<script>
import TrainApplyForm from './trainApplyForm.vue'
import AccessConditionManager from '../components/access-condition-manager/index.vue'
import StudentManager from '../components/student-manager/index.vue'
import accessConditionType1Data from './mockData/accessConditionType1Data.json'
import accessConditionType2Data from './mockData/accessConditionType2Data.json'
import AccessConditionText from '../components/access-condition-text/index.vue'
import AppliedList from './components/applied-list.vue'
import TabsWrapper from '../components/tabs-wrapper/index.vue'
import ItemWrapper from '../components/item-wrapper/index.vue'
import CsFileUpload from '@/components/csFileUpload.vue'

export default {
  name: 'trainingApplicationProxyByIfly',
  components: {
    TrainApplyForm,
    AccessConditionManager,
    StudentManager,
    AccessConditionText,
    AppliedList,
    TabsWrapper,
    ItemWrapper,
    CsFileUpload
  },
  data() {
    return {
      active: 1,
      accessConditionContent: `5.5.1 语言能力水平
有效的 ICAO 英语语言能力四级或以上签注。
5.5.2 执照
持有商用驾驶员执照签注有飞机型别等级、多发等级、仪表等级的
驾驶员，并通过航线运输驾驶员执照地面理论考试。
5.5.3 体检合格证
有效一类体检合格证，并且至少在完成训练前有效。
5.5.4 飞行经历
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
      exampleList: [{ name: '个人简历.PDF' }, { name: '飞行经历.XLS' }],
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
    showAddPersonnel() {
      this.$refs.StudentManagerRef.showAddPersonnel()
    },
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
    },

    // 处理编辑申请
    handleEditApplication(applicationData) {
      console.log('编辑申请:', applicationData)
      // 切换到发起申请标签页
      this.active = 0
      // 这里可以根据applicationData填充表单数据
      this.$toast('编辑功能待实现')
    }
  },
  created() {}
}
</script>

<style lang="less" scoped>
.type-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.trainingApplicationProxyByIfly {
  background: #eef5ff;
  .textarea-wrapper {
    ::v-deep.van-cell {
      // background-color: #f2f2f2;
      border: 1px solid #e1e5ee;
      border-radius: 8px;
    }
  }

  .upload-wrapper {
    ::v-deep.van-cell {
      padding: unset;
      .van-cell__value {
        padding: unset;
      }
    }
    .tip-text {
      color: #bbb;
      font-size: 12px;
      font-weight: 400;
      line-height: 17px;
      margin-bottom: 10px;
    }
    .file-list {
      padding: 0 12px;
      .file-list-item {
        position: relative;
        line-height: 18px;
        padding: 5px;
        padding-left: 25px;
        padding-right: 30px;
        color: #00304d;
        margin: 5px 0;
        background-color: #ddeeff;
        border-radius: 4px;
        font-size: 12px;
        text-align: left;
        border-radius: 4px;
        &::before {
          content: '';
          display: block;
          width: 18px;
          height: 18px;
          position: absolute;
          left: 4px;
          top: 4px;
          background: url('../theme/images/icon_attachment.png') no-repeat center center transparent;
          background-size: cover;
        }
      }
    }
  }
  /*
  .students-wrapper {
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin: 16px 0;
  } */
  // 确保标签页内容区域有足够的高度
  // ::v-deep .van-tabs__content {
  //   height: calc(100vh - 200px);
  //   overflow: auto;
  // }

  // ::v-deep .van-tab__pane {
  //   height: 100%;
  // }
}
</style>
