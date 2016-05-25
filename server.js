var router = require('./myroutes');
var app = require('express')();


app.use('/api', router);

app.listen(process.env.PORT);

