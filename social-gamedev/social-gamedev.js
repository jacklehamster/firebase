var firebase = new Firebase('https://art-depot.firebaseio.com/artdepot/');
var firebaseMap = new Firebase("https://art-depot.firebaseio.com/map");
var firebaseImg = new Firebase("https://art-depot.firebaseio.com/images");

var editMode = true;
var action="select";
var hovered = null;
var shiftX=0,shiftY=0;
var preState = {};
var zoomScale =1, globalZoom = 1;
var isMoz = false;
var map = {};
var screenWidth, screenHeight;
var currentPos = {x:0,y:0};
var currentSelection = null;
var tempImage = createImage();
var selectedImageTemp = createImage();
var selectedImage;
var lastSelectedImage;
var mainScreen;
var penColor = [0,0,0,255];
var brushSize = 2;
var targeterCanvas;
var laserCanvas;

/**
 *    First called on load
 * */
function init(event) {
    mainScreen = document.getElementById("screen");
    screenWidth = (window.innerWidth);
    screenHeight = (window.innerHeight);
    isMoz = typeof(document.body.style.MozTransform)!='undefined';
    changeBrushSize(brushSize);
    
    /**
     *    Register all mouse events
     * */
    document.addEventListener("mousemove",mouseAction);
    document.addEventListener("mousedown",mouseAction);
    document.addEventListener("mouseup",mouseAction);
    document.addEventListener("mouseout",mouseAction);
    document.addEventListener("mouseover",mouseAction);
    
    initToolbar();
//    debugTest();
    
    firebaseMap.on("child_added",
        function(snapshot) {
            var o = snapshot.val();
            var keySplit = snapshot.key().split("_");
//            console.log(o);
 //           console.log(keySplit);
            var x = parseInt(keySplit[0]), y = parseInt(keySplit[1]);
            var img = document.getElementById(o.id);
            if(!img) {
                var img = createImage();
                img.id = o.id;
                img.path = o.path;
                img.pos = {x:x,y:y};
                ensureImage(img,true,true);
                mainScreen.appendChild(img);
                updateScreen();
            }
            else if(img.pos.x!=x || img.pos.y!=y) {
                img.pos.x = x;
                img.pos.y = y;
                updateScreen();
            }
//            attachFirebase (img,"https://dynamic-image.firebaseio.com/images/0412c1fbf317/83c697327b6e/3d5d0d62/src");
//    mainScreen.appendChild(img);
//    window.dok = img;
//            console.log(snapshot.ref().toString(),"\n",snapshot.val());
        }
    );
}

function initToolbar() {
   refreshTip(true);
   updateToolbar();
   document.getElementById("select").src = "arrow.png";
   document.getElementById("zoom").src = zoomDataURI;
   document.getElementById("hand").src = handDataURI;
   document.getElementById("pencil").src = pencilDataURI;
   document.getElementById("eraser").src = eraserDataURI;
   document.getElementById("palette").src = paletteDataURI;
   document.getElementById("colorpalette").src = paletteColorURI;
   document.getElementById("copy").src = copyDataURI;
   document.getElementById("upload").src = uploadDataURI;
   document.getElementById("laser").src = laserDataURI;
   document.getElementById("options").src = optionsDataURI;
   
   document.getElementById("select").addEventListener("mousedown",onToolbar);
   document.getElementById("zoom").addEventListener("mousedown",onToolbar);
   document.getElementById("hand").addEventListener("mousedown",onToolbar);
   document.getElementById("pencil").addEventListener("mousedown",onToolbar);
   document.getElementById("eraser").addEventListener("mousedown",onToolbar);
   document.getElementById("palette").addEventListener("mousedown",onToolbar);
   document.getElementById("copy").addEventListener("mousedown",onToolbar);
   document.getElementById("upload").addEventListener("mousedown",onToolbar);
   document.getElementById("laser").addEventListener("mousedown",onToolbar);
   document.getElementById("options").addEventListener("mousedown",onToolbar);
    
   document.getElementById("select").addEventListener("mouseover",onTip);
   document.getElementById("zoom").addEventListener("mouseover",onTip);
   document.getElementById("hand").addEventListener("mouseover",onTip);
   document.getElementById("pencil").addEventListener("mouseover",onTip);
   document.getElementById("eraser").addEventListener("mouseover",onTip);
   document.getElementById("palette").addEventListener("mouseover",onTip);
   document.getElementById("copy").addEventListener("mouseover",onTip);
   document.getElementById("upload").addEventListener("mouseover",onTip);
   document.getElementById("laser").addEventListener("mouseover",onTip);
   document.getElementById("options").addEventListener("mouseover",onTip);
    
   document.getElementById("select").addEventListener("mouseout",onTip);
   document.getElementById("zoom").addEventListener("mouseout",onTip);
   document.getElementById("hand").addEventListener("mouseout",onTip);
   document.getElementById("pencil").addEventListener("mouseout",onTip);
   document.getElementById("eraser").addEventListener("mouseout",onTip);
   document.getElementById("palette").addEventListener("mouseout",onTip);
   document.getElementById("copy").addEventListener("mouseout",onTip);
   document.getElementById("upload").addEventListener("mouseout",onTip);
   document.getElementById("laser").addEventListener("mouseout",onTip);
   document.getElementById("options").addEventListener("mouseout",onTip);
    
   document.getElementById("colorpalette").addEventListener("mousemove",onColorPalette);
   document.getElementById("colorpalette").addEventListener("mousedown",onColorPalette);
   document.getElementById("colorpalette").addEventListener("mouseout",leavePalette);
   document.getElementById("colorpalette").addEventListener("mouseup",leavePalette);
    
   document.getElementById("brushsizemeter").addEventListener("mousemove",onBrushsizeMeter);
   document.getElementById("brushsizemeter").addEventListener("mousedown",onBrushsizeMeter);
   document.getElementById("knob").addEventListener("mousemove",onBrushsizeMeter);
   document.getElementById("knob").addEventListener("mousedown",onBrushsizeMeter);
   
   document.addEventListener("mouseleave",leaveScene);
   document.addEventListener("mouseout",leaveScene);
}

