<template>
  <!-- 学习进度组件 - 展示视频学习资料和学习进度管理 -->
  <div class="video-wrapper">
    <!-- 相关文件 -->
    <div class="files-box">
      <!-- 文件标题 -->
      <div class="files-title">关联文件：</div>
      <!-- 重要提示信息 -->
      <div class="files-title-tip">
        <span>
          (
          <span style="color: red; line-height: 14px; text-align: center; vertical-align: middle"> * </span>
          <span>视频素材仅作为参考资料使用，具体应以航图为准。)</span>
        </span>
      </div>
      <!-- 视频文件列表 - 遍历显示每个视频及其学习状态 -->
      <div v-for="(item, idx) in fileList" :key="item.video.id" class="file-item">
        <!-- 视频信息区域 - 包含播放按钮和视频名称 -->
        <div class="file-info" @click="playVideo(idx)">
          <van-icon :name="require('../../theme/images/learnProcess/icon-play.png')" size="20" class="play-btn" />
          <span class="file-name">{{ item.video.videoName }}</span>
        </div>
        <!-- 用户学习状态列表 - 显示每个学员的学习完成情况 -->
        <div class="user-status" v-for="crew in item.crewAndVideoWatchInfoList" :key="crew.staffNum || crew.chnName">
          <span class="user-name">{{ crew.chnName }}</span>
          <span class="user-id">({{ crew.staffNum || crew.creatorId }})</span>
          <!-- 学习状态标识 - 根据完成情况显示不同样式 -->
          <span :class="['learn-status', crew.watchStatus === 1 ? 'status-finished' : 'status-unfinished']">
            {{ crew.watchStatus === 1 ? '仿真视频学习已完成' : '仿真视频学习未完成' }}
          </span>
        </div>
      </div>
      <!-- 视频播放弹窗组件 - 模态框形式展示视频播放器 -->
      <CsPopup
        v-model="showPopup"
        style="height: 70vh"
        position="center"
        title="视频播放"
        :showCloseButton="true"
        confirmButtonText="关闭"
        closeButtonText=""
        :closeOnClickOverlay="false"
        @confirm="closeVideo"
      >
        <!-- 播放器模态框内容 -->
        <div class="player-modal-content" v-if="currentIdx !== null">
          <!-- 模态框头部 - 显示视频标题 -->
          <div class="modal-header">
            <div class="modal-title">
              {{ fileList[currentIdx].video.videoName }}
            </div>
          </div>
          <!-- 视频容器区域 -->
          <div class="video-container">
            <!-- 视频加载状态显示 -->
            <div v-if="loadingVideo" class="loading-container">
              <van-loading type="spinner" color="#1989fa" size="24px">视频加载中...</van-loading>
            </div>
            <!-- 视频播放器容器 -->
            <div class="video-player-box" v-else>
              <!-- 视频播放器包装器 -->
              <div class="video-player-wrapper">
                <!-- Video.js 视频播放器组件 - 支持进度控制和学习记录 -->
                <VideoPlayer
                  class="video-js vjs-big-play-centered"
                  ref="videoPlayer"
                  :options="getPlayerOptions(blobUrl)"
                  :playsinline="true"
                  :controls="true"
                  @ready="playerReadied"
                  @pause="onPlayerPause"
                  @ended="onPlayerEnded"
                  @loadeddata="onPlayerLoadeddata"
                  @timeupdate="onPlayerTimeupdate"
                ></VideoPlayer>
              </div>
            </div>
          </div>
        </div>
      </CsPopup>
    </div>
  </div>
</template>

<script>
// 导入Video.js样式文件
import 'video.js/dist/video-js.css'
// 导入Vue视频播放器组件
import { videoPlayer as VideoPlayer } from 'vue-video-player'
// 导入Vant弹窗组件
import { Dialog } from 'vant'

import CsPopup from '@/components/csPopup.vue'

/**
 * 学习进度组件
 * 用于管理和展示视频学习资料，包括：
 * - 视频列表展示和播放
 * - 学习进度跟踪和记录
 * - 防快进控制机制
 * - 学习完成状态管理
 * - 学习时间统计和上报
 */
