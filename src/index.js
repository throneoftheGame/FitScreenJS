import { getElement, parseAspectRatio, debounce } from './utils/helpers'
import { Scaler } from './core/scaler'
import { validateMode, MODES } from './core/modes'
import { determineDesignSize } from './core/detector'

/**
 * FitScreenJS - 大屏自适应缩放解决方案
 */
class FitScreenJS {
  /**
   * 创建FitScreenJS实例
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    // 规范化配置选项
    this.options = this._normalizeOptions(options)

    // 创建缩放器实例
    this.scaler = new Scaler({
      ...this.options,
      mode: validateMode(this.options.mode),
    })

    // 状态标志
    this.isInitialized = false
    this.isDestroyed = false

    // 如果提供了容器选择器，立即应用
    if (this.options.container) {
      this.applyTo(this.options.container)
    }
  }

  /**
   * 规范化配置选项
   * @param {Object} options - 用户提供的选项
   * @returns {Object} 规范化后的选项
   * @private
   */
  _normalizeOptions(options) {
    // 深拷贝选项对象
    const normalizedOptions = { ...options }

    // 处理宽高比
    if (options.aspectRatio && typeof options.aspectRatio === 'string') {
      normalizedOptions.aspectRatio = parseAspectRatio(options.aspectRatio)
    }

    return normalizedOptions
  }

  /**
   * 应用到指定容器
   * @param {string|HTMLElement} containerSelector - 容器选择器或DOM元素
   * @returns {FitScreenJS} 当前实例，支持链式调用
   */
  applyTo(containerSelector) {
    // 获取容器元素
    const container = getElement(containerSelector)
    if (!container) {
      console.error('[FitScreenJS] 找不到容器元素')
      return this
    }

    // 创建或获取内容包装元素
    let content = container.querySelector('.fitscreen-content')
    if (!content) {
      // 创建内容包装元素，放入所有子元素
      content = document.createElement('div')
      content.className = 'fitscreen-content'

      // 将容器的现有子元素移动到内容包装中
      while (container.firstChild) {
        content.appendChild(container.firstChild)
      }

      // 添加内容包装到容器
      container.appendChild(content)
    }

    // 设置缩放器的元素
    this.scaler.setElements(container, content)

    // 确定设计尺寸
    const designSize = determineDesignSize(this.options, container, content)
    this.scaler.setDesignSize(designSize.width, designSize.height)

    // 如果未初始化，设置窗口调整大小监听器
    if (!this.isInitialized) {
      // 使用防抖优化窗口调整大小的处理
      this._resizeHandler = debounce(() => {
        if (!this.isDestroyed) {
          this.refresh()
        }
      }, 100)

      window.addEventListener('resize', this._resizeHandler)
      this.isInitialized = true
    }

    // 初始应用缩放
    this.refresh()

    return this
  }

  /**
   * 设置显示模式
   * @param {string} mode - 显示模式 'proportional' 或 'fullscreen'
   * @returns {FitScreenJS} 当前实例，支持链式调用
   */
  setMode(mode) {
    const validMode = validateMode(mode)
    this.scaler.setMode(validMode)
    return this
  }

  /**
   * 获取当前显示模式
   * @returns {string} 当前显示模式
   */
  getMode() {
    return this.scaler.getMode()
  }

  /**
   * 获取当前缩放比例
   * @returns {number} 当前缩放比例
   */
  getScale() {
    return this.scaler.getScale()
  }

  /**
   * 设置设计尺寸
   * @param {number} width - 设计宽度
   * @param {number} height - 设计高度
   * @returns {FitScreenJS} 当前实例，支持链式调用
   */
  setDesignSize(width, height) {
    this.scaler.setDesignSize(width, height)
    return this
  }

  /**
   * 刷新缩放
   * @returns {FitScreenJS} 当前实例，支持链式调用
   */
  refresh() {
    this.scaler.refresh()
    return this
  }

  /**
   * 销毁实例，清理事件监听
   */
  destroy() {
    if (this.isInitialized && !this.isDestroyed) {
      window.removeEventListener('resize', this._resizeHandler)
      this.isDestroyed = true
    }
  }
}

// 导出模式常量
FitScreenJS.MODES = MODES

// 导出为默认和命名导出
export default FitScreenJS
export { FitScreenJS }
