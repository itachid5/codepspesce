const drawer = document.querySelector('#drawer');
const drawerOverlay = document.querySelector('.drawer-overlay');
const headerSearch = document.querySelector('.header-search');
const headerSearchInput = document.querySelector('.header-search input');
const menuButtons = document.querySelectorAll('[data-open-menu]');
const searchButtons = document.querySelectorAll('[data-open-search]');

const setDrawerOpen = (open) => {
  drawer?.classList.toggle('open', open);
  drawer?.setAttribute('aria-hidden', String(!open));
  drawerOverlay?.toggleAttribute('hidden', !open);
  document.body.classList.toggle('drawer-open', open);
  menuButtons.forEach((button) => button.setAttribute('aria-expanded', String(open)));
};

menuButtons.forEach((button) => button.addEventListener('click', () => setDrawerOpen(true)));
document.querySelectorAll('[data-close-menu]').forEach((button) => button.addEventListener('click', () => setDrawerOpen(false)));

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
