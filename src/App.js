import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Proposal from './components/Proposal';
import Submit from './components/Submit';
import List from './components/List';
import TestSubmit from './components/TestSubmit';
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userHash');
    setIsLoggedIn(false);
    alert('✅ 로그아웃 되었습니다.');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h1 className="logo">✓OTING</h1>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            투표생성
          </NavLink>
          <NavLink to="/result" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            투표결과
          </NavLink>
          <NavLink to="/list" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            투표목록
          </NavLink>
          <NavLink to="/test-submit" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            투표행사
          </NavLink>
          <NavLink to="/vote-list-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            목록조회
          </NavLink>
          <NavLink to="/vote-detail-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            상세조회
          </NavLink>
          <NavLink to="/ballot-query" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            해시조회
          </NavLink>
          <NavLink to="/block-explorer" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            블록조회
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
            <button className="login" onClick={handleLogout}>LOGOUT</button>
          )}
        </div>
      </header>

      <main>
        <Routes>
          {/* ✅ 로그인 필요 페이지들 */}
          <Route path="/" element={<ProtectedRoute><Proposal /></ProtectedRoute>} />
          <Route path="/submit/:id" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
          <Route path="/list" element={<ProtectedRoute><List /></ProtectedRoute>} />
          <Route path="/test-submit" element={<ProtectedRoute><TestSubmit /></ProtectedRoute>} />
          <Route path="/vote-list-query" element={<ProtectedRoute><VoteListQuery /></ProtectedRoute>} />
          <Route path="/vote-detail-query" element={<ProtectedRoute><VoteDetailQuery /></ProtectedRoute>} />
          <Route path="/ballot-query" element={<ProtectedRoute><VoteBallotQuery /></ProtectedRoute>} />
          <Route path="/block-explorer" element={<ProtectedRoute><BlockExplorer /></ProtectedRoute>} />

          {/* 로그인/회원가입은 예외 */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
