const API_URL = 'http://64.226.104.45';

async function fetchOptions() {
    try {
        const response = await fetch(`${API_URL}/variants`);
        if (!response.ok) throw new Error('error variants');
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function fetchStatistics() {
    try {
        const response = await fetch(`${API_URL}/stat`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error('error stat');
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function submitVote(selectedOption) {
    try {
        const response = await fetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedOption }),
        });
        if (!response.ok) throw new Error('error vote');
    } catch (error) {
        console.error(error);
    }
}

async function resetStatistics() {
    try {
        const response = await fetch(`${API_URL}/reset`, { method: 'POST' });
        if (!response.ok) throw new Error('error reset');
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const options = await fetchOptions();
    const voteForm = document.getElementById('voteForm');
    const optionsContainer = document.getElementById('optionsContainer');

    options.forEach(option => {
        const label = document.createElement('label');
        label.innerHTML = `
        <input class="with-gap" type="radio" name="option" value="${option.code}" required />
        <span>${option.text}</span>
    `;
        optionsContainer.appendChild(label);
    });

    const statistics = await fetchStatistics();
    displayStatistics(statistics);

    voteForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const selectedOption = voteForm.elements['option'].value;
        await submitVote(selectedOption);
        const updatedStatistics = await fetchStatistics();
        displayStatistics(updatedStatistics);
    });

    document.getElementById('resetButton').addEventListener('click', async () => {
        await resetStatistics();
        const updatedStatistics = await fetchStatistics();
        displayStatistics(updatedStatistics);
    });

    function displayStatistics(statistics) {
        const statsContainer = document.getElementById('statisticsContainer');
        statsContainer.innerHTML = '';

        // Проверка на наличие голосов
        const totalVotes = Object.values(statistics).reduce((a, b) => a + b, 0);
        if (totalVotes === 0) {
            // Если все голоса равны нулю, не показываем статистику
            return;
        }

        Object.keys(statistics).forEach((key, index) => {
            const percentage = totalVotes ? (statistics[key] / totalVotes) * 100 : 0;
            const colorClass = index === 0 ? 'red' : index === 1 ? 'green' : 'blue';

            statsContainer.innerHTML += `
            <p>${key}: ${percentage.toFixed(2)}% (${statistics[key]} голосов)</p>
            <div class="progress">
                <div class="determinate ${colorClass}" style="width: ${percentage}%"></div>
            </div>
        `;
        });
    }


});

async function downloadStatistics(format) {
    try {
        const response = await fetch('/download', {
            headers: {
                'Accept': format
            }
        });
        const data = await response.blob();

        const fakeBtn = document.createElement('a');
        fakeBtn.href = window.URL.createObjectURL(new Blob([data]));
        fakeBtn.download = `statistics.${format.split('/')[1]}`;
        fakeBtn.click();
    } catch (error) {
        console.error('Ошибка при скачивании:', error);
    }
}

document.getElementById('saveXML').addEventListener('click', () => downloadStatistics('application/xml'));
document.getElementById('saveHTML').addEventListener('click', () => downloadStatistics('text/html'));
document.getElementById('saveJSON').addEventListener('click', () => downloadStatistics('application/json'));




