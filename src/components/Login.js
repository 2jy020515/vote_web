import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import '../App.css';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetForm, setResetForm] = useState({
    username: '',
    email: '',
    real_name: '',
    phone_number: '',
    code: '',
    new_password: ''
  });
  const [uid, setUid] = useState(null);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleResetChange = (e) =>
    setResetForm({ ...resetForm, [e.target.name]: e.target.value });

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
        const uid = res.data.uid;
        const username = res.data.user_name;
        if (accessToken?.startsWith('Bearer ')) {
          accessToken = accessToken.substring(7);
        }
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userHash', userHash);
        localStorage.setItem('uid', uid);
        localStorage.setItem('username', username);
        alert('✅ 로그인 성공');
        navigate('/');
        return;
      }
      setError(res.data.message || '❌ 로그인 실패');
    } catch (err) {
      console.error('로그인 오류:', err);
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401) setError(`❌ ${data?.message || '아이디/비밀번호 불일치'}`);
        else if (status === 403) setError('🚨 세션 만료 또는 권한 없음');
        else setError(`❌ ${data?.message || '로그인 오류'}`);
      } else setError('🚨 서버 연결 오류');
    }
  };

  const handleEmailVerification = async () => {
    const { username, email, real_name, phone_number } = resetForm;
    if (!username || !email || !real_name || !phone_number) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    try {
      const res = await API.post('/api/v1/user/email-verification', {
        username,
        email, 
        real_name, 
        phone_number,
        category: "reset-password"
      });
      if (res.data.success) {
        alert('✅ 인증 메일이 발송되었습니다.');
        setUid(res.data.uid);
        setStep(2);
      } else {
        alert(res.data.message || '❌ 인증 메일 발송 실패');
      }
    } catch (err) {
      alert(err.response?.data?.message || '🚨 서버 오류');
    }
  };

  const handleResetPassword = async () => {
    const { username, email, real_name, phone_number, code, new_password } = resetForm;
    if (!code || !new_password) {
      alert('인증 코드와 새 비밀번호를 입력해주세요.');
      return;
    }
    try {
      const res = await API.put('/api/v1/user/reset/user-password', {
        uid,
        username,
        email,
        real_name,
        phone_number,
        new_password,
        verification_code: code
      });
      if (res.data.success) {
        alert('✅ 비밀번호가 성공적으로 변경되었습니다.');
        setResetMode(false);
        setStep(1);
        setResetForm({
          username: '',
          email: '',
          real_name: '',
          phone_number: '',
          code: '',
          new_password: ''
        });
      } else {
        alert(res.data.message || '❌ 비밀번호 변경 실패');
      }
    } catch (err) {
      alert(err.response?.data?.message || '🚨 서버 오류');
    }
  };  

  return (
    <div className="proposal-form login-container">
      {!resetMode ? (
        <>
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
            <button type="submit" className="submit-btn">로그인</button>
            {error && <p className="error-msg">{error}</p>}
          </form>

          <button className="back-link" onClick={() => setResetMode(true)}>
            비밀번호 찾기
          </button>
        </>
      ) : (
        <>
          <h2>비밀번호 재설정</h2>
          {step === 1 && (
            <>
              <input
                name="username"
                placeholder="아이디"
                value={resetForm.username}
                onChange={handleResetChange}
                className="auth-input"
              />
              <input
                name="email"
                placeholder="이메일"
                value={resetForm.email}
                onChange={handleResetChange}
                className="auth-input"
              />
              <input
                name="real_name"
                placeholder="이름"
                value={resetForm.real_name}
                onChange={handleResetChange}
                className="auth-input"
              />
              <input
                name="phone_number"
                placeholder="전화번호"
                value={resetForm.phone_number}
                onChange={handleResetChange}
                className="auth-input"
              />
              <button className="submit-btn" onClick={handleEmailVerification}>
                이메일 인증하기
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                name="code"
                placeholder="인증 코드"
                value={resetForm.code}
                onChange={handleResetChange}
                className="auth-input"
              />
              <input
                name="new_password"
                type="password"
                placeholder="새 비밀번호"
                value={resetForm.new_password}
                onChange={handleResetChange}
                className="auth-input"
              />
              <button className="submit-btn" onClick={handleResetPassword}>
                비밀번호 변경하기
              </button>
            </>
          )}

          <button className="back-link" onClick={() => { setResetMode(false); setStep(1); }}>
            로그인 화면으로 돌아가기
          </button>
        </>
      )}
    </div>
  );
};

export default Login;
