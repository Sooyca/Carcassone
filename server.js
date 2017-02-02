var http = require('http')
var socket = require('socket.io')
var fs = require('fs')
var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');

var boardSize = 10
var app = express()
var server = http.createServer(app)
var io = socket(server)
var cnt = 0
var rooms = []
var roomNumber = {}

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
	var dane = req.body;
	var register_promise = new Promise(
		function(resolve0, reject0)
		{
			try
			{
				if(dane.haslo == dane.potwierdz_haslo)
				{
					
								
									pg.connect(process.env.DATABASE_URL, function(err, client, done) {
										client.query("INSERT INTO users (name, password) VALUES ($1, $2);", [dane.nazwa, hash(dane.haslo)], function(err, result) {
												done();
												if (err)
												{ console.error(err); reject0(err)}
												else
												{
													console.log('Dodano nowego użytkownika');
													resolve0(true);
												}
												});
										});
				}
									
				else
				{
					reject0("not_matching");
				}
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
			var username = req.session.username;
			hide_show.register_menu = "register_complete"
			res.render('glowna', {'username': username, 'hide_show': hide_show})
			res.redirect('/')
		},
		function(reject0)
		{
			hide_show.register_menu = "show_with_error"
			if(reject0 == "not_matching")
			{
				hide_show.register_menu = "not_matching"
			}
			if(reject0.routine == '_bt_check_unique')
			{
				hide_show.register_menu = "occupado";
			}
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

app.get('/roomsListCarcassonne', authorize, (req, res) =>
{
	res.render('roomsListCarcassonne', {'rooms': rooms, 'username': req.session.username})
})


app.get('/createRoom', authorize, (req, res) =>
{
	console.log('Created room: ' + req.query.name)
	var pos = -1
	for (var i = 0; i < rooms.length; i++)
	{
		if (rooms[i] == undefined)
		{
			pos = i
			break
		}
	}
	if (pos == -1)
	{
		rooms.push({})
		pos = rooms.length - 1
	}
	rooms[pos] = {
		'name': req.query.name,
		'players': {},
		'playersCnt': 0,
		'board': [],
		'turn': -1,
		'segments' : [{'type' : field}],
		'randPiece': startPiece,
		'currX': 0,
		'currY': 0,
		'rotation': 0,
		'gameOn': false,
		'southBorder': Math.floor(boardSize/2),
		'northBorder': Math.floor(boardSize/2),
		'westBorder': Math.floor(boardSize/2),
		'eastBorder': Math.floor(boardSize/2),
		'pieces': createPieces(),
		'left': []
	}
	res.redirect('/rooms/' + pos)
})

app.get('/rooms/:id', (req, res) =>
{
	var id = req.params.id
	if (rooms[id] == undefined || rooms[id].playersCnt >= 6 || rooms[id].gameOn)
		res.redirect('/roomsListCarcassonne')
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
			req.session.username = req.body.nazwa
			var username = req.session.username
			if(resolve0 != [])
			{
				console.log(resolve0[0].password);
				console.log(dane.haslo)
				console.log(hash(dane.haslo))
				if (resolve0[0].password == hash(dane.haslo))
				{
					if (!req.session.username)
					{
						username = 'Anonimowy'
					}
					else
						username = req.session.username
					res.redirect('/')
				}
				else 
				{
					hide_show.logowanie_menu = "show_with_error"
					res.render('glowna', {'username': username, 'hide_show': hide_show})
				}
			}
			else
			{
					hide_show.logowanie_menu = "show_with_error_NO_USER"
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
	var hide_show = {};
	if (req.session.username)
	{
		next()
	}
	else
	{
		var username = req.session.username;
		hide_show.logIn_menu = "niezalogowany";
		res.render('glowna', {'username': username, 'hide_show': hide_show});
	}
}


app.get("/wyniki_carcassonne", authorize, function(req, res){
	var username = req.session.username;
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	client.query('SELECT * FROM carcassonne_games WHERE black_name = $1 OR blue_name = $1 OR green_name = $1 OR red_name = $1 OR white_name = $1 OR yellow_name = $1;', [username], function(err, result) {
			done();
			if (err)
			{ console.error(err); res.send("Error " + err); }
			else
			{    
				console.log("jddfykf");
				console.log(result.rows)
				res.render('wyniki_carcassonne', {results: result.rows} );
			}
		
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

	socket.on('join', function(data)
	{
		var id = rooms[data.roomNo].playersCnt
		socket.emit('id', id)
		////console.log(data)
		rooms[data.roomNo].players[socket.id] = {
			'socket': socket,
			'color': colors[id],
			'pieces': 8,
			'roomNo': data.roomNo,
			'username': data.username,
			'id': id,
			'mayAddMan': false,
			'canvas': data.canvas,
			'points': 0
		}
		rooms[data.roomNo].playersCnt++
		//console.log(data.roomNo)
		roomNumber[socket.id] = data.roomNo

	})

	socket.on('newgame', function()
	{
		try
		{
			var roomNo = roomNumber[socket.id]
			var room = rooms[roomNo]
			if (room == undefined)
				return
			if (room.gameOn) return
			if (room.players[socket.id].id != 0)
				return
			room.board = []
			room.left = []
			room.turn = 0
			room.segments = [{type : field}]
			room.randPiece = startPiece
			room.rotation = 0
			room.gameOn = true
			room.southBorder = room.northBorder = room.westBorder = room.eastBorder = Math.floor(boardSize/2)
			room.pieces = createPieces()
			var j = 0
			for (var i in room.players)
			{
				room.players[i].pieces = 8
				room.players[i].points = 0
				room.players[i].mayAddMan = false
				room.players[i].id = j
				room.players[i].color = j
				j++
			}
			room.playerCnt = j
			update(room)
			var r = Math.floor(room.pieces.length * Math.random())
			var x = Math.floor(boardSize/2)
			var y = Math.floor(boardSize/2)
			room.randPiece = room.pieces[r]
			room.currPiece = new drawnPiece(startPiece, x, y, 0)
			room.board[y*boardSize + x] = room.currPiece
			checkAssign(room.currPiece, x, y, room)
			for (var i in rooms[roomNo].players)
			{
				room.players[i].socket.emit('newgame')
			}
			for (var i in room.players)
			{
				room.players[i].socket.emit('drawPiece', {'piece': {'img': room.currPiece.img, 'rotation': room.currPiece.rotation}, 'pos': boardToCanvas(x, y, room.players[i].canvas)})
				room.players[i].socket.emit('newPiece', room.randPiece)
			}
		}
		catch(err)
		{
			console.log(err);
		}
	})

	socket.on('click', function(e)
	{
		try
		{
			var roomNo = roomNumber[socket.id]
			////console.log(roomNo)
			var room = rooms[roomNo]
			if (room == undefined)
				return
			var player = room.players[socket.id]
			//player.socket.emit('drawPiece', {'piece': startPiece, 'pos': {'x': 500, 'y': 500}})
			var myTurn = (room.turn == room.players[socket.id].id)
	// 	console.log(room.turn)
			//console.log(myTurn)
			var mayAddMan = player.mayAddMan
			if(myTurn && room.gameOn)
			{
				var coo = canvasToBoard(e, player.canvas)
				if(mayAddMan)
				{
					if(Math.floor(coo.x) == room.currX && Math.floor(coo.y) == room.currY) {
						var x1 = coo.x - room.currX - 0.5
						var y1 = coo.y - room.currY - 0.5
						if (x1-y1 > 0 && x1+y1 > 0) {
							if(room.currPiece[east].piece.type == field && room.currPiece.cloister)
								addOwner(room.currPiece,room.currX + 0.5, room.currY + 0.5, player, room)
							else
								addOwner(room.currPiece[east], room.currX + 0.8, room.currY + 0.5, player, room)
						}
						else if(x1-y1 > 0 && x1+y1 < 0){
							if(room.currPiece[north].piece.type == field && room.currPiece.cloister)
								addOwner(room.currPiece, room.currX + 0.5, room.currY + 0.5, player, room)
							else
								addOwner(room.currPiece[north], room.currX + 0.5, room.currY + 0.2, player, room)
						}
						else if(x1-y1 < 0 && x1+y1 > 0){
							if(room.currPiece[south].piece.type == field && room.currPiece.cloister)
								addOwner(room.currPiece, room.currX + 0.5, room.currY + 0.5, player, room)
							else
								addOwner(room.currPiece[south], room.currX + 0.5, room.currY + 0.8, player, room)
						}
						else {
							if(room.currPiece[west].piece.type == field && room.currPiece.cloister)
								addOwner(room.currPiece, room.currX + 0.5, room.currY + 0.5, player, room)
							else
								addOwner(room.currPiece[west], room.currX + 0.2, room.currY + 0.5, player, room)
						}
					}
				}
				else
				{
					room.currX = Math.floor(coo.x)
					room.currY = Math.floor(coo.y)
					addPiece(room.randPiece, room.currX, room.currY, room.rotation, room, player)
				}
			}
		}
		catch(err)
		{
			console.log(err);
		}
	})

	socket.on('endturn', function()
	{
		try
		{
			var roomNo = roomNumber[socket.id]
			var room = rooms[roomNo]
			if (room == undefined)
				return
			var player = room.players[socket.id]
			endTurn(room, player)
		}
		catch(err)
		{
			console.log(err);
		}
	})

	socket.on('rotate', function(r)
	{	
		try
		{
			var roomNo = roomNumber[socket.id]
			var room = rooms[roomNo]
			if (room == undefined)
				return
			var myTurn = (room.turn == room.players[socket.id].id)
			if (!myTurn) return
			for (var i in room.players)
				room.players[i].socket.emit('rotate', r)
			room.rotation += 4+r
		}
		catch (err)
		{
			console.log(err)
		}

	})

	socket.on('disconnect', function()
	{
		try
		{
			var roomNo = roomNumber[socket.id]
			var room = rooms[roomNo]
			if (room == undefined)
				return
			if (room.players[socket.id].id == 0)
			{
				endGame(room)
				delete rooms[roomNo]
				return
			}
			room.left.push(room.players[socket.id].id)
		}
		catch(err)
		{
			console.log(err)
		}
	})
})

server.listen( process.env.PORT || 5000)
console.log('server started')



var colors = ['../black.png', '../blue.png', '../green.png', '../white.png', '../red.png', '../yellow.png']


var town = 2
var road = 1
var field = 0
var monk = 3

var north = 0, east = 1, south = 2, west = 3

var northBorder = Math.floor(boardSize/2)
var southBorder = Math.floor(boardSize/2)
var eastBorder = Math.floor(boardSize/2)
var westBorder = Math.floor(boardSize/2)

var townAlone = new createSubPiece(town, [])
var townLeft = new createSubPiece(town, [1])
var townRight = new createSubPiece(town, [-1])
var townSides = new createSubPiece(town, [-1, 1])
var townFull = new createSubPiece(town, [-1, 1, 2])
var townStraight = new createSubPiece(town, [2])

var roadEnd = new createSubPiece(road, [])
var roadLeft = new createSubPiece(road, [1])
var roadRight = new createSubPiece(road, [-1])
var roadStraight = new createSubPiece(road, [2])

var fieldAlone = new createSubPiece(field, [])

//var currPiece, currX, currY, currPlayer
var currRotation, randPiece
currRotation = 0


var startPiece = new createPiece(townAlone, roadStraight, fieldAlone, roadStraight, "../start.jpg")
randPiece = startPiece

function createPieces()
{
	var pieces = []
/*
	for(var i=0; i<4; i++) {
		pieces.push(new createPiece(fieldAlone, fieldAlone, fieldAlone, fieldAlone, "../cloister.jpg"))
		pieces[pieces.length-1].cloister = true
	}
	for(var i=0; i<2; i++) {
		pieces.push(new createPiece(fieldAlone, fieldAlone, roadEnd, fieldAlone, "../cloisterWithRoad.jpg"))
		pieces[pieces.length-1].cloister = true
	}

	pieces.push(new createPiece(townFull, townFull, townFull, townFull, "../fullTown.jpg"))

	for(var i=0; i<3; i++)
		pieces.push(new createPiece(townSides, townRight, fieldAlone, townLeft, "../tripleTown.jpg"))

	//pieces.push(new createPiece(townSidesP, townRight, fieldAlone, townLeft, "tripleTownWithP.jpg")
	pieces.push(new createPiece(townSides, townRight, roadEnd, townLeft, "../tripleTownAndRoad.jpg"))

	//for(var i=0; i<2; i++)
	//	pieces.push(new createPiece(townSidesP, townRight, roadEnd, townLeft, "tripleTownAndRoadWithP.jpg")

	for(var i=0; i<3; i++)
		pieces.push(new createPiece(townRight, fieldAlone, fieldAlone, townLeft, "../triaTown.jpg"))

	//for(var i=0; i<2; i++)
	//	pieces.push(new createPiece(townRightP, fieldAlone, fieldAlone, townLeft, "triaTownWithP.jpg")

	for(var i=0; i<3; i++)
		pieces.push(new createPiece(townRight, roadLeft, roadRight, townLeft, "../triaTownAndRoad.jpg"))

	//for(var i=0; i<2; i++)
	//	pieces.push(new createPiece(townRightP, roadLeft, roadRight, townLeft, "triaTownAndRoadWithP.jpg")

	pieces.push(new createPiece(fieldAlone, townStraight, fieldAlone, townStraight, "../straightTown.jpg"))

	//for(var i=0; i<2; i++)
	//	pieces.push(new createPiece(fieldAlone, townStraightP, fieldAlone, townStraight, "straightTownWithP.jpg")

	for(var i=0; i<2; i++)
		pieces.push(new createPiece(townAlone, fieldAlone, fieldAlone, townAlone, "../adjacentTowns.jpg"))

	for(var i=0; i<3; i++)
		pieces.push(new createPiece(townAlone, fieldAlone, townAlone, fieldAlone, "../oppositeTowns.jpg"))

	for(var i=0; i<5; i++)
		pieces.push(new createPiece(townAlone, fieldAlone, fieldAlone, fieldAlone, "../aloneTown.jpg"))

	for(var i=0; i<3; i++)
		pieces.push(new createPiece(townAlone, fieldAlone, roadLeft, roadRight, "../aloneTownWithLeftCurve.jpg"))

	for(var i=0; i<3; i++)
		pieces.push(new createPiece(townAlone, roadLeft, roadRight, fieldAlone, "../aloneTownWithRightCurve.jpg"))

	for(var i=0; i<3; i++)
		pieces.push(new createPiece(townAlone, roadEnd, roadEnd, roadEnd, "../aloneTownWithCrossing.jpg"))

	for(var i=0; i<3; i++)
		pieces.push(new createPiece(townAlone, roadStraight, fieldAlone, roadStraight, "../start.jpg"))


	for(var i=0; i<8; i++)
		pieces.push(new createPiece(roadStraight, fieldAlone, roadStraight, fieldAlone, "../straightRoad.jpg"))

	for(var i=0; i<9; i++)
		pieces.push(new createPiece(fieldAlone, fieldAlone, roadLeft, roadRight, "../curve.jpg"))*/
	for(var i=0; i<4; i++)
		pieces.push(new createPiece(fieldAlone, roadEnd, roadEnd, roadEnd, "../tripleCrossing.jpg"))

	pieces.push(new createPiece(roadEnd, roadEnd, roadEnd, roadEnd, "../crossing.jpg"))

	return pieces
}

/*

	zliczać, ile ludków:
		- w segments
		- w podliczaniu pktów



	dodać klasztory:
		- w podliczaniu - sprawdzać, czy go zamknęliśmy przez sąsiada

*/

function getMousePos(evt, canvas)
{
	return {
	'x': evt.clientX - canvas.x,
	'y': evt.clientY - canvas.y
	}
}

function boardToCanvas(x, y, canvas) {
	return {
		'x': canvas.size*x/boardSize,
		'y': canvas.size*y/boardSize
	}
}

function canvasToBoard(evt, canvas) {
	return {
		'x': boardSize*evt.clientX/canvas.size,
		'y': boardSize*evt.clientY/canvas.size
	}
}

function createSubPiece(type, connections) {
	this.type = type
	this.connections = connections
}

function createPiece(up, right, down, left, img) {
	this.subPieces = [up, right, down, left]
	this.img = img
}

function drawnPiece(piece1, x, y, rotation) {
	this[north] = { piece : piece1.subPieces[(4-rotation%4)%4] }
	this[south] = { piece : piece1.subPieces[(6 - rotation%4)%4] }
	this[east] = { piece : piece1.subPieces[(5 - rotation%4)%4] }
	this[west] = { piece : piece1.subPieces[(7 - rotation%4)%4] }
	this.cloister = piece1.cloister
	this.img = piece1.img
	this.rotation = rotation
}

function checkAssign(piece, x, y, room) {

	for(var i=0; i<4; i++) {
		if(piece[i].piece.type == field)
			piece[i].assign = 0
		else {
			if(piece[i].neighbour) {
				var a = piece[i].neighbour.assign
				if(piece[i].assign)
					mergeSegments(a, piece[i].assign, room)
				else {
					piece[i].assign = a
					if(room.segments[a].parts.indexOf(y*boardSize + x) == -1) {
						room.segments[a].parts.push(y*boardSize + x)
					}
				}
			}
			for(var a of piece[i].piece.connections) {
				var j = (i+a+4)%4
				if(piece[i].assign) {
					if(piece[j].assign && piece[j].assign != piece[i].assign)
						mergeSegments(piece[i].assign, piece[j].assign, room)
				}
				else piece[i].assign = piece[j].assign
			}
			if(!piece[i].assign) {
				room.segments.push({parts : [y*boardSize + x], type : piece[i].piece.type})
				piece[i].assign = room.segments.length-1
			}
		}
	}
}

function checkCloister(room, x, y) {
	var neigh = 0
	for (var i = Math.max(x-1, 0); i<=Math.min(x+1, boardSize -1); i++)
		for(var j = Math.max(y-1, 0); j<= Math.min(y+1, boardSize-1); j++)
			if(room.board[j*boardSize + i])
				neigh++
	return neigh
}

function addOwner(subPiece, x, y, player, room) {
	if(subPiece.cloister) {
		var p = room.board[room.currY*boardSize + room.currX]
		console.log("w addOwner")
		console.log(p)
		if(checkCloister(room, room.currX, room.currY) == 9) {
			givePoints(player, 9)
		}
		else {
			p.owner = player
			room.segments.push({type: monk, owners: [player], x : room.currX, y: room.currY})
			player.pieces--
			for (var i in room.players) {
				pos = boardToCanvas(x, y, room.players[i].canvas)
				room.players[i].socket.emit('drawMan', {'color': player.color, 'x': pos.x, 'y': pos.y})
			}
		}
		endTurn(room, player)
		return
	}
	if(subPiece.piece.type == field)
		return
	segment = room.segments[subPiece.assign]
	if(!segment.owners) {
		segment.owners = [{player : player, num : 1}]
		player.pieces--
		if(!checkClosed(subPiece.assign, room)) {
			for (var i in room.players) {
				pos = boardToCanvas(x, y, room.players[i].canvas)
				room.players[i].socket.emit('drawMan', {'color': player.color, 'x': pos.x, 'y': pos.y})
			}
			if(!segment.men) segment.men = [{x : Math.floor(x), y: Math.floor(y)}]
			else segment.men.push({x : Math.floor(x), y: Math.floor(y)})
		}
		endTurn(room, player)
	}
}

function checkNeighbours(piece, x, y, room, check=false) {
	var left = (x <= 0 ? false : room.board[y*boardSize + x-1])
	var right = (x >= boardSize-1 ? false : room.board[y*boardSize + x+1])
	var down = (y >= boardSize-1 ? false : room.board[(y+1)*boardSize + x])
	var up = (y <= 0 ? false : room.board[(y-1)*boardSize + x])

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
	if(check) return true
	if(left) {
		piece[west].neighbour = left[east]
		left[east].neighbour = true
	}
	if(right) {
		piece[east].neighbour = right[west]
		right[west].neighbour = true
	}
	if(down) {
		piece[south].neighbour = down[north]
		down[north].neighbour = true
	}
	if(up) {
		piece[north].neighbour = up[south]
		up[south].neighbour = true
	}
	return true
}

function mergeSegments(s1, s2, room) {
	for(var a of room.segments[s2].parts) {
		for(var i=0; i<4; i++) {
			pieceAssign = room.board[a][i].assign
			if(pieceAssign == s2) {
				room.board[a][i].assign = s1
			}
		}
		if(room.segments[s1].parts.indexOf(a) == -1)
			room.segments[s1].parts.push(a)
	}
	if(room.segments[s2].owners) {
		if(!room.segments[s1].owners)
			room.segments[s1].owners = []
		for(var p2 of room.segments[s2].owners) {
			var found = false
			if(room.segments[s1].owners) {
				for(var p1 of room.segments[s1].owners) {
					if(p1.player == p2.player) {
						p1.num += p2.num
						found = true
					}
				}
			}
		if(!found)
			room.segments[s1].owners.push(p2)
		}
		for(var c of room.segments[s2].men)
			room.segments[s1].men.push(c)
	}
	room.segments[s2] = null
}

function findRightfulOwners(segment) {
	var maxx = 0
	console.log("w suwerenach")
	console.log(segment)
	for(var p of segment.owners)
		maxx = Math.max(maxx, p.num)
	var masters = []
	for(var p of segment.owners)
		if(p.num == maxx)
			masters.push(p.player)
	return masters
}

function sumUp(segment, room) {
	console.log("SUMUJEMY!")
	console.log(segment)
	if(segment.type == field || !segment.owners) return
	if(segment.type == monk) {
		console.log("UWAGA!")
		neigh = checkCloister(room, segment.x, segment.y)
		console.log(neigh)
		givePoints(segment.owners[0], neigh)
		console.log("dodalem pkty")
		redrawPiece(room, segment.x, segment.y)
		segment.owners[0].pieces++
		console.log("przerysowane")
		return
	}
	var t = segment.parts.length
	masters = findRightfulOwners(segment)
	console.log(masters)
	if(segment.type == town && segment.closed) {
		for (var p of masters) {
			givePoints(p, 2*t)
		}
		if(segment.men)
				for(var c of segment.men)
					redrawPiece(room, c.x, c.y)
		for(var p of segment.owners)
			p.player.pieces += p.num
	}
	else
		for (var p of masters) {
			givePoints(p, t)
			console.log("segment.men")
			console.log(segment.men)
		}
		if(segment.men)
				for(var c of segment.men)
					redrawPiece(room, c.x, c.y)
		for(var p of segment.owners)
			p.player.pieces += p.num
	segment.owners = null
}

function givePoints(player, points)
{
	player.points += points
}

function checkClosed(segNum, room) {
	console.log("SPRAWDZAM ZAMKNIĘCIE")
	var segment = room.segments[segNum]
	if(segment.type == field) {
		console.log("pole")
		return false
	}
	if(segment.closed) return false
	for (var a of segment.parts) {
		for (var i = 0; i<4; i++) {
			if(room.board[a][i].assign == segNum) {
				if(!room.board[a][i].neighbour) {
					console.log(`nie jest ukończony segment:`)
					console.log(segment)
					return false
				}
			}
		}
	}
	segment.closed = true
	sumUp(segment, room)
	return true
}

function checkPossibility(piece, x, y, room) {
	return !room.board[y*boardSize + x] && checkNeighbours(piece, x, y, room)
}

function checkRandPiece(piece, room) {
	for(var x = room.westBorder-1; x <= room.eastBorder+1; x++) {
		for(var y = room.northBorder-1; y<= room.southBorder+1; y++) {
			for(var r = 0; r<4; r++) {
				var checkedPiece = new drawnPiece(piece, x, y, r)
				if(!room.board[y*boardSize + x])
					if(checkNeighbours(checkedPiece, x, y, room, true)) return true
			}
		}
	}
	return false
}

function endTurn(room, player) {
	room.rotation = 0
	if (player.mayAddMan == false)
		return
	do
	{
		room.turn = (room.turn+1) % room.playersCnt
	}
	while(room.turn in room.left);
	player.mayAddMan = false;
	for(var i = 0; i < 4; i++) {
		checkClosed(room.currPiece[i].assign, room)
		console.log("to chcemy zamknac")
		console.log(room.segments[room.currPiece[i].assign].type)
}
	var rejected = []
	var p
	while(room.pieces.length)
	{
		var r = Math.floor(room.pieces.length * Math.random())
		p = room.pieces.splice(r,1)
	//	console.log(p)
		if (checkRandPiece(p[0], room)) break
		rejected.push(p[0])
	}
	if (room.pieces.length == 0)
	{

		endGame(room)
		return
	}
	room.pieces.concat(rejected)
	room.randPiece = p[0]
	for (var i in room.players)
	{
		room.players[i].socket.emit('newPiece', room.randPiece)
	}
	update(room)
	console.log(room.players)
	console.log('Nowa tura')
	//console.log(room)
}

function addPiece(piece, x, y, rotation, room, player) {
	room.currPiece = new drawnPiece(room.randPiece, x, y, rotation)
	if(checkPossibility(room.currPiece, x, y, room))
	{
		room.board[y*boardSize + x] = room.currPiece
		for (var i in room.players)
			room.players[i].socket.emit('drawPiece', {'piece': {'img': room.currPiece.img, 'rotation': room.currPiece.rotation}, 'pos': boardToCanvas(x, y, room.players[i].canvas)})
		checkAssign(room.currPiece, x, y, room)
		for(var i=x-1; i<= x+1; i++) {
			for(var j=y-1; j<=y+1; j++) {
				var p = room.board[j*boardSize + i]
				if((i!= x || j!=y) && p && p.cloister && p.owner) {
					if(checkCloister(room, i, j) == 9) {
						givePoints(p.owner, 9)
						p.owner = null
					}
				}
			}
		}
		room.northBorder = Math.min(northBorder, y)
		room.southBorder = Math.max(southBorder, y)
		room.eastBorder = Math.max(eastBorder, x)
		room.westBorder = Math.min(westBorder, x)
		player.mayAddMan = true
		if(player.pieces == 0)
			endTurn(room, player)
	}
	return true
}

function endGame(room)
{
	console.log("KONIEC")
	room.gameOn = false
	for (var s of room.segments)
		if(s && !s.closed)
			sumUp(s, room)
	console.log(room.players)
	for (var i in room.players)
	{
		room.players[i].socket.emit('newPiece', room.randPiece)
	}
	update(room)
	for (var i in room.players){
		room.players[i].socket.emit('endGame')
	}
	console.log(room);
	zapisz_w_bazie(room);
}

function redrawPiece(room, x, y) {
	piece = room.board[y*boardSize + x]
	console.log(piece)
	for (var i in room.players)
		room.players[i].socket.emit('drawPiece', {'piece': {'img': piece.img, 'rotation': piece.rotation}, 'pos': boardToCanvas(x, y, room.players[i].canvas)})
}

function update(room)
{
	var points = []
	var colors = []
	var menCnt = []
	for (var i in room.players)
	{
		points.push(room.players[i].points)
		colors.push(room.players[i].color)
		menCnt.push(room.players[i].pieces)
	}
	for (var i in room.players){
		room.players[i].socket.emit('stats', {'points': points, 'colors': colors, 'menCnt': menCnt})
	}
}

function zapisz_w_bazie(room)
{
	try
	{
		var rekord = {
			black_name: "",
			black_points: 0,
			blue_name: "",
			blue_points: 0,
			green_name: "",
			green_points: 0,
			red_name: "",
			red_points: 0,
			white_name: "",
			white_points: 0,
			yellow_name: "",
			yellow_points: 0
		}
		for (socket_id in room.players)
		{	
			console.log("Players")
			console.log(socket_id);
			console.log(room.players);
			var p = room.players[socket_id];
			console.log("pe");
			console.log(p);
			switch (p.color)
			{
				case colors[0]:
					rekord.black_name = p.username;
					rekord.black_points = p.points;
					break;
				case colors[1]:
					rekord.blue_name = p.username;
					rekord.blue_points = p.points;
					break;
				case colors[2]:
					rekord.green_name = p.username;
					rekord.green_points = p.points;
					break;
				case colors[3]:
					rekord.red_name = p.username;
					rekord.red_points = p.points;
					break;
				case colors[4]:
					rekord.white_name = p.username;
					rekord.white_points = p.points;
					break;
				case colors[5]:
					rekord.yellow_name = p.username;
					rekord.yellow_points = p.points;
					break;
			}
		}
		var insert_promise = new Promise(function (resolve0, reject0){
			var rows;
				pg.connect(process.env.DATABASE_URL, function(err, client, done) {
				client.query("INSERT INTO carcassonne_games (game_id, black_name, black_points, blue_name, blue_points, green_name, green_points, red_name, red_points, white_name, white_points, yellow_name, yellow_points) VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);",[rekord.black_name, rekord.black_points, rekord.blue_name, rekord.blue_points, rekord.green_name, rekord.green_points, rekord.red_name, rekord.red_points, rekord.white_name, rekord.white_points, rekord.yellow_name, rekord.yellow_points], function(err, result) {
				done();
				if (err)
				{ console.error(err); res.send("Error " + err); reject0(true); }
				else {
					console.log("result");
					console.log(result);
					rows = result.rows;
					console.log("result.rows");
					console.log(rows);
						resolve0(true);
				}

				});
			});
		})
		insert_promise.then(
			function(resolve0)
			{
				console.log("Dodano wpis wyników do bazy danych");
			},
			function(reject0)
			{
				console.log("Wystąpił błąd podczas wpisywania wyników do bazy.");
			}
		)
	}
	catch(err)
	{
		console.log(err);
	}
	
}

