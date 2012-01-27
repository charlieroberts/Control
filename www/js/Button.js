function Button(ctx, props) {
    this.make(ctx, props);
    this.ctx = ctx;
    this.mode = (typeof props.mode != "undefined") ? props.mode: "toggle";
    
    this.widgetID = -1;
    
    this.activeTouches = new Array();
    
    this.requiresTouchDown = (typeof props.requiresTouchDown == "undefined") ? true : props.requiresToucDown;
    
    this.contactOn = false;	// used to trigger flash for contact mode buttons
	
    if (typeof props.label != "undefined") {
        this.text = props.label;
        this.labelSize = props.labelSize || 12;
        {   //remove for canvas

            this.label = {
				"name": this.name + "Label",
				 "type": "Label", 
				 "bounds":[props.x, props.y, props.width, props.height], 
				 "color":this.strokeColor, 
				 "value":this.text,
				 "size":props.labelSize || 12,
			 };
                        
            var _w = control.makeWidget(this.label);
            console.log("CONTROL IS ADDING CONSTANTS = " + control.isAddingConstants);
	        if(!control.isAddingConstants) {
                console.log(_w.name + " is NOT added as constant");
                control.widgets.push(_w);                
	            control.addWidget(_w, control.currentPage); // PROBLEM
	        }else{
                console.log(_w.name + " is added as constant");
                control.constants.push(_w);
	            control.addConstantWidget(_w); // PROBLEM
            }
          
            this.label = _w;
        }
    }
    
    {   // remove for canvas
        this.fillDiv   = document.createElement("div");
        $(this.fillDiv).addClass('widget button');
        
        $(this.fillDiv).css({
            "width" 	: this.width - 2 + "px",
            "height" 	: this.height - 2 + "px",	
            "position" 	: "absolute",
            "left" 		: this.x + "px",
            "top"  		: this.y + "px",
            "border" 	: "1px solid " + this.strokeColor,
		});
        
        this.ctx.appendChild(this.fillDiv);
    }
    
    this.yOffset = 0;
    this.xOffset = 0;
    
    if (props.mode == "visualToggle") this.visualToggleLit = (this.value == this.max);
    
    this.isLit = (this.value == this.max);
    
    return this;
}

Button.prototype = new Widget();

Button.prototype.flash = function(btn) {
	return (function() {
		$(btn.fillDiv).css("background-color", btn.backgroundColor);
	});
}

Button.prototype.draw = function() {
    //console.log("drawing " + this.value );
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);
    {   // remove for canvas
        if(this.mode != "contact") {
            this.fillDiv.style.backgroundColor = (this.isLit) ? this.fillColor : this.backgroundColor;
        } else {
            this.fillDiv.style.backgroundColor = this.fillColor;
			var flashFunction = Button.prototype.flash(this);
			setTimeout(flashFunction, 50);
        }
        if(this.label != null) this.label.draw();
    }
    
//        if (this.mode != "contact") {
//            this.ctx.fillRect(this.x, this.y, this.width, this.height);
//        } else {
//            
//            this.ctx.fillStyle = this.fillColor;
//            this.ctx.fillRect(this.x, this.y, this.width, this.height);
//            var str = "gButton" + parseInt(Math.random() * 10000);
//            eval(str + " = this;");
//            
//            var evalString = 'setTimeout(function() {'+str+'.ctx.fillStyle =' + str + '.backgroundColor;'+str+'.ctx.fillRect('+str+'.x, '+str+'.y, '+str+'.width, '+str+'.height);' + str + '.drawLabel();'+str+'.ctx.lineWidth = 1; '+str+'.ctx.strokeStyle = '+str+'.color; '+str+'.ctx.strokeRect('+str+'.x, '+str+'.y, '+str+'.width, '+str+'.height);}, 50);';
//            //var evalString = 'setTimeout(function() {' + str + '.contactOn = false;' + str + '.draw();}, 50);';
//            //console.log(evalString);
//            eval(evalString);
//        }
//        
//        this.drawLabel();
//        this.ctx.lineWidth = 1;
//        this.ctx.strokeStyle = this.color;
//        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
}

Button.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1];
    this.strokeColor = newColors[2];
    
    this.fillDiv.style.border = "1px solid " + this.strokeColor;
    this.draw();
}

Button.prototype.setBounds = function(newBounds) {
    this.width = Math.round(newBounds[2] * control.deviceWidth);
    this.height = Math.round(newBounds[3] * control.deviceHeight);
    this.x = Math.round(newBounds[0] * control.deviceWidth);
    this.y = Math.round(newBounds[1] * control.deviceHeight);
    
    this.fillDiv.style.width  = this.width - 2 + "px";
    this.fillDiv.style.height = this.height - 2 + "px";
    this.fillDiv.style.left = this.x  + "px";
    this.fillDiv.style.top  = this.y  + "px";
    
    if(typeof this.label != "undefined") {
        this.label.setBounds(newBounds);
    }
}

