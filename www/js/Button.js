Control.Button = function(ctx, props) {
    console.log("BUTTON START");
    this.make(ctx, props);
    console.log(0);    
    this.ctx = ctx;
    this.mode = (typeof props.mode != "undefined") ? props.mode: "toggle";
    console.log(1);    
    this.widgetID = -1;
    
    this.activeTouches =  [];
    
    this.requiresTouchDown = (typeof props.requiresTouchDown == "undefined") ? true : props.requiresTouchDown;
    
    this.contactOn = false;	// used to trigger flash for contact mode buttons

    console.log(2);    
    // remove for canvas
    {   
        this.container   = document.createElement("div");
        $(this.container).addClass('widget button');
        
        $(this.container).css({
            "width" 	: this.width - 2 + "px",
            "height" 	: this.height - 2 + "px",	
            "position" 	: "absolute",
            "left" 		: this.x + "px",
            "top"  		: this.y + "px",
            "border" 	: "1px solid " + this.strokeColor,
		});
		
		this.container.widget = this;
        
    }
    console.log(3);    
    if (typeof props.label != "undefined") {
        this.text = props.label;
        this.labelSize = props.labelSize || 12;
        
        //remove for canvas
        {   
				//  this.label = {
				// "name": this.name + "Label",
				//  "type": "Label", 
				//  "bounds":[props.x, props.y, props.width, props.height], 
				//  "color":this.strokeColor, 
				//  "value":this.text,
				//  "size":props.labelSize || 12,
				// 			 };
				//             var _w = Control.makeWidget(this.label);
				// 	        if(!Control.isAddingConstants) {
				// 	            Control.addWidget(_w, Control.addingPage); // PROBLEM
				// 	        }else{
				//                 Control.constants.push(_w);
				// 	            Control.addConstantWidget(_w); // PROBLEM
				//             }
				// 
			this.label = $("<h3>");
			$(this.label).css({color:"#ccc", "text-align" : "center", width: "100%" });
			$(this.label).text(this.text);
			console.log("LABEL", this.label);
			$(this.container).append(this.label)    
            //this.label = _w;
        }
    }
    this.ctx.appendChild(this.container);
	
    console.log(4);
	/*
	(function(obj) {
		var that = obj;
		var width = that.width;
		var height = that.height;
		var x = that.x;
		var y = that.y;
		
	    Object.defineProperties(that, {
			"width" : {
		        get: function() {
		            return width;
		        },
		        set: function(value) {
		            if(value < 1) {
		            	var newWidth = value * $("#selectedInterface").width();
						$(that.container).css("width", newWidth);
		            }else{
		            	$(that.container).css("width", value);
		            }
		        }
			},
			"height" : {
		        get: function() {
		            return height;
		        },
		        set: function(value) {
		            if(value < 1) {
		            	var newHeight = value * $("#selectedInterface").height();
						$(that.container).css("height", newHeight);
		            }else{
		            	$(that.container).css("height", value);
		            }
		        }
			},
			"x" : {
		        get: function() {
		            return x;
		        },
		        set: function(value) {
		            if(value < 1) {
		            	var newX = value * $("#selectedInterface").width();
						$(that.container).css("left", newX);
		            }else{
		            	$(that.container).css("left", value);
		            }
		        }
			},
			"y" : {
		        get: function() {
		            return y;
		        },
		        set: function(value) {
		            if(value < 1) {
		            	var newY = value * $("#selectedInterface").height();
						$(that.container).css("top", newY);
		            }else{
		            	$(that.container).css("top", value);
		            }
		        }
			},
	    });
	})(this);
    */
    this.yOffset = 0;
    this.xOffset = 0;
    
    if (props.mode == "visualToggle") this.visualToggleLit = (this.value == this.max);
    
    this.isLit = (this.value == this.max);
    
    this.events = { 
        "touchstart": Control.Button.prototype.touchstart, 
        "touchmove" : Control.Button.prototype.touchmove, 
        "touchend"  : Control.Button.prototype.touchend,
    };
    console.log(5);    
    
    return this;
}

Control.Button.prototype = new Widget();

Control.Button.prototype.flash = function(btn) {
	return (function() {
		$(btn.container).css("background-color", btn.backgroundColor);
	});
}

Control.Button.prototype.draw = function() {
    //console.log("drawing " + this.value );
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);
    {   // remove for canvas
        if(this.mode != "contact") {
            this.container.style.backgroundColor = (this.isLit) ? this.fillColor : this.backgroundColor;
        } else {
            this.container.style.backgroundColor = this.fillColor;
			var flashFunction = Control.Button.prototype.flash(this);
			setTimeout(flashFunction, 50);
        }
        this.container.style.border = "1px solid " + this.strokeColor;

        //if(this.label != null) this.label.draw();
    }

