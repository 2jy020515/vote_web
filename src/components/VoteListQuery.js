import React, { useState } from 'react';
import axios from 'axios';

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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? e.target.checked : value,
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
      const res = await axios.get(
        `/api/v1/query/proposal/list`,
        {
          params: form,
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-Hash': userHash,
          },
        }
      );
      if (res.data.success && res.data.status === 'REFERSH_TOKEN') {
        const newToken = res.data.access_token;
        localStorage.setItem('accessToken', newToken);
        const retryRes = await axios.get(`/api/v1/query/proposal/list`, {
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

      <label>summarize</label>
      <select name="summarize" value={form.summarize} onChange={handleChange}>
        <option value={true}>true</option>
        <option value={false}>false</option>
      </select>

      <label>expired</label>
      <select name="expired" value={form.expired} onChange={handleChange}>
        <option value={true}>true</option>
        <option value={false}>false</option>
      </select>

      <label>sortOrder</label>
      <select name="sortOrder" value={form.sortOrder} onChange={handleChange}>
        <option value="asc">asc</option>
        <option value="desc">desc</option>
      </select>

      <label>sortBy</label>
      <select name="sortBy" value={form.sortBy} onChange={handleChange}>
        <option value="topic">topic</option>
        <option value="expiredAt">expiredAt</option>
        <option value="createAt">createAt</option>
        <option value="result.count">result.count</option>
      </select>

      <label>page</label>
      <input type="number" name="page" value={form.page} onChange={handleChange} />

      <label>limit</label>
      <input type="number" name="limit" value={form.limit} onChange={handleChange} />

      <button onClick={fetchVotes}>목록 조회</button>

      {result && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
};

export default VoteListQuery;
