var fireDoks = firebaseRoot.child("dobuki");

window.addEventListener("load",initGame);

var gamejolt = false, newgrounds = false;
var session = MD5_path(new Date().getTime()+""+Math.random()).split("/")[0];
var dok;
var keys = {};
var globalFrame = 0;
var lasers = {};
var effectsOverlay;
var particles = [];
var recycleLasers = [];
var hitImages = [];
var score = 0;
var doks = {};
var doksData = {};
var dokspeed = 1;
var myFire;
var paused = false;
var commentsBase = firebaseRoot.child("comments");
var playerName = null;

function initGame() {

  myFire = fireDoks.child(session);
  myFire.onDisconnect().remove();
  
  dok = createSprite(dobukiDataURI);
  dok.style.position = "absolute";
  dok.readonly = true;
  dok.pos = {x:0,y:0};
  dok.addEventListener("enterFrame",enterFrame);
  dok.lastLaser = 0;
  dok.born = 0;
  document.getElementById("screen").appendChild(dok);
  
  effectsOverlay = document.createElement("canvas");
  effectsOverlay.width = window.innerWidth;
  effectsOverlay.height = window.innerHeight;
  effectsOverlay.style.position = "absolute";
  effectsOverlay.style.pointerEvents = "none";
  document.body.appendChild(effectsOverlay);
  
  document.addEventListener("keydown",onKey);
  document.addEventListener("keyup",onKey);
  window.focus();
  
  fireDoks.on('value',fireDoksChanged);
  commentsBase.on('child_added',
    function(snapshot) {
      var o = snapshot.val();
      addComment(o);
    }
  );
  
  resetGame();
  showIntro();
}

function addComment(o) {
  var span = document.createElement('span');
  span.innerHTML = "<center style='color:#666666'><span style='font-size:x-small'>"+o.date+"</span><br>"+ o.comment+"</center>";
  span.style.position = "absolute";
  span.readonly = true;
  span.pos = {x:o.x,y:o.y};
  document.getElementById("screen").appendChild(span);
}

function resetGame() {
  score = 0;
  dok.born = globalFrame;
  dok.ko = false;
  paused = false;
  updateScore();
}

function onKey(event) {
  keys[event.keyCode] = event.type=="keydown";
    event.preventDefault();
}

function showSplash(x,y) {
  var screenSplash = convertToScreen(x,y);
  for(var i=0;i<25;i++)
    particles.push([screenSplash.x,screenSplash.y-30,(Math.random()-.5)*30,Math.random()*-20,globalFrame]);
}

function showEffects() {
  var mainScreen = document.getElementById("screen");
  var canvas = effectsOverlay;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#FF"+Math.floor(Math.random()*16).toString(16)+Math.floor(Math.random()*16).toString(16)+"00";
  for(var i=particles.length-1;i>=0;i--) {
    var particle = particles[i];
    var xpos = particle[0];
    var ypos = particle[1];
    var size = Math.round(2+Math.random()*4);
    ctx.fillRect(xpos,ypos,size,size);
    particle[0] += particle[2];
    particle[1] += particle[3];
    particle[3]+=3;
    if(globalFrame-particles[4]>10) {
      particles.splice(i,1);
    }
  }
  for(var i=0;i<hitImages.length;i++) {
    var hitImage = hitImages[i];
    var screenPos = convertToScreen(hitImage.pos.x,hitImage.pos.y);
    var life = 100-hitImage.hits;
    ctx.fillStyle="#FF0000";
    ctx.fillRect(screenPos.x+life-50,screenPos.y,hitImage.hits,5);
    ctx.fillStyle="#00FF00";
    ctx.fillRect(screenPos.x-50,screenPos.y,life,5);
  }
}

