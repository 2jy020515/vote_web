import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import { sha256 } from 'js-sha256';
import '../App.css';

const Submit = () => {
  const { id: topic } = useParams();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [salt, setSalt] = useState('');
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
    setSelected(idx);
  };

  const handleSubmit = async () => {
    if (!poll) return;
    if (selected === null) {
      setError("⚠️ 옵션을 선택하세요.");
      return;
    }
    if (!salt) {
      setError("⚠️ Salt를 입력하세요.");
      return;
    }

    const submitVote = async () => {
      const userHash = localStorage.getItem("userHash");
      const combined = `${userHash}|${poll.topic}|${poll.options[selected]}|${salt}`;
      

      const payload = {
        topic: poll.topic,
        option: poll.options[selected],
        salt: salt,
      };

      const res = await API.post('/api/v1/vote/submit', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "X-User-Hash": userHash,
        },
      });

      const data = res.data;

      if (data.status === "REFRESHED_TOKEN") {
        const newAccessToken = res.headers['authorization']?.split(' ')[1];
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          return await submitVote();
        } else {
          throw new Error("새로운 액세스 토큰을 찾을 수 없습니다.");
        }
      }

      if (data.success === true || data.success === "true") {
        setResult("✅ 투표 제출 성공!");
        setError('');
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

  if (!poll) return <div>불러오는 중...</div>;

  return (
    <div className="proposal-form">
      <h2>{poll.topic}</h2>
  
      <div className="submit-options-container">
        {poll.options.map((opt, idx) => (
          <div
            key={idx}
            className={`submit-option-box ${selected === idx ? 'selected' : ''}`}
            onClick={() => handleSelect(idx)}
          >
            {opt}
          </div>
        ))}
      </div>
  
      <div className="salt-label">
  <span className="salt-title">SALT 입력칸 (필수)</span>
  <div className="tooltip-container">
    <button className="tooltip-btn" aria-label="Salt 설명">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
        <line x1="12" y1="16" x2="12" y2="12" strokeWidth="1.5" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </svg>
    </button>

    <div className="tooltip-content">
      <strong>Salt</strong>는 투표자의 해시를 더욱 안전하게 만들기 위해 사용하는
      <strong> 추가 문자열</strong>입니다.<br/>
      ⚠️ <em>입력한 Salt를 잊어버리면 이후 투표지 검증이 어려울 수 있으니 안전하게 보관하세요.</em>
    </div>
  </div>
</div>

  
      <input
        type="text"
        className="salt-input"
        placeholder="Salt를 입력하세요 (보안용)"
        value={salt}
        onChange={(e) => setSalt(e.target.value)}
      />
  
      <button className="submit-btn" onClick={handleSubmit}>투표 제출</button>
  
      {result && <p className="success-message">{result}</p>}
      {error && <p className="error-message">{error}</p>}
  
      <button
        className="back-link"
        onClick={() => navigate('/list')}
      >
        목록으로 돌아가기
      </button>
    </div>
  );
  
};

export default Submit;
