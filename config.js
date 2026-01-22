/**
 * 留言板配置檔案
 * 
 * 使用說明：
 * 1. 修改 API_URL 為你的 Google Apps Script Web App 部署 URL
 * 2. 可以根據需要調整其他配置選項
 */

const CONFIG = {
  // Google Apps Script Web App URL
  // 部署後將此 URL 替換為你的 Web App URL
  API_URL: "https://script.google.com/macros/s/AKfycbzbZhI9Nyj8RxPE6WOsXwkox2O5OisE26XKxUqgAN4kEnlLWRqsolQPnsKpMrmizFjI/exec",
  
  // 自動刷新間隔（毫秒）
  REFRESH_INTERVAL_MS: 10000, // 10 秒
  
  // 其他配置選項
  // 可以根據需要添加更多配置
  // MAX_MESSAGE_LENGTH: 1000,
  // MAX_NAME_LENGTH: 50,
  // MAX_SOURCE_LENGTH: 100,
};
