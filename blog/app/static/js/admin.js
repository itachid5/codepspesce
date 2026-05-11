document.querySelectorAll('[data-confirm]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    if (!confirm('Are you sure you want to delete this item?')) event.preventDefault();
  });
});

const source = document.querySelector('[data-slug-source]');
const target = document.querySelector('[data-slug-target]');
source?.addEventListener('input', () => {
  if (!target || target.dataset.touched) return;
  target.value = source.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
});
target?.addEventListener('input', () => { target.dataset.touched = 'true'; });

const adminSidebar = document.querySelector('#admin-sidebar');
const adminOverlay = document.querySelector('.admin-overlay');
const adminMenuButton = document.querySelector('[data-admin-menu]');

const setAdminMenuOpen = (open) => {
  adminSidebar?.classList.toggle('open', open);
  adminSidebar?.setAttribute('aria-hidden', String(!open && window.matchMedia('(max-width: 900px)').matches));
  adminOverlay?.toggleAttribute('hidden', !open);
  adminMenuButton?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('admin-menu-open', open);
};

adminMenuButton?.addEventListener('click', () => setAdminMenuOpen(true));
document.querySelectorAll('[data-admin-close]').forEach((element) => element.addEventListener('click', () => setAdminMenuOpen(false)));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setAdminMenuOpen(false);
});

document.querySelectorAll('.form-grid[enctype="multipart/form-data"]').forEach((form) => {
  form.addEventListener('submit', () => {
    const button = form.querySelector('button[type="submit"], button:not([type])');
    if (!button) return;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Uploading...';
    button.setAttribute('aria-busy', 'true');
  });
});
