/**
 * admin.js — ตรรกะหน้าแอดมิน: ล็อกอิน (ตรวจรหัสฝั่ง Apps Script) + CRUD + ส่งออก CSV
 * รหัสผ่านเก็บใน sessionStorage ระหว่างใช้งาน (ล้างเมื่อปิดแท็บ)
 */
(function () {
  let allItems = [];
  let password = sessionStorage.getItem('admin_pw') || '';

  const $ = id => document.getElementById(id);
  const loginView = $('loginView');
  const adminView = $('adminView');
  const tableArea = $('tableArea');
  const searchInput = $('searchInput');
  const countBadge = $('countBadge');
  const formModal = $('formModal');

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function showToast(msg, isError) {
    const toast = $('toast');
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => { toast.className = 'toast'; }, 2000);
  }

  function setBrand() {
    const cfg = window.APP_CONFIG || {};
    const name = window.CURRENT_LANG === 'en' ? cfg.APP_NAME_EN : cfg.APP_NAME_TH;
    if (name) $('brandName').textContent = name;
  }

  // ---------- Auth ----------
  async function doLogin() {
    const pw = $('passwordInput').value;
    if (!pw) return;
    $('loginBtn').disabled = true;
    try {
      await API.login(pw);
      password = pw;
      sessionStorage.setItem('admin_pw', pw);
      enterAdmin();
    } catch (err) {
      showToast(err.message === 'UNAUTHORIZED' ? t('wrong_password') : err.message, true);
    } finally {
      $('loginBtn').disabled = false;
    }
  }

  function logout() {
    password = '';
    sessionStorage.removeItem('admin_pw');
    adminView.classList.add('hidden');
    $('logoutBtn').classList.add('hidden');
    loginView.classList.remove('hidden');
    $('passwordInput').value = '';
  }

  async function enterAdmin() {
    loginView.classList.add('hidden');
    adminView.classList.remove('hidden');
    $('logoutBtn').classList.remove('hidden');
    await load();
  }

  // ---------- Data ----------
  async function load() {
    tableArea.innerHTML = '<div class="state"><div class="spinner"></div><div>' + esc(t('loading')) + '</div></div>';
    try {
      allItems = await API.list();
      buildCatList();
      render();
    } catch (err) {
      tableArea.innerHTML = '<div class="state">' + esc(t('error_load')) + '<br><small>' + esc(err.message) + '</small></div>';
    }
  }

  function buildCatList() {
    const cats = Array.from(new Set(allItems.map(i => i.category).filter(Boolean))).sort();
    $('catList').innerHTML = cats.map(c => '<option value="' + esc(c) + '">').join('');
  }

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(i =>
      [i.name, i.owner, i.category, i.description].join(' ').toLowerCase().indexOf(q) > -1
    );
  }

  function render() {
    setBrand();
    const items = getFiltered();
    countBadge.textContent = t('total_count') + ' ' + items.length + ' ' + t('items');

    if (items.length === 0) {
      tableArea.innerHTML = '<div class="state">' + esc(allItems.length ? t('no_result') : t('no_data')) + '</div>';
      return;
    }

    const rows = items.map(item => {
      const archived = item.status === 'archived';
      return '<tr>' +
        '<td>' + esc(item.name) + '</td>' +
        '<td>' + esc(item.category) + '</td>' +
        '<td>' + esc(item.owner) + '</td>' +
        '<td class="link-cell">' + (item.webAppUrl ? '<a href="' + esc(item.webAppUrl) + '" target="_blank" rel="noopener">' + esc(item.webAppUrl) + '</a>' : '-') + '</td>' +
        '<td><span class="tag ' + (archived ? 'archived' : '') + '">' + esc(archived ? t('status_archived') : t('status_active')) + '</span></td>' +
        '<td><div class="row-actions">' +
          (item.webAppUrl ? '<button class="btn btn-sm act-qr" data-id="' + esc(item.id) + '">QR</button>' : '') +
          '<button class="btn btn-sm act-edit" data-id="' + esc(item.id) + '">' + esc(t('edit')) + '</button>' +
          '<button class="btn btn-sm btn-danger act-del" data-id="' + esc(item.id) + '">' + esc(t('del')) + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');

    tableArea.innerHTML = '<div class="table-wrap"><table>' +
      '<thead><tr>' +
        '<th>' + esc(t('f_name')) + '</th>' +
        '<th>' + esc(t('f_category')) + '</th>' +
        '<th>' + esc(t('f_owner')) + '</th>' +
        '<th>' + esc(t('f_webapp')) + '</th>' +
        '<th>' + esc(t('f_status')) + '</th>' +
        '<th>' + esc(t('actions')) + '</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';

    bindRowEvents();
  }

  function bindRowEvents() {
    tableArea.querySelectorAll('.act-edit').forEach(b =>
      b.addEventListener('click', () => openForm(b.dataset.id)));
    tableArea.querySelectorAll('.act-del').forEach(b =>
      b.addEventListener('click', () => removeItem(b.dataset.id)));
    tableArea.querySelectorAll('.act-qr').forEach(b =>
      b.addEventListener('click', () => {
        const item = allItems.find(i => i.id === b.dataset.id);
        if (item) QR.show(item.webAppUrl, item.name);
      }));
  }

  // ---------- Form ----------
  function openForm(id) {
    const item = id ? allItems.find(i => i.id === id) : null;
    $('formTitle').textContent = item ? t('form_edit_title') : t('form_add_title');
    $('f_id').value = item ? item.id : '';
    $('f_name').value = item ? item.name : '';
    $('f_webAppUrl').value = item ? item.webAppUrl : '';
    $('f_sheetUrl').value = item ? item.sheetUrl : '';
    $('f_category').value = item ? item.category : '';
    $('f_owner').value = item ? item.owner : '';
    $('f_description').value = item ? item.description : '';
    $('f_status').value = item ? (item.status || 'active') : 'active';
    formModal.classList.remove('hidden');
    $('f_name').focus();
  }

  function closeForm() { formModal.classList.add('hidden'); }

  async function saveForm() {
    const payload = {
      id: $('f_id').value,
      name: $('f_name').value.trim(),
      webAppUrl: $('f_webAppUrl').value.trim(),
      sheetUrl: $('f_sheetUrl').value.trim(),
      category: $('f_category').value.trim(),
      owner: $('f_owner').value.trim(),
      description: $('f_description').value.trim(),
      status: $('f_status').value
    };
    if (!payload.name) { showToast(t('required_name'), true); return; }

    $('formSave').disabled = true;
    try {
      if (payload.id) {
        await API.update(payload, password);
      } else {
        await API.add(payload, password);
      }
      closeForm();
      showToast(t('saved'));
      await load();
    } catch (err) {
      showToast(err.message === 'UNAUTHORIZED' ? t('wrong_password') : (t('save_error') + ': ' + err.message), true);
    } finally {
      $('formSave').disabled = false;
    }
  }

  async function removeItem(id) {
    if (!confirm(t('confirm_delete'))) return;
    try {
      await API.remove(id, password);
      showToast(t('deleted'));
      await load();
    } catch (err) {
      showToast(err.message === 'UNAUTHORIZED' ? t('wrong_password') : err.message, true);
    }
  }

  // ---------- Export CSV ----------
  function exportCsv() {
    const headers = ['name', 'webAppUrl', 'sheetUrl', 'category', 'owner', 'description', 'status', 'createdAt', 'updatedAt'];
    const esc = v => '"' + String(v || '').replace(/"/g, '""') + '"';
    const lines = [headers.join(',')];
    allItems.forEach(i => lines.push(headers.map(h => esc(i[h])).join(',')));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'weblinks_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  // ---------- init ----------
  document.addEventListener('DOMContentLoaded', () => {
    applyI18n();
    setBrand();
    $('langBtn').addEventListener('click', toggleLang);
    document.addEventListener('langchange', () => { if (!adminView.classList.contains('hidden')) render(); });

    $('loginBtn').addEventListener('click', doLogin);
    $('passwordInput').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    $('logoutBtn').addEventListener('click', logout);

    $('addBtn').addEventListener('click', () => openForm(null));
    $('exportBtn').addEventListener('click', exportCsv);
    searchInput.addEventListener('input', render);

    $('formCancel').addEventListener('click', closeForm);
    $('formSave').addEventListener('click', saveForm);
    formModal.addEventListener('click', e => { if (e.target === formModal) closeForm(); });

    // ถ้ามีรหัสผ่านค้างใน session ให้ลองเข้าเลย
    if (password) {
      enterAdmin();
    }
  });
})();
