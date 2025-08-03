<template>
  <div class="student-manager">
    <!-- 直接输入区域 -->
    <div class="direct-input-section">
      <div class="input-wrapper">
        <van-field
          v-model="employeeIds"
          type="textarea"
          placeholder="直接输入6位数员工号，多个员工号换行输入"
          :rows="4"
          :maxlength="1000"
          @input="handleEmployeeIdsInput"
        />
        <van-button color="#398AFF" plain type="primary" size="small" @click="confirmEmployeeIds" :loading="validating">
          确定
        </van-button>
      </div>
    </div>

    <!-- 已选学员列表 -->
    <ItemWrapper title="已添加人员" :isContentInBox="true" class="selected-students">
      <!-- <div class="list-header">
        <span class="header-text">已选学员列表</span>
        <span class="count">({{ selectedStudents.length }})</span>
      </div> -->

      <div class="student-list">
        <div class="status-desc">
          <span class="status-dot success" />
          <span style="margin-right: 20px">已通过 准入条件校验</span>
          <span class="status-dot error" />
          <span>未通过 准入条件校验</span>
        </div>
        <div v-for="student in selectedStudents" :key="student.employeeId" class="student-item">
          <div class="student-info" @click="showStudentDetail(student)">
            <div class="name-id" :class="{ success: student.status === 'success', error: student.status === 'error' }">
              <span>{{ student.name }}({{ student.employeeId }})</span>
            </div>
            <div class="training-info">
              <div class="training-info-text">{{ student.trainingInfo }}</div>
              <van-button class="training-info-btn" type="info" icon="search" size="small"></van-button>
            </div>
            <van-icon
              :name="require('../../theme/images/icon-delete.svg')"
              @click.stop="removeStudent(student.employeeId)"
              size="25"
            />
          </div>
        </div>

        <van-empty v-if="selectedStudents.length === 0" description="暂无已选学员" />
      </div>
    </ItemWrapper>

    <!-- 添加人员弹窗 -->
    <van-popup v-model="showAddDialog" position="bottom" :style="{ height: '80%' }">
      <div class="add-personnel-dialog">
        <div class="dialog-header">
          <h3>添加人员</h3>
          <van-icon name="cross" @click="showAddDialog = false" />
        </div>

        <div class="dialog-content">
          <!-- 搜索区域 -->
          <div class="search-section">
            <van-field
              v-model="searchKeyword"
              placeholder="请输入员工号、姓名或姓名简拼"
              clearable
              @input="handleSearch"
            >
              <template #left-icon>
                <van-icon name="search" />
              </template>
            </van-field>
          </div>

          <!-- 推荐人员列表 -->
          <div class="recommended-section" v-if="!searchKeyword">
            <div class="section-title">系统推荐人员</div>
            <div class="personnel-list">
              <div
                v-for="person in recommendedPersonnel"
                :key="person.employeeId"
                class="personnel-item"
                @click="selectPersonnel(person)"
              >
                <div class="personnel-info">
                  <div class="name-id">{{ person.name }}({{ person.employeeId }})</div>
                  <div class="training-record">{{ person.lastTraining }}</div>
                </div>
                <van-icon name="arrow" />
              </div>
            </div>
          </div>

          <!-- 搜索结果 -->
          <div class="search-results" v-if="searchKeyword">
            <div class="section-title">搜索结果</div>
            <div class="personnel-list">
              <div
                v-for="person in searchResults"
                :key="person.employeeId"
                class="personnel-item"
                @click="selectPersonnel(person)"
              >
                <div class="personnel-info">
                  <div class="name-id">{{ person.name }}({{ person.employeeId }})</div>
                  <div class="training-record">{{ person.lastTraining }}</div>
                </div>
                <van-icon name="arrow" />
              </div>
            </div>
          </div>

          <!-- 已选人员列表 -->
          <div class="selected-section">
            <div class="section-title">已选人员</div>
            <div class="selected-personnel-list">
              <div v-for="person in tempSelectedPersonnel" :key="person.employeeId" class="selected-personnel-item">
                <div class="personnel-info">
                  <div class="name-id">{{ person.name }}({{ person.employeeId }})</div>
                  <div class="training-selection">
                    <van-field
                      v-model="person.selectedTraining"
                      placeholder="请选择关联同一提纲已完成训练"
                      readonly
                      @click="openTrainingSelector(person)"
                    />
                  </div>
                </div>
                <van-button type="danger" size="mini" @click="removeTempPersonnel(person.employeeId)">
                  移除
                </van-button>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <van-button type="default" @click="showAddDialog = false">取消</van-button>
          <van-button type="primary" @click="confirmAddPersonnel">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 训练选择弹窗 -->
    <van-popup v-model="showTrainingSelector" position="bottom" :style="{ height: '60%' }">
      <div class="training-selector">
        <div class="selector-header">
          <h3>选择关联训练</h3>
          <van-icon name="cross" @click="showTrainingSelector = false" />
        </div>
        <div class="selector-content">
          <van-radio-group v-model="selectedTrainingId">
            <van-cell-group>
              <van-cell
                v-for="training in availableTrainings"
                :key="training.id"
                :title="training.name"
                :label="training.date"
                clickable
                @click="selectTraining(training)"
              >
                <template #right-icon>
                  <van-radio :name="training.id" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
        </div>
        <div class="selector-footer">
          <van-button type="primary" @click="confirmTrainingSelection">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 学员准入条件详情弹窗 -->
    <StudentAdmissionDetail
      :visible.sync="showDetail"
      :student-data="currentStudent"
      @student-change="handleStudentChange"
    />
  </div>
