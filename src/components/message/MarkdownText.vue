<template>
  <div class="markdown-text" v-html="renderedContent" @click="handleClick"></div>
</template>

<script>
import { marked } from 'marked'

// 全局只初始化一次 marked 配置
marked.setOptions({
  gfm: true,    // GitHub Flavored Markdown：支持表格、删除线等
  breaks: true, // 单个换行符转为 <br>，适合聊天场景
})

export default {
  name: 'MarkdownText',
  props: {
    // 消息文本内容
    content: {
      type: String,
      default: ''
    },
    // 是否正在流式输出（显示光标）
    streaming: {
      type: Boolean,
      default: false
    },
    // emoji 表情配置列表（来自 vuex store 的 emojis）
    emojis: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    renderedContent () {
      const text = this.content || ''
      if (!text && !this.streaming) return ''

      // 1. 通过 marked 解析 Markdown，普通文本也能正常渲染
      let html = marked.parse(text)

      // 2. Emoji 表情替换（在 HTML 输出上后处理，不干扰 Markdown 解析）
      if (text.includes('/:')) {
        for (const emoji of this.emojis) {
          html = html.replace(
            emoji.reg,
            `<img src="static/emoji/${emoji.file}" alt="${emoji.title}" style="vertical-align:middle;width:24px;height:24px">`
          )
        }
      }

      // 3. 流式光标：插到最后一个关闭标签的前面
      if (this.streaming) {
        const cursor = '<span class="md-streaming-cursor">|</span>'
        const lastClose = html.lastIndexOf('</')
        if (lastClose !== -1) {
          html = html.slice(0, lastClose) + cursor + html.slice(lastClose)
        } else {
          html += cursor
        }
      }

      return html
    }
  },
  methods: {
    // 链接在新标签页打开
    handleClick (e) {
      if (e.target.tagName === 'A') {
        e.preventDefault()
        window.open(e.target.href, '_blank')
      }
    }
  }
}
</script>

<style lang="stylus">
/* vue-loader v11 不支持 Stylus 中的 >>> 深度选择器，改用 .markdown-text 前缀显式限定 */
.markdown-text
  white-space: normal
  word-break: break-word
  line-height: 1.5
  font-size: 14px

  p
    margin: 0
    padding: 0

  p + p
    margin-top: 6px

  h1, h2, h3, h4, h5, h6
    font-weight: bold
    margin: 6px 0 2px

  h1
    font-size: 1.15em

  h2
    font-size: 1.08em

  h3, h4, h5, h6
    font-size: 1em

  code
    font-family: Consolas, Monaco, monospace
    background: rgba(0, 0, 0, 0.08)
    padding: 1px 4px
    border-radius: 3px
    font-size: 0.88em

  pre
    background: rgba(0, 0, 0, 0.07)
    padding: 10px 12px
    border-radius: 4px
    overflow-x: auto
    margin: 4px 0

  pre code
    background: none
    padding: 0
    font-size: 0.85em
    line-height: 1.4

  ul, ol
    margin: 2px 0
    padding-left: 18px

  li
    margin: 1px 0

  blockquote
    margin: 4px 0 4px 4px
    padding: 2px 10px
    border-left: 3px solid rgba(0, 0, 0, 0.2)
    color: rgba(0, 0, 0, 0.6)

  a
    color: #576b95
    text-decoration: none
    &:hover
      text-decoration: underline

  table
    border-collapse: collapse
    margin: 4px 0
    font-size: 0.9em
    width: auto

  th, td
    border: 1px solid rgba(0, 0, 0, 0.2)
    padding: 3px 8px

  th
    background: rgba(0, 0, 0, 0.08)

  tbody tr:nth-child(even)
    background: rgba(0, 0, 0, 0.04)

  tbody tr:nth-child(odd)
    background: transparent

</style>

<style>
/* 光标动画必须是全局样式，scoped + v-html 无法正确应用 keyframes */
.md-streaming-cursor {
  display: inline-block;
  margin-left: 1px;
  animation: md-cursor-blink 0.8s step-start infinite;
}
@keyframes md-cursor-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
</style>
