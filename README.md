## 零件检测系统前端

本前端项目是基于ruoyi的二次开发，对冗余的功能进行修改，新增了零件相关的缺陷展示页面以及数据统计页面
- 修复冗余功能：通过对 Ruoyi 项目进行修改，移除了冗余的功能，提高了系统的简洁性和性能。
- 缺陷展示页面：新增了零件相关的缺陷展示页面，方便用户查看和管理零件缺陷信息。
- 数据统计页面：新增了数据统计页面，提供了对零件缺陷数据进行分析和可视化展示的功能。

技术栈：
- 前端框架：使用 Vue.js 进行开发。
- UI 组件库：采用 Element UI 提供的组件库，实现快速构建用户界面。
- 数据可视化：使用 ECharts 进行数据统计页面的图表展示。

```bash
# 克隆项目
git clone https://github.com/pengshengde/Part-detection-frontend.git

# 进入项目目录
cd Part-detection-frontend

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npmmirror.com

# 启动服务
npm run dev
```

浏览器访问 http://localhost:80

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```