export default {
  name: 'learnProcess',
  components: {
    VideoPlayer,
    CsPopup
  },
  props: {
    // 视频源数据 - 包含视频信息和学员学习状态
    sourceData: {
      type: Array,
      default: () => []
      /* validator: value => {
        return value.every(
          item => item.video && typeof item.video.videoId === 'string' && typeof item.video.id === 'string'
        )
      } */
    },
    // SOFL序列号 - 用于标识特定的飞行作业
    soflSeqNr: {
      require: true,
      type: String,
      default: ''
    }
  },
  data() {
    return {
      userId: '275107',

      showPopup: false, // 控制视频播放弹窗显示/隐藏
      currentIdx: null, // 当前播放视频的索引
      fileList: [], // 视频文件列表数据
      blobUrl: '', // 视频文件的Blob URL
      loadingVideo: false, // 视频加载状态
      watchTimer: null, // 观看时间计时器
      watchTime: 0, // 已观看时间(秒)
      totalDuration: 0, // 视频总时长(秒)
      player: null, // 视频播放器实例
      isPlayerCompete: false, // 标记播放器是否完成播放
      isDragging: false, // 是否正在拖动进度条
      lastValidTime: 0, // 最后一次有效的播放时间(防止快进)
      lastUpdateTime: 0, // 最后一次更新时间戳
      isUserInteraction: false, // 标记是否是用户交互操作
      playerErrorMsg: '网络错误，请重新打开视频弹窗' // 播放器错误提示信息
    }
  },
  computed: {
    // 当前视频对象 - 根据当前索引获取视频信息
    currentVideo() {
      if (this.currentIdx === null || this.currentIdx === undefined) {
        return null
      } else {
        return this.fileList[this.currentIdx].video
      }
    },
    // 学习人员列表 - 获取当前视频的机组学习信息
    currentCrewAndVideoWatchInfoList() {
      if (this.currentIdx === null || this.currentIdx === undefined) {
        return []
      } else {
        return this.fileList[this.currentIdx].crewAndVideoWatchInfoList
      }
    },
    // 当前登录人是否属于学习人员列表范畴 - 判断用户是否需要学习该视频
    isBelongCrewList() {
      return (this.currentCrewAndVideoWatchInfoList || []).some(
        item => item.staffNum === this.userId || item.creatorId === this.userId
      )
    },
    // 当前登录人是否30天内学习过 - 用于控制学习权限
    isLearnedIn30Days() {
      return (this.currentCrewAndVideoWatchInfoList || []).some(
        item => (item.staffNum === this.userId || item.creatorId === this.userId) && item.isLearned
      )
    },
    // 播放器的播放进度 - 是否完成播放（99%即视为完成）
    isCompete() {
      return this.watchTime >= this.totalDuration * 0.99
    },
    // 后台返回的是否完成结果 - 服务器端记录的学习状态
    isCompeteBackEnd() {
      return (
        (this.currentCrewAndVideoWatchInfoList || []).find(
          item => item.staffNum === this.userId || item.creatorId === this.userId
        )?.watchStatus === 1
      )
    },
    // 当前用户对当前视频的学习完成状态
    currentUserWatchStatus() {
      const userInfo = (this.currentCrewAndVideoWatchInfoList || []).find(
        item => item.staffNum === this.userId || item.creatorId === this.userId
      )
      return userInfo?.watchStatus || 0
    },
    // 是否需要进度条控制（学习人员且未完成学习的视频）
    needProgressControl() {
      return this.isBelongCrewList && this.currentUserWatchStatus === 0
    }
  },
  mounted() {
    window.addEventListener('visibilitychange', this.handleVisibilityChange)
  },
  methods: {
    /**
     * 处理页面可见性变化
     * 当用户切换标签页或最小化窗口时自动暂停视频
     */
    handleVisibilityChange() {
      if (document.hidden) {
        // 页面隐藏时暂停视频
        this.player?.pause()
      } else {
        // 页面重新显示时恢复播放
        /* if (this.player && this.showPopup) {
          this.player.play();
        } */
      }
    },
    /**
     * 监听播放进度更新 - timeupdate事件实现
     * 防止用户快进视频，确保完整学习
     * @param {Object} player - 视频播放器实例
     */
    onPlayerTimeupdate(player) {
      // 非学习人员或已完成学习的视频允许自由拖动进度条，不进行任何限制
      if (!this.needProgressControl) {
        this.watchTime = player.currentTime()
        return
      }

      // 学习人员且未完成学习的视频需要进行防快进控制
      if (!this.player) return

      const currentTime = player.currentTime()
      const now = Date.now()

      // 如果是用户交互（拖动或点击），使用更严格的检查
      if (this.isUserInteraction) {
        if (currentTime > this.lastValidTime) {
          const wasPlaying = !player.paused()
          player.currentTime(this.lastValidTime) // 强制回到上次有效位置
          // 如果之前在播放，则继续播放
          if (wasPlaying) {
            player.play()
          }
          return
        }
      } else {
        // 正常播放时的检查
        // 检查时间间隔是否合理（正常播放时的时间间隔）
        const timeDiff = currentTime - this.lastValidTime
        const timeSinceLastUpdate = (now - this.lastUpdateTime) / 1000

        // 如果时间差大于实际经过的时间，说明可能是快进
        if (timeDiff > timeSinceLastUpdate + 0.1) {
          const wasPlaying = !player.paused()
          player.currentTime(this.lastValidTime) // 防快进：回到上次有效位置
          // 如果之前在播放，则继续播放
          if (wasPlaying) {
            player.play()
          }
          return
        }
      }

      // 更新时间和状态
      this.lastValidTime = currentTime
      this.lastUpdateTime = now
      this.watchTime = currentTime
      this.isUserInteraction = false
    },
    /**
     * 播放视频
     * @param {number} idx - 视频在列表中的索引
     */
    async playVideo(idx) {
      // 只支持在详情页播放
      /* if (!this.$route.path.includes("/riskRadar/report")) {
        return;
      } */

      this.currentIdx = idx
      this.loadingVideo = true
      // 清理之前的blob URL，避免内存泄漏
      if (this.blobUrl) {
        URL.revokeObjectURL(this.blobUrl)
        this.blobUrl = ''
      }
      try {
        const { videoId, id } = this.currentVideo
        if (!videoId || !id) {
          throw new Error('对应视频内容不存在，请向IT人员反馈情况')
        }
        this.showPopup = true
        // 获取视频文件的Blob URL
        // const url = await this.fetchSourceByMP4(this.currentVideo)
        const url = require('../../source/1640104_videoUrl.mp4')
        this.blobUrl = url
        this.playerErrorMsg = '网络错误，请重新打开视频弹窗' // 正常时重置
      } catch (e) {
        console.log('playVideo --- e', e)
        this.blobUrl = ''
        this.playerErrorMsg = e.message || '视频加载失败'
        this.$toast(e.message)
      }
      this.loadingVideo = false
    },
    /**
     * 关闭视频播放器
     * 处理学习进度保存和确认提示
     */
    async closeVideo() {
      this.player?.pause()
      // 如果是学习人员且未完成学习，提示确认
      if (
        this.player &&
        this.totalDuration > 0 &&
        this.needProgressControl &&
        !this.isCompete &&
        !this.isPlayerCompete &&
        !this.isCompeteBackEnd
      ) {
        const remainingPercent = Math.round((1 - this.watchTime / this.totalDuration) * 100)
        try {
          await this.$dialog.confirm({
            title: '提示',
            message: `是否暂停学习？目前进度还剩${remainingPercent}%`,
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          })
        } catch {
          // this.player?.play();
          return // 用户点击取消，不关闭视频
        }
      }
      // 清理观看计时器
      if (this.watchTimer) {
        clearInterval(this.watchTimer)
        this.watchTimer = null
      }
      // window.removeEventListener("beforeunload", this.reportWatchTime);
      // 只有符合学习成员且未完成学习才刷新数据
      // 如果已经完成播放，则刷新顶层数据，更新isCompeteBackEnd
      if (this.needProgressControl && !this.isCompeteBackEnd) {
        if (this.isPlayerCompete) {
          this.showLoading('正在保存学习进度')
          setTimeout(() => {
            this.$emit('reload') // 通知父组件重新加载数据
          }, 1000)
        }
      }
      // 备用方案整个页面刷新
      // this.isBelongCrewList && this.isCompete && this.$router.go(0);

      // 重置所有状态和清理资源
      this.showPopup = false
      this.currentIdx = null
      if (this.blobUrl) {
        URL.revokeObjectURL(this.blobUrl) // 释放blob URL内存
        this.blobUrl = ''
      }
      this.player = null
      this.watchTime = 0
      this.totalDuration = 0
    },
    /**
     * 获取视频文件的MP4格式数据
     * @param {Object} videoObj - 视频对象，包含videoId和videoUrl
     * @param {number} retryCount - 重试次数，默认2次
     * @returns {string} 返回Blob URL
     */
    async fetchSourceByMP4(videoObj, retryCount = 2) {
      try {
        const { videoId, videoUrl } = videoObj
        const url = `${this.$api.riskRadarV2.videoDown}?videoId=${videoId || ''}&videoUrl=${videoUrl || ''}`
        const response = await this.$http.fetchBlob(url)
        console.log('response', response) // blob {size: 27794106, type: 'multipart/form-data'}

        // 检查是否是Blob类型且内容类型是文件流
        if (!(response instanceof Blob) || !response.type.startsWith('multipart/')) {
          // 如果是HTML内容，说明可能是错误页面
          if (response.type === 'text/html') {
            throw new Error('服务器返回错误，请稍后重试')
          }
          throw new Error('服务器返回错误，请稍后重试')
        }
        console.log('response', response)
        // 将响应转换为MP4格式的Blob并创建URL
        const blob = new Blob([response], { type: 'video/mp4' })
        return window.URL.createObjectURL(blob)
      } catch (error) {
        console.error('视频获取失败:', error)
        // 失败时进行重试
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒后重试
          return this.fetchSourceByMP4(videoObj, retryCount - 1)
        }
        throw new Error(error.message)
      }
    },
    /**
     * 获取视频播放器配置选项
     * @param {string} url - 视频文件的URL
     * @returns {Object} Video.js播放器配置对象
     */
    getPlayerOptions(url) {
      return {
        fill: true,
        sources: [
          {
            type: 'video/mp4',
            src: url
          }
        ],
        autoplay: false, // 禁止自动播放
        muted: false, // 不静音
        loop: false, // 不循环播放
        preload: 'auto', // 自动预加载
        language: 'zh-CN', // 中文界面
        aspectRatio: '16:9', // 宽高比
        fluid: true, // 响应式
        notSupportedMessage: this.playerErrorMsg, // 不支持时的错误消息
        html5: {
          hls: {
            overrideNative: true
          },
          nativeVideoTracks: true,
          nativeAudioTracks: true,
          nativeTextTracks: true
        },
        controlBar: {
          currentTimeDisplay: true, // 显示当前时间
          timeDivider: true, // 显示时间分隔符
          durationDisplay: true, // 显示总时长
          remainingTimeDisplay: false, // 不显示剩余时间
          playbackRateMenuButton: !this.needProgressControl, // 非学习人员或已完成学习的视频才显示倍速按钮
          progressControl: true, // 显示进度条
          children: [
            { name: 'playToggle' }, // 播放/暂停按钮
            { name: 'currentTimeDisplay' }, // 当前时间显示
            { name: 'progressControl' }, // 进度条
            { name: 'durationDisplay' }, // 总时长显示
            { name: 'volumePanel', inline: false, volumeBar: false }, // 音量控制
            { name: 'FullscreenToggle' } // 全屏按钮
          ]
        }
      }
    },
    // 播放记录请求
    async getSavedWatchTime({ videoId, rirdVideoInfoId, videoUrl }) {
      // const key = `video_watch_progress_${videoId}_${rirdVideoInfoId}`;
      // const localCache = Number(this.$localStorage.getItem(key) || 0);
      // 非学习人员或已完成学习的视频不请求获取播放记录的接口
      if (!this.needProgressControl) {
        return 0
      }
      const params = {
        soflSeqNr: this.soflSeqNr,
        videoId: videoId,
        rirdVideoInfoId: rirdVideoInfoId,
        videoUrl
      }
      const response = await this.$http.get(this.$api.riskRadarV2.videoWatchInfo, params)
      const backEndWatchProcess = response?.learnedTime
      // if (backEndWatchProcess && backEndWatchProcess > 0) {
      // this.saveWatchTimeLocal(videoId, backEndWatchProcess);
      // }
      // 获取播放进度/restapp/rird/v2/video/watch/info，用get的方式
      return backEndWatchProcess || 0
    },
    saveWatchTimeLocal({ videoId, rirdVideoInfoId }, time) {
      try {
        const key = `video_watch_progress_${videoId}_${rirdVideoInfoId}`
        this.$localStorage.setItem(key, String(time))
      } catch (error) {
        console.error('本地存储失败:', error)
        // 存储空间不足时清理旧数据
        this.clearOldWatchRecords()
      }
    },
    // 清理旧的观看记录
    clearOldWatchRecords() {
      const keys = Object.keys(this.$localStorage)
      const watchKeys = keys.filter(key => key.startsWith('video_watch_progress_'))
      // 按时间排序，删除最旧的记录
      watchKeys
        .sort()
        .slice(0, 10)
        .forEach(key => {
          this.$localStorage.removeItem(key)
        })
    },
    reportWatchTime() {
      if (this.currentIdx === null || this.isCompeteBackEnd) return
      // const videoId = this.currentVideo.videoId;
      // const rirdVideoInfoId = this.currentVideo.id;
      // this.saveWatchTimeLocal({ videoId, rirdVideoInfoId }, this.watchTime);
      console.log('reportWatchTime ---- 是否需要进度控制needProgressControl', this.needProgressControl)
      if (this.needProgressControl) {
        this.saveWatchTimeBackEnd()
      }
    },
    saveWatchTimeBackEnd() {
      // 保存观看记录
      const now = new Date()
      const endTime = this.formatDate(now)
      const startTime = this.formatDate(new Date(now.getTime() - this.watchTime * 1000))

      const watchInfo = {
        soflSeqNr: this.soflSeqNr,
        rirdVideoInfoId: this.currentVideo.id,
        videoId: this.currentVideo.videoId,
        videoUrl: this.currentVideo.videoUrl,
        startTime: startTime,
        endTime: endTime,
        totalTime: this.totalDuration || null,
        learnedTime: this.watchTime || null,
        watchStatus: this.isCompete || this.isPlayerCompete ? 1 : 0 // 观看超过98%视为完成
      }

      // 调用保存接口
      this.$http
        .postJson(this.$api.riskRadarV2.videoWatchInfo, JSON.stringify(watchInfo))
        .then(res => {
          console.log('保存观看记录成功:', res)
        })
        .catch(err => {
          console.error('保存观看记录失败:', err)
        })
    },
    // 格式化日期为 yyyy-MM-dd HH:mm:ss
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    // 播放器ready时，恢复进度并开启定时器
    playerReadied(player) {
      this.player = player
      if (document.hidden) {
        player?.pause()
      }
      // 这个钩子获取不到视频长度不在这里做长度赋值
      // this.totalDuration = player.duration();

      // 只对学习人员且未完成学习的视频添加进度条拖动限制事件监听
      if (this.needProgressControl) {
        const seekBar = player.controlBar.progressControl.seekBar
        if (seekBar) {
          // 拖动开始
          seekBar.on('mousedown', () => {
            this.isDragging = true
            this.isUserInteraction = true
          })

          // 拖动结束
          seekBar.on('mouseup', () => {
            this.isDragging = false
            if (player.currentTime() > this.lastValidTime) {
              const wasPlaying = !player.paused()
              player.currentTime(this.lastValidTime)
              // 如果之前在播放，则继续播放
              if (wasPlaying) {
                player.play()
              }
            }
          })

          // 点击进度条
          seekBar.on('click', () => {
            this.isUserInteraction = true
            if (player.currentTime() > this.lastValidTime) {
              const wasPlaying = !player.paused()
              player.currentTime(this.lastValidTime)
              // 如果之前在播放，则继续播放
              if (wasPlaying) {
                player.play()
              }
            }
          })
        }

        // 监听播放器的时间变化事件
        player.on('seeking', () => {
          this.isUserInteraction = true
          if (player.currentTime() > this.lastValidTime) {
            const wasPlaying = !player.paused()
            player.currentTime(this.lastValidTime)
            // 如果之前在播放，则继续播放
            if (wasPlaying) {
              player.play()
            }
          }
        })
      }
    },
    updateWatchTime() {
      if (!this.player) return
      this.watchTime = this.player.currentTime()
    },
    onPlayerPause() {
      if (!this.isPlayerCompete) {
        this.reportWatchTime()
      }
    },
    onPlayerEnded() {
      if (!this.isPlayerCompete) {
        // this.reportWatchTime();
        this.isPlayerCompete = true
      }
    },
    /*  onPlayerWaiting() {
      if (!this.isPlayerCompete) {
        this.reportWatchTime();
      }
    }, */
    formatSecondsToMinutes(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    async onPlayerLoadeddata(player) {
      // 只有学习人员且未完成学习的视频才禁用进度条拖动
      if (this.needProgressControl) {
        player.controlBar.progressControl.disable()
      }
      try {
        console.log('player loadeddata!', player)
        console.log('视频元数据已加载')
        this.totalDuration = player.duration()
        console.log('视频总时长:', this.totalDuration)
        if (!this.totalDuration || isNaN(this.totalDuration)) {
          throw new Error('视频格式不支持，请使用其他设备或浏览器重试')
        }
        if (this.currentIdx !== null) {
          const videoId = this.currentVideo.videoId
          const rirdVideoInfoId = this.currentVideo.id
          const videoUrl = this.currentVideo.videoUrl
          const saved = await this.getSavedWatchTime({
            videoId,
            rirdVideoInfoId,
            videoUrl
          })
          // 当保存的进度大于合格时间，从头播放
          this.$nextTick(() => {
            if (saved > 0 && saved < this.totalDuration && saved < this.totalDuration * 0.98) {
              this.watchTime = saved
              Dialog.confirm({
                title: '标题',
                message: '上次观看到 ' + (saved ? this.formatSecondsToMinutes(saved) : '') + '，是否继续播放?'
              }).then(() => {
                this.lastValidTime = saved // 设置初始的lastValidTime
                player.currentTime(saved)
              })
            } else {
              this.watchTime = 0
              this.isPlayerCompete = this.isCompeteBackEnd // 当保存的进度大于合格时间相当于已完成，初始化时默认完成
            }
          })
        }
        // 定时器
        if (this.watchTimer) clearInterval(this.watchTimer)
        this.watchTimer = setInterval(this.updateWatchTime, 1500)
      } catch (error) {
        console.error('视频加载失败:', error)
      }
    },
    // 记录播放行为
    logPlayBehavior(action) {
      const log = {
        videoId: this.currentVideo?.videoId,
        action,
        timestamp: new Date().toISOString(),
        duration: this.totalDuration,
        currentTime: this.watchTime
      }
      console.log('播放行为:', log)
      // 可以发送到统计服务
    }
  },
  watch: {
    sourceData: {
      handler(newVal, oldVal) {
        console.log('oldVal === newVal', oldVal === newVal)
        console.log('learnProcess ---- sourceData', newVal)
        this.fileList = []
        if (newVal.length > 0) {
          this.fileList = newVal
        }
      },
      deep: true,
      immediate: true
    }
  },
  beforeDestroy() {
    // 清理视频资源
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
    }
    // 清理定时器
    if (this.watchTimer) {
      clearInterval(this.watchTimer)
    }
    // 移除事件监听
    // window.removeEventListener("beforeunload", this.reportWatchTime);
    // 销毁播放器
    if (this.player) {
      this.player.dispose()
    }
    window.removeEventListener('visibilitychange', this.handleVisibilityChange)
  }
}
</script>

