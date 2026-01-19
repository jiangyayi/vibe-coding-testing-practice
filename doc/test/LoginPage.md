---
description: LoginPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】檢查頁面基本元素
**範例輸入**：進入登入頁面  
**期待輸出**：
1. 顯示標題 "歡迎回來"
2. 顯示 Email 輸入框
3. 顯示密碼輸入框
4. 顯示登入按鈕

---

## [x] 【Function 邏輯】Email 格式驗證 (無效)
**範例輸入**：在 Email 輸入框輸入 "invalid-email" 並離開焦點或點擊登入  
**期待輸出**：顯示錯誤訊息 "請輸入有效的 Email 格式"

---

## [x] 【Function 邏輯】Email 格式驗證 (有效)
**範例輸入**：在 Email 輸入框輸入 "test@example.com"  
**期待輸出**：錯誤訊息消失

---

## [x] 【Function 邏輯】密碼強度驗證 (長度不足)
**範例輸入**：在密碼輸入框輸入 "1234567" (少於 8 碼)  
**期待輸出**：顯示錯誤訊息 "密碼必須至少 8 個字元"

---

## [x] 【Function 邏輯】密碼強度驗證 (缺少英數組合)
**範例輸入**：在密碼輸入框輸入 "12345678" (只有數字) 或 "abcdefgh" (只有字母)  
**期待輸出**：顯示錯誤訊息 "密碼必須包含英文字母和數字"

---

## [x] 【Function 邏輯】阻止無效表單提交
**範例輸入**：輸入無效的 Email 或密碼，點擊登入按鈕  
**期待輸出**：
1. 不會觸發登入 API
2. 顯示對應的欄位錯誤訊息

---

## [x] 【Mock API】登入成功流程
**範例輸入**：輸入有效的 Email (user@example.com) 和密碼 (password123)，Mock login API 回傳成功  
**期待輸出**：
1. 呼叫 login API
2. 導向至 "/dashboard"

---

## [x] 【Mock API】登入失敗流程
**範例輸入**：輸入 Email 和密碼，Mock login API 回傳 401 錯誤 { message: "帳號或密碼錯誤" }  
**期待輸出**：頁面顯示錯誤訊息 "帳號或密碼錯誤"

---

## [x] 【前端元素】Loading 狀態
**範例輸入**：點擊登入按鈕，等待 API 回應期間  
**期待輸出**：
1. 登入按鈕顯示 "登入中..."
2. 登入按鈕設為 disabled
3. 輸入框設為 disabled

---

## [] 【驗證權限】已登入狀態導向
**範例輸入**：AuthContext 的 isAuthenticated 為 true  
**期待輸出**：自動導向至 "/dashboard"

---

## [] 【Function 邏輯】顯示 Auth 過期訊息
**範例輸入**：AuthContext 的 authExpiredMessage 有值 ("連線逾時，請重新登入")  
**期待輸出**：
1. 頁面顯示錯誤 banner "連線逾時，請重新登入"
2. 呼叫 clearAuthExpiredMessage 清除訊息
