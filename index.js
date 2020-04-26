/* Require external APIs and start our application instance */
var express = require('express');
var mysql = require('mysql');
var app = express();

/* Configure our server to read public folder and ejs files */
app.use(express.static('public'));
app.set('view engine', 'ejs');

/* Configure MySQL DBMS */

let localhost = false;
let connection = undefined;

if(!localhost){
    connection = mysql.createConnection({
        host: 'u3r5w4ayhxzdrw87.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'lwz6xabhk3w3l77r',
        password: 'eewngfvmixwph5lv',
        database: 'g51zn2ih4ftm35s6'
    });
    connection.connect();
} else {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'yessica',
        password: 'password336',
        database: 'quotes_db'
    });
    connection.connect();
}


/* The handler for the DEFAULT route */
app.get('/search', function(req, res){
    res.render('home');
});

app.get('/', function(req, res) {
    res.render('quote-home');
});

app.get('/quotes', function(req, res) {

    if (req.query.type == "name") {
        let name = req.query.query;
        let splits = name.split(" ");
        if (splits.length > 1) {
            let first = splits[0];
            let last = splits[1];

            let stmt = `SELECT * FROM l9_author JOIN l9_quotes 
            ON l9_author.authorId = l9_quotes.authorId
            WHERE firstName LIKE '%${first}%' AND
            lastName LIKE '%${last}%';`

            console.log(stmt);

            connection.query(stmt, function(error, found) {
                if(error) throw error;
                console.log(found);
                res.render('quote-display', {
                    "quotes": found,
                    "query": "Search by Name " + req.query.query
                });
            });
        } else {
            let first = splits[0];

            let stmt = `SELECT * FROM l9_author JOIN l9_quotes 
            ON l9_author.authorId = l9_quotes.authorId
            WHERE firstName LIKE '%${first}%';`

            console.log(stmt);

            connection.query(stmt, function(error, found) {
                
                console.log(found);
                res.render('quote-display', {
                    "quotes": found,
                    "query": "Search by Name " + req.query.query
                });
            });
        }
    }

    if (req.query.type == "key") {
        let stmt = `SELECT * FROM l9_author JOIN l9_quotes 
        ON l9_author.authorId = l9_quotes.authorId
        WHERE quote LIKE '%${req.query.query}%';`

        console.log(stmt);

        connection.query(stmt, function(error, found) {
            if(error) throw error;
            console.log(found);
            res.render('quote-display', {
                "quotes": found,
                "query": "Search by Keyword " + req.query.query
            });
        });
    }
    

});

/* The handler for the /author route */
app.get('/author', function(req, res){

    var stmt = 'select * from l9_author where firstName=\'' 
                + req.query.firstname + '\' and lastName=\'' 
                + req.query.lastname + '\' and sex=\'' + req.query.gender + '\';'

    console.log(stmt);
	connection.query(stmt, function(error, found){
	    var author = null;
	    if(error) throw error;
	    if(found.length){
	        author = found[0];
	        // Convert the Date type into the String type
	        author.dob = author.dob.toString().split(' ').slice(0,4).join(' ');
	        author.dod = author.dod.toString().split(' ').slice(0,4).join(' ');
	    }
	    res.render('author', {author: author});
	});
});

/* The handler for the /author/name/id route */
app.get('/author/:aid', function(req, res){
    var stmt = 'select quote, firstName, lastName ' +
               'from l9_quotes, l9_author ' +
               'where l9_quotes.authorId=l9_author.authorId ' + 
               'and l9_quotes.authorId=' + req.params.aid + ';'
    connection.query(stmt, function(error, results){
        if(error) throw error;
        var name = results[0].firstName + ' ' + results[0].lastName;
        res.render('quotes', {name: name, quotes: results});      
    });
});

/* The handler for undefined routes */
app.get('*', function(req, res){
   res.render('error'); 
});

/* Start the application server */
app.listen(process.env.PORT || 3000, function(){
    console.log('Server has been started');
})