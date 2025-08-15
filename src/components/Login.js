import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import '../App.css';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.password) {
      setError('⚠️ 모든 입력칸을 채워주세요.');
      return;
    }

    try {
      const res = await API.post('/api/v1/user/login', form);

      if (res.data.success) {
        let accessToken = res.headers['authorization'];
        const userHash = res.data.user_hash;

        if (accessToken && accessToken.startsWith('Bearer ')) {
          accessToken = accessToken.substring(7);
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userHash', userHash);

        alert('✅ 로그인 성공');
        navigate('/');
        return;
      }

      if (res.data.message) {
        setError(`❌ ${res.data.message}`);
      } else {
        setError('❌ 로그인 실패');
      }
    } catch (err) {
      console.error('로그인 오류:', err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(`❌ ${err.response.data.message}`);
      } else {
        setError('🚨 서버 연결 오류');
      }
    }
  };

  return (
    <div className="proposal-form login-container">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <input
          name="username"
          placeholder="아이디"
          value={form.username}
          onChange={handleChange}
          className="auth-input"
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          className="auth-input"
        />
        <button type="submit">로그인</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
