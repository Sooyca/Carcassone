var canvasSize = 1000
var boardSize = 10
var gridSize = canvasSize/boardSize
var manSize = gridSize/4

function drawMan(color, x, y) {
	var img = new Image
	img.src = color
	ctx = gameArea.context
	ctx.drawImage(img, x-manSize/2, y-manSize/2, manSize, manSize)
}

// w hmtl:

   	
function createGameArea()
{
	this.canvas = document.getElementById("myCanvas")		// w html będzie myCanvas
	this.context = this.canvas.getContext("2d")
	this.clear = function() 
	{
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	this.newGame = function() 
	{
		//currPlayer = players[0]
		this.clear()
	}
}

var gameArea, id
var socket = io()
document.addEventListener("DOMContentLoaded", function() 
{
	gameArea = new createGameArea()
	var rect = gameArea.canvas.getBoundingClientRect()
	socket.emit('join', {
		'roomNo': roomNo, 
		'canvas': {
			'x': rect.left,
			'y': rect.top,
			'size': gameArea.canvas.width,
			}
		})
})

function newGame()
{
	socket.emit('newgame')
}

function getMousePos(evt) 
{
	var rect = canvas.getBoundingClientRect()
	return {
	  x: evt.clientX - rect.left,
	  y: evt.clientY - rect.top
	}
}


socket.on('id', function(data)
{
	id = data
	if (id == 0)
		document.getElementById("button").style = 'display:initial;'
})

socket.on('newgame', function()
{
	gameArea.newGame()
	/*
  	window.addEventListener('click', function (e) {
		// wyślij sygnał: getClick(e)
	})
	*/
})

window.addEventListener('click', function(e)
{
	console.log(e)
	socket.emit('click', {'clientX': e.clientX, 'clientY': e.clientY})
})

socket.on('drawPiece', function(data) {
	var x = data.pos.x, y = data.pos.y
	ctx = gameArea.context
	var img = new Image()
	img.src = data.piece.img
	console.log(data.piece)
	var k = data.piece.rotation
	if(k == 0)
	{
		ctx.drawImage(img, x, y, gridSize, gridSize)
		//ctx.drawImage(img, x, y)
		console.log(data.piece.rotation)
	}
	else 
	{
		ctx.save()
		cts.translate(x,y)
		ctx.rotate(k*Math.PI/2)
		ctx.drawImage(img, gridSize/2, gridSize/2, gridSize, gridSize)
		ctx.restore()
	}
})

