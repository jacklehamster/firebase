function Sprite(json) {
    
    if(!Sprite.initialized) {
        Sprite.initialized = true;
        Sprite.registry = [];
        
        var now = 0;
        var FPS = 30;
        var FRAME_PERIOD = 1000/FPS;
        var lastFrame = 0;
        function step(timestamp) {
            now = timestamp;
            Sprite.now = now;
            if(now-lastFrame>FRAME_PERIOD && Sprite.refresh) {
                Sprite.refresh(now-lastFrame);
                lastFrame = now;
            }
            requestAnimationFrame(step);
        }
        step(0);
        
        function setDirection(direction) {
            this.direction = direction;
            this.div.style.transform = "scale("+(direction*.5)+",.5)";
            setFrame.call(this,this.frame,this.playing);
        }
        
        function setPosition(x,y) {
            this.div.style.left = x+"px";
            this.div.style.top = y+"px";
        }
        
        function getPosition() {
            return {x:this.div.offsetLeft,y:this.div.offsetTop};
        }
        
        function gotoAndPlay(frameOrLabel,callback) {
            this.animationCallback = callback;
            setFrame.call(this,frameOrLabel,true);
        }
        
        function gotoAndStop(frameOrLabel) {
            this.animationCallback = function() {};
            setFrame.call(this,frameOrLabel,false);
        }
        
        function setFrame(frameOrLabel,play) {
            this.playing = play;
            this.frame = typeof(frameOrLabel)=='number' ? frameOrLabel : this.labels[frameOrLabel];
            var entry = json.frames[this.frame-1];
            var clip = entry.frame;
            this.div.style.transformOrigin = (this.direction*(entry.spriteSourceSize.x-160))+"px "+entry.spriteSourceSize.y+"px";
            this.div.style.width = clip.w + "px";
            this.div.style.height = clip.h + "px";
            this.div.style.backgroundPosition = -clip.x + "px " + -clip.y + "px";
            this.currentLabel = this.frame2label[this.frame];
        }
        
        function next() {
            this.refresh();
            if(this.playing) 
            {
                var currentLabel = this.frame2label[this.frame];
                var nextFrame = 1+(this.frame % this.json.frames.length);
                var endedFrame = false;
                if(this.frame2label[nextFrame] != currentLabel) {
                    nextFrame = currentLabel;
                    endedFrame = true;
                }
                setFrame.call(this,nextFrame,true);
                if(endedFrame && this.animationCallback) {
                    var callback = this.animationCallback;
                    this.animationCallback = null;
                    callback.call(this);
                }
                this.currentLabel = this.frame2label[this.frame];
            }
        }
        Sprite.prototype.gotoAndStop = gotoAndStop;
        Sprite.prototype.gotoAndPlay = gotoAndPlay;
        Sprite.prototype.next = next;
        Sprite.prototype.setPosition = setPosition;
        Sprite.prototype.getPosition = getPosition;
        Sprite.prototype.setDirection = setDirection;
    }

    Sprite.registry.push(this);
    

    this.direction = 1;
    this.currentLabel = null;
    this.refresh = function() {};
    this.animationCallback = function() {};
    
    this.json = json;
    this.frame = 0;
    
    this.frame2label = [];
    this.labels = {};
    var previousLabel = null;
    for(var i=0;i<json.frames.length;i++) {
        var label = json.frames[i].label;
        if(label) {
            this.labels[label] = i+1;
            this.frame2label[i+1] = label;
            previousLabel = label;
        }
        else {
            this.frame2label[i+1] = previousLabel;
        }
    }
    
    var div = document.createElement("div");
    div.className = json.meta.className;
    div.style.backgroundImage = "url("+json.meta.image+")";
    this.div = div;
    this.gotoAndStop(1);
}

