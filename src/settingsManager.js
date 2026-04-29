import globals from './globals.js';
import { refreshProfitPanel } from './panelManager.js';
import { t, getActionTypeName } from './utils.js';

// 验证设置（从原 settingsPanel.js 保留）
export function validateProfitSettings(settings) {
    const validCategories = ['milking', 'foraging', 'woodcutting', 'cheesesmithing', 'crafting', 'tailoring', 'cooking', 'brewing'];
    const validDataSources = ['Official', 'MooketApi', 'Mooket'];

    // 验证 price modes
    if (!['ask', 'bid'].includes(settings.materialPriceMode)) {
        settings.materialPriceMode = 'ask';
    }
    if (!['ask', 'bid'].includes(settings.productPriceMode)) {
        settings.productPriceMode = 'bid';
    }

    // 验证 dataSourceKeys
    if (!Array.isArray(settings.dataSourceKeys)) {
        settings.dataSourceKeys = validDataSources;
    } else {
        settings.dataSourceKeys = settings.dataSourceKeys.filter(src => validDataSources.includes(src));
        if (settings.dataSourceKeys.length === 0) {
            settings.dataSourceKeys = validDataSources;
        }
    }

    // 验证 actionCategories
    if (!Array.isArray(settings.actionCategories)) {
        settings.actionCategories = validCategories;
    } else {
        settings.actionCategories = settings.actionCategories.filter(cat => validCategories.includes(cat));
        if (settings.actionCategories.length === 0) {
            settings.actionCategories = validCategories;
        }
    }

    // 验证 levelUpDisplayCount (1-10)
    if (typeof settings.levelUpDisplayCount !== 'number' || settings.levelUpDisplayCount < 1 || settings.levelUpDisplayCount > 10) {
        settings.levelUpDisplayCount = 3;
    }

    return settings;
}

// 初始化油猴菜单
export function initSettingsMenu() {
    if (typeof GM_registerMenuCommand !== 'undefined') {
        GM_registerMenuCommand("⚙️ 设置", showSettingsModal);
    }

    // 订阅设置变更
    globals.subscribe((key, value) => {
        if (key === "profitSettings") {
            refreshProfitPanel(true);
            GM_setValue("profitSettings", JSON.stringify(value));
        }
    });
}

