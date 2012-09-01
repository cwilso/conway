var theUniverse = null;
var frame1 = null,
	frame2 = null,
	currentFrame = null,
	backFrame = null;

var numRows = 8,
	numCols = 8;

window.addEventListener('keydown', function() { tick();
} );

window.addEventListener('load', function() {
	theUniverse = document.getElementById("universe");
	frame1 = new Array(numRows);
	frame2 = new Array(numRows);

	for (var i=0; i<numRows; i++) {
		frame1[i] = new Array(numCols);
		frame2[i] = new Array(numCols);
		for (var j=0; j<numCols; j++) {
			frame1[i][j] = (Math.random() < 0.5);
			frame2[i][j] = false;
		}	
	}

	for (var i=0; i<numRows; i++) {
		var rowElem = document.createElement("div");
		rowElem.className = "row";
		rowElem.row = i;
		for (var j=0; j<numCols; j++) {
			var cellElem = document.createElement("div");
			cellElem.row = i;
			cellElem.col = j;
			cellElem.onclick = flipHandler;
			cellElem.className = "cell";
			if (frame1[i][j])
				cellElem.classList.add("live");
			rowElem.appendChild(cellElem);
		}
		theUniverse.appendChild(rowElem);
	}
	currentFrame = frame1;
	backFrame = frame2;
	drawFullBoardToMIDI();
} );

function flipHandler(e) {
	flip( e.target );
}

function flip(elem) {
	currentFrame[elem.row][elem.col] = !currentFrame[elem.row][elem.col];
	if (elem.className == "cell")  // dead
		elem.className = "cell live";
	else
		elem.className = "cell";
	drawFullBoardToMIDI();
}

function findElemByXY( x, y ) {
	var e, i, j, c;

	for (i in theUniverse.children) {
		e = theUniverse.children[i];
		if (e.row == y) {
			for (j in e.children) {
				if (e.children[j].col == x)
					return e.children[j];
			}
		}
	}
	return null;
}

function flipXY( x, y ) {
	var elem = findElemByXY( x, y );
	if (elem)
		flip( elem );
}

function countLiveNeighbors(frame,x,y) {
	var c=0;

	for (var i=x-1; i<x+2; i++) {
		for (var j=y-1; j<y+2; j++) {
			if ((i!=x)||(j!=y)) {	// skip the cell itself
				if (frame[((i+numRows)%numRows)][((j+numCols)%numCols)])
					c++;
			}
		}
	}
	return c;
}

function drawFullBoardToMIDI() {
	for (var i=0; i<numRows; i++) {
		for (var j=0; j<numCols; j++) {
			var key = i*16 + j;
			Jazz.MidiOut( 0x90, key, currentFrame[i][j] ? (findElemByXY(j,i).classList.contains("mature")?0x13:0x30) : 0x00);
		}	
	}
}

function tick() {
	var tempFrame = currentFrame;
	var c;

	// swap the frame buffers
	currentFrame = backFrame;
	backFrame = tempFrame;

	// run the algorithm
	for (var i=0; i<numRows; i++) {
		for (var j=0; j<numCols; j++) {
			c = countLiveNeighbors(backFrame,i,j);
			if (backFrame[i][j]) // the cell was alive last frame
				currentFrame[i][j] = ((c==2)||(c==3));
			  else // the cell was dead last frame
			  	currentFrame[i][j] = (c==3);
		}
	}

	//update the cells
	for (var i=0; i<numRows; i++) {
		var rowElem = theUniverse.children[i];
		for (var j=0; j<numCols; j++) {
			var cellElem = rowElem.children[j];
			if (currentFrame[i][j]) {
				cellElem.className = "cell live";
				if (backFrame[i][j])
					cellElem.classList.add("mature");
			} else
			  	cellElem.className = "cell";
		}
	}
	drawFullBoardToMIDI();
}
/*

function updatePlatters( time ) {
	if (!tracks)
		tracks = document.getElementById( "trackContainer" );

	var track;
	var keepAnimating = false;

	for (var i=0; i<tracks.children.length; i++)
		keepAnimating |= tracks.children[i].track.updatePlatter();

	if (keepAnimating)
		rafID = window.webkitRequestAnimationFrame( updatePlatters );
}
*/