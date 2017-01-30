var http = require('http')
var socket = require('socket.io')
var fs = require('fs')
var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');

var app = express()
var server = http.createServer(app)
var io = socket(server)
var cnt = 0
var rooms = []
var users = {}

app.set('view engine', 'ejs')
app.set('views', './')
app.use(bodyParser.urlencoded({ extended: true }))
app.use( cookieParser() )
app.use(express.static('./'))
app.use(session(
{
	secret: 'dfgfsgfsgsf',
	resave: false,
	saveUninitialized: true
}))



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


app.get('/db', function (request, response) {
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
});

app.post('/register', (req, res) => {
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
									   client.query("INSERT INTO users VALUES ($1, $2, $3);", [my_id_key, dane.nazwa, hash(dane.haslo)], function(err, result) {
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
								reject0(true)
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
			res.redirect('/')
		},
		function(reject0)
		{
			hide_show.register_menu = "show_with_error"
			console.log("Ujojoj");
			var username
			if (!req.session.username)
			{
				username = 'Anonimowy'
			}
			else
				username = req.session.username
			res.render('glowna', {'username': username, 'hide_show': hide_show})
		}
	)
})

function hash(x)
{
	var i = 1
	for(c of x)
	{
		i = i + (c.charCodeAt(0) * 45234131) % 343243
	}
	i = i % 234323
	return i
}






app.get('/admin', function (request, response) {
	response.render('security')
});

app.get('/', (req, res) =>
{
    var hide_show = {};
    hide_show.register_menu = "hide";
	hide_show.logIn_menu = "hide"
	hide_show.zalogowanie = "nie"
	var username
	if (!req.session.username)
	{
		username = 'Anonimowy'
	}
	else
	{
		username = req.session.username
		hide_show.zalogowanie = "zalogowany"
	}
	console.log(hide_show.zalogowanie)
	res.render('glowna', {'username': username, 'hide_show': hide_show})
})

app.get('/roomsList', authorize, (req, res) =>
{
	res.render('roomsList', {'rooms': rooms, 'username': req.session.username})
})


app.get('/createRoom', authorize, (req, res) =>
{
	console.log('Created room: ' + req.query.name)

	rooms.push({'name': req.query.name, 'players': [], 'board': []})
	res.redirect('/rooms/' + (rooms.length - 1))
})

app.get('/rooms/:id', (req, res) =>
{
	var id = req.params.id
	if (rooms[id].players.length >= 6)
		res.redirect('/roomsList')
	else
		res.render('client', {'name': rooms[id].name, 'roomNo': id, 'username': req.session.username})
})

app.post('/logIn', (req, res) =>
{
	var hide_show = {};
	hide_show.logIn_menu = "hide";
	var dane = req.body;
	console.log(req.body);

	 var select_promise = new Promise(function (resolve0, reject0){
		 var rows;
			 pg.connect(process.env.DATABASE_URL, function(err, client, done) {
			client.query('SELECT password FROM users WHERE name = $1 ;', [dane.nazwa], function(err, result) {
			  done();
			  if (err)
			   { console.error(err); res.send("Error " + err); reject0(true); }
			   else {
				   console.log("result");
				   console.log(result);
				   rows = result.rows;
				   console.log("result.rows");
				   console.log(rows);
					   resolve0(rows);
			   }

			});
		});
	})

	select_promise.then(
		function(resolve0)
		{
			console.log(resolve0[0].password);
			console.log(dane.haslo)
			console.log(hash(dane.haslo))
			if (resolve0[0].password == hash(dane.haslo))
			{
				req.session.username = req.body.nazwa
				var username
				if (!req.session.username)
				{
					username = 'Anonimowy'
				}
				else
					username = req.session.username
				res.redirect('/')

			}
			else {


				hide_show.logowanie_menu = "show_with_error"
				res.render('glowna', {'username': username, 'hide_show': hide_show})
			}


		},
		function(reject0)
		{
			hide_show.logIn_menu = "show_with_error"
			console.log("Ujojoj");
			var username
			if (!req.session.username)
			{
				username = 'Anonimowy'
			}
			else
				username = req.session.username
			res.render('glowna', {'username': username, 'hide_show': hide_show})
		}
	)

})

