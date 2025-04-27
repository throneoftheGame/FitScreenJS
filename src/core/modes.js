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
  const { scaleContent = true, backgroundColor = null } = options

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

    // 居中内容
    content.style.left = '50%'
    content.style.top = '50%'
    content.style.transform = `translate(-50%, -50%) scale(${scale})`
    content.style.transformOrigin = 'center center'
  }
}
