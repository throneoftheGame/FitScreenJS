import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import FitScreenJS from '../src/index'
import { MODES } from '../src/core/modes'
import * as helpers from '../src/utils/helpers'
import * as detector from '../src/core/detector'

// 模拟子模块
vi.mock('../src/core/scaler', () => {
  const mockScaler = vi.fn().mockImplementation(() => ({
    setElements: vi.fn(),
    setDesignSize: vi.fn(),
    setMode: vi.fn().mockReturnThis(),
    getMode: vi.fn().mockReturnValue(MODES.PROPORTIONAL),
    getScale: vi.fn().mockReturnValue(0.5),
    refresh: vi.fn().mockReturnThis(),
  }))

  return {
    Scaler: mockScaler,
  }
})

describe('FitScreenJS', () => {
  let container

  beforeEach(() => {
    // 创建测试DOM
    document.body.innerHTML = `<div id="container"></div>`
    container = document.getElementById('container')

    // 模拟实用函数
    vi.spyOn(helpers, 'getElement').mockImplementation((selector) => {
      if (selector === '#container') return container
      return null
    })

    vi.spyOn(helpers, 'parseAspectRatio').mockImplementation((ratio) => {
      if (ratio === '16:9') return 16 / 9
      return null
    })

    vi.spyOn(helpers, 'debounce').mockImplementation((fn) => fn)

    vi.spyOn(detector, 'determineDesignSize').mockReturnValue({
      width: 1920,
      height: 1080,
    })

    // 模拟addEventListener
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确导出主类和常量', () => {
    expect(FitScreenJS).toBeDefined()
    expect(FitScreenJS.MODES).toBe(MODES)
  })

  it('应该正确初始化实例', () => {
    const screenFitter = new FitScreenJS()

    expect(screenFitter.isInitialized).toBe(false)
    expect(screenFitter.isDestroyed).toBe(false)
    expect(screenFitter.scaler).toBeDefined()
  })

  it('应该规范化字符串宽高比', () => {
    const screenFitter = new FitScreenJS({
      aspectRatio: '16:9',
    })

    expect(helpers.parseAspectRatio).toHaveBeenCalledWith('16:9')
  })

  it('应该正确应用到容器', () => {
    const screenFitter = new FitScreenJS()

    // 模拟querySelector
    document.querySelector = vi.fn().mockReturnValue(null)

    // 模拟createElement
    const mockContentElement = { className: '' }
    document.createElement = vi.fn().mockReturnValue(mockContentElement)

    // 模拟appendChild
    container.appendChild = vi.fn()

    screenFitter.applyTo('#container')

    // 验证流程正确
    expect(helpers.getElement).toHaveBeenCalledWith('#container')
    expect(document.createElement).toHaveBeenCalled()
    expect(container.appendChild).toHaveBeenCalled()
    expect(screenFitter.scaler.setElements).toHaveBeenCalled()
    expect(detector.determineDesignSize).toHaveBeenCalled()
    expect(screenFitter.scaler.setDesignSize).toHaveBeenCalled()
    expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(screenFitter.scaler.refresh).toHaveBeenCalled()
    expect(screenFitter.isInitialized).toBe(true)
  })

  it('应该在容器不存在时报错', () => {
    const screenFitter = new FitScreenJS()

    // 模拟console.error
    console.error = vi.fn()

    // 模拟getElement返回null
    helpers.getElement.mockReturnValueOnce(null)

    screenFitter.applyTo('#non-existent')

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('找不到容器元素'))
  })

  it('应该设置显示模式', () => {
    const screenFitter = new FitScreenJS()

    screenFitter.setMode(MODES.FULLSCREEN)

    expect(screenFitter.scaler.setMode).toHaveBeenCalledWith(MODES.FULLSCREEN)
  })

  it('应该获取当前模式', () => {
    const screenFitter = new FitScreenJS()

    const mode = screenFitter.getMode()

    expect(screenFitter.scaler.getMode).toHaveBeenCalled()
    expect(mode).toBe(MODES.PROPORTIONAL)
  })

  it('应该获取当前缩放比例', () => {
    const screenFitter = new FitScreenJS()

    const scale = screenFitter.getScale()

    expect(screenFitter.scaler.getScale).toHaveBeenCalled()
    expect(scale).toBe(0.5)
  })

  it('应该设置设计尺寸', () => {
    const screenFitter = new FitScreenJS()

    screenFitter.setDesignSize(1920, 1080)

    expect(screenFitter.scaler.setDesignSize).toHaveBeenCalledWith(1920, 1080)
  })

  it('应该刷新缩放', () => {
    const screenFitter = new FitScreenJS()

    screenFitter.refresh()

    expect(screenFitter.scaler.refresh).toHaveBeenCalled()
  })

  it('应该销毁实例并清理事件监听', () => {
    const screenFitter = new FitScreenJS()

    // 模拟初始化状态
    screenFitter.isInitialized = true
    screenFitter._resizeHandler = () => {}

    screenFitter.destroy()

    expect(window.removeEventListener).toHaveBeenCalledWith('resize', screenFitter._resizeHandler)
    expect(screenFitter.isDestroyed).toBe(true)
  })

  it('不应重复销毁已销毁的实例', () => {
    const screenFitter = new FitScreenJS()

    // 模拟已销毁状态
    screenFitter.isInitialized = true
    screenFitter.isDestroyed = true
    screenFitter._resizeHandler = () => {}

    screenFitter.destroy()

    expect(window.removeEventListener).not.toHaveBeenCalled()
  })
})
