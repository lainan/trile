/*
AUTOR: Adrián Expósito Tofano
*/

var winCount = 0;
var cardCount = 0;
var winnerCard = "";

var difficultyLevel = 0;
var shufflesCount = 3;
var timeTranslation = 0;
var timeFlip = 1000;
var initialPositions = [];
var currentPositions = [];

var cardWidth = getCardWidth();

function getCardWidth() {
    var tempCard = document.createElement('div');
    tempCard.setAttribute('class', 'card-translation');
    document.body.appendChild(tempCard);
    var cardWidth = window.getComputedStyle(tempCard).width.slice(0,-2);
    document.body.removeChild(tempCard);
    return cardWidth;
}
// Crea todos los elementos (título, juego y opciones)
function createStartingElements() {
    // Juego
    appendNewElement('container', 'div', {'id': 'game'});
    addCard();
    addCard();
    addCard();
    setCardImages()

    // Título
    appendNewElement('container', 'div', {'id': 'title'});
    appendNewElement('title', 'h1', {'id': 'title-text'}, 'El Trile');

    // Opciones
    appendNewElement('container', 'div', {'id': 'options'});
    appendNewElement('options', 'div', {'id': 'win-text'});
    appendNewElement('win-text', 'span', undefined, 'Has ganado ');
    appendNewElement('win-text', 'span', {'id': 'win-counter'}, '0');
    appendNewElement('win-text', 'span', undefined, ' veces');
    appendNewElement('win-text', 'div', {'id': 'btn-wrapper'});
    appendNewElement('btn-wrapper', 'button', {'id': 'btn-start', 'onclick': 'startGame()'}, 'EMPEZAR');
}

/* Añade una carta (sin imagen o posición), cada carta esta formada por un capa
 de translación, una capa hija de rotación y dentro de esta a su vez dos capas
 con con el frontal y el reverso */
function addCard() {
    var cardID = "card" + cardCount;
    appendNewElement('game', 'div', {'id': cardID, 'class': 'card-translation'});
    appendNewElement(cardID, 'div', {'id': cardID + '-rotation', 'class': 'card-rotation'});
    appendNewElement(cardID + '-rotation', 'div', {'id': cardID + '-back', 'class': 'card-side card-back'});
    appendNewElement(cardID + '-rotation', 'div', {'id': cardID + '-front', 'class': 'card-side card-front'});
    cardCount += 1
    return cardID;
}

// Gira la carta (pone o añade una clase CSS con la propiedad rotateY)
function flipCard(cardID) {
    var card = document.getElementById(cardID + '-rotation');
    if (card.classList.contains('flipped')) {
        card.classList.remove('flipped');
    } else {
        card.classList.add('flipped');
    }
}

// Muestra todas las cartas (gira aquellas bocabajo)
function showAllCards() {
    var cards = document.getElementsByClassName('card-rotation');
    for (var i = 0; i < cards.length; i++) {
        if (cards[i].classList.contains('flipped')) {
            cards[i].classList.remove('flipped');
        }
    }
}

// Esconde todas las cartas (gira aquellas bocarriba)
function hideAllCards() {
    var cards = document.getElementsByClassName('card-rotation');
    for (var i = 0; i < cards.length; i++) {
        if (!cards[i].classList.contains('flipped')) {
            cards[i].classList.add('flipped');
        }
    }
}

// Acción del usuario al elegir una carta
// Gira la carta, desactiva el resto y comprueba si es la ganadora
function chooseCard() {
    flipCard(this.id);
    disableCards();
    if (this.id == winnerCard) {
        winCount++;
        document.getElementById('win-counter').innerHTML = winCount;
        increasetDifficulty();
    } else {
        setTimeout(function() { flipCard(winnerCard); }, timeFlip);
        disableButton('btn-start', false, timeFlip * 2)
    }
}

// Desactiva la cartas para que no puedan ser seleccionadas
function disableCards() {
    for (var i = 0; i < cardCount; i++) {
        var cardID = "card" + i;
        document.getElementById(cardID).style.cursor = "not-allowed";
        document.getElementById(cardID).removeEventListener("click", chooseCard);
    }
}

// Activa la cartas para que puedan ser seleccionadas
function enableCards() {
    for (var i = 0; i < cardCount; i++) {
        var cardID = "card" + i;
        document.getElementById(cardID).style.cursor = "pointer";
        document.getElementById(cardID).addEventListener("click", chooseCard);
    }
}

// Centra todas las cartas (con espacio entre ellas)
function centerCards() {
    var windowWidth = window.innerWidth;
    for (var i = 0; i < cardCount; i++) {
        initialPositions[i] = (Math.floor(windowWidth / (cardCount + 1)) * (i + 1)) - (cardWidth / 2);
    }

    cards = document.getElementsByClassName('card-translation');
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.left = initialPositions[i] + 'px';
    }
    currentPositions = initialPositions.slice()
}

// Asigna las imagenes (cara y reverso) a todas las carta de forma aleatoria
function setCardImages() {
    var cardImagesNames = ['oros', 'bastos', 'espadas', 'copas'];
    cardsFronts = document.getElementsByClassName('card-front');
    for (var i = 0; i < cardsFronts.length; i++) {
        var cardImageName = cardImagesNames[getRandomInt(0, 3)] + '_' + getRandomInt(2, 12) + '.png';
        cardsFronts[i].style.backgroundImage = 'url(img/cards/' + cardImageName + ')';
    }
    winnerCard = "card" + getRandomInt(0, cardsFronts.length - 1);
    document.getElementById(winnerCard + '-front').style.backgroundImage = 'url(img/cards/oros_1.png)';
    centerCards();
}

