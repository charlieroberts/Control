Control.RangeSlider = function(ctx, props) {
    this.make(ctx, props);
	this.ctx = ctx;

	if(typeof props.isVertical != "undefined")
        this.isVertical = props.isVertical;
    else
        this.isVertical = (this.width < this.height);
    
    this.form.isVertical = "vertical slider";
    this.shouldUseCanvas = true;
	this.requiresTouchDown = (typeof props.requiresTouchDown != "undefined") ? props.requiresTouchDown : true;	
    
    this.prevValue = this.value;
	
	this.range = this.max - this.min;
	
	this.pixelWidth  = 1 / Control.deviceWidth;
	this.pixelHeight = 1 / Control.deviceHeight;
	this.leftValue = 0;
	this.rightValue = 1;
	this.handleSize = 30;
	this.canvas = document.createElement('canvas');
	$(this.canvas).addClass('widget Control.RangeSlider');

	this.canvas.width = this.width;			// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
	this.canvas.height = this.height;		// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
	this.ctx.appendChild(this.canvas);

	$(this.canvas).css({
		"border" : "1px solid #fff",
		"top" 	 : this.y + "px",
		"left" 	 : this.x + "px",
		"position" : "absolute",
	});

	this.canvasCtx = this.canvas.getContext('2d');   

	this.displayValue = props.displayValue;

	if(typeof props.label != "undefined" || props.displayValue == true) {
	    this.text = props.label || this.value;
	    this.labelSize = props.labelSize || 12;

	    {   //remove for canvas
			var _width, _height, _x, _y;
			if(this.isVertical) {
				_width = props.width - (8 / Control.deviceWidth);
				_height =  (this.labelSize + 4) / Control.deviceHeight;
				_x = props.x;
				_y = props.y + props.height - _height;
			}else{
				_width = (props.width / 3) - (8 / Control.deviceWidth);
				_height = (this.labelSize + 4) / Control.deviceHeight;
				_x = props.x + (props.width / 2) - ((props.width / 3) / 2);
				_y = props.y + props.height - _height;
			}
			
	        this.label = {
				"name":   this.name + "Label",
				"type":   "Label",
				"bounds": [_x, _y, _width, _height],
				"color":  this.strokeColor, 
				"backgroundColor": "rgba(127, 127, 127, .75)",
				"value": this.text,
				"size":  props.labelSize || 12, 
			 };
                        
	        var _w = Control.makeWidget(this.label);
	        if(!Control.isAddingConstants)
	            Control.addWidget(_w, Control.addingPage);
	        else
	            Control.addConstantWidget(_w);
            
	        this.label = _w;
			$(this.label.label).css("padding", "0px 4px 0px 4px");
		}
	}

    this.events = { 
        "touchstart": Control.RangeSlider.prototype.touchstart, 
        "touchmove" : Control.RangeSlider.prototype.touchmove, 
        "touchend"  : Control.RangeSlider.prototype.touchend,
    };

    return this;
}

Control.RangeSlider.prototype = new Widget();

