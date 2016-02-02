"use strict";

var request = require('request');
var fs = require('fs');
var async = require('async');
var _ = require("underscore");
var config = require('./config.json');


var recurseCallFunctions = true;
var counters = {
    numberOfEntriesGenerated: 0
};


var numberOfExecutedFunction = 0;
var numberOfFailedExecutions = 0;
var averageExecutionTime = 0;


var init = function(){

    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('./parseToBs');

    db.serialize(function() {
        db.run("CREATE TABLE classesToTypes (info TEXT)");

        var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        for (var i = 0; i < 10; i++) {
            stmt.run("Ipsum " + i);
        }
        stmt.finalize();

        db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
            console.log(row.id + ": " + row.info);
        });
    });

    db.close();
};

var obtainParseClasses = function() {
    var options = {
        method: 'POST',
        url: 'https://api.parse.com/1/schemas',
        json:true,
        headers: {
            'X-Parse-Application-Id': 'sM6Jbmd1XfWNPbYPq2ueb9gHN7TPAm1hyB5ndKos',
            'X-Parse-REST-API-Key':'ihWeNXYjj3fnoxhsDjjNPMDq7SY2k6VhcPXVUECv'
        },
        body : generateDataForField()
    };
    var executionStartTime = _.now();
	
    function callback(error, response, body) {
        console.log("Parse classes obtained!");
        console.log("Request Number: "+ numberOfExecutedFunction);
        console.log("Status Code: " + response.statusCode);

        if (!error && response) {

        }else{
            numberOfFailedExecutions++;
            var response = JSON.parse(body);
            console.log("Error: " + response.message);
        }
        console.log("Failed Executions: ", numberOfFailedExecutions);
        console.log("Execution Time: ", averageExecutionTime);
        console.log("=================================================================================");

        async.setImmediate(function(){
            afterCallComplete.call();
        });
    }
    request(options, callback);
};

var generateDataForField = function(){
    counters.numberOfEntriesGenerated++;
    var fieldName = config.testTypeFieldName;
    var returnObj = {
        'username':'John ' + counters.numberOfEntriesGenerated,
        'password':'123123'
    };

    return returnObj;
}

var afterCallComplete = function() {
    if (recurseCallFunctions && numberOfExecutedFunction < 1000) {
        insertDataInType.call();
    };
};

var makeParallelCallsAndMigrate = function(numberOfParallelFunctions){
    var functionsArray = [];

    _.times(numberOfParallelFunctions, function(n){
        var func = function() {
            async.setImmediate(function () {
                insertDataInType.call();
            });
        }
        functionsArray.push(func);
    });

    async.parallel(functionsArray);
};

//migrateApp();
init();




