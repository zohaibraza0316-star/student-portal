// Synchronously mounts modular view HTML into index.html (works on GitHub Pages & local file:// with zero CORS errors)
function mountView(html) {
  const container = document.getElementById('appViewsContainer');
  if (container) container.insertAdjacentHTML('beforeend', html);
}

function mountModals(html) {
  const container = document.getElementById('appModalsContainer');
  if (container) container.insertAdjacentHTML('beforeend', html);
}