Control.RangeSlider.prototype.touchstart = function(touch) {
    if(this.hitTest(touch.pageX, touch.pageY)) {
        this.activeTouches.push(touch.identifier);
        if(this.isVertical) {
            this.changeValue(touch.pageY); 
        }else{
            this.changeValue(touch.pageX); 
        }
		
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
};

Control.RangeSlider.prototype.touchmove = function(touch) {       
    var shouldChange = false;
 	var touchNumber = -1;
	
    for(var i = 0; i < this.activeTouches.length; i++) {
        if(touch.identifier == this.activeTouches[i]){
			touchNumber = i;
            shouldChange = true;
            break;
        }
    }
    
    if(!this.requiresTouchDown) {
        shouldChange = true;
    }
    
    var isHit = this.hitTest(touch.pageX, touch.pageY);
    if(shouldChange) {
		if(isHit) {
			if(this.isVertical) {
				this.changeValue(touch.pageY); 
	        }else{
	        	this.changeValue(touch.pageX); 
	        }
						
            if(this.ontouchmove != null) {
                if(typeof this.ontouchmove === "string") {
                    eval(this.ontouchmove);
                }else{
                    this.ontouchmove(touch);
                }
            }

			if(this.displayValue) { this.label.setValue(this.value); }

	        return true;
		}else{
			if(touchNumber != -1) { this.activeTouches.splice(touchNumber, 1); }	
		}
    }
	return false;
};

Control.RangeSlider.prototype.touchend = function(touch) {
    if(this.activeTouches.length > 0) {
        for(var i = 0; i < this.activeTouches.length; i++) {
            if(touch.identifier == this.activeTouches[i]) {
                this.activeTouches.splice(i,1);	// remove touch ID from array
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
};

Control.RangeSlider.prototype.events = { 
    "touchstart": Control.RangeSlider.prototype.touchstart, 
    "touchmove" : Control.RangeSlider.prototype.touchmove, 
    "touchend"  : Control.RangeSlider.prototype.touchend,
};
    
Control.RangeSlider.prototype.event = function(event) {
    for (var j = 0; j < event.changedTouches.length; j++){
        var touch = event.changedTouches.item(j);
		
		var breakCheck = this.events[event.type].call(this, touch);
		
        if(breakCheck) break;
    }
};

Control.RangeSlider.prototype.changeValue = function(val) { 
	var value = 1 - ((this.x + this.width) - val) / (this.width);
	if(Math.abs( value - this.leftValue) < Math.abs( value - this.rightValue)) {
		this.leftValue = value;
	}else{
		this.rightValue = value;
	}
	
	if(this.leftValue < this.rightValue) {
		this.setValue(this.leftValue, this.rightValue);
	}else{
		this.setValue(this.rightValue, this.leftValue);
	}
}

Control.RangeSlider.prototype.setValue = function(left, right) {
	this.value = [
		this.min + (left * this.range),
		this.min + (right * this.range),
	];
	
	this.draw();
	
	if(typeof this.onvaluechange === "string") {
        eval(this.onvaluechange);
	}else if(this.onvaluechange != null){
		this.onvaluechange();
	}
    
	if(!(arguments[1] === false))
		this.output();
};

Control.RangeSlider.prototype.output = function() {
	if(window.device.platform === "iPhone") {
	
	    if(!this.isLocal && Control.protocol == "OSC") {
	        var valueString = "|" + this.address;
	        valueString += ":" + this.value[0] + "," + this.value[1];
	    }else if (!this.isLocal && Control.protocol == "MIDI") {
	        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.value[0]);
	        valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber + 1) + "," + Math.round(this.value[1]);
	    }
	
	    Control.valuesString += valueString;	
	}else{
		Control.oscManager.sendOSC(this.address, 'ff', this.value[0], this.value[1]);
	}
};

Control.RangeSlider.prototype.draw = function() {
    this.canvasCtx.fillStyle = this.backgroundColor;
    this.canvasCtx.clearRect(0, 0, this.width, this.height);    
        
    if(this.isVertical) {
		if(this.prevValue > this.value) { // figure out difference and clear, not needed if value is greater as prev area stays filled (should we just fill new area instead of all?)
		   this.ctx.clearRect(this.x, (this.y + this.height) - (prevPercent * this.height) - 1, this.width,(prevPercent * this.height) - (percent * this.height) + 1);
		}
        this.canvasCtx.fillRect(this.x, (this.y + this.height) - (percent * this.height), this.width, percent * this.height);
    }else{
		var rightHandlePos = this.rightValue * this.width - (this.handleSize / 2);
		var leftHandlePos  = this.leftValue  * this.width - (this.handleSize / 2);
		
	    this.canvasCtx.fillStyle = this.fillColor;
        this.canvasCtx.fillRect(leftHandlePos, 0, rightHandlePos - leftHandlePos, this.height);
		
	    this.canvasCtx.fillStyle = "rgba(255,0,0,.5)";
		this.canvasCtx.fillRect(leftHandlePos, 0, this.handleSize, this.height);
		
	    this.canvasCtx.fillStyle = "rgba(0,255,0,.25)";
		this.canvasCtx.fillRect(rightHandlePos, 0, this.handleSize, this.height);
    }
    // this.canvasCtx.strokeStyle = this.strokeColor;
    // this.canvasCtx.strokeRect(this.x,this.y, this.width, this.height);
}

Control.RangeSlider.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1];
    this.strokeColor = newColors[2];
    
    this.fillDiv.style.backgroundColor = this.fillColor;
    this.strokeDiv.style.border = "1px solid" + this.strokeColor;
    this.strokeDiv.style.backgroundColor = this.backgroundColor;
}
    
Control.RangeSlider.prototype.setBounds = function(newBounds) {
    this.width = Math.round(newBounds[2] * $("#selectedInterface").width());
    this.height = Math.round(newBounds[3] * $("#selectedInterface").height());
    this.x = Math.round(newBounds[0] * $("#selectedInterface").width());
    this.y = Math.round(newBounds[1] * $("#selectedInterface").height());
    
	$(this.canvas).css({
	    "width" 	: this.width - 2 + "px",
	    "height"	: this.height - 2 + "px",
	    "left" 		: this.x + 1 + "px",
	    "top"  		: this.y + 1 + "px",
	});
    
    this.draw();
	
	if(typeof this.label != "undefined") {
		var _width, _height, _x, _y;
		if(this.isVertical) {
			_width = newBounds[2] - (8 / Control.deviceWidth);
			_height =  (this.labelSize + 4) / Control.deviceHeight;
			_x = newBounds[0];
			_y = newBounds[1] + newBounds[3] - _height;
		}else{
			_width = (newBounds[2] / 3) - (8 / Control.deviceWidth);
			_height = (this.labelSize + 4) / Control.deviceHeight;
			_x = newBounds[0] + (newBounds[2] / 2) - ((newBounds[2] / 3) / 2);
			_y = newBounds[1] + newBounds[3] - _height;
		}
		this.label.setBounds([_x,_y,_width,_height]);
	}
}

Control.RangeSlider.prototype.show = function() {
    if(!this.shouldUseCanvas) {
        this.fillDiv.style.display = "block";
        this.strokeDiv.style.display = "block";
    }else{
        this.canvas.style.display = "block";
    }
    this.draw();
}

Control.RangeSlider.prototype.hide = function() {
    //this.ctx.clearRect(this.x,this.y,this.width,this.height);
    if(!this.shouldUseCanvas) {
        this.fillDiv.style.display = "none";
        this.strokeDiv.style.display = "none";
    }else{
        this.canvas.style.display = "none";
    }
}