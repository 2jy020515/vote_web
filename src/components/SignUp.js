import React, { useState } from 'react';
import '../App.css';
import API from '../api/axiosConfig';
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    real_name: '',
    phone_number: '',
    email: '',
    verification_code: '',
    password: '',
    srn_front: '',
    srn_back: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.trim() });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validatePhone = (phone) => /^\d{9,11}$/.test(phone.trim());
  const validateName = (name) => name.trim().length >= 2 && /^[가-힣a-zA-Z]+$/.test(name.trim());

  const handleEmailVerification = async () => {
    if (!form.username.trim() || !form.real_name.trim() || !form.phone_number.trim() || !form.email.trim()) {
      alert('아이디, 이름, 전화번호, 이메일을 모두 입력해주세요.');
      return;
    }
    if (!validateName(form.real_name)) {
      alert('이름은 2자 이상, 한글 또는 영문만 가능합니다.');
      return;
    }
    if (!validatePhone(form.phone_number)) {
      alert('전화번호는 숫자만 입력하세요 (9~11자리)');
      return;
    }
    if (!validateEmail(form.email)) {
      alert('올바른 이메일 형식을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(`/api/v1/user/email-verification`, {
        username: form.username.trim(),
        real_name: form.real_name.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim(),
        category: "register"
      });

      if (res.data.success) {
        alert('✅ 인증 메일이 발송되었습니다. 메일함을 확인하세요.');
        setStep(2);
      } else {
        alert(res.data.message || '인증 메일 발송 실패');
      }
    } catch (err) {
      alert(err.response?.data?.message || '❌ 서버 오류 또는 인증 요청 실패');
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.verification_code.trim() || !form.password.trim() || !form.srn_front.trim() || !form.srn_back.trim()) {
      alert('인증코드, 비밀번호, 주민번호를 모두 입력해주세요.');
      return;
    }

    if (!/^\d{6}$/.test(form.srn_front.trim()) || !/^\d$/.test(form.srn_back.trim())) {
      alert('주민등록번호 형식은 앞 6자리와 뒤 1자리 숫자여야 합니다.');
      return;
    }

    const srn_part = `${form.srn_front.trim()}-${form.srn_back.trim()}`;

    try {
      const res = await API.post(`/api/v1/user/register`, {
        username: form.username.trim(),
        real_name: form.real_name.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim(),
        verification_code: form.verification_code.trim(),
        password: form.password.trim(),
        srn_part
      });

      if (res.data.success) {
        alert('✅ 회원가입 성공!');
        navigate("/login");
      } else {
        alert(res.data.message || '회원가입 실패');
      }
    } catch (err) {
      alert(err.response?.data?.message || '❌ 서버 오류 또는 회원가입 실패');
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="proposal-form">
      <h2>회원가입</h2>

      {step === 1 && (
        <>
          <input
            name="username"
            placeholder="아이디"
            value={form.username}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
            className="auth-input"
          />
          <input
            name="real_name"
            placeholder="이름"
            value={form.real_name}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
            className="auth-input"
          />
          <input
            name="phone_number"
            placeholder="전화번호 (숫자만)"
            value={form.phone_number}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
            className="auth-input"
          />
          <input
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
            className="auth-input"
          />

          <button
            onClick={handleEmailVerification}
            className="auth-button"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '📨 메일 전송 중...' : '이메일 인증하기'}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            name="verification_code"
            placeholder="인증코드"
            value={form.verification_code}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
            className="auth-input"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            style={{ marginBottom: '16px' }}
            className="auth-input"
          />

          <div style={{ display: 'flex', marginBottom: '16px' }}>
            <input
              name="srn_front"
              placeholder="주민번호 앞 6자리 (생년월일)"
              value={form.srn_front}
              onChange={handleChange}
              className="auth-input"
              style={{ flex: 1 }}
            />
            <input
              name="srn_back"
              placeholder="주민번호 뒤 1자리 (성별)"
              value={form.srn_back}
              onChange={handleChange}
              className="auth-input"
              style={{ flex: 1 }}
            />
          </div>

          <button onClick={handleRegister} className="auth-button">
            회원가입
          </button>
        </>
      )}
    </div>
  );
};

export default SignUp;
