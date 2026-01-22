# Sheet Message Board 留言板

一個基於 Google Sheets 的簡單留言板系統，使用 Google Apps Script 作為後端，純前端 HTML/CSS/JavaScript 實現。

## ✨ 功能特色

- 📝 **留言功能**：支援匿名或具名留言，可選填來源/備註資訊
- 📋 **複製留言**：一鍵複製留言內容到剪貼板
- 🗑️ **刪除留言**：支援軟刪除功能（保留資料但標記為已刪除）
- 🔄 **自動刷新**：每 10 秒自動更新最新留言
- 🎨 **現代化 UI**：美觀的漸層背景和卡片式設計
- 📱 **響應式設計**：支援桌面和行動裝置
- ⚡ **即時更新**：手動刷新按鈕，隨時獲取最新內容

## 🛠️ 技術棧

- **前端**：HTML5、CSS3、Vanilla JavaScript
- **後端**：Google Apps Script
- **資料庫**：Google Sheets
- **部署**：靜態網站（GitHub Pages、Netlify、Vercel 等）

## 📋 前置需求

1. Google 帳號
2. Google Sheets 試算表
3. Google Apps Script 編輯器
4. 網頁伺服器（或使用 GitHub Pages 等靜態託管服務）

## 🚀 安裝與部署

### 步驟 1：建立 Google Sheet

1. 建立新的 Google Sheets 試算表
2. 將工作表重新命名為 **Messages**
3. 在第一行（標題行）設置以下欄位：

   ```text
   Id | Timestamp | Name | Message | Source | IsDeleted
   ```

### 步驟 2：設定 Google Apps Script

1. 在試算表中，點擊 **擴充功能** → **Apps Script**
2. 將 `Code.js` 的內容複製貼上到編輯器中
3. 確保工作表名稱與 `Code.js` 中的 `SHEET_NAME` 一致（預設為 "Messages"）
4. 儲存專案

### 步驟 3：部署 Web App

1. 在 Apps Script 編輯器中，點擊 **部署** → **新增部署**
2. 選擇類型為 **網頁應用程式**
3. 設定部署選項：
   - **說明**：留言板 API（可選）
   - **執行身份**：我
   - **具有存取權的使用者**：所有人
4. 點擊 **部署**
5. **複製部署後的 Web App URL**（稍後需要使用）

### 步驟 4：配置前端

1. 開啟 `config.js` 檔案
2. 將 `API_URL` 替換為步驟 3 中獲得的 Web App URL：

   ```javascript
   const CONFIG = {
     API_URL: "你的 Web App URL",
     REFRESH_INTERVAL_MS: 10000,
   };
   ```

### 步驟 5：部署前端

選擇以下任一方式部署：

#### 方式 A：GitHub Pages

1. 將專案推送到 GitHub 儲存庫
2. 在儲存庫設定中啟用 GitHub Pages
3. 選擇分支和資料夾（通常是 `/root`）

#### 方式 B：Netlify / Vercel

1. 將專案資料夾拖放到 Netlify/Vercel
2. 自動部署完成

#### 方式 C：本地測試

使用任何靜態檔案伺服器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js (http-server)
npx http-server
```

## 📁 專案結構

```text
sheet-message-board/
├── index.html      # 前端主頁面
├── config.js       # 配置檔案（API URL 等）
├── Code.js         # Google Apps Script 後端程式碼
└── README.md       # 本檔案
```

## ⚙️ 配置說明

### config.js

主要的配置選項：

- `API_URL`：Google Apps Script Web App 的部署 URL
- `REFRESH_INTERVAL_MS`：自動刷新間隔（毫秒），預設 10 秒

### Code.js

後端配置：

- `SHEET_NAME`：Google Sheets 工作表名稱（預設："Messages"）
- `MAX_READ`：最多讀取的留言數量（預設：50）

## 📖 使用說明

### 新增留言

1. 在左側表單填寫：
   - **暱稱**（可選）：顯示名稱，預設為「匿名」
   - **來源/備註**（可選）：如 PC-01、倉庫、夜班等
   - **留言內容**（必填）：最多 1000 字元
2. 點擊 **✉️ 送出留言**

### 複製留言

點擊留言右上角的 **📋 複製** 按鈕，留言內容會複製到剪貼板。

### 刪除留言

點擊留言右上角的 **🗑️ 刪除** 按鈕，確認後會軟刪除該留言。

### 手動刷新

點擊 **🔄 手動刷新** 按鈕，立即更新留言列表。

## 🔒 資料結構

### Google Sheets 欄位說明

|欄位名稱|類型|說明|
|:-------|:---|:---|
|Id|String (UUID)|唯一識別碼|
|Timestamp|DateTime|建立時間|
|Name|String|暱稱（預設：匿名）|
|Message|String|留言內容|
|Source|String|來源/備註|
|IsDeleted|Boolean|是否已刪除|

## 🐛 常見問題

### Q: 無法讀取留言？

- 檢查 `config.js` 中的 `API_URL` 是否正確
- 確認 Google Sheets 的工作表名稱是否為 "Messages"
- 檢查 Apps Script 部署權限是否設為「所有人」

### Q: 無法送出留言？

- 確認留言內容不能為空
- 檢查瀏覽器控制台是否有錯誤訊息
- 確認 Apps Script 部署是否正確

### Q: 刪除按鈕無法使用？

- 舊資料可能沒有 `Id` 欄位，新留言才會自動產生 Id
- 確認 Google Sheets 中有 `Id` 和 `IsDeleted` 欄位

## 📝 授權

本專案採用 MIT 授權條款。

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📧 聯絡方式

如有問題或建議，歡迎開啟 Issue。

---

**注意**：此專案僅供學習和個人使用。請確保遵守相關資料保護法規。
