// 核心变量
const backendUrl = 'https://circle-click-game-api.onrender.com';
let score = 0;
let timer = 42;
let gameInterval;
let circleInterval;

// 获取页面元素
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');
const rankScreen = document.getElementById('rankScreen');
const startBtn = document.getElementById('startBtn');
const rankBtn = document.getElementById('rankBtn');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');
const backRankBtn = document.getElementById('backRankBtn');
const uploadBtn = document.getElementById('uploadBtn');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const finalScoreElement = document.getElementById('finalScore');
const usernameInput = document.getElementById('username');
const circleArea = document.getElementById('circleArea');
const rankList = document.getElementById('rankList');

// 1. 开始游戏
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    resetGame();
    startGame();
});

function startGame() {
    // 切换界面
    startScreen.style.display = 'none';
    endScreen.style.display = 'none';
    rankScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    // 重置数据
    score = 0;
    timer = 42;
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    circleArea.innerHTML = '';

    // 启动倒计时
    gameInterval = setInterval(() => {
        timer--;
        timerElement.textContent = timer;
        if (timer <= 0) {
            clearInterval(gameInterval);
            clearInterval(circleInterval);
            endGame();
        }
    }, 1000);

    // 生成第一个圆圈
    createCircle();
    // 持续生成圆圈（点击后生成新的，也可以定时生成，这里选点击生成更有挑战性）
}

// 2. 生成随机圆圈
function createCircle() {
    // 清除现有圆圈
    circleArea.innerHTML = '';

    // 随机位置（避免圆圈超出区域）
    const areaWidth = circleArea.clientWidth;
    const areaHeight = circleArea.clientHeight;
    const circleSize = Math.floor(Math.random() * 40) + 30; // 30-70px随机大小
    const maxX = areaWidth - circleSize;
    const maxY = areaHeight - circleSize;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);

    // 创建圆圈元素
    const circle = document.createElement('div');
    circle.className = 'circle';
    circle.style.width = `${circleSize}px`;
    circle.style.height = `${circleSize}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    // 点击圆圈加分并生成新圆圈
    circle.addEventListener('click', () => {
        score++;
        scoreElement.textContent = score;
        createCircle(); // 生成下一个圆圈
    });

    circleArea.appendChild(circle);
}

// 3. 游戏结束
function endGame() {
    gameScreen.style.display = 'none';
    endScreen.style.display = 'block';
    finalScoreElement.textContent = score;
}

// 4. 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    clearInterval(circleInterval);
    score = 0;
    timer = 42;
    circleArea.innerHTML = '';
}

// 5. 上传成绩到后端
uploadBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username || username.length < 2 || username.length > 6) {
        alert('请输入2-6个字的昵称！');
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/api/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                score: score
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('成绩上传成功！快去看看排行榜吧～');
            usernameInput.value = '';
        } else {
            alert('上传失败：' + data.message);
        }
    } catch (error) {
        alert('网络错误，无法上传成绩！请检查后端是否启动');
        console.error('上传失败：', error);
    }
});

// 6. 查看排行榜
rankBtn.addEventListener('click', loadRank);
backRankBtn.addEventListener('click', loadRank);
async function loadRank() {
    startScreen.style.display = 'none';
    endScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    rankScreen.style.display = 'block';

    try {
        const response = await fetch(`${backendUrl}/api/rank`);
        const data = await response.json();
        if (data.success) {
            renderRank(data.ranks);
        } else {
            rankList.innerHTML = '<p>加载排行榜失败</p>';
        }
    } catch (error) {
        rankList.innerHTML = '<p>网络错误，无法加载排行榜</p>';
        console.error('加载排行榜失败：', error);
    }
}

// 渲染排行榜
function renderRank(ranks) {
    if (ranks.length === 0) {
        rankList.innerHTML = '<p>暂无成绩，快来成为第一个上榜的玩家吧！</p>';
        return;
    }

    rankList.innerHTML = '';
    ranks.forEach((item, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item';
        rankItem.innerHTML = `
            <span class="rank-num">${index + 1}</span>
            <span class="rank-name">${item.username}</span>
            <span class="rank-score">${item.score}分</span>
        `;
        rankList.appendChild(rankItem);
    });
}

// 7. 返回首页
backBtn.addEventListener('click', () => {
    rankScreen.style.display = 'none';
    startScreen.style.display = 'block';
    resetGame();
});