function showIntro() {
  paused = true;
  var div = document.createElement("div");
  div.style.position = "absolute";
  div.align = "center";
  div.id = "intro";
  div.style.width = "100%";
  div.style.top = div.style.posTop  = window.innerHeight/8 + "px";
  
  var table = document.createElement("table");
  div.appendChild(table);
  var tr = document.createElement("tr");
  table.appendChild(tr);
  var td = document.createElement("td");
  tr.appendChild(td);
  td.style.width = "100%";
  td.style.backgroundColor = "white";
  setAlpha(td,.9);
  
  td.innerHTML = 
  "<center style=\"font-family: Georgia, 'Times New Roman', Times, serif\">"+
  "<h2>Dobuki's</h2><h1 style='color:blue'>SOCIAL GAMEDEV<font size='2'>v.1</font></h1><font size='2'>a social game development experiment</font></center>"+
  "<h4>"+
  "Welcome to Dobuki's Social Gamedev experiment. At first glance, this looks like a"+
  "<br>"+
  "standard run-and-gun game, yet it is very different."+
  "<br>"+
  "First of all, you can see other players currently in the game in real time."+
  "<br>"+
  "Secondly, you can edit the game at any point, simply by clicking the <b>option</b> icon"+
  "<br>"+
  "on the top right. You then click that icon again to continue playing."+
  "<br>"+
  "The changes you made are reflected in real time and affect all players in the game."+
  "<br>"+
  "Essentially, you are building the game live as it is being played."+
  "<br>"+
  "<br>"+
  "I hope you enjoy this experiment, and good luck!"+
  "<br>"+
  "<br>"+
  "<div align='right'><i>Jack Le Hamster</i></div>"+
  "<br>"+
  "<br>"+
  "<center>Arrow keys to move.<br>Space to shoot.<br>ESC to end the game.<center/>"+
  "</h4>";

  var button = document.createElement("input");
  button.type="button";
  button.value = "START GAME";
  button.addEventListener("click",
    function(event) {
      var div = document.getElementById("intro");
      div.parentElement.removeChild(div);
      resetGame();
    }
  );
  div.appendChild(button);
  
  var button = document.createElement("input");
  button.type="button";
  button.value = "EDIT GAME";
  button.addEventListener("click",
    function(event) {
      var div = document.getElementById("intro");
      div.parentElement.removeChild(div);
      paused = false;
      editMode = true;
      applyOptions();
    }
  );
  div.appendChild(button);

  var fb = document.createElement("div");  
  fb.width = "100%";
  fb.innerHTML = 
  "<div align='right'><font size=2><i>Dobuki's Social Gamedev was built using</i><br><a target='_blank' href='http://www.firebase.com?ref=dobuki' style='color:black;text-decoration:none'><b>Firebase <img src='https://pbs.twimg.com/profile_images/1974595305/firebase_branding_r4_FINAL_03.png' height=12 width=12></b></a>"+
  "</font></div>";
  div.appendChild(fb);
  
  
  document.body.appendChild(div);
}

function showGameOver() {
  var div = document.createElement("div");
  div.style.position = "absolute";
  div.align = "center";
  div.id = "gameover";
  div.innerHTML = "<h1 style='color:red'>GAME OVER</h1><br>";
  div.style.width = "100%";
  div.style.top = div.style.posTop  = window.innerHeight/3 + "px";
  

  var table = document.createElement("table");
  div.appendChild(table);
  var tr = document.createElement("tr");
  table.appendChild(tr);
  var td = document.createElement("td");
  tr.appendChild(td);
  
  var tweet = document.createElement("center");
  
  var scoreTable = td;
  scoreTable.style.backgroundColor="white";
  setAlpha(scoreTable,.7);
  
  var recordedScore = false;
  var fireScore = firebaseRoot.child("highscore");
  var fireScoreFunction;
  fireScore.on('value',
    fireScoreFunction = function(snapshot) {
      var scores = snapshot.val();
      if(!scores)
        scores = {};
      var scoreArray = [];
      
      for(var ses in scores) {
        scoreArray.push({
          session:ses,
          score:scores[ses].score,
          name:scores[ses].name,
          timestamp:scores[ses].timestamp?scores[ses].timestamp:0
        });
      }
      
      scoreArray.sort(
          function(a,b) {
            return a.score>b.score?-1:a.score<b.score?1:a.timestamp<b.timestamp?-1:a.timestamp>b.timestamp?1:0;
          }
      );
      
      for(var i=10;i<scoreArray.length;i++) {
        fireScore.child(scoreArray[i].session).remove();
      }

      var html = "<ol>";
      for(var i=0;i<Math.min(scoreArray.length,10);i++) {
          html += "<li>" + scoreArray[i].name + " - " + scoreArray[i].score + "</li>";
      }
      scoreTable.innerHTML = html+"</ol>";
      scoreTable.appendChild(tweet);

            //   console.log(score);
            //   console.log(scoreArray);
             //  console.log(recordedScore);
      if(score && (scoreArray.length<10 || score>scoreArray[9].score) && !recordedScore) {
        recordedScore = true;
        if(scores[session] && playerName) {
          fireScore.child(session).child('score').set(score);
            saveScore(playerName,score);
        }
        else {
          var name = prompt("You ranked in the leaderboard! Enter your name:");
          if(name) {
            name = name.trim();
            if(name.length) {
               playerName = name;
              fireScore.child(session).set(
                {
                  session:session,
                  name:name,
                  score:score,
                  timestamp:new Date().getTime()
                }
              );
               
               saveScore(name,score);
               
            }
          }
        }
      }
      
    }
  );
  
  var button = document.createElement("input");
  button.type="button";
  button.value = "CONTINUE GAME";
  button.addEventListener("click",
    function(event) {
      var div = document.getElementById("gameover");
      div.parentElement.removeChild(div);
      resetGame();
      fireScore.off('value',fireScoreFunction);
    }
  );
  div.appendChild(button);

  var button = document.createElement("input");
  button.type="button";
  button.value = "LEAVE US A COMMENT";
  button.addEventListener("click",
    function(event) {
      var button = event.currentTarget;
      var comment = prompt("Enter a short comment");
      if(comment) {
        commentsBase.push(
          {
            comment:comment,
            x:dok.pos.x,
            y:dok.pos.y,
            date:new Date().toLocaleDateString()
          }
        );
      }
    }
  );
  div.appendChild(button);
  
  document.body.appendChild(div);
  
  twttr.widgets.createShareButton(
    newgrounds?"http://www.newgrounds.com/portal/view/654624":
    gamejolt?"http://gamejolt.com/games/other/dobuki-s-social-gamedev/53710/":window.location.href,
    tweet,
    {
      count: "none",
      text: "Check out #Dobuki's Social Gamedev, a game that you create as you play it!"
    }).then(function (el) {
    }
  );
  
  
}

