gNOT_ACTIVE = -10000;
// TODO: touches don't adjust position when range is set via osc
Control.MultiTouchXY = function(ctx, props) {
    this.make(ctx, props);
    this.xvalue = this.min;
    this.yvalue = this.min;
    this.zvalue = false;
    this.sendZValue = (typeof props.sendZValue == "undefined") ? false : props.sendZValue;
    this.half = (this.width / 8) / 2;
    this.maxTouches = props.maxTouches > 0 ? props.maxTouches : 1;
    this.children = [];
    this.valuesX = [];
    this.valuesY = [];
    this.isMomentary = (typeof props.isMomentary == "undefined") ? true : props.isMomentary;
    this.lastTouched = null;

    this.container = document.createElement('div');
    $(this.container).addClass('widget multiTouchXY');

    this.container.style.position = "absolute";
    this.container.style.display = "block";
    this.container.style.width = this.width - 2 + "px";
    this.container.style.height = this.height - 2 + "px";
    this.container.style.top = this.y + "px";
    this.container.style.left = this.x + "px";
    this.container.style.backgroundColor = this.backgroundColor;
    this.ctx.appendChild(this.container);

    this.touchCount = 0;
    this.container.style.border = "1px solid " + this.strokeColor;

    //this.touchColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#80FF00', '#8000FF', '#0080FF', '#FF8080'];
    return this;
}

Control.MultiTouchXY.prototype = new Widget();


Control.MultiTouchXY.prototype.init = function() {
    if(!this.isMomentary) {
        for(var i = 0; i < this.maxTouches; i++) {
            this.addTouch(0, 0, i);
        }
    }
}

Control.MultiTouchXY.prototype.addTouch = function(xPos, yPos, id) {
    var touch = document.createElement('div');
    $(touch).addClass('widget touch');
    
	var size = (this.width / 8) +"px";
	$(touch).css({
	    "display" 	: "block",
	    "position" 	: "absolute",
	    "border" 	: this.strokeColor + " solid 1px",
	    "width" 	: size,
	    "height" 	: size,
	    "text-align" 	: "center",
	    "line-height" 	: size,  
	    "vertical-align" : "center",
	    "left" 	: 0 + "px",
	    "top"  	: 0 + "px",
	    "color" : this.strokeColor,
	    "background-color" : this.fillColor,
	    "text-shadow" : "none",
		"-webkit-transform-origin-x": 0 + "px",
		"-webkit-transform-origin-y": 0 + "px",		 
	});
	
    touch.id = (this.isMomentary) ? id : gNOT_ACTIVE;
    touch.childID = touch.id;
    touch.isActive = (this.isMomentary);
	
    if(!this.isMomentary) {
        touch.activeNumber = id + 1;
    }
    
    this.children.push(touch);
    touch.activeNumber = this.children.length;
    $(touch).text(touch.activeNumber);    
    this.container.appendChild(touch);
    this.changeValue(touch, xPos, yPos, 1);
}

Control.MultiTouchXY.prototype.removeTouch = function(touchToRemove) {
    for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i];
        if(touchToRemove.id == touch.id) {
            this.container.removeChild(touch);
            this.children.splice(i,1);
            break;
        }
    }
}
    
Control.MultiTouchXY.prototype.trackTouch = function(xPos, yPos, id) {
    var closestDiff = 10000;
    var touchFound = null;
    var touchNum = null;
    for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i];
        var xdiff = Math.abs((xPos - this.x) - (parseInt(touch.style.left) + (parseInt(touch.style.width)  / 2)));
        var ydiff = Math.abs((yPos - this.y) - (parseInt(touch.style.top)  + (parseInt(touch.style.height) / 2)));
        if(!touch.isActive) {
            if(xdiff + ydiff < closestDiff) {
                closestDiff = xdiff + ydiff;
                touchFound = touch;
                touchNum = i;
            }
        }
    }
    touchFound.id = id;
    touchFound.isActive = true;
    if(touchFound != null)
        this.changeValue(touchFound, xPos, yPos, 1);
    
    this.lastTouched = touchFound;
}

