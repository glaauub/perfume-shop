/* Multi-WhatsApp floating widget — perfumeusa.top
 * Lists all store WhatsApp lines; clicking a row opens that chat.
 * Self-contained: injects its own styles + DOM so it works on every page.
 */
(function () {
  if (document.getElementById('wa-multi-widget')) return;

  var contacts = [
    { label: 'Serena', phone: '8619964046593', disp: '199 6404 6593' },
    { label: 'Sully', phone: '8618902245387', disp: '189 0224 5387' },
    { label: 'Tina', phone: '8613002039666', disp: '1300 2039 666' },
    { label: 'Sam', phone: '8613002039666', disp: '1300 2039 666' }
  ];

  var css =
    '#wa-multi-widget{position:fixed;right:18px;bottom:18px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}' +
    '#wa-multi-btn{width:58px;height:58px;border-radius:50%;background:#25D366;border:none;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s;}' +
    '#wa-multi-btn:hover{transform:scale(1.06);}' +
    '#wa-multi-btn svg{width:32px;height:32px;fill:#fff;}' +
    '#wa-multi-panel{position:absolute;right:0;bottom:72px;width:280px;max-width:84vw;background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.25);overflow:hidden;display:none;}' +
    '#wa-multi-panel.open{display:block;}' +
    '#wa-multi-head{background:#25D366;color:#fff;padding:14px 16px;font-size:15px;font-weight:700;}' +
    '#wa-multi-head small{display:block;font-weight:400;font-size:12px;opacity:.9;margin-top:2px;}' +
    '.wa-row{display:flex;align-items:center;gap:10px;padding:12px 16px;text-decoration:none;color:#222;border-bottom:1px solid #f0f0f0;}' +
    '.wa-row:last-child{border-bottom:none;}' +
    '.wa-row:hover{background:#f6fff9;}' +
    '.wa-row .wa-ico{width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;}' +
    '.wa-row .wa-ico svg{width:20px;height:20px;fill:#fff;}' +
    '.wa-row .wa-txt{display:flex;flex-direction:column;line-height:1.25;}' +
    '.wa-row .wa-label{font-size:14px;font-weight:600;}' +
    '.wa-row .wa-num{font-size:12px;color:#777;}' +
    '@media(max-width:480px){#wa-multi-widget{right:12px;bottom:12px;}}';

  var head =
    '<style>' + css + '</style>' +
    '<div id="wa-multi-widget">' +
    '<div id="wa-multi-panel" role="dialog" aria-label="WhatsApp contacts">' +
    '<div id="wa-multi-head">WhatsApp<small>Tap a line to chat</small></div>' +
    contacts.map(function (c) {
      return '<a class="wa-row" href="https://api.whatsapp.com/send?phone=' + c.phone + '" target="_blank" rel="noopener">' +
        '<span class="wa-ico"><svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.523 5.263l-.999 3.648 3.965-1.04zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></span>' +
        '<span class="wa-txt"><span class="wa-label">' + c.label + '</span><span class="wa-num">' + c.disp + '</span></span>' +
        '</a>';
    }).join('') +
    '</div>' +
    '<button id="wa-multi-btn" aria-label="Open WhatsApp contacts">' +
    '<svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.523 5.263l-.999 3.648 3.965-1.04zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>' +
    '</button>' +
    '</div>';

  document.body.insertAdjacentHTML('beforeend', head);

  var btn = document.getElementById('wa-multi-btn');
  var panel = document.getElementById('wa-multi-panel');
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', function (e) {
    if (!document.getElementById('wa-multi-widget').contains(e.target)) {
      panel.classList.remove('open');
    }
  });
})();
