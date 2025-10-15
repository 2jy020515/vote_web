import React, { useState, useEffect } from 'react';
import { sha256 } from 'js-sha256';
import API from '../api/axiosConfig';
import explorerAPI from '../api/axiosExplorerConfig';
import '../App.css';

const BallotValidation = () => {
  const [userHash, setUserHash] = useState('');
  const [topic, setTopic] = useState('');
  const [option, setOption] = useState('');
  const [salt, setSalt] = useState('');
  const [ballotHash, setBallotHash] = useState('');
  const [proposalDetail, setProposalDetail] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userHash || !topic || !option || !salt) {
      setBallotHash('');
      return;
    }

    const hashedSalt = sha256(salt());
    const combined = `"${userHash()}"|"${topic()}"|"${option()}"|"${hashedSalt}"`;
    setBallotHash(sha256(combined));
  }, [userHash, topic, option, salt]);
  
  const fetchProposalDetail = async () => {
    if (!topic() || !userHash() || !option()) {
      setError('토픽, 유저 해시, 옵션, Salt를 모두 입력해주세요.');
      setProposalDetail(null);
      setSelectedBlock(null);
      return;
    }

    try {
      setError('');
      setLoading(true);
      setProposalDetail(null);
      setSelectedBlock(null);

      const res = await API.get(`/api/v1/query/proposal/${encodeURIComponent(topic.trim())}/detail`);

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
    setShowJson(false);

    try {
      const res = await explorerAPI.get(`/explorer/block?height=${height}`);
      setSelectedBlock(res.data);
    } catch (e) {
      setError('블록 조회 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="proposal-form block-explorer-container">
      <h2>투표지 검증</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="투표 이름 입력"
          value={topic}
          onChange={e => setTopic(e.target.value())}
          className="auth-input"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="유저 해시 입력"
          value={userHash}
          onChange={e => setUserHash(e.target.value())}
          className="auth-input"
        />
        <input
          type="text"
          placeholder="투표 옵션 입력"
          value={option}
          onChange={e => setOption(e.target.value())}
          className="auth-input"
        />
        <input
          type="text"
          placeholder="Salt 입력"
          value={salt}
          onChange={e => setSalt(e.target.value())}
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
        <div
          className="vote-detail-card"
          onClick={() => setShowJson(prev => !prev)}
          style={{
            cursor: 'pointer',
            marginTop: '20px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            background: '#fafafa'
          }}
        >
          <h3>블록 정보 (Height: {selectedBlock.block.header.height})</h3>
          <p><strong>Hash:</strong> {selectedBlock.block_hash}</p>
          <p><strong>Previous Hash:</strong> {selectedBlock.block.header.prev_block_hash}</p>
          <p><strong>Merkle Root:</strong> {selectedBlock.block.header.merkle_root}</p>

          <h4>투표 내역</h4>
          {selectedBlock.block.transactions.map((tx, idx) => (
            <div key={idx} className="vote-option" style={{ marginLeft: '10px', marginBottom: '5px' }}>
              <p><strong>옵션:</strong> {tx.option}</p>
              <p><strong>투표 해시:</strong> {tx.hash}</p>
              <p><strong>타임스탬프:</strong> {new Date(Number(tx.time_stamp / 1000000)).toLocaleString()}</p>
            </div>
          ))}

          {showJson && (
            <div
              className="raw-response"
              style={{
                marginTop: '10px',
                background: '#f0f0f0',
                padding: '10px',
                borderRadius: '5px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              <h4>원본 JSON 데이터</h4>
              <pre>{JSON.stringify(selectedBlock, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BallotValidation;