function saveScore(name,score) {
    if(true) {
        var scoreAdd = "http://gamejolt.com/api/game/v1/scores/add/?"+
        "game_id="+53710+"&"+
        "score="+score+"&"+
        "sort="+score+"&"+
        "guest="+name;
        scoreAdd += "&signature="+CryptoJS.MD5(scoreAdd+"e01fd04521dedcf760f781a3c2ef9321");
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", scoreAdd, false );
        xmlHttp.send( null );
    }
}

function hit(img) {
  if(!img.hits) {
    hitImages.push(img);
  }
  img.hits = Math.min(100,img.hits?img.hits+10:10);
  img.lastHit = globalFrame;
  if(img.hits>=100) {
    img.ko = true;
    img.hits = 0;
    if(img==dok) {
      img.gotoAndPlay("ko");
      updateMyDok();
      showGameOver();
    }
    else {
      setAlpha(img,.2);
      if(img.canvas) {
        setAlpha(img.canvas,.2);
      }
      
      var radius = Math.random()*2*Math.PI;
      
      moveImage(img,img.pos.x+100*Math.cos(radius),img.pos.y+100*Math.sin(radius));
    }
    var index = hitImages.indexOf(img);
    hitImages.splice(index,1);
    if(img!=dok) {
      score+=100;
      updateScore();
    }
    if(img!=dok) {
      var timeout = setTimeout(
          function() {
            clearTimeout(timeout);
            delete img.ko;
            setAlpha(img,1);
            if(img.canvas) {
              setAlpha(img.canvas,1);
            }
          },20000
      );
    }
  }
}

function heal(img,value) {
  if(img.hits && globalFrame-img.lastHit>100) {
    img.hits--;
    if(!img.hits) {
      var index = hitImages.indexOf(img);
      hitImages.splice(index,1);
    }
  }
}

function updateScore() {
  document.getElementById("score").innerHTML = "<b>Score:</b> " + score;
}

function invincible(img) {
   return globalFrame-(img.born?img.born:0)<200;
}

function collide(x,y,type) {
  x = Math.round(x);
  y = Math.round(y+2);
  var dokX = Math.round(dok.pos.x), dokY = Math.round(dok.pos.y);
   for(var xx=-3;xx<=3;xx++) {
     for(var yy=-3;yy<=3;yy++) {
        var img = x+xx==dokX && y+yy==dokY? dok : map[(x+xx)+"_"+(y+yy)];
        if(img && !img.ko) {
          if(img.img) img = img.img;
          if(img.drawn && type==2 || !img.drawn && type==1 && !invincible(img)) {
            showSplash(x,y);
            hit(img);
            return map[(x+xx)+"_"+(y+yy)];
          }
        }
     }
   }
   return false;
}

function fireDoksChanged(snapshot) {
  var o = snapshot.val();
  doksData = o;
}

function updateDoks() {
  //  update synchronized doks from Firebase
  var changed = false;
  for(var ses in doksData) {
    if(ses!=session) {
      var data = doksData[ses];
      var oDok = doks[ses];
      if(!oDok) {
        oDok = createSprite(dobukiDataURI);
        doks[ses] = oDok;
        oDok.session = ses;
        oDok.style.position = "absolute";
        oDok.readonly = true;
        oDok.pos = {x:data.x,y:data.y};
        oDok.goal = {x:data.x,y:data.y};
        document.getElementById("screen").appendChild(oDok);
      }
      oDok.goal.x = data.x;
      oDok.goal.y = data.y;
      var dx = oDok.goal.x-oDok.pos.x;
      var dy = oDok.goal.y-oDok.pos.y;
      var dist = Math.sqrt(dx*dx+dy*dy);
      if(oDok.label!=data.label) {
        oDok.gotoAndPlay(data.label);
      }
      if(oDok.direction!=data.direction)
        oDok.setDirection(data.direction);
      if(dist>1) {
        oDok.pos.x += dx*dokspeed/dist;
        oDok.pos.y += dy*dokspeed/dist;
        changed = true;
      }
    }
  }
  return changed;
}