/**
 *    Hide the hovering hilight when leaving the window
 * */
function leaveScene() {
    updateScreen({leaveScene:true});
}

/**
 *    Refresh the toolbar to reflect the selected tool
 * */
function updateToolbar(hideTip) {
    //selectedCanvas
    var noSelection = selectedImage!=null || currentSelection==null;
    updateToolbarItem(document.getElementById("select"),action=="select",hovered=="select");
    updateToolbarItem(document.getElementById("hand"),action=="hand",hovered=="hand");
    updateToolbarItem(document.getElementById("pencil"),action=="pencil",hovered=="pencil",noSelection);
    updateToolbarItem(document.getElementById("eraser"),action=="eraser",hovered=="eraser",noSelection);
    updateToolbarItem(document.getElementById("zoom"),action=="zoom",hovered=="zoom");
    updateToolbarItem(document.getElementById("palette"),action=="palette",hovered=="palette",noSelection);
    updateToolbarItem(document.getElementById("copy"),action=="copy",hovered=="copy",noSelection || !lastSelectedImage || !lastSelectedImage.id);
    updateToolbarItem(document.getElementById("upload"),false,hovered=="upload",noSelection);
    updateToolbarItem(document.getElementById("laser"),action=="laser",hovered=="laser");
    document.getElementById("colorpalette").style.display = action=="palette"?"":"none";
    refreshTip(hideTip);
    
    var canvases = document.getElementsByTagName("canvas");
    for(var i=0;i<canvases.length;i++) {
        canvases[i].style.cursor = action=="pencil"?"":"pointer";
    }
}

function performUpload() {
//    <input type='file'  id="theFile" onchange="readURL(this);" style="visibility:hidden" />
    var uploader = document.getElementById("uploader");
    if(!uploader) {
        uploader = document.createElement("input");
        uploader.type = "file";
        uploader.id = "uploader";
        uploader.addEventListener("change",readURL);
        uploader.style.visibility = "hidden";
        document.body.appendChild(uploader);
    }
   if(uploader && document.createEvent) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      uploader.dispatchEvent(evt);
   }    
}

/**
 * readURL - reads the bytes from the uploaded image, and send to Firebase
 * */
function readURL(event) {
    var input = event.currentTarget;
   if (input.files && input.files[0]) {
       var reader = new FileReader();
       reader.onload = function (e) {
         var src = e.target.result; // src id a data-uri
         if(lastSelectedImage) {
             if(lastSelectedImage.path) {
                var firebaseSrc = firebaseImg.child(lastSelectedImage.path).child("src");
                firebaseSrc.set(src);
             }
             else {
                 lastSelectedImage.src = src;
                 ensureImage(lastSelectedImage);
             }
         }

//         lastSelectedImage.src = src;
         
         
       };
       reader.readAsDataURL(input.files[0]);
   }
}

function applyOptions() {
    document.getElementById("tools").style.visibility = editMode?"":"hidden";
    document.getElementById("tooltips").style.visibility = editMode?"":"hidden";
    updateScreen();
}

/**
 *    Selected a tool on the toolbar
 * */
function onToolbar(event) {
    if(!event.target.disabled) {
        var newAction = event.target.id;
        switch(newAction) {
            case "options":
                editMode = !editMode;
                applyOptions();
                break;
            case "upload":
                performUpload();
                break;
            default:
                setAction(event.target.id);
        }
        event.preventDefault();
    }
}

/**
 *    Refresh a toolbar item to reflect the selected tool
 * */
