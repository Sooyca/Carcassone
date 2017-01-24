function createRoom()
{
	var name = prompt("Wpisz nazwę pokoju")
	if (name != null && name != '')
		window.location.assign('/createRoom?name=' + name)
}

function changeUsername()
{
	var newUsername = prompt("Podaj nową nazwę użytkownika")
	if (newUsername != null && newUsername != '')
		window.location.assign('/changeUsername?returnUrl=' + window.location.href + '&newUsername=' + newUsername)
}

var pg = require('pg');

function logIn()
{

}

function register()
{
	window.alert("Alert");
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	  client.query("INSERT INTO users VALUES (1, 'Ala', 34);", function(err, result) {
		done();
		if (err)
		 { console.error(err); }
		else
		 { console.log('Dodano nowego użytkownika'); }
	  });
  });
}
