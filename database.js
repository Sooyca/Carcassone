var pg = require('pg');
var bodyParser = require('body-parser')

express().use(bodyParser.urlencoded({ extended: true }));

exports.show_zawartosc = function(request, response) {
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  client.query('SELECT * FROM users;', function(err, result) {
    done();
    if (err)
     { console.error(err); response.send("Error " + err); }
    else
     {    console.log("snhgnhunagsnueicnrawigy7bawnigawgrsv");
          result.rows.forEach(
              r => {
                  console.log(r.name);
              }
          );

          response.render('views/pages/db', {results: result.rows} ); }
  });
});

}

exports.zarejestruj = function(res, req) {
    var hide_show = {};
    hide_show.register_menu = "hide";
    var register_promise = new Promise(
        function(resolve0, reject0)
        {
            try
            {
                var dane = req.body;
                console.log(req.body);

                 var select_promise = new Promise(function (resolve, reject){
                     var rows;
                         pg.connect(process.env.DATABASE_URL, function(err, client, done) {
                        client.query('SELECT name FROM users WHERE name = $1 ;', [dane.nazwa], function(err, result) {
                          done();
                          if (err)
                           { console.error(err); response.send("Error " + err); }
                           else {
                               console.log("result");
                               console.log(result);
                               rows = result.rows;
                               console.log("result.rows");
                               console.log(rows);
                                   resolve(rows);
                           }

                        });
                    });

                })

                select_promise.then(
                    function(resolve)
                    {
                        let i = 0;
                        resolve.forEach(
                            r => {
                                i = i + 1;
                            }
                        );
                        console.log("przed przed wpisaniem")
                        console.log(i);
                        console.log(resolve);

                        if(i == 0)
                        {
                            console.log("przed wpisaniem")
                            var my_id_key;
                            var file_read_promise = new Promise(function(resolve, reject) {
                                fs.readFile('./data/users', 'utf-8', (err, data) =>
                               {
                                   if (err) throw err;
                                   console.log("plik");
                                   console.log(data);
                                   my_id_key = data[0] * 1;
                                   console.log("my_id_key po przypisaniu");
                                   console.log(my_id_key)
                                   resolve(my_id_key);
                               });
                           })
                           file_read_promise.then(function(resolve)
                           {
                               console.log("file promise then")
                                console.log(my_id_key);
                                console.log("resolve in second then")
                                console.log(resolve);
                                pg.connect(process.env.DATABASE_URL, function(err, client, done) {
                            	       client.query("INSERT INTO users VALUES ($1, $2, 3);", [my_id_key, dane.nazwa], function(err, result) {
                                    		done();
                                    		if (err)
                                    		 { console.error(err); }
                                    		else
                                            {
                                                my_id_key = my_id_key + 1;
                                                fs.writeFile('./data/users', my_id_key, function(err) {
                                                    if(err) {
                                                        return console.log(err);
                                                    }
                                                });
                                                console.log('Dodano nowego użytkownika');
                                                resolve0(true);
                                            }
                                            });
                                    });
                                },
                                function(reject)
                                {
                                    console.log("Błąd odczytu pliku.")
                                }
                        )
                        }
                        else
                        {
                                //.alert("Nazwa użytkownika jest zajęta;")
                                console.log("wolne nie true");
                        }
                    },
                    function(err)
                    {
                        console.log("Błąd")
                        console.log(resolve);
                    }
                )
            }
            catch(err)
            {
                console.log(err);
                //window.alert("Coś nie zadziałało. Jesli ciekawi Cię ztrona techniczna, to na konsoli wyświtla się to: \n" + err);
            }
        }
    );
    register_promise.then(
        function(resolve0)
        {
            if(resolve0)
            {
                hide_show.register_menu = 'show';
            }
            var username
            if (!req.cookies.username)
            {
                username = 'Anonimowy'
                res.cookie('username', username)
            }
            else
                username = req.cookies.username
            res.render('main', {'username': username, 'hide_show': hide_show})
        },
        function(reject0)
        {
            hide_show.register_menu = "show_with_error"
            console.log("Ujojoj");
            var username
            if (!req.cookies.username)
            {
                username = 'Anonimowy'
                res.cookie('username', username)
            }
            else
                username = req.cookies.username
            res.render('main', {'username': username, 'hide_show': hide_show})
        }
    )
}
