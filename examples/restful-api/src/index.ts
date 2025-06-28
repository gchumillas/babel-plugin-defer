import express from 'express';
import { getHello, getStatus } from './controllers';

const app = express();
const port = process.env.PORT || 3000;

app.get('/hello', getHello);
app.get('/status', getStatus);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