Control.MultiTouchXY.prototype.touchstart = function (touch) {
    if(this.hitTest(touch.pageX, touch.pageY)) {
        if(this.isMomentary) 
            this.addTouch(touch.pageX , touch.pageY , touch.identifier);
        else
            this.trackTouch(touch.pageX, touch.pageY , touch.identifier);
        
		if(this.ontouchstart != null){            
			if(typeof this.ontouchstart === "string") {
		        eval(this.ontouchstart);
			}else{
				this.ontouchstart();
			}
        }
    }
}

Control.MultiTouchXY.prototype.touchmove = function (touch) {
    for(var t = 0; t < this.children.length; t++) {
        _t = this.children[t];
        if(touch.identifier == _t.id) {
            this.changeValue(_t, touch.pageX, touch.pageY, 1);
			
			if(this.ontouchmove != null){            
				if(typeof this.ontouchmove === "string") {
			        eval(this.ontouchmove);
				}else{
					this.ontouchmove();
				}
	        }
        }
    }
}

Control.MultiTouchXY.prototype.touchend = function (touch) {
    for(var t = 0; t < this.children.length; t++) {
        _t = this.children[t];
        if(touch.identifier == _t.id) {
            this.endingTouchID = touch.activeNumber;
			if(this.sendZValue){
                this.changeValue(_t, touch.pageX, touch.pageY, 0);
            }
			if(this.ontouchend != null){            
				if(typeof this.ontouchend === "string") {
			        eval(this.ontouchend);
				}else{
					this.ontouchend();
				}
	        }

            if(this.isMomentary) {
                this.removeTouch(_t);
            }else{
                _t.isActive = false;
                _t.id = gNOT_ACTIVE;
            }
        }
    }	
}

Control.MultiTouchXY.prototype.events = { 
	"touchstart": Control.MultiTouchXY.prototype.touchstart, 
	"touchmove" : Control.MultiTouchXY.prototype.touchmove, 
	"touchend"  : Control.MultiTouchXY.prototype.touchend,
};

Control.MultiTouchXY.prototype.event = function(event) {
    for (var j = 0; j < event.changedTouches.length; j++){
        var touch = event.changedTouches.item(j);
		
		var breakCheck = this.events[event.type].call(this, touch);
		
        if(breakCheck) break;
	}
}


Control.MultiTouchXY.prototype.changeValue = function(touch, inputX, inputY, inputZ) {

    var xLeft   = inputX - this.half;
    var xRight  = inputX + this.half - 2;
    var yTop    = inputY - this.half;
    var yBottom = inputY + this.half - 2;
    
	var xPos = "0px";
	var yPos = "0px";
    //console.log("x touch = " + inputX + " :: xLeft = " + xLeft + " :: xRight = " + xRight + " :: x = " + this.x + " :: width = " + this.width);

    // adjust x?
    if(xLeft > this.x && xRight < this.x + this.width) {
        inputX -= this.half;
        xPos = inputX + "px";
    }else{
        if(xLeft < this.x) {
            xPos = "0px";
            inputX = 0;
        } else {
            xPos = this.width - (this.half * 2) - 4 + "px";
            inputX = (this.x + this.width) - this.half * 2;
        }
    }
    
    // adjust y?
    if(yTop > this.y && yBottom < this.y + this.height) {
        inputY -= this.half;
        yPos = (inputY - this.y) + "px";
    }else{
        if(yBottom < this.y + this.height) {
            yPos = "0px";
            inputY = 0;
        }else{
            yPos = this.height - (this.half * 2) - 4 + "px";
            inputY = this.height - this.half * 2;
        }
    }
    
	
    touch.xpercentage = (inputX - (this.x )) / (this.width);
    touch.ypercentage = (inputY - (this.y )) / (this.height);
	
	touch.style.webkitTransform = "translate3d("+ (touch.xpercentage * (this.width - 4)) + "px," + (touch.ypercentage * (this.height - 4)) + "px, 0)";
	
    
    if(touch.xpercentage < 0) touch.xpercentage = 0; // needed to account for the - this.half * 2 above TODO: NOT PRECISE ON EDGES, SHOULD FIX
    if(touch.ypercentage < 0) touch.ypercentage = 0;
    
    var range = this.max - this.min;
    
    if(Control.protocol != "MIDI") {
        this.xvalue = this.min + (touch.xpercentage * range);
        this.yvalue = this.min + (touch.ypercentage * range);
    }else{
        this.xvalue = Math.round(this.min + (touch.xpercentage * range));
        this.yvalue = Math.round(this.min + (touch.ypercentage * range));
    }
    this.zvalue = inputZ;
    
	if(this.onvaluechange != null){            
		if(typeof this.onvaluechange === "string") {
	        eval(this.onvaluechange);
		}else{
			this.onvaluechange();
		}
    }
    
    if(!this.isLocal) this.output(touch);
}

