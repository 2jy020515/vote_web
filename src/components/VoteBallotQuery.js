import React, { useState } from 'react';
import API from '../api/axiosConfig';
import '../App.css';

const VoteBallotQuery = () => {
  const [hash, setHash] = useState('');
  const [ballots, setBallots] = useState([]);
  const [error, setError] = useState('');
  const [selectedVote, setSelectedVote] = useState(null);
  const [showJson, setShowJson] = useState(false);

  const handleSearch = async () => {
    setError('');
    setBallots([]);
    setSelectedVote(null);
    setShowJson(false);

    const userHash = localStorage.getItem('userHash');
    if (!userHash) {
      setError('로그인 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }

    try {
      const res = await API.get(`/api/v1/query/${userHash}/votes`);
      if (res.data.success) {
        const list = res.data.ballot_list || [];

        const detailedList = await Promise.all(
          list.map(async (ballot) => {
            try {
              const detailRes = await API.get(
                `/api/v1/query/proposal/${encodeURIComponent(ballot.topic)}/detail`
              );
              if (detailRes.data.success) {
                return { ...ballot, ...detailRes.data.proposal };
              }
            } catch {
              return ballot;
            }
            return ballot;
          })
        );

        setBallots(detailedList);
      } else {
        setError(`조회 실패: ${res.data.status}`);
      }
    } catch {
      setError('서버 오류');
    }
  };

  const handleSelectVote = async (ballot) => {
    setError('');
    setSelectedVote(null);
    setShowJson(false);

    try {
      const res = await API.get(
        `/api/v1/query/proposal/${encodeURIComponent(ballot.topic)}/detail`
      );
      if (res.data.success) {
        setSelectedVote(res.data.proposal);
      } else {
        setError(`상세조회 실패: ${res.data.status}`);
      }
    } catch {
      setError('상세조회 서버 오류');
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
              onClick={() => handleSelectVote(ballot)}
            >
              <div className="vote-topic">{ballot.topic}</div>
              <div className="vote-date">
                투표 기간:{' '}
                {ballot.created_at && ballot.expired_at
                  ? `${new Date(ballot.created_at).toLocaleDateString()} ~ ${new Date(ballot.expired_at).toLocaleDateString()}`
                  : '정보 없음'}
              </div>
              <div>총 투표 수: {ballot.result?.count || 0}</div>
            </div>
          ))}
        </div>
      )}

      {selectedVote && (
        <div className="raw-response" style={{ marginTop: '20px' }}>
          <h3>선택한 투표 정보</h3>
          <p><strong>제안자:</strong> {selectedVote.proposer || '정보 없음'}</p>
          <p>
            <strong>생성일:</strong>{' '}
            {selectedVote.created_at
              ? new Date(selectedVote.created_at).toLocaleString()
              : '정보 없음'}
          </p>
          <p>
            <strong>마감일:</strong>{' '}
            {selectedVote.expired_at
              ? new Date(selectedVote.expired_at).toLocaleString()
              : '정보 없음'}
          </p>
          <p>
            <strong>투표 기간:</strong>{' '}
            {selectedVote.created_at && selectedVote.expired_at
              ? `${new Date(selectedVote.created_at).toLocaleDateString()} ~ ${new Date(selectedVote.expired_at).toLocaleDateString()}`
              : '정보 없음'}
          </p>
          <h4>옵션별 투표 결과</h4>
          <ul>
            {selectedVote.options.map((opt, i) => (
              <li key={i}>
                {opt}: {selectedVote.result?.options?.[opt] || 0}
              </li>
            ))}
          </ul>
          <p><strong>총 투표 수:</strong> {selectedVote.result?.count || 0}</p>

          <button
            style={{ marginTop: '10px' }}
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? '원본 JSON 닫기' : '원본 JSON 보기'}
          </button>

          {showJson && (
            <pre
              style={{
                marginTop: '10px',
                background: '#f4f4f4',
                padding: '10px',
              }}
            >
              {JSON.stringify(selectedVote, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default VoteBallotQuery;