function updateToolbarItem(element,selected,hovered,disabled) {
    var padding = 11;
    element.style.borderColor = selected?"blue":hovered?"#CCFFFF":"silver";
    element.style.width = element.style.height = selected ? "50px":(50-padding*2)+"px";
    element.style.padding = selected ? "0px" : padding+"px";
    setEnabled(element,!disabled);
}

function setEnabled(element,value) {
    var alpha = value?1:.1;
    element.style.filter       = "alpha(opacity="+(alpha*100)+");";
    element.style.MozOpacity   = alpha;
    element.style.opacity      = alpha;
    element.style.KhtmlOpacity = alpha;
    element.disabled = !value;
}

function setAlpha(element,alpha) {
    element.style.filter       = "alpha(opacity="+(alpha*100)+");";
    element.style.MozOpacity   = alpha;
    element.style.opacity      = alpha;
    element.style.KhtmlOpacity = alpha;
}

/**
 *    Selected a tool on the toolbar
 * */
function setAction(value) {
    if(action!=value) {
        var canvases = document.getElementsByTagName("canvas");
        
        if(action=="palette") {
            for(var i=0;i<canvases.length;i++) {
                canvases[i].removeEventListener("mouseup",pickColor);
                canvases[i].removeEventListener("mousemove",pickColor);
            }
        }
        
        if(action=="laser" && targeterCanvas) {
            targeterCanvas.style.display = "none";
        }
        
        action = value;
        
        if(action!="select" && action!="copy" && tempImage.parentElement==mainScreen) {
            mainScreen.removeChild(tempImage);
        }
        if(action=="select") {
            tempImage.src = blankDataURI;
            delete tempImage.path;
        }
        else if(action=="copy") {
            tempImage.src = lastSelectedImage.src;
            tempImage.path = lastSelectedImage.path;
        }
        
        updateToolbar();
        
        if(action=="palette") {
            for(var i=0;i<canvases.length;i++) {
                canvases[i].addEventListener("mouseup",pickColor);
                canvases[i].addEventListener("mousemove",pickColor);
            }
        }
        
        updateScreen();
    }
}

/**
 *    Events when hovering over or out of tools with tip
 * */
function onTip(event) {
    hovered = event.type=="mouseout" || event.target.disabled?null:event.target.id;
    updateToolbar(event.type=="mouseout" || event.target.id!=action);
    updateScreen({leaveScene:event.type!="mouseout" });
}

/**
 *    Refresh tip / toolbar options
 * */
function refreshTip(hide) {
    document.getElementById("selecttip").style.display = !hide && action=="select"?"":"none";
    document.getElementById("movetip").style.display = !hide && action=="hand"?"":"none";
    document.getElementById("zoomtip").style.display = !hide && action=="zoom"?"":"none";
    document.getElementById("drawtip").style.display = action=="pencil"||action=="eraser"?"":"none";    
    document.getElementById("copytip").style.display = action=="copy"?"":"none";    
    document.getElementById("lasertip").style.display = action=="laser"?"":"none";    
}

/**
 *    Event when we move over the color palette
 * */
function onColorPalette(event) {
    var ispen = event.type!="mouseout" && event.type!="mouseup" && (event.buttons!==undefined?event.buttons:event.which);
    
    if(action=="palette") {
        var image = document.getElementById("colorpalette");
        var pendingPenColor = getPixel(image,event.pageX-image.x,event.pageY-image.y,true);
        if(ispen) {
            penColor = pendingPenColor;
        }
        changeColor(document.getElementById("pencil"),pendingPenColor);
        event.preventDefault();
    }
}
/**
 *    Event when we move over the color palette
 * */
function leavePalette(event) {
    changeColor(document.getElementById("pencil"),penColor);
    if(event.type=="mouseup") {
        closePalette();
    }
   event.preventDefault();
}

/**
 *    Close palette
 * */
function closePalette() {
    setAction("pencil");
    updateToolbar();
}

/**
 *    Event when we click or drag the brushsize meter
 * */
function onBrushsizeMeter(event) {
  var brushSizeMeter = document.getElementById("brushsizemeter");
  var ispen = (event.buttons!==undefined?event.buttons:event.which);
  if(ispen) {   
      changeBrushSize(Math.round(30*(event.pageX-brushSizeMeter.x)/brushSizeMeter.offsetWidth));
  }
  event.preventDefault();
}

/**
 *    Change the brushsize
 * */
function changeBrushSize(value) {
    value = Math.max(1,Math.min(30,value));
    brushSize = value;
    var brushSizeCircle = document.getElementById("brushsize");
    brushSizeCircle.width = value/2;
    brushSizeCircle.height = value/2;
    brushSizeCircle.style.padding = (15-brushSizeCircle.width)/2+"px";
    var brushSizeMeter = document.getElementById("brushsizemeter");
    var knob = document.getElementById("knob");
    knob.style.left = (knob.style.posLeft = brushSizeMeter.offsetLeft + (value/2/15) * brushSizeMeter.offsetWidth)+"px";
    
}


