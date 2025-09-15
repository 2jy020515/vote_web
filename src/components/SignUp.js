import React, { useState } from 'react';
import '../App.css';
import API from '../api/axiosConfig';

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
    // 입력칸 체크
    for (let key in form) {
      if (!form[key].trim()) {
        alert('모든 입력 칸을 채워주세요.');
        return;
      }
    }

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
      alert('전화번호는 숫자만 입력하세요 (9~11자리)');
      return;
    }

    try {
      const res = await API.post(`/api/v1/user/register`, form);

      if (res.data.success) {
        alert('✅ 회원가입 성공');
      } else {
        alert(res.data.message || '회원가입 실패');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(`❌ ${err.response.data.message}`);
      } else {
        alert('❌ 서버 오류 또는 회원가입 실패');
      }
      console.error(err.response ? err.response.data : err);
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
