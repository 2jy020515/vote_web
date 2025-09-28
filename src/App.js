import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Proposal from './components/Proposal';
import Submit from './components/Submit';
import List from './components/List';
import VoteListQuery from './components/VoteListQuery';
import VoteDetailQuery from './components/VoteDetailQuery';
import VoteBallotQuery from './components/VoteBallotQuery';
import SignUp from './components/SignUp';
import Login from './components/Login';
import BallotValidation from './components/BallotValidation';
import ProtectedRoute from './components/ProtectedRoute';
import MyPage from './components/MyPage';
import API from './api/axiosConfig';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userHash = localStorage.getItem('userHash');

      await API.post(
        '/api/v1/user/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-Hash': userHash,
          },
        }
      );

      alert('✅ 로그아웃 되었습니다.');
    } catch (err) {
      console.error('❌ 로그아웃 요청 실패:', err.response?.data || err);
      alert('⚠️ 서버 로그아웃 요청 실패 (토큰이 만료되었을 수 있음)');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userHash');
      localStorage.removeItem('username');
      localStorage.removeItem('realName');
      localStorage.removeItem('uid');

      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  const username = localStorage.getItem('username');

  return (
    <div className="app-container">
      <header className="navbar">
        <h1 className="logo">✓OTING</h1>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span>투표 생성</span>
          </NavLink>
          <NavLink to="/list" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span>투표 목록</span>
          </NavLink>
          <NavLink to="/vote-list-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span>목록 조회</span>
          </NavLink>
          <NavLink to="/vote-detail-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span>상세 조회</span>
          </NavLink>
          <NavLink to="/ballot-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span>해시 조회</span>
          </NavLink>
          <NavLink to="/ballot-validation" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <span>투표 검증</span>
          </NavLink>
          <a href="http://explorer.ai-capstone.store:8081" className="nav-link" target="_blank" rel="noopener noreferrer">
            <span>블록 조회</span>
          </a>
        </nav>

        <div className="auth-buttons">
          {!isLoggedIn ? (
            <>
              <NavLink to="/login">
                <button className="login">LOGIN</button>
              </NavLink>
              <NavLink to="/signup">
                <button className="join">JOIN</button>
              </NavLink>
            </>
          ) : (
            <div className="user-section">
              {username && (
                <div className="user-info">
                  <span onClick={() => navigate('/mypage')} className="username">
                    {username}
                  </span>
                </div>
              )}
              <button className="login" onClick={handleLogout}>LOGOUT</button>
            </div>
          )}
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Proposal /></ProtectedRoute>} />
          <Route path="/submit/:id" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
          <Route path="/list" element={<ProtectedRoute><List /></ProtectedRoute>} />
          <Route path="/vote-list-query" element={<ProtectedRoute><VoteListQuery /></ProtectedRoute>} />
          <Route path="/vote-detail-query" element={<ProtectedRoute><VoteDetailQuery /></ProtectedRoute>} />
          <Route path="/ballot-query" element={<ProtectedRoute><VoteBallotQuery /></ProtectedRoute>} />
          <Route path="/ballot-validation" element={<ProtectedRoute><BallotValidation /></ProtectedRoute>} />
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