Button.prototype.drawLabel = function() {
    if (typeof this.text != "undefined") {
        this.ctx.fillStyle = this.strokeColor;
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = "center";
        //this.ctx.font = this.labelSize + "px helvetiker";
        this.ctx.font = '12px sans-serif';
        
        this.ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
}

Button.prototype.touchstart = function(touch, isHit) {
    if (isHit) {
        this.xOffset = (touch.pageX - this.x) / (this.width - this.x);
        this.yOffset = (touch.pageY - this.y) / (this.height - this.y);
        this.activeTouches.push(touch.identifier);
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
		
		if(typeof this.ontouchstart === "string") {
	        eval(this.ontouchstart);
		}else{
			this.ontouchstart();
		} 
		return true;      
    }
	return false;
}

Button.prototype.touchmove = function(touch, isHit) {
    var shouldChange = true;
    var rollOff = false;
    if (!this.requiresTouchDown) {
        var touchFound = false;
        var l = this.activeTouches.length;
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
                
    if (shouldChange && isHit && !this.requiresTouchDown) {
        switch (this.mode) {
            case "toggle":
                this.value = (this.value == this.min) ? this.max: this.min;
                this.isLit = (this.value == this.max);
                break;
            case "visualToggle":
                this.value = this.max;
                this.isLit = !this.isLit;
                break;
            case "latch":
                this.value = this.max;
                this.isLit = true;
                break;
            case "momentary":
                if (!rollOff) {
                    this.value = this.max;
                    this.isLit = true;
                } else {
                    this.value = this.min;
                    this.isLit = false;
                }
                break;
            case "contact":
                this.value = this.max;
                break;
        }
		
		if(typeof this.ontouchmove === "string")
	        eval(this.ontouchmove);
		else if(this.ontouchmove != null)
			this.ontouchmove();
			
		if(typeof this.onvaluechange === "string") 
			eval(this.onvaluechange);
		else if(this.ontouchmove != null)
			this.onvaluechange();

        this.output();
        this.draw();
    } else if (rollOff && this.mode == "momentary") {
        this.value = this.min;
        this.isLit = false;
		if(typeof this.onvaluechange === "string") 
            eval(this.onvaluechange);
		else if(this.onvaluechange != null)
            this.onvaluechange();
        
        this.output();
        this.draw();
    }
	return false;
}

Button.prototype.touchend = function(touch, isHit) {
    if (isHit || this.mode == "latch" || this.mode == "momentary") {
        for (var i = 0; i < this.activeTouches.length; i++) {
            if (touch.identifier == this.activeTouches[i]) {
                this.activeTouches.splice(i, 1);
                // remove touch ID from array
                            
                if (this.mode == "latch" || this.mode == "momentary") {
                    this.isLit = false;
                    this.value = this.min;
                    eval(this.onvaluechange);
                    this.draw();
                    this.output();
                }
                            
                if(typeof this.ontouchend === "string") 
                    eval(this.ontouchend);
                else if(this.ontouchend != null)
                    this.ontouchend();
				
				return true;
            }
        }
    }
	return false;
}

Button.prototype.events = { 
	"touchstart": Button.prototype.touchstart, 
	"touchmove" : Button.prototype.touchmove, 
	"touchend"  : Button.prototype.touchend,
};

Button.prototype.event = function(event) {
    for (var j = 0; j < event.changedTouches.length; j++){
        var touch = event.changedTouches.item(j);
		
        var isHit = this.hitTest(touch.pageX, touch.pageY);
		var breakCheck = this.events[event.type].call(this, touch, isHit);
		
        if(breakCheck) break;
    }
}

Button.prototype.output = function() {
    if (!this.isLocal && control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.value;
        control.valuesString += valueString;
    } else if (!this.isLocal && control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber + "," + Math.round(this.value);
        control.valuesString += valueString;
    }
}

Button.prototype.setValue = function(newValue) {
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
    }
    
    //this.label.draw();
    this.draw();
    if (! (arguments[1] === false))
        eval(this.onvaluechange);
    if (! (arguments[1] === false)) {
        this.output();
    }
}

Button.prototype.show = function() {
    //this.draw();
    this.fillDiv.style.display = "block";
}

Button.prototype.hide = function() {
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);    
    this.fillDiv.style.display = "none";
}

Button.prototype.unload = function() {
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);
    if(typeof this.label !== 'undefined') {
        control.removeWidgetWithName(this.name + "Label");
    }

    this.ctx.removeChild(this.fillDiv);
}