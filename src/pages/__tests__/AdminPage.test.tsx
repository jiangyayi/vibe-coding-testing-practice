import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPage } from '../AdminPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mocks
const mockNavigate = vi.fn();
const mockLogout = vi.fn();
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

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default to admin user
        mockUseAuth.mockReturnValue({
            user: { username: 'Admin', role: 'admin' },
            logout: mockLogout,
        });
    });

    const renderAdminPage = () => {
        return render(
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        );
    };

    /**
     * 【前端元素】檢查頁面基本元素
     */
    it('【前端元素】檢查頁面基本元素', () => {
        renderAdminPage();

        expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
        expect(screen.getByText('← 返回')).toBeInTheDocument();
        expect(screen.getByText('管理員')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
    });

    /**
     * 【Function 邏輯】返回儀表板
     */
    it('【Function 邏輯】返回儀表板', async () => {
        renderAdminPage();
        const backLink = screen.getByText('← 返回');
        expect(backLink).toHaveAttribute('href', '/dashboard');

        await userEvent.click(backLink);
        // Link navigation is handled by Router, we check attribute mostly or if we could mock Link click behavior but href check is standard for unit component test
    });

    /**
     * 【Function 邏輯】登出功能
     */
    it('【Function 邏輯】登出功能', async () => {
        renderAdminPage();
        const logoutBtn = screen.getByRole('button', { name: '登出' });

        await userEvent.click(logoutBtn);
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
    });

    /**
     * 【前端元素】一般用戶角色顯示
     */
    it('【前端元素】一般用戶角色顯示', () => {
        mockUseAuth.mockReturnValue({
            user: { username: 'User', role: 'user' },
            logout: mockLogout,
        });

        renderAdminPage();
        expect(screen.getByText('一般用戶')).toBeInTheDocument();
    });
});
