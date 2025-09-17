import React, { useState } from 'react';
import API from '../api/axiosConfig';
import '../App.css';

const VoteBallotQuery = () => {
  const [hash, setHash] = useState('');
  const [ballots, setBallots] = useState([]);
  const [error, setError] = useState('');
  const [selectedVote, setSelectedVote] = useState(null);

  const handleSearch = async () => {
    setError('');
    setBallots([]);
    setSelectedVote(null);

    const userHash = localStorage.getItem('userHash');
    if (!userHash) {
      setError('로그인 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }

    try {
      const res = await API.get(`/api/v1/query/${userHash}/votes`);
      if (res.data.success) {
        setBallots(res.data.ballot_list || []);
      } else {
        setError(`조회 실패: ${res.data.status}`);
      }
    } catch {
      setError('서버 오류');
    }
  };

  return (
    <div className="proposal-form">
      <h2>해시로 내역 조회</h2>
      <input
        type="text"
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        placeholder="유저 해시 입력"
      />
      <button onClick={handleSearch}>조회</button>

      {error && <div className="error-message">{error}</div>}

      {ballots.length > 0 && (
        <div className="vote-list">
          {ballots.map((ballot, idx) => (
            <div
              key={idx}
              className="vote-card"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                setSelectedVote(prev => prev === ballot ? null : ballot)
              }
            >
              <div className="vote-topic">{ballot.topic}</div>
              <div className="vote-date">
                투표일: {new Date(ballot.voted_at).toLocaleString()}
              </div>
              <div className="vote-options">
                {Object.entries(ballot.votes || {}).map(([opt, count], i) => (
                  <div key={i} className="vote-option">
                    {opt}: {count}
                  </div>
                ))}
              </div>
              <div>총 투표 수: {ballot.total_count || 0}</div>
            </div>
          ))}
        </div>
      )}

      {selectedVote && (
        <div className="raw-response" style={{ marginTop: '20px' }}>
          <h3>선택한 투표 정보</h3>
          <pre>{JSON.stringify(selectedVote, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default VoteBallotQuery;
