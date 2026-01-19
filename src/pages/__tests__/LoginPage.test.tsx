import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mocks
const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockClearAuthExpiredMessage = vi.fn();

// Mock useAuth hook function
const mockUseAuth = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock values for useAuth
        mockUseAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            authExpiredMessage: '',
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        });
    });

    // Helper to render with Router
    const renderLoginPage = () => {
        return render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
    };

    /**
     * 【前端元素】檢查頁面基本元素
     */
    it('【前端元素】檢查頁面基本元素', () => {
        renderLoginPage();

        expect(screen.getByText('歡迎回來')).toBeInTheDocument();
        expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
        expect(screen.getByLabelText('密碼')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
    });

    /**
     * 【Function 邏輯】Email 格式驗證 (無效)
     */
    it('【Function 邏輯】Email 格式驗證 (無效)', async () => {
        renderLoginPage();
        const emailInput = screen.getByLabelText('電子郵件');
        const loginButton = screen.getByRole('button', { name: '登入' });

        await userEvent.type(emailInput, 'invalid-email');
        await userEvent.click(loginButton);

        expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
    });

    /**
     * 【Function 邏輯】Email 格式驗證 (有效)
     */
    it('【Function 邏輯】Email 格式驗證 (有效)', async () => {
        renderLoginPage();
        const emailInput = screen.getByLabelText('電子郵件');
        const loginButton = screen.getByRole('button', { name: '登入' });

        // First trigger error
        await userEvent.type(emailInput, 'invalid');
        await userEvent.click(loginButton);
        expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();

        // Then fix it
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.click(loginButton);

        // Error should disappear
        expect(screen.queryByText('請輸入有效的 Email 格式')).not.toBeInTheDocument();
    });

    /**
     * 【Function 邏輯】密碼強度驗證 (長度不足)
     */
    it('【Function 邏輯】密碼強度驗證 (長度不足)', async () => {
        renderLoginPage();
        const passwordInput = screen.getByLabelText('密碼');
        const loginButton = screen.getByRole('button', { name: '登入' });

        await userEvent.type(passwordInput, '1234567');
        await userEvent.click(loginButton);

        expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
    });

    /**
     * 【Function 邏輯】密碼強度驗證 (缺少英數組合)
     */
    it('【Function 邏輯】密碼強度驗證 (缺少英數組合)', async () => {
        renderLoginPage();
        const passwordInput = screen.getByLabelText('密碼');
        const loginButton = screen.getByRole('button', { name: '登入' });

        // Only numbers
        await userEvent.type(passwordInput, '12345678');
        await userEvent.click(loginButton);
        expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();

        // Only letters
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'abcdefgh');
        await userEvent.click(loginButton);
        expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
    });

    /**
     * 【Function 邏輯】阻止無效表單提交
     */
    it('【Function 邏輯】阻止無效表單提交', async () => {
        renderLoginPage();
        const loginButton = screen.getByRole('button', { name: '登入' });

        await userEvent.click(loginButton);

        expect(mockLogin).not.toHaveBeenCalled();
    });

    /**
     * 【Mock API】登入成功流程
     */
    it('【Mock API】登入成功流程', async () => {
        renderLoginPage();
        const emailInput = screen.getByLabelText('電子郵件');
        const passwordInput = screen.getByLabelText('密碼');
        const loginButton = screen.getByRole('button', { name: '登入' });

        await userEvent.type(emailInput, 'user@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(loginButton);

        expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    /**
     * 【Mock API】登入失敗流程
     */
    it('【Mock API】登入失敗流程', async () => {
        const errorMessage = '帳號或密碼錯誤';
        mockLogin.mockRejectedValue({
            response: {
                data: {
                    message: errorMessage
                }
            }
        });

        renderLoginPage();
        const emailInput = screen.getByLabelText('電子郵件');
        const passwordInput = screen.getByLabelText('密碼');
        const loginButton = screen.getByRole('button', { name: '登入' });

        await userEvent.type(emailInput, 'user@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(loginButton);

        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    /**
     * 【前端元素】Loading 狀態
     */
    it('【前端元素】Loading 狀態', async () => {
        // Make login hang pending
        mockLogin.mockImplementation(() => new Promise(() => { }));

        renderLoginPage();
        const emailInput = screen.getByLabelText('電子郵件');
        const passwordInput = screen.getByLabelText('密碼');
        const loginButton = screen.getByRole('button', { name: '登入' });

        await userEvent.type(emailInput, 'user@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(loginButton);

        expect(screen.getByText('登入中...')).toBeInTheDocument();
        expect(loginButton).toBeDisabled();
        expect(emailInput).toBeDisabled();
    });

    /**
    * 【驗證權限】已登入狀態導向
    */
    it('【驗證權限】已登入狀態導向', () => {
        mockUseAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: true,
            authExpiredMessage: '',
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        });

        renderLoginPage();
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    /**
     * 【Function 邏輯】顯示 Auth 過期訊息
     */
    it('【Function 邏輯】顯示 Auth 過期訊息', () => {
        mockUseAuth.mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            authExpiredMessage: '連線逾時，請重新登入',
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        });

        renderLoginPage();
        expect(screen.getByText('連線逾時，請重新登入')).toBeInTheDocument();
        expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
    });
});
