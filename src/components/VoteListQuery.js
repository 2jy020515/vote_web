import React, { useState } from 'react';
import axios from 'axios';
//import API from '../api/axiosConfig';

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
    try {
      const res = await axios.get(
        `/api/v1/auth/list-query`,
        { params: form }
      );
      setResult(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || { message: '알 수 없는 오류 발생' });
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
