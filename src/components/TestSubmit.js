import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import '../App.css';

const TestSubmit = () => {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/api/v1/query/proposal/list', { params: { expired: false } })
      .then(res => {
        if (res.data.success) {
          setPolls(res.data.proposal_list || []);
        } else {
          setError('투표 목록을 불러올 수 없습니다.');
        }
      })
      .catch(() => setError('서버 연결 실패'));
  }, []);

  const loadPoll = (topic) => {
    API.get(`/v1/vote/detail/${topic}`)
      .then(res => {
        console.log("📄 투표 상세 응답:", res.data);
        if (res.data.success) {
          setSelectedPoll(res.data.poll);
          setSelectedOption('');
        } else {
          setError('투표 정보를 불러올 수 없습니다.');
        }
      })
      .catch(() => setError('서버 연결 실패'));
  };

  const handleSubmit = async () => {
    setResult(null);
    setError('');

    const submitVote = async () => {
      const res = await API.post('/v1/vote/submit', {
        proposalId: selectedPoll.id,
        options: [selectedOption],
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

  return (
    <div className="proposal-form">
      <h2>투표 참여</h2>

      {!selectedPoll ? (
        <>
          <h3>진행 중인 투표 목록</h3>
          {polls.length === 0 ? (
            <p>진행 중인 투표가 없습니다.</p>
          ) : (
            <ul className="vote-list">
              {polls.map((poll, idx) => (
                <li
                  key={idx}
                  className="vote-list-item"
                  onClick={() => loadPoll(poll.topic)}
                >
                  {poll.topic}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <h3>{selectedPoll.topic}</h3>
          <div className="vote-options">
            {selectedPoll.options?.map((opt, idx) => (
              <label key={idx} className="vote-option">
                <input
                  type="radio"
                  name="voteOption"
                  value={opt}
                  checked={selectedOption === opt}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                {opt}
              </label>
            ))}
          </div>
          <button onClick={handleSubmit}>제출</button>
        </>
      )}

      {result && <p className="success-msg">{result}</p>}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
};

export default TestSubmit;
