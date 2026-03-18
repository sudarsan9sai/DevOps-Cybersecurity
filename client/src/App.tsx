import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FundsPage from './pages/FundsPage';
import FundDetailPage from './pages/FundDetailPage';
import WatchlistPage from './pages/WatchlistPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    const isLoggedIn = !!localStorage.getItem('accessToken');

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<Layout />}>
                    <Route path="/" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
                    <Route path="/funds" element={<FundsPage />} />
                    <Route path="/funds/:id" element={<FundDetailPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
