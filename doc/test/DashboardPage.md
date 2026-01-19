---
description: DashboardPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】檢查頁面基本元素
**範例輸入**：進入儀表板頁面 (Mock user: { username: 'TestUser', role: 'user' })  
**期待輸出**：
1. 顯示標題 "儀表板"
2. 顯示歡迎訊息 "Welcome, TestUser 👋"
3. 顯示角色標籤 "一般用戶"
4. 顯示 "登出" 按鈕
5. 不顯示 "管理後台" 連結 (一般用戶不可見)

---

## [x] 【前端元素】管理員權限顯示
**範例輸入**：進入儀表板頁面 (Mock user: { username: 'AdminUser', role: 'admin' })  
**期待輸出**：
1. 顯示角色標籤 "管理員"
2. 顯示 "管理後台" 連結

---

## [x] 【Mock API】商品列表載入成功
**範例輸入**：頁面載入，productApi.getProducts 回傳商品陣列  
**期待輸出**：
1. 顯示 "商品列表" 標題
2. 顯示商品卡片 (包含名稱、描述、價格)
3. Loading 狀態消失

---

## [x] 【Mock API】商品列表載入失敗
**範例輸入**：頁面載入，productApi.getProducts 回傳 500 錯誤  
**期待輸出**：
1. 顯示錯誤訊息 "無法載入商品資料" (或 API 回傳的 message)
2. Loading 狀態消失

---

## [x] 【Mock API】載入中狀態
**範例輸入**：API 請求尚未回應  
**期待輸出**：顯示 "載入商品中..." 與 spinner

---

## [x] 【Function 邏輯】登出功能
**範例輸入**：點擊 "登出" 按鈕  
**期待輸出**：
1. 呼叫 logout method
2. 導向至 "/login"

---

## [x] 【Function 邏輯】點擊管理後台連結
**範例輸入**：點擊 "管理後台" 連結 (Admin 用戶)  
**期待輸出**：導向至 "/admin"