</template>

<script>
import StudentAdmissionDetail from '../student-admission-detail/index.vue'
import ItemWrapper from '../item-wrapper/index.vue'

export default {
  name: 'StudentManager',
  components: {
    StudentAdmissionDetail,
    ItemWrapper
  },
  props: {
    // 当前选中的机型、大纲版本、提纲等信息
    currentConfig: {
      type: Object,
      default: () => ({})
    },
    selectedStudents: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      employeeIds: '', // 直接输入的员工号
      validating: false, // 验证中状态

      // 添加人员弹窗
      showAddDialog: false,
      searchKeyword: '',
      recommendedPersonnel: [], // 推荐人员列表
      searchResults: [], // 搜索结果
      tempSelectedPersonnel: [], // 临时已选人员

      // 训练选择弹窗
      showTrainingSelector: false,
      selectedTrainingId: '',
      availableTrainings: [], // 可用训练列表
      currentSelectingPerson: null, // 当前选择训练的人员

      // 学员详情弹窗
      showDetail: false,
      currentStudent: {}
    }
  },
  methods: {
    // 处理员工号输入
    handleEmployeeIdsInput(value) {
      // 只允许数字和换行
      this.employeeIds = value.replace(/[^\d\n]/g, '')
    },

    // 确认员工号
    async confirmEmployeeIds() {
      if (!this.employeeIds.trim()) {
        this.$toast('请输入员工号')
        return
      }

      const employeeIdList = this.employeeIds
        .trim()
        .split('\n')
        .filter(id => id.trim())

      if (employeeIdList.length === 0) {
        this.$toast('请输入有效的员工号')
        return
      }

      // 验证员工号格式
      const invalidIds = employeeIdList.filter(id => !/^\d{6}$/.test(id))
      if (invalidIds.length > 0) {
        this.$toast(`员工号格式错误: ${invalidIds.join(', ')}`)
        return
      }

      this.validating = true

      try {
        // 验证员工号
        const validationResults = await this.validateEmployeeIds(employeeIdList)

        // 处理验证结果
        validationResults.forEach(result => {
          if (result.valid) {
            this.addStudentToList(result.student)
          } else {
            this.$toast(result.message)
          }
        })

        this.employeeIds = '' // 清空输入框
      } catch (error) {
        this.$toast('验证失败，请重试')
      } finally {
        this.validating = false
      }
    },

    // 验证员工号
    async validateEmployeeIds(employeeIdList) {
      const results = []

      for (const employeeId of employeeIdList) {
        try {
          // 1. 检查员工号是否存在
          const employeeExists = await this.checkEmployeeExists(employeeId)
          if (!employeeExists) {
            results.push({
              employeeId,
              valid: false,
              message: `员工号 ${employeeId} 不存在`
            })
            continue
          }

          // 2. 检查数据权限
          const hasPermission = await this.checkDataPermission(employeeId)
          if (!hasPermission) {
            results.push({
              employeeId,
              valid: false,
              message: `无该员工号 ${employeeId} 的数据权限`
            })
            continue
          }

          // 3. 检查是否已在列表中
          const existingIndex = this.selectedStudents.findIndex(s => s.employeeId === employeeId)
          if (existingIndex !== -1) {
            // 更新现有记录
            const updatedStudent = await this.getStudentInfo(employeeId)
            const newStudents = [...this.selectedStudents]
            newStudents.splice(existingIndex, 1, updatedStudent)
            this.$emit('students-changed', newStudents)
            results.push({
              employeeId,
              valid: true,
              message: `员工 ${employeeId} 信息已更新`
            })
          } else {
            // 添加新记录
            const newStudent = await this.getStudentInfo(employeeId)
            results.push({
              employeeId,
              valid: true,
              student: newStudent
            })
          }
        } catch (error) {
          results.push({
            employeeId,
            valid: false,
            message: `验证员工号 ${employeeId} 时发生错误`
          })
        }
      }

      return results
    },

    // 检查员工是否存在
    async checkEmployeeExists(employeeId) {
      console.log('employeeId', employeeId)
      // 模拟API调用
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(true) // 模拟员工存在
        }, 100)
      })
    },

    // 检查数据权限
    async checkDataPermission(employeeId) {
      console.log('employeeId', employeeId)
      // 模拟API调用
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(true) // 模拟有权限
        }, 100)
      })
    },

    // 获取学员信息
    async getStudentInfo(employeeId) {
      // 模拟API调用
      return new Promise(resolve => {
        setTimeout(() => {
          // 模拟准入条件校验
          const isPassed = Math.random() > 0.3
          resolve({
            employeeId,
            name: `员工${employeeId}`,
            trainingInfo: isPassed ? '副驾驶初始升级训练 2025-02-11' : '无上一阶段',
            status: isPassed ? 'success' : 'error'
          })
        }, 100)
      })
    },

    // 添加学员到列表
    addStudentToList(student) {
      const newStudents = [...this.selectedStudents, student]
      this.$emit('students-changed', newStudents)
    },

    // 移除学员
    removeStudent(employeeId) {
      const newStudents = this.selectedStudents.filter(s => s.employeeId !== employeeId)
      this.$emit('students-changed', newStudents)
    },

    // 显示添加人员弹窗
    showAddPersonnel() {
      this.showAddDialog = true
      this.loadRecommendedPersonnel()
    },

    // 加载推荐人员
    async loadRecommendedPersonnel() {
      // 模拟API调用
      this.recommendedPersonnel = [
        {
          employeeId: '123456',
          name: '张三',
          lastTraining: '副驾驶初始升级训练 2024-12-01'
        },
        {
          employeeId: '234567',
          name: '李四',
          lastTraining: '机长转机型训练 2024-11-15'
        }
      ]
    },

    // 处理搜索
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.searchResults = []
        return
      }

      // 模拟搜索
      this.searchResults = this.recommendedPersonnel.filter(
        person => person.name.includes(this.searchKeyword) || person.employeeId.includes(this.searchKeyword)
      )
    },

    // 选择人员
    selectPersonnel(person) {
      const existingIndex = this.tempSelectedPersonnel.findIndex(p => p.employeeId === person.employeeId)
      if (existingIndex === -1) {
        this.tempSelectedPersonnel.push({
          ...person,
          selectedTraining: '无上一科目'
        })
      }
    },

    // 移除临时人员
    removeTempPersonnel(employeeId) {
      const index = this.tempSelectedPersonnel.findIndex(p => p.employeeId === employeeId)
      if (index !== -1) {
        this.tempSelectedPersonnel.splice(index, 1)
      }
    },

    // 显示训练选择器
    openTrainingSelector(person) {
      this.currentSelectingPerson = person
      this.showTrainingSelector = true
      this.loadAvailableTrainings(person)
    },

    // 加载可用训练
    async loadAvailableTrainings(person) {
      console.log('person', person)
      // 模拟API调用
      this.availableTrainings = [
        {
          id: 'none',
          name: '无上一科目',
          date: ''
        },
        {
          id: '1',
          name: '副驾驶初始升级训练',
          date: '2024-12-01'
        },
        {
          id: '2',
          name: '机长转机型训练',
          date: '2024-11-15'
        }
      ]
    },

    // 选择训练
    selectTraining(training) {
      this.selectedTrainingId = training.id
    },

    // 确认训练选择
    confirmTrainingSelection() {
      if (this.currentSelectingPerson && this.selectedTrainingId) {
        const training = this.availableTrainings.find(t => t.id === this.selectedTrainingId)
        if (training) {
          this.currentSelectingPerson.selectedTraining = training.name
        }
      }
      this.showTrainingSelector = false
    },

    // 确认添加人员
    confirmAddPersonnel() {
      // 验证是否选择了训练
      const invalidPersonnel = this.tempSelectedPersonnel.filter(p => !p.selectedTraining)
      if (invalidPersonnel.length > 0) {
        this.$toast('请为所有人员选择关联训练')
        return
      }

      // 添加到已选学员列表
      this.tempSelectedPersonnel.forEach(person => {
        const student = {
          employeeId: person.employeeId,
          name: person.name,
          trainingInfo: person.selectedTraining,
          status: 'success' // 模拟通过校验
        }
        this.addStudentToList(student)
      })

      this.showAddDialog = false
      this.tempSelectedPersonnel = []
    },

    // 显示学员详情
    showStudentDetail(student) {
      this.currentStudent = student
      this.showDetail = true
    },

    // 处理学员变更
    handleStudentChange(newStudent) {
      // 更新当前学员数据
      this.currentStudent = newStudent
      // 通知父组件学员变更
      this.$emit('student-change', newStudent)
    }
  }
}
</script>

