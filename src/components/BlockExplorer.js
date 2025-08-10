import React, { useState, useEffect } from 'react';
import { sha256 } from 'js-sha256';
import axios from 'axios';
import API from '../api/axiosConfig';
import './BlockExplorer.css';

const BlockExplorer = () => {
  const [userHash, setUserHash] = useState('');
  const [topic, setTopic] = useState('');
  const [option, setOption] = useState('');
  const [ballotHash, setBallotHash] = useState('');
  const [proposalDetail, setProposalDetail] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userHash || !topic || !option) {
      setBallotHash('');
      return;
    }
    const combined = `"${userHash}"|"${topic}"|"${option}"`;
    setBallotHash(sha256(combined));
  }, [userHash, topic, option]);

  const fetchProposalDetail = async () => {
    if (!topic || !userHash || !option) {
      setError('토픽, 유저 해시, 옵션을 모두 입력해주세요.');
      setProposalDetail(null);
      setSelectedBlock(null);
      return;
    }

    try {
      setError('');
      setLoading(true);
      setProposalDetail(null);
      setSelectedBlock(null);

      const res = await API.get(`/api/v1/query/proposal/${encodeURIComponent(topic)}/detail`);

      if (res.data.success && res.data.proposal) {
        if (res.data.proposal.block_heights && res.data.proposal.block_heights.length > 0) {
          setProposalDetail(res.data.proposal);
        } else {
          setProposalDetail(null);
          setError('투표 관련 블록이 없습니다.');
        }
      } else {
        setProposalDetail(null);
        setError('투표 상세 내역을 찾을 수 없습니다.');
      }
    } catch (e) {
      setProposalDetail(null);
      setError('투표 상세 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockData = async (height) => {
    setError('');
    setSelectedBlock(null);

    try {
      const res = await axios.get(`http://l4.ai-capstone.store/block/query?height=${height}`);
      setSelectedBlock(res.data);
    } catch (e) {
      setError('블록 조회 중 오류가 발생했습니다.');
    }
  };

  const renderHighlightedJSON = (obj) => {
    const jsonString = JSON.stringify(obj, null, 2);
    const hashLower = ballotHash.toLowerCase();
  
    const regex = new RegExp(`(${hashLower})`, 'gi');
  
    const parts = [];
    let lastIndex = 0;
  
    let match;
    while ((match = regex.exec(jsonString.toLowerCase())) !== null) {
      const start = match.index;
      const end = start + match[0].length;
  
      parts.push(jsonString.slice(lastIndex, start));
      parts.push(
        <span key={start} style={{ color: 'blue', fontWeight: 'bold' }}>
          {jsonString.slice(start, end)}
        </span>
      );
      lastIndex = end;
    }
    parts.push(jsonString.slice(lastIndex));
  
    return parts;
  };
  

  return (
    <div className="proposal-form block-explorer-container">
      <h2>블록 조회</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="투표 이름 입력"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="auth-input"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="유저 해시 입력"
          value={userHash}
          onChange={e => setUserHash(e.target.value)}
          className="auth-input"
        />
        <input
          type="text"
          placeholder="투표 옵션 입력"
          value={option}
          onChange={e => setOption(e.target.value)}
          className="auth-input"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="계산된 ballot hash (SHA-256)"
          value={ballotHash}
          readOnly
          className="auth-input"
          style={{ backgroundColor: '#f0f0f0' }}
        />
      </div>

      <button onClick={fetchProposalDetail} className="auth-button" style={{ marginBottom: 20 }}>
        블록 조회
      </button>

      {loading && <div>로딩 중...</div>}

      {error && <div className="error-box">{error}</div>}

      {proposalDetail && (
        <div style={{ marginBottom: 20 }}>
          <h3>투표 관련 블록 목록</h3>
          {proposalDetail.block_heights.map(({ height }) => (
            <button
              key={height}
              style={{ margin: '5px' }}
              onClick={() => fetchBlockData(height)}
            >
              블록 높이: {height}
            </button>
          ))}
        </div>
      )}

{selectedBlock && (
  <div className="block-result" style={{ marginTop: 20 }}>
    <h3>블록 JSON 응답</h3>
    <pre
      style={{
        background: '#f4f4f4',
        padding: '10px',
        borderRadius: '5px',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {renderHighlightedJSON(selectedBlock)}
    </pre>
  </div>
)}

    </div>
  );
};

export default BlockExplorer;
