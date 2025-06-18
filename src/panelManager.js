import globals from './globals.js';
import { GenerateDom } from './domGenerator.js';
import { createTooltip } from './tooltipManager.js';
import { formatDuration, getMwiObj, getDuration, mooketStatus } from './utils.js';

export async function waitForRightPannel() {
    if (!globals.freshnessMarketJson?.market) {
        setTimeout(waitForRightPannel, 1000);
        return;
    }

    // 原始右侧面板处理逻辑
    const targetNodes = document.querySelectorAll("div.CharacterManagement_tabsComponentContainer__3oI5G");
    targetNodes.forEach(container => {
        if (container.dataset.processed) return;

        // 添加收益标签按钮
        const tabsContainer = container.querySelector('div.MuiTabs-flexContainer');
        const newTabButton = document.createElement('button');
        newTabButton.className = 'MuiButtonBase-root MuiTab-root MuiTab-textColorPrimary css-1q2h7u5';
        newTabButton.innerHTML = `<span class="MuiBadge-root TabsComponent_badge__1Du26 css-1rzb3uu">收益<span class="MuiBadge-badge MuiBadge-standard MuiBadge-invisible MuiBadge-anchorOriginTopRight MuiBadge-anchorOriginTopRightRectangular MuiBadge-overlapRectangular MuiBadge-colorWarning css-dpce5z"></span></span><span class="MuiTouchRipple-root css-w0pj6f"></span>`;
        newTabButton.classList.add('income-tab');
        tabsContainer.appendChild(newTabButton);

        // 创建收益面板
        const tabPanelsContainer = container.querySelector('div.TabsComponent_tabPanelsContainer__26mzo');
        const newPanel = document.createElement('div');
        newPanel.className = 'TabPanel_tabPanel__tXMJF TabPanel_hidden__26UM3 income-panel';
        newPanel.innerHTML = `
            <div class="Inventory_inventory__17CH2 profit-pannel">
                <h3>生产收益详情</h3>
                <span style="color: green; font-size: 0.8em; margin-left: 10px;">数据更新于: ${formatDuration(Date.now() - globals.freshnessMarketJson.time * 1000)}</span>
                <div class="Inventory_items__6SXv0 script_buildScore_added script_invSort_added">
                ${GenerateDom(globals.freshnessMarketJson)}
                </div>
            </div>
        `;
        tabPanelsContainer.appendChild(newPanel);
        container.dataset.processed = "true";

        setupTabSwitching(newTabButton, newPanel, tabPanelsContainer, container);
        createTooltip();
        setupClickActions();

        // Testing only
        setInterval(() => refreshProfitPanel(), 1000);
    });

    // 新增左侧面板处理逻辑
    const leftPanel = document.querySelector("div.GamePage_middlePanel__ubts7");
    if (leftPanel && !leftPanel.dataset.profitProcessed) {
        const profitContainer = document.createElement('div');
        profitContainer.className = 'profit-container';
        profitContainer.innerHTML = `
            <div class="Inventory_inventory__17CH2 profit-pannel">
                <h3>生产收益详情</h3>
                <span style="color: green; font-size: 0.8em; margin-left: 10px;">数据更新于: ${formatDuration(Date.now() - globals.freshnessMarketJson.time * 1000)}</span>
                <div class="Inventory_items__6SXv0 script_buildScore_added script_invSort_added">
                ${GenerateDom(globals.freshnessMarketJson)}
                </div>
            </div>
        `;
        leftPanel.appendChild(profitContainer);
        leftPanel.dataset.profitProcessed = "true";
        
        setupTabSwitching(newTabButton, newPanel, tabPanelsContainer, container);
        createTooltip();
        setupClickActions();

        // Testing only
        setInterval(() => refreshProfitPanel(), 1000);
    }

    // 检查是否所有面板都已处理
    const rightPanelMissing = document.querySelectorAll(".income-panel").length === 0;
    const leftPanelMissing = document.querySelectorAll(".profit-container").length === 0;
    if (rightPanelMissing || leftPanelMissing) {
        setTimeout(waitForRightPannel, 1000);
    }

    // Testing only
    if (!this._intervalSet) {
        setInterval(() => refreshProfitPanel(), 1000);
        this._intervalSet = true;
    }
}

// 保持原始函数不变
function setupTabSwitching(newTabButton, newPanel, tabPanelsContainer, container) {
    newTabButton.addEventListener('click', () => {
        container.querySelectorAll('.MuiTab-root').forEach(btn => btn.classList.remove('Mui-selected'));
        newTabButton.classList.add('Mui-selected');
        tabPanelsContainer.querySelectorAll('.TabPanel_tabPanel__tXMJF').forEach(panel => {
            panel.classList.add('TabPanel_hidden__26UM3');
        });
        newPanel.classList.remove('TabPanel_hidden__26UM3');
    });

    container.querySelectorAll('.MuiTab-root:not(:last-child)').forEach(btn => {
        btn.addEventListener('click', () => {
            newPanel.classList.add('TabPanel_hidden__26UM3');
            newTabButton.classList.remove('Mui-selected');

            // 添加选中状态并显示原标签面板
            btn.classList.add('Mui-selected');
            const tabIndex = Array.from(container.querySelectorAll('.MuiTab-root:not(:last-child)')).indexOf(btn);
            tabPanelsContainer.querySelectorAll('.TabPanel_tabPanel__tXMJF:not(.income-panel)').forEach((panel, index) => {
                panel.classList.toggle('TabPanel_hidden__26UM3', index !== tabIndex);
            });
        });
    });
}

// 保持原始函数不变
function setupClickActions() {
    document.addEventListener('click', (e) => {
        const itemContainer = e.target.closest('.Item_item__2De2O');
        if (!itemContainer) return;

        const tooltipData = itemContainer.dataset.tooltip;
        if (!tooltipData) return;

        try {
            const data = JSON.parse(tooltipData);
            if (data?.actionHrid && getMwiObj()?.game?.handleGoToAction) {
                getMwiObj().game.handleGoToAction(data.actionHrid);
            }
        } catch (e) {
            console.error('Click action error:', e);
        }
    });
}

// 修改刷新函数以支持左右面板
let profitRefreshTime = new Date();
export function refreshProfitPanel(force = false) {
    if (!globals.freshnessMarketJson?.market) return;

    // 刷新右侧面板
    const inventoryPanels = document.querySelectorAll('.Inventory_inventory__17CH2.profit-pannel');
    inventoryPanels.forEach(panel => {
        const timeSpan = panel.querySelector('span');
        if (timeSpan) {
            timeSpan.textContent = `数据更新于：${getDuration(new Date(globals.freshnessMarketJson.time * 1000))}，收益刷新于：${getDuration(profitRefreshTime)}，mooket${mooketStatus()}，${getMwiObj()?.coreMarket ? "支持" : "不支持"}实时价格`;
        }

        if (force || globals.hasMarketItemUpdate) {
            const itemsContainer = panel.querySelector('.Inventory_items__6SXv0');
            if (itemsContainer) {
                itemsContainer.innerHTML = GenerateDom(globals.freshnessMarketJson);
            }
        }
    });

    // 刷新左侧面板
    const leftPanels = document.querySelectorAll('.profit-container .profit-items');
    leftPanels.forEach(panel => {
        if (force || globals.hasMarketItemUpdate) {
            panel.innerHTML = GenerateDom(globals.freshnessMarketJson);
            profitRefreshTime = new Date();
            globals.hasMarketItemUpdate = false;
        }
    });

    if (force || globals.hasMarketItemUpdate) {
        profitRefreshTime = new Date();
        globals.hasMarketItemUpdate = false;
    }
}
