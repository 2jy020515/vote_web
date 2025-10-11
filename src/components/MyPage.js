import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import '../App.css';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  // const [newPassword, setNewPassword] = useState('');
  // const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState('');
  // const [success, setSuccess] = useState('');

  const uid = localStorage.getItem('uid');
  const username = localStorage.getItem('username');
  const userhash = localStorage.getItem('userHash');

  useEffect(() => {
    if (!uid || !username || !userhash) return;

    API.get(`/api/v1/user/spec?uid=${uid}&username=${username}&userhash=${userhash}`)
      .then(res => {
        if (res.data.success) {
          setUserInfo(res.data);
        } else {
          setError(res.data.message || '❌ 사용자 정보를 불러올 수 없습니다.');
        }
      })
      .catch(err => {
        console.error("유저 정보 조회 오류:", err);
        setError('🚨 서버와 연결할 수 없습니다.');
      });
  }, [uid, username, userhash]);

  /*
  const handlePasswordChange = async () => {
    if (!newPassword) {
      setError('⚠️ 새 비밀번호를 입력해주세요.');
      return;
    }
    setError('');
    try {
      const res = await API.put('/api/v1/user/modify/user-password', {
        uid,
        username,
        new_password: newPassword
      });

      if (res.data.success) {
        setSuccess('✅ 비밀번호가 성공적으로 변경되었습니다.');
        setNewPassword('');
        setShowPasswordForm(false);
      } else {
        setError(res.data.message || '❌ 비밀번호 변경 실패');
      }
    } catch (err) {
      setError('🚨 서버 오류');
      console.error(err);
    }
  };
  */

  const handleCopy = () => {
    if (userInfo?.user_hash) {
      navigator.clipboard.writeText(userInfo.user_hash);
      alert("✅ 유저 해시가 복사되었습니다!");
    }
  };

  if (!userInfo) {
    return <div className="query-container">⏳ 사용자 정보를 불러오는 중...</div>;
  }

  return (
    <div className="proposal-form">
      <h3>내 정보</h3>

      <div className="info-row">
        <label>이름:</label>
        <input type="text" value={userInfo.real_name || ''} readOnly />
      </div>
      <div className="info-row">
        <label>아이디:</label>
        <input type="text" value={userInfo.user_name || ''} readOnly />
      </div>
      <div className="info-row">
        <label>이메일:</label>
        <input type="text" value={userInfo.email || ''} readOnly />
      </div>
      <div className="info-row">
        <label>전화번호:</label>
        <input type="text" value={userInfo.phone_number || ''} readOnly />
      </div>
      <div className="info-row">
        <label>유저 해시:</label>
        <div className="hash-box">
          <input type="text" value={userInfo.user_hash || ''} readOnly />
          <button className="copy-btn" onClick={handleCopy}>복사</button>
        </div>
      </div>

      {/*
      {!showPasswordForm ? (
        <button className="back-btn" onClick={() => setShowPasswordForm(true)}>
          비밀번호 변경
        </button>
      ) : (
        <div className="info-row">
          <input
            type="password"
            placeholder="새 비밀번호 입력"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="auth-input"
          />
          <button className="back-btn" onClick={handlePasswordChange}>
            변경하기
          </button>
        </div>
      )}
      */}

      {error && <p className="error-msg">{error}</p>}
      {/* success && <p className="success-msg">{success}</p> */}
    </div>
  );
};

export default MyPage;
