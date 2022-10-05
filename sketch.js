// Opsætning af variabler
// Opsætning af hovede koordinatsystem
var grid = []; 	// Array der bliver brugt til at gemme celle objekterne
var origoX = 0 	// Hvor koordinatsystemet skal tegnes
var origoY = 0
var cols = 10; 	// Hvor mange celle objekter
var rows = 18;
var w = 150; 	//Bredde i pixels
var h = w*(rows/cols);
var sidebarW = 5*(w/cols); // størrelse af sidebar
var fps = 30; // Ønskede frames per second
var counter = 0; // Tæller, bruges senere
var bg; //Baggrundsfarve

var dropSpeed = 2; // Hastighed tetrominoerne falder med i blokke per sekundt

var leftRight = 0;
var leftRightSpeed = 16; //Sidelæns hastighed i blokke ber sekundt
var leftRightCounter = 0;

var speedBoost = false;
var speedMultiplier = 8; // Mutiplier af hastighed når man trykker ned

var pause = false;		// Holder styr på om spillet er pauset
var gameOver = false;	// Holder styr på om spillet er slut

var score = 0; // Holder styr på score

// Opsætning af det lille koordinatsystem der viser næste tetromino
var nextMinoGrid = [];
var nextMinoCols = 4;
var nextMinoRows = 4;
var nextMinoW = 4*(w/cols);
var nextMinoH = nextMinoW*(nextMinoRows/nextMinoCols);
var nextMinoOrigoX = 11*(w/cols);
var nextMinoOrigoY = 0;

// Variabler til at gemme nuværende og næste tetromino indtil den rammer bunden og bliver solid
var curMino;
var nextMino;

// Key codes for controls
var controlLeft = 65;
var controlRight = 68;
var controlUp = 87;
var controlDown = 83;


//Tetrominoerne
var tetrominoes = [
[[0, 0], [-1, 0], [1, 0], [2, 0], [100, 255, 255]], 	// "I" block
[[0, 0], [-1, 0], [1, 0], [-1, -1], [100, 100, 255]],	// "J" block
[[0, 0], [-1, 0], [1, 0], [1, -1], [255, 155, 100]],	// "L" block
[[0, 0], [1, 0], [0, -1], [1, -1], [255, 255, 100]],	// "O" block
[[0, 0], [-1, 0], [0, -1], [1, -1], [100, 255, 100]],	// "S" block
[[0, 0], [-1, 0], [1, 0], [0, -1], [155, 100, 255]],	// "T" block
[[0, 0], [-1, -1], [0, -1], [1, 0], [255, 100, 100]],	// "Z" block
]

// Denne funktion kører en gang før selve programmet starter
function setup() {
  bg = color(50, 50, 50); //Baggrundsfarven sættes, den kan først sættes her, da det først er he at selve biblioteket starter.
  frameRate(fps); // Sæt framerate

  createCanvas(w+sidebarW, h); // Opret canvas (rammen)
  background(bg); // Sæt "rammens" baggrundsfarve

  // Opretter objekterne i arrayen der holder styr på koordinatsystemet
  for(var i = 0; i < cols; i++) {
  	grid[i] = [];
  	for (var j = 0; j < rows; j++) {
		grid[i][j] = new Cell(w/cols*i, h/rows*j, w/cols, h/rows, bg, bg, false);
	}
  }

  // Opretter objekterne i arrayen der holder styr på det lille koordinatsystem
  for(var i = 0; i < nextMinoCols; i++) {
  	nextMinoGrid[i] = [];
  	for (var j = 0; j < nextMinoRows; j++) {
		nextMinoGrid[i][j] = new Cell(nextMinoW/nextMinoCols*i, nextMinoH/nextMinoRows*j, nextMinoW/nextMinoCols, nextMinoH/nextMinoRows, bg, bg, false);
	}
  }
  // Opret en kommende tetromino og send den første rigtige afsted
  nextMino = new Tetromino(-1, 1, 1, 0, false);
  nextMino.draw();
  newMino();
}

