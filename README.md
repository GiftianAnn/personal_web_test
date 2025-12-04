# 个人网站（GiftianAnn）

一个简洁现代的静态网站，用于展示个人信息与项目列表。支持：
- 移动端自适应
- 浅/深色模式
- 从 `projects.json` 加载项目并支持搜索与标签筛选

## 快速开始

1. 将以下文件放入仓库根目录：
   - `index.html`
   - `styles.css`
   - `script.js`
   - `projects.json`
   - `images/avatar.jpg`（可选，替换为你的头像）
2. 修改 `index.html` 中的文案与社交链接。
3. 修改 `projects.json` 为你的真实项目列表。

## 发布到 GitHub Pages

- 在仓库设置中开启 Pages：
  - Settings → Pages → Source 选择 `main` 分支（或 `gh-pages`）根目录。
  - 保存后访问 Pages URL（例如 `https://giftianann.github.io/personal_web_test/`）。

或使用 `gh-pages` 分支：
- 创建 `gh-pages` 分支，推送相同文件。
- 在 Pages 设置选择 `gh-pages` 分支。

## 项目数据格式

`projects.json` 示例：
```json
[
  {
    "name": "项目名称",
    "description": "一句话描述",
    "tags": ["tag1", "tag2"],
    "repo": "https://github.com/owner/repo",
    "demo": "https://demo.example.com"
  }
]
```

## 自定义与扩展

- 样式：编辑 `styles.css` 调整色彩与布局。
- 功能：
  - 在 `script.js` 中扩展筛选逻辑或增加排序。
  - 可加入“按星标数排序”或“只显示有演示链接的项目”等。
- 访问性：为图片添加 `alt`，为交互控件添加 `aria-label`。

## 许可

可自由使用与修改此模板。