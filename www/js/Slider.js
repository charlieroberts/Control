function Slider(ctx, props) {
    this.make(ctx, props);
	this.ctx = ctx;
	
	if(typeof props.isVertical != "undefined")
        this.isVertical = props.isVertical;
    else
        this.isVertical = (this.width < this.height);
    
	this.requiresTouchDown = (typeof props.requiresTouchDown != "undefined") ? props.requiresTouchDown : true;
	
	this.isXFader = (typeof props.isXFader != "undefined") ? props.isXFader : false;
	
	this.shouldUseCanvas = (typeof props.shouldUseCanvas != "undefined") ? props.shouldUseCanvas : false;
	
	this.fillDiv = null;
	this.strokeDiv = null;
    
    this.prevValue = this.value;
	
	this.pixelWidth  = 1 / control.deviceWidth;
	this.pixelHeight = 1 / control.deviceHeight;
	
	if(!this.shouldUseCanvas) {
		this.fillDiv   = document.createElement("div");
		$(this.fillDiv).addClass('widget slider');

		$(this.fillDiv).css({
			"position": "absolute", 
			"width": this.width - 2 + "px",
			"height": this.height - 2 + "px", 
			"left": this.x + 1 + "px", 
			"top": this.y + 1 + "px",
			"background-color": this.fillColor,
			"z-index": 10,  
		});

		this.ctx.appendChild(this.fillDiv);
		
		this.strokeDiv   = document.createElement("div");
		$(this.strokeDiv).addClass('widget slider_stroke');
		
		$(this.strokeDiv).css({
			"width": this.width - 2 + "px",
			"height": this.height - 2 + "px", 
			"position": "absolute", 
			"left": this.x + "px", 
			"top": this.y  + "px",
			"background-color": this.backgroundColor,
			"border": "1px solid " + this.strokeColor, 
			"z-index": 1,  
		});
		
		this.ctx.appendChild(this.strokeDiv);
	}else{
		this.canvas = document.createElement('canvas');
		$(this.canvas).addClass('widget slider');

		this.canvas.width = this.width;						// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
		this.canvas.height = this.height;					// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
		this.ctx.appendChild(this.canvas);

		$(this.canvas).css({
			"border" : "1px solid #fff",
			"top" 	 : this.y + "px",
			"left" 	 : this.x + "px",
			"position" : "absolute",
		});

		this.canvasCtx = this.canvas.getContext('2d');   
	}
	
	this.displayValue = props.displayValue;
	
	if(typeof props.label != "undefined" || props.displayValue == true) {
	    this.text = props.label || this.value;
	    this.labelSize = props.labelSize || 12;

	    {   //remove for canvas
			var _width, _height, _x, _y;
			if(this.isVertical) {
				_width = props.width - (8 / control.deviceWidth);
				_height =  (this.labelSize + 4) / control.deviceHeight;
				_x = props.x;
				_y = props.y + props.height - _height;
			}else{
				_width = (props.width / 3) - (8 / control.deviceWidth);
				_height = (this.labelSize + 4) / control.deviceHeight;
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
                        
	        var _w = control.makeWidget(this.label);
	        control.widgets.push(_w);
	        if(!control.isAddingConstants)
	            control.addWidget(_w, control.currentPage); // PROBLEM
	        else
	            control.addConstantWidget(_w); // PROBLEM
            
	        this.label = _w;
			$(this.label.label).css("padding", "0px 4px 0px 4px");
		}
	}
	
	if(this.isXFader) {
		this.xFaderWidth = 50;
		if(!this.shouldUseCanvas) {
			this.fillDiv.style.width = this.xFaderWidth + "px";
			this.fillDiv.style.left = (this.x + (this.value * this.width)) + 1 + "px";
		}
	}
	
    return this;
}

Slider.prototype = new Widget();

Slider.prototype.touchstart = function(touch) {
    if(this.hitTest(touch.pageX, touch.pageY)) {
        this.activeTouches.push(touch.identifier);
        if(this.isVertical) {
            this.changeValue(touch.pageY); 
        }else{
            this.changeValue(touch.pageX); 
        }
		
		if(typeof this.ontouchstart === "string") {
	        eval(this.ontouchstart);
		}else{
			this.ontouchstart();
		}
        
		return true;
    }
	return false;
};

Slider.prototype.touchmove = function(touch) {       
    var shouldChange = false;
    if(this.requiresTouchDown) {
        for(var i = 0; i < this.activeTouches.length; i++) {
            if(touch.identifier == this.activeTouches[i]) shouldChange = true;
        }
    }else{
        shouldChange = true;
    }
                
    if(shouldChange && this.hitTest(touch.pageX, touch.pageY)) {
        if(this.isVertical) {
            this.changeValue(touch.pageY); 
        }else{
            this.changeValue(touch.pageX); 
        }
						
		if(typeof this.ontouchmove === "string") {
	        eval(this.ontouchmove);
		}else{
			this.ontouchmove();
		}

		if(this.displayValue)
			this.label.setValue(this.value);

			return true;
    }
	return false;
};

Slider.prototype.touchend = function(touch) {
    if(this.activeTouches.length > 0) {
        for(var i = 0; i < this.activeTouches.length; i++) {
            if(touch.identifier == this.activeTouches[i]) {
                this.activeTouches.splice(i,1);	// remove touch ID from array
				if(typeof this.ontouchend === "string") {
			        eval(this.ontouchend);
				}else{
					this.ontouchend();
				}
                
				return true;
            }
        }
    }
	return false;
};
    
Slider.prototype.events = { 
	"touchstart": Slider.prototype.touchstart, 
	"touchmove" : Slider.prototype.touchmove, 
	"touchend"  : Slider.prototype.touchend,
};

Slider.prototype.event = function(event) {
    for (var j = 0; j < event.changedTouches.length; j++){
        var touch = event.changedTouches.item(j);
		
		var breakCheck = this.events[event.type].call(this, touch);
		
        if(breakCheck) break;
    }
};

Slider.prototype.changeValue = function(val) { 
    this.prevValue = this.value;
    if(!this.isVertical) {
        this.value = 1 - ((this.x + this.width) - val) / (this.width);
    }else{
        this.value = (((this.y + (this.height - 1)) - val) / (this.height - 1)); 
    }

    this.setValue( this.min + ( this.value * ( this.max - this.min ) ) );
}

Slider.prototype.draw = function() {
    var range = this.max - this.min;
    var percent = (this.value + (0 - this.min)) / range;
    var prevPercent = (this.prevValue + (0 - this.min)) / range;
    if(percent > 1) percent = 1;
    if(!this.shouldUseCanvas) {
        if(!this.isVertical) {
            if(!this.isXFader) {
                this.fillDiv.style.width = ((this.width - 1) * percent) + "px";
            }else{
                this.fillDiv.style.left = (this.x  + (percent * (this.width - this.xFaderWidth))) + "px";
            }
        }else{
            this.fillDiv.style.height = Math.ceil(((this.height - 2) * percent )) + "px";
            this.fillDiv.style.top = this.y + ((this.height - 1) - (percent * (this.height - 2))) + "px";
        }
    }else{
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);    
        
        this.ctx.fillStyle = this.fillColor;
        
        if(this.isVertical) {
//                if(this.prevValue > this.value) { // figure out difference and clear, not needed if value is greater as prev area stays filled (should we just fill new area instead of all?)
//                    this.ctx.clearRect(this.x, (this.y + this.height) - (prevPercent * this.height) - 1, this.width,(prevPercent * this.height) - (percent * this.height) + 1);
//                }
            this.ctx.fillRect(this.x, (this.y + this.height) - (percent * this.height), this.width, percent * this.height);
        }else{
            if(this.isXFader) {
                this.ctx.fillRect(this.x  + (percent * (this.width - this.xFaderWidth)), this.y, this.xFaderWidth, this.height);
            }else{
                this.ctx.fillRect(this.x,this.y, this.width * percent, this.height);
            }
        }
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.strokeRect(this.x,this.y, this.width, this.height);
    }
}

