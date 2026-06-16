/**
 * qr.js — สร้าง QR Code จากลิงค์อัตโนมัติ + ดาวน์โหลดเป็น PNG
 * ใช้ไลบรารี qrcodejs (โหลดผ่าน CDN ใน HTML)
 */
const QR = (function () {
  let modal, qrBox, titleEl, urlEl, downloadBtn, currentName = 'qrcode';

  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'qr-modal hidden';
    modal.innerHTML =
      '<div class="qr-dialog">' +
      '  <h3 class="qr-title"></h3>' +
      '  <div class="qr-canvas"></div>' +
      '  <div class="qr-url"></div>' +
      '  <div class="qr-actions">' +
      '    <button class="btn btn-primary qr-download"></button>' +
      '    <button class="btn qr-close"></button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(modal);

    qrBox = modal.querySelector('.qr-canvas');
    titleEl = modal.querySelector('.qr-title');
    urlEl = modal.querySelector('.qr-url');
    downloadBtn = modal.querySelector('.qr-download');

    modal.querySelector('.qr-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    downloadBtn.addEventListener('click', download);
  }

  function show(url, name) {
    ensureModal();
    currentName = (name || 'qrcode').replace(/[^\w฀-๿\-]+/g, '_');
    qrBox.innerHTML = '';
    titleEl.textContent = name || '';
    urlEl.textContent = url;
    downloadBtn.textContent = t('download_qr');
    modal.querySelector('.qr-close').textContent = t('close');

    // สร้าง QR ใหม่ (qrcodejs จะวาดลง qrBox)
    new QRCode(qrBox, {
      text: url,
      width: 240,
      height: 240,
      correctLevel: QRCode.CorrectLevel.M
    });

    modal.classList.remove('hidden');
  }

  function close() {
    if (modal) modal.classList.add('hidden');
  }

  function download() {
    // qrcodejs สร้างทั้ง <canvas> และ <img> — ใช้อันใดอันหนึ่งที่มี
    const canvas = qrBox.querySelector('canvas');
    let dataUrl;
    if (canvas) {
      dataUrl = canvas.toDataURL('image/png');
    } else {
      const img = qrBox.querySelector('img');
      if (!img) return;
      dataUrl = img.src;
    }
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = currentName + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return { show: show, close: close };
})();
