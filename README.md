# 2026-27 Term 1 CUHK-Shenzhen Course Planner

面向 CUHK-Shenzhen 2026-27 Term 1 选课规划的交互式课程表工具。当前版本主要围绕 STAT 修读计划、GEA/ENG 通识英文课程，以及若干可能选择的专业选修课程整理。

## Open the Planner

**[Launch the interactive course planner](https://historia-razz.github.io/26Fall-CUSZ-Course-Selection-STA/)**

也可以直接访问：

https://historia-razz.github.io/26Fall-CUSZ-Course-Selection-STA/

## Features

- 按修读计划区域分组展示课程，包括通识/英文、Area 1-4、Complementary Electives 和待确认学分课程。
- 支持展开课程后勾选具体 LEC/TUT session。
- 根据当前勾选内容实时生成周一至周五课程表。
- 自动标记时间冲突，方便从多到少筛选可行组合。
- 对 GEA2000、ENG2001 等 session 较多的课程使用独立颜色，便于快速识别。

## Data Status

课程数据整理自 CUHK-Shenzhen SIS Class Search 及相关课程文件。当前数据仍可能随正式选课阶段更新，尤其是：

- instructor 从 `Staff` 更新为具体教师；
- LEC 与 TUT 的绑定关系进一步明确；
- section 时间、教室或容量发生变化；
- 新增或取消开放 section。

## 文件说明

- `index.html`：页面入口。
- `style.css`：页面样式。
- `app.js`：勾选、课程表渲染与冲突检测逻辑。
- `courses.json`：课程数据源。

## 后续维护方式

后续如果老师、LEC/TUT 对应关系、section 时间或教室发生变化，优先更新 `courses.json`。网页会自动读取最新数据，不需要改动页面结构或交互逻辑。

本项目仅用于选课规划参考，最终信息以学校 SIS 和官方通知为准。