Slider.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1];
    this.strokeColor = newColors[2];
    
    this.fillDiv.style.backgroundColor = this.fillColor;
    this.strokeDiv.style.border = "1px solid" + this.strokeColor;
    this.strokeDiv.style.backgroundColor = this.backgroundColor;
}

Slider.prototype.setBounds = function(newBounds) {
    this.width = Math.round(newBounds[2] * control.deviceWidth);
    this.height = Math.round(newBounds[3] * control.deviceHeight);
    this.x = Math.round(newBounds[0] * control.deviceWidth);
    this.y = Math.round(newBounds[1] * control.deviceHeight);
    
	$(this.fillDiv).css({
	    "width" 	: this.width - 2 + "px",
	    "height"	: this.height - 2 + "px",
	    "left" 		: this.x + 1 + "px",
	    "top"  		: this.y + 1 + "px",
	});
    
	$(this.strokeDiv).css({
	    "width"  : this.width - 2 + "px",
	    "height" : this.height - 2 + "px",
	    "left"   : this.x  + "px",
	    "top"  	 : this.y + "px",
	});
    
    if(this.isXFader) {
        this.xFaderWidth = 50;
        if(!this.shouldUseCanvas) {
            this.fillDiv.style.width = this.xFaderWidth + "px";
            this.fillDiv.style.left = (this.x + (this.value * this.width)) + 1 + "px";
        }
    }
    
    this.draw();
}

Slider.prototype.show = function() {
    if(!this.shouldUseCanvas) {
        this.fillDiv.style.display = "block";
        this.strokeDiv.style.display = "block";
    }else{
        this.canvas.style.display = "block";
    }
    this.draw();
}

Slider.prototype.hide = function() {
    //this.ctx.clearRect(this.x,this.y,this.width,this.height);
    if(!this.shouldUseCanvas) {
        this.fillDiv.style.display = "none";
        this.strokeDiv.style.display = "none";
    }else{
        this.canvas.style.display = "none";
    }
}

Slider.prototype.unload = function() {
//        this.ctx.clearRect(this.x,this.y,this.width,this.height);
    if(!this.shouldUseCanvas) {
        this.ctx.removeChild(this.fillDiv);
        this.ctx.removeChild(this.strokeDiv);		
    }else{
        this.ctx.removeChild(this.canvas);
    }
}

