/**
 * 解析宽高比字符串，如 "16:9"
 * @param {string} ratio - 宽高比，例如 "16:9"
 * @returns {number} 宽高比的计算值
 */
function parseAspectRatio(ratio) {
  if (!ratio || typeof ratio !== 'string') return null;
  const parts = ratio.split(':');
  if (parts.length !== 2) return null;
  const width = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);
  if (isNaN(width) || isNaN(height) || height === 0) return null;
  return width / height;
}

/**
 * 获取DOM元素
 * @param {string|HTMLElement} selector - CSS选择器或DOM元素
 * @returns {HTMLElement|null} DOM元素
 */
function getElement(selector) {
  if (!selector) return null;
  if (typeof selector === 'string') {
    return document.querySelector(selector);
  }
  return selector instanceof HTMLElement ? selector : null;
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
function calculateScale(containerWidth, containerHeight, contentWidth, contentHeight, cover = false) {
  const widthRatio = containerWidth / contentWidth;
  const heightRatio = containerHeight / contentHeight;

  // 等比缩放模式：取较小值，确保内容完全可见
  // 全屏填充模式：取较大值，确保容器被填满
  return cover ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
}

/**
 * 计算非等比缩放的缩放比例（分别计算宽度和高度的缩放率）
 * @param {number} containerWidth - 容器宽度
 * @param {number} containerHeight - 容器高度
 * @param {number} contentWidth - 内容宽度
 * @param {number} contentHeight - 内容高度
 * @returns {Object} 包含X和Y方向缩放比例的对象
 */
function calculateNonProportionalScale(containerWidth, containerHeight, contentWidth, contentHeight) {
  return {
    scaleX: containerWidth / contentWidth,
    scaleY: containerHeight / contentHeight
  };
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 100) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 检测元素的实际尺寸
 * @param {HTMLElement} element - 要检测的元素
 * @returns {Object} 元素的宽高
 */
function detectElementSize(element) {
  if (!element) return {
    width: 0,
    height: 0
  };

  // 获取元素的计算样式
  const computedStyle = window.getComputedStyle(element);
  const width = parseFloat(computedStyle.width);
  const height = parseFloat(computedStyle.height);

  // 如果元素有具体尺寸，直接返回
  if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
    return {
      width,
      height
    };
  }

  // 检查是否有内联样式或属性定义的尺寸
  const inlineWidth = element.style.width;
  const inlineHeight = element.style.height;
  if (inlineWidth && inlineHeight) {
    const w = parseFloat(inlineWidth);
    const h = parseFloat(inlineHeight);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      return {
        width: w,
        height: h
      };
    }
  }

  // 尝试获取元素子内容的尺寸
  const childrenBounds = Array.from(element.children).reduce((bounds, child) => {
    const rect = child.getBoundingClientRect();
    bounds.right = Math.max(bounds.right, rect.right);
    bounds.bottom = Math.max(bounds.bottom, rect.bottom);
    return bounds;
  }, {
    right: 0,
    bottom: 0
  });
  const parentRect = element.getBoundingClientRect();
  return {
    width: Math.max(width, childrenBounds.right - parentRect.left),
    height: Math.max(height, childrenBounds.bottom - parentRect.top)
  };
}

/**
 * 显示模式管理
 */

const MODES = {
  PROPORTIONAL: 'proportional',
  // 等比缩放模式
  FULLSCREEN: 'fullscreen' // 全屏填充模式
};

/**
 * 验证显示模式是否有效
 * @param {string} mode - 显示模式
 * @returns {string} 有效的显示模式
 */
function validateMode(mode) {
  if (!mode || typeof mode !== 'string') {
    return MODES.PROPORTIONAL; // 默认使用等比缩放模式
  }
  const normalizedMode = mode.toLowerCase();

  // 检查是否是有效的模式
  return Object.values(MODES).includes(normalizedMode) ? normalizedMode : MODES.PROPORTIONAL;
}

/**
 * 应用等比缩放模式的样式
 * @param {HTMLElement} container - 容器元素
 * @param {HTMLElement} content - 内容元素
 * @param {number} scale - 缩放比例
 * @param {Object} options - 配置选项
 */