// Kører i hver eneste frame
function draw() {
	if ((!pause) && (!gameOver)) {
	  // Tæller der holder styr på hvornår tetrominoen næste gang skal falde
	  if (counter == 0) {
	  	// Kalder funktion til at flytte tetrominoen
	  	curMino.transform(0, 1, 0);
	  	// Her beregnes hvor lang tid timeren nu skal sættes til
	  	if (speedBoost) {
	  		counter = round(fps/(dropSpeed*speedMultiplier));
	  	} else {
	  		counter = round(fps/dropSpeed);
	  	}
	  } else {
	  	counter--;
	  }

	  // Tæller der holder styr på hvornår flytning af tetromino til højre og venstre skal gentage
	  if ((leftRightCounter == 0) && (leftRight != 0)) {
	  	curMino.transform(leftRight, 0, 0);
	  	leftRightCounter = round(fps/leftRightSpeed);
	  } else {
	  	leftRightCounter--;
	  }
	} else if (gameOver) {
		// Hvis spillet er slut skrivers der noget tekst på skærmen og du får din endelige score at vide
		push(); // Denne funktion gemmer de nuværende indstilinger som teksfarve og tekstfyld og resætter variblerne
  		fill(255).stroke(0).strokeWeight(5).textSize(w/cols-3);
  		textAlign(CENTER);
  		textFont("Arial Black");
  		if (score < 10) {
  			var scoreString = "0" + score;
  		} else {
  			var scoreString = score;
  		}
  		text("Game Over!" + "\n" + "You got " + scoreString + " points!", w/2, h/4);
  		pop(); // Denne funktion gendanner instinlingerne der var før push(); blev kaldt
	} else {
		// Her sørges det for a skrive på "pause" på skærmen når dette er relevant.
		push();
  		fill(255).stroke(0).strokeWeight(10).textSize(w/cols+10);
  		textAlign(CENTER);
  		textFont("Arial Black");
  		text("Paused!", w/2, h/4);
  		pop();
	}

  // Hvis ikke spillet er slut eller pauset så tegn koordinatsystemet på ny
  	if ((!gameOver) && (!pause)) {
  		push();
  		translate(origoX, origoY);
  		for(var i = 0; i < cols; i++) {
  			for (var j = 0; j < rows; j++) {
				grid[i][j].display();
			}
	 	}
  		pop();
	}

  // og det lillekoordinat sytem også
  push();
  translate(nextMinoOrigoX, nextMinoOrigoY);
  for(var i = 0; i < nextMinoCols; i++) {
  	for (var j = 0; j < nextMinoRows; j++) {
		nextMinoGrid[i][j].display();
	}
  }
  pop();
  // Her printes en kasse over sidebarren med samme farve som baggrunden, dette er for at cleare den gamle score så den nye kan blive skrevet.
  push();
  fill(bg);
  strokeWeight(0);
  rect(width-sidebarW + 5, nextMinoH + 5, sidebarW - 10, height-nextMinoH - 10);
  pop();

  // Scoren printes
  push();
  fill(255).stroke(0).strokeWeight(0).textSize(w/cols);
  textAlign(CENTER);
  textFont("Arial Black");
  if (score < 10) {
  	var scoreString = "0" + score;
  } else {
  	var scoreString = score;
  }
  text("Score:" + "\n" + scoreString, width-((width-w)/2), h/rows*13);
  pop();

  // Controls printes
  push();
  fill(255).stroke(0).strokeWeight(0).textSize(w/cols-5);
  textAlign(CENTER);
  textFont("Arial Black");
  text("W\nA S D\nP\tPause", width-((width-w)/2), h/3);
  pop();
}