function displayToolbar(show) {
    document.getElementById("toolbar").style.display = show?"":"none";
}

function updateScreen(options) {
    var imgs = mainScreen.children;
    map = {};
    var currentId = currentPos.x + "_" + currentPos.y;
    var selectedId = currentSelection ? currentSelection.x + "_" + currentSelection.y : null;
    if(!options) options = {};

    for(var i=0;i<imgs.length;i++) {
        var img = imgs[i];
        var tag = img.tagName.toLowerCase();
        
        if(tag=="img")
            checkFirebaseAttachment(img,true);
        
        var screenPos = convertToScreen(img.pos.x,img.pos.y);
        var scale = calculateScale(img.pos.y-shiftY);
        
        var imgWidth = tag=="canvas" && !img.img?img.width*scale:scale*(tag=="img"?img.naturalWidth:tag=="canvas"?img.img.naturalWidth:128);
        var imgHeight = tag=="canvas" && !img.img?img.height*scale:scale*(tag=="img"?img.naturalHeight:tag=="canvas"?img.img.naturalHeight:128);
        
        var pos = img.pos.x + "_" + img.pos.y;
        img.setAttribute("pos",pos);
        
        img.style.width = imgWidth+"px";
        img.style.height = imgHeight+"px";
        
        img.style.posLeft = img.style.left = (screenPos.x-imgWidth/2) +"px";
        img.style.posTop = img.style.top = (screenPos.y-imgHeight)+"px";
        
        var zIndex = Math.round(screenPos.y)*2+(img.tagName=="img"?0:1);
        if(zIndex!=img.style.zIndex) {
            img.style.zIndex = zIndex;
        }
        var hovered = action=="select" && currentId==pos;
        var selected = selectedId==pos;
        
        var imgBorder = 
            !editMode || img.readonly?"":
            hovered && !options.leaveScene?"2px solid "+(img==tempImage && !selected?"pink":"red"):
            selected?"2px solid #00FF00":
            "2px solid #cccccc";
        if(img.style.border!=imgBorder) {
            img.style.border = imgBorder;
            img.style.margin = !editMode || img.readonly?"2px":"";
        }
        if(tag=="img")    
            map[pos] = img;
        if(tag=="canvas" && img.dirty) {
            delete img.dirty;
            updateCanvas(img);
        }
    }
}

function calculateScale(y) {
    return .5;
//    console.log(y);
//    return Math.pow(1.1,y)*.5;
}

/**
 *    Helper function for zoom
 * */
function changeZoom(element,value) {
    if(isMoz) {
        element.style.MozTransform="scale("+value+")";
    }
    else {
        element.style.zoom = Math.ceil(value*100)+"%";
    }
    element.zoomValue = value;
}

/**
 *    Turn a number into double digit hex
 * */
function ddHex(num) {
    return (num|256).toString(16).substr(1);
}

/**
 *    Turn an array of RGBA into hex
 * */
function hexRGBA(array) {
    return "#"+ddHex(array[0])+ddHex(array[1])+ddHex(array[2])+ddHex(array[3]);
}
/**
 *    Turn an array of RGBA into hex
 * */
function hexRGB(array) {
    return "#"+ddHex(array[0])+ddHex(array[1])+ddHex(array[2]);
}



function createImage() {
    var img = document.createElement("img");
    img.drawn = true;
    img.style.position = "absolute";
    img.pos = {x:0,y:0};
//    img.img = img;
//    img.width = 128;
//    img.height = 128;
    img.src = blankDataURI;
    img.addEventListener("mousedown",nop);
    img.addEventListener("mousemove",nop);
    return img;
}

function nop(event) {
    event.preventDefault();
}

function debugTest() {
    var img = createImage();
    img.id = "dok";
    attachFirebase (img,"https://dynamic-image.firebaseio.com/images/0412c1fbf317/83c697327b6e/3d5d0d62/src");
    mainScreen.appendChild(img);
    window.dok = img;
    
    var img = createImage();
    img.pos = {x:1,y:1};
    attachFirebase (img,"https://dynamic-image.firebaseio.com/images/0412c1fbf317/83c697327b6e/3d5d0d62/src");
    mainScreen.appendChild(img);
    updateScreen();
}



/**
 *    Callback function for drawing.
 * */
function mouseAction(event) {
  if(event.target.id=="brushsizemeter" || event.target.id=="upload") {
      return;
  }
  var ispen = event.type!="mouseout" && event.type!="mouseup" && (event.buttons!==undefined?event.buttons:event.which);
  var x = event.pageX;
  var y = event.pageY;
  mousePen(x,y,ispen,event.type,event.target,event);
    
  event.preventDefault();
}

