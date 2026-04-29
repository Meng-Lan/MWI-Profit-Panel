# Greasy Fork 附加信息 - 中文

## 📖 简介

MWI Profit Panel 是一款专为 [MilkyWayIdle](https://www.milkywayidle.com/) 打造的收益分析插件，在游戏右侧面板提供基于实时市场数据的利润计算，帮助玩家优化生产决策、最大化收益。

---

## 🎯 核心功能详解

### 1. 收益面板
安装后，游戏右侧会出现收益分析面板，展示各制造/采集动作的预期利润。

**数据解读：**
- **收益数值**：综合考虑社区 buff、稀有产出、精华产出后的预期利润
- **价格差异**：括号内显示 `(最新价 vs 24h均价)`，帮助识别价格波动
- **利润率**：显示利润百分比，低于阈值的标红提示，避免亏本生产
- **实时更新**：配合 mooket 插件，市场价格变动自动同步

### 2. 掉落记录增强
原版掉落记录仅有基础信息，本插件提供详细分析：

- **时间戳**：精确到秒的掉落时间
- **稀有/精华详情**：单独统计稀有物品和精华产出
- **利润汇总**：按日统计总收益，便于追踪
- **加工茶支持**：三采集+加工茶的完整利润链条计算

### 3. Mooket 集成（强烈推荐）

安装 [mooket](https://greasyfork.org/zh-CN/scripts/530316-mooket) 后，实现深度集成：

| 功能 | 操作方式 |
|------|----------|
| 跳转制造 | 点击收益面板中的物品图标，直接打开对应动作的制造弹窗（预设 ∞ 次数，防止误操作 1 次） |
| 实时价格 | Mooket 置顶的市场价格实时同步到收益面板 |
| 一键刷新 | 在 Mooket 更新价格后，收益面板自动重新计算 |

---

## 📱 安装步骤

### 前置要求
1. 安装浏览器扩展：
   - **Chrome/Edge**：[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - **Firefox**：[Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - **Safari**：Tampermonkey（App Store 购买）

2. （可选但推荐）安装 [mooket](https://greasyfork.org/zh-CN/scripts/530316-mooket) 插件

### 安装本脚本
点击本页"安装此脚本"按钮，Tampermonkey 会弹出确认对话框，点击"安装"即可。

### 验证安装
进入 [MilkyWayIdle](https://www.milkywayidle.com/)，登录游戏后，观察右侧是否出现收益面板。

---

## ⚙️ 配置说明

本插件开箱即用，无需额外配置。

**自动检测：**
- 自动读取游戏内社区 buff
- 自动读取装备/房子加成
- 自动读取背包中的稀有/精华掉落记录

**与其他插件兼容：**
- ✅ MWITools（请更新到正式版）
- ✅ mooket（推荐搭配）
- ❌ 旧版带收益功能的 MWITools（需卸载避免冲突）

---

## 🐛 常见问题

**Q: 面板不显示怎么办？**  
A: 请确认：1) Tampermonkey 已启用；2) 脚本已安装且开启；3) 已登录游戏。

**Q: 价格数据不更新？**  
A: 本插件依赖 mooket 提供实时价格，请确保 mooket 已安装并正确配置 API。

**Q: 手机能用吗？**  
A: 已适配手机端，使用 Kiwi Browser 或 Firefox 手机版 + Tampermonkey。

**Q: 数据来源？**  
A: 市场价格来自游戏内交易数据，buff 数据来自游戏本地计算。

---

## 🔄 更新日志

### 2026.04.23
- 修复动作时间下限问题：游戏机制中动作时间最低为3秒，插件计算现在与此保持一致

### 2026.04.18
- 配置 GitHub Actions 自动构建
- 添加英文版说明
- 优化移动端适配

### 2025.06.18
- 适配手机端
- 掉落记录增加日利润简述

### 2025.06.16
- 增加三制造基础产物利润数据
- 增加加工茶支持
- 完善装备/房子 buff 计算
- 增加利润率显示

---

## 💬 反馈与支持

- **Greasy Fork**：在本页评论区留言
- **GitHub Issues**：[提交 Issue](https://github.com/Meng-Lan/MWI-Profit-Panel/issues)
- **游戏内**：通过社区频道反馈

---

## 📄 开源协议

本项目基于 [MIT License](https://github.com/Meng-Lan/MWI-Profit-Panel/blob/main/LICENSE) 开源，欢迎 Fork 和贡献代码。