function applyProportionalMode(container, content, scale, options) {
  const {
    centerContent = true,
    scaleContent = true,
    backgroundColor = null
  } = options;

  // 设置容器样式
  if (container) {
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    if (backgroundColor) {
      container.style.backgroundColor = backgroundColor;
    }
  }

  // 设置内容样式
  if (content && scaleContent) {
    content.style.position = 'absolute';
    content.style.transformOrigin = 'top left';
    content.style.transform = `scale(${scale})`;
    if (centerContent) {
      // 计算缩放后的尺寸
      const scaledWidth = content.offsetWidth * scale;
      const scaledHeight = content.offsetHeight * scale;

      // 计算居中的位置
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const left = Math.max(0, (containerWidth - scaledWidth) / 2);
      const top = Math.max(0, (containerHeight - scaledHeight) / 2);
      content.style.left = `${left}px`;
      content.style.top = `${top}px`;
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
function applyFullscreenMode(container, content, scale, options) {
  const {
    scaleContent = true,
    backgroundColor = null,
    scaleX = null,
    scaleY = null,
    useTransform = true,
    // 是否使用transform进行缩放
    preserveChildStyles = true // 是否保留子元素原始样式
  } = options;

  // 设置容器样式
  if (container) {
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.width = '100%';
    container.style.height = '100%';
    if (backgroundColor) {
      container.style.backgroundColor = backgroundColor;
    }
  }

  // 设置内容样式
  if (content && scaleContent) {
    const originalWidth = content.offsetWidth;
    const originalHeight = content.offsetHeight;
    container.offsetWidth;
    container.offsetHeight;

    // 设置基础样式
    content.style.position = 'absolute';
    content.style.top = '0';
    content.style.left = '0';
    content.style.margin = '0';
    content.style.padding = '0';

    // 使用transform进行非等比缩放（支持X和Y方向不同的缩放比例）
    if (useTransform && scaleX !== null && scaleY !== null) {
      content.style.width = `${originalWidth}px`;
      content.style.height = `${originalHeight}px`;
      content.style.transformOrigin = 'top left';
      content.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
    }
    // 使用百分比宽高进行填充
    else {
      content.style.width = '100%';
      content.style.height = '100%';
      content.style.transform = 'none';
    }

    // 处理内容元素中的子元素
    if (!preserveChildStyles && content.children.length > 0) {
      const firstChild = content.children[0];
      firstChild.style.width = '100%';
      firstChild.style.height = '100%';

      // 修改背景图片的大小以适应新尺寸
      if (firstChild.style.backgroundImage) {
        firstChild.style.backgroundSize = 'cover';
      }
    }
  }
}

/**
 * 缩放计算器
 */
class Scaler {
  /**
   * 创建缩放计算器实例
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    this.options = options;
    this.container = null;
    this.content = null;
    this.designSize = {
      width: 0,
      height: 0
    };
    this.currentScale = 1;
    this.currentScaleX = 1; // 水平方向缩放比例
    this.currentScaleY = 1; // 垂直方向缩放比例
    this.currentMode = options.mode || MODES.PROPORTIONAL;
    this.isInitialized = false;
  }

  /**
   * 设置容器和内容元素
   * @param {HTMLElement} container - 容器元素
   * @param {HTMLElement} content - 内容元素
   */
  setElements(container, content) {
    this.container = container;
    this.content = content;
  }

  /**
   * 设置设计尺寸
   * @param {number} width - 设计宽度
   * @param {number} height - 设计高度
   */
  setDesignSize(width, height) {
    if (width > 0 && height > 0) {
      this.designSize = {
        width,
        height
      };
      this.refresh();
    }
  }

  /**
   * 设置显示模式
   * @param {string} mode - 显示模式
   */
  setMode(mode) {
    // 获取之前的模式
    const previousMode = this.currentMode;

    // 更新模式
    this.currentMode = mode;

    // 如果模式有变化且已初始化，刷新缩放
    if (previousMode !== this.currentMode && this.isInitialized) {
      this.refresh();

      // 触发模式变化回调
      if (typeof this.options.onModeChange === 'function') {
        this.options.onModeChange(this.currentMode);
      }
    }
    return this.currentMode;
  }

  /**
   * 获取当前显示模式
   * @returns {string} 当前显示模式
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * 获取当前缩放比例
   * @returns {number} 当前缩放比例
   */
  getScale() {
    return this.currentScale;
  }

  /**
   * 计算当前缩放比例
   * @returns {number} 计算得到的缩放比例
   */
  calculateCurrentScale() {
    if (!this.container || !this.designSize.width || !this.designSize.height) {
      return 1;
    }
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;

    // 全屏模式下计算非等比缩放比例
    if (this.currentMode === MODES.FULLSCREEN) {
      const nonProportionalScale = calculateNonProportionalScale(containerWidth, containerHeight, this.designSize.width, this.designSize.height);
      this.currentScaleX = nonProportionalScale.scaleX;
      this.currentScaleY = nonProportionalScale.scaleY;
    }

    // 计算等比缩放比例，fullscreen模式下使用cover=true
    return calculateScale(containerWidth, containerHeight, this.designSize.width, this.designSize.height, this.currentMode === MODES.FULLSCREEN);
  }

  /**
   * 应用缩放
   */
  applyScaling() {
    if (!this.container || !this.content) return;

    // 计算缩放比例
    this.currentScale = this.calculateCurrentScale();

    // 全屏填充模式
    if (this.currentMode === MODES.FULLSCREEN) {
      applyFullscreenMode(this.container, this.content, this.currentScale, {
        ...this.options,
        scaleX: this.currentScaleX,
        scaleY: this.currentScaleY
      });
    }
    // 等比缩放模式
    else {
      applyProportionalMode(this.container, this.content, this.currentScale, this.options);
    }

    // 触发尺寸变化回调
    if (typeof this.options.onResize === 'function') {
      this.options.onResize(this.container.offsetWidth, this.container.offsetHeight, this.currentScale, this.currentMode === MODES.FULLSCREEN ? {
        x: this.currentScaleX,
        y: this.currentScaleY
      } : null);
    }
  }

  /**
   * 刷新缩放（通常在窗口大小变化时调用）
   */
  refresh() {
    if (this.container && this.content) {
      this.applyScaling();
      this.isInitialized = true;
    }
  }
}

/**
 * 默认设计尺寸
 */
const DEFAULT_DESIGN = {
  WIDTH: 1920,
  HEIGHT: 1080
};

/**
 * 检测屏幕尺寸
 * @returns {Object} 屏幕宽高
 */
function detectScreenSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/**
 * 确定设计尺寸
 * @param {Object} options - 配置选项
 * @param {HTMLElement} container - 容器元素
 * @param {HTMLElement} content - 内容元素
 * @returns {Object} 设计尺寸 {width, height}
 */
function determineDesignSize(options, container, content) {
  const {
    designWidth,
    designHeight,
    aspectRatio,
    autoDetect,
    // 从options中获取之前保存的检测到的尺寸
    detectedWidth,
    detectedHeight
  } = options;

  // 如果直接指定了设计尺寸，优先使用
  if (designWidth && designHeight && !isNaN(designWidth) && !isNaN(designHeight) && designWidth > 0 && designHeight > 0) {
    return {
      width: designWidth,
      height: designHeight
    };
  }

  // 如果指定了宽高比
  if (aspectRatio && typeof aspectRatio === 'number' && aspectRatio > 0) {
    // 使用容器尺寸和宽高比计算设计尺寸
    const containerSize = container ? {
      width: container.offsetWidth,
      height: container.offsetHeight
    } : detectScreenSize();

    // 根据较小的边计算另一边
    if (containerSize.width / containerSize.height > aspectRatio) {
      // 高度受限
      return {
        width: Math.round(containerSize.height * aspectRatio),
        height: containerSize.height
      };
    } else {
      // 宽度受限
      return {
        width: containerSize.width,
        height: Math.round(containerSize.width / aspectRatio)
      };
    }
  }

  // 如果有之前检测到的尺寸，直接使用
  if (detectedWidth && detectedHeight && detectedWidth > 0 && detectedHeight > 0) {
    return {
      width: detectedWidth,
      height: detectedHeight
    };
  }

  // 如果启用了自动检测，尝试检测内容尺寸
  if (autoDetect && content) {
    const contentSize = detectElementSize(content);
    if (contentSize.width > 0 && contentSize.height > 0) {
      return contentSize;
    }
  }

  // 如果有容器，使用容器初始尺寸
  if (container) {
    const containerSize = {
      width: container.offsetWidth,
      height: container.offsetHeight
    };
    if (containerSize.width > 0 && containerSize.height > 0) {
      return containerSize;
    }
  }

  // 最后使用默认设计尺寸
  return {
    width: DEFAULT_DESIGN.WIDTH,
    height: DEFAULT_DESIGN.HEIGHT
  };
}

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
    this.options = this._normalizeOptions(options);

    // 创建缩放器实例
    this.scaler = new Scaler({
      ...this.options,
      mode: validateMode(this.options.mode)
    });

    // 状态标志
    this.isInitialized = false;
    this.isDestroyed = false;

    // 如果提供了容器选择器，立即应用
    if (this.options.container) {
      this.applyTo(this.options.container);
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
    const normalizedOptions = {
      ...options
    };

    // 处理宽高比
    if (options.aspectRatio && typeof options.aspectRatio === 'string') {
      normalizedOptions.aspectRatio = parseAspectRatio(options.aspectRatio);
    }
    return normalizedOptions;
  }

  /**
   * 应用到指定容器
   * @param {string|HTMLElement} containerSelector - 容器选择器或DOM元素
   * @returns {FitScreenJS} 当前实例，支持链式调用
   */
  applyTo(containerSelector) {
    // 获取容器元素
    const container = getElement(containerSelector);
    if (!container) {
      console.error('[FitScreenJS] 找不到容器元素');
      return this;
    }

    // 确保容器有正确的样式
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';

    // 查找容器内的第一个子元素，如果没有则使用容器本身
    const originalContent = container.children.length > 0 ? container.children[0] : null;

    // 保存原始尺寸，用于自动检测
    let originalSize = {
      width: 0,
      height: 0
    };
    if (originalContent) {
      const computedStyle = window.getComputedStyle(originalContent);
      originalSize.width = parseFloat(computedStyle.width) || originalContent.offsetWidth;
      originalSize.height = parseFloat(computedStyle.height) || originalContent.offsetHeight;

      // 如果内联样式指定了宽高，优先使用
      if (originalContent.style.width && originalContent.style.height) {
        originalSize.width = parseFloat(originalContent.style.width) || originalSize.width;
        originalSize.height = parseFloat(originalContent.style.height) || originalSize.height;
      }
    }

    // 创建或获取内容包装元素
    let content = container.querySelector('.fitscreen-content');
    if (!content) {
      // 创建内容包装元素，放入所有子元素
      content = document.createElement('div');
      content.className = 'fitscreen-content';

      // 将容器的现有子元素移动到内容包装中
      while (container.firstChild) {
        content.appendChild(container.firstChild);
      }

      // 添加内容包装到容器
      container.appendChild(content);
    }

    // 当前是否为全屏模式
    const isFullscreen = validateMode(this.options.mode) === MODES.FULLSCREEN;

    // 设置内容元素的样式
    if (isFullscreen) {
      // 全屏填充模式：拉伸内容元素
      content.style.position = 'absolute';
      content.style.top = '0';
      content.style.left = '0';
      content.style.width = '100%';
      content.style.height = '100%';
      content.style.transform = 'none';

      // 记录原始设计尺寸，供后续切换模式使用
      if (originalSize.width > 0 && originalSize.height > 0) {
        content.dataset.originalWidth = originalSize.width;
        content.dataset.originalHeight = originalSize.height;
      }

      // 不再设置子元素的样式，保留原有样式
    } else {
      // 等比缩放模式：设置为原始尺寸
      if (originalSize.width > 0 && originalSize.height > 0) {
        content.style.width = `${originalSize.width}px`;
        content.style.height = `${originalSize.height}px`;
      }
    }

    // 添加到options中供determineDesignSize使用
    this.options.detectedWidth = originalSize.width;
    this.options.detectedHeight = originalSize.height;

    // 设置缩放器的元素
    this.scaler.setElements(container, content);

    // 确定设计尺寸
    const designSize = determineDesignSize(this.options, container, content);
    this.scaler.setDesignSize(designSize.width, designSize.height);

    // 如果未初始化，设置窗口调整大小监听器
    if (!this.isInitialized) {
      // 使用防抖优化窗口调整大小的处理
      this._resizeHandler = debounce(() => {
        if (!this.isDestroyed) {
          this.refresh();
        }
      }, 100);
      window.addEventListener('resize', this._resizeHandler);
      this.isInitialized = true;
    }

    // 初始应用缩放
    this.refresh();
    return this;
  }

  /**
   * 设置显示模式
   * @param {string} mode - 显示模式 'proportional' 或 'fullscreen'
   * @returns {FitScreenJS} 当前实例，支持链式调用
   */
  setMode(mode) {
    const previousMode = this.getMode();
    const validMode = validateMode(mode);

    // 模式发生变化，需要特殊处理内容元素的样式
    if (previousMode !== validMode && this.scaler.content) {
      const content = this.scaler.content;

      // 切换到全屏填充模式
      if (validMode === MODES.FULLSCREEN) {
        // 保存原始尺寸到dataset
        if (!content.dataset.originalWidth && !content.dataset.originalHeight) {
          content.dataset.originalWidth = content.style.width || content.offsetWidth;
          content.dataset.originalHeight = content.style.height || content.offsetHeight;
        }

        // 清除固定宽高，允许内容拉伸
        content.style.position = 'absolute';
        content.style.top = '0';
        content.style.left = '0';
        content.style.width = '100%';
        content.style.height = '100%';
        content.style.transform = 'none';

        // 不再设置子元素样式
      }
      // 切换到等比缩放模式
      else if (previousMode === MODES.FULLSCREEN) {
        // 恢复原始设计尺寸
        let width = this.scaler.designSize.width;
        let height = this.scaler.designSize.height;

        // 优先使用保存在dataset中的原始尺寸
        if (content.dataset.originalWidth && content.dataset.originalHeight) {
          width = parseFloat(content.dataset.originalWidth);
          height = parseFloat(content.dataset.originalHeight);
        }
        if (width > 0 && height > 0) {
          content.style.width = `${width}px`;
          content.style.height = `${height}px`;

          // 不再重置子元素样式
        }
      }
    }

    // 将保留子元素样式的选项传递给scaler
    this.scaler.options.preserveChildStyles = true;
    this.scaler.setMode(validMode);
    return this;
  }

  /**
   * 获取当前显示模式
   * @returns {string} 当前显示模式
   */
  getMode() {
    return this.scaler.getMode();
  }

  /**
   * 获取当前缩放比例
   * @returns {number} 当前缩放比例
   */
  getScale() {
    return this.scaler.getScale();
  }

  /**
   * 设置设计尺寸
   * @param {number} width - 设计宽度
   * @param {number} height - 设计高度
   * @returns {FitScreenJS} 当前实例，支持链式调用
   */
  setDesignSize(width, height) {
    this.scaler.setDesignSize(width, height);
    return this;
  }

  /**
   * 刷新缩放
   * @returns {FitScreenJS} 当前实例，支持链式调用
   */
  refresh() {
    this.scaler.refresh();
    return this;
  }

  /**
   * 销毁实例，清理事件监听
   */
  destroy() {
    if (this.isInitialized && !this.isDestroyed) {
      window.removeEventListener('resize', this._resizeHandler);
      this.isDestroyed = true;
    }
  }
}

// 导出模式常量
FitScreenJS.MODES = MODES;

export { FitScreenJS, FitScreenJS as default };
