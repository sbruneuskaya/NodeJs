require('dotenv').config();
const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app=express()
const PORT= process.env.PORT || 8000;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://node-ui.netlify.app'
    ]
}));
app.use(bodyParser.json());
app.get('/', (req, res)=>{
    res.send('hi')
})

let votes = {
    1: 0,
    2: 0,
    3: 0
};

const options = [
    { code: 1, text: 'Option 1' },
    { code: 2, text: 'Option 2' },
    { code: 3, text: 'Option 3' },
];

app.get('/variants', (req, res) => {
    res.json(options);
});

app.post('/vote', (req, res) => {
    const { selectedOption } = req.body;
    if (votes[selectedOption] !== undefined) {
        votes[selectedOption] += 1;
    }

    const statistics = {
        option1: votes[1],
        option2: votes[2],
        option3: votes[3]
    };

    fs.writeFile(path.join(__dirname, 'statistics.json'), JSON.stringify(statistics, null, 2), (err)=>{
        if (err) {
            console.error('Ошибка при записи в файл:', err);
            return res.status(500).json({ error: 'Ошибка при записи данных' });
        }
        res.json(statistics);
    })
});

app.post('/reset', (req, res)=>{
    votes = {
        1: 0,
        2: 0,
        3: 0
    };

    const emptyStatistics = {
        option1: 0,
        option2: 0,
        option3: 0
    };

    fs.writeFile(path.join(__dirname, 'statistics.json'), JSON.stringify(emptyStatistics, null, 2), (err)=>{
        if (err) {
            console.error('Ошибка при очистке файла статистики:', err);
            return res.status(500).json({ error: 'Ошибка при очистке файла' });
        }

        res.json({ message: 'Статистика сброшена', statistics: emptyStatistics });
    })
})

app.post('/stat', (req, res)=>{
    fs.readFile(path.join(__dirname, 'statistics.json'), 'utf8',(err, data)=>{
        if (err) {
            const statistics = {
                option1: votes[1],
                option2: votes[2],
                option3: votes[3]
            };
            return res.json(statistics);
        }

        const statistics = JSON.parse(data);
        res.json(statistics);
    })
})
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});