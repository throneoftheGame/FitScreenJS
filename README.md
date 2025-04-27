# FitScreenJS

对于不同尺寸的大屏，添加等比缩放和占满全屏的功能。比如 2K 尺寸的可视化大屏，在预览打开的时候可以选择等比缩放在 1K 大屏中显示，或者占满全屏。

## 功能特点

- **等比缩放模式**：保持原始宽高比，确保内容完整显示
- **全屏填充模式**：内容填满整个屏幕，可能会裁切部分内容
- **自动检测**：可自动检测设计尺寸和屏幕尺寸
- **灵活配置**：支持多种配置方式，包括具体像素尺寸和宽高比
- **响应式**：自动响应窗口大小变化
- **事件回调**：支持尺寸变化和模式切换的回调函数

## 安装

```bash
npm install fitscreenjs
```

## 基本使用

### 简单示例

```javascript
// 引入库
import FitScreenJS from 'fitscreenjs'

// 创建实例
const screenFitter = new FitScreenJS()

// 应用到容器元素
screenFitter.applyTo('#dashboard-container')
```

### 设置选项

```javascript
const screenFitter = new FitScreenJS({
  // 设计尺寸（可选）
  designWidth: 2560,
  designHeight: 1440,

  // 也可以使用宽高比代替具体尺寸
  // aspectRatio: '16:9',

  // 显示模式：'proportional'(等比缩放) 或 'fullscreen'(占满全屏)
  mode: 'proportional',

  // 填充背景色
  backgroundColor: '#000',

  // 是否自动检测尺寸
  autoDetect: true,

  // 是否缩放内容
  scaleContent: true,

  // 是否居中内容
  centerContent: true,

  // 事件回调
  onResize: (width, height, scale) => {
    console.log(`容器尺寸: ${width}x${height}, 缩放比例: ${scale}`)
  },
  onModeChange: (mode) => {
    console.log(`模式已变更为: ${mode}`)
  },
})
```

### 切换模式

```javascript
// 切换到等比缩放模式
screenFitter.setMode('proportional')

// 切换到全屏填充模式
screenFitter.setMode('fullscreen')

// 获取当前模式
const currentMode = screenFitter.getMode()
```

### 其他操作

```javascript
// 获取当前缩放比例
const scale = screenFitter.getScale()

// 设置设计尺寸
screenFitter.setDesignSize(1920, 1080)

// 手动刷新缩放（通常在内容变化后调用）
screenFitter.refresh()

// 销毁实例（清理事件监听）
screenFitter.destroy()
```

## 在 Vue 中使用

```javascript
// Vue组件
export default {
  mounted() {
    this.fitter = new FitScreenJS({
      aspectRatio: '16:9',
      mode: 'proportional',
    })
    this.fitter.applyTo(this.$refs.dashboard)
  },
  methods: {
    toggleMode() {
      const newMode = this.fitter.getMode() === 'proportional' ? 'fullscreen' : 'proportional'
      this.fitter.setMode(newMode)
    },
  },
  beforeDestroy() {
    // 清理
    this.fitter.destroy()
  },
}
```

## 在 React 中使用

```javascript
import React, { useEffect, useRef } from 'react'
import FitScreenJS from 'fitscreenjs'

function Dashboard() {
  const containerRef = useRef(null)
  const fitterRef = useRef(null)

  useEffect(() => {
    // 初始化
    fitterRef.current = new FitScreenJS({
      aspectRatio: '16:9',
    })

    // 应用到容器
    fitterRef.current.applyTo(containerRef.current)

    // 清理函数
    return () => fitterRef.current.destroy()
  }, [])

  return (
    <div>
      <div className='dashboard-container' ref={containerRef}>
        {/* 大屏内容 */}
      </div>
      <div className='controls'>
        <button onClick={() => fitterRef.current.setMode('proportional')}>等比缩放</button>
        <button onClick={() => fitterRef.current.setMode('fullscreen')}>占满全屏</button>
      </div>
    </div>
  )
}
```

## 开发

### 安装依赖

```bash
npm install
```

### 构建库

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 运行测试

```bash
# 运行单元测试
npm test

# 实时测试模式
npm run test:watch

# 测试覆盖率报告
npm run test:coverage
```

## 测试覆盖率

当前测试覆盖率:

- 语句覆盖率: 93.3%
- 分支覆盖率: 93.81%
- 函数覆盖率: 96.55%
- 行覆盖率: 93.3%

## 许可证

MIT
