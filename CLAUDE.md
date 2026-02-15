# Deutsch Lernen - 德语单词学习 App

## 项目概览
基于艾宾浩斯遗忘曲线的德语单词学习 App，卡片翻转形式，内置 A1-B1 共 600 词。

## 技术栈
- Expo SDK 54 (managed workflow)
- TypeScript
- expo-router (文件路由)
- AsyncStorage (本地持久化)
- expo-speech (TTS 德语发音)
- react-native-web (Web 端支持)

## 项目结构
```
app/              # expo-router 页面
  _layout.tsx     # 根布局 (Stack 导航, 深色主题)
  index.tsx       # 首页 (统计面板)
  learn.tsx       # 学习新词 (每次10词)
  review.tsx      # 复习 (间隔重复)
components/
  FlashCard.tsx   # 翻转卡片组件 (动画 + 发音)
data/
  words.ts        # 600词词库 (A1/A2/B1 各200词)
lib/
  spaced-repetition.ts  # SM-2 算法
  storage.ts            # AsyncStorage 封装
types.ts          # 类型定义
```

## 链接
- **线上地址**: https://entrohub.github.io/deutsch-app/
- **GitHub 仓库**: https://github.com/entrohub/deutsch-app

## 常用命令
```bash
# 本地开发
npx expo start

# 构建并部署到 GitHub Pages
npm run deploy

# 仅构建 Web 版
npm run build:web

# TypeScript 类型检查
npx tsc --noEmit
```

## 部署说明
- 部署目标: GitHub Pages (gh-pages 分支)
- `npm run deploy` = `expo export --platform web && gh-pages -d dist`
- app.json 中配置了 `"baseUrl": "/deutsch-app"` 适配 GitHub Pages 子路径
- dist 目录需包含 `.nojekyll` 文件 (防止 GitHub Pages 忽略 `_expo` 目录)
- 部署时需使用 `--dotfiles` 参数: `npx gh-pages -d dist --dotfiles`
