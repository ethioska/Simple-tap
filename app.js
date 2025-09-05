let score = 0;
let timer = 10;
const USER_ID = "USER123"; // Replace with actual Telegram user ID

function startGame() {
    score = 0;
    timer = 10;
    document.getElementById("score").innerText = score;
    document.getElementById("timer").innerText = timer;

    const interval = setInterval(() => {
        timer--;
        document.getElementById("timer").innerText = timer;
        if (timer <= 0) {
            clearInterval(interval);
            endGame(score);
        }
    }, 1000);
}

function tap() {
    score++;
    document.getElementById("score").innerText = score;
}

function endGame(finalScore) {
    fetch("/bot/reward", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ userId: USER_ID, score: finalScore })
    })
    .then(res => res.json())
    .then(data => alert(`You earned ${data.reward} TON!`));
}
