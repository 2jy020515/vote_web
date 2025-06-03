const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 8080;

app.use(bodyParser.json());

app.post('/topic/new', (req, res) => {
  const { topic, duration } = req.body;

  if (!topic || !duration) {
    return res.status(400).json({ message: 'topic과 duration을 입력하세요.' });
  }

  const poll = {
    id: uuidv4(),
    topic,
    duration,
    createdAt: new Date().toISOString(),
    votes: { "1": 0, "2": 0 }
  };

  let polls = [];
  if (fs.existsSync('polls.json')) {
    polls = JSON.parse(fs.readFileSync('polls.json', 'utf8'));
  }

  polls.push(poll);

  fs.writeFileSync('polls.json', JSON.stringify(polls, null, 2));
  res.status(201).json({ message: '투표가 생성되었습니다.', poll });
});

app.post('/vote/submit', (req, res) => {
  const { hash, option, topic } = req.body;

  if (!hash || !option || !topic) {
    return res.status(400).json({ message: 'hash, option, topic을 모두 입력하세요.' });
  }

  if (!fs.existsSync('polls.json')) {
    return res.status(404).json({ message: '투표가 존재하지 않습니다.' });
  }

  const polls = JSON.parse(fs.readFileSync('polls.json', 'utf8'));

  const poll = polls.find(p => p.topic === topic);
  if (!poll) {
    return res.status(404).json({ message: '해당 주제의 투표를 찾을 수 없습니다.' });
  }

  let voteLogs = {};
  if (fs.existsSync('vote_log.json')) {
    voteLogs = JSON.parse(fs.readFileSync('vote_log.json', 'utf8'));
  }

  if (voteLogs[hash] === topic) {
    return res.status(403).json({ message: '이미 이 주제에 투표하셨습니다.' });
  }

  if (!poll.votes[option]) poll.votes[option] = 0;
  poll.votes[option]++;

  voteLogs[hash] = topic;
  fs.writeFileSync('vote_log.json', JSON.stringify(voteLogs, null, 2));

  const updatedPolls = polls.map(p => (p.topic === topic ? poll : p));
  fs.writeFileSync('polls.json', JSON.stringify(updatedPolls, null, 2));

  res.json({ message: '투표가 완료되었습니다.', poll });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });

app.post('/vote/submit', (req, res) => {
    const { pollId, choice } = req.body;
  
    if (!pollId || !choice) {
      return res.status(400).json({ message: 'pollId와 choice를 입력하세요.' });
    }
  
    const pollsData = fs.readFileSync('polls.json');
    const polls = JSON.parse(pollsData);
  
    const poll = polls.find(p => p.id === pollId);
    if (!poll) {
      return res.status(404).json({ message: '해당 투표를 찾을 수 없습니다.' });
    }
  
    if (!poll.votes) {
      poll.votes = {};
    }
  
    if (!poll.votes[choice]) {
      poll.votes[choice] = 0;
    }
  
    poll.votes[choice] += 1;
  
    fs.writeFileSync('polls.json', JSON.stringify(polls, null, 2));
  
    res.json({ message: '투표가 성공적으로 등록되었습니다.' });
  });
  