function changedTarget() {
    var currentId = currentPos.x + "_" + currentPos.y;
    var selectedId = currentSelection ? currentSelection.x+"_"+currentSelection.y : null;
    
    if(selectedId && !map[selectedId]) {
        selectedImageTemp.pos = currentSelection;
        mainScreen.appendChild(selectedImageTemp);
        lastSelectedImage = selectedImage = selectedImageTemp;
    }
    else if((!selectedId || map[selectedId]!=selectedImageTemp) && selectedImageTemp.parentElement==mainScreen) {
        mainScreen.removeChild(selectedImageTemp);
    }
    

    if(!map[currentId]) {
        tempImage.pos = currentPos;
        mainScreen.appendChild(tempImage);
    }
    else if((map[currentId]!=tempImage) && tempImage.parentElement==mainScreen) {
        mainScreen.removeChild(tempImage);
    }
    updateToolbar(true);
}

function convertToMainScreen(x,y) {
    return {x:(x/globalZoom-mainScreen.offsetLeft/(isMoz?globalZoom:1)),y:(y/globalZoom-mainScreen.offsetTop/(isMoz?globalZoom:1))};
}

function findClosestXY(mouseX,mouseY,offsetX,offsetY) {
    var closest = null;
    var minDist = 1000000;
    for(var y=-50;y<50;y++) {
        for(var x=-50;x<50;x++) {
            var ix = Math.round(x+shiftX);
            var iy = Math.round(y+shiftY);
            var pos = convertToScreen(ix,iy);
            var scale = .5;//calculateScale(iy);
            var diffY = (pos.y+offsetY*scale - mouseY); 
            var diffX = (pos.x+offsetX*scale - mouseX);
            var dist = Math.sqrt(diffY*diffY + diffX*diffX);
            if(dist<minDist) {
                minDist = dist;
                closest = {x:ix,y:iy};
            }
        }
    }
    return closest;
}

function convertToScreen(x,y) {
    var scale = calculateScale(-shiftY+y);
    var valY = (((-shiftY + y)*32)*scale + screenHeight*5/8);
    var valX = (((-shiftX + x)*32)*scale + screenWidth/2);
    return {x:valX,y:valY};
}

/*
 *  Ensure that the image was properly recorded in Firebase
 */
function ensureImage(img,ignoreSrc,ignoreAdd) {
    if(img==selectedImageTemp) {
        selectedImageTemp = createImage();
    }
    if(img==tempImage) {
        tempImage = createImage();
    }
    if(!img.id) {
        img.id = CryptoJS.MD5(new Date()+""+Math.random())+"";
    }
    if(!img.path) {
        img.path = MD5_path(new Date()+""+Math.random());
        img.setAttribute("path",img.path);
    }
    checkFirebaseAttachment(img,ignoreSrc);
    if(!ignoreAdd)
        addImageToFirebase(img,img.pos.x,img.pos.y);
}

function checkFirebaseAttachment(img,ignoreSrc) {
    if(!img.firebase && img.path) {
        var screenPos = convertToScreen(img.pos.x,img.pos.y);
        if(screenPos.x>0 && screenPos.y>0 && screenPos.x<screenWidth && screenPos.y<screenHeight) {
            var firebaseSrc = firebaseImg.child(img.path).child("src");
            if(!ignoreSrc)
                firebaseSrc.set(img.src);
            attachFirebase (img,firebaseSrc);
        }
    }
}

function removeImageFromFirebase(x,y) {
    firebaseMap.child(x+"_"+y).remove();
}

function addImageToFirebase(img,x,y) {
    if(img.id) {
        firebaseMap.child(x+"_"+y).set({id:img.id,path:img.path});
    }
}

function moveImage(img,x,y) {
    x = Math.round(x);
    y = Math.round(y);
    var from = {x:img.pos.x,y:img.pos.y};
    delete map[img.pos.x+"_"+img.pos.y];
    removeImageFromFirebase(from.x,from.y);
    img.pos.x = x;
    img.pos.y = y;
    map[x+"_"+y] = img;
    addImageToFirebase(img,x,y);
    img.dispatchEvent(new CustomEvent('move',{detail:{from:from,to:{x:x,y:y}}}));
}

function showTargeter(x,y) {
    if(!targeterCanvas) {
        targeterCanvas = document.createElement("canvas");
        targeterCanvas.width = screenWidth;
        targeterCanvas.height = screenHeight;
        targeterCanvas.style.position = "absolute";
        targeterCanvas.style.pointerEvents = "none";
        document.body.appendChild(targeterCanvas);
    }
    targeterCanvas.style.display = "";
    var ctx = targeterCanvas.getContext("2d");
    ctx.clearRect(0,0,screenWidth,screenHeight);
    ctx.beginPath();
    ctx.moveTo(x-screenWidth,y);
    ctx.lineTo(x+screenWidth,y);
    ctx.moveTo(x,y-screenHeight);
    ctx.lineTo(x,y+screenHeight);
    ctx.stroke();
}

