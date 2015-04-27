function processAsset(asset,context,x,y,scale) {
    for(var frame=0;frame<asset.length;frame++) {
        var image = asset[frame];
        if(image) {
            for(var i=0;i<image.commands.length;i++) {
                processCommand(image.commands[i],context,x,y,scale);
            }
        }
    }
}

function processCommand(command,context,x,y,scale) {
    console.log(command);
    if(command[0]=="set") {
        context[command[1]] = command[1]=="lineWidth"?command[2]*scale:command[2];
    }
    else {
        var params = command.slice(1);
        if(params.length) {
            params[0] = x+params[0]*scale;
            params[1] = y+params[1]*scale;
            if(params.length>1) {
                params[2] = x+params[2]*scale;
                params[3] = y+params[3]*scale;
            }
        }
        context[command[0]].apply(context,params);
    }
}

function test() {
    var ctx=canvas.getContext("2d");
    var img = document.createElement('IMG');
    img.onload = function() {
        ctx.save();
        processAsset(slimeAsset,ctx,500,500,.3);
        ctx.clip();
        ctx.drawImage(img, 500-100, 500-100);
        ctx.restore();
    }
    img.src = "http://i.imgur.com/gwlPu.jpg";
}