// 全局状态管理器
class GlobalState {
    constructor() {
        this._state = {
            initClientData_itemDetailMap: {},
            initClientData_actionDetailMap: {},
            initClientData_openableLootDropMap: {},
            initCharacterData_characterSkills: [],
            initCharacterData_actionTypeDrinkSlotsMap: {},
            initCharacterData_characterHouseRoomMap: {},
            initCharacterData_characterItems: [],
            initCharacterData_communityActionTypeBuffsMap: {},
            initCharacterData_consumableActionTypeBuffsMap: {},
            initCharacterData_houseActionTypeBuffsMap: {},
            initCharacterData_equipmentActionTypeBuffsMap: {},
            hasMarketItemUpdate: false,
            isZHInGameSetting: false,
            freshnessMarketJson: {},
            medianMarketJson: {},
            processingMap: {},
            lootLog: [],
        };

        this._listeners = new Set();

        return new Proxy(this, {
            get(target, prop) {
                if (prop in target._state) {
                    return target._state[prop];
                }
                return target[prop];
            },
            set(target, prop, value) {
                if (prop in target._state) {
                    target._state[prop] = value;
                    target._notifyListeners(prop, value);
                    return true;
                }
                target[prop] = value;
                return true;
            }
        });
    }

    _notifyListeners(prop, value) {
        this._listeners.forEach(cb => cb(prop, value));
    }

    subscribe(callback) {
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    }
}

export default new GlobalState();