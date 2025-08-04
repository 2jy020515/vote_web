import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import '../App.css';

const Submit = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/api/v1/vote/detail/${id}`)
      .then(res => {
        if (res.data.success) {
          setPoll(res.data.poll);
          if (res.data.poll.options) {
            setSelected(Array(res.data.poll.options.length).fill(false));
          }
        } else {
          setError('투표 정보를 불러올 수 없습니다.');
        }
      })
      .catch(() => setError('서버 연결 실패'));
  }, [id]);

  const handleSelect = (idx) => {
    if (!poll) return;
    if (poll.multiple === 0) {
      setSelected(selected.map((_, i) => i === idx));
    } else {
      const countSelected = selected.filter(s => s).length;
      if (!selected[idx] && countSelected >= poll.multiple) return;
      const newSelected = [...selected];
      newSelected[idx] = !newSelected[idx];
      setSelected(newSelected);
    }
  };

  const handleSubmit = () => {
    if (!poll) return;
    const selectedOptions = poll.options.filter((_, i) => selected[i]);
    if (selectedOptions.length === 0) {
      alert('하나 이상 선택해주세요.');
      return;
    }

    API.post('/api/v1/vote/submit', {
      proposalId: poll.id,
      options: selectedOptions,
    })
      .then(res => {
        if (res.data.success) {
          alert('투표 제출 완료');
          navigate('/');
        } else {
          alert('투표 제출 실패: ' + res.data.status);
        }
      })
      .catch(() => alert('서버 오류'));
  };

  if (error) return <div>{error}</div>;
  if (!poll) return <div>불러오는 중...</div>;

  return (
    <div className="proposal-form">
      <h2>{poll.topic}</h2>
      <div>
        {poll.options.map((opt, idx) => (
          <label key={idx} style={{ display: 'block', margin: '12px 0' }}>
            <input
              type={poll.multiple === 0 ? 'radio' : 'checkbox'}
              checked={selected[idx]}
              onChange={() => handleSelect(idx)}
            />
            {opt}
          </label>
        ))}
      </div>
      <button onClick={handleSubmit}>제출</button>
    </div>
  );
};

export default Submit;
