const payload = {
  nickname: '테스트후원자',
  amount: 5000,
  message: '림월드 레이드 테스트!'
};

const response = await fetch('http://localhost:33210/webhook/chzzk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

console.log(await response.json());
