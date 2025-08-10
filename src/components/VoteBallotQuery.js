import React, { useState } from 'react';
import API from '../api/axiosConfig';

const VoteBallotQuery = () => {
  const [hash, setHash] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setResult(null);

    const userHash = localStorage.getItem('userHash');
    if (!userHash) {
      setError('로그인 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }

    try {
      const res = await API.get(`/api/v1/query/${hash}/votes`);
      if (res.data.success) {
        setResult(res.data.ballot_list);
      } else {
        setError(`조회 실패: ${res.data.status}`);
      }
    } catch {
      setError('서버 오류');
    }
  };

  return (
    <div className="proposal-form">
      <h2>투표 해시로 내역 조회</h2>
      <input
        type="text"
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        placeholder="투표 해시값 입력"
      />
      <button onClick={handleSearch}>조회</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <ul>
          {result.map((item, idx) => (
            <li key={idx}>
              {item.topic} - {item.selected_options}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VoteBallotQuery;