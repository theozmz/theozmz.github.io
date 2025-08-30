import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  bundler: viteBundler(),
  theme: defaultTheme(),

  lang: 'zh-CN',
  title: '我是不会告诉你们任何事情的啊啊啊啊啊啊啊！',
  description: '喝啊！任何邪恶都将被绳之以法！',
  base: '/',
  pagePatterns: ['**/*.md', '!.vuepress', '!node_modules'],
})