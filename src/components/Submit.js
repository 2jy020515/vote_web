import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import '../App.css';

const Submit = () => {
  const { id: topic } = useParams();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/api/v1/query/proposal/${encodeURIComponent(topic)}/detail`)
      .then(res => {
        if (res.data.success) {
          setPoll(res.data.proposal);
        } else {
          setError('투표 정보를 불러올 수 없습니다.');
        }
      })
      .catch(err => {
        console.error("❌ 투표 상세 조회 오류:", err.response?.data || err);
        setError(err.response?.data?.message || '서버 연결 실패');
      });
  }, [topic]);

  const handleSelect = (idx) => {
    setSelected(idx); // 단일 선택
  };

  const handleSubmit = async () => {
    if (!poll) return;
    if (selected === null) {
      setError("⚠️ 옵션을 선택하세요.");
      return;
    }

    const submitVote = async () => {
      const payload = {
        proposal_topic: poll.topic,
        option: poll.options[selected],
      };

      const res = await API.post('/api/v1/vote/submit', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "X-User-Hash": localStorage.getItem("userHash"),
        },
      });

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
        setTimeout(() => navigate('/'), 1500);
      } else {
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
      } else if (err.response?.data?.status === "UNAUTHORIZED") {
        setError("⚠️ 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userHash");
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError("🚨 서버 연결 또는 요청 중 오류가 발생했습니다.");
      }
    }
  };

  if (error) return <div>{error}</div>;
  if (!poll) return <div>불러오는 중...</div>;

  return (
    <div className="proposal-form">
      <h2>{poll.topic}</h2>
      <div className="options-container">
        {poll.options.map((opt, idx) => (
          <div
            key={idx}
            className={`option-box ${selected === idx ? 'selected' : ''}`}
            onClick={() => handleSelect(idx)}
          >
            {opt}
          </div>
        ))}
      </div>
      <button className="submit-btn" onClick={handleSubmit}>투표 제출</button>
      {result && <p className="success-message">{result}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Submit;
