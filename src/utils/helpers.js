/**
 * 解析宽高比字符串，如 "16:9"
 * @param {string} ratio - 宽高比，例如 "16:9"
 * @returns {number} 宽高比的计算值
 */
export function parseAspectRatio(ratio) {
  if (!ratio || typeof ratio !== 'string') return null

  const parts = ratio.split(':')
  if (parts.length !== 2) return null

  const width = parseFloat(parts[0])
  const height = parseFloat(parts[1])

  if (isNaN(width) || isNaN(height) || height === 0) return null
  return width / height
}

/**
 * 获取DOM元素
 * @param {string|HTMLElement} selector - CSS选择器或DOM元素
 * @returns {HTMLElement|null} DOM元素
 */
export function getElement(selector) {
  if (!selector) return null
  if (typeof selector === 'string') {
    return document.querySelector(selector)
  }
  return selector instanceof HTMLElement ? selector : null
}

/**
 * 计算等比缩放的缩放比例
 * @param {number} containerWidth - 容器宽度
 * @param {number} containerHeight - 容器高度
 * @param {number} contentWidth - 内容宽度
 * @param {number} contentHeight - 内容高度
 * @param {boolean} [cover=false] - 是否覆盖模式
 * @returns {number} 缩放比例
 */
export function calculateScale(
  containerWidth,
  containerHeight,
  contentWidth,
  contentHeight,
  cover = false
) {
  const widthRatio = containerWidth / contentWidth
  const heightRatio = containerHeight / contentHeight

  // 等比缩放模式：取较小值，确保内容完全可见
  // 全屏填充模式：取较大值，确保容器被填满
  return cover ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio)
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 100) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * 检测元素的实际尺寸
 * @param {HTMLElement} element - 要检测的元素
 * @returns {Object} 元素的宽高
 */
export function detectElementSize(element) {
  if (!element) return { width: 0, height: 0 }

  // 获取元素的计算样式
  const computedStyle = window.getComputedStyle(element)
  const width = parseFloat(computedStyle.width)
  const height = parseFloat(computedStyle.height)

  // 如果元素有具体尺寸，直接返回
  if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
    return { width, height }
  }

  // 检查是否有内联样式或属性定义的尺寸
  const inlineWidth = element.style.width
  const inlineHeight = element.style.height

  if (inlineWidth && inlineHeight) {
    const w = parseFloat(inlineWidth)
    const h = parseFloat(inlineHeight)
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      return { width: w, height: h }
    }
  }

  // 尝试获取元素子内容的尺寸
  const childrenBounds = Array.from(element.children).reduce(
    (bounds, child) => {
      const rect = child.getBoundingClientRect()
      bounds.right = Math.max(bounds.right, rect.right)
      bounds.bottom = Math.max(bounds.bottom, rect.bottom)
      return bounds
    },
    { right: 0, bottom: 0 }
  )

  const parentRect = element.getBoundingClientRect()

  return {
    width: Math.max(width, childrenBounds.right - parentRect.left),
    height: Math.max(height, childrenBounds.bottom - parentRect.top),
  }
}
