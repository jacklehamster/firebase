function Fido() {
    var fido = new Sprite(fidoAnimation);
    var self = fido;
    
    var bored = 100;
    
    fido.setPosition(document.body.offsetWidth/2,document.body.offsetHeight/2);
    
    fido.div.style.visibility = 'hidden';
    fidoBase.child("lastMeal").once('value',
        function(snapshot) {
            self.lastMeal = snapshot.val();
            self.refresh();
            self.div.style.visibility = '';
        }
    );
    
    fido.hunger = function() {
        var sinceLastMeal = !this.lastMeal?0 : getTime() - this.lastMeal;
        var seconds = sinceLastMeal/1000;
        var hours = seconds/60/60;
        return seconds && seconds<8?-1:hours<10?0:hours<15?1:hours<24?2:3;
    }
    
    function hasFood() {
        return document.getElementsByClassName("Meal").length>0;
    }
    
    fido.refresh = function() {
        bored --;
        var hunger = this.hunger();
        if(hunger==3) {
            if(this.currentLabel!="DEAD")
                this.gotoAndPlay("DEAD")
        }
        else if(this.goal) {
            var pos = this.getPosition();
            this.setDirection(this.goal.x<pos.x?1:-1);
            if(this.currentLabel=="MOVE") {
                this.setPosition(pos.x,pos.y + (this.goal.y-pos.y)/10);
            }
        }
        else if((this.currentLabel!="EAT" && this.currentLabel!="EATING") && hasFood() && hunger>=0) {
            var meal = document.getElementsByClassName("Meal")[0];
            if(meal) {
                this.gotoAndEat(meal.offsetLeft,meal.offsetTop,meal);
            }
        }
        else if((this.currentLabel=="STILL"||this.currentLabel=="STARE"||this.currentLabel=="HUNGRY"||this.currentLabel=="STARVING") && Math.random()<.05) {
            this.setDirection(Math.random()<.5?-1:1);
            this.gotoAndPlay(hunger==1?"HUNGRYBLINK":hunger==2?"STARVINGBLINK":"BLINK",
                function() {
                    this.gotoAndPlay(hunger==1?"HUNGRY":hunger==2?"STARVING":Math.random()<.5?"STILL":"STARE");
                }
            );
        }
        else if((this.currentLabel!="EAT" && this.currentLabel!="EATING") && bored<0 && hunger<=1) {
            this.gotoAndWalk(
                Math.random()*document.body.offsetWidth,
                Math.random()*document.body.offsetHeight);
            bored = (hunger==1?1000:200)*Math.random();
        }
    }
    
    self.gotoAndWalk = function(x,y) {
        self.goal = {x:x,y:y-80};
        if(self.direction<0) {
            var pos = self.getPosition();
            self.setPosition(pos.x-15,pos.y);
        }

        var callback = function() {
            var pos = this.getPosition();
            this.setPosition(pos.x+(this.direction>0?-80:150),pos.y);
            if(Math.abs(pos.y-this.goal.y)<50 && (this.direction>0 && Math.abs(pos.x-this.goal.x)<100 
               || this.direction<0 && Math.abs(pos.x+150-this.goal.x)<100)) {
                self.goal = null;
                var hunger = this.hunger();
                this.gotoAndPlay(hunger==1?"HUNGRY":hunger==2?"STARVING":Math.random()<.5?"STILL":"STARE");
            }
            else {
                this.animationCallback = callback;
            }
        }

        self.gotoAndPlay("MOVE",callback);
    }
    
    self.gotoAndEat = function(x,y,div) {
        self.goal = {x:x,y:y-80};
        if(self.direction<0) {
            var pos = self.getPosition();
            self.setPosition(pos.x-15,pos.y);
        }

        var callback = function() {
            var pos = this.getPosition();
            this.setPosition(pos.x+(this.direction>0?-80:150),pos.y);
            if(Math.abs(pos.y-this.goal.y)<50 && (this.direction>0 && Math.abs(pos.x-this.goal.x)<100 
               || this.direction<0 && Math.abs(pos.x+150-this.goal.x)<100)) {
                self.goal = null;
                var time = Sprite.now;
                if(div && div.parentNode) {
                    this.gotoAndPlay("EAT",
                        function() {
                            this.lastMeal = getTime();
                            fidoBase.child("lastMeal").set(Firebase.ServerValue.TIMESTAMP);
//                            console.log("Last meal:",this.lastMeal);
                            var split = div.name.split(".");
                            split.pop();
                        
                            if(!eaten[div.id]) {
                                var msg = 'FIDO ate <b>'+split.join(" ")+'</b> (<img style="max-width:30px; max-height:20px" src="'+div.src+'">) at <b> '+new Date(this.lastMeal).toLocaleTimeString()+"</b>";
                                var msg = 'FIDO ate <b>'+split.join(" ")+'</b> at <b> '+new Date(this.lastMeal).toLocaleTimeString()+"</b>";

                                fidoChat.push(msg);
                            }
                        
                            div.parentNode.removeChild(div);
                            foodBase.child(div.id).remove();
                            delete eaten[div.id];
                            div = null;

                            var keepEating;
                            this.gotoAndPlay("EATING",
                                keepEating = function() {
                                    if(Sprite.now-time>2000) {
                                        this.gotoAndPlay("STILL");
                                    }
                                    else {
                                        this.animationCallback = keepEating;
                                    }
                                }
                            );
                        }
                    );
                }
                else {
                    var hunger = this.hunger();
                    this.gotoAndPlay(hunger==1?"HUNGRY":hunger==2?"STARVING":Math.random()<.5?"STILL":"STARE");
                }
            }
            else {
                this.animationCallback = callback;
            }
        }

        self.gotoAndPlay("MOVE",callback);
    }
    
    self.lastMeal = 0;
    
    return fido;
}