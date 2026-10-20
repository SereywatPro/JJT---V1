/**
 * TTJ – Tracking Journal Trading
 * Google Apps Script Web App
 *
 * Deploy: Extensions → Apps Script → Deploy → New deployment
 *   Type: Web app
 *   Execute as: Me
 *   Who has access: Only myself
 *
 * All operations are dispatched through doPost(e).
 * doGet(e) returns a health-check JSON so you can verify deployment.
 */

var SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// ─── Sheet names ──────────────────────────────────────────────────────────────
var TRADES_SHEET      = 'Trades';
var REVIEW_SHEET      = 'Daily_Review';
var SETTINGS_SHEET    = 'Settings';

// ─── Security ─────────────────────────────────────────────────────────────────
// Set your secret API key below. Keep this secret!
// Must match what you type in TTJ's login screen.
var SECRET_API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY') || 'change_this_to_your_strong_secret_key';

// ─── Trades columns (1-indexed) ───────────────────────────────────────────────
var TRADE_COLS = [
  'trade_id', 'date_open', 'date_close', 'symbol', 'market',
  'direction', 'setup', 'timeframe', 'entry_price', 'stop_loss',
  'take_profit', 'exit_price', 'position_size', 'fees', 'account_balance',
  'risk_amount', 'pnl', 'r_multiple', 'result', 'emotion',
  'followed_plan', 'mistake_tags', 'notes', 'screenshot_url'
];

// ─── Health check ─────────────────────────────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'TTJ GAS v1' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var action = body.action;
    var apiKey = body.apiKey;
    var payload = body.payload || {};

    // Validate Secret API Key
    if (!apiKey || apiKey !== SECRET_API_KEY) {
      return jsonResponse({ success: false, error: 'Unauthorized: Invalid or missing API key' });
    }

    var result;

    switch (action) {
      case 'ping':              result = { status: 'authorized' };       break;
      case 'getTrades':         result = getTrades();                    break;
      case 'addTrade':          result = addTrade(payload);              break;
      case 'updateTrade':       result = updateTrade(payload);           break;
      case 'deleteTrade':       result = deleteTrade(payload.trade_id);  break;
      case 'getDailyReviews':   result = getDailyReviews();              break;
      case 'addDailyReview':    result = addDailyReview(payload);        break;
      case 'updateDailyReview': result = updateDailyReview(payload);     break;
      case 'getSettings':       result = getSettings();                  break;
      case 'updateSettings':    result = updateSettings(payload);        break;
      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }

    return jsonResponse({ success: true, data: result });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Trades ───────────────────────────────────────────────────────────────────

function getTrades() {
  var sheet = getSheet(TRADES_SHEET);
  var rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  return rows.slice(1).map(function(row) {
    return rowToObject(headers, row);
  });
}

function addTrade(payload) {
  var sheet = getSheet(TRADES_SHEET);
  ensureHeaders(sheet, TRADE_COLS);
  // Generate unique id
  payload.trade_id = 'TRD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  var row = TRADE_COLS.map(function(col) {
    var val = payload[col];
    if (col === 'followed_plan') return val ? 'Yes' : 'No';
    if (col === 'mistake_tags') return Array.isArray(val) ? val.join(', ') : (val || '');
    return val !== undefined && val !== null ? val : '';
  });
  sheet.appendRow(row);
  return { trade_id: payload.trade_id };
}

function updateTrade(payload) {
  var sheet = getSheet(TRADES_SHEET);
  var rowIdx = findRowByTradeId(sheet, payload.trade_id);
  if (rowIdx === -1) throw new Error('Trade not found: ' + payload.trade_id);
  var row = TRADE_COLS.map(function(col) {
    var val = payload[col];
    if (col === 'followed_plan') return val ? 'Yes' : 'No';
    if (col === 'mistake_tags') return Array.isArray(val) ? val.join(', ') : (val || '');
    return val !== undefined && val !== null ? val : '';
  });
  sheet.getRange(rowIdx, 1, 1, row.length).setValues([row]);
  return { trade_id: payload.trade_id };
}

function deleteTrade(tradeId) {
  var sheet = getSheet(TRADES_SHEET);
  var rowIdx = findRowByTradeId(sheet, tradeId);
  if (rowIdx === -1) throw new Error('Trade not found: ' + tradeId);
  sheet.deleteRow(rowIdx);
  return { deleted: tradeId };
}

function findRowByTradeId(sheet, tradeId) {
  var col1 = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (var i = 1; i < col1.length; i++) {
    if (String(col1[i][0]) === String(tradeId)) return i + 1;
  }
  return -1;
}

// ─── Daily Review ─────────────────────────────────────────────────────────────

var REVIEW_COLS = ['date', 'mood', 'trades_count', 'daily_pnl', 'went_well', 'to_improve', 'plan_tomorrow'];

function getDailyReviews() {
  var sheet = getSheet(REVIEW_SHEET);
  var rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  return rows.slice(1).map(function(row) { return rowToObject(headers, row); });
}

function addDailyReview(payload) {
  var sheet = getSheet(REVIEW_SHEET);
  ensureHeaders(sheet, REVIEW_COLS);
  var row = REVIEW_COLS.map(function(col) {
    return payload[col] !== undefined ? payload[col] : '';
  });
  sheet.appendRow(row);
  return { date: payload.date };
}

function updateDailyReview(payload) {
  var sheet = getSheet(REVIEW_SHEET);
  var rows  = sheet.getDataRange().getValues();
  var rowIdx = -1;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(payload.date)) { rowIdx = i + 1; break; }
  }
  if (rowIdx === -1) return addDailyReview(payload);
  var row = REVIEW_COLS.map(function(col) {
    return payload[col] !== undefined ? payload[col] : '';
  });
  sheet.getRange(rowIdx, 1, 1, row.length).setValues([row]);
  return { date: payload.date };
}

// ─── Settings ─────────────────────────────────────────────────────────────────

var SETTINGS_COLS = ['key', 'value'];

function getSettings() {
  var sheet = getSheet(SETTINGS_SHEET);
  var rows  = sheet.getDataRange().getValues();
  var obj   = {};
  for (var i = 1; i < rows.length; i++) {
    obj[String(rows[i][0])] = rows[i][1];
  }
  return obj;
}

function updateSettings(payload) {
  var sheet = getSheet(SETTINGS_SHEET);
  ensureHeaders(sheet, SETTINGS_COLS);
  // Clear existing data rows
  var last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, 2).clearContent();
  // Write new settings
  var rows = Object.entries(payload).map(function(pair) { return [pair[0], pair[1]]; });
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  return { updated: true };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSheet(name) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ensureHeaders(sheet, cols) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cols);
  } else {
    var existing = sheet.getRange(1, 1, 1, cols.length).getValues()[0];
    var allEmpty = existing.every(function(v) { return v === ''; });
    if (allEmpty) sheet.getRange(1, 1, 1, cols.length).setValues([cols]);
  }
}

function rowToObject(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) {
    var val = row[i];
    // Parse comma-separated arrays for mistake_tags
    if (h === 'mistake_tags') {
      obj[h] = val ? String(val).split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
    } else if (h === 'followed_plan') {
      obj[h] = String(val).toLowerCase() === 'yes' || val === true;
    } else if (val instanceof Date) {
      obj[h] = val.toISOString();
    } else {
      obj[h] = val;
    }
  });
  return obj;
}
