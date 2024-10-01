require('dotenv').config();
const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app=express()
const PORT= process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res)=>{
    res.send('hi')
})

let votes = {
    1: 0,
    2: 0,
    3: 0
};

app.post('/submit', (req, res) => {
    const { selectedOption } = req.body;
    if (votes[selectedOption] !== undefined) {
        votes[selectedOption] += 1;
    }

    const statistics = {
        option1: votes[1],
        option2: votes[2],
        option3: votes[3]
    };

    fs.writeFile(path.json(__dirname, 'statistics.json'), JSON.stringify(statistics, null, 2), (err)=>{
        if (err) {
            console.error('Ошибка при записи в файл:', err);
            return res.status(500).json({ error: 'Ошибка при записи данных' });
        }
        res.json(statistics);
    })
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});