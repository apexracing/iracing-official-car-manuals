export type SiteLanguage = 'zh' | 'en';

const root = document.documentElement;

function languageButtons() {
  return document.querySelectorAll<HTMLButtonElement>('[data-language-option]');
}

export function activeLanguage(): SiteLanguage {
  return root.dataset.language === 'en' ? 'en' : 'zh';
}

export function applyLanguage(language: SiteLanguage, persist = true) {
  root.dataset.language = language;
  root.lang = language === 'en' ? 'en' : 'zh-CN';

  const suffix = language === 'en' ? 'En' : 'Zh';
  for (const element of document.querySelectorAll<HTMLElement>('[data-placeholder-zh][data-placeholder-en]')) {
    const placeholder = element.dataset[`placeholder${suffix}`];
    if (placeholder !== undefined) element.setAttribute('placeholder', placeholder);
  }
  for (const element of document.querySelectorAll<HTMLElement>('[data-label-zh][data-label-en]')) {
    const label = element.dataset[`label${suffix}`];
    if (label !== undefined) element.textContent = label;
  }
  for (const element of document.querySelectorAll<HTMLElement>('[data-text-zh][data-text-en]')) {
    const text = element.dataset[`text${suffix}`];
    if (text !== undefined) element.textContent = text;
  }

  for (const button of languageButtons()) {
    button.setAttribute('aria-pressed', String(button.dataset.languageOption === language));
  }

  if (!persist) return;
  try {
    localStorage.setItem('racedocs-language', language);
  } catch {}
}

export function bindLanguageSwitch(onChange: (language: SiteLanguage) => void) {
  for (const button of languageButtons()) {
    button.addEventListener('click', () => {
      onChange(button.dataset.languageOption === 'en' ? 'en' : 'zh');
    });
  }
}

export function preserveViewportAnchor(anchor: HTMLElement | undefined, update: () => void) {
  if (!anchor) {
    update();
    return;
  }

  const previousTop = anchor.getBoundingClientRect().top;
  const previousScrollY = window.scrollY;
  const previousRootAnchor = root.style.overflowAnchor;
  const previousBodyAnchor = document.body.style.overflowAnchor;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.overflowAnchor = 'none';
  document.body.style.overflowAnchor = 'none';
  root.style.scrollBehavior = 'auto';
  update();

  const positionDelta = anchor.getBoundingClientRect().top - previousTop;
  if (previousScrollY <= 1) {
    window.scrollTo({ top: 0, behavior: 'auto' });
  } else if (Math.abs(positionDelta) >= 0.5) {
    window.scrollTo({ top: previousScrollY + positionDelta, behavior: 'auto' });
  }

  requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior;
    root.style.overflowAnchor = previousRootAnchor;
    document.body.style.overflowAnchor = previousBodyAnchor;
  });
}
