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

function logOut()
{
	window.location.assign('/wyloguj')
}

function wyniki()
{
	window.location.assign('/wyniki')
}

function roomList(){
	window.location.assign('/roomsList')
}

function logIn()
{

}

function register()
{
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	  client.query("INSERT INTO users VALUES (1, 'Ala', 34);", function(err, result) {
		done();
		window.alert("Alert");
		if (err)
		 { console.error(err); }
		else
		 { console.log('Dodano nowego użytkownika'); }
	  });
  });
  return false
}
