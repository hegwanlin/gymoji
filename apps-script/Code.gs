/**
 * Gymoji TestFlight 申請表單的後端。
 * 綁定在 Google 試算表上，部署為「網頁應用程式」。
 * 每筆申請會寫進「申請名單」工作表，並寄一封通知信給你。
 */

var SHEET_NAME = '申請名單';
var HEADERS = ['時間', 'Email', '稱呼', '裝置與 iOS 版本', '狀態'];

function doGet() {
  return reply_('ok');
}

function doPost(e) {
  var p = (e && e.parameter) || {};

  // 防垃圾訊息：真人看不到這個欄位，機器人通常會填
  if (p.website) return reply_('ok');

  var email = String(p.email || '').trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply_('invalid');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    // 同一個 email 只記錄一次
    if (sheet.getLastRow() > 1) {
      var existing = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).toLowerCase() === email) return reply_('duplicate');
      }
    }

    sheet.appendRow([
      new Date(),
      email,
      safe_(p.name, 60),
      safe_(p.device, 80),
      '待處理'
    ]);

    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      'Gymoji TestFlight 新申請',
      email + ' 申請加入 TestFlight。\n\n' + ss.getUrl()
    );
  } finally {
    lock.unlock();
  }
  return reply_('ok');
}

// 避免內容被試算表當成公式執行（開頭是 = + - @ 的文字）
function safe_(value, max) {
  var text = String(value || '').trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply_(status) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: status }))
    .setMimeType(ContentService.MimeType.JSON);
}
