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

app.get('/download', (req, res) => {
    const filePath = path.join(__dirname, 'statistics.json');
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'Файл statistics.json не найден' });
        }

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при чтении файла' });
            }

            const statistics = JSON.parse(data);
            const acceptHeader = req.headers.accept;

            if (acceptHeader.includes('application/json')) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(statistics, null, 2));
            } else if (acceptHeader.includes('application/xml')) {
                let xmlData = '<?xml version="1.0" encoding="UTF-8"?>\n<statistics>\n';
                Object.keys(statistics).forEach(key => {
                    xmlData += `  <${key}>${statistics[key]}</${key}>\n`;
                });
                xmlData += '</statistics>';
                res.setHeader('Content-Type', 'application/xml');
                res.send(xmlData);
            } else if (acceptHeader.includes('text/html')) {
                let htmlData = `<!doctype html><html><head><title>Статистика</title></head><body><h1>Результаты</h1><ul>`;
                Object.keys(statistics).forEach(key => {
                    htmlData += `<li>${key}: ${statistics[key]}</li>`;
                });
                htmlData += '</ul></body></html>';
                res.setHeader('Content-Type', 'text/html');
                res.send(htmlData);
            } else {
                res.status(406).send('другой формат');
            }
        });
    });
});



app.listen(PORT, () => {
    console.log(`Сервер запущен`);
});