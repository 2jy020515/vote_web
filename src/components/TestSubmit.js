import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TestSubmit = () => {
  const [topic, setTopic] = useState('');
  const [option, setOption] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setResult(null);
    setError('');

    const submitVote = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const userHash = localStorage.getItem('userHash');

      const res = await axios.post(
        `/api/v1/vote/submit`,
        { topic, option },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-User-Hash': userHash,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = res.data;
      console.log("📦 전체 응답:", res);
      console.log("📄 응답 바디:", data);

      if (data.status === "REFRESHED_TOKEN") {
        const newAccessToken = res.headers['authorization']?.split(' ')[1];
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          console.log("♻️ 새 토큰 저장 완료, 재요청 중...");
          return await submitVote();
        } else {
          throw new Error("새로운 액세스 토큰을 찾을 수 없습니다.");
        }
      }

      if (data.success === true || data.success === "true") {
        setResult("✅ 투표 제출 성공!");
        setError('');
      } 
      else {
        const serverMessage = data.message || "알 수 없는 오류 발생";
        switch (data.status) {
          case "UNAUTHORIZED":
            setError("⚠️ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userHash");
            setTimeout(() => navigate('/login'), 1500);
            break;
          case "DUPLICATE_VOTE_SUBMISSION":
            setError("⚠️ 이미 이 투표에 참여하셨습니다.");
            break;
          case "PROPOSAL_NOT_OPEN":
            setError("❌ 존재하지 않거나 진행 중이지 않은 투표입니다.");
            break;
          case "TIMEOUT_PROPOSAL":
            setError("⏳ 투표가 마감되어 제출할 수 없습니다.");
            break;
          default:
            setError(`❌ ${serverMessage}`);
        }
      }
    };

    try {
      await submitVote();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } 
      else if (err.response?.data?.status === "UNAUTHORIZED") {
        setError("⚠️ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userHash");
        setTimeout(() => navigate('/login'), 1500);
      } 
      else {
        setError("🚨 서버 연결 또는 요청 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="proposal-form">
      <h2>투표 제출</h2>

      <input
        type="text"
        placeholder="투표 제목 (topic)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <input
        type="text"
        placeholder="선택한 옵션 (option)"
        value={option}
        onChange={(e) => setOption(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button onClick={handleSubmit}>제출</button>

      {result && <p style={{ color: 'green', marginTop: '10px' }}>{result}</p>}
      {error && <p style={{ color: 'red', marginTop: '10px', whiteSpace: 'pre-wrap' }}>{error}</p>}
    </div>
  );
};

export default TestSubmit;
