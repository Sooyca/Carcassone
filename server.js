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

function createPlayer(id) {
	this.id = id
	this.color = colors[players.length]
	this.pieces = 8
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

