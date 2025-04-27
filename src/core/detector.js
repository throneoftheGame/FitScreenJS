import { detectElementSize } from '../utils/helpers'

/**
 * 默认设计尺寸
 */
export const DEFAULT_DESIGN = {
  WIDTH: 1920,
  HEIGHT: 1080,
}

/**
 * 检测屏幕尺寸
 * @returns {Object} 屏幕宽高
 */
export function detectScreenSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

/**
 * 确定设计尺寸
 * @param {Object} options - 配置选项
 * @param {HTMLElement} container - 容器元素
 * @param {HTMLElement} content - 内容元素
 * @returns {Object} 设计尺寸 {width, height}
 */
export function determineDesignSize(options, container, content) {
  const {
    designWidth,
    designHeight,
    aspectRatio,
    autoDetect,
    // 从options中获取之前保存的检测到的尺寸
    detectedWidth,
    detectedHeight,
  } = options

  // 如果直接指定了设计尺寸，优先使用
  if (
    designWidth &&
    designHeight &&
    !isNaN(designWidth) &&
    !isNaN(designHeight) &&
    designWidth > 0 &&
    designHeight > 0
  ) {
    return {
      width: designWidth,
      height: designHeight,
    }
  }

  // 如果指定了宽高比
  if (aspectRatio && typeof aspectRatio === 'number' && aspectRatio > 0) {
    // 使用容器尺寸和宽高比计算设计尺寸
    const containerSize = container
      ? {
          width: container.offsetWidth,
          height: container.offsetHeight,
        }
      : detectScreenSize()

    // 根据较小的边计算另一边
    if (containerSize.width / containerSize.height > aspectRatio) {
      // 高度受限
      return {
        width: Math.round(containerSize.height * aspectRatio),
        height: containerSize.height,
      }
    } else {
      // 宽度受限
      return {
        width: containerSize.width,
        height: Math.round(containerSize.width / aspectRatio),
      }
    }
  }

  // 如果有之前检测到的尺寸，直接使用
  if (detectedWidth && detectedHeight && detectedWidth > 0 && detectedHeight > 0) {
    return {
      width: detectedWidth,
      height: detectedHeight,
    }
  }

  // 如果启用了自动检测，尝试检测内容尺寸
  if (autoDetect && content) {
    const contentSize = detectElementSize(content)
    if (contentSize.width > 0 && contentSize.height > 0) {
      return contentSize
    }
  }

  // 如果有容器，使用容器初始尺寸
  if (container) {
    const containerSize = {
      width: container.offsetWidth,
      height: container.offsetHeight,
    }

    if (containerSize.width > 0 && containerSize.height > 0) {
      return containerSize
    }
  }

  // 最后使用默认设计尺寸
  return {
    width: DEFAULT_DESIGN.WIDTH,
    height: DEFAULT_DESIGN.HEIGHT,
  }
}
