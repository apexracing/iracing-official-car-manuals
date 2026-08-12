import { activeLanguage, applyLanguage, type SiteLanguage } from './language';

type ThemeMode = 'light' | 'dark' | 'system';

const root = document.documentElement;
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function normalizeTheme(value: unknown): ThemeMode | undefined {
  return value === 'light' || value === 'dark' || value === 'system' ? value : undefined;
}

function normalizeLanguage(value: unknown): SiteLanguage | undefined {
  if (typeof value !== 'string') return undefined;
  const language = value.toLowerCase();
  if (language === 'en' || language === 'en-us' || language === 'en_us') return 'en';
  if (language === 'zh' || language === 'zh-cn' || language === 'zh_cn') return 'zh';
  return undefined;
}

function activeThemeMode(): ThemeMode {
  return normalizeTheme(root.dataset.themeMode) ?? 'system';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? (systemTheme.matches ? 'dark' : 'light') : mode;
}

function notifyHost() {
  const detail = {
    theme: root.dataset.theme,
    themeMode: activeThemeMode(),
    language: activeLanguage() === 'en' ? 'en-US' : 'zh-CN',
  };
  window.dispatchEvent(new CustomEvent('racedocs:preferences-changed', { detail }));
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'racedocs:preferences-changed', ...detail }, '*');
  }
}

export function applyTheme(mode: ThemeMode, persist = true) {
  const theme = resolveTheme(mode);
  root.dataset.themeMode = mode;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  if (persist) {
    try {
      localStorage.setItem('racedocs-theme', mode);
    } catch {}
  }
  notifyHost();
}

function setLanguage(language: SiteLanguage, persist = true) {
  if (language === 'en' && root.dataset.hasEnglish !== 'true') return;
  applyLanguage(language, persist);
  notifyHost();
}

function applyPreferences(theme: unknown, language: unknown) {
  const normalizedTheme = normalizeTheme(theme);
  const normalizedLanguage = normalizeLanguage(language);
  if (normalizedTheme) applyTheme(normalizedTheme);
  if (normalizedLanguage) setLanguage(normalizedLanguage);
}

window.addEventListener('message', (event) => {
  if (event.source !== window && event.source !== window.parent) return;
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'tracklogic:preferences') {
    applyPreferences(data.theme ?? data.themeMode, data.language ?? data.lang);
  } else if (data.type === 'tracklogic:theme') {
    applyPreferences(data.value ?? data.theme, undefined);
  } else if (data.type === 'tracklogic:language') {
    applyPreferences(undefined, data.value ?? data.language ?? data.lang);
  }
});

window.addEventListener('tracklogic:preferences', ((event: CustomEvent) => {
  applyPreferences(event.detail?.theme ?? event.detail?.themeMode, event.detail?.language ?? event.detail?.lang);
}) as EventListener);

(window as typeof window & {
  RaceDocsPreferences?: { set: (preferences: { theme?: ThemeMode; language?: string }) => void };
}).RaceDocsPreferences = {
  set: ({ theme, language }) => applyPreferences(theme, language),
};

systemTheme.addEventListener('change', () => {
  if (activeThemeMode() === 'system') applyTheme('system', false);
});

applyLanguage(activeLanguage(), false);
applyTheme(activeThemeMode(), false);

window.parent !== window && window.parent.postMessage({ type: 'racedocs:ready' }, '*');
