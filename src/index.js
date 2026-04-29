import globals from './globals'
import { preFetchData } from './marketService';
import { waitForPannels, refreshProfitPanel } from './panelManager'
import { processingCategory, ZHitemNames } from './utils';
import LostTrackerExpectEstimate from './LostTrackerExpectEstimate'
import { initSettingsMenu, validateProfitSettings } from './settingsManager.js';

function hookWS() {
    const dataProperty = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const oriGet = dataProperty.get;

    dataProperty.get = hookedGet;
    Object.defineProperty(MessageEvent.prototype, "data", dataProperty);

    function hookedGet() {
        const socket = this.currentTarget;
        if (!(socket instanceof WebSocket)) {
            return oriGet.call(this);
        }
        if (socket.url.indexOf("api." + globals.domainname + "/ws") <= -1 && socket.url.indexOf("api-test." + globals.domainname + "/ws") <= -1) {
            return oriGet.call(this);
        }

        const message = oriGet.call(this);
        Object.defineProperty(this, "data", { value: message }); // Anti-loop

        return handleMessage(message);
    }
}

function handleMessage(message) {
    try {
        let obj = JSON.parse(message);
        if (obj) {
            if (obj.type === "init_character_data") {
                globals.initCharacterData_characterSkills = obj.characterSkills;
                globals.initCharacterData_actionTypeDrinkSlotsMap = obj.actionTypeDrinkSlotsMap;
                globals.initCharacterData_characterHouseRoomMap = obj.characterHouseRoomMap;
                globals.initCharacterData_characterItems = obj.characterItems;
                globals.initCharacterData_communityActionTypeBuffsMap = obj.communityActionTypeBuffsMap;
                globals.initCharacterData_consumableActionTypeBuffsMap = obj.consumableActionTypeBuffsMap;
                globals.initCharacterData_houseActionTypeBuffsMap = obj.houseActionTypeBuffsMap;
                globals.initCharacterData_equipmentActionTypeBuffsMap = obj.equipmentActionTypeBuffsMap;
                globals.initCharacterData_achievementActionTypeBuffsMap = obj.achievementActionTypeBuffsMap;
                globals.initCharacterData_personalActionTypeBuffsMap = obj.personalActionTypeBuffsMap;
                globals.initCharacterData_mooPassActionTypeBuffsMap = obj.mooPassActionTypeBuffsMap;
                globals.initCharacterData_noncombatStats = obj.noncombatStats;
                waitForPannels();
            }
            else if (obj.type === "init_client_data") {
                globals.initClientData_actionDetailMap = obj.actionDetailMap;
                globals.initClientData_itemDetailMap = obj.itemDetailMap;
                globals.initClientData_openableLootDropMap = obj.openableLootDropMap;
            }
            else if (obj.type === "market_item_order_books_updated") {
                globals.hasMarketItemUpdate = true;
                globals.freshnessMarketJson.updateDataFromMarket(obj?.marketItemOrderBooks);
                console.log({ hasMarketItemUpdate: globals.hasMarketItemUpdate, obj });
            }
            else if (obj.type === "loot_log_updated") {
                globals.lootLog = obj.lootLog;
                LostTrackerExpectEstimate();
            }
            else if (obj.type === "skills_updated") {
                setTimeout(() => {
                    if (getMwiObj()?.game?.state?.characterSkillMap) {
                        globals.initCharacterData_characterSkills = [...getMwiObj()?.game?.state.characterSkillMap.values()];
                        refreshProfitPanel(true);
                    }
                    else console.error(obj);
                }, 100);
            }
            else if (obj.type === "community_buffs_updated") {
                globals.initCharacterData_communityActionTypeBuffsMap = obj.communityActionTypeBuffsMap;
                refreshProfitPanel(true);
            }
            else if (obj.type === "consumable_buffs_updated") {
                globals.initCharacterData_consumableActionTypeBuffsMap = obj.consumableActionTypeBuffsMap;
                refreshProfitPanel(true);
            }
            else if (obj.type === "equipment_buffs_updated") {
                globals.initCharacterData_equipmentActionTypeBuffsMap = obj.equipmentActionTypeBuffsMap;
                refreshProfitPanel(true);
            }
            else if (obj.type === "house_rooms_updated") {
                globals.initCharacterData_houseActionTypeBuffsMap = obj.houseActionTypeBuffsMap;
                refreshProfitPanel(true);
            }
            else if (obj.type === "achievements_updated") {
                globals.initCharacterData_achievementActionTypeBuffsMap = obj.achievementActionTypeBuffsMap;
                refreshProfitPanel(true);
            }
            else if (obj.type === "personal_buffs_updated") {
                globals.initCharacterData_personalActionTypeBuffsMap = obj.personalActionTypeBuffsMap;
                refreshProfitPanel(true);
            }
            else if (obj.type === "moo_pass_buffs_updated") {
                globals.initCharacterData_mooPassActionTypeBuffsMap = obj.mooPassActionTypeBuffsMap;
                refreshProfitPanel(true);
            }
            else if (obj.type === "action_completed") {
                // 更新技能经验数据
                if (obj.endCharacterSkills) {
                    for (const updatedSkill of obj.endCharacterSkills) {
                        const index = globals.initCharacterData_characterSkills
                            .findIndex(s => s.skillHrid === updatedSkill.skillHrid);
                        if (index !== -1) {
                            globals.initCharacterData_characterSkills[index] = updatedSkill;
                        }
                    }
                }
            }
        }
    }
    catch (err) { console.error(err); }
    return message;
}

globals.subscribe((key, value) => {
    if (key === "initClientData_actionDetailMap") {
        const processingMap = {};
        for (const [actionHrid, actionDetail] of Object.entries(value)) {
            const categorys = processingCategory[actionDetail.type];
            if (categorys && categorys.indexOf(actionDetail.category) !== -1) {
                const inputHrid = actionDetail.inputItems[0].itemHrid;
                processingMap[inputHrid] = actionDetail;
            }
        }
        globals.processingMap = processingMap;
    }
    if (key === "initClientData_itemDetailMap") {
        const en2ZhMap = {};
        for (const [hrid, item] of Object.entries(value)) {
            const en = item.name;
            const zh = ZHitemNames[hrid];
            en2ZhMap[en] = zh;
        }
        globals.en2ZhMap = en2ZhMap;
    }
});

const profitSettings = validateProfitSettings(JSON.parse(GM_getValue('profitSettings', JSON.stringify({
    materialPriceMode: 'ask',
    productPriceMode: 'bid',
    dataSourceKeys: ['Official', 'MooketApi', 'Mooket'],
    actionCategories: ['milking', 'foraging', 'woodcutting', 'cheesesmithing', 'crafting', 'tailoring', 'cooking', 'brewing']
}))));
globals.profitSettings = profitSettings;

globals.isZHInGameSetting = localStorage.getItem("i18nextLng")?.toLowerCase()?.startsWith("zh"); // 获取游戏内设置语言

const initCD = localStorage.getItem("initClientData");

if (initCD) {
    const decomCD = LZString.decompressFromUTF16(initCD);
    const obj = JSON.parse(decomCD);

    globals.initClientData_actionDetailMap = obj.actionDetailMap;
    globals.initClientData_itemDetailMap = obj.itemDetailMap;
    globals.initClientData_openableLootDropMap = obj.openableLootDropMap;
}

unsafeWindow["MWIProfitPanel_Globals"] = globals;

hookWS();
preFetchData();
initSettingsMenu();
GM_addStyle(GM_getResourceText("bootstrapCSS"));