//        this.drawLabel();
//        this.ctx.lineWidth = 1;
//        this.ctx.strokeStyle = this.color;
//        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
}

Control.Button.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1] || this.fillColor;
    this.strokeColor = newColors[2] || this.strokeColor;
    
    this.draw();
}

Control.Button.prototype.setBounds = function(newBounds) {
    this.width = (newBounds[2] <= 1) ? Math.round(newBounds[2]  * $("#selectedInterface").width()) : newBounds[2];
    this.height = (newBounds[3] <= 1) ? Math.round(newBounds[3] * $("#selectedInterface").height()) : newBounds[3];
    this.x = (newBounds[0] <= 1) ? Math.round(newBounds[0] * $("#selectedInterface").width()) : newBounds[0]; 
    this.y = (newBounds[1] <= 1) ? Math.round(newBounds[1] * $("#selectedInterface").height()): newBounds[1];
    //console.log(this.width + " : " + this.height + " : "  +this.x + " : " + this.y);
    this.container.style.width  = this.width - 2 + "px";
    this.container.style.height = this.height - 2 + "px";
    this.container.style.left = this.x  + "px";
    this.container.style.top  = this.y  + "px";
    
    // if(typeof this.label != "undefined") {
    //     this.label.setBounds(newBounds);
    // }
}

