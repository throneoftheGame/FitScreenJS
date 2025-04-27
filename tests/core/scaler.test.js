import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Scaler } from '../../src/core/scaler'
import { MODES } from '../../src/core/modes'
import * as helpers from '../../src/utils/helpers'
import * as modes from '../../src/core/modes'

describe('Scaler', () => {
  let scaler, container, content, options

  beforeEach(() => {
    // 创建测试DOM
    document.body.innerHTML = `<div id="container"></div>`
    container = document.getElementById('container')
    content = document.createElement('div')
    content.id = 'content'
    container.appendChild(content)

    // 模拟元素尺寸
    Object.defineProperty(container, 'offsetWidth', { value: 800 })
    Object.defineProperty(container, 'offsetHeight', { value: 600 })

    // 模拟回调函数
    options = {
      onResize: vi.fn(),
      onModeChange: vi.fn(),
    }

    // 创建Scaler实例
    scaler = new Scaler(options)

    // 模拟计算缩放比例函数
    vi.spyOn(helpers, 'calculateScale').mockImplementation((contW, contH, dW, dH, cover) => {
      // 简化模拟，proportional返回0.5，fullscreen返回1.5
      return cover ? 1.5 : 0.5
    })

    // 模拟应用样式函数
    vi.spyOn(modes, 'applyProportionalMode').mockImplementation(() => {})
    vi.spyOn(modes, 'applyFullscreenMode').mockImplementation(() => {})
  })

  it('应该正确初始化默认值', () => {
    expect(scaler.options).toBe(options)
    expect(scaler.container).toBeNull()
    expect(scaler.content).toBeNull()
    expect(scaler.designSize).toEqual({ width: 0, height: 0 })
    expect(scaler.currentScale).toBe(1)
    expect(scaler.currentMode).toBe(MODES.PROPORTIONAL)
    expect(scaler.isInitialized).toBe(false)
  })

  it('应该正确设置元素', () => {
    scaler.setElements(container, content)

    expect(scaler.container).toBe(container)
    expect(scaler.content).toBe(content)
  })

  it('应该正确设置设计尺寸', () => {
    const width = 1920
    const height = 1080

    // 模拟refresh方法
    const refreshSpy = vi.spyOn(scaler, 'refresh').mockImplementation(() => {})

    scaler.setDesignSize(width, height)

    expect(scaler.designSize).toEqual({ width, height })
    expect(refreshSpy).toHaveBeenCalled()
  })

  it('不应设置无效的设计尺寸', () => {
    const refreshSpy = vi.spyOn(scaler, 'refresh').mockImplementation(() => {})

    scaler.setDesignSize(0, 0)

    expect(scaler.designSize).toEqual({ width: 0, height: 0 })
    expect(refreshSpy).not.toHaveBeenCalled()
  })

  it('应该正确设置显示模式', () => {
    scaler.setElements(container, content)
    scaler.setDesignSize(1920, 1080)
    scaler.isInitialized = true

    const refreshSpy = vi.spyOn(scaler, 'refresh').mockImplementation(() => {})

    // 切换到全屏模式
    scaler.setMode(MODES.FULLSCREEN)

    expect(scaler.currentMode).toBe(MODES.FULLSCREEN)
    expect(refreshSpy).toHaveBeenCalled()
    expect(options.onModeChange).toHaveBeenCalledWith(MODES.FULLSCREEN)

    // 再次设置相同模式不应触发回调
    refreshSpy.mockClear()
    options.onModeChange.mockClear()

    scaler.setMode(MODES.FULLSCREEN)

    expect(refreshSpy).not.toHaveBeenCalled()
    expect(options.onModeChange).not.toHaveBeenCalled()
  })

  it('应该获取当前模式', () => {
    scaler.currentMode = MODES.FULLSCREEN

    expect(scaler.getMode()).toBe(MODES.FULLSCREEN)
  })

  it('应该获取当前缩放比例', () => {
    scaler.currentScale = 0.75

    expect(scaler.getScale()).toBe(0.75)
  })

  it('应该计算当前缩放比例', () => {
    scaler.setElements(container, content)
    scaler.setDesignSize(1920, 1080)

    // 等比缩放模式
    scaler.currentMode = MODES.PROPORTIONAL
    expect(scaler.calculateCurrentScale()).toBe(0.5)

    // 全屏填充模式
    scaler.currentMode = MODES.FULLSCREEN
    expect(scaler.calculateCurrentScale()).toBe(1.5)

    // 在容器或设计尺寸无效时应返回1
    scaler.container = null
    expect(scaler.calculateCurrentScale()).toBe(1)
  })

  it('应该应用等比缩放样式', () => {
    scaler.setElements(container, content)
    scaler.setDesignSize(1920, 1080)
    scaler.currentMode = MODES.PROPORTIONAL

    scaler.applyScaling()

    expect(scaler.currentScale).toBe(0.5)
    expect(modes.applyProportionalMode).toHaveBeenCalledWith(container, content, 0.5, options)
    expect(options.onResize).toHaveBeenCalledWith(800, 600, 0.5)
  })

  it('应该应用全屏填充样式', () => {
    scaler.setElements(container, content)
    scaler.setDesignSize(1920, 1080)
    scaler.currentMode = MODES.FULLSCREEN

    scaler.applyScaling()

    expect(scaler.currentScale).toBe(1.5)
    expect(modes.applyFullscreenMode).toHaveBeenCalledWith(container, content, 1.5, options)
    expect(options.onResize).toHaveBeenCalledWith(800, 600, 1.5)
  })

  it('应该在没有元素时不应用样式', () => {
    scaler.applyScaling()

    expect(modes.applyProportionalMode).not.toHaveBeenCalled()
    expect(modes.applyFullscreenMode).not.toHaveBeenCalled()
    expect(options.onResize).not.toHaveBeenCalled()
  })

  it('应该刷新缩放', () => {
    scaler.setElements(container, content)

    const applyScalingSpy = vi.spyOn(scaler, 'applyScaling').mockImplementation(() => {})

    scaler.refresh()

    expect(applyScalingSpy).toHaveBeenCalled()
    expect(scaler.isInitialized).toBe(true)
  })
})
