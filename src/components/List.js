import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import '../App.css';

const List = () => {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await API.get('/api/v1/query/proposal/list', {
          params: { expired: false },
        });

        console.log('API 응답:', res.data);

        if (res.data.success && Array.isArray(res.data.proposal_list)) {
          const validPolls = res.data.proposal_list.filter(p => !p.expired);
          setPolls(validPolls);
        } else {
          setPolls([]);
        }
      } catch (err) {
        console.error('불러오기 실패:', err);
        setPolls([]);
      }
    };

    fetchPolls();
  }, []);

  const handleClick = (poll) => {
    if (poll.id) {
      navigate(`/submit/${poll.id}`);
    } else {
      alert('해당 투표에 ID 값이 없습니다.');
    }
  };

  return (
    <div className="proposal-form">
      <h2>투표 목록</h2>
      {polls.length === 0 ? (
        <p>진행 중인 투표가 없습니다.</p>
      ) : (
        <ul className="vote-list">
          {polls.map((poll, index) => (
            <li
              key={index}
              className="vote-list-item"
              onClick={() => handleClick(poll)}
            >
              {poll.topic}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default List;
