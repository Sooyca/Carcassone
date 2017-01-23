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
var roomNumber = {}

var emptyBoard = [[-1, -1, -1],
				 [-1, -1, -1],
				 [-1, -1, -1]]

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


app.get('/', (req, res) =>
{
	var username
	if (!req.cookies.username)
	{
		username = 'Anonimowy'
		res.cookie('username', username)
	}
	else
		username = req.cookies.username
	res.render('main', {'username': username})
})

app.get('/roomsList', (req, res) =>
{
	res.render('roomsList', {'rooms': rooms, 'username': req.cookies.username})
})

app.get('/changeUsername', (req, res) =>
{
	res.cookie('username', req.query.newUsername)
	res.redirect(req.query.returnUrl)
})

app.get('/createRoom', (req, res) =>
{
	console.log('Created room: ' + req.query.name)
	var board = [[-1, -1, -1],
				 [-1, -1, -1],
				 [-1, -1, -1]]
	rooms.push({
		'name': req.query.name, 
		'players': {}, 
		'playersCnt': 0,
		'board': [], 
		'turn': 0,
		'segments' : [{'type' : field}],
		'currPiece': startPiece,
		'currX': 0,
		'currY': 0
	})
	res.redirect('/rooms/' + (rooms.length - 1))
})

app.get('/rooms/:id', (req, res) => 
{
	var id = req.params.id
	if (rooms[id].playersCnt >= 6)
		res.redirect('/roomsList')
	else
		res.render('room', {'name': rooms[id].name, 'roomNo': id, 'username': req.cookies.username})
})

io.on('connection', function(socket) 
{
    console.log('Client connected: ' + socket.id)

	socket.on('join', function(data)
	{
		var id = rooms[data.roomNo].playersCnt
		socket.emit('id', id)
		console.log(data)
		rooms[data.roomNo].players[socket.id] = {
			'socket': socket, 
			'color': colors[id], 
			'pieces': 8, 
			'roomNo': data.roomNo, 
			'id': id, 
			'mayAddMan': false,
			'canvas': data.canvas,
			'points': 0
		}
		rooms[data.roomNo].playersCnt++
		roomNumber[socket.id] = data.roomNo
		
	})
	
    socket.on('newgame', function()
    {
    	var roomNo = roomNumber[socket.id]
    	rooms[roomNo].board = []
    	for (var i in rooms[roomNo].players)
    		rooms[roomNo].players[i].socket.emit('newgame')
    })
    
    socket.on('click', function(e) 
    {
    	console.log(e)
    	var roomNo = roomNumber[socket.id]
    	var room = rooms[roomNo]
    	var player = room.players[socket.id]
    	//player.socket.emit('drawPiece', {'piece': startPiece, 'pos': {'x': 500, 'y': 500}})
    	var myTurn = (room.turn == room.players[socket.id].id)
    	var mayAddMan = player.mayAddMan
		if(e.button == 2 && myTurn)
			endTurn(room)
		else if(myTurn) 
		{
			//var xCoo = canvasToBoard(e.clientX, player.canvas)
			//var yCoo = canvasToBoard(e.clientY, player.canvas)
			var coo = canvasToBoard(e, player.canvas)
			if(mayAddMan) 
			{
				if(Math.abs(coo.y - room.currY) < Math.abs(coo.x - room.currX)) 
				{
					if(room.currX <= coo.x && room.currX + 0.5 > coo.x) // lewa
						addOwner(room.currPiece[west], boardToCanvas(room.currX + 0.25, room.currY + 0.5, player.canvas), player)
					else if (room.currX + 1 <= coo.x && room.currX + 0.5 < coo.x) //prawa
						addOwner(room.currPiece[east], boardToCanvas(room.currX + 0.75, room.currY + 0.5, player.canvas), player)
				}
				else if(Math.abs(coo.y - room.currX) < Math.abs(coo.y - room.currY)) 
				{
					if(room.currY <= coo.y && room.currY + 0.5 > coo.y) // góra
						addOwner(room.currPiece[north], boardToCanvas(room.currX + 0.5, room.currY + 0.25, player.canvas), player)
					else if (room.currY + 1 <= coo.y && room.currY + 0.5 < coo.y) //dół
						addOwner(room.currPiece[south], boardToCanvas(room.currX + 0.5, room.currY + 0.75, player.canvas), player)  
				}
			}
			else 
			{
				room.currX = Math.floor(coo.x)
				room.currY = Math.floor(coo.y)
				addPiece(randPiece, room.currX, room.currY, currRotation, room, player)
			}
		}
	})
    /*
    socket.on('move', function(data)
    {
    	var roomNo = users[socket.id]
    	rooms[roomNo].board[data.x][data.y] = data.id
    	//console.log(emptyBoard)
    	for (var i = 0; i < rooms[roomNo].players.length; i++)
    		rooms[roomNo].players[i].emit('move', {'board': rooms[roomNo].board, 'id': data.id})
    	//io.emit('move', {'id': data.id, 'x': data.x, 'y': data.y})
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
	*/
})


