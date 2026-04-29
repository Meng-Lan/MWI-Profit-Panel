# Greasy Fork Additional Info - English

## 📖 Introduction

MWI Profit Panel is a profit analysis plugin designed for [MilkyWayIdle](https://www.milkywayidle.com/), providing real-time market-based profit calculations in a side panel to help players optimize production decisions and maximize earnings.

---

## 🎯 Core Features

### 1. Profit Panel
After installation, a profit analysis panel appears on the right side of the game interface, showing expected profits for each manufacturing/collecting action.

**Data Explained:**
- **Profit Value**: Expected profit considering community buffs, rare drops, and essence drops
- **Price Variance**: Format `(latest vs 24h avg)` to identify price fluctuations
- **Profit Margin**: Percentage display; red warnings for low margins to avoid losses
- **Real-time Updates**: Auto-sync with mooket plugin when market prices change

### 2. Enhanced Drop Records
Enhanced version of the native drop log with detailed analysis:

- **Timestamps**: Precise drop times to the second
- **Rare/Essence Details**: Separate statistics for rare items and essence drops
- **Daily Summary**: Total earnings tracked by day
- **Tea Processing Support**: Complete profit chain for 3-collect + tea processing

### 3. Mooket Integration (Highly Recommended)

With [mooket](https://greasyfork.org/zh-CN/scripts/530316-mooket) installed, enjoy deep integration:

| Feature | How to Use |
|---------|------------|
| Jump to Action | Click item icons in profit panel to open corresponding action dialog (preset ∞ count to prevent accidental 1x crafting) |
| Live Prices | Mooket's pinned market prices sync to profit panel in real-time |
| Auto Refresh | Panel recalculates automatically when Mooket updates prices |

---

## 📱 Installation

### Prerequisites
1. Install browser extension:
   - **Chrome/Edge**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - **Firefox**: [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - **Safari**: Tampermonkey (purchase on App Store)

2. (Optional but recommended) Install [mooket](https://greasyfork.org/zh-CN/scripts/530316-mooket) plugin

### Install This Script
Click the "Install this script" button on this page. Tampermonkey will show a confirmation dialog; click "Install".

### Verify Installation
Navigate to [MilkyWayIdle](https://www.milkywayidle.com/), log in, and check if the profit panel appears on the right side.

---

## ⚙️ Configuration

Works out of the box with no additional configuration needed.

**Auto-Detection:**
- Automatically reads in-game community buffs
- Automatically reads equipment/house bonuses
- Automatically reads rare/essence drops from inventory

**Compatibility:**
- ✅ MWITools (update to official version)
- ✅ mooket (recommended pairing)
- ❌ Old MWITools with profit features (uninstall to avoid conflicts)

---

## 🐛 FAQ

**Q: Panel not showing?**  
A: Please check: 1) Tampermonkey is enabled; 2) Script is installed and active; 3) You are logged into the game.

**Q: Price data not updating?**  
A: This plugin relies on mooket for real-time prices. Ensure mooket is installed and API is configured correctly.

**Q: Mobile support?**  
A: Mobile-adapted. Use Kiwi Browser or Firefox Mobile + Tampermonkey.

**Q: Data source?**  
A: Market prices from in-game trade data, buff data from local game calculations.

---

## 🔄 Changelog

### 2026.04.23
- Fixed minimum action time issue: game mechanics enforce a 3-second minimum action time, now reflected in profit calculations

### 2026.04.18
- Configured GitHub Actions for auto-building
- Added English documentation
- Optimized mobile adaptation

### 2025.06.18
- Mobile adaptation
- Added daily profit summary to drop records

### 2025.06.16
- Added base product profit data for 3 manufacturing types
- Added tea processing support
- Improved equipment/house buff calculations
- Added profit margin display

---

## 💬 Feedback & Support

- **Greasy Fork**: Leave a comment on this page
- **GitHub Issues**: [Submit Issue](https://github.com/Meng-Lan/MWI-Profit-Panel/issues)
- **In-game**: Via community channels

---

## 📄 License

This project is open-sourced under the [MIT License](https://github.com/Meng-Lan/MWI-Profit-Panel/blob/main/LICENSE). Contributions welcome!
