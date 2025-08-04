import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import './BlockExplorer.css';

const BlockExplorer = () => {
  const [mode, setMode] = useState('auto');
  const [inputText, setInputText] = useState('');
  const [hash, setHash] = useState('');
  const [blockData, setBlockData] = useState([]);
  const [autoBlockData, setAutoBlockData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inputText.trim() === '') {
      setHash('');
      setAutoBlockData(null);
      setError('');
      return;
    }
    setHash(sha256(inputText));
  }, [inputText]);

  useEffect(() => {
    if (mode === 'auto' && hash) {
      setError('');
      setAutoBlockData(null);
      axios
        .get(`/api/v1/vote/block`, {
          headers: { 'X-User-Hash': hash },
        })
        .then(({ data }) => {
          const { success, status, data: blocks } = data;
          if (success && blocks) {
            setAutoBlockData(blocks);
          } else {
            setError(`오류: ${status}`);
          }
        })
        .catch(() => {
          setError('네트워크 오류 또는 API 응답 실패');
        });
    }
  }, [mode, hash]);

  useEffect(() => {
    if (mode === 'manual') {
      setError('');
      setAutoBlockData(null);
      axios
        .get(`/api/v1/vote/block/all`)
        .then(({ data }) => {
          const { success, status, data: blocks } = data;
          if (success && blocks) {
            setBlockData(blocks);
          } else {
            setError(`오류: ${status}`);
          }
        })
        .catch(() => {
          setError('네트워크 오류 또는 API 응답 실패');
        });
    } else {
      setBlockData([]);
    }
  }, [mode]);

  const onModeChange = (e) => {
    setMode(e.target.value);
    setError('');
  };

  return (
    <div className="proposal-form block-explorer-container">
      <h2>사용자 블록 조회</h2>

      <div className="radio-group" style={{ marginBottom: 20 }}>
        <label>
          <input
            type="radio"
            name="mode"
            value="auto"
            checked={mode === 'auto'}
            onChange={onModeChange}
          />{' '}
          자동
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="manual"
            checked={mode === 'manual'}
            onChange={onModeChange}
          />{' '}
          수동
        </label>
      </div>

      <input
        type="text"
        placeholder="검색할 값을 입력하세요"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="auth-input"
        autoComplete="off"
      />
      <input
        type="text"
        placeholder="SHA-256 해시값"
        value={hash}
        readOnly
        className="auth-input"
        style={{ backgroundColor: '#f0f0f0', marginBottom: 20 }}
      />

      {error && <div className="error-box">{error}</div>}

      {/* 자동 모드 결과 */}
      {mode === 'auto' && autoBlockData && (
        <div className="block-result">
          <h3>조회 결과 (자동 모드)</h3>
          <table>
            <thead>
              <tr>
                <th>블록 해시</th>
                <th>이전 해시</th>
                <th>타임스탬프</th>
                <th>투표지 내용</th>
              </tr>
            </thead>
            <tbody>
              {autoBlockData.map((block, idx) => (
                <tr key={idx}>
                  <td>{block.hash}</td>
                  <td>{block.previous_hash}</td>
                  <td>{block.timestamp}</td>
                  <td>{block.vote_content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 수동 모드 결과 */}
      {mode === 'manual' && blockData.length > 0 && (
        <div className="block-result">
          <h3>전체 블록 목록 (수동 모드)</h3>
          <table>
            <thead>
              <tr>
                <th>블록 해시</th>
                <th>이전 해시</th>
                <th>타임스탬프</th>
                <th>투표지 내용</th>
              </tr>
            </thead>
            <tbody>
              {blockData.map((block, idx) => {
                const isIncluded =
                  block.hash === hash ||
                  (typeof block.vote_content === 'string' && block.vote_content.includes(hash));

                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: isIncluded ? '#cce5ff' : 'transparent',
                      fontWeight: isIncluded ? 'bold' : 'normal',
                    }}
                  >
                    <td>{block.hash}</td>
                    <td>{block.previous_hash}</td>
                    <td>{block.timestamp}</td>
                    <td>{block.vote_content}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlockExplorer;