server.listen(3000)
console.log('ok')






var canvasSize = 1000
var boardSize = 10
var gridSize = canvasSize/boardSize
var manSize = gridSize/4
var pieceImageSize = 93
//var board = []
//var players = []
var colors = ["red", "blue", "yellow", "green", "black", "white"]


var town = 2
var road = 1
var field = 0

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

//var currPiece, currX, currY, currPlayer 
var currRotation, randPiece
currRotation = 0


var startPiece = new createPiece(townAlone, roadStraight, fieldAlone, roadStraight, "../start.jpg")
randPiece = startPiece

function getMousePos(evt, canvas) 
{
	return {
	  'x': evt.clientX - canvas.x,
	  'y': evt.clientY - canvas.y
	}
}

function boardToCanvas(x, y, canvas) {
	return {
		'x': canvas.size*x/boardSize + canvas.x,
		'y': canvas.size*y/boardSize + canvas.y
	}
}

function canvasToBoard(evt, canvas) {
	var pos = getMousePos(evt, canvas)
	return {
		'x': boardSize*pos.x/canvas.size,
		'y': boardSize*pos.y/canvas.size
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

function drawnPiece(piece, x, y, rotation) {
	this[north] = { piece : piece.subPieces[rotation%4] }
	this[south] = { piece : piece.subPieces[(2 + rotation)%4] }
	this[east] = { piece : piece.subPieces[(1 + rotation)%4] }
	this[west] = { piece : piece.subPieces[(3 + rotation)%4] }
	//this.img = new Image(pieceImageSize, pieceImageSize)
	//this.img.src = piece.img
	this.img = piece.img
	this.rotation = rotation
}

function createPlayer(id) {
	this.id = id
	this.color = colors[players.length]
	this.pieces = 8
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
						console.log(`dopisuje klocek do ${a}`)
						room.segments[a].parts.push(y*boardSize + x)
						console.log(room.segments[a])
					}
				}		
			}
			for(var a of piece[i].piece.connections) {
				var j = (i+a)%4
				console.log(`jestem ${piece[i].piece.type} i mam polaczenie z ${piece[j].piece.type}`)
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

function addOwner(subPiece, pos, player) {
	var x = pos.x, y = pos.y
	if(subPiece.assign.owners) {
		// wyślij sygnał: napisz, że nie można
	}
	else {
		subPiece.assign.owners = [player]
		player.mayAddMan = false
		console.log(`rysuje ludka na ${x}, ${y}`)
		// wyślij sygnał: drawMan(player.color, x, y)
	}
}

function checkNeighbours(piece, x, y, room) {
	var left = room.board[y*boardSize + x-1]
	var right = room.board[y*boardSize + x+1]
	var down = room.board[(y+1)*boardSize + x]
	var up = room.board[(y-1)*boardSize + x]
	
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

function mergeSegments(s1, s2, room) {
	console.log(`merguje : ${s1}, ${s2}`)
	for(var a of room.segments[s2].parts) {
		for(var i=0; i<4; i++) {
			pieceAssign = room.board[a][i].assign
			if(pieceAssign == s2) {
				console.log("zmieniam")
				room.board[a][i].assign = s1
			}
		}
		if(room.segments[s1].parts.indexOf(a) == -1)
			room.segments[s1].parts.push(a) 
	}
	room.segments[s2] = null
	console.log("po zmergowaniu:")
	console.log(room.segments[s1].parts)
	console.log(room.segments[s2])
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

function givePoints(player, points)
{
	player.points += points
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

function checkPossibility(piece, x, y, room) {
	return !room.board[y*boardSize + x] && checkNeighbours(piece, x, y, room)
}

function endTurn(room) {
	room.turn++
	if (room.turn >= room.playersCnt)
		room.turn = 0
	for(var i = 0; i < 4; i++)
		checkClosed(room.currPiece[i])
	room.currPiece = new createPiece(townAlone, roadStraight, fieldAlone, roadStraight, "../start.jpg")
}	

function addPiece(piece, x, y, rotation, room, player) {
	room.currPiece = new drawnPiece(piece, x, y, rotation)
	//if(checkPossibility(room.currPiece, x, y, room)) 
	{
		room.board[y*boardSize + x] = room.currPiece
		//drawPiece(currPiece, boardToCanvas(x), boardToCanvas(y))
		console.log('T')
		for (i in room.players)
			room.players[i].socket.emit('drawPiece', {'piece': room.currPiece, 'pos': boardToCanvas(x, y, player.canvas)})
		checkAssign(room.currPiece, x, y, room)
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
		if(player.pieces)
			player.mayAddMan = true
		else
			endTurn(room)
	}
	/*
	else {
		// wyślij sygnał: powiedz, że nie można
		return false
	}
	*/
	return true
}

