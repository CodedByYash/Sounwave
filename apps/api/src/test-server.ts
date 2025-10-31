import express from 'express';

const app = express();
app.get('/', (_, res) => res.send('✅ Test server works!'));

app.listen(4000, () => console.log('✅ Test server running on port 4000'));