function authorize(req, res, next)
{

	if (req.session.username)
		next()
	else
		res.redirect('/admin')
}


app.get("/wyniki", authorize, function(req, res){
	var username = req.session.username
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	  client.query('SELECT * FROM games WHERE ;', [username], function(err, result) {
	    done();
	    if (err)
	     { console.error(err); res.send("Error " + err); }
	    else
	     {    console.log("jddfykf");
	          result.rows.forEach(
	              r => {
	                  console.log(r.name);
	              }
	          );

	          response.render('wyniki', {results: result.rows} ); }
	  });
	});
})

app.get("/wyloguj", function (req, res)
{
	req.session.username = ""
	res.redirect('/')
})


io.on('connection', function(socket)
{
    console.log('Client connected: ' + socket.id)
    /*
    socket.emit('id', cnt++)
    if (cnt == 2)
    {
    	io.emit('start', {'id': Math.floor(2*Math.random())})
    }
    */
    socket.on('newgame', function()
    {
    	var roomNo = users[socket.id]

    	//console.log(emptyBoard)
    	for (var i = 0; i < rooms[roomNo].players.length; i++)
    		rooms[roomNo].players[i].emit('newgame')
    	//io.emit('newgame')
    })
    socket.on('move', function(data)
    {
    	var roomNo = users[socket.id]
    	rooms[roomNo].board[data.x][data.y] = data.id
    	//console.log(emptyBoard)
    	for (var i = 0; i < rooms[roomNo].players.length; i++)
    		rooms[roomNo].players[i].emit('move', {'board': rooms[roomNo].board, 'id': data.id})
    	//io.emit('move', {'id': data.id, 'x': data.x, 'y': data.y})
    })
	socket.on('join', function(roomNo)
	{
		socket.emit('id', rooms[roomNo].players.length)
		rooms[roomNo].players.push(socket)
		users[socket.id] = roomNo

	})
	socket.on('disconnect', function()
	{
		console.log('Client disconnected: ' + socket.id)
		var roomNo = -1
		for (var i = 0; i < rooms.length; i++)
			for (var j = 0; j < rooms[i].players.length; j++)
				if (rooms[i].players[j] == socket)
				{
					rooms[i].players.splice(j, 1)
					roomNo = i
				}
		if (roomNo != -1 && rooms[roomNo].players.length == 0)
		{
			//rooms[roomNo].players[0].emit('newgame')
			rooms[roomNo].board = [[-1, -1, -1],
				 			      [-1, -1, -1],
			    			      [-1, -1, -1]]
			//rooms[roomNo].players[0].emit('id', rooms[roomNo].players.length - 1)
		}
		else if (roomNo != -1 && rooms[roomNo].players.length > 0)
		{
			rooms[roomNo].players[0].emit('withdrawal')
			rooms[roomNo].players[0].emit('id', rooms[roomNo].players.length - 1)
		}
		delete users.socket
	})
})


server.listen( process.env.PORT || 5000)
console.log('server started')




var canvasSize = 1000
var boardSize = 10
var gridSize = canvasSize/boardSize
var manSize = gridSize/4
var board = []
var players = []
var colors = ["red", "blue", "yellow", "green", "black", "white"]


var town = 2
var road = 1
var field = 0

var segments = [{type : field}]

var north = 0, east = 1, south = 2, west = 3

var northBorder = 32
var southBorder = 32
var eastBorder = 32
var westBorder = 32

var townAlone = new createSubPiece(town, [])
var townLeft = new createSubPiece(town, [-1])
var townRight = new createSubPiece(town, [1])
var townSides = new createSubPiece(town, [-1, 1])
var townFull = new createSubPiece(town, [-1, 1, 2])

