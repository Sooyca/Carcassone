var pieces = []

for(var i=0; i<4; i++) {
	pieces.push(new createPiece(fieldAlone, fieldAlone, fieldAlone, fieldAlone, "cloister.jpg")
	pieces[pieces.length-1].cloister = true
}

for(var i=0; i<2; i++) {
	pieces.push(new createPiece(fieldAlone, fieldAlone, roadEnd, fieldAlone, "cloisterWithRoad.jpg")
	pieces[pieces.length-1].cloister = true
}


pieces.push(new createPiece(townFullP, townFull, townFull, townFull, "townFullWithP.jpg")

for(var i=0; i<3; i++) 
	pieces.push(new createPiece(townSides, townRight, fieldAlone, townLeft, "tripleTown.jpg")

pieces.push(new createPiece(townSidesP, townRight, fieldAlone, townLeft, "tripleTownWithP.jpg")
pieces.push(new createPiece(townSides, townRight, roadEnd, townLeft, "tripleTownAndRoad.jpg")

for(var i=0; i<2; i++)
	pieces.push(new createPiece(townSidesP, townRight, roadEnd, townLeft, "tripleTownAndRoadWithP.jpg")

for(var i=0; i<3; i++)
	pieces.push(new createPiece(townRight, fieldAlone, fieldAlone, townLeft, "triaTown.jpg")

for(var i=0; i<2; i++)
	pieces.push(new createPiece(townRightP, fieldAlone, fieldAlone, townLeft, "triaTownWithP.jpg")

for(var i=0; i<3; i++)
	pieces.push(new createPiece(townRight, roadLeft, roadRight, townLeft, "triaTownAndRoad.jpg")

for(var i=0; i<2; i++)
	pieces.push(new createPiece(townRightP, roadLeft, roadRight, townLeft, "triaTownAndRoadWithP.jpg")

pieces.push(new createPiece(fieldAlone, townStraight, fieldAlone, townStraight, "straightTown.jpg")

for(var i=0; i<2; i++)
	pieces.push(new createPiece(fieldAlone, townStraightP, fieldAlone, townStraight, "straightTownWithP.jpg")

for(var i=0; i<2; i++)
	pieces.push(new createPiece(townAlone, fieldAlone, fieldAlone, townAlone, "adjacentTowns.jpg")

for(var i=0; i<3; i++)
	pieces.push(new createPiece(townAlone, fieldAlone, townAlone, fieldAlone, "oppositeTowns.jpg")
	
for(var i=0; i<5; i++)
	pieces.push(new createPiece(townAlone, fieldAlone, fieldAlone, fieldAlone, "aloneTown.jpg")
	
for(var i=0; i<3; i++)
	pieces.push(new createPiece(townAlone, fieldAlone, roadLeft, roadRight, "aloneTownWithLeftCurve.jpg")

for(var i=0; i<3; i++)
	pieces.push(new createPiece(townAlone, roadLeft, roadRight, fieldAlone, "aloneTownWithRightCurve.jpg")
	
for(var i=0; i<3; i++)
	pieces.push(new createPiece(townAlone, roadEnd, roadEnd, roadEnd, "aloneTownWithCrossing.jpg")
	
for(var i=0; i<3; i++)
	pieces.push(new createPiece(townAlone, roadStraight, fieldAlone, roadStraight, "start.jpg")

for(var i=0; i<8; i++)
	pieces.push(new createPiece(roadStraight, fieldAlone, roadStraight, fieldAlone, "straightRoad.jpg")

for(var i=0; i<9; i++)
	pieces.push(new createPiece(fieldAlone, fieldAlone, roadLeft, roadRight, "curve.jpg")

for(var i=0; i<4; i++)
	pieces.push(new createPiece(fieldAlone, roadEnd, roadEnd, roadEnd, "tripleCrossing.jpg")
	
pieces.push(new createPiece(roadEnd, roadEnd, roadEnd, roadEnd, "crossing.jpg")



/*
	dopisać proporce:
		- w segments
		- w podliczaniu pktów
		- w createSubPiece
		
	zliczać, ile ludków:
		- w segments
		- w podliczaniu pktów
		
	możliwe, że trzeba zamienić +/- 1 w townLeft/Right i podobnie z drogami - kierunek oznacza, w którą stronę ma połączenie

	dodać townStraight
	
	dodać klasztory:
		- nie bawić się w klikanie, wyświetlić prompt: "czy chcesz zająć klasztor?"
		- w podliczaniu - sprawdzać, czy go zamknęliśmy przez sąsiada

*/