function shootLaser(x,y,target) {
    if(target.tagName.toLowerCase()=="canvas")
        target = target.img;
    if(!laserCanvas) {
        laserCanvas = document.createElement("canvas");
        laserCanvas.width = screenWidth;
        laserCanvas.height = screenHeight;
        laserCanvas.style.position = "absolute";
        laserCanvas.style.pointerEvents = "none";
        document.body.appendChild(laserCanvas);
    }
    laserCanvas.style.display = "";

    var orgPosX1 = 0;
    var orgPosX2 = screenWidth;
    var orgPosY = screenHeight;
    
    var ctx = laserCanvas.getContext("2d");
    ctx.clearRect(0,0,screenWidth,screenHeight);
    ctx.beginPath();
    ctx.moveTo(orgPosX1,orgPosY);
    ctx.lineTo(x,y);
    ctx.moveTo(orgPosX2,orgPosY);
    ctx.lineTo(x,y);
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth=3;
    ctx.stroke();
    
    var timeout = setTimeout(
        function() {
            laserCanvas.style.display = "none";
            clearTimeout(timeout);
        },100
    );
    
    if(target.parentElement==mainScreen) {
        if(!target.shot) {
            target.shot = true;
            setAlpha(target,.2);
            var timeout2 = setTimeout(
                function() {
                    delete target.shot;
                    setAlpha(target,1);
                    clearTimeout(timeout2);
                },1000
            );
        }    
        else {
            moveImage(target,target.pos.x+300*(Math.random()-.5),target.pos.y+300*(Math.random()-.5));
            updateScreen();
        }
    }
}

function mousePen(x,y,ispen,type,target,event) {
  var mainScreenPos = convertToMainScreen(x,y);
  state = {pen:ispen,stageX:x,stageY:y};
  switch(action) {
     case "laser":
         if(event.target!=document.getElementById("target")) {
             showTargeter(x,y);
             if(ispen) {
                 shootLaser(x,y,target);
             }
         }
         break;
     case "copy":   //  clone a sprite
        var closest = findClosestXY(mainScreenPos.x,mainScreenPos.y,0,-32);
        if(currentPos.x != closest.x || currentPos.y != closest.y) {
            
            if(selectedImage) {
                currentSelection = {x:closest.x,y:closest.y};
                if(!map[closest.x+"_"+closest.y]) {
                    moveImage(selectedImage,currentSelection.x,currentSelection.y);
                }
            }
            
            currentPos = closest;
            doUpdate = true;
        }
        if(type=="mouseup" && event.target!=document.getElementById("copy")) {
            var src = tempImage.src;
            var path = tempImage.path;
            ensureImage(tempImage); //  tempImage changed through ensureImage
            tempImage.src= src;
            tempImage.path = path;
        }
        if(doUpdate) {
            changedTarget();
            updateScreen();
        }
         break;
     case "select":  // select a sprite
        var closest = findClosestXY(mainScreenPos.x,mainScreenPos.y,0,-32);
        var doUpdate = false, doUpdateToolbar = false;
        if(type=="mousedown" && target!=document.getElementById("select")) {
            
            lastSelectedImage = selectedImage = map[closest.x+"_"+closest.y];
            
           if(currentSelection && currentSelection.x == closest.x && currentSelection.y == closest.y) {
                //doUpdateToolbar = currentSelection!=null;
                //currentSelection = null;
                //doUpdate = true;
            }
            else {
                doUpdateToolbar = true;
                currentSelection = {x:currentPos.x,y:currentPos.y};
                doUpdate = true;
            }
        }
        else if(type=="mouseup") {
            selectedImage = null;
        }
          
        if(currentPos.x != closest.x || currentPos.y != closest.y) {
            
            if(selectedImage) {
                currentSelection = {x:closest.x,y:closest.y};
                if(!map[closest.x+"_"+closest.y]) {
                    moveImage(selectedImage,currentSelection.x,currentSelection.y);
                }
            }
            
            currentPos = closest;
            doUpdate = true;
        }
        if(doUpdate) {
            changedTarget();
            updateScreen();
        }
        if(doUpdateToolbar) {
            updateToolbar();
        }
          
        break;
     case "eraser":     //erase
     case "pencil":  // draw
        if(currentSelection) {
            var drawnImage = map[currentSelection.x+"_"+currentSelection.y];
            if(event.target==drawnImage || drawnImage && event.target==drawnImage.canvas) {

               var localX = event.layerX/(isMoz?1:globalZoom),
                   localY = event.layerY/(isMoz?1:globalZoom);
               var percentX = localX/drawnImage.clientWidth,
                   percentY = localY/drawnImage.clientHeight;
               performDrawing(drawnImage,percentX,percentY,ispen);
            }
        }
        break;
     case "hand": // move the paper
        if(ispen||preState.pen) {
           var dx = x - preState.stageX;
           var dy = y - preState.stageY;
           shiftX -= dx/globalZoom/10;
           shiftY -= dy/globalZoom/10;
           updateScreen();
       }
       break;
    case "zoom":  // zoom
       if(ispen||preState.pen) {
           var dx = x - preState.stageX;
           var dy = y - preState.stageY;
           doZoom(dy/100);
           updateScreen();
       }
       break;
    case "palette":  // change color
/*        if(event.target && event.target.tagName.toLowerCase()=="img") {
            var img = event.target;
            var localX = event.layerX/img.clientWidth/(isMoz?1:globalZoom),
                localY = event.layerY/img.clientHeight/(isMoz?1:globalZoom);
            var pendingPenColor = getPixel(img,localX,localY,true);
            changeColor(document.getElementById("pencil"),pendingPenColor);
            if(ispen) {
                penColor = pendingPenColor;
            }
            if(type=="mouseup" && event.target!=document.getElementById("palette")) {
                closePalette();
            }
        }*/
       break;
  }
  preState = state;
}

