// Class defines game rules
App = {
  uiWidth: 0,
  uiHeight: 0,
  speed: 1, // 5 slow, 20 fast
  canvas: document.getElementById('canvas'),
  players: [],
  objects: [],
  score: 0,
  endGame: 9,
  timers: [],

  // Initialize UI and configure player
  init: function() {
    // Set viewport dimensions]
    this.uiWidth = this.canvas.clientWidth;
    this.uiHeight = this.canvas.clientHeight;

    // Bind events to elements in UI and keyboard
    this.bindEvents();

    // Render players
    App.players[0] = this.createPlayer();
    App.canvas.appendChild(App.players[0]);

    // Start the game when done
    return this.gameTimer();
  },

  bindEvents: function() {
    document.addEventListener('keydown', this.keyPress);
    window.addEventListener('deviceorientation', this.handleOrientation);
  },

  keyPress: function(e) {
    if (e.keyCode == '37') {
      App.players[0].style.left = App.players[0].x = App.players[0].x - 20;
    }
    if (e.keyCode == '39') {
      App.players[0].style.left = App.players[0].x = App.players[0].x + 20;
    }
  },

  // Helper method for obstacle creation
  createCoin: function(x, y, radius) {
    var coin = document.createElement('span');
    coin.classList.add('coin');

    coin.x = x;
    coin.y = y;
    coin.radius = radius;
    coin.value = 1;

    coin.style.left = coin.x;
    coin.style.top = coin.y;

    return coin;
  },

  // Helper method for snack creation
  createSnack: function(x, y, radius) {
    var snack = document.createElement('span');
    snack.classList.add('snack');

    snack.x = x;
    snack.y = y;
    snack.radius = radius;
    snack.value = -1;

    snack.style.left = snack.x;
    snack.style.top = snack.y;
    snack.style['background-position'] = '-' + Math.floor(Math.random() * 3)  + '00px 0';

    return snack;
  },

  updateScore: function(object) {
    // If the current score is bigger than 0 process the value
    App.score = App.score + object.value;

    document.getElementById('score').innerText = App.score;
    document.getElementById('score').classList.add('animate');

    window.setTimeout(function(){
      document.getElementById('score').classList.remove('animate');
    }, 750);

    // If the objects value is positive (coin) up the speed
    if ( Math.sign(object.value) == 1 ) {
      console.log('coin');
      App.speed = App.speed + .5;
    }

    // If the objects value is negative (snack) down the speed if it is bigger than 1
    else if (App.speed > 1 ) {
      console.log('snack');
      App.speed = App.speed - .5;
    }

    // If the score is smaller than the endgame continue
    if (App.score >= App.endGame) {
      return true;
    }
  },

  detectCollision: function (object, player) {
    var dx = object.x - player.x;
    var dy = object.y - player.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < object.radius + player.radius) {
      // collision detected!

      // Returns false if score exceeds max
      var stopGame = App.updateScore(object)

      if (stopGame) {
        App.stopGame();
      }

      return true;
    }
  },

  stopGame: function() {
    clearInterval(this.timers['updateInterface']);
    clearInterval(this.timers['spawnObject']);

    var gift = document.getElementById('gift');
    gift.classList.add('show');
  },

  // Helper method for player creation
  createPlayer: function() {
    var player = document.createElement('div');
    player.classList.add('player');

    player.x = this.uiWidth / 2 - (75/2);
    player.y = this.uiHeight - 100;
    player.radius = 40;

    player.style.left = player.x;
    player.style.top = player.y;

    return player;
  },

  updateInterface: function() {
    for (var i = 0; i < App.objects.length; i++) {
      var object = App.objects[i];

      // Move the snack over Y
      object.style.top = object.y = object.y + App.speed;

      for(player in App.players){

        // Detect for collision
        var collision = App.detectCollision(object, App.players[player]);

        // If there is a collision OR if there is no collision but object is out of bounds
        if (collision || (!collision && object.y >= (App.uiHeight - 55)) ) {
          // Remove from active list
          var index = App.objects.indexOf(object);

          if (index > -1) {
            App.objects.splice(index, 1);
          }

          // Remove from DOM
          App.canvas.removeChild(object);
        }

      }
    }
  },

  spawnObject: function() {
    var posX = Math.floor((Math.random() * (App.uiWidth - 200) ) + 75)
    var object;
    var objectType = Math.floor((Math.random() * 3) + 0); // 0, 1, 2

    // Render an coin if 0 (false) else render a snack
    if (objectType) {
      object = App.createCoin(posX, 0, 15);
    }
    else {
      object = App.createSnack(posX, 0, 15);
    }

    App.objects.push(object);
    App.canvas.appendChild(object);

    return true;
  },

  // Game timer fires events that randomly affect driving
  gameTimer: function () {
    this.timers['updateInterface'] = window.setInterval(this.updateInterface, 15);
    this.timers['spawnObject'] = window.setInterval(this.spawnObject, 2000);

    return true;
  },

  handleOrientation: function (event) {
    var x = event.beta;  // In degree in the range [-180,180]

    // Because we don't want to have the device upside down
    // We constrain the x value to the range [-90,90]
    if (x >  90) { x =  90};
    if (x < -90) { x = -90};

    // To make computation easier we shift the range of
    // x and y to [0,180]
    x += 90;

    // 10 is half the size of the ball
    // It center the positioning point to the center of the ball
    App.players[0].style.left = App.players[0].x = (App.uiWidth * x / 180 - 25);
  }

}

window.onload = function() {
  App.init();
}
