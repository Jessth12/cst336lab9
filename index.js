/* Require external APIs and start our application instance */
var express = require('express');
var mysql = require('mysql');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ secret: "Secret hash thing for auth" }));

/* Configure our server to read public folder and ejs files */
app.use(express.static('public'));
app.set('view engine', 'ejs');

/* Configure MySQL DBMS */

let localhost = false;
let connection = undefined;


connection = mysql.createConnection({
    host: 'u3r5w4ayhxzdrw87.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'lwz6xabhk3w3l77r',
    password: 'eewngfvmixwph5lv',
    database: 'g51zn2ih4ftm35s6'
});
connection.connect();



/* The handler for the DEFAULT route */
app.get('/search', function (req, res) {
    res.render('home');
});

app.get('/', function (req, res) {
    let stmt = `SELECT DISTINCT category FROM l9_quotes;`;

    connection.query(stmt, function (error, found) {
        if (error) throw error;
        categories = [];
        for (i in found) {
            categories.push(found[i].category);
        }

        res.render('quote-home', {
            "categories": categories
        });
    });
});

app.get('/quotes', function (req, res) {

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

            connection.query(stmt, function (error, found) {
                if (error) throw error;
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

            connection.query(stmt, function (error, found) {

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

        connection.query(stmt, function (error, found) {
            if (error) throw error;
            console.log(found);
            res.render('quote-display', {
                "quotes": found,
                "query": "Search by Keyword " + req.query.query
            });
        });
    }

    if (req.query.type == "cat") {
        let stmt = `SELECT * FROM l9_author JOIN l9_quotes 
        ON l9_author.authorId = l9_quotes.authorId
        WHERE category='${req.query.cat}';`

        console.log(stmt);

        connection.query(stmt, function (error, found) {
            if (error) throw error;
            console.log(found);
            res.render('quote-display', {
                "quotes": found,
                "query": "Search by Category " + req.query.cat
            });
        });
    }

    if (req.query.type == "sex") {
        let stmt = `SELECT * FROM l9_author JOIN l9_quotes 
        ON l9_author.authorId = l9_quotes.authorId
        WHERE sex='${req.query.sex}';`

        console.log(stmt);

        connection.query(stmt, function (error, found) {
            if (error) throw error;
            console.log(found);
            res.render('quote-display', {
                "quotes": found,
                "query": "Search by Sex " + req.query.sex
            });
        });
    }


});

/* The handler for the /author route */
app.get('/author', function (req, res) {

    var stmt = 'select * from l9_author where firstName=\''
        + req.query.firstname + '\' and lastName=\''
        + req.query.lastname + '\' and sex=\'' + req.query.gender + '\';'

    console.log(stmt);
    connection.query(stmt, function (error, found) {
        var author = null;
        if (error) throw error;
        if (found.length) {
            author = found[0];
            // Convert the Date type into the String type
            author.dob = author.dob.toString().split(' ').slice(0, 4).join(' ');
            author.dod = author.dod.toString().split(' ').slice(0, 4).join(' ');
        }
        res.render('author', { author: author });
    });
});

/* The handler for the /author/name/id route */
app.get('/author/:aid', function (req, res) {
    var stmt = 'select quote, firstName, lastName ' +
        'from l9_quotes, l9_author ' +
        'where l9_quotes.authorId=l9_author.authorId ' +
        'and l9_quotes.authorId=' + req.params.aid + ';'
    connection.query(stmt, function (error, results) {
        if (error) throw error;
        var name = results[0].firstName + ' ' + results[0].lastName;
        res.render('quotes', { name: name, quotes: results });
    });
});

// ======== Lab 10 ==========

function getAuthors() {
    return new Promise((resolve, reject) => {
        let stmt = `select * from l9_author;`;

        connection.query(stmt, function (error, results) {
            if (error) {
                throw error;
            }
            resolve(results);
        })
    })
}

function addAuthor(first, last, dob, dod, gender, profession, country) {
    return new Promise((resolve, reject) => {
        let dob_strings = dob.split("-");
        let dob_date = new Date(
            dob_strings[0], 
            parseInt(dob_strings[1]) - 1, dob_strings[2]);

        let dod_strings = dod.split("-");
        let dod_date = new Date(dod_strings[0], parseInt(dod_strings[1]) - 1, dod_strings[2]);

        console.log(dob_date);
        console.log(dod_date);

        let gender_char = gender[0];

        console.log(gender_char)

        let stmt = `INSERT INTO l9_author (firstName, lastName, dob, dod, sex, profession, country,portrait,biography) 
        VALUES ('${first}', '${last}', ${connection.escape(dob_date)}, ${connection.escape(dod_date)}, '${gender_char}', '${profession}',  '${country}', '', '')`;

        connection.query(stmt, function(error, results) {
            if (error) {
                throw error;
            }
            resolve(results);
        });
    });
}

app.get('/admin', isAuthenticated, async function (req, res) {
    let authors = await getAuthors();
    res.render('lab10/admin', {
        "authors": authors
    });
});

app.get('/add_author', isAuthenticated, function(req, res) {
    res.render('lab10/add_author');
});

app.post('/add_author', async function(req, res) {
    console.log(req.body);
    await addAuthor(req.body.firstname, req.body.lastname, req.body.dob,
        req.body.dod, req.body.gender, req.body.profession, req.body.country);
    res.redirect("/admin")
})

app.get('/login', function (req, res) {
    let authenticated
    res.render('lab10/login');
});

app.post('/login', async function (req, res) {
    let isUserExist = await checkUsername(req.body.username);
    let hashedPasswd = isUserExist.length > 0 ? isUserExist[0].password : '';
    let passwordMatch = await checkPassword(req.body.password, hashedPasswd);
    if (passwordMatch) {
        req.session.authenticated = true;
        req.session.user = isUserExist[0].username;
        res.redirect('/admin');
    }
    else {
        res.render('login', { error: true });
    }
});

app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/login');
 });

/* Middleware */
function isAuthenticated(req, res, next) {
    if (!req.session.authenticated) res.redirect('/login');
    else next();
}

function checkUsername(username) {
    let stmt = 'SELECT * FROM users WHERE username=?';
    return new Promise(function (resolve, reject) {
        connection.query(stmt, [username], function (error, results) {
            if (error) throw error;
            resolve(results);
        });
    });
}

function checkPassword(password, hash) {
    return new Promise(function (resolve, reject) {
        bcrypt.compare(password, hash, function (error, result) {
            if (error) throw error;
            resolve(result);
        });
    });
}

// ======== Lab 10 ==========

/* The handler for undefined routes */
app.get('*', function (req, res) {
    res.render('error');
});

/* Start the application server */
app.listen(process.env.PORT || 3000, function () {
    console.log('Server has been started');
})