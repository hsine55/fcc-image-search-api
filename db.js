var config = require('./config.js');

//setting up the database
var mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);


var historySchema = new mongoose.Schema({
    search_term : String,
    createdDate : {type:Date, default:Date.now}
})

var historyModel = mongoose.model("history",historySchema);

module.exports = historyModel;



