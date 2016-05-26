var express = require('express');
var Search = require('bing.search');
var historyModel = require('./db.js')

var search = new Search('0A6VEAB6EanqW5Poz/xelXZMbCmWhaoAlg9HgCQrzyc');
var router = express.Router() ;

router.get('/imagesearch/*', performSearch);

router.get('/latest/', getHistory);

module.exports = router ;

/**
 * performing the requested image search and sending the results back to the client
 *
 */
 
function performSearch(req, response) {
    //getting the search query
    var searchQuery = req.path.split('/')[2];
    //saving the search in db
    console.log("saving search term in the db") ;
    save(searchQuery);
    console.log("search term was saved in the db") ;
    //getting the offset
    var offset = req.query.offset ? req.query.offset : 10; //if offset not provided then show first 10 results
    if (offset < 10) offset *= 10; //in case the offset is passed as a page number
    //performing the search
    console.log("searching images for " + searchQuery);
    searchImages(searchQuery, offset, response) ;
    console.log("search performerd, results were sent to the client") ;
}

/**
 * searchs for images corresponding to the query using the bing api and sending the results to the client
 * 
 **/ 
function searchImages(searchQuery, offset, response) {
    search.images(searchQuery,function(error, res){
        var filteredResults = [];
        var paginatedResults = res.slice(offset - 10, offset); //getting corresponding results to the offset
        //generating the response
        var responseData = paginatedResults.map(function(value){
            var newValue = {} ;
            newValue.url = value.url;
            newValue.context= value.sourceUrl;
            newValue.thumbnail = value.thumbnail.url;
            newValue.title = value.title;
            return newValue ;
        });
        console.log(responseData)
        response.send(JSON.stringify(responseData));
    }); 
    
}

/**
 * saves the search query in the db
 *
 **/ 
function save(searchQuery) {
    var searchEntry = new historyModel({
        search_term : searchQuery
    })
    searchEntry.save(function(err){
        if (err) console.log(err);
    });
}

/**
 * gets the last search requests
 *
 */
 function getHistory(req, res) {
    console.log("requesting latest search items")
    historyModel.find().limit(10).sort({_id : -1}).exec(function(err, data){
        if (err) console.log(err);
        var filteredData = data.map(function(value){
           var newValue = {};     
           newValue.term = value.search_term;
           newValue.date = value.createdDate;
           return newValue ;
        });
        res.send(JSON.stringify(filteredData));
        console.log("latest search items were fetched with sucess")
    })
 }
 