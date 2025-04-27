import { calculateScale, calculateNonProportionalScale } from '../utils/helpers'
import { applyProportionalMode, applyFullscreenMode, MODES } from './modes'

/**
 * 缩放计算器
 */
export class Scaler {
  /**
   * 创建缩放计算器实例
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    this.options = options
    this.container = null
    this.content = null
    this.designSize = { width: 0, height: 0 }
    this.currentScale = 1
    this.currentScaleX = 1 // 水平方向缩放比例
    this.currentScaleY = 1 // 垂直方向缩放比例
    this.currentMode = options.mode || MODES.PROPORTIONAL
    this.isInitialized = false
  }

  /**
   * 设置容器和内容元素
   * @param {HTMLElement} container - 容器元素
   * @param {HTMLElement} content - 内容元素
   */
  setElements(container, content) {
    this.container = container
    this.content = content
  }

  /**
   * 设置设计尺寸
   * @param {number} width - 设计宽度
   * @param {number} height - 设计高度
   */
  setDesignSize(width, height) {
    if (width > 0 && height > 0) {
      this.designSize = { width, height }
      this.refresh()
    }
  }

  /**
   * 设置显示模式
   * @param {string} mode - 显示模式
   */
  setMode(mode) {
    // 获取之前的模式
    const previousMode = this.currentMode

    // 更新模式
    this.currentMode = mode

    // 如果模式有变化且已初始化，刷新缩放
    if (previousMode !== this.currentMode && this.isInitialized) {
      this.refresh()

      // 触发模式变化回调
      if (typeof this.options.onModeChange === 'function') {
        this.options.onModeChange(this.currentMode)
      }
    }

    return this.currentMode
  }

  /**
   * 获取当前显示模式
   * @returns {string} 当前显示模式
   */
  getMode() {
    return this.currentMode
  }

  /**
   * 获取当前缩放比例
   * @returns {number} 当前缩放比例
   */
  getScale() {
    return this.currentScale
  }

  /**
   * 计算当前缩放比例
   * @returns {number} 计算得到的缩放比例
   */
  calculateCurrentScale() {
    if (!this.container || !this.designSize.width || !this.designSize.height) {
      return 1
    }

    const containerWidth = this.container.offsetWidth
    const containerHeight = this.container.offsetHeight

    // 全屏模式下计算非等比缩放比例
    if (this.currentMode === MODES.FULLSCREEN) {
      const nonProportionalScale = calculateNonProportionalScale(
        containerWidth,
        containerHeight,
        this.designSize.width,
        this.designSize.height
      )
      this.currentScaleX = nonProportionalScale.scaleX
      this.currentScaleY = nonProportionalScale.scaleY
    }

    // 计算等比缩放比例，fullscreen模式下使用cover=true
    return calculateScale(
      containerWidth,
      containerHeight,
      this.designSize.width,
      this.designSize.height,
      this.currentMode === MODES.FULLSCREEN
    )
  }

  /**
   * 应用缩放
   */
  applyScaling() {
    if (!this.container || !this.content) return

    // 计算缩放比例
    this.currentScale = this.calculateCurrentScale()

    // 全屏填充模式
    if (this.currentMode === MODES.FULLSCREEN) {
      applyFullscreenMode(this.container, this.content, this.currentScale, {
        ...this.options,
        scaleX: this.currentScaleX,
        scaleY: this.currentScaleY,
      })
    }
    // 等比缩放模式
    else {
      applyProportionalMode(this.container, this.content, this.currentScale, this.options)
    }

    // 触发尺寸变化回调
    if (typeof this.options.onResize === 'function') {
      this.options.onResize(
        this.container.offsetWidth,
        this.container.offsetHeight,
        this.currentScale,
        this.currentMode === MODES.FULLSCREEN
          ? { x: this.currentScaleX, y: this.currentScaleY }
          : null
      )
    }
  }

  /**
   * 刷新缩放（通常在窗口大小变化时调用）
   */
  refresh() {
    if (this.container && this.content) {
      this.applyScaling()
      this.isInitialized = true
    }
  }
}
