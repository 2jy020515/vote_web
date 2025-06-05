import React, { useState } from 'react';
import axios from 'axios';

const TestSubmit = () => {
  const [topic, setTopic] = useState('');
  const [option, setOption] = useState('');
  const [hash, setHash] = useState('');

  const handleSubmit = async () => {
    const payload = { topic, option, hash };
  
    try {
      const res = await axios.post(`http://localhost:8080/vote/submit`, payload);
      console.log('응답 데이터:', res.data);
      
      if (res.data.success === "true") {
        alert("✅ 투표가 성공적으로 제출되었습니다!");
      } else if (res.data.success === "false") {
        switch (res.data.status) {
          case "DUPLICATE_VOTE_SUBMISSION":
            alert("⚠️ 이미 이 투표에 참여하셨습니다.");
            break;
          case "PROPOSAL_NOT_OPEN":
            alert("❌ 존재하지 않거나 진행 중이지 않은 투표입니다.");
            break;
          case "TIMEOUT_PROPOSAL":
            alert("⏳ 투표가 마감되어 제출할 수 없습니다.");
            break;
          default:
            alert(`❌ 알 수 없는 오류: ${res.data.message}`);
            break;
        }
      }
    } catch (err) {
      console.error("❌ 서버 오류 또는 연결 실패:", err);
      alert("서버 연결 중 문제가 발생했습니다.");
    }
  };  

  return (
    <div className="proposal-form">
      <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>투표 행사</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>투표 이름 (topic)</label><br />
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: 떡볶이"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>옵션 (선택지)</label><br />
        <input
          type="text"
          value={option}
          onChange={(e) => setOption(e.target.value)}
          placeholder="예: 찬성 또는 반대"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>해시값</label><br />
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="예: SHA256 해시값 입력"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <button onClick={handleSubmit} style={{ marginTop: '10px' }}>
        투표 제출
      </button>
    </div>
  );
};

export default TestSubmit;
