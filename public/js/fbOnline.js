let socket = io();
let siteLink = 'http://localhost:3000';
let profileURL = $("#profileURL").attr('src');
let gameStat = 0;
let playerStat = 0;
let readyStat = 0;
let readyController = 0;
let startSecond = 6;
let fbGameStart;
let startBall;
let nextScore;
let player1Score = 0;
let player2Score = 0;
let gameStopSecond = 5;
let gameEnd;
//GAME SETTINGS//
let topum = document.getElementById('top');

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let cubukUzunluk = 80;
let cubukGenislik = 15;

let cubuk1AnlikKonum = 0;
let cubuk2AnlikKonum = 0;


let topumHareketX = 190;
let topumHareketY = 520;
let topumHareketHizX = 10;
let topumHareketHizY = 10;



let topumX = (canvas.width / 2) - ((topum.width / 40) / 2);
let topumY = (canvas.height / 2) - ((topum.height / 40) / 2);

//DEFAULT//
ctx.drawImage(topum, 0, 0, topum.width, topum.height, topumX, topumY, 50, 50);
ctx.beginPath();
ctx.fillStyle = 'black';
ctx.rect(canvas.width - (cubukGenislik + 5), canvas.height / 2 - (cubukUzunluk / 2), cubukGenislik, cubukUzunluk);
ctx.rect(5, canvas.height / 2 - (cubukUzunluk / 2), cubukGenislik, cubukUzunluk);
ctx.fill();
//DEFAULT//

