# 2026-27 Term 1 交互选课表公开上线版

这是从原始 `26Fall_schedule.html` 拆出的静态网站版本。原始文件保持不变。

## 文件说明

- `index.html`: 页面结构。
- `style.css`: 页面样式。
- `app.js`: 勾选、渲染课程表、冲突检测等交互逻辑。
- `courses.json`: 课程数据。后续老师、LEC/TUT 对应关系、section 时间变动，优先改这个文件。

## GitHub Pages 上线方式

1. 在 GitHub 创建一个公开仓库，例如 `cuhksz-course-planner`。
2. 上传本文件夹内全部文件到仓库根目录。
3. 进入仓库 Settings -> Pages。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main` 和 `/root`，保存。
6. 等待 GitHub 生成访问链接。

## 本地预览

由于浏览器直接打开 `index.html` 时可能限制读取 `courses.json`，本地预览建议用本地服务器打开。上线到 GitHub Pages 后不会有这个问题。
