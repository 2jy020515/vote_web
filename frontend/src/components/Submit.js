import { useParams } from 'react-router-dom';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const Submit = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/vote/list')
      .then(res => {
        const found = res.data.find(p => String(p.id) === String(id));
        if (found) setPoll(found);
      })
      .catch(() => setPoll(null));
  }, [id]);  

  if (!poll || !poll.options) return <p>잘못된 접근입니다.</p>;

  const { type, topic, options, multiple } = poll;

  const handleClick = (option) => {
    if (type === 'binary' || (type === 'agenda' && options.length === 2)) {
      setSelected([option]);
    } else {
      if (selected.includes(option)) {
        setSelected(selected.filter((o) => o !== option));
      } else if (selected.length < multiple) {
        setSelected([...selected, option]);
      }
    }
  };  

  const handleSubmit = async () => {
    const randomString = Math.random().toString(36).substring(2);
    const hash = CryptoJS.SHA256(randomString).toString(CryptoJS.enc.Hex);

    try {
      for (const option of selected) {
        await axios.post('http://localhost:8080/vote/submit', {
          hash,
          option,
          topic
        });
      }
      alert('투표가 제출되었습니다!');
    } catch (err) {
      console.error(err);
      alert('제출 실패');
    }
  };

  return (
    <div className="proposal-form">
      <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{topic}</label>
      <div className="options-row">
        {options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleClick(option)}
            style={{
              backgroundColor: selected.includes(option) ? 'black' : 'white',
              color: selected.includes(option) ? 'white' : 'black',
              fontWeight: selected.includes(option) ? 'bold' : 'normal',
              border: '2px solid black',
              borderRadius: '8px',
              padding: '10px 20px',
              margin: '5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <button type="button" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        투표 제출
      </button>
    </div>
  );
};

export default Submit;
