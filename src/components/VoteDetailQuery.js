import React, { useState } from 'react';
import API from '../api/axiosConfig';
import '../App.css';

const VoteDetailQuery = () => {
  const [topic, setTopic] = useState('');
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState('');
  const [showJson, setShowJson] = useState(false);

  const handleSearch = async () => {
    setError('');
    setProposal(null);
    setShowJson(false);

    try {
      const res = await API.get(`/api/v1/query/proposal/${topic}/detail`);

      if (res.data.success) {
        setProposal(res.data.proposal);
      } else {
        setError('상세 조회 실패');
      }
    } catch {
      setError('서버 오류');
    }
  };

  return (
    <div className="proposal-form">
      <h2>토픽으로 투표 상세 조회</h2>
      <input
        type="text"
        placeholder="투표 이름 입력"
        value={topic}
        onChange={e => setTopic(e.target.value)}
      />
      <button onClick={handleSearch}>조회</button>

      {error && <div className="error-message">{error}</div>}

      {proposal && (
        <div
          className="vote-detail-card"
          onClick={() => setShowJson(prev => !prev)}
          style={{ cursor: 'pointer' }}
        >
          <h3>{proposal.topic}</h3>
          <p>투표 기간: {proposal.duration}분</p>
          <p>마감 여부: {proposal.expired ? '종료됨' : '진행 중'}</p>
          <p>생성일: {new Date(proposal.created_at).toLocaleString()}</p>
          <p>마감일: {new Date(proposal.expired_at).toLocaleString()}</p>
          <div className="vote-options">
            {proposal.options.map((opt, idx) => (
              <div key={idx} className="vote-option">
                {opt} ({proposal.result.options[opt] || 0})
              </div>
            ))}
          </div>
          <p>총 투표 수: {proposal.result.count}</p>

          {showJson && (
            <div className="raw-response" style={{ marginTop: '16px' }}>
              <h4>원본 JSON 데이터</h4>
              <pre>{JSON.stringify(proposal, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoteDetailQuery;
