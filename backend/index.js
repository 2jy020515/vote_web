const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8080;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ✅ 투표 생성
app.post('/vote/proposal', (req, res) => {
  const { topic, options, type, multiple, duration } = req.body;

  if (!topic || !options || !type) {
    return res.status(400).send('Missing fields');
  }

  const poll = {
    id: uuidv4(),
    topic, // ✅ title → topic 변경
    type,
    multiple: type === 'binary' ? 1 : multiple,
    options,
    duration: duration || 2,
    votes: Object.fromEntries(options.map(opt => [opt, 0])),
    createdAt: new Date().toISOString()
  };

  let polls = [];
  if (fs.existsSync('polls.json')) {
    polls = JSON.parse(fs.readFileSync('polls.json', 'utf8'));
  }

  polls.push(poll);
  fs.writeFileSync('polls.json', JSON.stringify(polls, null, 2));

  res.status(201).json({ message: '투표가 생성되었습니다.', poll });
});

// ✅ 투표 제출
// 투표 제출 (hash + option + topic 기반)
app.post('/vote/submit', (req, res) => {
  const { hash, option, topic } = req.body;

  if (!hash || !option || !topic) {
    return res.status(400).json({ message: 'hash, option, topic 필드는 필수입니다.' });
  }

  if (!fs.existsSync('polls.json')) {
    return res.status(404).json({ message: '투표가 존재하지 않습니다.' });
  }

  const polls = JSON.parse(fs.readFileSync('polls.json', 'utf8'));
  const poll = polls.find(p => p.topic === topic);

  if (!poll) {
    return res.status(404).json({ message: '해당 topic의 투표를 찾을 수 없습니다.' });
  }

  if (!poll.options.includes(option)) {
    return res.status(400).json({ message: `유효하지 않은 선택지: ${option}` });
  }

  if (!poll.votes) {
    poll.votes = {};
  }

  if (!poll.votes[option]) {
    poll.votes[option] = 0;
  }

  poll.votes[option] += 1;

  // 저장
  const updatedPolls = polls.map(p => (p.id === poll.id ? poll : p));
  fs.writeFileSync('polls.json', JSON.stringify(updatedPolls, null, 2));

  res.json({ message: '투표가 성공적으로 등록되었습니다.', poll });
});

// ✅ 투표 목록 가져오기
app.get('/vote/list', (req, res) => {
  if (!fs.existsSync('polls.json')) {
    return res.json([]);
  }

  const polls = JSON.parse(fs.readFileSync('polls.json', 'utf8'));
  res.json(polls);
});

// ✅ 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
