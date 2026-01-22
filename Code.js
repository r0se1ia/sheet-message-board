/**
 * Google Apps Script - 留言板後端服務
 * 
 * 功能說明：
 * - 處理留言的新增、讀取、刪除（軟刪除）
 * - 使用 Google Sheets 作為資料庫
 * - 支援 RESTful API 介面
 * 
 * 使用步驟：
 * 1. 在 Google Sheets 中創建試算表，工作表名稱設為 "Messages"
 * 2. 在第一行設置標題：Id, Timestamp, Name, Message, Source, IsDeleted
 * 3. 將此腳本部署為 Web App（執行身份：我，權限：所有人）
 * 4. 將部署後的 URL 更新到 index.html 中的 API_URL
 */

// 工作表名稱（必須與 Google Sheets 中的工作表名稱一致）
const SHEET_NAME = "Messages";

// 最多讀取的留言數量（避免資料過多造成效能問題）
const MAX_READ = 50;

/**
 * 處理 GET 請求 - 讀取留言列表
 * @param {Object} e - 事件物件，包含請求參數
 * @returns {TextOutput} JSON 格式的響應
 */
function doGet(e) {
  // 取得 action 參數，預設為 "list"
  const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action) : "list";
  
  // 目前只支援 list 操作
  if (action !== "list") return json_({ ok: false, error: "Unsupported action" });

  // 取得當前試算表中的指定工作表
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return json_({ ok: false, error: "Sheet not found: " + SHEET_NAME });

  // 取得所有資料範圍的值
  const values = sheet.getDataRange().getValues();
  
  // 如果只有標題行或沒有資料，返回空陣列
  if (values.length <= 1) return json_({ ok: true, items: [] });

  // 將第一行轉換為標題陣列（欄位名稱）
  const header = values[0].map(h => String(h));
  
  // 過濾掉完全空白的資料列
  const rows = values.slice(1).filter(r => r.some(v => v !== ""));

  // 將每一列轉換為物件，並過濾已刪除的留言（IsDeleted = TRUE）
  const items = rows.map(r => {
    const obj = {};
    // 根據標題將每一列的值對應到物件屬性
    for (let i = 0; i < header.length; i++) obj[header[i]] = r[i];
    return obj;
  }).filter(x => String(x["IsDeleted"] || "").toUpperCase() !== "TRUE");

  // 按時間戳記排序，最新的在前（降序）
  items.sort((a, b) => {
    const ta = new Date(a["Timestamp"] || 0).getTime();
    const tb = new Date(b["Timestamp"] || 0).getTime();
    return tb - ta; // 降序排列
  });

  // 限制返回數量，避免資料過多
  return json_({ ok: true, items: items.slice(0, MAX_READ) });
}

/**
 * 處理 POST 請求 - 新增或刪除留言
 * @param {Object} e - 事件物件，包含請求資料
 * @returns {TextOutput} JSON 格式的響應
 */
function doPost(e) {
  try {
    // 取得當前試算表中的指定工作表
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return json_({ ok: false, error: "Sheet not found: " + SHEET_NAME });

    // 解析 POST 請求的 JSON 資料
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "";
    const data = raw ? JSON.parse(raw) : {};
    
    // 取得操作類型，預設為 "add"（新增）
    const action = data.action ? String(data.action) : "add";

    // 根據 action 執行對應的操作
    if (action === "add") return add_(sheet, data);
    if (action === "delete") return softDelete_(sheet, data);

    // 不支援的操作類型
    return json_({ ok: false, error: "Unsupported action" });
  } catch (err) {
    // 捕獲所有錯誤並返回錯誤訊息
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * 新增留言
 * @param {Sheet} sheet - Google Sheets 工作表物件
 * @param {Object} data - 留言資料物件，包含 name, message, source
 * @returns {TextOutput} JSON 格式的響應，成功時包含新建立的 id
 */
function add_(sheet, data) {
  // 清理並限制長度：暱稱最多 50 字元，留言最多 1000 字元，來源最多 100 字元
  const name = safeText_(data.name, 50) || "匿名";
  const message = safeText_(data.message, 1000);
  const source = safeText_(data.source, 100) || "";

  // 驗證留言內容不能為空
  if (!message) return json_({ ok: false, error: "Message is required" });

  // 產生唯一識別碼（UUID）
  const id = Utilities.getUuid();
  
  // 寫入資料到工作表
  // 欄位順序：Id, Timestamp, Name, Message, Source, IsDeleted
  sheet.appendRow([id, new Date(), name, message, source, false]);

  // 返回成功響應，包含新建立的 id
  return json_({ ok: true, id });
}

/**
 * 軟刪除留言（將 IsDeleted 設為 TRUE，不實際刪除資料）
 * @param {Sheet} sheet - Google Sheets 工作表物件
 * @param {Object} data - 包含 id 的資料物件
 * @returns {TextOutput} JSON 格式的響應
 */
function softDelete_(sheet, data) {
  // 取得並驗證 id
  const id = safeText_(data.id, 80);
  if (!id) return json_({ ok: false, error: "Id is required" });

  // 取得所有資料
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return json_({ ok: false, error: "No data" });

  // 取得標題行，找出 Id 和 IsDeleted 欄位的索引
  const header = values[0].map(h => String(h));
  const idCol = header.indexOf("Id");
  const delCol = header.indexOf("IsDeleted");
  
  // 驗證必要的欄位是否存在
  if (idCol === -1 || delCol === -1) {
    return json_({ ok: false, error: "Missing Id/IsDeleted columns" });
  }

  // 從第 2 列開始搜尋（第 1 列是標題）
  for (let i = 1; i < values.length; i++) {
    // 找到匹配的 id
    if (String(values[i][idCol]) === id) {
      // 將 IsDeleted 設為 TRUE（注意：getRange 的列號從 1 開始，所以是 i+1）
      sheet.getRange(i + 1, delCol + 1).setValue(true);
      return json_({ ok: true });
    }
  }
  
  // 找不到對應的 id
  return json_({ ok: false, error: "Id not found" });
}

/**
 * 建立 JSON 格式的 HTTP 響應
 * @param {Object} obj - 要轉換為 JSON 的物件
 * @returns {TextOutput} 設定為 JSON MIME 類型的文字輸出
 */
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 安全地處理文字輸入，清理並限制長度
 * @param {*} v - 輸入值（可能是任何類型）
 * @param {number} maxLen - 最大長度限制
 * @returns {string} 清理後的文字，如果超過長度則截斷
 */
function safeText_(v, maxLen) {
  // 處理 null 或 undefined
  if (v === null || v === undefined) return "";
  
  // 轉換為字串並去除前後空白
  const s = String(v).trim();
  
  // 如果為空字串，直接返回
  if (!s) return "";
  
  // 如果超過最大長度，截斷
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}