<style lang="less" scoped>
.student-manager {
  .direct-input-section {
    margin-bottom: 20px;

    .input-wrapper {
      border: 1px solid #e1e5ee;
      border-radius: 8px;
      display: flex;
      flex-direction: column;

      ::v-deep {
        .van-cell {
          flex: 1;
          border-radius: 8px;
          &::after {
            border: 1px dashed #e1e5ee;
          }
        }

        .van-button {
          border: unset;
          border-radius: 8px;
          &::before {
            display: none;
          }
        }
      }
    }
  }

  .selected-students {
    .list-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .header-text {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      .count {
        margin-left: 8px;
        color: #666;
        font-size: 14px;
      }
    }

    .student-list {
      padding: 10px;
      box-sizing: border-box;
      .status-desc {
        font-size: 11px;
        color: #333333;
        font-weight: 400;
        line-height: 15px;
        .status-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 1px;
          margin-right: 6px;

          &.success {
            background: #10b981;
          }

          &.error {
            background: #dc2626;
          }

          &.manual {
            background: #f59e0b;
          }
        }
      }

      .student-item {
        display: flex;
        padding: 10px 0;
        cursor: pointer;
        border-bottom: 1px dashed #e1e5ee;
        transition: all 0.3s ease;
        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        &:last-child {
          border-bottom: unset;
        }

        .student-info {
          flex: 1;
          display: flex;
          align-items: center;
          .name-id {
            font-size: 12px;
            font-weight: 400;
            text-decoration: underline;
            width: 110px;
            text-align: center;
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 10px 10px;
            border-radius: 4px;
            margin-right: 4px;

            &.success {
              color: #007b61;
              background: #e7fffa;
              border: 1px dashed #85d1c2;
            }

            &.error {
              color: #d14102;
              background: #fff6f2;
              border: 1px dashed #ffc2a8;
            }
          }

          .training-info {
            box-sizing: border-box;
            flex: 1;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: row;
            border-radius: 4px;
            margin-right: 7px;
            &-text {
              padding: 3px 0;
              box-sizing: border-box;
              border: 1px dashed #0097eb; //改成伪元素
              flex: 1;
              color: #046097;
              font-size: 12px;
              font-weight: 400;
              overflow: hidden;
              text-overflow: ellipsis;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              /* 保留两行换行效果 */
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              /* 兼容性处理 */
              line-height: 1.5;
            }
            &-btn {
              border-radius: 4px;
              height: 100%;
              left: -2px;
            }
          }
        }
      }
    }
  }

  .add-personnel-dialog {
    height: 100%;
    display: flex;
    flex-direction: column;

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }

      .van-icon {
        cursor: pointer;
        font-size: 18px;
        color: #999;
      }
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;

      .search-section {
        margin-bottom: 16px;
      }

      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
      }

      .personnel-list {
        margin-bottom: 20px;

        .personnel-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: #f8f9fa;
          border-radius: 6px;
          cursor: pointer;

          &:hover {
            background: #e9ecef;
          }

          .personnel-info {
            flex: 1;

            .name-id {
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 4px;
            }

            .training-record {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }

      .selected-personnel-list {
        .selected-personnel-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 6px;

          .personnel-info {
            flex: 1;
            margin-right: 12px;

            .name-id {
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 8px;
            }
          }
        }
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #eee;
    }
  }

  .training-selector {
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
        font-size: 16px;
        font-weight: 500;
      }

      .van-icon {
        cursor: pointer;
        font-size: 18px;
        color: #999;
      }
    }

    .selector-content {
      flex: 1;
      overflow-y: auto;
    }

    .selector-footer {
      padding: 16px;
      border-top: 1px solid #eee;
      text-align: center;
    }
  }
}
</style>
