import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DEFAULT_DESIGN, detectScreenSize, determineDesignSize } from '../../src/core/detector'
import * as helpers from '../../src/utils/helpers'

describe('DEFAULT_DESIGN', () => {
  it('应该定义默认设计尺寸常量', () => {
    expect(DEFAULT_DESIGN.WIDTH).toBe(1920)
    expect(DEFAULT_DESIGN.HEIGHT).toBe(1080)
  })
})

describe('detectScreenSize', () => {
  beforeEach(() => {
    // 模拟窗口尺寸
    global.window = {
      innerWidth: 1024,
      innerHeight: 768,
    }
  })

  it('应该正确检测屏幕尺寸', () => {
    const size = detectScreenSize()
    expect(size.width).toBe(1024)
    expect(size.height).toBe(768)
  })
})

describe('determineDesignSize', () => {
  let container, content

  beforeEach(() => {
    // 设置测试DOM
    document.body.innerHTML = `<div id="container"></div>`
    container = document.getElementById('container')
    content = document.createElement('div')
    content.id = 'content'
    container.appendChild(content)

    // 模拟元素尺寸
    Object.defineProperty(container, 'offsetWidth', { value: 800 })
    Object.defineProperty(container, 'offsetHeight', { value: 600 })

    // 模拟窗口尺寸
    global.window = {
      innerWidth: 1024,
      innerHeight: 768,
    }

    // 模拟 detectElementSize 方法
    vi.spyOn(helpers, 'detectElementSize').mockImplementation((el) => {
      if (el === content) {
        return { width: 1600, height: 900 }
      }
      return { width: 0, height: 0 }
    })
  })

  it('应该使用明确指定的设计尺寸', () => {
    const options = {
      designWidth: 2560,
      designHeight: 1440,
    }

    const size = determineDesignSize(options, container, content)

    expect(size.width).toBe(2560)
    expect(size.height).toBe(1440)
  })

  it('应该基于宽高比计算设计尺寸', () => {
    // 不检查具体数值，只检查计算结果是否合理
    const options = {
      aspectRatio: 16 / 9, // 宽高比16:9
    }

    const size = determineDesignSize(options, container, content)

    // 确保结果有合理的尺寸
    expect(size.width).toBeGreaterThan(0)
    expect(size.height).toBeGreaterThan(0)

    // 宽度应该大于高度
    expect(size.width).toBeGreaterThan(size.height)

    // 宽高比应该接近16:9
    const actualRatio = size.width / size.height
    expect(actualRatio).toBeCloseTo(16 / 9, 1)
  })

  it('应该在自动检测模式下使用内容尺寸', () => {
    const options = {
      autoDetect: true,
    }

    const size = determineDesignSize(options, container, content)

    expect(size.width).toBe(1600)
    expect(size.height).toBe(900)
    expect(helpers.detectElementSize).toHaveBeenCalledWith(content)
  })

  it('应该在没有其他选项时使用容器尺寸', () => {
    const options = {}

    const size = determineDesignSize(options, container, content)

    expect(size.width).toBe(800)
    expect(size.height).toBe(600)
  })

  it('应该在最后回退到默认设计尺寸', () => {
    // 不提供容器，强制回退到默认尺寸
    const options = {}

    const size = determineDesignSize(options, null, null)

    expect(size.width).toBe(DEFAULT_DESIGN.WIDTH)
    expect(size.height).toBe(DEFAULT_DESIGN.HEIGHT)
  })
})
