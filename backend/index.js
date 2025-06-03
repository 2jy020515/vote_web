const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8080;

app.use(cors({
  origin: '*', // 개발용 전체 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // JSON 파싱

// ✅ 투표 생성
app.post('/vote/proposal', (req, res) => {
  const { title, type, options, multiple } = req.body;

  if (!title || !type || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: 'title, type, options를 모두 입력하세요 (2개 이상)' });
  }

  const poll = {
    id: uuidv4(),
    title,
    type, // 'binary' | 'agenda'
    multiple: type === 'binary' ? 1 : multiple,
    options,
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
app.post('/vote/submit', (req, res) => {
  const { pollId, choices } = req.body;

  if (!pollId || !choices || !Array.isArray(choices)) {
    return res.status(400).json({ message: 'pollId와 choices[]를 입력하세요.' });
  }

  if (!fs.existsSync('polls.json')) {
    return res.status(404).json({ message: '투표가 존재하지 않습니다.' });
  }

  const polls = JSON.parse(fs.readFileSync('polls.json', 'utf8'));
  const poll = polls.find(p => p.id === pollId);

  if (!poll) {
    return res.status(404).json({ message: '해당 투표를 찾을 수 없습니다.' });
  }

  if (!poll.votes) {
    poll.votes = {};
  }

  for (const choice of choices) {
    if (!poll.options.includes(choice)) {
      return res.status(400).json({ message: `유효하지 않은 선택지: ${choice}` });
    }
    if (!poll.votes[choice]) {
      poll.votes[choice] = 0;
    }
    poll.votes[choice] += 1;
  }

  // 저장
  const updatedPolls = polls.map(p => (p.id === pollId ? poll : p));
  fs.writeFileSync('polls.json', JSON.stringify(updatedPolls, null, 2));

  res.json({ message: '투표가 성공적으로 등록되었습니다.', poll });
});

// ✅ 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

app.get('/vote/list', (req, res) => {
  if (!fs.existsSync('polls.json')) {
    return res.json([]);
  }

  const polls = JSON.parse(fs.readFileSync('polls.json', 'utf8'));
  res.json(polls);
});
