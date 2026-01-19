import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../DashboardPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { productApi } from '../../api/productApi';

// Mocks
const mockNavigate = vi.fn();
const mockLogout = vi.fn();

// Mock useAuth hook
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

vi.mock('../../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn(),
    },
}));

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock values
        mockUseAuth.mockReturnValue({
            user: { username: 'TestUser', role: 'user' },
            logout: mockLogout,
        });
        // Default product API mock
        (productApi.getProducts as any).mockResolvedValue([]);
    });

    const renderDashboardPage = () => {
        return render(
            <MemoryRouter>
                <DashboardPage />
            </MemoryRouter>
        );
    };

    /**
     * 【前端元素】檢查頁面基本元素
     */
    it('【前端元素】檢查頁面基本元素', async () => {
        renderDashboardPage();

        await waitFor(() => {
            expect(screen.getByText('儀表板')).toBeInTheDocument();
            expect(screen.getByText('Welcome, TestUser 👋')).toBeInTheDocument();
            expect(screen.getByText('一般用戶')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        });

        const headerNav = screen.getByRole('navigation');
        expect(within(headerNav).queryByText('🛠️ 管理後台')).not.toBeInTheDocument();
    });

    /**
     * 【前端元素】管理員權限顯示
     */
    it('【前端元素】管理員權限顯示', async () => {
        mockUseAuth.mockReturnValue({
            user: { username: 'AdminUser', role: 'admin' },
            logout: mockLogout,
        });

        renderDashboardPage();

        await waitFor(() => {
            expect(screen.getByText('Welcome, AdminUser 👋')).toBeInTheDocument();
            expect(screen.getByText('管理員')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: '🛠️ 管理後台' })).toBeInTheDocument();
        });
    });

    /**
     * 【Mock API】商品列表載入成功
     */
    it('【Mock API】商品列表載入成功', async () => {
        const mockProducts = [
            { id: 1, name: 'Product A', description: 'Desc A', price: 100 },
            { id: 2, name: 'Product B', description: 'Desc B', price: 200 },
        ];
        (productApi.getProducts as any).mockResolvedValue(mockProducts);

        renderDashboardPage();

        await waitFor(() => {
            expect(screen.getByText('商品列表')).toBeInTheDocument();
        });

        expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();

        expect(screen.getByText('Product A')).toBeInTheDocument();
        expect(screen.getByText('Desc A')).toBeInTheDocument();
        expect(screen.getByText('NT$ 100')).toBeInTheDocument();

        expect(screen.getByText('Product B')).toBeInTheDocument();
        expect(screen.getByText('Desc B')).toBeInTheDocument();
        expect(screen.getByText('NT$ 200')).toBeInTheDocument();
    });

    /**
     * 【Mock API】商品列表載入失敗
     */
    it('【Mock API】商品列表載入失敗', async () => {
        (productApi.getProducts as any).mockRejectedValue({
            response: {
                data: {
                    message: 'API Error'
                },
                status: 500
            }
        });

        renderDashboardPage();

        await waitFor(() => {
            expect(screen.getByText('API Error')).toBeInTheDocument();
        });

        expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
    });

    /**
     * 【Mock API】載入中狀態
     */
    it('【Mock API】載入中狀態', () => {
        (productApi.getProducts as any).mockReturnValue(new Promise(() => { }));
        renderDashboardPage();
        expect(screen.getByText('載入商品中...')).toBeInTheDocument();
    });

    /**
     * 【Function 邏輯】登出功能
     */
    it('【Function 邏輯】登出功能', async () => {
        renderDashboardPage();

        const logoutBtn = await screen.findByRole('button', { name: '登出' });
        await userEvent.click(logoutBtn);

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
    });

    /**
     * 【Function 邏輯】點擊管理後台連結
     */
    it('【Function 邏輯】點擊管理後台連結', async () => {
        mockUseAuth.mockReturnValue({
            user: { username: 'AdminUser', role: 'admin' },
            logout: mockLogout,
        });

        renderDashboardPage();

        const adminLink = await screen.findByRole('link', { name: '🛠️ 管理後台' });
        await userEvent.click(adminLink);

        // Since it's a Link component, we check if it has correct href (or checks click navigation if we integration tested router)
        // Testing-library check href usually
        expect(adminLink).toHaveAttribute('href', '/admin');
    });
});
