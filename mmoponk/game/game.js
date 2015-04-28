
function cleanName(name) {
    return encodeURIComponent(name);
}

function Game(leftSide,rightSide) {
//    leftSide = "Microsoft";
//    rightSide = "Apple";
    var currentMessage = null;
    var messages = [];
    if(!leftSide) leftSide = "LEFT";
    if(!rightSide) rightSide = "RIGHT";
    var roomName = leftSide+" vs "+rightSide;
    var BALLDELAY = 3000;
    var self = this;
    this.active = true;
    this.chatting = function() {return false};
    
    var score = null;
    var ballDelay = BALLDELAY;
    var balls = {};
    var localBalls = {};
    var localPlayersX = {};
    var pendingBalls = {};
    var localPos = {x:0,y:0};
    var leftFlash = 0;
    var rightFlash = 0;
    var players;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var selfID = localStorage.getItem("userID");
    if(!selfID) {
        selfID = CryptoJS.MD5(new Date()+""+Math.random())+"";
        localStorage.setItem("userID",selfID);
    }
    var roomID = cleanName(roomName);
    
    var firebaseRoot = new Firebase('https://mmo-ponk.firebaseio.com');
    var lobbyEntry = firebaseRoot.child('lobby/'+roomID);
    var firebase = firebaseRoot.child('games/'+roomID);
    var selfBase = firebase.child("players").child(selfID);
    selfBase.onDisconnect().remove();
    firebase.child('balls').child(selfID).onDisconnect().remove();
    
    lobbyEntry.child('players').child(selfID).set(true);
    lobbyEntry.child('players').child(selfID).onDisconnect().remove();
    lobbyEntry.child('lastJoined').set(new Date().getTime());
    
    function mouseMove(e) {
        localPos = {
            x:(e.pageX-canvas.offsetLeft)/canvas.width,
            y:(e.pageY-canvas.offsetTop)/canvas.height
        };
        selfBase.child("pos").set(localPos);
    }
    
    firebase.on('value', valueChanged);  // refresh whenever its value changes
    lobbyEntry.child('score').on('value', scoreChanged);
    lobbyEntry.child('message').on('value',messageChanged);
    
    function scoreChanged(snapshot) {
       var o=snapshot.val();
       var newScore = o ?o:[0,0];
       if(score) {
           if(score[0]!=newScore[0]) {
               rightFlash = 500;
           }
           if(score[1]!=newScore[1]) {
               leftFlash = 500;
           }
       }
       score = newScore;
       document.title = score.join(":")+" "+roomName;
    }

    function valueChanged(snapshot) {
       var o=snapshot.val();
       if(o) {
           players = o.players?o.players:{};
           balls = o.balls?o.balls:{};
       }
    }
    
    function messageChanged(snapshot) {
        var o = snapshot.val();
        if(o) {
            currentMessage = o;
            messages.unshift({msg:currentMessage,time:now});
        }
    }
    
    this.chat = function(msg) {
        var selfPaddle = players[selfID];
        if(selfPaddle) {
            msg = (selfPaddle.pos.x<.5?leftSide:rightSide)+": "+msg;
            lobbyEntry.child('message').set(msg);
        }
    }
    
    function refresh(dtime) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.beginPath();

        if(leftFlash>0) {
            var flashAmount = Math.floor(parseInt("FF",16) * leftFlash/500);
            flashAmount = Math.floor(parseInt("100",16)+
                                     flashAmount).toString(16).substr(1);
            ctx.fillStyle = "#"+flashAmount+flashAmount+flashAmount;
            ctx.rect(0,0,canvas.width/2,canvas.height);
            ctx.fill();
            ctx.beginPath();
            leftFlash-=dtime;
        }
        if(rightFlash>0) {
            var flashAmount = Math.floor(parseInt("FF",16) * rightFlash/500);
            flashAmount = Math.floor(parseInt("100",16)+
                                     flashAmount).toString(16).substr(1);
            ctx.fillStyle = "#"+flashAmount+flashAmount+flashAmount;
            ctx.rect(canvas.width/2,0,canvas.width/2,canvas.height);            
            ctx.fill();
            ctx.beginPath();
            rightFlash-=dtime;
        }
        
        ctx.fillStyle = "#FFFFFF";
        
        ctx.font=Math.round(canvas.width/40)+"px 'Press Start 2P'";
        ctx.fillText(leftSide,canvas.width*(1/4-(""+leftSide).length/80),canvas.height*(1/4-1/8));
        ctx.fillText(rightSide,canvas.width*(3/4-(""+rightSide).length/80),canvas.height*(1/4-1/8));
        if(score) {
            ctx.font=Math.round(canvas.width/20)+"px 'Press Start 2P'";
            var s = ""+ (score[0]?score[0]:0);
            ctx.fillText(s,canvas.width*(1/4-s.length/50),canvas.height/4);
            var s = ""+ (score[1]?score[1]:0);
            ctx.fillText(s,canvas.width*(3/4-s.length/50),canvas.height/4);
        }
        
        ctx.font=Math.round(canvas.width/100)+"px 'Press Start 2P'";
        if(!self.chatting()) {
            ctx.fillText("Press ESC to return to lobby, TYPE to chat",canvas.width*(1/80),canvas.height*(1-1/50));
        }
        
        if(messages.length) {
            for(var i=0;i<messages.length;i++) {
                var time = now-messages[i].time;
                var alpha = Math.max(0,time<9000?1:(10000-time)/1000);
                var fadeAmount = Math.floor(parseInt("AA",16) * alpha);
                fadeAmount = Math.floor(parseInt("100",16)+
                                         fadeAmount).toString(16).substr(1);
                ctx.fillStyle = "#"+fadeAmount+fadeAmount+fadeAmount;
                ctx.fillText(decodeURIComponent(messages[i].msg),
                             canvas.width*(1/80),canvas.height*(1-(3+i)/40));
            }
            if(messages[messages.length-1]) {
                if(now-messages[messages.length-1].time>10000) {
                    messages.pop();
                }
            }
            ctx.fillStyle = "#FFFFFF";
        }
        
        for(var i=0;i<10;i++) {
            ctx.rect(canvas.width*(1/2-.01),
                     canvas.height*i/10,canvas.width/100,canvas.height/20);
        }
        
        for(var id in players) {
            var player = players[id];
            if(player) {
                var w = canvas.width/100;
                var h = canvas.height/8;
                var pos = id==selfID?localPos:player.pos;
                var x = pos.x<.5?4:canvas.width-4-w;
                if(!localPlayersX[id])
                    localPlayersX[id] = x;
                localPlayersX[id] += (x-localPlayersX[id])/4;
                var y = pos.y*canvas.height - h/2;
                if(id==selfID) {
                    ctx.fill();
                    ctx.beginPath();
                    ctx.fillStyle = "#FFFF66";
                }
                ctx.rect(localPlayersX[id],y,w,h);
                if(id==selfID) {
                    ctx.fill();
                    ctx.beginPath();
                    ctx.fillStyle = "#FFFFFF";
                }
            }
        }
        
        for(var id in balls) {
            var ball = balls[id];
            if(!localBalls[id]) {
                localBalls[id] = {
                    x:ball.x,
                    y:ball.y,
                    dx:ball.dy,
                    dy:ball.dx,
                    update:ball.update
                };
                delete pendingBalls[id];
//                console.log(ball);
            }
            if(ball.update>localBalls[id].update) {
                localBalls[id].x = ball.x;
                localBalls[id].y = ball.y;
                localBalls[id].dx = ball.dx;
                localBalls[id].dy = ball.dy;
                localBalls[id].update = ball.update;
                localBalls[id].doomed = 0;
            }
        }
        
        for(var id in localBalls) {
            if(!balls[id]) {
                delete localBalls[id];
            }
        }
        
        if(!localBalls[selfID] && !pendingBalls[selfID]) {
            if(ballDelay<0) {
                pendingBalls[selfID] = true;
                var dx = Math.random()<.5?-1:1;
                var dy = (Math.random()-.5);
                var dist = Math.sqrt(dx*dx+dy*dy);
                firebase.child('balls').child(selfID).set({
                    x:0.5,
                    y:0.5,
                    dx:dx/dist*.05,
                    dy:dy/dist*.05,
                    update:0
                });
                ballDelay = BALLDELAY;
            }
            else {
                ballDelay -= dtime;
            }
        }
                
        for(var id in localBalls) {
            var ball = localBalls[id];
            ball.x += ball.dx*dtime/100;
            ball.y += ball.dy*dtime/100;
            if(ball.x<0.02 && ball.dx<0 || ball.x>0.98 && ball.dx>0) {
                if(ball.x>0 && ball.x<1) {
                    var selfPaddle = players[selfID];
                    if(selfPaddle && Math.abs(ball.y-selfPaddle.pos.y)<1/16) {
                        if(selfPaddle.pos.x<.5 && ball.x<.5
                           || selfPaddle.pos.x>.5 && ball.x>.5) {
                            if(!pendingBalls[id]) {
                                ball.dx=-ball.dx;
                                var dx = ball.dx + ball.x<.5?.02:-.02;
                                var dy = ball.dy+(ball.y-selfPaddle.pos.y);
                                var dist = Math.sqrt(dx*dx+dy*dy);
                                ball.dx = dx/dist*.05;
                                ball.dy = dy/dist*.05;
                                ball.update++;
                                firebase.child('balls').child(id).set(ball);
                            }
                        }
                    }
                }
                else {
                    ball.doomed = ball.doomed?ball.doomed+dtime:dtime;
                    if(ball.doomed>1000 && score) {
                        firebase.child('balls').child(id).remove();
                        delete localBalls[id];
                        if(ball.x>.5) {
                            lobbyEntry.child('score/0').set((score[0]?score[0]:0)+1);
                            lobbyEntry.child('lastWinner').set(0);
                        }
                        else if(ball.x<.5) {
                            lobbyEntry.child('score/1').set((score[1]?score[1]:0)+1);
                            lobbyEntry.child('lastWinner').set(1);
                        }
                        continue;
                    }
                }
            }
            if(ball.y<0.02 && ball.dy<0 || ball.y>0.98 && ball.dy>0) {
                ball.dy=-ball.dy;
            }
            ctx.moveTo(ball.x*canvas.width+canvas.width/100,ball.y*canvas.height);
            ctx.arc(
                ball.x*canvas.width,
                ball.y*canvas.height,
                canvas.width/100,0,Math.PI*2);
        }
        ctx.fill();
    }
    
    var FPS = 100;
    var FRAME_PERIOD = 1000/FPS;
    var lastFrame = 0;
    function step(timestamp) {
        now = timestamp;
        if(now-lastFrame>FRAME_PERIOD) {
            refresh(now-lastFrame);
            lastFrame = now;
        }
        requestAnimationFrame(step);
    }

    step(0);
    document.addEventListener("mousemove",mouseMove);
    
}