// Baraja las cartas (la reposiciona de forma aleatoria)
function shuffleCards() {
    cards = document.getElementsByClassName('card-translation');

    var randomPositions;
    do {
        randomPositions = shuffle(initialPositions);
    } while ( arraysEqual(randomPositions, currentPositions) )
    currentPositions = randomPositions.slice();

    var t = [];
    for (var i = 0; i < cards.length; i++) {
        var translationX = randomPositions[i] - initialPositions[i];
        cards[i].style.transform = 'translateX(' + translationX + 'px)';
    }
}

// Llama a la función de barajeo de forma secuencial según el número actual(esperando a que se
// completen las transiciones)
function startShuffle() {
    for (var i = 0; i < shufflesCount; i++) {
        setTimeout(shuffleCards, timeTranslation * i);
    }
    setTimeout(enableCards, timeTranslation * shufflesCount);
}

// Aumenta la dificultad según el número de veces que has ganado
function increasetDifficulty() {
    // Subimos el nivel de dificultad
    if ((winCount % 1 ) == 0) {
        difficultyLevel++;
    }

    var addNewCard =       (((difficultyLevel % 10) == 0) && ((cardWidth * cardCount) < window.innerWidth));
    var increaseShuffles = ((difficultyLevel % 4) == 0);
    var speedUpShuffle =   ((difficultyLevel % 1) == 0);


    if (addNewCard) {
        disableButton('btn-start', false, (timeFlip * 3) + timeTranslation);
    } else {
        disableButton('btn-start', false, timeFlip);
    }

    // Se aumenta el número de cartas
    if (addNewCard) {
        setTimeout(function() { flipCard(winnerCard); }, timeFlip);
        setTimeout(addCardToGame, timeFlip);
    }
    // Se acelera el tiempo de barajado
    if (speedUpShuffle) {
        timeTranslation = Math.round(1000 - ((difficultyLevel - 1) * 100))
        if (timeTranslation < (100 * cardCount)) { timeTranslation = (100 * cardCount); }
        var sheet = document.styleSheets[0];
        sheet.deleteRule(0); sheet.deleteRule(0);
        sheet.insertRule(".card-rotation { transition: transform " + timeFlip + "ms; }", 0);
        sheet.insertRule(".card-translation { \
                            transition: left 1s ease, \
                            transform " + timeTranslation + "ms ease; }", 0);
    }
    if (increaseShuffles) {
        shufflesCount++;
    }
    //console.log('difficulty, card count, shuffles count, suffle time')
    //console.log(difficultyLevel, cardCount, shufflesCount, timeTranslation)
}

// Activa o desactiva (disabled) el botón (buttonID) después del intervalo (time)
function disableButton(buttonID, disabled, time) {
    var button = document.getElementById(buttonID);
    var cursor = disabled ? "not-allowed" : "pointer";
    var text = disabled ? "JUGANDO" : "EMPEZAR";
    setTimeout(function() {
        button.disabled = disabled;
        button.style.cursor = cursor;
        button.innerHTML = text;
    }, time);
}

// Empieza el barajeo y te permite elegir una carta
function startGame() {
    disableButton('btn-start', true, 1);
    setTimeout(hideAllCards, 2);
    setTimeout(startShuffle, 500);
}

/* Proceso de añadir una nueca carta al juego: añade una carta, reasigna las
imagenes frontales a todas las cartas, las centra y finalment las muestra */
function addCardToGame() {
    var newCardID = addCard();
    newCard = document.getElementById(newCardID);
    newCard.style.visibility = "hidden";

    var center = (window.innerWidth / 2) - (cardWidth / 2);

    // Se coge la primera carta y se alza en el centro
    cards[0].style.zIndex = '100';
    cards[0].style.left = center + 'px';
    cards[0].style.transform = 'translateZ(150px) translateX(0px)';

    for (var i = 1; i < cards.length; i++) {
        cards[i].style.left
    }

    // Colocamos el resto en el centro
    cards = document.getElementsByClassName('card-translation');
    setTimeout(function() {
        for (var i = 1; i < cards.length; i++) {
            cards[i].style.transform = 'translateZ(0px) translateX(0px)';
            cards[i].style.left = center + 'px';
        }
    }, (timeTranslation/2));

    // Restauramos la primera carta y la nueva carta al estado normal
    setTimeout(function() {flipCard(newCardID);}, (timeTranslation/2));
    setTimeout(function() {newCard.style.visibility = "visible";}, timeTranslation*2);
    setTimeout(function() {cards[0].style.transform = 'translateZ(0px)';}, timeTranslation*2);
    setTimeout(function() {cards[0].style.zIndex = 'auto';}, timeTranslation*2);

    // Se resignan las imagenes frontales y se muestran todas las cartas
    setTimeout(setCardImages, timeTranslation * 2);
    setTimeout(showAllCards, timeTranslation * 2);
}

function start() {
    document.styleSheets[0].insertRule(".card-translation { }", 0);
    document.styleSheets[0].insertRule(".card-rotation { }", 0);
    createStartingElements();
    increasetDifficulty();
    disableCards();
}

window.onresize = centerCards;
window.onload = start;
