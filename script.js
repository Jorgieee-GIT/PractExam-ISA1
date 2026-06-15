'use strict';
const STORAGE_KEY = 'legDocs_v1';
let records      = [];
let pendingDelId = null;

/*  
 * DOCU: This functiopn serves as the code for initializing local storage po
 *        then displays po the records na nilagay naten sa wedsite.
 *  
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    records = Array.isArray(parsed) ? parsed : [];
  } catch {
    records = [];
  }
}

/*  
 * DOCU: This functiopn po catches any error if meron magpakita
 *  
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    showToast('Storage error: could not save data.', 'error');
  }
}

/*  
 * DOCU: This functiopnpo serves as auto increment sa Document number although
 *        not mandatory it would make the saving of information efficient.
 * @param String type - veverify nya po if it is Ordinance or a Resolution.
 * @returns int - it returns po ng integer for the Document number.
 * 
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
function generateNextNumber(type) {
  const year = new Date().getFullYear();
  const sameType = records.filter(r => r.type === type);

  const maxSeq = sameType.reduce((max, r) => {
    const match = r.documentNumber.match(/^(\d{4})-\d{4}$/);
    if (match) {
      const seq = parseInt(match[1], 10);
      return seq > max ? seq : max;
    }
    return max;
  }, 0);

  const next = String(maxSeq + 1).padStart(4, '0');
  return `${next}-${year}`;
}

/*  
 * DOCU: This function po displays the information stored on the local storage
 *       whether you want it filtered or not, if gusto nyo po idisplay all types
 *       or just the Resolutions or just Ordinance.
 *        
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
function renderTable() {
  const tbody      = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const tableEl    = document.getElementById('docTable');
  const query      = document.getElementById('searchInput').value.trim().toLowerCase();
  const typeFilter = document.getElementById('filterType').value;


  const filtered = records.filter(r => {
    const matchSearch =
      r.documentNumber.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query);
    const matchType = !typeFilter || r.type === typeFilter;
    return matchSearch && matchType;
  });
  document.getElementById('statTotal').textContent =
    `Total: ${records.length}`;
  document.getElementById('statOrd').textContent =
    `Ordinances: ${records.filter(r => r.type === 'Ordinance').length}`;
  document.getElementById('statRes').textContent =
    `Resolutions: ${records.filter(r => r.type === 'Resolution').length}`;

  if (filtered.length === 0) {
    tableEl.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  tableEl.classList.remove('hidden');
  emptyState.classList.add('hidden');

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.datePassed) - new Date(a.datePassed)
  );

  tbody.innerHTML = sorted.map(r => {
    const badgeClass = r.type === 'Ordinance'
      ? 'badge badge-ordinance'
      : 'badge badge-resolution';

    return `
      <tr>
        <td><span class="${badgeClass}">${escHtml(r.type)}</span></td>
        <td><strong>${escHtml(r.documentNumber)}</strong></td>
        <td>${escHtml(r.title)}</td>
        <td>${formatDate(r.datePassed)}</td>
        <td>${escHtml(r.author)}</td>
        <td>
          <div class="actions-cell">
            <button class="act-btn act-view"   onclick="openView(${r.id})"   aria-label="View record">View</button>
            <button class="act-btn act-edit"   onclick="openEdit(${r.id})"   aria-label="Edit record">Edit</button>
            <button class="act-btn act-delete" onclick="openDelete(${r.id})" aria-label="Delete record">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/*  
 * DOCU: This naman po is the modal for adding documents it will pop
 *      a modal po to inpute required infos
 *        
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
function openAdd() {
  resetForm();
  document.getElementById('modalHeading').textContent = 'Add Document';
  document.getElementById('autoLabel').textContent = 'Auto-filled on type select';
  openOverlay('editOverlay');
}

/*  
 * DOCU: This funtion naman po is for the edit modal so thhat when you
 *      click edit, it will pop a modal for it
 *        
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
function openEdit(id) {
  const rec = records.find(r => r.id === id);
  if (!rec) return;

  resetForm();
  document.getElementById('modalHeading').textContent = 'Edit Document';
  document.getElementById('recId').value         = rec.id;
  document.getElementById('fType').value         = rec.type;
  document.getElementById('fNum').value          = rec.documentNumber;
  document.getElementById('fTitle').value        = rec.title;
  document.getElementById('fDate').value         = rec.datePassed;
  document.getElementById('fAuthor').value       = rec.author;
  document.getElementById('fNum').readOnly       = false;
  document.getElementById('autoLabel').textContent = 'Editable';

  openOverlay('editOverlay');
}

/*  
 * DOCU: This function po is for saving records or updating it
 *        
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
function saveRecord() {
  clearFieldErrors();
  const errEl = document.getElementById('formError');
  errEl.hidden = true;

  const id     = document.getElementById('recId').value;
  const type   = document.getElementById('fType').value.trim();
  const num    = document.getElementById('fNum').value.trim();
  const title  = document.getElementById('fTitle').value.trim();
  const date   = document.getElementById('fDate').value;
  const author = document.getElementById('fAuthor').value.trim();

  const errors = [];

  if (!type)   { errors.push('Document type is required.');   markError('fType'); }
  if (!num)    { errors.push('Document number is required.'); markError('fNum'); }
  if (!title)  { errors.push('Title is required.');           markError('fTitle'); }
  if (!date)   { errors.push('Date passed is required.');     markError('fDate'); }
  if (!author) { errors.push('Author / Sponsor is required.'); markError('fAuthor'); }

  if (!errors.length && !/^\d{4}-\d{4}$/.test(num)) {
    errors.push('Document number must follow the format 0001-2026.');
    markError('fNum');
  }

  /*  
 * DOCU: This function po checks for duplicate document numberrs
 *        
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
  if (!errors.length) {
    const duplicate = records.find(r =>
      r.type === type &&
      r.documentNumber === num &&
      String(r.id) !== String(id)
    );
    if (duplicate) {
      errors.push(`A ${type} with document number "${num}" already exists.`);
      markError('fNum');
    }
  }

  if (errors.length) {
    errEl.innerHTML = errors.map(e => `• ${e}`).join('<br>');
    errEl.hidden = false;
    return;
  }

  if (id) {
    const rec = records.find(r => String(r.id) === String(id));
    rec.type           = type;
    rec.documentNumber = num;
    rec.title          = title;
    rec.datePassed     = date;
    rec.author         = author;
    showToast('Record updated successfully.', 'success');
  } else {
    records.push({
      id:             Date.now(),
      type,
      documentNumber: num,
      title,
      datePassed:     date,
      author,
    });
    showToast('Record added successfully.', 'success');
  }

  saveToStorage();
  renderTable();
  closeOverlay('editOverlay');
}

/*  
 * DOCU: This function lets you view the modal po for more inforamtions
 *        
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */

