import React, { useState } from 'react';
import API from '../api/axiosConfig';
import '../App.css';

const Proposal = () => {
  const [voteType, setVoteType] = useState('찬반');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [options, setOptions] = useState(['찬성', '반대']);
  const [multiple, setMultiple] = useState(0);

  const handleVoteTypeChange = (type) => {
    setVoteType(type);
    if (type === '찬반') {
      setOptions(['찬성', '반대']);
    } else {
      setOptions(['', '']);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const trimmedOptions = options.map(opt => opt.trim()).filter(opt => opt !== '');
    if (!topic || !duration || trimmedOptions.length < 2) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const payload = {
      topic,
      duration: Number(duration),
      options: trimmedOptions,
      // multiple,
    };

    try {
      const res = await API.post('/api/v1/vote/proposal', payload);

      if (res.data.success) {
        alert('✅ 투표가 정상적으로 생성되었습니다!');
        setTopic('');
        setDuration('');
        setOptions(voteType === '찬반' ? ['찬성', '반대'] : ['', '']);
        setMultiple(0);
      } else {
        alert(res.data.message || '❌ 서버 오류가 발생했습니다.');
      }
    } catch (err) {
      // 서버 응답 메시지 확인
      if (err.response && err.response.data && err.response.data.message) {
        alert(`❌ ${err.response.data.message}`);
      } else {
        alert('🚨 서버와 연결할 수 없습니다.');
      }
      console.error(err.response ? err.response.data : err);
    }
  };

  return (
    <div className="proposal-form">
      <label>투표 유형</label>
      <div className="radio-group">
        <label>
          <input
            type="radio"
            checked={voteType === '찬반'}
            onChange={() => handleVoteTypeChange('찬반')}
          />
          찬반 투표
        </label>
        <label>
          <input
            type="radio"
            checked={voteType === '안건'}
            onChange={() => handleVoteTypeChange('안건')}
          />
          안건 투표
        </label>
      </div>

      <label>투표 이름</label>
      <input
        type="text"
        placeholder="투표 이름을 입력해주세요."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <label>투표 기간 (분)</label>
      <input
        type="number"
        placeholder="예: 30"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        min={1}
      />

      {voteType === '안건' && (
        <>
          <div className="options-grid">
            {options.map((opt, idx) => (
              <div key={idx} className="option-box">
                <input
                  type="text"
                  placeholder={`안건 ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                />
                {options.length > 2 && idx >= 2 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeOption(idx)}
                    aria-label="삭제"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addOption}>
            안건 추가
          </button>

          <label>중복 투표 허용</label>
          <select
            value={multiple}
            onChange={(e) => setMultiple(Number(e.target.value))}
          >
            <option value={0}>불허</option>
            {Array.from({ length: options.length - 2 }, (_, i) => i + 2).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </>
      )}

      <button type="button" onClick={handleSubmit}>투표 생성</button>
    </div>
  );
};

export default Proposal;
