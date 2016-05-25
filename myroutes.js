var express = require('express');
var Search = require('bing.search');
var util = require('util');
var historyModel = require('./db.js')

var search = new Search('0A6VEAB6EanqW5Poz/xelXZMbCmWhaoAlg9HgCQrzyc');
var router = express.Router() ;

router.get('/imagesearch/*', function(req, result) {
    
    var searchQuery = req.path.split('/')[2];
    //saving the search in db
    console.log("saving search term in the db") ;
    var searchEntry = new historyModel({
        search_term : searchQuery
    })
    searchEntry.save(function(err){
        if (err) console.log(err);
    });
    console.log("search term was saved in the db") ;
    //performing the search
    console.log("searching images for " + searchquery);
    search.images(searchQuery,function(error, res){
        var filteredResults = [];
        var offset = req.query.offset ? req.query.offset : 10; //if offset not provided then show first 10 results
        if (offset < 10) offset *= 10; //in case the offset is passed as a page number
        var paginatedResults = res.slice(offset - 10, offset) //getting corresponding results to the offset
        //generating the response
        paginatedResults.forEach(function(value){
            var newValue = {} ;
            newValue.url = value.url;
            newValue.context= value.sourceUrl;
            newValue.thumbnail = value.thumbnail.url;
            newValue.title = value.title;
            filteredResults.push(newValue);
        });
        result.send(JSON.stringify(filteredResults));
        console.log("search performerd, results were sent to the client") ;
   });   
   
});

router.get('/latest/', function(req, res) {
    console.log("requesting latest search items")
    historyModel.find().limit(10).sort({_id : -1}).exec(function(err, data){
        if (err) console.log(err);
        var results = [];
        data.forEach(function(value){
           var newValue = {}
           newValue.searchTerm = value.search_term;
           newValue.createdDate = value.createdDate;
           results.push(newValue);
        });
        res.send(JSON.stringify(results));
        console.log("latest search items were fetched with sucess")
    })
});

module.exports = router ;