require('dotenv').config();
const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app=express()
const PORT= process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

let votes = {
    1: 0,
    2: 0,
    3: 0
};

const options = [
    { code: 1, text: 'Путешествия' },
    { code: 2, text: 'Спорт и активный отдых' },
    { code: 3, text: 'Чтение и творчество' },
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

app.get('/download/json', (req, res) => {
    fs.readFile(path.join(__dirname, 'statistics.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при чтении файла' });
        }

        res.setHeader('Content-Disposition', 'attachment; filename="statistics.json"');
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

app.get('/download/xml', (req, res) => {
    fs.readFile(path.join(__dirname, 'statistics.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при чтении файла' });
        }

        const statistics = JSON.parse(data);
        let xmlData = '<?xml version="1.0" encoding="UTF-8"?>\n<statistics>\n';
        Object.keys(statistics).forEach(key => {
            xmlData += `  <${key}>${statistics[key]}</${key}>\n`;
        });
        xmlData += '</statistics>';

        res.setHeader('Content-Disposition', 'attachment; filename="statistics.xml"');
        res.setHeader('Content-Type', 'application/xml');
        res.send(xmlData);
    });
});

app.get('/download/html', (req, res) => {
    fs.readFile(path.join(__dirname, 'statistics.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при чтении файла' });
        }

        const statistics = JSON.parse(data);
        let htmlData = `<!doctype html>
        <html lang="en">
        <head><meta charset="UTF-8"><title>Статистика</title></head>
        <body><h1>Результаты голосования</h1><ul>`;

        Object.keys(statistics).forEach(key => {
            htmlData += `<li>${key}: ${statistics[key]}</li>`;
        });

        htmlData += '</ul></body></html>';

        res.setHeader('Content-Disposition', 'attachment; filename="statistics.html"');
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlData);
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен`);
});