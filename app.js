const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ejsLayouts = require('express-ejs-layouts');
const htmlspecialchars = require('htmlspecialchars');
const cookieParser = require('cookie-parser');
const auth = require('./routes/auth');
const fastball = require('./routes/1v1fastball');
const select = require('./routes/select');
const indexPage = require('./routes/index');
const passport = require('passport');
const session = require('express-session');
const users = require('./models/users');

//FastBallOnlinePlayer
const fbOnlinePlayers = {};

//helpers
const db = require('./models/db');

//middleware
const isAuthenticated = require('./middleware/isAuthenticated');


app.use(cookieParser()); // Çerezler için
app.use(ejsLayouts);//Ejs şablon mantığı

app.set('view engine', 'ejs');//Görüntü motoru
app.use('/public', express.static(__dirname + '/public'));
app.use('/views', express.static(__dirname + '/views'));

app.use(session({
    secret: 'Lghx5y',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 14 * 24 * 3600000 } //SSL OLDUĞUNDA TRUE OLCAK SECURE
}));
//passport.js
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', auth);

//Routes
app.use('/select', isAuthenticated, select);
app.use('/1V1FASTBALL', isAuthenticated, fastball);
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('select');
    }
    else {
        res.render('index');
    }
});

io.on('connection', (socket) => {
    ///1V1 FAST BALL ONLİNE PLAYER PAGE
    socket.on('onlinePlayers', (istek) => {
        let kullanici = istek.imageUrl;
        kullanici = kullanici.substring(0, kullanici.length - 6);
        users.findOne({ profileFotoURL: kullanici }).then((docs) => {
            const newData = {
                'googleID': docs.googleID,
                'name': docs.name,
                'imgURL': docs.profileFotoURL,
                'gameID': 0
            };
            fbOnlinePlayers[socket.id] = newData;
            io.sockets.emit('onlinePlayerAdd', {
                'id': docs.googleID,
                'userName': docs.name,
            });
            socket.emit('onlinePlayerLive', {
                'id': docs.googleID,
                'onlinePlayers': fbOnlinePlayers
            });
            docs.fbOnline = 1;
            docs.socketID = socket.id;
            docs.save();

        });
    });
    socket.on('fbSearchPlayer', () => {
        if (fbOnlinePlayers[socket.id]) {
            const googleID = fbOnlinePlayers[socket.id]['googleID'];
            users.findOne({ googleID: googleID }).then((data) => {
                let stat = data.fbSearch;
                if (stat == 0) {
                    data.fbSearch = 1;
                    data.save();
                    fbMatch(socket.id);
                }
                else {
                    data.fbSearch = 0;
                    data.save();
                    io.sockets.connected[socket.id].emit('fbSearchPlayerStop');
                }
            });
        };
    });
    socket.on('cubukY', (data) => {
        if (fbOnlinePlayers[data.socketID]) {
            io.sockets.connected[data.socketID].emit('cubukCreate', {
                "positionY": data.positionY,
                'playerStat': data.playerStat
            });
        };
    });
    socket.on('playerReady', (data) => {
        if (fbOnlinePlayers[data.socketID]) {
            io.sockets.connected[data.socketID].emit('playerReadyStat', {
                "stat": data.stat
            });
            io.sockets.connected[socket.id].emit('playerReadyStat', {
                "stat": data.stat
            });
        }
    });
    socket.on('topHareket', (data) => {
        let socketID1 = data.socketID1;
        let socketID2 = data.socketID2;
        if (fbOnlinePlayers[socketID1] && fbOnlinePlayers[socketID2]) {
            io.sockets.connected[socketID1].emit('topHareketDevam');
            io.sockets.connected[socketID2].emit('topHareketDevam');
        };
    });
    socket.on('player1ScoreAdd', (data) => {
        let socketID1 = data.socketID1;
        let socketID2 = data.socketID2;
        if (fbOnlinePlayers[socketID1] && fbOnlinePlayers[socketID2]) {
            io.sockets.connected[socketID1].emit('player1AddScore');
            io.sockets.connected[socketID2].emit('player1AddScore');
        };
    });
    socket.on('player2ScoreAdd', (data) => {
        let socketID1 = data.socketID1;
        let socketID2 = data.socketID2;
        if (fbOnlinePlayers[socketID1] && fbOnlinePlayers[socketID2]) {
            io.sockets.connected[socketID1].emit('player2AddScore');
            io.sockets.connected[socketID2].emit('player2AddScore');
        };
    });
    socket.on('winner', (data) => {
        let socketID1 = data.socketID1;
        let socketID2 = data.socketID2;
        if (fbOnlinePlayers[socketID1] && fbOnlinePlayers[socketID2]) {
            io.sockets.connected[socketID1].emit('winnerShow', {
                "winnerName": data.winnerName
            });
            io.sockets.connected[socketID2].emit('winnerShow', {
                "winnerName": data.winnerName
            });
        };
    });
    socket.on('gameStop', (data) => {
        let socketID1 = data.socketID1;
        let socketID2 = data.socketID2;
        if (fbOnlinePlayers[socketID1] && fbOnlinePlayers[socketID2]) {
            io.sockets.connected[socketID1].emit('gameEnd');
            io.sockets.connected[socketID2].emit('gameEnd');
        };
    });
    socket.on('disconnect', () => {

        if (fbOnlinePlayers[socket.id]) {
            const googleID = fbOnlinePlayers[socket.id].googleID;
            onlinePlayerDisconnect(googleID);
            delete fbOnlinePlayers[socket.id];
            users.findOne({ googleID: googleID }).then((data) => {
                let stat = data.fbSearch;
                if (stat == 0 && data.fbMatch.length > 1) {
                    data.fbMatch = '';
                    data.socketID = '';
                    users.findOne({ fbMatch: socket.id }).then((data) => {
                        data.fbMatch = '';
                        data.save();
                        io.sockets.connected[data.socketID].emit('fbGameCancel');
                    });
                };
                data.fbOnline = 0;
                data.save();
            });
        };
    });
    const fbMatch = (socketID) => {
        users.find({ fbSearch: 1 }).then((data) => {
            if (Object.keys(data).length > 0) {
                const googleID = fbOnlinePlayers[socketID]['googleID'];
                let matchController = 0;
                for (let i = 0; matchController < 1; i++) {
                    if (data[i].googleID != googleID) {
                        let searchSocket;
                        for (let x = 0; x < Object.keys(fbOnlinePlayers).length; x++) {
                            searchSocket = Object.keys(fbOnlinePlayers)[x];
                            if (fbOnlinePlayers[searchSocket].googleID == data[i].googleID) {
                                users.findOne({ googleID: data[i].googleID }).then((data) => {
                                    data.fbSearch = 0;
                                    data.socketID = Object.keys(fbOnlinePlayers)[x];
                                    data.fbMatch = socketID;
                                    data.save();
                                    io.sockets.connected[Object.keys(fbOnlinePlayers)[x]].emit('matchPlayers', {
                                        "socketID": socketID,
                                        "socketID2": Object.keys(fbOnlinePlayers)[x],
                                        "imgURL": fbOnlinePlayers[socketID].imgURL,
                                        "name": fbOnlinePlayers[socketID].name,
                                        "imgURL2": data.profileFotoURL,
                                        "name2": data.name,
                                        "stat": 2
                                    });
                                    io.sockets.connected[socketID].emit('matchPlayers', {
                                        "socketID": socketID,
                                        "socketID2": Object.keys(fbOnlinePlayers)[x],
                                        "imgURL": fbOnlinePlayers[socketID].imgURL,
                                        "name": fbOnlinePlayers[socketID].name,
                                        "imgURL2": data.profileFotoURL,
                                        "name2": data.name,
                                        "stat": 1
                                    });
                                    io.sockets.connected[socketID].emit('fbSearchPlayerStop');
                                    io.sockets.connected[Object.keys(fbOnlinePlayers)[x]].emit('fbSearchPlayerStop');
                                    users.findOne({ googleID: fbOnlinePlayers[socketID].googleID }).then((data) => {
                                        data.fbMatch = Object.keys(fbOnlinePlayers)[x];
                                        data.socketID = socketID;
                                        data.fbSearch = 0;
                                        data.save();
                                    });
                                });
                            };
                        };
                        matchController++;
                    };
                };
            };
        });
    };
    const onlinePlayerDisconnect = async (googleID) => {
        io.sockets.emit('onlinePlayerDis', {
            "id": googleID
        });
    };
    //ANIMATION//

    //ANIMATION//
    ///1V1 FAST BALL ONLİNE PLAYER PAGE
});

http.listen(8080, () => {
    console.log('8080 Portundan sunucu baslatildi.');
});