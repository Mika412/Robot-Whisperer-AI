import { browser } from '$app/environment';

const defaultSettings = {
    theme: 'dark',
    websocketUrl: 'ws://localhost:8765'
};

function createSettingsStore() {
    let currentSettings = $state(get());

    function get() {
        if (!browser) {
            return defaultSettings;
        }
        const storedValue = localStorage.getItem('settings');
        if (storedValue) {
            try {
                return JSON.parse(storedValue);
            } catch (e) {
                console.error(`Error parsing localStorage key "settings":`, e);
                return defaultSettings;
            }
        }
        return defaultSettings;
    }

    function set(newSettings: typeof defaultSettings) {
        currentSettings = newSettings;
        if (browser) {
            localStorage.setItem('settings', JSON.stringify(currentSettings));
            setTheme(currentSettings.theme);
        }
    }

    function setTheme(theme: string) {
        if (browser) {
            document.documentElement.className = theme;
        }
    }

    return {
        get settings() { return currentSettings },
        set,
        setTheme,
        get websocketUrl() { return currentSettings.websocketUrl }
    };
}

export const settings = createSettingsStore();
