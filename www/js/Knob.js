// TODO: do non-rotational knobs still work without using rotationValue??? don't think so...

function Knob(ctx,props) {
	// MUST COME BEFORE WIDGET INIT SINCE JSON DOESN'T INCLUDE WIDTH AND HEIGHT FOR KNOBS, ONLY RADIUS
	props.width  = props.radius;
	props.height = props.radius;
    
    this.make(ctx, props);
	
	if(control.orientation == 0 || control.orientation == 180) {
		this.radius =  Math.round(this.width / 2);
	}else{
		this.radius =  Math.round(this.height / 2);
	}
	
	this.isInverted		= (typeof props.isInverted != "undefined") ? props.isInverted : false;
	this.centerZero		= (typeof props.centerZero != "undefined") ? props.centerZero : false;
	
	if(_protocol == "MIDI") {
		if(typeof props.midiStartingValue == "undefined" && this.centerZero) {
			this.value = 63;
		}
	}
	
	this.rotationValue  = (this.value + Math.abs(this.min)) / (this.max - this.min);
	this.knobBuffer = 1;
	
	this.lastValue = this.value;
	this.usesRotation = (typeof props.usesRotation != "undefined") ? props.usesRotation : true;
	
	if(this.centerZero)
		this.lastPosition = 0;
	else
		this.lastPosition = -1;
	
	this.canvas = document.createElement('canvas');
	$(this.canvas).addClass('widget knob');

	if(control.orientation == 0 || control.orientation == 180)  
		this.height = this.width;
	else
		this.width = this.height;
	
	this.canvas.width = this.width;						// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
	this.canvas.height = this.width;					// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
	this.ctx.appendChild(this.canvas);

	//this.canvas.style.border = "1px solid #fff";
	this.canvas.style.top = this.y + "px";
	this.canvas.style.left = this.x + "px";
	this.canvas.style.position = "absolute";
	
	this.displayValue = props.displayValue;
	
	this.canvasCtx = this.canvas.getContext('2d');
	
    if (typeof props.label != "undefined" || props.displayValue == true) {
        this.text = props.label;
        this.labelSize = props.labelSize || 12;
        {
			var _width, _height, _x, _y;
			
			_width = .1 + (props.radius * .15);
			_height = (this.labelSize + 4) / control.deviceHeight;
			_x = props.x + (props.radius / 2) - (_width / 2);
			_y = props.y + (props.radius / 3) - _height / 2;

            this.label = {
				"name":  	this.name + "Label",
				"type":  	"Label", 
 				"bounds":   [_x, _y, _width, _height],
				"color": 	this.strokeColor, 
				"value": 	this.text,
				"size" : 	props.labelSize || 12,
 				"backgroundColor": "rgba(127, 127, 127, .75)",				
			};
                        
            var _w = control.makeWidget(this.label);
            control.widgets.push(_w);
	        if(!control.isAddingConstants)
	            control.addWidget(_w, control.currentPage); // PROBLEM
	        else
	            control.addConstantWidget(_w); // PROBLEM
  
            this.label = _w;
        }
    }

    this.setValue(this.value, false);
    
    return this;
}


Knob.prototype = new Widget();

Knob.prototype.draw = function() {
    this.canvasCtx.clearRect(0, 0, this.width,this.height);
    this.canvasCtx.fillStyle = this.backgroundColor;
    this.canvasCtx.strokeStyle = this.strokeColor;
    this.canvasCtx.lineWidth = 1.5;	

    var angle0 = Math.PI * .6;
    var angle1 = Math.PI * .4;
    
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(this.radius, this.radius, this.radius - this.knobBuffer, angle0, angle1, false);
    this.canvasCtx.arc(this.radius, this.radius, (this.radius - this.knobBuffer) * 0.3 , angle1, angle0, true);		
    this.canvasCtx.closePath();
    this.canvasCtx.fill();

    this.canvasCtx.stroke();
    
    this.canvasCtx.fillStyle = this.fillColor;
    if(this.centerZero) {
        var angle3 = Math.PI * 1.5;
        var angle4 = Math.PI * (1.5 + (.9 * (-1 + (this.rotationValue * 2))));
        
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(this.radius , this.radius, this.radius -  this.knobBuffer, angle3, angle4, (this.rotationValue < .5));
        this.canvasCtx.arc(this.radius , this.radius, (this.radius - this.knobBuffer) * 0.3,  angle4, angle3, (this.rotationValue > .5));
        this.canvasCtx.closePath();
        /*if(this.rotationValue == .5) { // draw circle if centered?
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(this.radius , this.radius, (this.radius -  this.knobBuffer) * .3, 0, Math.PI*2, true); 
            this.canvasCtx.closePath();
        }*/
        this.canvasCtx.fill();
    } else {
        if(!this.isInverted)   
            var angle2 = Math.PI * (0.6 + (1.8 * this.rotationValue));
        else
            var angle2 = Math.PI * (0.4 - (1.8 * this.rotationValue));
        
        this.canvasCtx.beginPath();
        if(!this.isInverted) {
            this.canvasCtx.arc(this.radius, this.radius, this.radius - this.knobBuffer, angle0, angle2, false);
            this.canvasCtx.arc(this.radius, this.radius, (this.radius - this.knobBuffer) * 0.3, angle2, angle0, true);
        } else {
            this.canvasCtx.arc(this.radius, this.radius, this.radius - this.knobBuffer, angle1, angle2 ,true);
            this.canvasCtx.arc(this.radius, this.radius, (this.radius - this.knobBuffer) * 0.3, angle2, angle1, false);
        }
        this.canvasCtx.closePath();
        this.canvasCtx.fill();
    }
}

