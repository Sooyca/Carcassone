function drawPiece(piece, x, y) {
	ctx = gameArea.context
	if(piece.rotation == 0)
		ctx.drawImage(piece.img, x, y, gridSize, gridSize)
	else {
	// obrócić canvas!
	}
}

function drawMan(color, x, y) {
	var img = new Image
	img.src = color
	ctx = gameArea.context
	ctx.drawImage(img, x-manSize/2, y-manSize/2, manSize, manSize)
}

// w hmtl:

function startGame() {
	gameArea.start()
  	window.addEventListener('click', function (e) {
		// wyślij sygnał: getClick(e)
	})
}
   	
var gameArea = {
	canvas : document.getElementById("myCanvas"), 		// w html będzie myCanvas
	start : function() {
		this.canvas.width = canvasSize;
		this.canvas.height = canvasSize;
		this.context = this.canvas.getContext("2d");
		currPlayer = players[0]
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
	
