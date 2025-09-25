import React, { useState } from 'react';
import API from '../api/axiosConfig';
import '../App.css';

const Proposal = () => {
  const [voteType, setVoteType] = useState('찬반');
  const [topic, setTopic] = useState('');
  const [deadline, setDeadline] = useState(''); // 마감 기한 (날짜+시간)
  const [options, setOptions] = useState(['찬성', '반대']);

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
    if (!topic || !deadline || trimmedOptions.length < 2) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const now = new Date();
    const endTime = new Date(deadline);
    const diffMs = endTime - now;

    if (diffMs <= 0) {
      alert('❌ 마감 기한은 현재 시간 이후여야 합니다.');
      return;
    }

    const durationMinutes = Math.floor(diffMs / 1000 / 60);

    const payload = {
      topic,
      duration: durationMinutes,
      options: trimmedOptions,
    };

    try {
      const res = await API.post('/api/v1/vote/proposal', payload);

      if (res.data.success) {
        alert('✅ 투표가 정상적으로 생성되었습니다!');
        setTopic('');
        setDeadline('');
        setOptions(voteType === '찬반' ? ['찬성', '반대'] : ['', '']);
      } else {
        alert(res.data.message || '❌ 서버 오류가 발생했습니다.');
      }
    } catch (err) {
      if (err.response?.data?.message) {
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

      <label>마감 기한</label>
      <input
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
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

          {/* 기존 버튼 유지하되 클래스 추가해서 색만 바꿈 */}
          <button type="button" className="add-option-btn" onClick={addOption}>
            안건 추가
          </button>
        </>
      )}

      <button type="button" className="submit-btn" onClick={handleSubmit}>투표 생성</button>
    </div>
  );
};

export default Proposal;
