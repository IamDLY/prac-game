/**
 * Created by dly on 2017/2/22.
 */
var f;
class GameControl {
    constructor(cId, time, rank, startBtn) {
        // 获取canvas元素
        this.canvas = document.getElementById(cId);
        // 初始化UI对象
        this.ui = new UI(cId, time, rank);
        // 初始化score对象
        this.score = new Score();
        // 绘制棋盘
        this.ui.drawPlate();
        // 初始化时间
        this.time = 0;
        // 计时器
        this.timeout = true;
        // 初始化当前玩家
        this.player = 0;
        // 初始化游戏状态
        this.status = 0;
        // 获取排名数据
        let rankList = this.getRankList();
        if (rankList.error == 1) {
            this.ui.setRankList('');
            console.log('1');
        } else {
            this.ui.setRankList(rankList.data);
            console.log('2');
        }
        // 获取开始按钮
        this.startBtn = document.getElementById(startBtn);
        // 绑定开始事件
        this.startBtn.onclick = this.startGame.bind(this);
    }

    /**
     * 计时
     */
    calTime() {
        if (!this.timeout) {
            return;
        }
        this.ui.setTime(this.time);
        this.time++;
        f = this.calTime.bind(this);
        window.setTimeout('f()', 1000);
    }

    startGame() {
        console.log('开始游戏！');
        localStorage.setItem('restart', 'no');
        this.player = 1;
        this.status = 1;
        this.calTime();
        this.canvas.onclick = this.playerDown.bind(this);
        this.startBtn.setAttribute('disabled', 'disabled');
    }

    playerDown(e) {
        if (this.player != 1) {
            alert('还没有轮到你！');
            return;
        } else if (this.status == 0) {
            alert('游戏已经结束！');
            return;
        }

        let xi = Math.floor(e.offsetX / 30);
        let yi = Math.floor(e.offsetY / 30);

        if (this.score.checkPoint(xi, yi)) {
            // 绘制棋子
            this.ui.drawPiece(xi, yi, 'black');
            // 设置棋子
            this.score.setPiece(xi, yi, 1);
            if (this.score.checkWin(xi, yi, 1)) {
                // 玩家胜利！
                let name = window.prompt('哇，你很强咧，不妨告诉我你的尊姓大名！');
                this.setWin({name: name, time: this.time});
                this.status = 0;
                this.timeout = false;
                return;
            }
            // 切换玩家
            this.player = 2;
            // AI落子
            this.aiDown();
        } else {
            alert('此处已经落子！');
        }
    }

    aiDown() {
        if (this.player != 2) {
            alert('AI故障，这很尴尬！');
            return;
        }
        //
        // 优先级
        let priorityList = [];
        let maxPriority = 0;
        let maxXI = 0;
        let maxYI = 0;

        priorityList[0] = [];
        priorityList[1] = [];

        // 初始化优先级集合
        for (let i=0; i<15; i++) {
            priorityList[0][i] = [];
            priorityList[1][i] = [];
            for (let j=0; j<15; j++) {
                priorityList[0][i][j] = 0;
                priorityList[1][i][j] = 0;
            }
        }

        // 遍历棋盘上每一个点
        for (let i=0; i<15; i++) {
            for (let j=0; j<15; j++) {
                if (this.score.checkPoint(i, j)) {
                    for (let k=0; k<this.score.count; k++) {
                        if (this.score.winList[i][j][k]) {
                            if (this.score.playerWin[k] == 1) {
                                // 优先级1
                                priorityList[0][i][j] += 1;
                            } else if (this.score.playerWin[k] == 2) {
                                // 优先级2
                                priorityList[0][i][j] += 10;
                            } else if (this.score.playerWin[k] == 3) {
                                // 优先级3
                                priorityList[0][i][j] += 100;
                            } else if (this.score.playerWin[k] == 4) {
                                // 优先级4
                                priorityList[0][i][j] += 1000;
                            }

                            if (this.score.computerWin[k] == 1) {
                                // 优先级1
                                priorityList[1][i][j] += 1;
                            } else if (this.score.computerWin[k] == 2) {
                                // 优先级2
                                priorityList[1][i][j] += 10;
                            } else if (this.score.computerWin[k] == 3) {
                                // 优先级3
                                priorityList[1][i][j] += 100;
                            } else if (this.score.computerWin[k] == 4) {
                                // 优先级5
                                priorityList[1][i][j] += 10000;
                            }
                        }
                    }

                    //
                    if (priorityList[0][i][j] > maxPriority) {
                        maxPriority = priorityList[0][i][j];
                        maxXI = i;
                        maxYI = j;
                    } else if (priorityList[0][i][j] == maxPriority) {
                        if (priorityList[1][i][j] > priorityList[1][maxXI][maxYI]) {
                            maxXI = i;
                            maxYI = i;
                        }
                    }

                    if (priorityList[1][i][j] > maxPriority) {
                        maxPriority = priorityList[1][i][j];
                        maxXI = i;
                        maxYI = j;
                    } else if (priorityList[1][i][j] == maxPriority) {
                        if (priorityList[0][i][j] > priorityList[0][maxXI][maxYI]) {
                            maxXI = i;
                            maxYI = i;
                        }
                    }
                }
            }
        }
        //
        this.ui.drawPiece(maxXI, maxYI, 'white');
        this.score.setPiece(maxXI, maxYI, 2);
        if (this.score.checkWin(maxXI, maxYI, 2)) {
            // 玩家胜利！
            alert('电脑胜利了，很可惜，看来你还是太年轻！');
            this.status = 0;
            this.timeout = false;
            return;
        }
        this.player = 1;
    }