function updateMyDok() {
    myFire.set(
      {
        session:session,
        x:dok.pos.x,
        y:dok.pos.y,
        label:dok.label,
        direction:dok.direction
      }
    );
}

function enterFrame() {
  var doUpdateScreen = false, doUpdateMyDok = false;
  if(updateDoks()) {
    doUpdateScreen = true;
  }
  
  if(!editMode && !paused) {
    globalFrame++;
    
    dok.style.visibility = invincible(dok) && Math.floor(globalFrame/5)%2==0 ? "hidden" : "";
    
    if(!dok.ko) {
      var dx = 0, dy = 0;
      if(keys[37]) dx--;  //  left
      if(keys[39]) dx++;  //  right
      if(keys[38]) dy--;  //  up
      if(keys[40]) dy++;  //  down

      
      if(dx && dx*dok.direction<0) {
        dok.setDirection(dx);
        doUpdateMyDok = true;
      }
      
      if(dx!=0 || dy!=0) {
        if(dok.label!="running")
          dok.gotoAndPlay("running")
        var dist = Math.sqrt(dx*dx+dy*dy);
        dok.pos.x += dx/dist*dokspeed;
        dok.pos.y += dy/dist*dokspeed;
        doUpdateScreen = true;
        doUpdateMyDok = true;
      }
      else {
        if(dok.label!="still") {
          dok.gotoAndPlay("still");
          doUpdateMyDok = true;
        }
      }
      
      //  shoot laser
      if(keys[32]) {  //  space bar
        if(globalFrame-dok.lastLaser>5) {
          shootLaserBeam(dok.pos.x,dok.pos.y,dok.direction,2);
        }
      }
      
      //  self-ko
      if(keys[27]) {
        dok.hits = 100;
        hit(dok);
      }
      
    }
    
    //  handle lasers
    for(var i in lasers) {
      var laser = lasers[i];
      laser.pos.x += laser.direction*(laser.type==2?4:3);
      
      if(globalFrame-laser.born>50 || collide(laser.pos.x,laser.pos.y,laser.type)) {
        laser.parentElement.removeChild(laser);
        delete lasers[i];
        recycleLasers.push(laser);
      }
      doUpdateScreen= true;
    }
    
    //  handle AI agressivity
    handleAI();
  
    //  heal images
    for(var i=hitImages.length-1;i>=0;i--) {
      heal(hitImages[i]);
    }
    
    //  scroll to dok
    if(!editMode) {
      shiftX += ((dok.pos.x-shiftX)/5);
      shiftY += ((dok.pos.y-shiftY)/5);
      doUpdateScreen = true;
    }
    
    showEffects();  
  }
  
  if(doUpdateScreen)
    updateScreen();
  if(doUpdateMyDok)
    updateMyDok();
}

function handleAI() {
  var imgs = document.getElementById("screen").children;
  for(var i=0;i<imgs.length;i++) {
    var img = imgs[i];
    var tag = img.tagName.toLowerCase();
    if(img.drawn && img.firebase && !img.ko) {
      
      var screenPos = convertToScreen(img.pos.x,img.pos.y);
      if(screenPos.x>0 && screenPos.y>0 && screenPos.x<window.innerWidth && screenPos.y<window.innerHeight) {
        img.agressivity = (img.agressivity?img.agressivity+1:1);
        if(img.agressivity>Math.max(5,30-score/100)) {
          var dir = Math.random()<.5?-1:1;
          shootLaserBeam(img.pos.x+dir*2,img.pos.y,dir,1);
          img.agressivity = 0;
        }
      }
    }
  }
}

function shootLaserBeam(x,y,direction,type) {
  if(type==2)
    dok.lastLaser = globalFrame;
  var img = recycleLasers.length?recycleLasers.pop():new Image();
  img.id = ""+Math.random();
  img.born = globalFrame;
  img.type = type;
  img.src = type==2?beamDataURI2:beamDataURI;
  img.style.position = "absolute";
  img.direction = direction;
  img.pos = {x:x,y:y-3+Math.random()};
  img.readonly= true;
  lasers[img.id] = img;
  document.getElementById("screen").appendChild(img);
}
