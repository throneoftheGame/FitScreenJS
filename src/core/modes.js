/**
 * 显示模式管理
 */

export const MODES = {
  PROPORTIONAL: 'proportional', // 等比缩放模式
  FULLSCREEN: 'fullscreen', // 全屏填充模式
}

/**
 * 验证显示模式是否有效
 * @param {string} mode - 显示模式
 * @returns {string} 有效的显示模式
 */
export function validateMode(mode) {
  if (!mode || typeof mode !== 'string') {
    return MODES.PROPORTIONAL // 默认使用等比缩放模式
  }

  const normalizedMode = mode.toLowerCase()

  // 检查是否是有效的模式
  return Object.values(MODES).includes(normalizedMode) ? normalizedMode : MODES.PROPORTIONAL
}

/**
 * 应用等比缩放模式的样式
 * @param {HTMLElement} container - 容器元素
 * @param {HTMLElement} content - 内容元素
 * @param {number} scale - 缩放比例
 * @param {Object} options - 配置选项
 */
export function applyProportionalMode(container, content, scale, options) {
  const { centerContent = true, scaleContent = true, backgroundColor = null } = options

  // 设置容器样式
  if (container) {
    container.style.position = 'relative'
    container.style.overflow = 'hidden'

    if (backgroundColor) {
      container.style.backgroundColor = backgroundColor
    }
  }

  // 设置内容样式
  if (content && scaleContent) {
    content.style.position = 'absolute'
    content.style.transformOrigin = 'top left'
    content.style.transform = `scale(${scale})`

    if (centerContent) {
      // 计算缩放后的尺寸
      const scaledWidth = content.offsetWidth * scale
      const scaledHeight = content.offsetHeight * scale

      // 计算居中的位置
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      const left = Math.max(0, (containerWidth - scaledWidth) / 2)
      const top = Math.max(0, (containerHeight - scaledHeight) / 2)

      content.style.left = `${left}px`
      content.style.top = `${top}px`
    }
  }
}

/**
 * 应用全屏填充模式的样式
 * @param {HTMLElement} container - 容器元素
 * @param {HTMLElement} content - 内容元素
 * @param {number} scale - 缩放比例
 * @param {Object} options - 配置选项
 */
export function applyFullscreenMode(container, content, scale, options) {
  const {
    scaleContent = true,
    backgroundColor = null,
    scaleX = null,
    scaleY = null,
    useTransform = true, // 是否使用transform进行缩放
    preserveChildStyles = true, // 是否保留子元素原始样式
  } = options

  // 设置容器样式
  if (container) {
    container.style.position = 'relative'
    container.style.overflow = 'hidden'
    container.style.width = '100%'
    container.style.height = '100%'

    if (backgroundColor) {
      container.style.backgroundColor = backgroundColor
    }
  }

  // 设置内容样式
  if (content && scaleContent) {
    const originalWidth = content.offsetWidth
    const originalHeight = content.offsetHeight
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    // 设置基础样式
    content.style.position = 'absolute'
    content.style.top = '0'
    content.style.left = '0'
    content.style.margin = '0'
    content.style.padding = '0'

    // 使用transform进行非等比缩放（支持X和Y方向不同的缩放比例）
    if (useTransform && scaleX !== null && scaleY !== null) {
      content.style.width = `${originalWidth}px`
      content.style.height = `${originalHeight}px`
      content.style.transformOrigin = 'top left'
      content.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`
    }
    // 使用百分比宽高进行填充
    else {
      content.style.width = '100%'
      content.style.height = '100%'
      content.style.transform = 'none'
    }

    // 处理内容元素中的子元素
    if (!preserveChildStyles && content.children.length > 0) {
      const firstChild = content.children[0]
      firstChild.style.width = '100%'
      firstChild.style.height = '100%'

      // 修改背景图片的大小以适应新尺寸
      if (firstChild.style.backgroundImage) {
        firstChild.style.backgroundSize = 'cover'
      }
    }
  }
}