canvas.addEventListener('mousemove', (e) => {//mouse canvasta hareket ederse
    let y = e.clientY;
    if (playerStat == 1) {
        cubukTakip2(y - 110);
        let matchPlayerSocket = $("#player1 img").attr('id');
        socket.emit('cubukY', {
            'socketID': matchPlayerSocket,
            'positionY': y - 110,
            'playerStat': 1
        });
    };
    if (playerStat == 2) {
        cubukTakip(y - 110);
        let matchPlayerSocket = $("#player2 img").attr('id');
        socket.emit('cubukY', {
            'socketID': matchPlayerSocket,
            'positionY': y - 110,
            'playerStat': 2
        });
    };

    //Listening
    socket.on('cubukCreate', (data) => {
        if (data.playerStat == 1) {
            cubukTakip2(data.positionY);
        }
        else {
            cubukTakip(data.positionY);
        };
    });
}, false);
cubukTakip = (y) => {
    if (y < canvas.height - (cubukUzunluk / 2) && y > cubukUzunluk / 2) {
        ctx.clearRect(0, 0, cubukGenislik + 10, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.rect(5, y - (cubukUzunluk / 2), cubukGenislik, cubukUzunluk);
        ctx.fill();
        cubuk1AnlikKonum = y;
    };
};
cubukTakip2 = (y) => {
    if (y < canvas.height - (cubukUzunluk / 2) && y > cubukUzunluk / 2) {
        ctx.clearRect(canvas.width - (cubukGenislik + 5), 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.rect(canvas.width - (cubukGenislik + 5), y - (cubukUzunluk / 2), cubukGenislik, cubukUzunluk);
        cubuk2AnlikKonum = y;
        ctx.fill();
    };
};
topHareket = () => {
    //Top Alta Değdiğinde
    if (topumHareketX >= (canvas.height) - (topum.height / 40)) {
        topumHareketX -= topumHareketHizX;
        topumHareketHizX = -topumHareketHizX;
    }
    //Top Üste Değdiğinde
    else if (topumHareketX <= ((topum.height / 40) / 12)) {
        topumHareketX += topumHareketHizX + 20;
        topumHareketHizX = topumHareketHizX * -1;
    }
    //Top Sağa Değdiğinde
    else if (topumHareketY >= ((canvas.width) - (topum.width / 40) - (cubukGenislik - 10))) {
        if (cubuk2AnlikKonum - 60 < topumHareketX && (cubuk2AnlikKonum + cubukUzunluk) > topumHareketX + 50) {
            topumHareketY -= 20;
            topumHareketHizY = -topumHareketHizY * 1.2;
            ctx.clearRect(cubukGenislik + 10, 0, canvas.width - (cubukGenislik + 10), canvas.height);
            cubukTakip2(cubuk2AnlikKonum);
            let stick = document.getElementById("stick");
            stick.play();
        }
        else {
            clearInterval(startBall);
            gameReset();
            if (playerStat == 1) {
                let socket1 = $("#player1 img").attr('id');
                let socket2 = $("#player2 img").attr('id');
                socket.emit('player1ScoreAdd', {
                    "socketID1": socket1,
                    "socketID2": socket2,
                });
            };

        };
    }
    //Top Sola Değdiğinde
    else if (topumHareketY <= ((topum.width / 40) / 12) + (cubukGenislik)) {
        if (cubuk1AnlikKonum - 60 < topumHareketX && (cubuk1AnlikKonum + cubukUzunluk) > topumHareketX + 50) {
            topumHareketY += 20;
            topumHareketHizY = -topumHareketHizY;
            ctx.clearRect(cubukGenislik - 10, 0, canvas.width - (cubukGenislik + 30), canvas.height);
            cubukTakip(cubuk1AnlikKonum);
            let stick = document.getElementById("stick");
            stick.play();
        }
        else {
            clearInterval(startBall);
            gameReset();
            if (playerStat == 1) {
                let socket1 = $("#player1 img").attr('id');
                let socket2 = $("#player2 img").attr('id');
                socket.emit('player2ScoreAdd', {
                    "socketID1": socket1,
                    "socketID2": socket2,
                });
            };
        };
    }
    else {
        topumHareketY += topumHareketHizY;
        topumHareketX += topumHareketHizX;
        ctx.clearRect(cubukGenislik + 8, 0, canvas.width - (cubukGenislik + 30), canvas.height);
        ctx.drawImage(topum, 0, 0, topum.width, topum.height, topumHareketY, topumHareketX, 50, 50);
    };
};
//GAME SETTINGS//
socket.emit('onlinePlayers', {
    "imageUrl": profileURL
});
socket.on('onlinePlayerAdd', (req) => {
    if (req.userName.length > 6) {
        $("#fastBallPageUL").append('<li id="' + req.id + '"><img heigth ="30" width="30" src="../public/img/top.png"><p>' + req.userName.substring(0, 6) + '..</p></li>');
    }
    else {
        $("#fastBallPageUL").append('<li id="' + req.id + '"><img heigth ="30" width="30" src="../public/img/top.png"><p>' + req.userName + '</p></li>');
    };
});
socket.on('onlinePlayerLive', (req) => {
    for (let i = 0; i <= (Object.keys(req.onlinePlayers).length) - 1; i++) {
        let keys = Object.keys(req.onlinePlayers)[i];
        if (req.id != req.onlinePlayers[keys].googleID) {
            $("#fastBallPageUL").append('<li id="' + req.onlinePlayers[keys].googleID + '"><img heigth ="30" width="30" src="../public/img/top.png"><p>' + req.onlinePlayers[keys].name + '</p></li>');
        };
    };
});
socket.on('onlinePlayerDis', (req) => {
    $('#' + req.id).remove();
});

let animControler = 0;
let animControlerControlerxD = 0;
let waitAnim;
$("#fbPageBtn1").click(() => {
    if (animControlerControlerxD == 0) {
        waitAnim = setInterval(waitingAnim, 200);
        animControlerControlerxD++;
    };
    socket.emit('fbSearchPlayer');
});
$("#player1ReadyBtn").click(() => {
    if (playerStat == 2 && readyController < 2) {
        readyControl(1);
        readyController++;
    };
});
$("#player2ReadyBtn").click(() => {
    if (playerStat == 1 && readyController < 2) {
        readyControl(2);
        readyController++;
    };
});
socket.on('fbSearchPlayerStop', (data) => {
    clearInterval(waitAnim);
    $("#fbPageBtn1").html('SEARCH PLAYER');
    animControler = 0;
    animControlerControlerxD--;
});
socket.on('matchPlayers', (data) => {
    $("#fastBallPageFrame").hide();
    $("#fbGamePage").show();
    $("#fbGamePage").attr("class", data.gameID);
    $("#player1 img").attr("src", data.imgURL + "?sz=50");
    $("#player1 img").attr("id", data.socketID);
    $("#player1 p").html(data.name);
    $("#player2 img").attr("src", data.imgURL2 + "?sz=50");
    $("#player2 img").attr("id", data.socketID2);
    $("#player2 p").html(data.name2);
    if (data.stat == 1) {
        oyunOlusturucu2();
    }
    else {
        oyunOlusturucu();
    };

});
socket.on('fbGameCancel', (data) => {
    window.location.assign(siteLink + '/1V1FASTBALL');
});
socket.on('playerReadyStat', (data) => {
    if (data.stat == 1 && readyController < 2) {
        $("#player1ReadyBtn").css("border", "3px solid green");
        readyStat++;
        startController();
        let readySound = document.getElementById("readySound");
        readySound.play();
    };
    if (data.stat == 2 && readyController < 2) {
        $("#player2ReadyBtn").css("border", "3px solid green");
        readyStat++;
        startController();
        let readySound = document.getElementById("readySound");
        readySound.play();
    };
});
socket.on('topHareketDevam', () => {
    topHareket();
});
socket.on('player1AddScore', () => {
    player1Score++;
    $("#playersScore p:first-child").html(player1Score);
});
socket.on('player2AddScore', () => {
    player2Score++;
    $("#playersScore p:last-child").html(player2Score);
});
socket.on('winnerShow', (data) => {
    $("#winner").show();
    $("#winner").html('WINNER ' + data.winnerName + ' !');
    gameEnd = setInterval(gameStop, 1000);
});
socket.on('gameEnd', () => {
    window.location.assign(siteLink + '/1V1FASTBALL')
});
const waitingAnim = () => {
    if (animControler == 0) {
        $("#fbPageBtn1").html('Waiting Player');
        animControler++;
    }
    else if (animControler == 1) {
        $("#fbPageBtn1").html('Waiting Player.');
        animControler++;
    }
    else if (animControler == 2) {
        $("#fbPageBtn1").html('Waiting Player..');
        animControler++;
    }
    else if (animControler == 3) {
        $("#fbPageBtn1").html('Waiting Player...');
        animControler++;
    }
    else {
        $("#fbPageBtn1").html('Waiting Player');
        animControler = 0;
    }
};
const oyunOlusturucu = () => {
    gameStat = 1;
    playerStat = 1;
};
const oyunOlusturucu2 = () => {
    gameStat = 1;
    playerStat = 2;
};
const readyControl = (data) => {
    if (data == 1) {
        let playerSocket = $("#player2 img").attr('id');
        socket.emit('playerReady', {
            "socketID": playerSocket,
            "stat": 1
        });
    };
    if (data == 2) {
        let playerSocket = $("#player1 img").attr('id');
        socket.emit('playerReady', {
            "socketID": playerSocket,
            "stat": 2
        });
    };
};
const gameStart = () => {
    if (startSecond == 6) {
        $("#playersScore p:first-child").html(startSecond);
        $("#playersScore p:last-child").html(startSecond);
        startSecond--;
    }
    else if (startSecond == 5) {
        $("#playersScore p:first-child").html(startSecond);
        $("#playersScore p:last-child").html(startSecond);
        startSecond--;
    }
    else if (startSecond == 4) {
        $("#playersScore p:first-child").html(startSecond);
        $("#playersScore p:last-child").html(startSecond);
        startSecond--;
    }
    else if (startSecond == 3) {
        $("#playersScore p:first-child").html(startSecond);
        $("#playersScore p:last-child").html(startSecond);
        startSecond--;
    }
    else if (startSecond == 2) {
        $("#playersScore p:first-child").html(startSecond);
        $("#playersScore p:last-child").html(startSecond);
        startSecond--;
    }
    else if (startSecond == 1) {
        $("#playersScore p:first-child").html(startSecond);
        $("#playersScore p:last-child").html(startSecond);
        startSecond--;
    }
    else if (startSecond == 0) {
        clearInterval(fbGameStart);
        $("#playersScore p:first-child").html(startSecond);
        $("#playersScore p:last-child").html(startSecond);
        startSecond = 3;
        startBall = setInterval(topHareketSocket, 40);
        let startGame = document.getElementById("startGame");
        startGame.play();
    };
};
const startController = () => {
    if (readyStat == 2) {
        fbGameStart = setInterval(gameStart, 1000);
    };
};
const topHareketSocket = () => {
    let socket1 = $("#player1 img").attr('id');
    let socket2 = $("#player2 img").attr('id');
    socket.emit('topHareket', {
        "socketID1": socket1,
        "socketID2": socket2
    });
};
const gameReset = () => {
    cubukUzunluk = 80;
    cubukGenislik = 15;
    cubuk1AnlikKonum = 0;
    cubuk2AnlikKonum = 0;
    topumHareketX = 190;
    topumHareketY = 520;
    topumHareketHizX = 10;
    topumHareketHizY = 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(topum, 0, 0, topum.width, topum.height, topumX, topumY, 50, 50);
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.rect(canvas.width - (cubukGenislik + 5), canvas.height / 2 - (cubukUzunluk / 2), cubukGenislik, cubukUzunluk);
    ctx.rect(5, canvas.height / 2 - (cubukUzunluk / 2), cubukGenislik, cubukUzunluk);
    ctx.fill();
    nextScore = setInterval(nextGameLoop, 1100);
};
const nextGameLoop = () => {
    if (player1Score <= 2 && player2Score <= 2) {
        if (startSecond == 3) {
            startSecond--;
            let nextBeep = document.getElementById("nextBeep");
            nextBeep.play();
        }
        else if (startSecond == 2) {
            startSecond--;
            let nextBeep = document.getElementById("nextBeep");
            nextBeep.play();

        }
        else if (startSecond == 1) {
            startSecond--;
            let nextBeep = document.getElementById("nextBeep");
            nextBeep.play();

        }
        else if (startSecond == 0) {
            clearInterval(nextScore);
            startSecond = 3;
            let startGame = document.getElementById("startGame");
            startGame.play();
            startBall = setInterval(topHareketSocket, 50);
        };
    }
    else {
        clearInterval(nextScore);
        if (playerStat == 1) {
            if (player1Score > 2) {
                let winnerName = $("#player1Name").html();
                let socket1 = $("#player1 img").attr('id');
                let socket2 = $("#player2 img").attr('id');
                socket.emit('winner', {
                    "winnerName": winnerName,
                    "socketID1": socket1,
                    "socketID2": socket2
                });
            }
            else {
                let winnerName = $("#player2Name").html();
                let socket1 = $("#player1 img").attr('id');
                let socket2 = $("#player2 img").attr('id');
                socket.emit('winner', {
                    "winnerName": winnerName,
                    "socketID1": socket1,
                    "socketID2": socket2
                });
            };
        };
    };
};
const gameStop = () => {
    if (gameStopSecond == 5) {
        gameStopSecond--;
    }
    else if (gameStopSecond == 4) {
        gameStopSecond--;
    }
    else if (gameStopSecond == 3) {
        gameStopSecond--;
    }
    else if (gameStopSecond == 2) {
        gameStopSecond--;
    }
    else if (gameStopSecond == 1) {
        gameStopSecond--;
    }
    else {
        clearInterval(gameEnd);
        let socket1 = $("#player1 img").attr('id');
        let socket2 = $("#player2 img").attr('id');
        socket.emit('gameStop', {
            "socketID1": socket1,
            "socketID2": socket2
        });
    };
};