/**
 *    Perform a zoom. zoomValue is the scale
 * */
function doZoom(zoomvalue) {
   var oldZoom = globalZoom;
   globalZoom = Math.min(10,Math.max(.2,globalZoom + zoomvalue));
   var antiZoom = 1/globalZoom;
   changeZoom(mainScreen,globalZoom);
   mainScreen.style.left = mainScreen.style.posLeft = (screenWidth/2)*(antiZoom - 1)*(isMoz?globalZoom:1)+"px";
   mainScreen.style.top = mainScreen.style.posTop = (screenHeight/2)*(antiZoom - 1)*(isMoz?globalZoom:1)+"px";
}

/**
 *    Get the pixel color of an image
 * */
function getPixel(img,x,y,arrayFormat) {
    var canvas = getCanvas(img);
    var pixelArray = canvas.getContext("2d").getImageData(x, y, 1, 1).data;
    return arrayFormat?pixelArray:"#"+ddHex(pixelArray[0])+ddHex(pixelArray[1])+ddHex(pixelArray[2]);
    //ctx.strokeStyle="#FF0000";
}

/**
 *    Change an image's colors
 * */
function changeColor(img,rgbArray) {
    if(rgbArray[3]!=0) {
        var canvas = getCanvas(img,2);
        var imageData = canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;

        for(var i=0;i<data.length;i+=4) {
            if(data[i+3]!=0) {
                data[i] = rgbArray[0];
                data[i+1] = rgbArray[1];
                data[i+2] = rgbArray[2];
                data[i+3] = rgbArray[3];
            }
        }
        canvas.getContext("2d").putImageData(imageData,0,0);
        img.src = canvas.toDataURL();
    }
}

function extendDrawing(img,xd,yd) {
    if(xd!=0) {
        //  extend horizontally
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth * 2;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img,canvas.width/4,0);
        img.src = canvas.toDataURL();
        console.log(img.src);
        updateScreen();
    }
    else if(yd<0) {
        //  extend vertically
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight*2;
        canvas.getContext("2d").drawImage(img,0,0);
        img.src = canvas.toDataURL();
        updateScreen();
    }
}

function performDrawing(img,x,y,ispen) {
    if(x<0 || y<0 || x>1 || y>1) {
/*        if(ispen && action=="pencil") {
            if(x>=0 && x<=1) {
                if(y>-.5) {
                    extendDrawing(0,-1);
                }
                else if(y-1<.5) {
                    extendDrawing(0,1);
                }
            }
            else if(y>=0 && y<=1) {
                if(x>-.5) {
                    extendDrawing(img,-1,0);
                }
                else if(x-1<.5) {
                    extendDrawing(img,1,0);
                }
            }
        }*/
        return;
    }
    if(img.tagName.toLowerCase()=="canvas")img = img.img;
    ensureImage(img);
    var canvas = getCanvasOverlay(img);
    canvas.pos = img.pos;
    if(canvas.parentElement!=mainScreen) {
        mainScreen.appendChild(canvas);
        updateScreen();
    }
    
    if(img.firebase) {
        firebase.child("overlay").child(img.firebase.path.toString()).child("strokes").push({
           x:x,
           y:y,
           pen:ispen,
           globalCompositeOperation:action=="eraser"?"destination-out":"source-over",
           penColor:hexRGB(penColor),
           brushSize:Math.max(1,Math.round(brushSize/globalZoom))
        });
    }    
}


/**
 *    Get an image's canvas copy
 * */
