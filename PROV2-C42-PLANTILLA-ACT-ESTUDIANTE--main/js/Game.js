class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton(""); 
    this.leadeboardTitle = createElement("h2");
    
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playerMoving = false; 
    //Propiedad que verifica que jugado presiona 
    //cierta tecla
    this.leftKeyActive = false; 
    //Propiedad para verificar la explosión 
    

  }

  //Función para obtener estado de juego de base de datos 
  getState(){
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value",function(data) {
      gameState = data.val();
    });
  }

  //Método para actualizar base de datos 
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    //Objeto para el jugador 
    player = new Player();
    playerCount = player.getCount();

    //Objeto para el formulario de registro
    form = new Form();
    form.display();

    //Jugador 1 
    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;
    car1.addImage("blast",blastImage);
   
    
    //Jugador 2 
    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;
    car2.addImage("blast",blastImage);

    
    //Matriz para almacenar ambos jugadores 
    cars = [car1, car2];
    
    //Grupos 
    fuels = new Group();
    powerCoins = new Group();
    obstacles = new Group();

    //Definir posición de los obstáculos 
    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    //Agregar sprite de combustible
    this.addSprites(fuels, 4, fuelImage, 0.02);
    
    //Agregar sprite de moneda 
    this.addSprites(powerCoins,18, powerCoinImage, 0.09);
    //Agregando sprite de obstáculo en el juego
    this.addSprites(
      obstacles,
      obstaclesPositions.length,
      obstacle1Image,
      0.04,
      obstaclesPositions
    );
  }

  //Método para agregar Sprites 
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    //Buclé para generar los obstaculos aleatorios. 
    for (var i = 0; i < numberOfSprites; i++) {
      //Creamos variables para coordenadas aleatorias 
      var x, y;
      //Sí hay una posición definida (obstáculos)
      //se jecutara la primer parte de la condición
      if (positions.length > 0) {
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
        //Sí no hay posición definida (monedas/combustible)
        //si asigna posición aleatoria 
      } else {
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }
      //Creamos objeto
      var sprite = createSprite(x, y);
      //
      //Agregamos imagen
      sprite.addImage("sprite", spriteImage);
      //escalamos y agregamos al grupo
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }
  //Ocultar 
  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //Posición del encabezado de reinicio
    this.resetTitle.html("Reiniciar juego");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width/2+200,40);

    //Posición del botón de renicio 
    this.resetButton.class("resetButton");
    this.resetButton.position(width/2+230,100);
    
    //Posición del encabezado de puntuación
    this.leadeboardTitle.html("Puntuación");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);
    
    //Posición del encabezado del jugador 1 
    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);
    
    //Posición del encabezado del jugador 2
    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  //Método PLAY
  play() {
    //Oculta el formulario
    this.handleElements();
    this.handleResetButton();
    
    //Obtiene info. del jugador 
    Player.getPlayersInfo();
    //Obtiene Rank de los jugadores 
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      
      image(track, 0, -height * 5, width, height * 6);
      //Mostrar vida. 
      this.showLife();
      this.showFuelBar();
      this.showLeaderboard();
      
      var index = 0; 
      for(var prl in allPlayers){
        index = index + 1;
        
        //Almacenamos las posiciones de la BD 
        var x = allPlayers[prl].positionX;
        var y = height - allPlayers[prl].positionY; 
        
        //Almacenar el valor de playerlife 
        var currentlife = allPlayers[prl].life;
        if(currentlife<=0){
        cars[index-1].changeImage("blast");
        cars[index-1].scale = 0.3;
        }
        
        cars[index-1].position.x = x;
        cars[index-1].position.y = y; 
        
        //Dibujaremos ellipse para cada jugador 
        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);    

          this.handleFuel(index);
          this.handlePowerCoins(index);
          //Verifica colisón entre vehiculos 
          this.handleCarACollisionWithCarB(index);
          this.handleObstacleCollision(index);
          
          //Comprobar movimiento y explosión del jugador 
          
          
          //Cambiar posición de la cámara 
          camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;      
        }
      }    
      
      //Método para avanzar automaticamente 
      if (this.playerMoving) {
        player.positionY += 5;
        player.update();
      }
      
      //Llamamos función de controles 
      this.handlePlayerControls();

      // Línea de meta
      //Indica que la altura de la meta esta
      //100px antes de terminar la imagen 
      const finshLine = height * 6 - 100;
      //Sí el jugador pasa la línea de meta 
      if (player.positionY > finshLine) {
        //Cambiamos el game State 
        gameState = 2;
        //Aumentamos el Rank en 1 
        player.rank += 1;
        //Llamamos a las funciones 
        Player.updateCarsAtEnd(player.rank);
        player.update();
        //Muestra la posición del jugador 
        this.showRank();
      }
      drawSprites();
    }
  }

  //Método para funcionamiento de botón reinicio
  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd: 0,
      });
      window.location.reload();
    });
  }

  //Método para barra de vida
  showLife() {
    push();
    image(lifeImage, width / 2 - 130, height - player.positionY - 300, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY - 300, 185, 20);
    fill("#f50057");
    rect(width / 2 - 100, height - player.positionY - 300, player.life, 20);
    noStroke();
    pop();
  }

  //Método para la barra de combustible 
  showFuelBar() {
    push();
    image(fuelImage, width / 2 - 130, height - player.positionY - 350, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - player.positionY - 350, 185, 20);
    fill("#ffc400");
    rect(width / 2 - 100, height - player.positionY - 350, player.fuel, 20);
    noStroke();
    pop();
  }

  //Muestra quien es el lider 
  showLeaderboard() {
    //Variable para almacenar jugador lider
    var leader1, leader2;
    var players = Object.values(allPlayers);
    //Comprueba si el 1er jugador tiene la posición 1 
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;esta etiqueta se utiliza para mostrar cuatro espacios.
      //Sí se cumple la condición 
      leader1 =
        players[0].rank +
        "&emsp;" +
        //Colocamos el nombre del jugador 1 en 1er lugar
        players[0].name +
        "&emsp;" +
        //Colocamos su puntuación en 1er lugar
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        //Colocamos el nombre del jugador 2 en 2er lugar
        players[1].name +
        "&emsp;" +
        //Colocamos su puntuación en 2do lugar
        players[1].score;
    }
    //Comprueba si el jugador 2 tiene la posición 1 
    if (players[1].rank === 1) {
      //Sí se cumple la condición 
      leader1 =
        players[1].rank +
        "&emsp;" +
        //Colocamos el nombre del jugador 2 en 1er lugar
        players[1].name +
        "&emsp;" +
        //Colocamos su puntuación en 1er lugar
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        //Colocamos el nombre del jugador 1 en 2er lugar
        players[0].name +
        "&emsp;" +
        //Colocamos su puntuación en 2do lugar
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }
  
  //Función para controles 
  handlePlayerControls() {
    if(keyIsDown(UP_ARROW)) {
        this.playerMoving = true;
        player.positionY += 10;
        player.update();
    }
    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
        this.leftKeyActive = true;
        player.positionX -= 5; 
        player.update();
    }
  
    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
        this.leftKeyActive = false; 
        player.positionX += 5;
        player.update();
    }
      
  }

  //Metodo par comprobar la colisión de los tanques de combustible 
  handleFuel(index) {
    // Agregando combustible
    cars[index - 1].overlap(fuels, function(collector, collected) {
      player.fuel = 185;
      //recolectado el sprite en el grupo de recolectables que desencadenan
      //el evento
      collected.remove();
    });
    //DENTRO DEL MÉTODO HANDLEFUEL-GAME.JS
    // Reducir el combustible del auto
    if (player.fuel > 0 && this.playerMoving) {
      //Se puede modificar 0.5,0.7
      player.fuel -= 0.3;
    }
    //Si se acaba el combustible = GAMEOVER
    if (player.fuel <= 0) {
      gameState = 2;
      this.gameOver();
    }
  }

  //Metodo par comprobar la colisión de las monedas 
  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function(collector, collected) {
      player.score += 21;
      player.update();
      //recolectado el sprite en el grupo de recolectables que desencadenan
      //el evento
      collected.remove();
    });
  }

  //Métodos de colisión para autos 
  handleObstacleCollision(index) {
    if (cars[index - 1].collide(obstacles)) {
      //Tecla izquierda rebota a la derecha 
      if(this.leftKeyActive){
        player.positionX += 100;
      } else {
      //Tecla derecha rebota a la izquierda 
        player.positionX -=100;
      }
      //Reduciendo la vida del jugador
      if (player.life > 0) {
        player.life -= 185 / 4;
      }
      player.update();
    }
  }

  //Método para verificar colisión entre autos
  handleCarACollisionWithCarB(index) {
    if(index === 1){
     if(cars[index-1].collide(cars[1])){
      if(this.leftKeyActive){
          player.positionX+=100;
          
      }
      else{
      player.positionX-=100;
      }
      if(player.life > 0){
      player.life-=185/4
      }
      player.update();
     }
    }
    if(index === 2){
      if(cars[index-1].collide(cars[0])){
       if(this.leftKeyActive){
           player.positionX+=100;
           
       }
       else{
       player.positionX-=100;
       }
       if(player.life > 0){
       player.life-=185/4
       }
       player.update();
      }
     }
  }


  showRank() {
    swal({
      title: `Impresionante!${"\n"}Posición${"\n"}${player.rank}`,
      text: "Llegaste a la meta con éxito",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  //Método para sw de fin de juego
  gameOver() {
    swal({
      title: `Fin del juego`,
      text: "Ups perdiste la carrera!!!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Gracias por jugar"
    });
  }

}
