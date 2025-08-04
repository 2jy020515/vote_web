import React, { useState } from 'react';
import API from '../api/axiosConfig';

const VoteDetailQuery = () => {
  const [topic, setTopic] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setDetail(null);

    try {
      const res = await API.get('/api/v1/vote/detail', { params: { topic } });
      if (res.data.success) {
        setDetail(res.data.poll);
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
        placeholder="토픽 입력"
        value={topic}
        onChange={e => setTopic(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {detail && (
        <div>
          <h3>{detail.topic}</h3>
          <p>투표 기간: {detail.duration}분</p>
          <p>옵션: {detail.options.join(', ')}</p>
          <p>중복 투표 허용: {detail.multiple === 0 ? '불허' : detail.multiple}</p>
        </div>
      )}
    </div>
  );
};

export default VoteDetailQuery;
