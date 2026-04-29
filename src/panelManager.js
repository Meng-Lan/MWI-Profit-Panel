import globals from './globals.js';
import { GenerateDom } from './domGenerator.js';
import { createTooltip } from './tooltipManager.js';
import { formatDuration, getMwiObj, t } from './utils.js';

let initialized = false;

// 获取当前交易模式的标识
function getCurrentTradingMode() {
    const settings = globals.profitSettings;
    return `${settings.materialPriceMode}-${settings.productPriceMode}`;
}

// 设置交易模式
function setTradingMode(materialMode, productMode) {
    const settings = globals.profitSettings;
    globals.profitSettings = {
        ...settings,
        materialPriceMode: materialMode,
        productPriceMode: productMode
    };
}

// 生成交易模式按钮组HTML
function generateTradingModeButtons() {
    const currentMode = getCurrentTradingMode();
    const modes = [
        { key: 'ask-bid', label: t('高买低卖', 'High Buy/Low Sell'), material: 'ask', product: 'bid' },
        { key: 'ask-ask', label: t('高买高卖', 'High Buy/High Sell'), material: 'ask', product: 'ask' },
        { key: 'bid-ask', label: t('低买高卖', 'Low Buy/High Sell'), material: 'bid', product: 'ask' },
        { key: 'bid-bid', label: t('低买低卖', 'Low Buy/Low Sell'), material: 'bid', product: 'bid' }
    ];

    return modes.map(mode => `
        <label class="trading-mode-option" style="
            display: flex; 
            align-items: center; 
            margin-right: 6px; 
            padding: 3px 6px; 
            cursor: pointer; 
            font-size: 0.72em;
            border-radius: 3px;
            background: ${currentMode === mode.key ? '#007bff' : '#f8f9fa'};
            color: ${currentMode === mode.key ? 'white' : '#333'};
            border: 1px solid ${currentMode === mode.key ? '#007bff' : '#dee2e6'};
            transition: all 0.2s ease;
        ">
            <input type="radio" name="tradingMode" value="${mode.key}" ${currentMode === mode.key ? 'checked' : ''} 
                   style="display: none;" data-material="${mode.material}" data-product="${mode.product}">
            <span style="white-space: nowrap;">${mode.label}</span>
        </label>
    `).join('');
}

export async function waitForPannels() {
    if (!globals.freshnessMarketJson?.market) {
        setTimeout(waitForPannels, 1000);
        return;
    }

    const rightPanelContainers = document.querySelectorAll("div.CharacterManagement_tabsComponentContainer__3oI5G");
    const leftPanelContainers = document.querySelectorAll("div.GamePage_middlePanel__ubts7 .MuiTabs-root");
    const targetNodes = [...rightPanelContainers, ...leftPanelContainers];
    targetNodes.forEach(container => {
        if (container.querySelector('.MuiButtonBase-root.MuiTab-root.MuiTab-textColorPrimary.css-1q2h7u5.income-tab')) return;

        // 添加标签按钮和面板容器
        const tabsContainer = container.querySelector('div.MuiTabs-flexContainer');
        const tabPanelsContainer =
            container.querySelector('div.TabsComponent_tabPanelsContainer__26mzo') ||
            container.querySelector('div.MuiTabPanel-root');

        if (!tabsContainer || !tabPanelsContainer) return;

        const newTabButton = document.createElement('button');
        newTabButton.className = 'MuiButtonBase-root MuiTab-root MuiTab-textColorPrimary css-1q2h7u5 income-tab';
        newTabButton.innerHTML = `<span class="MuiBadge-root TabsComponent_badge__1Du26 css-1rzb3uu">${t('收益', 'Profit')}<span class="MuiBadge-badge MuiBadge-standard MuiBadge-invisible MuiBadge-anchorOriginTopRight MuiBadge-anchorOriginTopRightRectangular MuiBadge-overlapRectangular MuiBadge-colorWarning css-dpce5z"></span></span><span class="MuiTouchRipple-root css-w0pj6f"></span>`;
        newTabButton.classList.add('income-tab');
        tabsContainer.appendChild(newTabButton);

        // 创建收益面板
        const newPanel = document.createElement('div');
        newPanel.className = 'TabPanel_tabPanel__tXMJF TabPanel_hidden__26UM3 income-panel';
        newPanel.innerHTML = `
            <div class="Inventory_inventory__17CH2 profit-pannel">
            <h1 class="HousePanel_title__2fQ1U" style="position: relative; width: fit-content; margin: 4px auto 8px; font-size: 18px; font-weight: 600;">
                <div>${t('生产收益详情', 'Production Profit Details')}</div>
                <div class="HousePanel_guideTooltipContainer__1lAt1 profit-settings-btn" style="position: absolute; left: 100%; top: 0; margin-top: 1px; margin-left: 12px; cursor: pointer;">
                    <div class="GuideTooltip_guideTooltip__1tVq-" style="cursor: pointer">
                        <svg role="img" aria-label="Guide" class="Icon_icon__2LtL_" width="100%" height="100%">
                            <use href="/static/media/misc_sprite.118a8ff2.svg#settings"></use>
                        </svg>
                    </div>
                </div>
            </h1>
                <div style="display: flex; align-items: center; justify-content: space-between; margin: 0 10px 8px; flex-wrap: wrap;">
                    <span style="color: green; font-size: 0.8em; margin-bottom: 4px;">${t('数据更新于', 'Data updated')}: ${formatDuration(Date.now() - globals.freshnessMarketJson.time * 1000)}</span>
                    <div id="tradingModeContainer" style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        ${generateTradingModeButtons()}
                    </div>
                </div>
                <div class="Inventory_items__6SXv0 script_buildScore_added script_invSort_added">
                ${GenerateDom(globals.freshnessMarketJson)}
                </div>
            </div>
        `;
        tabPanelsContainer.appendChild(newPanel);
        container.dataset.processed = "true";

        setupTabSwitching(newTabButton, newPanel, tabPanelsContainer, container);

        if (!initialized) {
            createTooltip();
            setupClickActions();
            setInterval(() => refreshProfitPanel(), 1000);
            initialized = true;
        }
    });

    setTimeout(waitForPannels, 1000);
}

