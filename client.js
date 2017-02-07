var boardSize = 10
var gridSize, canvasSize, canvas, ctx, smallCanvas, manSize, currImg, rotation=0

var id
var socket = io()

var bnd = new Image()
bnd.onload = (function() {
	console.log(bnd.src)
	ctx.drawImage(bnd, 0, 0, canvasSize, canvasSize)
})
bnd.src = "../tlo3.png"

document.addEventListener("DOMContentLoaded", function()
{
	canvas = document.getElementById("mainCanvas")
	smallCanvas = document.getElementById("smallCanvas")
	/*var empty = new Image()
	empty.onload = (function() {
		console.log(empty.src)
		//smallCanvas.getContext("2d").drawImage(empty, 0, 0, smallCanvas.width, smallCanvas.height)
	})
	empty.src = "../klocek.png"
	*/
	var rect = canvas.getBoundingClientRect()
	canvasSize = canvas.width
	ctx = canvas.getContext("2d")
	//ctx.drawImage(bnd, 0, 0, canvasSize, canvasSize)
	
	gridSize = canvasSize/boardSize
	manSize = 0.4*gridSize
	socket.emit('join', {
		'roomNo': roomNo,
		'username': username,
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
	//ctx.drawImage(bnd, 0, 0, canvasSize, canvasSize)
	/*
  	window.addEventListener('click', function (e) {
		// wyślij sygnał: getClick(e)
	})
	*/
})
var wid = 1077, smallWid = 1000, tr = 70, smTr = wid - tr - smallWid

socket.on('drawPiece', function(data) {
	var x = data.pos.x, y = data.pos.y
	var img = new Image()
	var empty = new Image()
	empty.onload = (function() {
		ctx.drawImage(empty, x, y, gridSize, gridSize)
		img.onload = (function() {
			console.log(img)
			var k = data.piece.rotation
			if(k%4 == 0)
			{
				ctx.drawImage(img, x + tr/wid * gridSize, y + smTr/wid * gridSize, smallWid/wid * gridSize, smallWid/wid * gridSize)
				//ctx.drawImage(img, x, y)
				console.log(data.piece.rotation)
			}
			else
			{
				ctx.save()
				ctx.translate(x+(tr+smallWid/2)*gridSize/wid, y+(smTr+smallWid/2)*gridSize/wid)
				
			//	1000/1077*gridSize/2 + 70/1077*gridSize, y+1000/1077*gridSize/2 + 10/1077)
				ctx.rotate(k*Math.PI/2)
				ctx.drawImage(img, -smallWid/wid*gridSize/2, -smallWid/wid*gridSize/2, smallWid/wid * gridSize,smallWid/wid * gridSize)
				/*if(k%4 == 2)
					ctx.drawImage(img, gridSize/(-2) + smTr/wid * gridSize, gridSize/(-2) + tr/wid * gridSize, smallWid/wid * gridSize, smallWid/wid * gridSize)
				
				else if (k%4 == 3)
					ctx.drawImage(img, gridSize/(-2) + smTr/wid * gridSize, gridSize/(-2) + smTr/wid * gridSize, smallWid/wid * gridSize, smallWid/wid * gridSize)
				else if (k%4 == 1)
					ctx.drawImage(img, gridSize/(-2) + tr/wid * gridSize, gridSize/(-2) + tr/wid * gridSize, smallWid/wid * gridSize, smallWid/wid * gridSize) */
				ctx.restore()
			}
		})
		img.src = data.piece.img

	})
	empty.src = "../klocek.png"
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
	var inner = "<table style = \"width : 100%\">"
	for(var i = 0; i < data.points.length; i++)
	{
		inner += "<td width = \"10%\">"
		if(i == data.turn)
			inner += '<img width = \"100%\" src = \"../turn.png\">'
		inner += "</td>"
		inner += "<td width = \"50%\">" + data.names[i] + "</td>"
		inner += "<tr> <td width = \"10%\"> <img width=\"100%\" src=\"" + data.colors[i] + "\"></img></td>"
		inner += "<td width = \"10%\">" + data.menCnt[i] + "</td>"
		inner += "<tr> <td width = \"10%\"> <img width=\"100%\" src=\"../star.png\"></img></td>"
		inner += "<td width = \"10%\">" + data.points[i] + "</td></tr>"
	}
	document.getElementById("stats").innerHTML = inner + "</table>"
})