var roadEnd = new createSubPiece(road, [])
var roadLeftTurn = new createSubPiece(road, [1])
var roadRightTurn = new createSubPiece(road, [-1])
var roadStraight = new createSubPiece(road, [2])

var fieldAlone = new createSubPiece(field, [])

var currPiece, currX, currY, currRotation, randPiece, currPlayer
var mayAddMan = false
var myTurn = true
currRotation = 0


var startPiece = new createPiece(townAlone, roadStraight, fieldAlone, roadStraight, "start.jpg")
//randPiece = startPiece

function getClick(e) {
	if(e.button == 2 && myTurn)
		endTurn()
	else
		if(myTurn) {
			var xCoo = canvasToBoard(e.clientX)
			var yCoo = canvasToBoard(e.clientY)
			if(mayAddMan) {
				if(Math.abs(yCoo - currY) < Math.abs(xCoo - currX)) {
					if(currX <= xCoo && currX + 0.5 > xCoo) // lewa
						addOwner(currPiece, boardToCanvas(currX + 0.25), boardToCanvas(currY + 0.5))
					else if (currX + 1 <= xCoo && currX + 0.5 < xCoo) //prawa
						addOwner(currPiece, boardToCanvas(currX + 0.75), boardToCanvas(currY + 0.5))
				}
				else if(Math.abs(xCoo - currX) < Math.abs(yCoo - currY)) {
					if(currY <= yCoo && currY + 0.5 > yCoo) // góra
						addOwner(currPiece, boardToCanvas(currX + 0.5), boardToCanvas(currY + 0.25))
					else if (currY + 1 <= yCoo && currY + 0.5 < yCoo) //dół
						addOwner(currPiece, boardToCanvas(currX + 0.5), boardToCanvas(currY + 0.75))
				}
			}
			else {
				currX = Math.floor(xCoo)
				currY = Math.floor(yCoo)
				addPiece(randPiece, currX, currY, currRotation)
			}
		}
}

function boardToCanvas(x) {
	return canvasSize*x/boardSize
}

function canvasToBoard(x) {
	return boardSize*x/canvasSize
}

function createSubPiece(type, connections) {
	this.type = type
	this.connections = connections
}

function createPiece(up, right, down, left, img) {
	this.subPieces = [up, right, down, left]
	this.img = img
}

function drawnPiece(piece, x, y, rotation) {
	this[north] = { piece : piece.subPieces[rotation%4] }
	this[south] = { piece : piece.subPieces[(2 + rotation)%4] }
	this[east] = { piece : piece.subPieces[(1 + rotation)%4] }
	this[west] = { piece : piece.subPieces[(3 + rotation)%4] }
	this.img = new Image
	this.img.src = piece.img
	this.rotation = rotation
}

function createPlayer(id, socket, roomNo) {
	this.id = id
	this.socket = socket
	this.first = false
	this.color = colors[rooms[roomNo].players.length]
	this.pieces = 7
}

function checkAssign(piece, x, y) {

	for(var i=0; i<4; i++) {
		if(piece[i].piece.type == field)
			piece[i].assign = 0
		else {
			if(piece[i].neighbour) {
				var a = piece[i].neighbour.assign
				if(piece[i].assign)
					mergeSegments(a, piece[i].assign)
				else {
					piece[i].assign = a
					if(segments[a].parts.indexOf(y*boardSize + x) == -1) {
						console.log(`dopisuje klocek do ${a}`)
						segments[a].parts.push(y*boardSize + x)
						console.log(segments[a])
					}
				}
			}
			for(var a of piece[i].piece.connections) {
				var j = (i+a)%4
				console.log(`jestem ${piece[i].piece.type} i mam polaczenie z ${piece[j].piece.type}`)
				if(piece[i].assign) {
					if(piece[j].assign && piece[j].assign != piece[i].assign)
						mergeSegments(piece[i].assign, piece[j].assign)
				}
				else piece[i].assign = piece[j].assign
			}
			if(!piece[i].assign) {
				segments.push({parts : [y*boardSize + x], type : piece[i].piece.type})
				piece[i].assign = segments.length-1
			}
		}
	}
}

