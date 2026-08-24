const searchInput = document.getElementById('searchInput');
const cards = [...document.querySelectorAll('.prompt-card')];
const categoryButtons = [...document.querySelectorAll('.category')];

function applyFilters() {
  const q = (searchInput?.value || '').trim().toLowerCase();
  const active = document.querySelector('.category.active')?.dataset.filter || 'all';
  cards.forEach(card => {
    const title = (card.dataset.title || '').toLowerCase();
    const cat = card.dataset.category || '';
    const matchText = !q || title.includes(q) || cat.includes(q);
    const matchCategory = active === 'all' || active === cat;
    card.style.display = matchText && matchCategory ? '' : 'none';
  });
}

searchInput?.addEventListener('input', applyFilters);
categoryButtons.forEach(btn => btn.addEventListener('click', () => {
  categoryButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}));

document.querySelectorAll('.heart').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    btn.classList.toggle('active');
    btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
  });
});

const dialog = document.getElementById('authDialog');
document.getElementById('loginBtn')?.addEventListener('click', () => dialog.showModal());
document.getElementById('cartBtn')?.addEventListener('click', () => alert('Cart demo: 2 prompts selected.'));

document.querySelectorAll('.prompt-card').forEach(card => {
  card.addEventListener('click', () => alert(`${card.dataset.title}\n\nProduct detail page will be connected next.`));
});