# ScrollTip 滑动提示组件

## 功能描述

这是一个滑动提示组件，用于在用户第一次访问页面时显示左右滑动的提示信息。

## 特性

- **首次访问提示**：只在用户第一次访问时显示
- **自动消失**：3秒后自动隐藏提示
- **本地存储**：使用 localStorage 记录访问状态
- **动画效果**：淡入淡出动画
- **固定定位**：固定在右上角显示

## 使用方法

```vue
<template>
  <div>
    <ScrollTip />
    <!-- 其他内容 -->
  </div>
</template>

<script>
import ScrollTip from './components/scroll-tip/index.vue'

export default {
  components: {
    ScrollTip
  }
}
</script>
```

## 组件属性

无属性，组件完全自包含。

## 样式定制

组件使用 SCSS 样式，可以通过修改以下类名来自定义样式：

- `.scroll-tip`：提示容器
- `.tip-container`：提示内容容器
- `.tip-image`：提示图片
- `.tip-text`：提示文字

## 动画

组件包含 `fadeInOut` 动画，持续3秒：
- 0-10%：淡入并向上移动
- 10-80%：保持显示
- 80-100%：淡出并向上移动

## 本地存储

组件使用 `localStorage` 存储访问状态：
- 键名：`hasVisitedScrollTip`
- 值：`true`（已访问）或 `undefined`（未访问）

## 图片资源

组件需要以下图片资源：
- 路径：`@/static/tip-scrollY.png`
- 建议尺寸：60x60px
- 格式：PNG（支持透明背景） 