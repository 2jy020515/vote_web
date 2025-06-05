import React, { useState } from 'react';
import axios from 'axios';
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
      setOptions([]);
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
  const removeOption = (index) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      topic,
      duration: Number(duration),
    };

    try {
      const res = await axios.post(`http://localhost:8080/vote/proposal`, payload);

      if (res.data.success === "true") {
        alert("✅ 투표가 정상적으로 생성되었습니다!");
      } else if (res.data.success === "false") {
        if (res.data.status === "PROPOSAL_ALREADY_OPEN") {
          alert("⚠️ 이미 동일한 이름의 투표가 진행 중입니다.");
        } else {
          alert(`❌ 알 수 없는 오류: ${res.data.message}`);
        }
      }
    } catch (err) {
      console.error("❌ 네트워크 오류 또는 서버 문제:", err);
      alert("서버와 연결할 수 없습니다.");
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
          /> 찬반 투표
        </label>
        <label>
          <input
            type="radio"
            checked={voteType === '안건'}
            onChange={() => handleVoteTypeChange('안건')}
          /> 안건 투표
        </label>
      </div>

      <label>투표 이름</label>
      <input
        type="text"
        placeholder="투표 이름을 입력해주세요."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <div style={{ marginBottom: '20px', marginTop: '10px' }}>
        <label>투표 기간 (분)</label>
        <input
          type="number"
          placeholder="예: 2"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min={1}
        />
      </div>

      {voteType === '안건' && options.length > 2 && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px', marginTop: '10px' }}>
          <label htmlFor="multipleSelect" style={{ fontWeight: 600, whiteSpace: 'nowrap', lineHeight: '32px' }}>
            중복 투표 허용
          </label>
          <select
            id="multipleSelect"
            style={{ width: '120px', height: '32px', fontSize: '14px', paddingTop: '6px' }}
            value={multiple}
            onChange={(e) => setMultiple(Number(e.target.value))}
          >
            <option value={0}>불허</option>
            {Array.from({ length: options.length - 2 }, (_, i) => i + 2).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      )}

      {voteType === '안건' && (
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
      )}

      {voteType === '안건' && (
        <button type="button" onClick={addOption} style={{ marginTop: '10px' }}>
          안건 추가
        </button>
      )}

      <button type="button" onClick={handleSubmit}>
        투표 생성
      </button>
    </div>
  );
};

export default Proposal;
