import storage from 'electron-json-storage'
import log from 'electron-log'
import { settingsKey } from '../src/sharedEnums';

class SettingManager {
    public getSettings<Type>(key: settingsKey) {
        return new Promise<Type>((resolve, reject) => {
            storage.get(key, (error, data) => {
                if (error) {
                    log.error(JSON.stringify(error));
                    reject();
                }
                else {
                    log.info(`Setting Manager 'Get' key: ${key} = value: ${JSON.stringify(data)}`);
                    resolve((data as any).value);
                }
            });
        });
    }

    public setSetting(key: settingsKey, value: object) {
        return new Promise<void>((resolve, reject) => {
            storage.set(key, { value }, (error) => {
                if (error) {
                    log.error(JSON.stringify(error));
                    reject();
                }
                else {
                    log.info(`Setting Manager 'Set' key: ${key} = value: ${JSON.stringify(value)}`);
                    resolve();
                }
            });
        })
    }
}

const settingManager = new SettingManager();

export default settingManager;
