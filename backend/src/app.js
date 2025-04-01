import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import cors from 'cors';

const app = express();

// Add CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL (default Vite dev server port)
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Welcome to the PayPrompt Management API');
});

export default app;