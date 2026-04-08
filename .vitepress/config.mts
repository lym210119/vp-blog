import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  outDir: './dist',
  title: "65style",
  description: "65style",
  head: [
    [
      'scirpt',
      { 
        async: 'true',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4971335259369317',
        crossorigin: 'anonymous'
      }
    ],
    [
      'script',
      {
        async: 'true',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-PRR29BLJVR',
      },
    ],
    [
      'script', {},
      "window.dataLayer = window.dataLayer || [];\n" +
      "function gtag(){dataLayer.push(arguments);}\n" +
      "gtag('js', new Date());\n" +
      "gtag('config', 'G-PRR29BLJVR');",
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Blog', link: '/posts/wsl2-proxy' },
      { text: 'CSS Tricks', link: '/css/tab-circle-border' },
      { text: 'Aria2', link: 'https://aria2.65style.eu.org' },
      { text: 'OneDrive', link: 'https://oneindex.65style.eu.org' },
      { text: 'TV', link: 'https://tv.65style.eu.org' },
    ],

    // sidebar: [
    //   {
    //     text: 'Blog',
    //     items: [
    //       { text: 'WSL2配置代理', link: '/posts/wsl2-proxy' },
    //       { text: '移动薅羊毛流量领取攻略', link: '/posts/mobile-wan' },
    //     ],
    //   },
    //   {
    //     text: 'CSS Tricks',
    //     items: [
    //       { text: 'Tab Circle Border', link: '/css/tab-circle-border' },
    //     ],
    //   },
    // ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present 65style',
    },
  }
})
