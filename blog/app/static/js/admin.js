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
