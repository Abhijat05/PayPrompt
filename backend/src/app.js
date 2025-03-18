import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Welcome to the Water Can Ledger Management API');
});

export default app;