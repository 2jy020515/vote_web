import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Proposal from './components/Proposal';
import Submit from './components/Submit';
import List from './components/List';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="navbar">
          <h1 className="logo">✓OTING</h1>
          <nav>
            <NavLink
              to="/"
              end
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              투표생성
            </NavLink>
            <NavLink
              to="/result"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              투표결과
            </NavLink>
            <NavLink
              to="/list"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              투표목록
            </NavLink>
          </nav>
          <div className="auth-buttons">
            <button className="login">LOGIN</button>
            <button className="join">JOIN</button>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Proposal />} />
            <Route path="/submit/:id" element={<Submit />} />
            <Route path="/list" element={<List />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
