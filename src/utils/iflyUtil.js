const iflyUrlPrefixArray = [
  '/login-app/',
  '/manage-app/',
  '/gateway-app/',
  '/os-app/',
  '/school-app/',
  '/label-app/',
  '/training-management-app/',
  '/info-manage-app/',
  '/profile-app/',
  '/qual-app/',
  '/flight-support-app',
  '/train-manage-app'
]
// training-management-app是翔翼接口
export default {
  // 判断是否是天健的请求
  isIflyRequest: url => {
    if (!url) {
      return false
    }

    for (const item of iflyUrlPrefixArray) {
      if (url.indexOf(item) === 0) {
        return true
      }
    }
  }
}
