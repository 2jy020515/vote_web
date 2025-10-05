import React, { useState } from 'react';
import '../App.css';
import API from '../api/axiosConfig';
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: '',
    real_name: '',
    phone_number: '',
    email: '',
    verification_code: '',
    password: '',
    srn_part: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateSrnPart = (srn) => /^\d{6}-\d$/.test(srn);
  const validatePhone = (phone) => /^\d{9,11}$/.test(phone);
  const validateName = (name) => name.length >= 2 && /^[가-힣a-zA-Z]+$/.test(name.trim());

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
      const res = await API.post(`/api/v1/user/email-verification`, {
        username: form.username,
        real_name: form.real_name,
        phone_number: form.phone_number,
        email: form.email,
      });

      if (res.data.success) {
        alert('✅ 인증 메일이 발송되었습니다. 메일함을 확인하세요.');
        setStep(2);
      } else {
        alert(res.data.message || '인증 메일 발송 실패');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`❌ ${err.response.data.message}`);
      } else {
        alert('❌ 서버 오류 또는 인증 요청 실패');
      }
      console.error(err.response?.data || err);
    }
  };

  const handleRegister = async () => {
    if (!form.verification_code.trim() || !form.password.trim() || !form.srn_part.trim()) {
      alert('인증코드, 비밀번호, 주민번호를 모두 입력해주세요.');
      return;
    }
    if (!validateSrnPart(form.srn_part)) {
      alert('주민등록번호 형식은 6자리-1자리입니다 (예: 000000-0)');
      return;
    }

    try {
      const res = await API.post(`/api/v1/user/register`, {
        username: form.username,
        real_name: form.real_name,
        phone_number: form.phone_number,
        email: form.email,
        verification_code: form.verification_code,
        password: form.password,
        srn_part: form.srn_part,
      });

      if (res.data.success) {
        alert('✅ 회원가입 성공!');
        navigate("/login");
      } else {
        alert(res.data.message || '회원가입 실패');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`❌ ${err.response.data.message}`);
      } else {
        alert('❌ 서버 오류 또는 회원가입 실패');
      }
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
            className="auth-input"
          />
          <input
            name="real_name"
            placeholder="이름"
            value={form.real_name}
            onChange={handleChange}
            className="auth-input"
          />
          <input
            name="phone_number"
            placeholder="전화번호 (숫자만)"
            value={form.phone_number}
            onChange={handleChange}
            className="auth-input"
          />
          <input
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            className="auth-input"
          />
          <button onClick={handleEmailVerification} className="auth-button">
            이메일 인증하기
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: '14px', color: '#555' }}>
              📩 입력한 이메일로 발송된 인증코드를 입력해주세요.
            </p>
          </div>
          <input
            name="verification_code"
            placeholder="인증코드"
            value={form.verification_code}
            onChange={handleChange}
            className="auth-input"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            className="auth-input"
          />
          <input
            name="srn_part"
            placeholder="주민번호 앞6자리-성별1자리 (예: 000000-0)"
            value={form.srn_part}
            onChange={handleChange}
            className="auth-input"
          />
          <button onClick={handleRegister} className="auth-button">
            회원가입
          </button>
        </>
      )}
    </div>
  );
};

export default SignUp;