    /**
     * 获取排名列表
     * @returns {Object}
     * obj->error obj->data;
     * data = [];
     * {name, time}
     */
    getRankList() {
        let rankStr = localStorage.getItem('rankList');
        if (rankStr == null) {
            // 没有排名数据
            let tmpRank = new Object();
            tmpRank.error = 1;
            return tmpRank;
        }

        let rankList = JSON.parse(rankStr);
        return rankList;
    }

    setWin(data) {
        let rankList = this.getRankList();
        if (rankList.error == 1) {
            rankList.data = [];
            rankList.error = 0;
            rankList.data.push(data);
        } else {
            rankList.data.push(data);
        }

        let rankStr = JSON.stringify(rankList);
        localStorage.setItem('rankList', rankStr);
    }
}
class UI {
    constructor(id, timeId, rank) {
        this.canvas = document.getElementById(id);
        this.time = document.getElementById(timeId);
        this.rank = document.getElementById(rank);
        this.cxt = this.canvas.getContext('2d');
    }

    /**
     * 设置排名列表
     * @param rankData
     */
    setRankList(rankData) {
        if (rankData == '') {
            let rankTr = document.createElement('tr');
            let rankTd = document.createElement('td');
            rankTd.setAttribute('colspan', '3');
            rankTd.innerText = '暂无排名';
            rankTr.appendChild(rankTd);
            this.rank.lastElementChild.appendChild(rankTr);
        } else {
            for (let i in rankData) {
                let rankTr = document.createElement('tr');
                let rankTd1 = document.createElement('td');
                let rankTd2 = document.createElement('td');
                let rankTd3 = document.createElement('td');

                rankTd1.innerText = parseInt(i)+1;
                rankTd2.innerText = rankData[i].name;
                rankTd3.innerText = rankData[i].time;
                rankTr.appendChild(rankTd1);
                rankTr.appendChild(rankTd2);
                rankTr.appendChild(rankTd3);
                this.rank.lastElementChild.appendChild(rankTr);
            }
        }
    }
    /**
     * 设置时间
     * @param second 秒数
     */
    setTime(second) {
        this.time.innerText = second;
    }
    /**
     * 绘制棋盘
     */
    drawPlate() {
        for (let i=0; i<15; i++) {
            this.cxt.moveTo(15, 15+30*i);
            this.cxt.lineTo(435, 15+30*i);
            this.cxt.stroke();
            this.cxt.moveTo(15+30*i, 15);
            this.cxt.lineTo(15+30*i, 435);
            this.cxt.stroke();
        }
    }

    clearPlate() {
        this.cxt.beginPath();
        this.cxt.clearRect(0, 0, 450, 450);
        this.cxt.closePath();
        this.drawPlate();
    }

