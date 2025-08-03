export default {
  newGuid: function() {
    var S4 = function() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
  },
  stringFormat(str, ...args) {
    // 格式化字符串
    args.forEach((item, index) => {
      str = str.replaceAll(`{${index}}`, item);
    });
    return str;
  },
  formatDate(date, format) {
    var o = {
      "M+": date.getMonth() + 1, // month
      "d+": date.getDate(), // day
      "h+": date.getHours(), // hour
      "m+": date.getMinutes(), // minute
      "s+": date.getSeconds(), // second
      "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
      S: date.getMilliseconds() // millisecond
    };

    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }
    return format;
  },
  parseDate(str) {
    return new Date(str.replace(/-/g, "/"));
  },
  minuteToHour(str) {
    if (str !== "0" && str !== "" && str !== null) {
      return (
        (Math.floor(str / 60).toString().length < 2 ? "0" + Math.floor(str / 60).toString() : Math.floor(str / 60).toString()) +
        ":" +
        ((str % 60).toString().length < 2 ? "0" + (str % 60).toString() : (str % 60).toString())
      );
    } else {
      return "";
    }
  },
  hourToMinute(str) {
    var arrminutes = str.split(":");
    if (arrminutes.length === 2) {
      var minutes = parseInt(arrminutes[0]) * 60 + parseInt(arrminutes[1]);
      return minutes;
    } else {
      return 0;
    }
  },
  isAndroid() {
    const userAgent = navigator.userAgent;
    return userAgent.indexOf("Android") > -1 || userAgent.indexOf("Linux") > -1;
  },
  isIOS() {
    const userAgent = navigator.userAgent;
    return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  },
  isPad() {
    const ua = navigator.userAgent;
    console.log("ua---------", ua);
    // 检测iPad
    const isiPad = /iPad|Macintosh/i.test(ua) && ("ontouchend" in document || navigator.maxTouchPoints > 0);
    // 检测安卓平板
    const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);
    // 屏幕比例辅助判断
    const isScreenTablet = window.screen.width >= 600 && window.screen.height >= 600;
    return isiPad || isAndroidTablet || isScreenTablet;
  },

  isIphonex() {
    if (typeof window !== "undefined" && window) {
      return /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
    }
    return false;
  },
  isPadForModule() {
    // if (typeof window !== "undefined" && window) {
    //   if (typeof window !== "undefined" && window) {
    //     const userAgent = navigator.userAgent.toLowerCase();
    //     return /macintosh|ipad|tablet|android(?!.*mobile)/.test(userAgent);
    //   }
    // }
    if (window.Vue.prototype.$env.VUE_APP_MODULE.indexOf("Pad") !== -1) {
      return true;
    } else {
      return false;
    }
  },
  inputValidate(value) {
    // 2024-02-20 取消不能输入空格的限制
    // var regRule = /[^\u4E00-\u9FA5|\d|a-zA-Z|\r\n\s,.'"?!，。‘“？！:;：；~@#%^…—&$=()_\-+/*{}[\]《》「」【】、]|\s/g;
    // var regRule = /[^\u4E00-\u9FA5|\d|a-zA-Z|\r\n\s,.'"?!，。‘“？！:;：；~@#%^…—&$=()_\-+/*{}[\]《》「」【】、]/g;
    // value = value.replace(regRule, "");
    return value;
  },
  getModuleUrl() {
    let url = window.location.href;
    let index = url.indexOf("?");
    if (index !== -1) {
      url = url.substring(0, index);
    }
    index = url.indexOf("#/");
    if (index !== -1) {
      url = url.substring(0, index);
    }
    return url;
  },
  getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substring(1).match(reg);
    if (r != null) {
      return decodeURIComponent(r[2]);
    }
    return null;
  },
  getUrlParams(baseUrl) {
    // 获取search部分(e家原生webview对emas打出来的包的链接加参数是在url“#/”后面加“?xx=xxxx”，导致使用window.location.search获取到的为空，需要使用href自行截取才行)
    // 如果有传参数就使用参数处理，否则使用window.location.href
    if (baseUrl && typeof baseUrl != "string") return; // 如果参数类型不对，直接return

    baseUrl = baseUrl ? baseUrl : window.location.href; // 获取url

    let obj = {};
    let paramUrl; // url参数部分
    if (baseUrl.indexOf("?") != -1) {
      let tempUrl = baseUrl.slice(baseUrl.indexOf("?"));
      paramUrl = tempUrl.substring(0, tempUrl.lastIndexOf("#") != -1 ? tempUrl.lastIndexOf("#") : tempUrl.length);

      let reg = /[?&][^?&=]+=[^?&]+/g;
      let queryArr = paramUrl.match(reg);
      if (queryArr) {
        queryArr.forEach(item => {
          let tempStr = item.substring(1);
          let firstIndex = tempStr.indexOf("="); // 获取第一个等号的位子用于分隔key和val
          // let key = tempStr.substring(0, firstIndex);
          // let val = tempStr.substring(firstIndex + 1);
          let key = decodeURIComponent(tempStr.substring(0, firstIndex));
          let val = decodeURIComponent(tempStr.substring(firstIndex + 1))
            .trim()
            .replace(/\s/g, "+");
          obj[key] = val;
        });
      }
    }
    return obj;
  },
  isDigit(value) {
    // 整数验证(0或者其它正整数)
    let reg = /(^(0|[1-9]\d*)$)/;
    return reg.test(value);
  },
  isNumber(value, length = 1) {
    // 数字验证（整数，小数） length为最多小数位数（0或者其它整数，小数）
    let regs = [
      /^(0|[1-9][0-9]*)(?=\.{0,1}[0-9]{0,1}$|$)/,
      /^(0|[1-9][0-9]*)(?=\.{0,1}[0-9]{0,2}$|$)/,
      /^(0|[1-9][0-9]*)(?=\.{0,1}[0-9]{0,3}$|$)/,
      /^(0|[1-9][0-9]*)(?=\.{0,1}[0-9]{0,4}$|$)/,
      /^(0|[1-9][0-9]*)(?=\.{0,1}[0-9]{0,5}$|$)/
    ];
    return regs[length - 1].test(value);
  },
  isMobile(value) {
    // 手机号码，只验证11位数字
    let reg = /^1\d{10}$/;
    return reg.test(value);
  },
  arrayToTree: function(array, idField, parentField, childrenField = "children", rootId = "") {
    const tree = []; // 用于存放结果
    const map = {}; // 用于存放 list 下的节点
    // 1. 遍历 array，将 array 下的所有节点使用 id 作为索引存入到 map
    for (const item of array) {
      let id = item[idField];
      item[childrenField] = item[childrenField] || [];
      map[id] = item; // 浅拷贝（存储对 item 的引用）
    }
    // 2. 再次遍历，将根节点放入最外层，子节点放入父节点
    for (const item of array) {
      // 3. 获取节点的 id 和 父 id
      let id = item[idField];
      let parentId = item[parentField];
      // 4. 如果是根节点，存入 tree
      if (item[parentField] === rootId) {
        tree.push(map[id]);
      } else {
        // 5. 反之，存入到父节点
        map[parentId][childrenField].push(map[id]);
        // map[parentId].children ? map[parentId].children.push(map[id]) : (map[parentId].children = [map[id]]);
      }
    }
    // 将结果返回
    return tree;
  },
  treeToArray(data, childrenField = "children") {
    let res = [];
    const dfs = tree => {
      tree.forEach(item => {
        if (item[childrenField]) {
          dfs(item[childrenField]);
          delete item[childrenField];
        }
        res.push(item);
      });
    };
    dfs(data);
    return res;
  },
  getUserText(id, name) {
    if (id && name) {
      return `${id} (${name})`;
    } else {
      return id || name;
    }
  },
  getModuleByTies(ties, params) {
    let result = null;
    const modules = window.Vue.prototype.$ehomeModules;
    for (let key in modules) {
      if (modules[key] === ties) {
        // 资质告警、告警通知模块标识重叠 特别区分
        if (ties === "com.csair.eplm.qualificationAlarm") {
          if (params) {
            result = window.Vue.prototype.getModule("qualificationAlarmInform");
            break;
          } else {
            result = window.Vue.prototype.getModule("qualificationAlarm");
            break;
          }
        } else {
          result = window.Vue.prototype.getModule(key);
          break;
        }
      }
    }
    return result;
  },
  //请求并发处理
  concurrentRequest(maxConcurrent = 6) {
    let activeCount = 0;
    const queue = [];
    return function(requestFn) {
      return new Promise((resolve, reject) => {
        const run = async () => {
          activeCount++;
          try {
            const result = await requestFn();
            resolve(result);
          } catch (err) {
            reject(err);
          } finally {
            activeCount--;
            if (queue.length > 0) {
              queue.shift()();
            }
          }
        };
        if (activeCount < maxConcurrent) {
          run();
        } else {
          queue.push(run);
        }
      });
    };
  },
  // 判断是否为空
  isEmpty(val) {
    return val === "" || val === undefined || val === null;
  },
};
