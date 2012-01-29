function Slider(ctx, props) {
    this.make(ctx, props);
	this.ctx = ctx;
	//this.ctx = arguments[2];	
	this.isVertical =  (typeof props.isVertical != "undefined") ? props.isVertical : false;
	
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


		this.fillDiv.style.width = this.width - 2 + "px";
		this.fillDiv.style.height = this.height - 2 + "px";
		this.fillDiv.style.position = "absolute";
		this.fillDiv.style.left = this.x + 1 + "px";
		this.fillDiv.style.top  = this.y + 1 + "px";
		this.fillDiv.style.backgroundColor = this.fillColor;
		//this.fillDiv.style.border = "1px solid " + this.fillColor;		// must have border so that it aligns with the stroke div
		this.fillDiv.style.zIndex = 10;
		this.ctx.appendChild(this.fillDiv);							// THIS LINE IS IMPORTANT!!!!
		
		this.strokeDiv   = document.createElement("div");
		//XXX should this be a widget or some sort of widget child?
		$(this.strokeDiv).addClass('widget slider_stroke');

		this.strokeDiv.style.width = this.width - 2 + "px";
		this.strokeDiv.style.height = this.height - 2 + "px";
		this.strokeDiv.style.position = "absolute";
		this.strokeDiv.style.left = this.x + "px";
		this.strokeDiv.style.top  = this.y + "px";
		this.strokeDiv.style.border = "1px solid" + this.strokeColor;
		this.strokeDiv.style.zIndex = 1;
		this.strokeDiv.style.backgroundColor = this.backgroundColor;
		this.ctx.appendChild(this.strokeDiv);						// THIS LINE IS IMPORTANT!!!!
	}else{
		this.canvas = document.createElement('canvas');
		$(this.canvas).addClass('widget slider');

		this.canvas.width = this.width;						// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
		this.canvas.height = this.height;					// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
		this.ctx.appendChild(this.canvas);

		this.canvas.style.border = "1px solid #fff";
		this.canvas.style.top = this.y + "px";
		this.canvas.style.left = this.x + "px";
		this.canvas.style.position = "absolute";

		this.canvasCtx = this.canvas.getContext('2d');
        
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
    
Slider.prototype.event = function(event) {
    for (var j = 0; j < event.changedTouches.length; j++){
        var touch = event.changedTouches.item(j);
        var breakCheck = false;
        
        switch(event.type) {
            case "touchstart":
                if(this.hitTest(touch.pageX, touch.pageY)) {
                    this.activeTouches.push(touch.identifier);
                    if(this.isVertical) {
                        this.changeValue(touch.pageY); 
                    }else{
                        this.changeValue(touch.pageX); 
                    }
                    eval(this.ontouchstart);
                }
                break;
            case "touchmove":
                
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
                    eval(this.ontouchmove); 
                    breakCheck = true;
                }
                

                break;
            case "touchend":
                if(this.activeTouches.length > 0) {
                    for(var i = 0; i < this.activeTouches.length; i++) {
                        if(touch.identifier == this.activeTouches[i]) {
                            this.activeTouches.splice(i,1);	// remove touch ID from array
                            breakCheck = true;
                            eval(this.ontouchend); 
                            break;
                        }
                    }
                    
                }
                
                break;
        }
        
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
    
    this.fillDiv.style.width  = this.width - 2 + "px";
    this.fillDiv.style.height = this.height - 2 + "px";
    this.fillDiv.style.left = this.x + 1 + "px";
    this.fillDiv.style.top  = this.y + 1 + "px";
    
    this.strokeDiv.style.width  = this.width - 2 + "px";
    this.strokeDiv.style.height = this.height - 2 + "px";
    this.strokeDiv.style.left = this.x  + "px";
    this.strokeDiv.style.top  = this.y + "px";
    
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

