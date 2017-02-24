/**
 * Created by dly on 2017/2/22.
 */
class Game {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.cxt = this.canvas.getContext('2d');
        this.status = 0;
        this.player = 0;
        this.pieceList = [];
        this.winList = [];
        this.scoreList = [];
        this.count = 0;
    }

    start() {
        // 初始化棋盘
        this.initPlate();
        this.initPieceList();
        this.initWinList();
        this.canvas.onclick = this.playerHuman.bind(this);
        this.status = 1;
    }

    // 初始化棋盘记录
    initPieceList() {
        for (let i=0; i<15; i++) {
            this.pieceList[i] = [];
            for (let j=0; j<15; j++) {
                this.pieceList[i][j] = -1;
            }
        }
    }

    initPlate() {
        // 绘制横轴线
        for (let i=0; i<15; i++) {
            this.cxt.moveTo(15, 15+30*i);
            this.cxt.lineTo(435, 15+30*i);
        }
        // 绘制纵轴线
        for (let i=0; i<15; i++) {
            this.cxt.moveTo(15+30*i, 15);
            this.cxt.lineTo(15+30*i, 435);
        }
        // 画线
        this.cxt.stroke();
    }

    initWinList() {
        // 初始化数组
        for (let i=0; i<15; i++) {
            this.winList[i] = [];
            for (let j=0; j<15; j++) {
                this.winList[i][j] = [];
            }
        }
        let count = 0;

        // 横轴赢法集合
        for (let i=0; i<15; i++) {
            for (let j=0; j<11; j++) {
                for (let k=0; k<5; k++) {
                    this.winList[i][j+k][count] = true;
                }
                count++;
            }
        }
        // 纵轴赢法集合
        for (let i=0; i<15; i++) {
            for (let j=0; j<11; j++) {
                for (let k=0; k<5; k++) {
                    this.winList[j+k][i][count] = true;
                }
                count++;
            }
        }
        // 正斜轴赢法集合
        for (let i=0; i<11; i++) {
            for (let j=0; j<11; j++) {
                for (let k=0; k<5; k++) {
                    this.winList[i+k][j+k][count] = true;
                }
                count++;
            }
        }
        // 反斜轴赢法集合
        for (let i=0; i<11; i++) {
            for (let j=14; j>3; j--) {
                for (let k=0; k<5; k++) {
                    this.winList[i+k][j-k][count] = true;
                }
                count++;
            }
        }
        this.count = count;
        this.scoreList[0] = [];
        this.scoreList[1] = [];
        for (let i=0; i<count; i++) {
            this.scoreList[0][i] = 0;
            this.scoreList[1][i] = 0;
        }
    }

    drawPiece(xi, yi, color) {
        // 计算坐标点
        let x = 15+30*xi;
        let y = 15+30*yi;
        // 初始化渐变
        let grd = this.cxt.createRadialGradient(x+2,y-2,14,x+2,y-2,0);
        // 判断旗子颜色
        if (color) {
            grd.addColorStop(0, 'rgb(200,200,200)');
            grd.addColorStop(1, '#fff');
        } else {
            grd.addColorStop(0, '#000');
            grd.addColorStop(1, 'gray');
        }
        this.cxt.fillStyle = grd;
        this.cxt.beginPath();
        this.cxt.arc(x, y, 14, 0, 2*Math.PI);
        this.cxt.closePath();
        this.cxt.fill();
    }

    playerAI() {
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
                if (this.pieceList[i][j] == -1) {
                    for (let k=0; k<this.count; k++) {
                        if (this.winList[i][j][k]) {
                            if (this.scoreList[0][k] == 1) {
                                // 优先级1
                                priorityList[0][i][j] += 1;
                            } else if (this.scoreList[0][k] == 2) {
                                // 优先级2
                                priorityList[0][i][j] += 10;
                            } else if (this.scoreList[0][k] == 3) {
                                // 优先级3
                                priorityList[0][i][j] += 100;
                            } else if (this.scoreList[0][k] == 4) {
                                // 优先级4
                                priorityList[0][i][j] += 1000;
                            }

                            if (this.scoreList[1][k] == 1) {
                                // 优先级1
                                priorityList[1][i][j] += 1;
                            } else if (this.scoreList[1][k] == 2) {
                                // 优先级2
                                priorityList[1][i][j] += 10;
                            } else if (this.scoreList[1][k] == 3) {
                                // 优先级3
                                priorityList[1][i][j] += 100;
                            } else if (this.scoreList[1][k] == 4) {
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

        this.downPiece(maxXI, maxYI, 1);
    }

    downPiece(xi,yi,player) {
        let other = 0;
        if (player == 0) {
            other = 1;
        }
        // 判断此处是否已经落子
        if (this.pieceList[xi][yi] == -1) {
            this.drawPiece(xi, yi, player);
            this.pieceList[xi][yi] = player;

            // 计算胜负
            for (let i=0; i<this.count; i++) {
                if (this.winList[xi][yi][i]) {
                    this.scoreList[player][i]++;
                    this.scoreList[other][i] = 6;
                    if (this.scoreList[player][i] == 5) {
                        let winner = '黑方';
                        if (player == 1) {
                            winner = '白方';
                        }
                        alert('恭喜'+winner+'获得胜利！');
                        this.status = 0;
                    }
                }
            }
        } else {
            // 已经落子
            alert('此处已经落子');
        }
    }
    playerHuman(e) {
        if (!this.status) {
            alert("游戏已经结束！");
            return;
        }
        // 获取鼠标点击坐标
        let x = e.offsetX;
        let y = e.offsetY;
        // 计算棋子位置
        let xi = Math.floor(x / 30);
        let yi = Math.floor(y /30);

        this.downPiece(xi, yi, 0);
        this.playerAI();
    }
}

var game = new Game('canvas');
game.start();