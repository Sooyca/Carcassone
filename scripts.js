function createRoom()
{
	var name = prompt("Wpisz nazwę pokoju")
	if (name != null && name != '')
		window.location.assign('/createRoom?name=' + name)
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