<style lang="less" scoped>
/* Video.js 播放器样式定制 */

/* 隐藏垂直音量控制条 */
/deep/.video-js .vjs-volume-vertical {
  display: none !important;
}

/* 强制显示当前播放时间和总时长 */
/deep/.video-js .vjs-current-time,
/deep/.video-js .vjs-duration {
  display: block !important;
}

/* 修改播放器字体大小和宽度 */
/deep/.video-js {
  font-size: 13px;
  width: 100%;
}

/* 暂停时显示播放按钮 */
/deep/.vjs-paused .vjs-big-play-button,
/deep/.vjs-paused.vjs-has-started .vjs-big-play-button {
  display: block;
}

/* 时间控制组件的内边距调整 */
/deep/.video-js .vjs-time-control {
  padding-left: unset;
  padding-right: unset;
}

/* 播放按钮样式 - 圆形设计 */
/deep/.video-js .vjs-big-play-button {
  font-size: 2.5em;
  line-height: 2.3em;
  height: 2.5em;
  width: 2.5em;
  -webkit-border-radius: 2.5em;
  -moz-border-radius: 2.5em;
  border-radius: 2.5em; /* 圆形按钮 */
  background-color: #73859f;
  background-color: rgba(115, 133, 159, 0.5); /* 半透明灰蓝色背景 */
  border-width: 0.15em;
  margin-top: -1.25em; /* 垂直居中 */
  margin-left: -1.25em; /* 水平居中 */
}
/* 中间的播放箭头图标 */
/deep/.vjs-big-play-button .vjs-icon-placeholder {
  font-size: 1.63em;
}

