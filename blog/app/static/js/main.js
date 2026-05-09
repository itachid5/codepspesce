const drawer = document.querySelector('#drawer');
document.querySelectorAll('[data-open-menu]').forEach((button) => button.addEventListener('click', () => drawer?.classList.add('open')));
document.querySelectorAll('[data-close-menu]').forEach((button) => button.addEventListener('click', () => drawer?.classList.remove('open')));