// Denne funktion bliver kaldt hver gang en tast trykkes ned
function keyPressed() {
  if (keyCode === controlLeft) {
  	// Retning på bevægeles sættes
 	leftRight = -1;
 	// tælleren startes på ny så man er sikker på at den ikke er sat til noget i forvejen
 	leftRightCounter = 0;
  } else if (keyCode === controlRight) {
  	// Sammen som til venstre
  	leftRight = 1;
  	leftRightCounter = 0;
  } else if (keyCode === controlUp) {
  	// Roter tetromino
  	curMino.transform(0, 0, 1)
  } else if (keyCode === controlDown) {
  	// Slå speedbost til når man trykker ned
  	speedBoost = true;
  	counter = 0;
  } else if (keyCode === ENTER) {
  	// Tag et billede af rammen og åben download dialog (Bruges til at tage billeder til rapporten)
  	saveCanvas('ScreenShot', 'jpg');
  	// Sæt spillet på pause efter billedet er taget så programmet ikke køre videre imens download pop-up'en er åben
  	pause = true;
  } else if (keyCode === 80 /*  Keycode fra bogstavet P*/) {
  	if (pause) {
  		pause = false;
  	} else {
  		pause = true;
  	}
  }
}

// Bliver kaldt nåt tasten bliver sluppet igen
function keyReleased() {
	if (keyCode === controlLeft) {
 		// Retning settes til 0
 		leftRight = 0;
 		leftRightCounter = 0;
  	} else if (keyCode === controlRight) {
  		leftRight = 0;
  		leftRightCounter = 0;
	} else if (keyCode === controlDown) {
  		speedBoost = false;
	}
}

// Dette er clasen for felterne på banen.
function Cell(tempX, tempY, tempW, tempH, tempColor, tempDefaultColor, tempSolid) {
	this.x = tempX; // Øverste venste hjørne for feltet
	this.y = tempY; // ^
	this.w = tempW; // Breden af feltet
	this.h = tempH; // Højden af feltet 
	this.c = tempColor; // Farve på feætet
	this.bg = tempDefaultColor; // Baggrunden på feltet
	this.solid = tempSolid; // Holder styr på om feltet er solidt (Stillestående)
	this.active = false; // Holder styr om feltet er aktivt (i bevægelse)
	// Funktion til at tegne feltet, bliver kaldt fra draw - loopet
	this.display = function() {
		stroke(60, 60, 60); // Sæt kantfarve
  		strokeWeight(2); // Sæt kanttykkelse
		fill(this.c); // Sæt fyld
		rect(this.x,this.y,this.w,this.h, 4, 4, 4, 4); // Tegn en firkant ud fra oplysningerne i objektet, de sidste fire tal definere at firkanten skal have runde hjørne med en radius på 4 pixels
	}
	// Denne funktion kan resette feltet
	this.reset = function() {
		this.c = this.bg
		this.active = false;
		this.solid = false;
	}
}
 // Classe for tetrominoer
