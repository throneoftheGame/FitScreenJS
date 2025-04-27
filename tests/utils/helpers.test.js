import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseAspectRatio,
  getElement,
  calculateScale,
  debounce,
  detectElementSize,
} from '../../src/utils/helpers'

describe('parseAspectRatio', () => {
  it('应该正确解析有效的宽高比字符串', () => {
    expect(parseAspectRatio('16:9')).toBeCloseTo(16 / 9)
    expect(parseAspectRatio('4:3')).toBeCloseTo(4 / 3)
    expect(parseAspectRatio('1:1')).toBe(1)
  })

  it('应该在输入无效时返回null', () => {
    expect(parseAspectRatio('')).toBeNull()
    expect(parseAspectRatio(null)).toBeNull()
    expect(parseAspectRatio(undefined)).toBeNull()
    expect(parseAspectRatio('16/9')).toBeNull() // 错误格式
    expect(parseAspectRatio('abc')).toBeNull()
    expect(parseAspectRatio('16:0')).toBeNull() // 分母为0
  })
})

describe('getElement', () => {
  beforeEach(() => {
    // 创建测试DOM
    document.body.innerHTML = `
      <div id="test-div"></div>
    `
  })

  it('应该通过选择器获取元素', () => {
    const element = getElement('#test-div')
    expect(element).toBeTruthy()
    expect(element.id).toBe('test-div')
  })

  it('应该直接返回传入的DOM元素', () => {
    const originalElement = document.querySelector('#test-div')
    const element = getElement(originalElement)
    expect(element).toBe(originalElement)
  })

  it('应该在未找到元素时返回null', () => {
    expect(getElement('#non-existent')).toBeNull()
    expect(getElement(null)).toBeNull()
    expect(getElement(undefined)).toBeNull()
    expect(getElement({})).toBeNull() // 非DOM元素
  })
})

describe('calculateScale', () => {
  it('应该在等比缩放模式下计算正确的缩放比例', () => {
    // 容器尺寸：800x600，内容尺寸：1600x900
    // 等比缩放应该取最小比例 800/1600 = 0.5
    expect(calculateScale(800, 600, 1600, 900, false)).toBe(0.5)

    // 容器尺寸：800x600，内容尺寸：1000x500
    // 等比缩放应该取最小比例 600/500 = 1.2
    expect(calculateScale(800, 600, 1000, 500, false)).toBe(0.8)
  })

  it('应该在全屏填充模式下计算正确的缩放比例', () => {
    // 容器尺寸：800x600，内容尺寸：1600x900
    // 全屏填充应该取最大比例 600/900 = 0.67
    expect(calculateScale(800, 600, 1600, 900, true)).toBeCloseTo(0.67, 2)

    // 容器尺寸：800x600，内容尺寸：1000x500
    // 全屏填充应该取最大比例 800/1000 = 0.8
    expect(calculateScale(800, 600, 1000, 500, true)).toBe(1.2)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该在指定等待时间后仅执行一次函数', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    expect(mockFn).not.toBeCalled()

    debouncedFn()
    debouncedFn()
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(50)
    expect(mockFn).not.toBeCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toBeCalledTimes(1)
  })
})

describe('detectElementSize', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container" style="width: 500px; height: 300px;">
        <div id="test-child" style="width: 200px; height: 100px;"></div>
      </div>
    `

    // 模拟 getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn().mockImplementation(function () {
      if (this.id === 'test-container') {
        return { left: 0, top: 0, right: 500, bottom: 300 }
      } else if (this.id === 'test-child') {
        return { left: 0, top: 0, right: 200, bottom: 100 }
      }
      return { left: 0, top: 0, right: 0, bottom: 0 }
    })
  })

  it('应该正确检测元素尺寸', () => {
    const element = document.getElementById('test-container')
    const size = detectElementSize(element)

    expect(size.width).toBe(500)
    expect(size.height).toBe(300)
  })

  it('应该在元素不存在时返回零尺寸', () => {
    const size = detectElementSize(null)

    expect(size.width).toBe(0)
    expect(size.height).toBe(0)
  })
})
