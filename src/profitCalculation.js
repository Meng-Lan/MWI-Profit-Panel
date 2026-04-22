import globals from './globals';
import buffs from './buffs';
import {
    getItemName,
    getActionName,
    getItemValuation,
    getDropTableInfomation,
} from './utils';

export default function ProfitCaculation(action, marketJson) {
    const isProduction = action.inputItems?.length > 0;
    const actionHrid = action.hrid;

    const buyMode = globals.profitSettings.materialPriceMode || 'bid';
    const sellMode = globals.profitSettings.productPriceMode || 'ask';

    // 茶(饮品)效率和支出计算
    const teaBuffs = buffs.getTeaBuffs(action.type);
    const drinksConsumedHourAskPrice = { ask: 0, bid: 0 };
    const drinksList = globals.initCharacterData_actionTypeDrinkSlotsMap[action.type];
    const drinkItems = [];
    for (const drink of drinksList) {
        if (!drink?.itemHrid) continue;
        const valuation = getItemValuation(drink.itemHrid, marketJson);
        drinksConsumedHourAskPrice.ask += (valuation?.ask ?? 0) * 12;
        drinksConsumedHourAskPrice.bid += (valuation?.bid ?? 0) * 12;
        drinkItems.push({ ...valuation, name: getItemName(drink.itemHrid), countPerHour: 12 });
    }
    const communityBuff = buffs.getCommunityBuff(action.type);
    const achievementBuff = buffs.getAchievementBuff(action.type);
    const personalBuff = buffs.getPersonalBuff(action.type);
    const mooPassBuff = buffs.getMooPassBuff(action.type);

    // 原料支出计算
    let inputItems = [];
    const totalResourcesPricePerAction = { ask: 0, bid: 0 }

    if (isProduction) {
        inputItems = JSON.parse(JSON.stringify(action.inputItems));
        for (const item of inputItems) {
            item.name = getItemName(item.itemHrid);
            Object.assign(item, getItemValuation(item.itemHrid, marketJson));
            // 茶减少原料消耗
            item.count *= 1 - teaBuffs.artisan / 100;
            totalResourcesPricePerAction.ask += item.ask * item.count;
            totalResourcesPricePerAction.bid += item.bid * item.count;
        }

        // 上级物品作为原料
        if (action.upgradeItemHrid) {
            const valuation = getItemValuation(action.upgradeItemHrid, marketJson);
            totalResourcesPricePerAction.ask += valuation?.ask;
            totalResourcesPricePerAction.bid += valuation?.bid;
            const upgradedItem = {
                name: getItemName(action.upgradeItemHrid),
                ...valuation,
                count: 1,
            };
            inputItems.push(upgradedItem);
        }
    }

    // 等级碾压提高效率（人物等级不及最低要求等级时，按最低要求等级计算）
    const requiredLevel = action.levelRequirement.level;
    let currentLevel = requiredLevel;
    for (const skill of globals.initCharacterData_characterSkills) {
        if (skill.skillHrid === action.levelRequirement.skillHrid) {
            currentLevel = skill.level;
            break;
        }
    }
    const levelEffBuff = Math.max(currentLevel - requiredLevel, 0);
    // 房子效率
    const houseBuff = buffs.getHouseBuff(action.type);
    // 特殊装备效率
    const equipmentBuff = buffs.getEquipmentBuff(action.type);
    // 总效率，影响动作数
    const totalEffBuff = levelEffBuff + houseBuff.efficiency + teaBuffs.efficiency + equipmentBuff.efficiency + communityBuff.efficiency + achievementBuff.efficiency + personalBuff.efficiency;

    // 每小时动作数（包含工具缩减动作时间）
    const baseTimePerActionSec = action.baseTimeCost / 1000000000;
    // 游戏机制：动作时间最低只能到3秒
    const actualTimePerActionSec = Math.max(3, baseTimePerActionSec / (1 + equipmentBuff.action_speed / 100));
    const actionPerHour = 3600 / actualTimePerActionSec * (1 + totalEffBuff / 100);

    // 总 Wisdom Buff 计算（用于经验值）
    const totalWisdomBuff = (teaBuffs.wisdom || 0) +
        (communityBuff.wisdom || 0) +
        (equipmentBuff.wisdom || 0) +
        (houseBuff.wisdom || 0) +
        (achievementBuff.wisdom || 0) +
        (personalBuff.wisdom || 0) +
        (mooPassBuff.wisdom || 0);

    // 经验值计算
    const baseExpGain = action.experienceGain?.value || 0;
    const expPerAction = Math.round((1 + totalWisdomBuff / 100) * baseExpGain * 10) / 10;
    const expPerHour = expPerAction * actionPerHour;

    // 每小时支出
    const expendPerHour = totalResourcesPricePerAction[buyMode] * actionPerHour + drinksConsumedHourAskPrice[buyMode];

    const outputItems = [];
    // 基础产出
    let basicOutputValuationPerAction = { ask: 0, bid: 0 }
    if (isProduction) {
        for (const output of action.outputItems) {
            const valuation = getItemValuation(output.itemHrid, marketJson);
            basicOutputValuationPerAction.ask += valuation.ask * output.count;
            basicOutputValuationPerAction.bid += valuation.bid * output.count;
            outputItems.push({ name: getItemName(output.itemHrid), ...valuation, count: output.count });
        }
    }
    else {
        basicOutputValuationPerAction = getDropTableInfomation(action.dropTable, marketJson, teaBuffs);
        outputItems.push(...basicOutputValuationPerAction.dropItems);
    }

    // 茶产量额外增益
    const quantityBuf = (100 + teaBuffs.gathering + communityBuff.gathering + achievementBuff.gathering + personalBuff.gathering) / 100;
    basicOutputValuationPerAction.ask *= quantityBuf;
    basicOutputValuationPerAction.bid *= quantityBuf;
    outputItems.forEach(item => item.count *= quantityBuf);


    // 精华掉落
    const essenceOutputValuationPerAction = Array.isArray(action?.essenceDropTable) ? getDropTableInfomation(action.essenceDropTable, marketJson) : { ask: 0, bid: 0 };
    if (essenceOutputValuationPerAction.dropItems) {
        const quantityBuf = (100 + equipmentBuff.essence_find) / 100;
        essenceOutputValuationPerAction.ask *= quantityBuf;
        essenceOutputValuationPerAction.bid *= quantityBuf;
        essenceOutputValuationPerAction.dropItems.forEach(item => item.count *= quantityBuf);
        outputItems.push(...essenceOutputValuationPerAction.dropItems);
    }

    // 稀有掉落
    const rareOutputValuationPerAction = Array.isArray(action?.rareDropTable) ? getDropTableInfomation(action.rareDropTable, marketJson) : { ask: 0, bid: 0 };
    if (rareOutputValuationPerAction.dropItems) {
        const quantityBuf = (100 + houseBuff.rare_find + equipmentBuff.rare_find + achievementBuff.rare_find + personalBuff.rare_find) / 100;
        rareOutputValuationPerAction.ask *= quantityBuf;
        rareOutputValuationPerAction.bid *= quantityBuf;
        rareOutputValuationPerAction.dropItems.forEach(item => item.count *= quantityBuf);
        outputItems.push(...rareOutputValuationPerAction.dropItems);
    }

    // 每小时产出
    const ask = basicOutputValuationPerAction.ask + essenceOutputValuationPerAction.ask + rareOutputValuationPerAction.ask;
    const bid = basicOutputValuationPerAction.bid + essenceOutputValuationPerAction.bid + rareOutputValuationPerAction.bid;
    const outputPerHour = {
        ask: ask * actionPerHour * 0.98,
        bid: bid * actionPerHour * 0.98,
    }
    inputItems.forEach(item => item.countPerHour = item.count * actionPerHour);
    drinkItems.forEach(item => item.count = item.countPerHour / actionPerHour);
    inputItems.push(...drinkItems);
    outputItems.forEach(item => item.countPerHour = item.count * actionPerHour);

    // 每小时利润
    const profitPerHour = outputPerHour[sellMode] - expendPerHour;
    const profitPerDay = profitPerHour * 24;

    return {
        actionNames: getActionName(action.hrid),
        actionHrid,
        skillHrid: action.levelRequirement.skillHrid,
        inputItems,
        outputItems,
        actionPerHour,
        expendPerHour,
        outputPerHour,
        profitPerHour,

        baseTimePerActionSec,
        levelEffBuff,
        teaBuffs,
        communityBuff,
        houseBuff,
        equipmentBuff,
        achievementBuff,
        personalBuff,
        mooPassBuff,

        expPerAction,
        expPerHour,

        profitPerDay,
        ProfitMargin: 100 * (profitPerHour) / expendPerHour
    };
}
