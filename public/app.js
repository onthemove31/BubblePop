let score = 0;
let gameInterval;

document.getElementById('start-game').addEventListener('click', startGame);

function startGame() {
    score = 0;
    document.getElementById('score').innerText = score;
    const bubbleArea = document.getElementById('bubble-area');
    bubbleArea.innerHTML = '';

    gameInterval = setInterval(() => {
        createBubble(bubbleArea);
    }, 1000);

    setTimeout(endGame, 30000);  // Game ends after 30 seconds
}

function createBubble(bubbleArea) {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.style.top = Math.random() * (bubbleArea.offsetHeight - 50) + 'px';
    bubble.style.left = Math.random() * (bubbleArea.offsetWidth - 50) + 'px';
    bubble.addEventListener('click', popBubble);

    bubbleArea.appendChild(bubble);

    setTimeout(() => {
        bubble.remove();
    }, 3000);  // Bubble disappears after 3 seconds
}

function popBubble(event) {
    event.target.remove();
    score++;
    document.getElementById('score').innerText = score;
}

function endGame() {
    clearInterval(gameInterval);
    saveScore(score);
    alert(`Game over! Your score is ${score}`);
}

function saveScore(score) {
    fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score })
    })
    .then(response => response.json())
    .then(data => {
        updateLeaderboard();
    });
}

function updateLeaderboard() {
    fetch('/api/leaderboard')
    .then(response => response.json())
    .then(data => {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        data.forEach(item => {
            const li = document.createElement('li');
            li.innerText = `Score: ${item.score}`;
            leaderboardList.appendChild(li);
        });
    });
}

window.onload = updateLeaderboard;