/* 加载动画圆圈样式 */
/deep/.vjs-loading-spinner {
  font-size: 2.5em;
  width: 2em;
  height: 2em;
  border-radius: 1em; /* 圆形加载器 */
  margin-top: -1em; /* 垂直居中 */
  // margin-left: -1.5em;
}

/* 播放时允许点击屏幕控制播放/暂停 */
/deep/.video-js.vjs-playing .vjs-tech {
  pointer-events: auto;
}

/* 弹窗标题居中对齐 */
/deep/.cs-popup__title {
  text-align: center;
}

/* 视频包装器主容器 */
.video-wrapper {
  // box-sizing: border-box;
  // padding: 10px;
  // width: 100%;
  // background: #fbfcff;
  // margin: 0 auto;
  // border-radius: 20px;
  // font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;

  /* 文件列表容器 */
  .files-box {
    /* 文件标题样式 */
    .files-title {
      font-size: 14px;
      color: #444;
      margin-bottom: 4px;
      position: relative;
    }
    /* 文件标题下方装饰线 */
    .files-title::after {
      content: '';
      display: block;
      width: 69px;
      height: 3px;
      background: url('../../theme/images/learnProcess/label-bottom.png') no-repeat left center/contain;
      position: absolute;
      left: 0;
      bottom: -2px;
      pointer-events: none;
    }
    /* 文件标题提示文本 */
    .files-title-tip {
      color: #666;
      font-size: 14px;
      font-weight: 400;
    }
    /* 文件项容器 */
    .file-item {
      padding: 12px 8px;
      display: flex;
      flex-direction: column;

      /* 文件信息区域 */
      .file-info {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        padding: 0 17px;

        /* 播放按钮样式 */
        .play-btn {
          background: none;
          border: none;
          cursor: pointer;
          margin-right: 12px;
          padding: 0;
        }
        /* 文件名样式 */
        .file-name {
          color: #3788fe; /* 蓝色链接色 */
          font-size: 14px;
          font-weight: 400;
        }
      }

      /* 用户学习状态区域 */
      .user-status {
        background: #fff; /* 白色背景 */
        margin-top: 8px;
        padding: 10px 7px;

        /* 用户姓名 */
        .user-name {
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }
        /* 用户ID */
        .user-id {
          color: #888;
          margin-left: 2px;
          font-size: 12px;
        }
        /* 学习状态标签 */
        .learn-status {
          float: right;
          margin-left: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        /* 未完成状态样式 */
        .status-unfinished {
          background: #fff7e6; /* 浅黄色背景 */
          color: #faad14; /* 橙黄色文字 */
          border: 1px solid #ffe58f;
        }
        /* 已完成状态样式 */
        .status-finished {
          background: #f6ffed; /* 浅绿色背景 */
          color: #52c41a; /* 绿色文字 */
          border: 1px solid #b7eb8f;
        }
      }
    }
  }
}

/* 弹窗组件样式定制 */
::v-deep.van-popup {
  box-sizing: border-box;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); /* 阴影效果 */

  /* 居中弹窗样式 */
  &.van-popup--center {
    display: flex;
    flex-direction: column;
  }

  /* 下拉菜单内容样式 */
  &.van-dropdown-item__content {
    position: absolute;
  }
}

/* 播放器模态框内容样式 */
.player-modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  /* 模态框头部样式 */
  .modal-header {
    padding: 5px 16px;
    background: #f8f9fa; /* 浅灰色背景 */
    border-bottom: 1px solid #ebedf0; /* 底部边框 */

    /* 模态框标题 */
    .modal-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      white-space: nowrap; /* 不换行 */
      overflow: hidden; /* 超出隐藏 */
      text-overflow: ellipsis; /* 省略号 */
      text-align: center; /* 居中对齐 */
    }
  }

  /* 视频容器样式 */
  .video-container {
    flex: 1; /* 占满剩余空间 */
    position: relative;
    background: #000; /* 黑色背景 */

    /* 加载状态容器 */
    .loading-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%); /* 绝对居中 */
      color: #fff; /* 白色文字 */
    }

    /* 视频播放器容器 */
    .video-player-box {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      /* 视频播放器包装器 */
      .video-player-wrapper {
        width: 100%;
        height: auto;
        aspect-ratio: 16/9; // 保持16:9的宽高比
      }
    }
  }
}
</style>
