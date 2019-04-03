let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://localhost/kaizen', { autoIndex: false, useNewUrlParser: true, });

let db = mongoose.connection;
db.on('error', function () {
    console.log('MONGOOSE BAĞLANTI HATASI!!!');
});
db.once('open', function () {
    console.log("Mongose bağlantısı başarı ile sağlandı.");
});  