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

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
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
    setIsLoggedIn(false);
    alert('✅ 로그아웃 되었습니다.');
    navigate('/login');
  };

  const copyHash = () => {
    const userHash = localStorage.getItem('userHash');
    if (userHash) {
      navigator.clipboard.writeText(userHash);
      alert('✅ 유저 해시가 복사되었습니다.');
    }
  };

  const username = localStorage.getItem('username');
  const realName = localStorage.getItem('realName');
  const userHash = localStorage.getItem('userHash');

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
                  <span onClick={() => setShowInfo(!showInfo)} className="username">
                    {username}
                  </span>
                  {showInfo && (
                    <div className="user-dropdown">
                      <p><strong>이름:</strong> {realName || "알 수 없음"}</p>
                      <p>
                        <strong>유저해시:</strong>
                        <span className="user-hash">{userHash}</span>
                        <button className="copy-btn" onClick={copyHash}>복사</button>
                      </p>
                    </div>
                  )}
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
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