// 显示设置 Modal
export function showSettingsModal() {
    if (document.getElementById('mwi-profit-settings-overlay')) {
        return;
    }

    const settings = globals.profitSettings;

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'mwi-profit-settings-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 100000;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;

    // 创建对话框
    const dialog = document.createElement('div');
    dialog.id = 'mwi-profit-settings-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        z-index: 100001;
        min-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        opacity: 0;
        transition: opacity 0.2s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    dialog.innerHTML = `
        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #333;">${t('收益设置', 'Profit Settings')}</h3>

        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #333; font-weight: 500;">${t('原料进货方式', 'Material Price Mode')}</label>
            <select id="mwi-material-price-mode" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                background: white;
                color: #333;
                cursor: pointer;
            ">
                <option value="ask" ${settings.materialPriceMode === 'ask' ? 'selected' : ''}>${t('高买', 'High Ask')}</option>
                <option value="bid" ${settings.materialPriceMode === 'bid' ? 'selected' : ''}>${t('低买', 'Low Bid')}</option>
            </select>
        </div>

        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #333; font-weight: 500;">${t('产品出货方式', 'Product Price Mode')}</label>
            <select id="mwi-product-price-mode" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                background: white;
                color: #333;
                cursor: pointer;
            ">
                <option value="ask" ${settings.productPriceMode === 'ask' ? 'selected' : ''}>${t('高卖', 'High Ask')}</option>
                <option value="bid" ${settings.productPriceMode === 'bid' ? 'selected' : ''}>${t('低卖', 'Low Bid')}</option>
            </select>
        </div>

        <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 10px; font-size: 14px; color: #333; font-weight: 500;">${t('显示的动作分类', 'Action Categories')}</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                ${renderCheckbox('mwi-cat-milking', 'milking', getActionTypeName('milking'), settings.actionCategories)}
                ${renderCheckbox('mwi-cat-foraging', 'foraging', getActionTypeName('foraging'), settings.actionCategories)}
                ${renderCheckbox('mwi-cat-woodcutting', 'woodcutting', getActionTypeName('woodcutting'), settings.actionCategories)}
                ${renderCheckbox('mwi-cat-cheesesmithing', 'cheesesmithing', getActionTypeName('cheesesmithing'), settings.actionCategories)}
                ${renderCheckbox('mwi-cat-crafting', 'crafting', getActionTypeName('crafting'), settings.actionCategories)}
                ${renderCheckbox('mwi-cat-tailoring', 'tailoring', getActionTypeName('tailoring'), settings.actionCategories)}
                ${renderCheckbox('mwi-cat-cooking', 'cooking', getActionTypeName('cooking'), settings.actionCategories)}
                ${renderCheckbox('mwi-cat-brewing', 'brewing', getActionTypeName('brewing'), settings.actionCategories)}
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 10px; font-size: 14px; color: #333; font-weight: 500;">${t('数据来源', 'Data Source')} (${t('暂时不生效', 'currently inactive')})</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${renderCheckbox('mwi-src-official', 'Official', t('官方市场', 'Official Market'), settings.dataSourceKeys)}
                ${renderCheckbox('mwi-src-mooketapi', 'MooketApi', t('Mooket API', 'Mooket API'), settings.dataSourceKeys)}
                ${renderCheckbox('mwi-src-mooket', 'Mooket', t('Mooket实时', 'Mooket Realtime'), settings.dataSourceKeys)}
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #333; font-weight: 500;">${t('升级预估显示级数', 'Level Up Display Count')}</label>
            <select id="mwi-level-up-display-count" style="
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                background: white;
                color: #333;
                cursor: pointer;
            ">
                <option value="1" ${settings.levelUpDisplayCount === 1 ? 'selected' : ''}>1${t('级', 'lv')}</option>
                <option value="2" ${settings.levelUpDisplayCount === 2 ? 'selected' : ''}>2${t('级', 'lv')}</option>
                <option value="3" ${settings.levelUpDisplayCount === 3 ? 'selected' : ''}>3${t('级', 'lv')}</option>
                <option value="4" ${settings.levelUpDisplayCount === 4 ? 'selected' : ''}>4${t('级', 'lv')}</option>
                <option value="5" ${settings.levelUpDisplayCount === 5 ? 'selected' : ''}>5${t('级', 'lv')}</option>
                <option value="6" ${settings.levelUpDisplayCount === 6 ? 'selected' : ''}>6${t('级', 'lv')}</option>
                <option value="7" ${settings.levelUpDisplayCount === 7 ? 'selected' : ''}>7${t('级', 'lv')}</option>
                <option value="8" ${settings.levelUpDisplayCount === 8 ? 'selected' : ''}>8${t('级', 'lv')}</option>
                <option value="9" ${settings.levelUpDisplayCount === 9 ? 'selected' : ''}>9${t('级', 'lv')}</option>
                <option value="10" ${settings.levelUpDisplayCount === 10 ? 'selected' : ''}>10${t('级', 'lv')}</option>
            </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="mwi-settings-cancel" style="
                padding: 8px 20px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                color: #333;
            ">${t('取消', 'Cancel')}</button>
            <button id="mwi-settings-save" style="
                padding: 8px 20px;
                border: none;
                background: #007bff;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            ">${t('保存', 'Save')}</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    // 触发动画
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        dialog.style.opacity = '1';
    });

    // 绑定事件
    setupModalEventListeners(overlay, dialog);
}

// 渲染复选框辅助函数
function renderCheckbox(id, value, label, checkedArray) {
    const checked = checkedArray.includes(value) ? 'checked' : '';
    return `
        <label style="display: flex; align-items: center; font-size: 14px; cursor: pointer; color: #333;">
            <input type="checkbox" id="${id}" value="${value}" ${checked} style="margin-right: 8px; cursor: pointer;">
            ${label}
        </label>
    `;
}

// 设置 Modal 事件监听
function setupModalEventListeners(overlay, dialog) {
    // 点击遮罩层关闭
    overlay.addEventListener('click', () => closeModal(overlay, dialog));

    // ESC 键关闭
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(overlay, dialog);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // 取消按钮
    document.getElementById('mwi-settings-cancel').addEventListener('click', () => {
        closeModal(overlay, dialog);
        document.removeEventListener('keydown', escHandler);
    });

    // 保存按钮
    document.getElementById('mwi-settings-save').addEventListener('click', () => {
        // 收集设置值
        const materialPriceMode = document.getElementById('mwi-material-price-mode').value;
        const productPriceMode = document.getElementById('mwi-product-price-mode').value;

        const actionCategories = [];
        const catCheckboxes = [
            { id: 'mwi-cat-milking', value: 'milking' },
            { id: 'mwi-cat-foraging', value: 'foraging' },
            { id: 'mwi-cat-woodcutting', value: 'woodcutting' },
            { id: 'mwi-cat-cheesesmithing', value: 'cheesesmithing' },
            { id: 'mwi-cat-crafting', value: 'crafting' },
            { id: 'mwi-cat-tailoring', value: 'tailoring' },
            { id: 'mwi-cat-cooking', value: 'cooking' },
            { id: 'mwi-cat-brewing', value: 'brewing' },
        ];
        catCheckboxes.forEach(({ id, value }) => {
            if (document.getElementById(id).checked) {
                actionCategories.push(value);
            }
        });

        const dataSourceKeys = [];
        const srcCheckboxes = [
            { id: 'mwi-src-official', value: 'Official' },
            { id: 'mwi-src-mooketapi', value: 'MooketApi' },
            { id: 'mwi-src-mooket', value: 'Mooket' },
        ];
        srcCheckboxes.forEach(({ id, value }) => {
            if (document.getElementById(id).checked) {
                dataSourceKeys.push(value);
            }
        });

        const newSettings = {
            materialPriceMode,
            productPriceMode,
            actionCategories,
            dataSourceKeys,
            levelUpDisplayCount: parseInt(document.getElementById('mwi-level-up-display-count').value, 10)
        };

        globals.profitSettings = validateProfitSettings(newSettings);

        closeModal(overlay, dialog);
        document.removeEventListener('keydown', escHandler);
    });
}

// 关闭 Modal
function closeModal(overlay, dialog) {
    overlay.style.opacity = '0';
    dialog.style.opacity = '0';

    // 动画结束后移除 DOM
    setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
        if (dialog.parentNode) dialog.remove();
    }, 200);
}

unsafeWindow["MWIProfitPanel_showSettingsModal"] = showSettingsModal;
