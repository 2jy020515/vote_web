import React, { useState } from 'react';
import API from '../api/axiosConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../App.css';

const Proposal = () => {
  const [voteType, setVoteType] = useState('찬반');
  const [topic, setTopic] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [options, setOptions] = useState(['찬성', '반대']);

  const specialCharRegex = /[^가-힣a-zA-Z0-9 ]/;

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

    if (specialCharRegex.test(topic)) {
      alert('❌ 투표 이름에 특수문자를 포함할 수 없습니다.');
      return;
    }
    for (let opt of trimmedOptions) {
      if (specialCharRegex.test(opt)) {
        alert('❌ 안건(옵션)에는 특수문자를 포함할 수 없습니다.');
        return;
      }
    }

    if (!topic || !deadline || trimmedOptions.length < 2) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const now = new Date();
    const endTime = deadline;
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
        setDeadline(null);
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
      <DatePicker
        selected={deadline}
        onChange={(date) => setDeadline(date)}
        showTimeSelect
        timeIntervals={5}
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholderText="마감 기한을 선택해주세요"
        renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
            }}
          >
            <button
              onClick={decreaseMonth}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#000',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              {'<'}
            </button>

            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>

            <button
              onClick={increaseMonth}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#000',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              {'>'}
            </button>
          </div>
        )}
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

          <button type="button" className="add-option-btn" onClick={addOption}>
            안건 추가
          </button>
        </>
      )}

      <button type="button" className="submit-btn" onClick={handleSubmit}>
        투표 생성
      </button>
    </div>
  );
};

export default Proposal;
