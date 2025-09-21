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
import BlockExplorer from './components/BlockExplorer';
import ProtectedRoute from './components/ProtectedRoute';
import MyPage from './components/MyPage';   // ✅ 마이페이지 추가

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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userHash');
    localStorage.removeItem('username');
    localStorage.removeItem('realName');
    localStorage.removeItem('uid');
    setIsLoggedIn(false);
    alert('✅ 로그아웃 되었습니다.');
    navigate('/login');
  };

  const username = localStorage.getItem('username');

  return (
    <div className="app-container">
      <header className="navbar">
        <h1 className="logo">✓OTING</h1>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            투표 생성
          </NavLink>
          <NavLink to="/list" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            투표 목록
          </NavLink>
          <NavLink to="/vote-list-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            목록 조회
          </NavLink>
          <NavLink to="/vote-detail-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            상세 조회
          </NavLink>
          <NavLink to="/ballot-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            해시 조회
          </NavLink>
          <NavLink to="/block-explorer" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            블록 조회
          </NavLink>
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
                  {/* ✅ username 클릭 시 마이페이지로 이동 */}
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
          <Route path="/block-explorer" element={<ProtectedRoute><BlockExplorer /></ProtectedRoute>} />
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} /> {/* ✅ 마이페이지 라우트 */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
