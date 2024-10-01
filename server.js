require('dotenv').config();
const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const app=express()
const PORT= process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res)=>{
    res.send('hi')
})

app.post('/submit', (req, res) => {
    const { selectedOption } = req.body;
    console.log(`Выбранный вариант: ${selectedOption}`);
    res.json({ message: `Выбранный вариант: ${selectedOption}` });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});