Control.Button.prototype.drawLabel = function() {
    if (typeof this.text != "undefined") {
        this.ctx.fillStyle = this.strokeColor;
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = "center";
        //this.ctx.font = this.labelSize + "px helvetiker";
        this.ctx.font = '12px sans-serif';
        
        this.ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}

Control.Button.prototype.touchstart = function(touch, isHit) {
    if (isHit) {
        this.xOffset = (touch.pageX - this.x) / (this.width - this.x);
        this.yOffset = (touch.pageY - this.y) / (this.height - this.y);
        this.activeTouches.push(touch.identifier);
        this.processingTouch = touch;
        var newValue;
        switch (this.mode) {
            case "toggle":
                newValue = (this.value == this.min) ? this.max: this.min;
                break;
            case "visualToggle":
                newValue = this.max;
                this.visualToggleLit = !this.visualToggleLit;
                break;
            case "latch":
            case "momentary":
                newValue = this.max;
                break;
            case "contact":
                this.contactOn = true;
                newValue = this.max;
                break;
        }
        this.setValue(newValue);
		
        if(this.ontouchstart != null) {
            if(typeof this.ontouchstart === "string") {
                eval(this.ontouchstart);
            }else{
                this.ontouchstart(touch);
            }
        }
		return true;      
    }
	return false;
}

Control.Button.prototype.touchmove = function(touch, isHit) {
    var shouldChange = !this.requiresTouchDown;
    var rollOff = false;
    var newValue;
    if (!this.requiresTouchDown) {
        var touchFound = false;
        var l = this.activeTouches.length;
		//console.log(this.activeTouches.length);
        for (var i = 0; i < l; i++) {
            if (touch.identifier == this.activeTouches[i]) {
                shouldChange = false;
                
                if (isHit) {
                    touchFound = true;
                } else {
                    if (this.mode != "latch") {
                        this.activeTouches.splice(i, 1);
                        shouldChange = true;
                        rollOff = true;
                    }
                }
            }
        }
        if (!touchFound && isHit) {
            this.activeTouches.push(touch.identifier);
            this.xOffset = (touch.pageX - this.x) / (this.width - this.x);
            this.yOffset = (touch.pageY - this.y) / (this.height - this.y);
            shouldChange = true;
        }
    }
    
    if (shouldChange && isHit) {
        switch (this.mode) {
            case "toggle":
            newValue = (this.value == this.min) ? this.max: this.min;
            break;
            case "visualToggle":
            newValue = this.max;
            break;
            case "latch":
            newValue = this.max;
            break;
            case "momentary":
            if (!rollOff) {
                newValue = this.max;
            } else {
                newValue = this.min;
            }
            break;
            case "contact":
            newValue = this.max;
            break;
        }
        this.processingTouch = touch;
        this.setValue(newValue);
        
        if(this.ontouchmove != null) {
            if(typeof this.ontouchmove === "string") {
                eval(this.ontouchmove);
            }else{
                this.ontouchmove(touch);
            }
        }
    } else if (rollOff && this.mode == "momentary") {
        newValue = this.min;
        this.setValue(newValue);
    } else if(isHit && this.sendPressure) {
        this.output(); // will use last value sent and also change pressure
    }
	return false;
}

Control.Button.prototype.touchend = function(touch, isHit) {
    if (isHit || this.mode == "latch" || this.mode == "momentary") {
        for (var i = 0; i < this.activeTouches.length; i++) {
            if (touch.identifier == this.activeTouches[i]) {
                this.activeTouches.splice(i, 1);
                // remove touch ID from array
                            
                if (this.mode == "latch" || this.mode == "momentary") {
                    this.processingTouch = touch;
                    this.setValue(this.min);
                }
                            
                if(this.ontouchend != null) {
                    if(typeof this.ontouchend === "string") {
                        eval(this.ontouchend);
                    }else{
                        this.ontouchend(touch);
                    }
                }
				
				return true;
            }
        }
    }
	return false;
}

Control.Button.prototype.events = { 
    "touchstart": Control.Button.prototype.touchstart, 
    "touchmove" : Control.Button.prototype.touchmove, 
    "touchend"  : Control.Button.prototype.touchend,
};
Control.Button.prototype.event = function(event) {
    for (var j = 0; j < event.changedTouches.length; j++){
        var touch = event.changedTouches.item(j);
		
		//if(this.name === "_2" || this.name === "_1")
		//	console.log(this.name, touch.pageX, touch.pageY, this.x, this.y, this.width, this.height);
        var isHit = this.hitTest(touch.pageX, touch.pageY);
		var breakCheck = this.events[event.type].call(this, touch, isHit);
		
        if(breakCheck) break;
    }
}

Control.Button.prototype.output = function() {
    var pressure;
    if(this.sendPressure) {
        var pressureID = this.processingTouch.pageX + ":" + this.processingTouch.pageY;
        pressure = Control.pressures[pressureID];
        pressure = (pressure - this.pressureMin) / this.pressureRange;
        if(pressure > 1) {
            pressure = 1;
        }else if(pressure < 0) {
            pressure = 0;
        }
    }
    
    if (!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.value;
        if(this.sendPressure) {
            valueString += "," + pressure;
        }
        Control.valuesString += valueString;
    } else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber + "," + Math.round(this.value);
        
        if(this.sendPressure) {
            valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber + 1) + "," + Math.round(pressure * 127);
        }
        
        Control.valuesString += valueString;
    }
}
// used instead of output when button is part of a multibutton widget
Control.Button.prototype.multiOutput = function() {
    var pressure;
    if(this.sendPressure) {
        var pressureID = this.processingTouch.pageX + ":" + this.processingTouch.pageY;
        pressure = Control.pressures[pressureID];
        pressure = (pressure - this.pressureMin) / this.pressureRange;
        if(pressure > 1) {
            pressure = 1;
        }else if(pressure < 0) {
            pressure = 0;
        }
    }
    
    if (!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.childID + "," + this.value;
        if(this.sendPressure) {
            valueString += "," + pressure;
        }
        Control.valuesString += valueString;
    } else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber + "," + Math.round(this.value);
        if(this.sendPressure) {
            valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber + 1) + "," + Math.round(pressure * 127);
        }
        Control.valuesString += valueString;
    }
}

Control.Button.prototype.setValue = function(newValue) {
    this.value = newValue;
    switch (this.mode) {
        case "toggle":
            this.isLit = (this.value == this.max);
            break;
        case "visualToggle":
            this.isLit = (this.visualToggleLit);
            break;
        case "latch":
        case "momentary":
            this.isLit = (this.value == this.max);
            break;
        default:break;
    }
    
    //this.label.draw();
    this.draw();
    if (! (arguments[1] === false)) {
        if(this.onvaluechange != null) {
            if(typeof this.onvaluechange === "string") {
                eval(this.onvaluechange);
            }else{
                this.onvaluechange();
            }
        }
    }
    if (! (arguments[1] === false)) {
        this.output();
    }
}

Control.Button.prototype.show = function() {
    //this.draw();
    this.container.style.display = "block";
}

Control.Button.prototype.hide = function() {
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);    
    this.container.style.display = "none";
}

Control.Button.prototype.unload = function() {
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);
    if(typeof this.label !== 'undefined') {
        //Control.removeWidgetWithName(this.name + "Label");
		$(this.label).remove();
    }

    this.ctx.removeChild(this.container);
}