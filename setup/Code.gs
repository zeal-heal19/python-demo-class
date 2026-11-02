// Saves demo class registrations to the Google Sheet this script is attached to.
const HEADERS = ["Registered at", "Name", "Phone", "Email", "Interested after demo"];
const INTEREST_OPTIONS = ["Yes", "Maybe", "Demo only"];

// A leading apostrophe stops Sheets from running submitted text as a formula.
function asText(value) {
  return "'" + String(value || "").trim().slice(0, 150);
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const form = e.parameter;
  // Only bots fill in the hidden "website" field, so report success and save nothing.
  if (form.website) return reply({ ok: true });

  const phone = String(form.phone || "").replace(/[\s-]/g, "");
  const email = String(form.email || "").trim();
  if (String(form.name || "").trim().length < 2
      || !/^(?:\+?91|0)?[6-9]\d{9}$/.test(phone)
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || !INTEREST_OPTIONS.includes(form.interest)) {
    return reply({ ok: false, error: "invalid" });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([new Date(), asText(form.name), asText(phone), asText(email), form.interest]);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}
