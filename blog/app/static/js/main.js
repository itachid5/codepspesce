const drawer = document.querySelector('#drawer');
const headerSearch = document.querySelector('.header-search');
const headerSearchInput = document.querySelector('.header-search input');
document.querySelectorAll('[data-open-menu]').forEach((button) => button.addEventListener('click', () => drawer?.classList.add('open')));
document.querySelectorAll('[data-close-menu]').forEach((button) => button.addEventListener('click', () => drawer?.classList.remove('open')));
document.querySelectorAll('[data-open-search]').forEach((button) => button.addEventListener('click', () => {
  headerSearch?.classList.toggle('open');
  headerSearchInput?.focus();
}));
