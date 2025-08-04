import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    real_name: '',
    srn_part: '',
    email: '',
    phone_number: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateSrnPart = (srn) => /^\d{6}-\d$/.test(srn);
  const validatePhone = (phone) => /^\d{9,11}$/.test(phone);
  const validateName = (name) => name.length >= 2 && /^[가-힣a-zA-Z]+$/.test(name.trim());

  const handleSubmit = async () => {
    if (!validateName(form.real_name)) {
      alert('이름은 2자 이상, 한글 또는 영문만 가능합니다.');
      return;
    }
    if (!validateEmail(form.email)) {
      alert('올바른 이메일 형식을 입력하세요.');
      return;
    }
    if (!validateSrnPart(form.srn_part)) {
      alert('주민등록번호 형식은 6자리-1자리입니다 (예: 000000-0)');
      return;
    }
    if (!validatePhone(form.phone_number)) {
      alert('숫자만 입력하세요.');
      return;
    }

    try {
      const res = await axios.post(`/api/v1/auth/register`, form);
      if (res.data.success) {
        alert('✅ 회원가입 성공');
      } else {
        alert('❌ 회원가입 실패');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류 또는 회원가입 실패');
    }
  };

  return (
    <div className="proposal-form">
      <h2>회원가입</h2>
      <input
        name="username"
        placeholder="아이디"
        value={form.username}
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
        name="real_name"
        placeholder="이름"
        value={form.real_name}
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
      <input
        name="email"
        placeholder="이메일"
        value={form.email}
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
      <button onClick={handleSubmit}>회원가입</button>
    </div>
  );
};

export default SignUp;
