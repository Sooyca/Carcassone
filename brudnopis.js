/*

app.post('/', (req, res) => {

    var username
	if (!req.cookies.username)
	{
		username = 'Anonimowy'
		res.cookie('username', username)
	}
	else
		username = req.cookies.username
    res.render('main', {'username': username})
    console.log(req.body);
})
*/

/*

var pg = require('pg');

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
if (err) throw err;
console.log('Connected to postgres! Getting schemas...');

client
.query('SELECT table_schema,table_name FROM information_schema.tables;')
.on('row', function(row) {
console.log(JSON.stringify(row));
});
});


var dane = req.body;
console.log(req.body);
res.render('main', {'username': username})
})

*/
/*

var pg = require('pg');

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    });
});


    console.log(req.body);
    res.render('main', {'username': username})
})
*/
