var boardSize = 10
var gridSize, canvasSize, canvas, ctx, smallCanvas, manSize, currImg, rotation=0

var id
var socket = io()
document.addEventListener("DOMContentLoaded", function() 
{
	canvas = document.getElementById("mainCanvas")
	smallCanvas = document.getElementById("smallCanvas")
	var rect = canvas.getBoundingClientRect()
	canvasSize = canvas.width
	ctx = canvas.getContext("2d")
	gridSize = canvasSize/boardSize
	manSize = gridSize/3
	socket.emit('join', {
		'roomNo': roomNo, 
		'canvas': {
			'x': rect.left,
			'y': rect.top,
			'size': canvasSize,
			}
		})
	canvas.addEventListener('click', function(e)
	{
		console.log(e)
		socket.emit('click', {'clientX': e.layerX, 'clientY': e.layerY, 'button': e.button})
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
		document.getElementById("newGameButton").style = 'display:initial;'
})

socket.on('newgame', function()
{
	ctx.clearRect(0, 0, canvasSize, canvasSize)
	/*
  	window.addEventListener('click', function (e) {
		// wyślij sygnał: getClick(e)
	})
	*/
})


socket.on('drawPiece', function(data) {
	var x = data.pos.x, y = data.pos.y
	var img = new Image()
	img.onload = (function() {
	console.log(img)
	var k = data.piece.rotation
	if(k%4 == 0)
	{
		ctx.drawImage(img, x, y, gridSize, gridSize)
		//ctx.drawImage(img, x, y)
		console.log(data.piece.rotation)
	}
	else 
	{
		ctx.save()
		ctx.translate(x+gridSize/2, y+gridSize/2)
		ctx.rotate(k*Math.PI/2)
		ctx.drawImage(img, gridSize/(-2), gridSize/(-2), gridSize, gridSize)
		ctx.restore()
	}
	})
	img.src = data.piece.img
})

socket.on('drawMan', function(data) {
	var img = new Image()
	img.onload = (function() {
	console.log(img.src)
	ctx.drawImage(img, data.x-manSize/2, data.y-manSize/2, manSize, manSize)
	})
	img.src = data.color
})

socket.on('newPiece', function(piece) {
	console.log("halo")
	var c = smallCanvas.getContext("2d")
	var img = new Image()
	img.onload = (function() {
	console.log(img)
	console.log(smallCanvas)
	c.drawImage(img, 0, 0, smallCanvas.width, smallCanvas.height)
	})
	img.src = piece.img
	console.log(img.src)
	currImg = piece.img
	rotation = 0
})

function endTurn()
{
	console.log("nowa tura")
	socket.emit('endturn')
}

function rotate(r)
{
	socket.emit('rotate', r)
}
socket.on('rotate', function(r)
{
	rotation += r
	var c = smallCanvas.getContext("2d")
	s = smallCanvas.width
	var img = new Image()
	img.src = currImg
	c.save()
	c.translate(s/2,s/2)
	c.rotate(rotation*Math.PI/2)
	c.drawImage(img, s/(-2), s/(-2), s, s)
	c.restore()
	
})

socket.on('endGame', function()
{
	window.alert("Koniec!")
})

socket.on('stats', function(data)
{
	console.log("tu")
	var inner = "<table>"
	for(var i = 0; i < data.points.length; i++)
	{
		inner += "<tr> <td> <img width=90 height=90 src=\"" + data.colors[i] + "\"></img></td>"
		inner += "<td>" + data.points[i] + "</td>"
		inner += "<td>" + data.menCnt[i] + "</td></tr>"
	}
	document.getElementById("stats").innerHTML = inner + "</table>"
})

