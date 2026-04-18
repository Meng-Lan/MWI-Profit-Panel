# MWI Profit Panel - MilkyWayIdle 收益面板

[![GitHub Actions](https://github.com/Meng-Lan/MWI-Profit-Panel/workflows/Build%20and%20Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/Meng-Lan/MWI-Profit-Panel/actions)
[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-536724-orange)](https://greasyfork.org/zh-CN/scripts/536724-mwi-profit-panel)

> 🎮 **Tampermonkey 用户脚本** | 📊 **实时收益分析** | 🔗 **Mooket 集成**

为 [MilkyWayIdle](https://www.milkywayidle.com/) 游戏打造的收益分析面板插件，在游戏右侧面板展示基于实时市场数据的利润计算，帮助玩家优化生产决策。

## ✨ 核心功能

### 📈 收益面板
- **实时利润计算**：基于当前市场数据，综合社区 buff、稀有/精华产出计算预期收益
- **买卖价差分析**：采用左买右卖策略，展示价格差异（最新价 vs 近24小时均价）
- **利润率提示**：识别低利润率项目，避免亏本生产

### 📝 掉落记录增强
- 详细的掉落数据分析
- 三制造基础产物利润数据
- 加工茶支持（提升采集预期利润）
- 日利润简述汇总

### 🔌 Mooket 集成（可选）
安装 [mooket 插件](https://greasyfork.org/zh-CN/scripts/530316-mooket) 后：
- 点击图标直接跳转至对应制造动作（∞ 次数防止误操作）
- 实时同步市场价格更新
- 置顶价格自动同步到收益面板

## 🚀 安装方式

### 方式一：Greasy Fork（推荐）
1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 访问 [Greasy Fork 页面](https://greasyfork.org/zh-CN/scripts/536724-mwi-profit-panel) 安装脚本
3. 进入游戏即可看到右侧面板

### 方式二：GitHub 自动同步
本仓库使用 GitHub Actions 自动构建并部署到 GitHub Pages，Greasy Fork 会自动同步最新版本。

## 🛠️ 开发指南

```bash
# 安装依赖
npm install

# 开发模式（热更新 + HTTP 服务器）
npm run dev

# 生产构建
npm run build

# 本地预览
npm run preview
```

**技术栈**：
- Rollup + Babel（ES6+ 转译）
- Tampermonkey 用户脚本格式
- 热更新开发环境

## ⚠️ 注意事项

- **冲突提示**：如果之前安装过带此功能的 MWITools，请更新为正式版以避免冲突
- **可选依赖**：安装 [mooket](https://greasyfork.org/zh-CN/scripts/530316-mooket) 插件可获得完整功能体验
- **适配**：已适配手机端

## 📝 更新日志

### 2026.04.18
- 配置 GitHub Actions 自动构建与部署
- 版本号统一采用日期格式

### 06/18
- 适配手机端
- 掉落记录增加日利润简述

### 06/16 大更新
- 详细的掉落记录数据分析
- 增加三制造基础产物利润数据
- 增加加工茶支持
- 完善装备和房子 buff 计算
- 增加利润率显示

---

**反馈与建议**：欢迎通过 Greasy Fork 评论或 GitHub Issues 提交反馈
