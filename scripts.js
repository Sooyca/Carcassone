function createRoom()
{
	var name = prompt("Wpisz nazwę pokoju")
	if (name != null && name != '' && name.length < 30)
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

function roomsListCarcassonne(){
	window.location.assign('/roomsListCarcassonne')
}