Knob.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1];
    this.strokeColor = newColors[2];
    
    this.draw();
}

Knob.prototype.setBounds = function(newBounds) {
    this.width = Math.round(newBounds[2] * control.deviceWidth);
    this.height = Math.round(newBounds[3] * control.deviceHeight);
    this.x = Math.round(newBounds[0] * control.deviceWidth);
    this.y = Math.round(newBounds[1] * control.deviceHeight);
    
    this.canvas.width = this.width;						// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
    this.canvas.height = this.width;					// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
    this.canvas.style.top = this.y + "px";
    this.canvas.style.left = this.x + "px";
    
    if(control.orientation == 0 || control.orientation == 180) {
        this.radius =  Math.round(this.width / 2);
    }else{
        this.radius =  Math.round(this.height / 2);
    }
    this.draw();
}

Knob.prototype.event = function(event) {
    touch = event.changedTouches.item(0);
    
    if(event.type == "touchstart" && this.hitTest(touch.pageX, touch.pageY)) { // if touch starts over this widget
        this.activeTouches.push(touch.identifier);
        this.lastPosition = touch.pageY;
        this.changeValue(touch.pageY, touch.pageX);
        eval(this.ontouchstart);		
    } else {
        for(i in this.activeTouches) {
            if(event.type == "touchmove" && touch.identifier == this.activeTouches[i]) {		// if moved touch ID is in the list of active touches
                this.changeValue(touch.pageY, touch.pageX);
                eval(this.ontouchmove);
            }else if(event.type == "touchend" && touch.identifier == this.activeTouches[i]) {	// if ended touch ID is in the list of active touches
                this.activeTouches.splice(i,1);	// remove touch ID from array
                this.lastPosition = -1;
                eval(this.ontouchend);
            }
        }
    }
}

Knob.prototype.setValue = function(newValue) {
    this.rotationValue = newValue;
    
    if(newValue > this.max) { 
        newValue = this.max;
    }else if(newValue < this.min) {
        newValue = this.min;
    }
	
    this.value = newValue;
    this.draw();
	
	if(typeof this.onvaluechange === "string") {
        eval(this.onvaluechange);
	}else if(this.onvaluechange != null){
		this.onvaluechange();
	}
    
	if(!(arguments[1] === false))
		this.output();
    
    this.draw();

};

Knob.prototype.changeValue = function(yinput, xinput) {
    this.lastValue = this.value;
    
    if(!this.usesRotation) {
        if (this.lastPosition != -1) this.rotationValue -= (yinput - this.lastPosition) / (this.width / (1 + 1)); // (2 + 2*this.centerZero) is magic number - fix it!
    }else{
        var xdiff = (this.x + (this.width / 2)) - xinput;
        var ydiff = (this.y + (this.height / 2)) - yinput;
        var angle = 180 + Math.atan2(ydiff, xdiff) * (180 / Math.PI);
        this.rotationValue = ((angle + 270) % 360) / 360;
    }
    
    if (this.rotationValue > 1) this.rotationValue = 1;
    if (this.rotationValue < 0) this.rotationValue = 0;
    
    //console.log("rotationValue = " + this.rotationValue);
    this.lastPosition = yinput;
    
    var range  = this.max - this.min;
    this.value = this.min + this.rotationValue * range;
    
    if(this.lastValue != this.value) {
        this.setValue(this.value);
        this.lastValue = this.value;
		if(this.displayValue)
			this.label.setValue(this.value.toFixed(3));
    }
	//Math.round(number).toFixed(2);
}

Knob.prototype.show = function() {
    this.canvas.style.display = "block";
}

Knob.prototype.hide = function() {
    this.canvas.style.display = "none";
}

Knob.prototype.unload = function() {
    this.ctx.removeChild(this.canvas);
}