function getCanvasOverlay(img) {
    if(!img.canvas) {
        img.canvas = document.createElement("canvas");
        img.canvas.img = img;
        img.canvas.id = img.id + "_overlay";
        img.canvas.width = img.naturalWidth;
        img.canvas.height = img.naturalHeight;
        img.canvas.style.position = "absolute";
        img.canvas.strokes = [];
        img.style.visibility="hidden";
        updateCanvas(img.canvas);
        img.firebase.on("value",
            img.canvas.onImageFunction = function(snapshot) {
                updateCanvas(img.canvas);
            }
        );
        firebase.child("overlay").child(img.firebase.path.toString()).child("strokes").on("child_added",
            img.canvas.updateFunction = function(snapshot) {
               var o = snapshot.val();
               var commands = img.canvas.strokes;
               var hadPen = commands.length && commands[commands.length-1].pen;
               commands.push(o);
               img.pendingStrokes = true;
               img.canvas.dirty = true;
               startUpdate();
               if(!o.pen && hadPen)
                   prepareCommit(img);
            });
    }
    return img.canvas;
}

function clearCanvas(img) {
    img.canvas.strokes = [];
    firebase.child(img.firebase.path.toString()).child("strokes").remove();
}

function prepareCommit(img) {
    //  update image using canvas
    var dataURI = img.canvas.toDataURL();
    //console.log(img.canvas);
    img.firebase.set(dataURI);
    clearCanvas(img);
}

function startUpdate() {
    if(!startUpdate.timeout) {
        startUpdate.timeout = setTimeout(
            function() {
                clearTimeout(startUpdate.timeout);
                startUpdate.timeout = 0;
                updateScreen();
            },20
        );
    }
}

/**
 *    Reset the canvas at cellid with all its drawings
 * */
function updateCanvas(canvas) {
   var ctx = canvas.getContext("2d");
   var width = canvas.img.naturalWidth;
   var height = canvas.img.naturalHeight;
   ctx.clearRect(0,0,width,height);
   ctx.globalCompositeOperation = "source-over";
   ctx.drawImage(canvas.img,0,0,width,height,0,0,canvas.width,canvas.height);
   var commands = canvas.strokes;
   if(!commands.length)
        return;
   ctx.beginPath();
   ctx.lineWidth=commands[0].brushSize ? commands[0].brushSize:2;
   ctx.strokeStyle = "#000000";
   ctx.globalCompositeOperation = commands[0].globalCompositeOperation?commands[0].globalCompositeOperation:"source-over";
   ctx.moveTo(commands[0].x*width,commands[0].y*height);
   if(commands[0].penColor) {
       ctx.strokeStyle = commands[0].penColor;
   }
   for(var i=1;i<commands.length;i++) {
      var command = commands[i];
      if(command.penColor && ctx.strokeStyle != command.penColor
        || command.brushSize && ctx.lineWidth != command.brushSize
        || command.globalCompositeOperation && command.globalCompositeOperation != ctx.globalCompositeOperation) {
          ctx.stroke();
          ctx.beginPath();
          ctx.lineWidth=command.brushSize;
          ctx.strokeStyle = command.penColor;
          ctx.globalCompositeOperation = command.globalCompositeOperation;
      }
      if(commands[i-1].pen) {
        ctx.lineTo(command.x*width,command.y*height);
      }
      else {
        ctx.moveTo(command.x*width,command.y*height);
      }  
   }
   ctx.stroke();
}


/**
 *    Get an image's canvas copy
 * */
function getCanvas(img,scale) {
    if(!scale)
        scale = 1;
    if(!img.canvas) {
        img.canvas = document.createElement("canvas");
        img.canvas.id = img.id + "_canvas";
        img.canvas.width = img.clientWidth*scale;
        img.canvas.height = img.clientHeight*scale;
        img.canvas.style.position = "absolute";
        img.canvas.style.backgroundColor = "silver";
        img.canvas.getContext("2d").drawImage(img,0,0);
    }
    return img.canvas;
}

/**
 *    Pick a color using eyedrop tool on canvas
 * */
function pickColor(event) {
    var canvas = event.target;
    var pendingPenColor = canvas.getContext("2d").getImageData(
        event.layerX + parseInt(canvas.style.borderLeftWidth), 
        event.layerY + parseInt(canvas.style.borderTopWidth), 1, 1).data;
    if(event.type=="mousemove") {
        if(pendingPenColor[3]==0)
            pendingPenColor = penColor;
    }
    else if(event.type=="mouseup") {
        if(pendingPenColor[3]!=0)
            penColor = pendingPenColor;
        closePalette();
    }
    changeColor(document.getElementById("pencil"),pendingPenColor);    
    
    event.preventDefault();
    
}

function MD5_path(value) {
   var hash = CryptoJS.MD5(value)+"";
   //  the Firebase location uses MD5 to get a unique path, which depends on the value
   var loc = [hash.slice(0,12),
              hash.slice(12,24),
              hash.slice(24,36)].join("/");
    return loc;
}

window.addEventListener("resize",
    function(event) {
        screenWidth = (window.innerWidth);
        screenHeight = (window.innerHeight);
        updateScreen();
    });