    /**
     * 绘制棋子
     * @param xi 横轴索引
     * @param yi 纵轴索引
     * @param color 棋子颜色
     */
    drawPiece(xi, yi, color) {
        // 计算坐标
        let x = 15 + 30*xi;
        let y = 15 + 30*yi;

        // 生成渐变颜色
        let grd = this.cxt.createRadialGradient(x+2,y-2,14,x+2,y-2,0);
        if (color == 'black') {
            grd.addColorStop(0, '#000');
            grd.addColorStop(1, 'gray');
        } else {
            grd.addColorStop(0, 'rgb(200,200,200)');
            grd.addColorStop(1, '#fff');
        }

        // 绘制棋子
        this.cxt.fillStyle = grd;
        this.cxt.beginPath();
        this.cxt.arc(x, y, 14, 0, 2*Math.PI);
        this.cxt.closePath();
        this.cxt.fill();
    }
}
class Score {
    constructor() {
        // 初始化赢法数组
        this.initWinList();
        // 初始化棋盘记录
        this.initPieceList();
        // 初始化赢发统计数组
        this.playerWin = [];
        this.computerWin = [];
        for (let i=0; i<this.count; i++) {
            this.playerWin[i] = 0;
            this.computerWin[i] = 0;
        }
    }

    /**
     * 判断输赢
     * @param xi 横轴索引
     * @param yi 纵轴索引
     * @param player 玩家
     * @returns {boolean} 是否胜利
     */
    checkWin(xi, yi, player) {
        for (let i=0; i<this.count; i++) {
            if (this.winList[xi][yi][i]) {
                if (player == 1) {
                    this.playerWin[i]++;
                    this.computerWin[i] = 6;
                    if (this.playerWin[i] == 5) {
                        return true;
                    }
                } else {
                    this.computerWin[i]++;
                    this.playerWin[i] = 6;
                    if (this.computerWin[i] == 5) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 记录棋子
     * @param xi 横轴索引
     * @param yi 纵轴索引
     * @param player 玩家
     */
    setPiece(xi, yi, player) {
        this.pieceList[xi][yi] = player;
    }

    /**
     * 检查此处是否已经有棋子
     * @param xi 横轴索引
     * @param yi 纵轴索引
     * @returns {boolean}
     */
    checkPoint(xi, yi) {
        if (this.pieceList[xi][yi] == 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 初始化棋盘记录
     */
    initPieceList() {
        this.pieceList = [];
        for (let i=0; i<15; i++) {
            this.pieceList[i] = [];
            for (let j=0; j<15; j++) {
                this.pieceList[i][j] = 0;
            }
        }
    }

    /**
     * 初始化赢法数组
     */
    initWinList() {
        this.winList = [];
        this.count = 0;
        // 初始化三维数组
        for (let i=0; i<15; i++) {
            this.winList[i] = [];
            for (let j=0; j<15; j++) {
                this.winList[i][j] = [];
            }
        }
        // 横轴赢法集合
        for (let i=0; i<15; i++) {
            for (let j=0; j<11; j++) {
                for (let k=0; k<5; k++) {
                    this.winList[i][j+k][this.count] = true;
                }
                this.count++;
            }
        }
        // 纵轴赢法集合
        for (let i=0; i<15; i++) {
            for (let j=0; j<11; j++) {
                for (let k=0; k<5; k++) {
                    this.winList[j+k][i][this.count] = true;
                }
                this.count++;
            }
        }
        // 正斜轴赢法集合
        for (let i=0; i<11; i++) {
            for (let j=0; j<11; j++) {
                for (let k=0; k<5; k++) {
                    this.winList[i+k][j+k][this.count] = true;
                }
                this.count++;
            }
        }
        // 反斜轴赢法集合
        for (let i=0; i<11; i++) {
            for (let j=14; j>3; j--) {
                for (let k=0; k<5; k++) {
                    this.winList[i+k][j-k][this.count] = true;
                }
                this.count++;
            }
        }
    }
}

var game = new GameControl('canvas', 'time', 'rank', 'start');
if (localStorage.getItem('restart') == 'yes') {
    game.startGame();
}
document.getElementById('restart').onclick = function() {
    window.location.reload();
    localStorage.setItem('restart', 'yes');
};