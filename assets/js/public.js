/**
 * public.js — ตรรกะหน้า public: โหลด ค้นหา กรองหมวดหมู่ แสดงการ์ด + QR
 */
(function () {
  let allItems = [];

  const contentEl = document.getElementById('content');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const countBadge = document.getElementById('countBadge');

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function showToast(msg, isError) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => { toast.className = 'toast'; }, 1800);
  }

  function setBrand() {
    const cfg = window.APP_CONFIG || {};
    const name = window.CURRENT_LANG === 'en' ? cfg.APP_NAME_EN : cfg.APP_NAME_TH;
    if (name) {
      document.getElementById('brandName').textContent = name;
      document.title = name;
    }
  }

  async function load() {
    try {
      allItems = await API.list();
      buildCategoryOptions();
      render();
    } catch (err) {
      contentEl.innerHTML = '<div class="state">' + esc(t('error_load')) +
        '<br><small>' + esc(err.message) + '</small></div>';
    }
  }

  function buildCategoryOptions() {
    const cats = Array.from(new Set(allItems.map(i => i.category).filter(Boolean))).sort();
    const current = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">' + esc(t('all_categories')) + '</option>' +
      cats.map(c => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
    categoryFilter.value = current;
  }

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const cat = categoryFilter.value;
    return allItems.filter(item => {
      if (cat && item.category !== cat) return false;
      if (!q) return true;
      const hay = [item.name, item.owner, item.category, item.description]
        .join(' ').toLowerCase();
      return hay.indexOf(q) > -1;
    });
  }

  function render() {
    setBrand();
    const items = getFiltered();
    countBadge.textContent = t('total_count') + ' ' + items.length + ' ' + t('items');

    if (allItems.length === 0) {
      contentEl.innerHTML = '<div class="state">' + esc(t('no_data')) + '</div>';
      return;
    }
    if (items.length === 0) {
      contentEl.innerHTML = '<div class="state">' + esc(t('no_result')) + '</div>';
      return;
    }

    contentEl.innerHTML = '<div class="grid">' + items.map(cardHtml).join('') + '</div>';
    bindCardEvents();
  }

  function cardHtml(item) {
    const archived = item.status === 'archived';
    const statusLabel = archived ? t('status_archived') : t('status_active');
    const meta = [];
    if (item.owner) meta.push('👤 ' + esc(item.owner));
    if (item.category) meta.push('🏷️ ' + esc(item.category));

    return '' +
      '<div class="card">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">' +
          '<h3>' + esc(item.name) + '</h3>' +
          '<span class="tag ' + (archived ? 'archived' : '') + '">' + esc(statusLabel) + '</span>' +
        '</div>' +
        (meta.length ? '<div class="meta">' + meta.join('') + '</div>' : '') +
        (item.description ? '<div class="desc">' + esc(item.description) + '</div>' : '') +
        '<div class="card-actions">' +
          (item.webAppUrl ? '<a class="btn btn-primary btn-sm" href="' + esc(item.webAppUrl) + '" target="_blank" rel="noopener">🔗 ' + esc(t('open_webapp')) + '</a>' : '') +
          (item.sheetUrl ? '<a class="btn btn-sm" href="' + esc(item.sheetUrl) + '" target="_blank" rel="noopener">📊 ' + esc(t('open_sheet')) + '</a>' : '') +
          (item.webAppUrl ? '<button class="btn btn-sm act-qr" data-url="' + esc(item.webAppUrl) + '" data-name="' + esc(item.name) + '">▦ ' + esc(t('show_qr')) + '</button>' : '') +
          (item.webAppUrl ? '<button class="btn btn-sm act-copy" data-url="' + esc(item.webAppUrl) + '">⧉ ' + esc(t('copy_link')) + '</button>' : '') +
        '</div>' +
      '</div>';
  }

  function bindCardEvents() {
    contentEl.querySelectorAll('.act-qr').forEach(btn => {
      btn.addEventListener('click', () => QR.show(btn.dataset.url, btn.dataset.name));
    });
    contentEl.querySelectorAll('.act-copy').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.url);
          showToast(t('copied'));
        } catch (e) {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = btn.dataset.url;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast(t('copied'));
        }
      });
    });
  }

  // ---------- init ----------
  document.addEventListener('DOMContentLoaded', () => {
    applyI18n();
    setBrand();
    document.getElementById('langBtn').addEventListener('click', toggleLang);
    searchInput.addEventListener('input', render);
    categoryFilter.addEventListener('change', render);
    document.addEventListener('langchange', () => { buildCategoryOptions(); render(); });
    load();
  });
})();
