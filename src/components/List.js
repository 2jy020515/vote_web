import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const List = () => {
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); // 🔥 검색어 상태 추가
  const pollsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/api/v1/query/proposal/list')
      .then(res => {
        if (res.data.success) {
          setPolls(res.data.proposal_list || []);
        } else {
          setError('투표 목록을 불러올 수 없습니다.');
        }
      })
      .catch(err => {
        console.error("❌ 투표 목록 조회 오류:", err.response?.data || err);
        setError(err.response?.data?.message || '서버 오류');
      });
  }, []);

  const handleSelectPoll = async (poll) => {
    if (poll.expired) {
      if (selectedPoll && selectedPoll.topic === poll.topic) {
        setSelectedPoll(null);
        return;
      }
      try {
        const res = await API.get(`/api/v1/query/proposal/${poll.topic}/detail`);
        if (res.data.success) {
          setSelectedPoll(res.data.proposal);
        } else {
          setError("투표 상세 정보를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error(err);
        setError("서버 오류");
      }
    } else {
      navigate(`/submit/${encodeURIComponent(poll.topic)}`);
    }
  };

  const filteredPolls = polls
    .filter(poll => tab === 'active' ? !poll.expired : poll.expired)
    .filter(poll => poll.topic.toLowerCase().includes(searchQuery.toLowerCase()));

  const indexOfLastPoll = currentPage * pollsPerPage;
  const indexOfFirstPoll = indexOfLastPoll - pollsPerPage;
  const currentPolls = filteredPolls.slice(indexOfFirstPoll, indexOfLastPoll);
  const totalPages = Math.ceil(filteredPolls.length / pollsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="proposal-form">
      <h2>투표 목록</h2>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="토픽으로 검색..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="auth-input"
          style={{ width: '200%', maxWidth: '500px' }}
        />
      </div>

      <div className="radio-tab">
        <label>
          <input
            type="radio"
            name="poll-tab"
            value="active"
            checked={tab === 'active'}
            onChange={() => { setTab('active'); setCurrentPage(1); }}
          />
          진행 중인 투표
        </label>
        <label>
          <input
            type="radio"
            name="poll-tab"
            value="expired"
            checked={tab === 'expired'}
            onChange={() => { setTab('expired'); setCurrentPage(1); }}
          />
          마감된 투표
        </label>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="no-polls-message">
          {tab === 'active'
            ? '진행 중인 투표가 없습니다.'
            : '마감된 투표가 없습니다.'}
        </div>
      ) : (
        <>
          <div className="poll-list-vertical">
            {currentPolls.map(poll => (
              <div key={poll.topic} className="poll-item-wrapper">
                <button
                  className={`poll-card full-width ${poll.expired ? 'expired' : ''}`}
                  onClick={() => handleSelectPoll(poll)}
                >
                  {poll.topic}
                </button>

                {selectedPoll && selectedPoll.topic === poll.topic && poll.expired && (
                  <div className="proposal-detail">
                    <h3>{selectedPoll.topic}</h3>
                    <p>투표 기간: {selectedPoll.duration}분</p>
                    <p>마감 여부: {selectedPoll.expired ? '종료됨' : '진행 중'}</p>
                    <p>생성일: {new Date(selectedPoll.created_at).toLocaleString()}</p>
                    <p>마감일: {new Date(selectedPoll.expired_at).toLocaleString()}</p>
                    <div className="vote-options">
                      {selectedPoll.options.map((opt, idx) => (
                        <div key={idx} className="vote-option">
                          {opt} ({selectedPoll.result.options[opt] || 0})
                        </div>
                      ))}
                    </div>
                    <p>총 투표 수: {selectedPoll.result.count}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>이전</button>
              <span>{currentPage} / {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>다음</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default List;
