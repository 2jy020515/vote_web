import React, { useState } from 'react';
import API from '../api/axiosConfig';
import '../App.css';

const VoteListQuery = () => {
  const [form, setForm] = useState({
    summarize: true,
    expired: true,
    sortOrder: 'desc',
    sortBy: 'expiredAt',
    page: 1,
    limit: 15,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVote, setSelectedVote] = useState(null); // 클릭한 투표 JSON 상태

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]:
        type === 'checkbox'
          ? e.target.checked
          : value === 'true'
          ? true
          : value === 'false'
          ? false
          : value,
    });
  };

  const fetchVotes = async () => {
    const token = localStorage.getItem('accessToken');
    const userHash = localStorage.getItem('userHash');

    if (!token || !userHash) {
      setError({ message: '로그인이 필요합니다.' });
      return;
    }

    try {
      const res = await API.get(`/api/v1/query/proposal/list`, {
        params: form,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-Hash': userHash,
        },
      });

      if (res.data.success && res.data.status === 'REFRESH_TOKEN') {
        const newToken = res.data.access_token;
        localStorage.setItem('accessToken', newToken);

        const retryRes = await API.get(`/api/v1/query/proposal/list`, {
          params: form,
          headers: {
            Authorization: `Bearer ${newToken}`,
            'X-User-Hash': userHash,
          },
        });
        setResult(retryRes.data);
      } else {
        setResult(res.data);
      }

      setError(null);
    } catch (err) {
      if (
        err.response?.data?.status === 'UNAUTHORIZED' ||
        err.response?.status === 401
      ) {
        setError({ message: '로그인 세션이 만료되었습니다. 다시 로그인 해주세요.' });
      } else {
        setError(err.response?.data || { message: '알 수 없는 오류 발생' });
      }
      setResult(null);
    }
  };

  return (
    <div className="proposal-form">
      <h2>투표 목록 조회</h2>

      <label>요약 여부</label>
      <select name="summarize" value={form.summarize} onChange={handleChange}>
        <option value={true}>예</option>
        <option value={false}>아니오</option>
      </select>

      <label>마감 여부</label>
      <select name="expired" value={form.expired} onChange={handleChange}>
        <option value={true}>마감됨</option>
        <option value={false}>마감 안 됨</option>
      </select>

      <label>정렬 순서</label>
      <select name="sortOrder" value={form.sortOrder} onChange={handleChange}>
        <option value="asc">오름차순</option>
        <option value="desc">내림차순</option>
      </select>

      <label>정렬 기준</label>
      <select name="sortBy" value={form.sortBy} onChange={handleChange}>
        <option value="topic">주제</option>
        <option value="expiredAt">마감일</option>
        <option value="createAt">생성일</option>
        <option value="result.count">투표 수</option>
      </select>

      <label>페이지</label>
      <input type="number" name="page" value={form.page} onChange={handleChange} />

      <label>한 페이지당 개수</label>
      <input type="number" name="limit" value={form.limit} onChange={handleChange} />

      <button onClick={fetchVotes}>목록 조회</button>

      {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error.message}</div>}

      {result && result.proposal_list && (
        <div className="vote-list" style={{ marginTop: '20px' }}>
          {result.proposal_list.map((proposal, idx) => (
            <div
              key={idx}
              className="vote-card"
              style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', cursor: 'pointer' }}
              onClick={() =>
                setSelectedVote(prev => prev === proposal ? null : proposal)
              }
            >
              <div className="vote-topic" style={{ fontWeight: 'bold' }}>{proposal.topic}</div>
              <div className="vote-expired">{proposal.expired ? '종료됨' : '진행 중'}</div>
              <div className="vote-date">마감일: {new Date(proposal.expired_at).toLocaleString()}</div>
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

export default VoteListQuery;
