var game;
game = (function () {
	var varClock;
	var varTimeRemaining = 0;
	var gameInit = false;
	///////////////////////////////////////////////////
	//END DECLARATIONS
	///////////////////////////////////////////////////

	var initialize = function (_playingTime) {
		gameInit = false;
		$("#panel-wrapper").hide();


		//VACIA LAS COLUMNAS
		$("[class^='col']").empty();


		_loadAllCandies();

		_resetScore(_playingTime);

		/*SET TIMER*/
		if (typeof (varClock) == 'number') {
			clearInterval(varClock);
		}

		varTimeRemaining = _playingTime;
		varClock = setInterval(_timer, 1000);

		//INICIO DE LA ANIMACION DEL TITULO
		_setTitleAnimate();

		$("#panel-wrapper").show();
		gameInit = true;
	}; //END INITIALIZE




	var gameOver = function () {
		//CIERRA EL PANEL DE JUEGO Y MUESTRA LA PUNTUACION
		$(".panel-tablero").fadeOut(500, function () {
			$(".panel-score").css("width", "100%");
			$("#gameOverTitle").fadeIn(1000);
		});


		//REINICIA EL RELOJ
		clearInterval(varClock);

		//DETIENE LA ANIMACION
		$(".main-titulo").stop();
		$(".main-titulo").css("color", "#DCFF0E");
	};




	/////////////////////////////////////////////
	//PRIVATE METHODS
	/////////////////////////////////////////////
	function _timer() {
		varTimeRemaining -= 1;
		$('#timer').html(formatTime(varTimeRemaining));

		if (varTimeRemaining == 0) {
			gameOver();
		}
	}



	function formatTime(_time) {
		var varMinutes = (Math.floor(_time / 60)).toFixed(0);
		var varSeconds = (((_time / 60) - Math.floor(_time / 60)) * 60).toFixed(0);
		return (varMinutes.length > 1 ? "" : "0") + varMinutes + ":" + (varSeconds.length > 1 ? "" : "0") + varSeconds;
	}





	function _resetScore(_time) {

		$('#timer').html(formatTime(_time));

		$("#score-text").data("value", 0);
		$('#score-text').html("0");


		$("#movimientos-text").data("value", 0);
		$("#movimientos-text").html("0");


		$('#gameOverTitle').hide();
		$('.panel-score').css("width", "25%");
	}








	function _loadAllCandies() {

		// ESTA FUNCION CARGA LOS DULCES FALTANTES EN CADA COLUMNA, HASTA 7 DULCES POR COLUMNA.


		$("[class^='col']").each(
			function (IndexColumn) {

				// OBTIENE LOS DULCES CARGADOS EN LA COLUMNA
				let candiesLoaded = ($(this).find(".candy").size());

				//CARGA LOS DULCES NECESARIOS PARA LA COLUMNA (IndexColumn)
				for (let var_row = (candiesLoaded + 1); var_row <= 7; var_row++) {
					let candy = _loadCandy((Math.floor(Math.random() * (5 - 1)) + 1), var_row, (IndexColumn + 1));
					$(this).prepend(candy);
					candy.addClass("newCandy");
				}

				// ASIGNA EL DATA.ROW A LOS OBJETOS DE LA COLUMNA (IndexColumn)
				$(this).find("div").each(
					function (i) {
						$(this).data("row", (i + 1));
					}

				);

			}
		);







		if (gameInit == false) {
			// CUANDO EL JUEGO SE ESTA CARGANDO POR PRIMERA VEZ
			// VERIFICA SI HAY POSIBLES JUGADAS, SI ES VERDADERO
			// ELIMINA LOS DULCES QUE HACEN  LAS AUTOJUGADAS
			// Y LLAMA NUEVAMENTE AL METODO _loadAllCandies()


			if (_AutoplayCandiesMatched()) {

				$(".candyAutoplay").remove();
				_loadAllCandies()
			}

		} else {
			// CUANDO EL JUEGO ESTA INICIADO, VERIFICA SI HAY NUEVOS CARAMELOS
			// SI HAY NUEVOS CARAMELOS, HACE UNA ANIMACION PARA QUE CAIGAN EN FORMA DE GRAVEDAD.
			// AL TERMINAR LA ANIMACION, PREGUNTA SI HAY UNA POSIBLE AUTO JUGADA.
			// SI HAY UNA AUTOJUGADA, ANIMA LOS DULCES. AL TERMINAR LA ANIMACION LOS ELIMINA
			// Y LLAMA NUEVAMENTE AL METODO   _loadAllCandies();


			//SI HAY CARAMELOS CON LA CLASE newCandy, HACE UNA ANIMACION PARA QUE TENGA EFECTO DE GRAVEDAD
			if ($(".newCandy").size() > 0) {

				$(".newCandy").animate({
					top: -500
				}, 0).animate({
					top: 0
				}, "slow");

				$(".newCandy").promise().done(

					function () {

						if (_AutoplayCandiesMatched()) {

							$(".candyAutoplay").fadeTo(300, 0).fadeTo(300, 1).fadeTo(300, 0).fadeTo(300, 1).hide(300);

							$(".candyAutoplay").promise().done(
								function () {
									$(".candyAutoplay").remove();
									_loadAllCandies();
								}
							);
						}
					}

				);

			}
		}


		//ELIMINA LA CLASE
		$(".newCandy").removeClass("newCandy");

	}





	function _loadCandy(typeOfCandy, row, column) {
		let candy = $("<div class='candy candy" + typeOfCandy + "'></div>");
		candy.data({
			"column": column,
			"row": row,
			"typeOfCandy": typeOfCandy
		});
		_setDragAndDrop(candy);
		return candy;
	}




	function _AutoplayCandiesMatched() {

		// VERIFICA PARA CADA CARAMELO SI
		// HAY UNA AUTO JUGADA VALIDA
		$(".candy").each(
			function () {
				_candiesMatched(this, "candyAutoplay");
			}
		);


		//OBTIENE LA CANTIDAD DE DULCES QUE HICIERON MATCH
		let candiesMatched = $(".candyAutoplay").size();

		if (candiesMatched > 0) {
			//SUMA LOS PUNTOS DE LA AUTO JUGADA
			_setScored(candiesMatched * 100);
			return true;
		} else {

			return false;
		}
	}




	//



	function _setDragAndDrop(candy) {
		candy.draggable({
			revert: "invalid",
			containment: "#panel-wrapper",
			scroll: false
		});
		candy.droppable();
		candy.droppable("disable");
		candy.on("mousedown", _setDroppableZone);
	}





	function _setDroppableZone() {

		//DESABILITA EL DROPABLE DE TODOS LOS ELEMENTOS
		$(".candy").droppable("option", "disabled", true);
		$(".candy").removeClass("CandySelect");

		//$(".candy").removeClass("candyTemp");

		//Asigna los dulces que puden recibir a el CandySelect
		$(this).addClass("CandySelect");

		var column = $(this).data("column");
		var row = $(this).data("row");

		_setDroppable($('.col-' + (column + 1)).find('div').eq(row - 1));
		_setDroppable($('.col-' + (column - 1)).find('div').eq(row - 1));
		_setDroppable($('.col-' + column).find('div').eq((row - 2 < 0 ? 10 : (row - 2)))); // Si la fila es la 1, al restarle -2 unidades, queda el indice en negativo. por lo tanto devuelve 10 que es un indice que no existe
		_setDroppable($('.col-' + column).find('div').eq(row));
	}





	function _setDroppable(element) {

		element.droppable({
			disabled: false,

			accept: ".CandySelect",

			drop: function (event, ui) {



				// Se crean 2 objetos CandyA y CandyB
				// CandyA: es una copia del objeto que ha sido arrastrado.
				// CandyB: es una copia del objeto donde se suelta el objeto arrastrado.


				// CandyA es insertado en la posicion donde ha sido arrastrado el objeto original
				// CandyB es


				// el dulce A, se inserta en la posicion del dulce que recibe al arrastrado
				// el dulce B, se inserta en la posicion del dulce que ha sigo arrastrado

				var candyA = _loadCandy(
					ui.draggable.data("typeOfCandy"),
					$(this).data("row"),
					$(this).data("column")
				);

				//OBTIENE LA DIRECION HACIA DONDE SE MOVIO EL DULCE ARRASTRADO
				var moveDirection = _getMoveDirection(ui.draggable);


				candyA.insertAfter(this);


				//CandyB: ES UN NUEVO OBJETO QUE SE CREA CON EL TIPO DE DULCE DEL DULCE QUE ESTA RECIBIENDO
				//Y LA POCION DEL DULCE QUE HA SIDO ARRASTRADO.
				var candyB = _loadCandy(
					$(this).data("typeOfCandy"),
					ui.draggable.data("row"),
					ui.draggable.data("column")
				);

				candyB.css({
					"top": ui.draggable.css("top"),
					"left": ui.draggable.css("left")
				});
				candyB.insertAfter(ui.draggable);
				candyB.animate({
					"top": 0,
					"left": 0
				}, "fast");


				//ELIMINA LOS DULCES TEMPORALMENTE
				$(this).detach();
				$(ui.draggable).detach();


				//2.- EVALUA SI HAY COINCIDENCIA EN EL MOVIMIENTO DEL DULCE A
				//    Y DEL DULCE B

				var matchedCandyA = _candiesMatched(candyA, "candyMatched");
				var matchedCandyB = _candiesMatched(candyB, "candyMatched");





				if (matchedCandyA.valid || matchedCandyB.valid) {
					//JUGADA VALIDA

					//INCREMANTA EL NUMERO DE MOVIMIENTOS
					setPlayedCount();

					//SUMA EL PUNTAJE
					_setScored(matchedCandyA.points + matchedCandyB.points);


					$(candyB).promise().done(function () {

						$(".candyMatched").fadeTo(300, 0).fadeTo(300, 1).fadeTo(300, 0).fadeTo(300, 1).hide(300);

						$(".candyMatched").promise().done(function () {
							$(".candyMatched").remove();
							_loadAllCandies();
						});

					});


				} else {
					//JUGADA NO VALIDA
					$(this).insertAfter(candyA);

					$(ui.draggable).css(_getPositionRollback(moveDirection));
					$(ui.draggable).insertAfter(candyB);

					candyA.remove();
					candyB.remove();
					$(ui.draggable).animate({
						"top": 0,
						"left": 0
					}, 500);
				}


			}
		});



	}



	function _candiesMatched(candy, cssSelector) {

		let column = $(candy).data("column");
		let row = $(candy).data("row");

		var matched = {
			"valid": false,
			"points": 0
		};


		/////////////////////////////////////////
		//HORIZONTAL MATCHED
		/////////////////////////////////////////

		let candyLeft = $(".col-" + (column - 1)).find("div").eq(row - 1);
		let candyLeftLeft = $(".col-" + (column - 2)).find("div").eq(row - 1);
		let candyRight = $(".col-" + (column + 1)).find("div").eq(row - 1);
		let candyRightRight = $(".col-" + (column + 2)).find("div").eq(row - 1);


		//compara el dulce con el de la Izquierda y el de la Derecha
		// candyL =<- candyPlayed ->= candyR
		if ($(candy).data("typeOfCandy") == $(candyRight).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyLeft).data("typeOfCandy")) {
			$(candy).addClass(cssSelector);
			$(candyRight).addClass(cssSelector);
			$(candyLeft).addClass(cssSelector);

			matched.valid = true;
			matched.points = +100;

		}

		//compara el dulce con los dos anteriores a su Izquierda
		// candyLL <- candyL <- candyPlayed
		if ($(candy).data("typeOfCandy") == $(candyLeft).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyLeftLeft).data("typeOfCandy")) {
			// SI EL DULCE ES IGUAL AL DULCE A SU IZQUIERDA Y AL DULCE DE SU DEREECHA
			$(candy).addClass(cssSelector);
			$(candyLeft).addClass(cssSelector);
			$(candyLeftLeft).addClass(cssSelector);

			matched.valid = true;
			matched.points = +500;

		}


		//compara el dulce con los dos despues a su derecha
		// candyPlayed -> candyR -> candyRR
		if ($(candy).data("typeOfCandy") == $(candyRight).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyRightRight).data("typeOfCandy")) {
			// SI EL DULCE ES IGUAL AL DULCE A SU IZQUIERDA Y AL DULCE DE SU DEREECHA
			$(candy).addClass(cssSelector);
			$(candyRight).addClass(cssSelector);
			$(candyRightRight).addClass(cssSelector);


			matched.valid = true;
			matched.points = +500;

		}

		/////////////////////////////////////////
		//VERTICAL MATCHED
		/////////////////////////////////////////

		let candyBefore = $(".col-" + (column)).find("div").eq((row - 2 < 0 ? 10 : (row - 2)));
		let candyBeforeBefore = $(".col-" + (column)).find("div").eq((row - 3 < 0 ? 10 : (row - 3)));
		let candyAfter = $(".col-" + (column)).find("div").eq(row);
		let candyAfterAfter = $(".col-" + (column)).find("div").eq(row + 1);


		//compara el dulce con el de la superior y el inferior
		// candyA =<- candyPlayed ->= candyB
		if ($(candy).data("typeOfCandy") == $(candyBefore).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyAfter).data("typeOfCandy")) {
			$(candy).addClass(cssSelector);
			$(candyBefore).addClass(cssSelector);
			$(candyAfter).addClass(cssSelector);

			matched.valid = true;
			matched.points = +100;


		}

		//compara el dulce con los dos superiores
		// candyB <- candyB <- candyPlayed

		if ($(candy).data("typeOfCandy") == $(candyBefore).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyBeforeBefore).data("typeOfCandy")) {
			// SI EL DULCE ES IGUAL AL DULCE A SU IZQUIERDA Y AL DULCE DE SU DEREECHA
			$(candy).addClass(cssSelector);
			$(candyBefore).addClass(cssSelector);
			$(candyBeforeBefore).addClass(cssSelector);

			matched.valid = true;
			matched.points = +500;

		}


		//compara el dulce con los dos despues a su derecha
		// candyPlayed -> candy-> candy
		if ($(candy).data("typeOfCandy") == $(candyAfter).data("typeOfCandy") && $(candy).data("typeOfCandy") == $(candyAfterAfter).data("typeOfCandy")) {
			// SI EL DULCE ES IGUAL AL DULCE A SU IZQUIERDA Y AL DULCE DE SU DEREECHA
			$(candy).addClass(cssSelector);
			$(candyAfter).addClass(cssSelector);
			$(candyAfterAfter).addClass(cssSelector);

			matched.valid = true;
			matched.points = +500;

		}


		return matched;

	}




	function _getMoveDirection(candy) {

		let top = parseInt($(candy).css("top"));
		let left = parseInt($(candy).css("left"));

		if (left < -100) {
			return "left";
		}

		if (left > 100) {
			return "right";
		}

		if (top > 40) {
			return "down";
		}

		if (top < -40) {
			return "up";
		}

	}



	function _getPositionRollback(pos) {
		//LEFT
		if (pos == "left") {
			return {
				"left": "-166px",
				"top": "0"
			}
		}

		//RIGHT
		if (pos == "right") {
			return {
				"left": "166px",
				"top": "0"
			}
		}

		//UP
		if (pos == "up") {
			return {
				"left": "0",
				"top": "-96px"
			}
		}

		//DOWN
		if (pos == "down") {
			return {
				"left": "0",
				"top": "96px"
			}
		}

	}




	function _setScored(points) {
		//SUMA EL PUNTAJE
		$("#score-text").data("value", $("#score-text").data("value") + points);
		$("#score-text").html($("#score-text").data("value"));
	}


	function setPlayedCount() {
		//SUMA EL MOVIMIENTO
		$("#movimientos-text").data("value", $("#movimientos-text").data("value") + 1);
		$("#movimientos-text").html($("#movimientos-text").data("value"));
	}




	//ANIMACION RECURSIVA PARA EL TITULO DEL JUEGO  -- "Match Game"
	function _setTitleAnimate() {

		$(".main-titulo")
			.animate({
				color: "white"
			}, 100).delay(300)
			.animate({
				color: "#DCFF0E"
			}, 100).delay(800)
			.animate({
				color: "#white"
			}, 100, function () {
				_setTitleAnimate()
			})
	}


	/////////////////////////////////////////////
	// END PRIVATE METHODS
	/////////////////////////////////////////////

	return {
		init: initialize,
		gameOver: gameOver
	}

})();


$(document).ready(function () {
	$('.btn-reinicio').click(function () {
		game.init(120);
		$(this).text('Reiniciar');
	});
});
