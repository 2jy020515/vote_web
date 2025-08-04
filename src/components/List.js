import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import '../App.css';

const List = () => {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/vote/list')
      .then(res => {
        const validPolls = res.data.filter(p => p.topic);
        setPolls(validPolls);
      })
      .catch(err => console.error('불러오기 실패:', err));
  }, []);

  const handleClick = (poll) => {
    navigate(`/submit/${poll.id}`);
  };

  return (
    <div className="proposal-form">
      <h2>투표 목록</h2>
      {polls.length === 0 ? (
        <p>투표가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {polls.map(poll => (
            <li
              key={poll.id}
              onClick={() => handleClick(poll)}
              style={{
                cursor: 'pointer',
                margin: '10px 0',
                fontWeight: 'bold',
                padding: '12px 16px',
                border: '2px solid black',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: 'black',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
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