function addOwner(subPiece, x, y) {
	if(subPiece.assign.owners) {
		// wyślij sygnał: napisz, że nie można
	}
	else {
		subPiece.assign.owners = [currPlayer]
		mayAddMan = false
		console.log(`rysuje ludka na ${x}, ${y}`)
		// wyślij sygnał: drawMan(currPlayer.color, x, y)
	}
}

function checkNeighbours(piece, x, y) {
	var left = board[y*boardSize + x-1]
	var right = board[y*boardSize + x+1]
	var down = board[(y+1)*boardSize + x]
	var up = board[(y-1)*boardSize + x]

	var hasNeighbours = false

	if(left) {
		if(left[east].piece.type != piece[west].piece.type)
			return false
		hasNeighbours = true

	}
	if(right) {
		if(right[west].piece.type != piece[east].piece.type)
			return false
		hasNeighbours = true

	}
	if(down) {
		if(down[north].piece.type != piece[south].piece.type)
			return false
		hasNeighbours = true

	}
	if(up) {
		if(up[south].piece.type != piece[north].piece.type)
			return false
		hasNeighbours = true
	}
	if(!hasNeighbours) return false
	piece[west].neighbour = left[east]
	piece[east].neighbour = right[west]
	piece[south].neighbour = down[north]
	piece[north].neighbour = up[south]
	return true
}

function mergeSegments(s1, s2) {
	console.log(`merguje : ${s1}, ${s2}`)
	for(var a of segments[s2].parts) {
		for(var i=0; i<4; i++) {
			pieceAssign = board[a][i].assign
			if(pieceAssign == s2) {
				console.log("zmieniam")
				board[a][i].assign = s1
			}
		}
		if(segments[s1].parts.indexOf(a) == -1)
			segments[s1].parts.push(a)
	}
	segments[s2] = null
	console.log("po zmergowaniu:")
	console.log(segments[s1].parts)
	console.log(segments[s2])
}


function sumUp(segment) {
	var t = segment.parts.length
	if(segment.parts[0].type == field) return
	if(segment.parts[0] == town && segment.closed)
		for (var p of segment.owners)
			givePoints(p, 2*t)
	else
		for (var p of segment.owners)
			givePoints(p, t)
}

function checkClosed(subPiece) {
	var segment = subPiece.assign
	if(segment.closed) return false
	for (var a of segment.parts)
		if(!a.neighbour)
			return false
	segment.closed = true
	sumUp(segment)
	return true
}

function checkPossibility(piece, x, y) {
	return !board[y*boardSize + x] && checkNeighbours(piece, x, y)
}

function endTurn() {
	myTurn = false
	for(var i = 0; i<4; i++)
		checkClosed(currPiece[i])
}

function addPiece(piece, x, y, rotation) {
	currPiece = new drawnPiece(piece, x, y, rotation)
	if(checkPossibility(currPiece, x, y)) {
		board[y*boardSize + x] = currPiece
		drawPiece(currPiece, boardToCanvas(x), boardToCanvas(y))
		checkAssign(currPiece, x, y)
		northBorder = Math.min(northBorder, y)
		southBorder = Math.max(southBorder, y)
		eastBorder = Math.max(eastBorder, x)
		westBorder = Math.min(westBorder, x)
	/*	console.log("segmenty")
		for(var a of segments) {
			console.log(a)
		}
		console.log("assign")
		for(var i=0; i<4; i++)
			console.log(currPiece[i].assign)
		*/
		if(currPlayer.pieces)
			mayAddMan = true
		else
			endTurn()
	}
	else {
		// wyślij sygnał: powiedz, że nie można
		return false
	}
	return true
}
