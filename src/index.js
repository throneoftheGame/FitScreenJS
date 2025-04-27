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

    // 确保容器有正确的样式
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.overflow = 'hidden'
    container.style.position = 'relative'

    // 查找容器内的第一个子元素，如果没有则使用容器本身
    const originalContent = container.children.length > 0 ? container.children[0] : null

    // 保存原始尺寸，用于自动检测
    let originalSize = { width: 0, height: 0 }
    if (originalContent) {
      const computedStyle = window.getComputedStyle(originalContent)
      originalSize.width = parseFloat(computedStyle.width) || originalContent.offsetWidth
      originalSize.height = parseFloat(computedStyle.height) || originalContent.offsetHeight

      // 如果内联样式指定了宽高，优先使用
      if (originalContent.style.width && originalContent.style.height) {
        originalSize.width = parseFloat(originalContent.style.width) || originalSize.width
        originalSize.height = parseFloat(originalContent.style.height) || originalSize.height
      }
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

    // 当前是否为全屏模式
    const isFullscreen = validateMode(this.options.mode) === MODES.FULLSCREEN

    // 设置内容元素的样式
    if (isFullscreen) {
      // 全屏填充模式：拉伸内容元素
      content.style.position = 'absolute'
      content.style.top = '0'
      content.style.left = '0'
      content.style.width = '100%'
      content.style.height = '100%'
      content.style.transform = 'none'

      // 记录原始设计尺寸，供后续切换模式使用
      if (originalSize.width > 0 && originalSize.height > 0) {
        content.dataset.originalWidth = originalSize.width
        content.dataset.originalHeight = originalSize.height
      }

      // 不再设置子元素的样式，保留原有样式
    } else {
      // 等比缩放模式：设置为原始尺寸
      if (originalSize.width > 0 && originalSize.height > 0) {
        content.style.width = `${originalSize.width}px`
        content.style.height = `${originalSize.height}px`
      }
    }

    // 添加到options中供determineDesignSize使用
    this.options.detectedWidth = originalSize.width
    this.options.detectedHeight = originalSize.height

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
    const previousMode = this.getMode()
    const validMode = validateMode(mode)

    // 模式发生变化，需要特殊处理内容元素的样式
    if (previousMode !== validMode && this.scaler.content) {
      const content = this.scaler.content

      // 切换到全屏填充模式
      if (validMode === MODES.FULLSCREEN) {
        // 保存原始尺寸到dataset
        if (!content.dataset.originalWidth && !content.dataset.originalHeight) {
          content.dataset.originalWidth = content.style.width || content.offsetWidth
          content.dataset.originalHeight = content.style.height || content.offsetHeight
        }

        // 清除固定宽高，允许内容拉伸
        content.style.position = 'absolute'
        content.style.top = '0'
        content.style.left = '0'
        content.style.width = '100%'
        content.style.height = '100%'
        content.style.transform = 'none'

        // 不再设置子元素样式
      }
      // 切换到等比缩放模式
      else if (previousMode === MODES.FULLSCREEN) {
        // 恢复原始设计尺寸
        let width = this.scaler.designSize.width
        let height = this.scaler.designSize.height

        // 优先使用保存在dataset中的原始尺寸
        if (content.dataset.originalWidth && content.dataset.originalHeight) {
          width = parseFloat(content.dataset.originalWidth)
          height = parseFloat(content.dataset.originalHeight)
        }

        if (width > 0 && height > 0) {
          content.style.width = `${width}px`
          content.style.height = `${height}px`

          // 不再重置子元素样式
        }
      }
    }

    // 将保留子元素样式的选项传递给scaler
    this.scaler.options.preserveChildStyles = true
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
