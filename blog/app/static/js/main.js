const drawer = document.querySelector('#drawer');
const drawerOverlay = document.querySelector('.drawer-overlay');
const headerSearch = document.querySelector('.header-search');
const headerSearchInput = document.querySelector('.header-search input');
const menuButtons = document.querySelectorAll('[data-open-menu]');
const searchButtons = document.querySelectorAll('[data-open-search]');
const themeButtons = document.querySelectorAll('[data-theme-toggle]');

const setDrawerOpen = (open) => {
  drawer?.classList.toggle('open', open);
  drawer?.setAttribute('aria-hidden', String(!open));
  drawerOverlay?.toggleAttribute('hidden', !open);
  document.body.classList.toggle('drawer-open', open);
  menuButtons.forEach((button) => button.setAttribute('aria-expanded', String(open)));
};

const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  const isDark = theme === 'dark';
  themeButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(isDark));
    const label = button.querySelector('.theme-toggle-label');
    if (label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
};

const initialTheme = document.documentElement.dataset.theme || 'light';
setTheme(initialTheme);

menuButtons.forEach((button) => button.addEventListener('click', () => setDrawerOpen(true)));
document.querySelectorAll('[data-close-menu]').forEach((button) => button.addEventListener('click', () => setDrawerOpen(false)));

document.querySelectorAll('[data-drawer-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const section = button.closest('[data-drawer-section]');
    const submenu = section?.querySelector('.drawer-submenu');
    const open = !section?.classList.contains('open');
    section?.classList.toggle('open', open);
    submenu?.toggleAttribute('hidden', !open);
    button.setAttribute('aria-expanded', String(open));
  });
});

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });
});

searchButtons.forEach((button) => button.addEventListener('click', () => {
  const open = !headerSearch?.classList.contains('open');
  headerSearch?.classList.toggle('open', open);
  button.setAttribute('aria-expanded', String(open));
  if (open) headerSearchInput?.focus();
}));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  setDrawerOpen(false);
  headerSearch?.classList.remove('open');
  searchButtons.forEach((button) => button.setAttribute('aria-expanded', 'false'));
});