Control.MultiTouchXY.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1];
    this.strokeColor = newColors[2];
    
    this.container.style.backgroundColor = this.backgroundColor;
    
    for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i];
        touch.style.color = this.strokeColor;
        touch.style.backgroundColor = this.fillColor;
        touch.style.border = this.strokeColor + " solid 1px";
    }
}

Control.MultiTouchXY.prototype.setBounds = function(newBounds) {
    this.width = Math.round(newBounds[2] * Control.deviceWidth);
    this.height = Math.round(newBounds[3] * Control.deviceHeight);
    this.x = Math.round(newBounds[0] * Control.deviceWidth);
    this.y = Math.round(newBounds[1] * Control.deviceHeight);
    
    this.container.style.width  = this.width - 2 + "px";
    this.container.style.height = this.height - 2 + "px";
    this.container.style.left = this.x  + "px";
    this.container.style.top  = this.y  + "px";
    
    if(typeof this.label != "undefined") {
        this.label.setBounds(newBounds);
    }
}

//    this.setRange = function(min, max) {
//        this.min = min;
//        this.max = max;
//        
//        for(var i = 0; i < this.maxTouches; i++) {
//            var touch = this.children[i];
//            touch.style.left = ( touch.xpercentage * parseInt(this.container.style.width ) ) + "px";
//            touch.style.top  = ( touch.ypercentage * parseInt(this.container.style.height) ) + "px";
//        }
//
//    }
Control.MultiTouchXY.prototype.output = function(touch) {
    var valueString = "";
    if(Control.protocol == "OSC") {
        valueString = "|" + this.address;
        if (this.maxTouches > 1) {
          valueString += "/" + touch.activeNumber;
        }
        valueString += ":" + this.xvalue + "," + this.yvalue;

        if(this.sendZValue){
            valueString += ","+this.zvalue;	
        }
    }else if(_protocol == "MIDI") {
        var xnum = this.midiNumber + (touch.activeNumber * 2) - 2;
        var ynum = xnum + 1;
            
        valueString  = "|" + this.midiType + "," + (this.channel - 1) + "," + xnum + "," + Math.round(this.xvalue);
        valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + ynum + "," + Math.round(this.yvalue);
    }
    Control.valuesString += valueString;

}

Control.MultiTouchXY.prototype.show = function() {
    this.container.style.display = "block";
    if(!this.isMomentary) {
        for(var i = 0; i < this.maxTouches; i++) {
            var d = this.children[i];
            d.style.display = "block";
        }
    }
}

Control.MultiTouchXY.prototype.hide = function() {
    this.container.style.display = "none";
    if(!this.isMomentary) {		
        for(var i = 0; i < this.maxTouches; i++) {
            var d = this.children[i];
            d.style.display = "none";
        }
    }
}

Control.MultiTouchXY.prototype.setValue = function(touchNumber, xValue, yValue) {
    var xPercentageOfRange = (xValue - (this.min )) / (this.max - this.min);
    var yPercentageOfRange = (yValue - (this.min )) / (this.max - this.min);
    
    var touch = this.children[touchNumber - 1];
    touch.style.left = ( xPercentageOfRange * parseInt(this.container.style.width ) ) + "px";
    touch.style.top  = ( yPercentageOfRange * parseInt(this.container.style.height) ) + "px";
}

Control.MultiTouchXY.prototype.draw = function() {}

Control.MultiTouchXY.prototype.unload = function() {
    this.ctx.removeChild(this.container);
}