function openView(id) {
  const rec = records.find(r => r.id === id);
  if (!rec) return;

  const badgeClass = rec.type === 'Ordinance'
    ? 'badge badge-ordinance'
    : 'badge badge-resolution';

  document.getElementById('viewBody').innerHTML = `
    <div class="view-row">
      <span class="view-label">Type</span>
      <span class="view-value"><span class="${badgeClass}">${escHtml(rec.type)}</span></span>
    </div>
    <div class="view-row">
      <span class="view-label">Document No.</span>
      <span class="view-value">${escHtml(rec.documentNumber)}</span>
    </div>
    <div class="view-row">
      <span class="view-label">Title</span>
      <span class="view-value">${escHtml(rec.title)}</span>
    </div>
    <div class="view-row">
      <span class="view-label">Date Passed</span>
      <span class="view-value">${formatDate(rec.datePassed)}</span>
    </div>
    <div class="view-row">
      <span class="view-label">Author / Sponsor</span>
      <span class="view-value">${escHtml(rec.author)}</span>
    </div>
    <div class="view-row">
      <span class="view-label">Record ID</span>
      <span class="view-value" style="font-size:11px;color:#aaa;">${rec.id}</span>
    </div>
  `;

  openOverlay('viewOverlay');
}

/*  
 * DOCU: This function is a modal for deleting infos stored po
 *        
 * Last Updated: 2026-06-15
 * Author: Jorge Jose Abenojar
 * Last Updated By: Jorge Jose Abenojar
 */
