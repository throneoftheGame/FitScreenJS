import { describe, it, expect, beforeEach } from 'vitest'
import {
  MODES,
  validateMode,
  applyProportionalMode,
  applyFullscreenMode,
} from '../../src/core/modes'

describe('MODES', () => {
  it('应该定义正确的模式常量', () => {
    expect(MODES.PROPORTIONAL).toBe('proportional')
    expect(MODES.FULLSCREEN).toBe('fullscreen')
  })
})

describe('validateMode', () => {
  it('应该验证有效的模式字符串', () => {
    expect(validateMode('proportional')).toBe('proportional')
    expect(validateMode('fullscreen')).toBe('fullscreen')
    // 测试大小写不敏感
    expect(validateMode('Proportional')).toBe('proportional')
    expect(validateMode('FULLSCREEN')).toBe('fullscreen')
  })

  it('对于无效模式应该返回默认模式', () => {
    expect(validateMode('invalid-mode')).toBe(MODES.PROPORTIONAL)
    expect(validateMode('')).toBe(MODES.PROPORTIONAL)
    expect(validateMode(null)).toBe(MODES.PROPORTIONAL)
    expect(validateMode(undefined)).toBe(MODES.PROPORTIONAL)
    expect(validateMode(123)).toBe(MODES.PROPORTIONAL)
  })
})

describe('applyProportionalMode', () => {
  let container, content

  beforeEach(() => {
    // 设置测试DOM
    document.body.innerHTML = `
      <div id="container"></div>
    `
    container = document.getElementById('container')
    content = document.createElement('div')
    content.id = 'content'
    container.appendChild(content)

    // 模拟元素尺寸
    Object.defineProperty(container, 'offsetWidth', { value: 800 })
    Object.defineProperty(container, 'offsetHeight', { value: 600 })
    Object.defineProperty(content, 'offsetWidth', { value: 1600 })
    Object.defineProperty(content, 'offsetHeight', { value: 900 })
  })

  it('应该正确应用等比缩放模式样式', () => {
    const scale = 0.5
    applyProportionalMode(container, content, scale, {})

    // 检查容器样式
    expect(container.style.position).toBe('relative')
    expect(container.style.overflow).toBe('hidden')

    // 检查内容样式
    expect(content.style.position).toBe('absolute')
    expect(content.style.transform).toBe(`scale(${scale})`)
    expect(content.style.transformOrigin).toBe('top left')

    // 默认应该居中
    expect(content.style.left).toBeTruthy()
    expect(content.style.top).toBeTruthy()
  })

  it('应该应用背景色', () => {
    const backgroundColor = '#000000'
    applyProportionalMode(container, content, 0.5, { backgroundColor })

    // jsdom将颜色转换为rgb格式，所以检查是否包含颜色值部分
    expect(container.style.backgroundColor).toContain('0, 0, 0')
  })

  it('应该在不需要缩放内容时不修改内容样式', () => {
    applyProportionalMode(container, content, 0.5, { scaleContent: false })

    // 内容样式不应被修改
    expect(content.style.transform).toBe('')
  })
})

describe('applyFullscreenMode', () => {
  let container, content

  beforeEach(() => {
    // 设置测试DOM
    document.body.innerHTML = `
      <div id="container"></div>
    `
    container = document.getElementById('container')
    content = document.createElement('div')
    content.id = 'content'
    container.appendChild(content)
  })

  it('应该正确应用全屏填充模式样式', () => {
    const scale = 0.7
    applyFullscreenMode(container, content, scale, {})

    // 检查容器样式
    expect(container.style.position).toBe('relative')
    expect(container.style.overflow).toBe('hidden')

    // 检查内容样式
    expect(content.style.position).toBe('absolute')
    expect(content.style.transform).toBe(`translate(-50%, -50%) scale(${scale})`)
    expect(content.style.transformOrigin).toBe('center center')
    expect(content.style.left).toBe('50%')
    expect(content.style.top).toBe('50%')
  })

  it('应该应用背景色', () => {
    const backgroundColor = '#000000'
    applyFullscreenMode(container, content, 0.7, { backgroundColor })

    // jsdom将颜色转换为rgb格式，所以检查是否包含颜色值部分
    expect(container.style.backgroundColor).toContain('0, 0, 0')
  })
})