function setupTabSwitching(newTabButton, newPanel, tabPanelsContainer, container) {
    newTabButton.addEventListener('click', () => {
        container.querySelectorAll('.MuiTab-root').forEach(btn => btn.classList.remove('Mui-selected'));
        newTabButton.classList.add('Mui-selected');
        tabPanelsContainer.querySelectorAll('.TabPanel_tabPanel__tXMJF').forEach(panel => {
            panel.classList.add('TabPanel_hidden__26UM3');
        });
        newPanel.classList.remove('TabPanel_hidden__26UM3');
    });

    container.querySelectorAll('.MuiTab-root:not(.income-tab)').forEach(btn => {
        btn.addEventListener('click', () => {
            newPanel.classList.add('TabPanel_hidden__26UM3');
            newTabButton.classList.remove('Mui-selected');

            // 添加选中状态并显示原标签面板
            btn.classList.add('Mui-selected');
            const tabIndex = Array.from(btn.parentNode.children)
                .filter(el => !el.classList.contains('income-tab'))
                .indexOf(btn);
            tabPanelsContainer.querySelectorAll('.TabPanel_tabPanel__tXMJF:not(.income-panel)').forEach((panel, index) => {
                panel.classList.toggle('TabPanel_hidden__26UM3', index !== tabIndex);
            });
        });
    });
}

function setupClickActions() {
    document.addEventListener('click', (e) => {
        // 处理交易模式按钮点击 (包括label和radio)
        const tradingModeLabel = e.target.closest('.trading-mode-option');
        if (tradingModeLabel) {
            const radio = tradingModeLabel.querySelector('input[type="radio"]');
            if (radio) {
                const materialMode = radio.dataset.material;
                const productMode = radio.dataset.product;
                setTradingMode(materialMode, productMode);
                refreshProfitPanel(true);

                // 更新所有按钮的样式
                document.querySelectorAll('.trading-mode-option').forEach(label => {
                    const labelRadio = label.querySelector('input[type="radio"]');
                    const isSelected = labelRadio === radio;
                    label.style.background = isSelected ? '#007bff' : '#f8f9fa';
                    label.style.color = isSelected ? 'white' : '#333';
                    label.style.borderColor = isSelected ? '#007bff' : '#dee2e6';
                    labelRadio.checked = isSelected;
                });
            }
            return;
        }

        const settingsBtn = e.target.closest('.profit-settings-btn');
        if (settingsBtn) {
            unsafeWindow["MWIProfitPanel_showSettingsModal"]?.();
            return;
        }

        const itemContainer = e.target.closest('.Item_item__2De2O.Profit-pannel');
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

let profitRefreshTime = new Date();
export function refreshProfitPanel(force = false) {
    if (!globals.freshnessMarketJson?.market) return;

    const inventoryPanels = document.querySelectorAll('.Inventory_inventory__17CH2.profit-pannel');
    inventoryPanels.forEach(panel => {
        const timeSpan = panel.querySelector('span');
        if (timeSpan) {
            timeSpan.textContent = globals.freshnessMarketJson.stat();
            // timeSpan.textContent = `数据更新于：${getDuration(new Date(globals.freshnessMarketJson.time * 1000))}，收益刷新于：${getDuration(profitRefreshTime)}，mooket${mooketStatus()}，${getMwiObj()?.coreMarket ? "支持" : "不支持"}实时价格`;
        }

        // 更新交易模式按钮状态
        const tradingModeContainer = panel.querySelector('#tradingModeContainer');
        if (tradingModeContainer) {
            const currentMode = getCurrentTradingMode();
            const labels = tradingModeContainer.querySelectorAll('.trading-mode-option');
            labels.forEach(label => {
                const radio = label.querySelector('input[type="radio"]');
                const isSelected = radio.value === currentMode;
                label.style.background = isSelected ? '#007bff' : '#f8f9fa';
                label.style.color = isSelected ? 'white' : '#333';
                label.style.borderColor = isSelected ? '#007bff' : '#dee2e6';
                radio.checked = isSelected;
            });
        }

        if (force || globals.hasMarketItemUpdate) {
            const itemsContainer = panel.querySelector('.Inventory_items__6SXv0');
            if (itemsContainer) {
                itemsContainer.innerHTML = GenerateDom(globals.freshnessMarketJson);
                profitRefreshTime = new Date();
                globals.hasMarketItemUpdate = false;
            }
        }
    });
}