function Tetromino(tempType, tempX, tempY, tempRotation, tempMain) {
	// Hvis variablen for type defineres som -1 når et nyt objekt defineres, generes der et tifældig tal for at bestemme type.
	if (tempType == -1) {
	  this.type = int(random(7));
	} else {
      this.type = tempType;
	}
	this.tetromino = tetrominoes[this.type]; // Den valge type tetromino bliver oveført fra definitionen i toppen til en variabel i objektet
	this.c = this.tetromino[4]; // Farven hentes fra tetrominoen
	this.x = tempX;	// Holde styr på position, dette er i felter, ikke i pixels ligesom resten
	this.y = tempY; // ^
	this.rotation = tempRotation; // Holder styr på rotation
	this.main = tempMain; // Bestemmer om tetrominoen skal tegnes i hoved koordinatsystemet eller i det lille preview vindue

	// Denne tegner rent faktisk ikke, den definerer bare nogle variabler inde i arrayen med felter. Dette bliver derefter tegnet af cell objektet i den overordnede draw funktion
	this.draw = function() {
		if (this.main) {
			// Hvis den skal tegnes i main
			// Dette virker ved at lægge koordinaterne fra blokkene i tetrominoen der er defineret i starten til koordinaterne der er defineret i det eget objekt
			for (var i = 0; i < 4; i++) {
				if ((this.y + this.tetromino[i][1]) >= 0) {
					grid[this.x + this.tetromino[i][0]][this.y + this.tetromino[i][1]].c = this.c; // Sætter feltets farve
					grid[this.x + this.tetromino[i][0]][this.y + this.tetromino[i][1]].active = true; //Sætter feltet til aktiv da tetrominoen starter med at falde
				}
			}
		} else {
			// Hvis den skal tegnes i preview boksen
			for (var i = 0; i < 4; i++) {
				if ((this.y + this.tetromino[i][1]) >= 0) {
					nextMinoGrid[this.x + this.tetromino[i][0]][this.y + this.tetromino[i][1]].c = this.c;
					nextMinoGrid[this.x + this.tetromino[i][0]][this.y + this.tetromino[i][1]].active = true;
				}
			}
		}
	}
	// Dette er en af de vigtigste funktioner i hele programmet, den står for at flytte og rotere tetrominoerne.
	// Før den flytter tetrominoe der hvor den bliver kommenderet hen tjekker den om der er plads til den for andre tetrominoer.
	// Den tjekker også om den ikke kan komme længere så den skal blive solid.
	this.transform = function(deltaX, deltaY, deltaRotation){
		var tempX = this.x + deltaX;
		var tempY = this.y + deltaY;
		var tempTetromino = this.tetromino;
		// Tetrominoerne kan på grund af deres opbygning betragtes som vektorer, loop nedenudener bruger en regneregel for at dreje en vektor 90 grader.
		for (var i = 0; i < deltaRotation; i++) {
			var newTempTetromino = [[], [], [], []];
			for (var j = 0; j < 4; j++) {
				newTempTetromino[j][0] = tempTetromino[j][1];
				newTempTetromino[j][1] = (tempTetromino[j][0] * -1);
			}
			// Resultates gemmes midlertidigt så der kan tjekkes om dette er et muligt træk
			tempTetromino = newTempTetromino;
		}
		// Der tjekkes her kolisioner med sider, bund og tidligere briker og der bestemmes om tetrominoen kan bevæge sig til ønsket sted og om den er nået sin endelige plads
		var canMove = true;
		var next = false;
		for (var i = 0; i < 4; i++) {
			if (((tempX + tempTetromino[i][0]) >= cols) || ((tempX + tempTetromino[i][0]) < 0)) {
				// Tjekker om nogle af blockene i tetrominoen ender uden for siden, hvis de gør kan den ikke flytte dertil
				canMove = false;
			} else if ((tempY + tempTetromino[i][1]) >= rows) {
				// Hvis tetrominoen en kommet helt ned til bunden kan den ikke flytte sig længere så der skal spawnes en ny tetromino
				canMove = false;
				next = true;
				
			} else if ((tempX + tempTetromino[i][0] >= 0) && (tempY + tempTetromino[i][1] >= 0)) {
				if (grid[tempX + tempTetromino[i][0]][tempY + tempTetromino[i][1]].solid == true) {
					// Tjekker om tetrominoen kommer til at kolidere med nogle solide blocke fra tidligere tetrominoer
					canMove = false;
					if ((deltaX == 0) && (deltaY != 0)) {
						//Hvis den er på ned når den rammer en anden block er den nået sin endestation og en ny skal spawnes
						next = true;
					}
				}
			}
		}

		// Hvis det er blevet bestemt at det er muligt at flytte tetrominoen, så bliver det gjort.
		if (canMove){
			for (var i = 0; i < 4; i++) {
				// Her resettes alle felterne i tetrominoens gamle position
				if (((this.x + this.tetromino[i][0]) >= 0) && ((this.y + this.tetromino[i][1]) >= 0)) {
					grid[this.x + this.tetromino[i][0]][this.y + this.tetromino[i][1]].reset();
				}
			}
			// og her flyttes de midlertideige variabler ind i det faste variabler
			this.x = tempX
			this.y = tempY
			this.tetromino = tempTetromino;
			// Tetrominoen kan nu tegnes med de nye variabler
			this.draw();	
		}

		// Hvis en blocken er landet og en ny skal spawnes
		if (next) {
			for (var i = 0; i < 4; i++) {
				if ((this.y + this.tetromino[i][1]) >= 0) {
					// Den originale tetrominos blokke sættes til at være solide og sættes til ikke mere at være aktive.
					grid[this.x + this.tetromino[i][0]][this.y + this.tetromino[i][1]].solid = true;
					grid[this.x + this.tetromino[i][0]][this.y + this.tetromino[i][1]].active = false;
				} else {
					// Hvis noget eller hele tetrominoen er over toppen af koordinatsystemet nå den bliver solid har man tabt
					gameOver = true;
				}
			}
			// Her kaldes funktionen det tjekker om nye fulde linjer er blevet skabt
			checkLines();
			// Her kaldet en funktion til at spawne en ny tetromino
			newMino();
		}	
	}
}
// Funktion til at spawne tetrominoen, der før var i perview koordinatsystemet, i hovede koordinatsystemet og spawne en ny tetromino i preview koordinatsystemet
function newMino() {
	// Først cleares preview koordinatsystemet
	for (var x = 0; x < nextMinoCols; x++) {
		for (var y = 0; y < nextMinoRows; y++) {
			nextMinoGrid[x][y].reset();
		} 
	}
	// Herefter spawnes en ny tetromino i hovede koordinatsystemet ud fra typen på tetrominoen i preview koordinatsystemet
	curMino = new Tetromino(nextMino.type, 4, -1, 0, true);
	// Den tegnes
	curMino.draw();
	// Der laves nu en ny preview tetromino med tilfældig type
	nextMino = new Tetromino(-1, 1, 2, 0, false);
	// Som tegnes
	nextMino.draw();
}
// funktion til at tjekke fulde linjer
function checkLines() {
	var lines = 0; // holder styr på hvor mange linjer der fundet for at kunne give point
	for (var i = 0; i < rows; i++) { // Loop der kører igennem alle rækker oppefra og ned
		var full = true; // Rækken sættes til fuld indtil andet er bevist
		for (var j = 0; j < cols; j++) {
			// Kører igennem linjen og tjekker om den er solid
			if (!grid[j][i].solid) {
				// Hvis en af felterne ikke er solid er rækken ikke fuld
				full = false;
			}
		}
		if (full) {
			// Hvis rækken er fuld skal den fjernes og det skal registreres at der er fundet en linje
			lineDown(i); // Funktion til at flytte linjer ned og fjerne den fulde linje
			lines++;
		}
	}
	// Beregner score når alle linjer er tjekket
	switch (lines) {
		case (2): {
			score = score + 1;
			break;
		}
		case (3): {
			score = score + 2;	
			break;
		}
		case (4): {
			score = score + 4;
			break;
		}
	}
}
// Funktion til at fjerne en linje og flytte den ned
function lineDown(startLine) {
	for (var y = startLine - 1; y >= 0; y--) { //loop der køre fra linjen der er givet og op. Starte på linjen lige over den der skal fjernes
		for (var x = 0; x < cols; x++) { // Kører igennem x koordinater for linje
			if (!grid[x][y].active) {
				// Hvis blocken ikke er aktiv, resettes blocken nedenunder og variablerne fra nuværende felt flyttes en ned
				newY = y+1;
				grid[x][newY].reset();
				grid[x][newY].solid = grid[x][y].solid;
				grid[x][newY].c = grid[x][y].c;
			}
		}
	}
}
