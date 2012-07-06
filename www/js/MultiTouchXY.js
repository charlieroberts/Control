gNOT_ACTIVE = -10000;
// TODO: touches don't adjust position when range is set via osc
Control.MultiTouchXY = function(ctx, props) {
    this.make(ctx, props);
    this.xvalue = this.min;
    this.yvalue = this.min;
    this.zvalue = false;
    this.sendZValue = (typeof props.sendZValue == "undefined") ? false : props.sendZValue;
    this.maxTouches = props.maxTouches > 0 ? props.maxTouches : 1;
    this.children = [];
    this.valuesX = [];
    this.valuesY = [];
    this.isMomentary = (typeof props.isMomentary == "undefined") ? true : props.isMomentary;
    this.lastTouched = null;
    this.touchSize = props.touchSize || (this.width / 6);
    this.half = parseInt(this.touchSize) / 2;
    this.container = document.createElement('div');
	this.rainbow = (typeof props.rainbow == "undefined") ? true : props.rainbow;
	this.sendPressure = true;
	this.pressureMin = 6.0;
	this.pressureMax = 13.0;
	this.pressureRange = this.pressureMax - this.pressureMin;
    $(this.container).addClass('widget multiTouchXY');
	
	$(this.container).css({
		position: "absolute",
		display: "block",
		width: this.width - 2,
		height: this.height - 2,
		top: this.y,
		left: this.x,
		backgroundColor : this.backgroundColor,
		overflow: "hidden",
	});

    this.ctx.appendChild(this.container);
    
    this.events = { 
        "touchstart": Control.MultiTouchXY.prototype.touchstart, 
        "touchmove" : Control.MultiTouchXY.prototype.touchmove, 
        "touchend"  : Control.MultiTouchXY.prototype.touchend,
    };

    this.touchCount = 0;
    this.container.style.border = "1px solid " + this.strokeColor;
    
    this.touchColors = ["rgba(255,0,0,.25)","rgba(255,255,0,.25)","rgba(0,255,0,.25)","rgba(0,255,255,.25)","rgba(0,0,255,.25)","rgba(255,0,255,.25)"];
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
    
    touch.id = (this.isMomentary) ? id : gNOT_ACTIVE;
    touch.childID = touch.id;
    touch.isActive = (this.isMomentary);
	
    if(!this.isMomentary) {
        touch.activeNumber = id + 1;
    }
    
    touch.activeNumber = this.children.length;
    
	var bgcolor = (this.rainbow) ? this.touchColors[touch.activeNumber % this.touchColors.length] : this.color;
	
	$(touch).css({
	    "display" 	: "block",
	    "position" 	: "absolute",
	    "border" 	: this.strokeColor + " solid 0px",
	    "width" 	: this.touchSize + "px",
	    "height" 	: this.touchSize + "px",
	    "text-align" 	: "center",
	    "line-height" 	: this.touchSize + "px",  
	    "vertical-align" : "center",
	    "left" 	: 0 + "px",
	    "top"  	: 0 + "px",
	    "color" : this.strokeColor,
	    "background-color" : bgcolor,
	    "text-shadow" : "none",
		"-webkit-transform-origin-x": this.x + "px",
		"-webkit-transform-origin-y": this.y + "px",
        "border-radius": this.half + "px",
	});
	
	touch._x = 0;
	touch._y = 0;
    $(touch).text(touch.activeNumber);
    
    this.children.push(touch);
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
    
Control.MultiTouchXY.prototype.trackTouch = function(xPos, yPos, id, pressureID) {
    var closestDiff = 10000;
    var touchFound = null;
    var touchNum = null;
    for(var i = 0; i < this.children.length; i++) {
        var touch = this.children[i];
        var xdiff = Math.abs(touch._x - (xPos - this.x) + this.half);
        var ydiff = Math.abs(touch._y - (yPos - this.y) + this.half);

        if(!touch.isActive) {
            if(xdiff + ydiff < closestDiff) {
                closestDiff = xdiff + ydiff;
                touchFound = touch;
                touchNum = i;
            }
        }
    }
    touchFound.id = id;
	touchFound.pressure = Control.pressures[pressureID];
	
	//console.log("WOO HOO : " + touchFound.pressure);
    touchFound.isActive = true;
    if(touchFound != null)
        this.changeValue(touchFound, xPos, yPos, 1, touchFound.pressure);
    
    this.lastTouched = touchFound;
}

Control.MultiTouchXY.prototype.touchstart = function (touch) {
    //console.log("NEW TOUCH " + touch.pageX + " " + touch.pageY);
	var pressureID = touch.pageX + ":" + touch.pageY;
	//Control.pressureIDs[touch.identifier] = touch.pageX + ":" + touch.pageY;

    if(this.hitTest(touch.pageX, touch.pageY)) {
        if(this.isMomentary) 
            this.addTouch(touch.pageX , touch.pageY , touch.identifier);
        else
            this.trackTouch(touch.pageX, touch.pageY , touch.identifier, pressureID);
        
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
			var pressureID = touch.pageX + ":" + touch.pageY;
			
            this.changeValue(_t, touch.pageX, touch.pageY, 1, Control.pressures[pressureID]);
			
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


Control.MultiTouchXY.prototype.changeValue = function(touch, inputX, inputY, inputZ, pressure) {
    var xLeft   = inputX - this.half;
    var xRight  = inputX + this.half - 2;
    var yTop    = inputY - this.half;
    var yBottom = inputY + this.half - 2;
    
	//console.log("pressure = " + pressure);
	touch.pressure = (pressure - this.pressureMin) / this.pressureRange;
	if(touch.pressure > 1) {
		touch.pressure = 1;
	}else if(touch.pressure < 0) {
		touch.pressure = 0;
	}
	this.pressure = touch.pressure;
	
	//console.log("pressure : " + this.pressure);
	var xPos = "0px";
	var yPos = "0px";
    //console.log("x touch = " + inputX + " :: xLeft = " + xLeft + " :: xRight = " + xRight + " :: x = " + this.x + " :: width = " + this.width);

    // adjust x?
    if((!inputX > this.x && inputX < this.x + this.width)) {
        if(inputX < this.x) {
            inputX = 0;
        } else {;
            inputX = (this.x + this.width);
        }
    }
    
    // adjust y?
    if(!(inputY >= this.y && inputY <= this.y + this.height)) {
        if(inputY < this.y) {
            inputY = 0;
        }else{
            inputY = (this.y + this.height);
        }
    }
    
    touch._xpercentage = (inputX - (this.x )) / (this.width);
    touch._ypercentage = (inputY - (this.y )) / (this.height);
    
    if(touch._xpercentage < 0) touch._xpercentage = 0; else if (touch._xpercentage > 1) touch._xpercentage = 1;
    if(touch._ypercentage < 0) touch._ypercentage = 0; else if (touch._ypercentage > 1) touch._ypercentage = 1;

	touch._x = ((touch._xpercentage * (this.width  - 4)) - this.half);
	touch._y = ((touch._ypercentage * (this.height - 4)) - this.half);
	     
	var translate = "translate3d("+ touch._x + "px," + touch._y + "px, 0)";
	touch.style.webkitTransform = translate;
    
    if(touch._xpercentage < 0) touch._xpercentage = 0; // needed to account for the - this.half * 2 above TODO: NOT PRECISE ON EDGES, SHOULD FIX
    if(touch._ypercentage < 0) touch._ypercentage = 0;
    
    var range = this.max - this.min;
    
    if(Control.protocol != "MIDI") {
        this.xvalue = this.min + (touch._xpercentage * range);
        this.yvalue = this.min + (touch._ypercentage * range);
    }else{
        this.xvalue = Math.round(this.min + (touch._xpercentage * range));
        this.yvalue = Math.round(this.min + (touch._ypercentage * range));
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
    this.width = Math.round(newBounds[2] * $("#selectedInterface").width());
    this.height = Math.round(newBounds[3] * $("#selectedInterface").height());
    this.x = Math.round(newBounds[0] * $("#selectedInterface").width());
    this.y = Math.round(newBounds[1] * $("#selectedInterface").height());
    
    this.container.style.width  = this.width - 2 + "px";
    this.container.style.height = this.height - 2 + "px";
    this.container.style.left = this.x  + "px";
    this.container.style.top  = this.y  + "px";
    
    if(typeof this.label != "undefined") {
        this.label.setBounds(newBounds);
    }
    
    this.touchSize = this.props.touchSize || (this.width / 6);
    this.half = parseInt(this.touchSize) / 2;

    $(".touch").css({
	    "width" 	: this.touchSize + "px",
	    "height" 	: this.touchSize + "px",
	    "line-height" 	: this.touchSize + "px",  
//	    "left" 	: 0 + "px",
//	    "top"  	: 0 + "px",
	    "color" : this.strokeColor,
		"-webkit-transform-origin-x": this.x + "px",
		"-webkit-transform-origin-y": this.y + "px",
        "border-radius": this.half + "px",
        "border-radius": this.half + "px",
	});
}

//	TODO: this should move all the touches to a position reflecting (possibly) updated values
//    this.setRange = function(min, max) {
//        this.min = min;
//        this.max = max;
//        
//        for(var i = 0; i < this.maxTouches; i++) {
//            var touch = this.children[i];
//            touch.style.left = ( touch._xpercentage * parseInt(this.container.style.width ) ) + "px";
//            touch.style.top  = ( touch._ypercentage * parseInt(this.container.style.height) ) + "px";
//        }
//
//    }

Control.MultiTouchXY.prototype.output = function(touch) {
    var valueString = "";
    if(Control.protocol == "OSC") {
        valueString = "|" + this.address + ":";
        //if (this.maxTouches > 1) {
        valueString += touch.activeNumber + ",";
        //}
        valueString += this.xvalue + "," + this.yvalue;

        if(this.sendZValue){
            valueString += "," + this.zvalue;	
        }
		if(this.sendPressure) {
			valueString += "," + touch.pressure;	
		}
    }else if(_protocol == "MIDI") {
        var xnum = this.midiNumber + (touch.activeNumber * 2) - 2;
        var ynum = xnum + 1;
		var pnum = ynum + 1;
            
        valueString  = "|" + this.midiType + "," + (this.channel - 1) + "," + xnum + "," + Math.round(this.xvalue);
        valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + ynum + "," + Math.round(this.yvalue);
        valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + pnum + "," + Math.round(touch.pressure * 127);
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