function openDelete(id) {
  const rec = records.find(r => r.id === id);
  if (!rec) return;

  pendingDelId = id;
  document.getElementById('deleteMsg').textContent =
    `Are you sure you want to permanently delete "${rec.documentNumber} — ${rec.title}"? This action cannot be undone.`;
  openOverlay('deleteOverlay');
}

function confirmDelete() {
  if (pendingDelId === null) return;

  records = records.filter(r => r.id !== pendingDelId);
  pendingDelId = null;

  saveToStorage();
  renderTable();
  closeOverlay('deleteOverlay');
  showToast('Record deleted.', 'info');
}
function openOverlay(id)  { document.getElementById(id).classList.add('open'); }
function closeOverlay(id) { document.getElementById(id).classList.remove('open'); }

function resetForm() {
  document.getElementById('recId').value   = '';
  document.getElementById('fType').value   = '';
  document.getElementById('fNum').value    = '';
  document.getElementById('fTitle').value  = '';
  document.getElementById('fDate').value   = '';
  document.getElementById('fAuthor').value = '';
  document.getElementById('fNum').readOnly = true;
  document.getElementById('formError').hidden = true;
  clearFieldErrors();
}

function markError(fieldId) {
  document.getElementById(fieldId).classList.add('field-error');
}

function clearFieldErrors() {
  ['fType','fNum','fTitle','fDate','fAuthor'].forEach(id => {
    document.getElementById(id).classList.remove('field-error');
  });
}


document.getElementById('fType').addEventListener('change', function () {
  const isAdd = !document.getElementById('recId').value;
  if (isAdd && this.value) {
    document.getElementById('fNum').value    = generateNextNumber(this.value);
    document.getElementById('fNum').readOnly = false;
    document.getElementById('autoLabel').textContent = 'Auto-filled, editable';
  } else if (!this.value) {
    document.getElementById('fNum').value    = '';
    document.getElementById('fNum').readOnly = true;
    document.getElementById('autoLabel').textContent = 'Auto-filled';
  }
});


document.getElementById('searchInput').addEventListener('input', renderTable);
document.getElementById('filterType').addEventListener('change', renderTable);
document.getElementById('addBtn').addEventListener('click', openAdd);
document.getElementById('editCloseBtn').addEventListener('click',   () => closeOverlay('editOverlay'));
document.getElementById('editCancelBtn').addEventListener('click',  () => closeOverlay('editOverlay'));
document.getElementById('saveBtn').addEventListener('click', saveRecord);
document.getElementById('viewCloseBtn').addEventListener('click',   () => closeOverlay('viewOverlay'));
document.getElementById('viewCancelBtn').addEventListener('click',  () => closeOverlay('viewOverlay'));
document.getElementById('deleteCloseBtn').addEventListener('click',   () => closeOverlay('deleteOverlay'));
document.getElementById('deleteCancelBtn').addEventListener('click',  () => closeOverlay('deleteOverlay'));
document.getElementById('deleteConfirmBtn').addEventListener('click', confirmDelete);
['editOverlay','viewOverlay','deleteOverlay'].forEach(id => {
  document.getElementById(id).addEventListener('click', function (e) {
    if (e.target === this) closeOverlay(id);
  });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['editOverlay','viewOverlay','deleteOverlay'].forEach(id => closeOverlay(id));
  }
});

let toastTimer = null;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = `toast toast-${type} show`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-PH', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });
}
loadFromStorage();
document.getElementById('fDate').max =
  new Date().toISOString().split('T')[0];
renderTable();
