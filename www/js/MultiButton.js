// TODO: Allow Canvas drawing instead of individual children... for large numbers of children this gets too slow.
function MultiButton(ctx, props) {
    this.make(ctx,props);
	this.ctx = ctx;

	this.widthInPercentage  = props.width || props.bounds[2];
	this.heightInPercentage = props.height || props.bounds[3];

    this.mode    = (typeof props.mode != "undefined") ? props.mode : "toggle";
	this.children = [];
    
	this.origX = props.x;
	this.origY = props.y;
	
	this.rows    = (typeof props.rows    != "undefined") ? props.rows    : 2;
	this.columns = (typeof props.columns != "undefined") ? props.columns : 2;
	
	this.pixelWidth  = 1 / control.deviceWidth;
	this.pixelHeight = 1 / control.deviceHeight;
	
	this.buttonWidth  = this.widthInPercentage  / this.columns + this.pixelWidth;
	this.buttonHeight = this.heightInPercentage / this.rows + this.pixelHeight;
	
	this.buttonWidthInPixels  = Math.round(parseInt(this.width)  / this.columns);
	this.buttonHeightInPixels = Math.round(parseInt(this.height) / this.rows);
	
	this.shouldLabel = (typeof props.shouldLabel != "undefined") ? props.shouldLabel : false;
	this.labelSize = props.labelSize || 12;
    
    this.shouldUseCanvas = (typeof props.shouldUseCanvas == "undefined") ? false : props.shouldUseCanvas;

    this.touched = [];
	    
	this.requiresTouchDown = (typeof props.requiresTouchDown == "undefined") ? false : props.requiresTouchDown;
    
    return this;
}

MultiButton.prototype = new Widget();

MultiButton.prototype.init = function() {
    if(!this.shouldUseCanvas) {
        var pixelWidth  = 1 / control.deviceWidth;
        var pixelHeight = 1 / control.deviceHeight;
        for(var i = 0; i < this.rows; i++) {
            var _y = this.buttonHeight * i - (i * pixelHeight);
            
            for(var j = 0; j < this.columns; j++) {
                var _x = this.buttonWidth * j - (j * pixelWidth);
                var newProps = {
                    "x":            this.origX + _x,
                    "y":            this.origY + _y,
                    "width":        this.buttonWidth, 
                    "height":       this.buttonHeight,
                    
                    "colors":       [this.backgroundColor, this.fillColor, this.strokeColor],
                    
                    "min":          this.min,
                    "max":          this.max,
                    "midiMin":      this.min,
                    "midiMax":      this.max,
            
                    "startingValue":    this.value,
                    "midiStartingValue":this.value,

                    "mode":         this.mode,
                    
                    "ontouchstart": this.ontouchstart,
                    "ontouchmove":  this.ontouchmove,
                    "ontouchend":   this.ontouchend,
                    "onvaluechange":this.onvaluechange,
                    
                    "isLocal":          this.isLocal,
                    "requiresTouchDown":this.requiresTouchDown,
                    
                    "midiType":     (typeof this.midiType == "undefined") ? "cc" : this.midiType,
                    "channel" :     (typeof this.channel != "undefined") ? this.channel : 1,
                };
                
                if(this.shouldLabel) {
                    newProps.label      = (1 + (i * this.columns) + j);
                    newProps.labelSize  = this.labelSize;
                }
                
                var _w = new Button(this.ctx, newProps);
                _w.address    = this.address + "/" + ((i * this.columns) + j);
                _w.midiNumber = this.midiNumber + ((i * this.columns) + j);
                _w.childID = ((i * this.columns) + j);
                this.children.push(_w);
            }						
        }
    }else{
        this.canvas = document.createElement('canvas');
        this.canvas.style.border = this.stroke + " 1px solid";
        this.canvas.style.top = 0;
        this.canvas.style.left = this.x;
        this.canvas.style.position = "absolute";
        this.canvas.width = parseInt(this.width);
        
        //console.log("width = " + this.canvas.width + " height = " + this.canvas.height);
        this.canvas.height = parseInt(this.height);
        this.canvasCtx = this.canvas.getContext('2d');;
        this.ctx.appendChild(this.canvas);
        for(var i = 0; i < this.rows; i++) {                
            for(var j = 0; j < this.columns; j++) {
                this.children.push( {
                    "value":this.min, 
                    "touches":[], 
                    "buttonNumber":i * this.columns + j, 
                    "ontouchstart":this.ontouchstart,
                    "ontouchmove":this.ontouchmove,
                    "ontouchend":this.ontouchend,
                    "onvaluechange":this.onvaluechange,
                } );
            }
        }
    }
}

MultiButton.prototype.draw = function() {
    if(!this.shouldUseCanvas) {
        for(var i = 0; i < this.children.length; i++) {
            var _w = this.children[i];
            _w.draw();
        }
    }else{
        for(var i = 0; i < this.children.length; i++) {
            this.drawButton(i);
        }
    }
}

MultiButton.prototype.drawButton = function(buttonNumber) {
    //console.log("drawing button " + buttonNumber + " value :: " + this.children[buttonNumber].value);
    var row = Math.floor(buttonNumber / this.columns);
    var col = buttonNumber % this.columns;
    var _y = this.y + this.buttonHeightInPixels * row;
    var _x = this.x + this.buttonWidthInPixels * col;
    
    this.canvasCtx.fillStyle = (this.children[buttonNumber].value == this.max) ? this.fillColor : this.backgroundColor;
    this.canvasCtx.strokeStyle = this.stroke;
    this.canvasCtx.strokeRect(_x, _y, this.buttonWidthInPixels - 1, this.buttonHeightInPixels - 1 );
    //console.log("drawing x :: " + _x + " _y :: " + _y + " width :: " + this.buttonWidthInPixels + " height :: " + this.buttonHeightInPixels);
    this.canvasCtx.fillRect(_x, _y, this.buttonWidthInPixels - 1, this.buttonHeightInPixels - 1);

}

MultiButton.prototype.show = function() {
    if(!this.shouldUseCanvas) {
    
        for(var i = 0; i < this.children.length; i++) {
            var _w = this.children[i];
            _w.show();
        }
    }
}

MultiButton.prototype.hide = function() {
    if(!this.shouldUseCanvas) {

        for(var i = 0; i < this.children.length; i++) {
            var _w = this.children[i];
            _w.hide();
        }
    }
}

// keep track of an array of buttons that have already -had- touch starts. only call ontouchend / ontouchmove on those buttons
// for ontouchmove -also- call the event using the same method as ontouchstart. This checks to see if buttons have been rolled on to; the array will check to see if they've
// been rolled off of.

MultiButton.prototype.touchstart = function(touch) {
    for (var j = 0; j < event.changedTouches.length; j++) {
        var touch = event.changedTouches.item(j);
	    if(this.shouldUseCanvas == false) {
	        var colNumber = Math.floor((touch.pageX - this.x) / this.buttonWidthInPixels);
	        if(colNumber < 0 || colNumber > this.columns) return;
                
	        var rowNumber = Math.floor((touch.pageY - this.y) / this.buttonHeightInPixels);
	        if(rowNumber < 0 || rowNumber > this.rows) return;
                
	        var buttonNumber = (rowNumber * this.columns) + colNumber;
                
	        if(this.children[buttonNumber] != null && typeof this.children[buttonNumber] != "undefined")
	            this.children[buttonNumber].event(event);
        }else{
	    	if(this.hitTest(touch.pageX, touch.pageY)) {
	        	var colNumber = Math.floor((touch.pageX - this.x) / this.buttonWidthInPixels);
	            //if(colNumber < 0 || colNumber > this.columns) return;
	            if(colNumber > this.columns - 1) colNumber = this.columns - 1;
                    
	            var rowNumber = Math.floor((touch.pageY - this.y) / this.buttonHeightInPixels);
	            if(rowNumber < 0 || rowNumber > this.rows) return;
                    
	            var buttonNumber = (rowNumber * this.columns) + colNumber;
	            var shouldSend = true;
                    
	            var btn = this.children[buttonNumber];
	            btn.touches.push(touch.identifier);
	                /*if(btn.value != this.max)*/ this.setValue(buttonNumber, this.max);
	            this.touched.push(btn);
	        }
        }
	}
}

MultiButton.prototype.touchmove = function(event) {
    if(this.shouldUseCanvas == false) {	
	    for(var i = 0; i < this.children.length; i++) {
	        var _w = this.children[i];
			// TODO: must also send result of hittest due to Button event refactoring... maybe that should be changed in Button? maybe each event should include hittest
	        _w.event.call(_w, event);
	    }
	}else{
        for (var j = 0; j < event.changedTouches.length; j++){
            var touch = event.changedTouches.item(j);
            var colNumber = Math.floor((touch.pageX - this.x) / this.buttonWidthInPixels);
            if(colNumber > this.columns - 1) colNumber = this.columns - 1;
                
            var rowNumber = Math.floor((touch.pageY - this.y) / this.buttonHeightInPixels);
            if(rowNumber < 0 || rowNumber > this.rows) return;
                
            var buttonNumber = (rowNumber * this.columns) + colNumber;
                
            if(this.children[buttonNumber] != null && typeof this.children[buttonNumber] != "undefined") {
                var shouldCreateNewTouchOnButton = true;
                for(var i = 0; i < this.touched.length; i++) {
                    if(this.touched[i].buttonNumber == buttonNumber) {shouldCreateNewTouchOnButton = false; break;}   // touch already entered, still on button
                }
                                                                          // touch not newly entered, processing for currently lit buttons
                    
                for(var i = 0; i < this.touched.length; i++) {
                    var prevTouchedButton = this.touched[i];
                    if(!this.shouldUseCanvas) {
                        var _w = this.children[prevTouchedButton.buttonNumber];
                        _w.event(event);
                        if(_w.value != _w.max) this.touched.splice(i,1);   
                    }else{
                        // see if button is not hit but contains touch
                        if(buttonNumber != prevTouchedButton.buttonNumber) {                // if the button current touched != the button we're checking against
                            for(var k = 0; k < prevTouchedButton.touches.length; k++) {     // loop through all the touches that have touched the button we're checking
                                if(prevTouchedButton.touches[k] == touch.identifier) {      // if the current touch was once touching the button we're checking but no longer is...
                                    prevTouchedButton.touches.splice(k,1);                  // ... remove the current touch from the button we're checking
                                    if(prevTouchedButton.touches.length <= 0) {             // ... if the button we're checking has no other touches assigned to it
                                        this.touched.splice(i,1);                           // remove it from the array of touched buttons
                                        if(prevTouchedButton.value != this.min) {           // and set the value to this.min if it isn't already
                                            this.setValue(prevTouchedButton.buttonNumber, this.min);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if(shouldCreateNewTouchOnButton && this.hitTest(touch.pageX, touch.pageY)) { // touch not entered, newly on button
                    this.touched.push( this.children[buttonNumber] );
                    if(!this.shouldUseCanvas) {
                        this.children[buttonNumber].event(event);
                    }else{
                        this.children[buttonNumber].touches.push(touch.identifier);
                        this.setValue(buttonNumber, this.max);
                    }
                }
            }
        }  
    }
}

MultiButton.prototype.touchend = function(touch) {
    if(this.shouldUseCanvas == false) {	
	    for(var i = 0; i < this.children.length; i++) {
	        var _w = this.children[i];
	        _w.event(event);
	    }
	}else{
	    for (var j = 0; j < event.changedTouches.length; j++){
	        var touch = event.changedTouches.item(j);
	        for(var i = 0; i < this.touched.length; i++) {
	            var btn = this.touched[i];
	            for(var k = 0; k < btn.touches.length; k++) {
	                if(btn.touches[k] == touch.identifier) {
	                    btn.touches.splice(k, 1);
	                    if(btn.touches.length <= 0) {
	                        this.setValue(btn.buttonNumber, this.min);
	                        this.touched.splice(i,1);
	                    }
	                }
	            }                        
	        }
	    }
	}
}

MultiButton.prototype.events = { 
	"touchstart": MultiButton.prototype.touchstart, 
	"touchmove" : MultiButton.prototype.touchmove, 
	"touchend"  : MultiButton.prototype.touchend,
};

MultiButton.prototype.event = function(event) {
	this.events[event.type].call(this, event);
}
MultiButton.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1];
    this.strokeColor = newColors[2];
    
    if(!this.shouldUseCanvas) {
        for(var i = 0; i < this.children.length; i++) {
            this.children[i].setColors(newColors);
        }
    }else{
        this.draw();
    }
}
MultiButton.prototype.setValue = function(buttonNumber, value) {
    if(!this.shouldUseCanvas) {
        var _w = this.children[buttonNumber];
        if(arguments[2] === false) {
            _w.setValue(value, false);
        }else{
            _w.setValue(value);
        }
    }else{
        // TODO: need to output actual values
        this.lastChanged = this.children[buttonNumber];
        this.lastChanged.value = value;
        if(arguments[2] != false) {
            eval(this.lastChanged.onvaluechange);
        }
        this.drawButton(buttonNumber);
    }
}

MultiButton.prototype.unload = function() {
    if(!this.shouldUseCanvas) {
        for(var i = 0; i < this.children.length; i++) {
            this.children[i].unload();
        }
    }else{
        this.ctx.removeChild(this.canvas);
    }
}

MultiButton.prototype.show = function() {
    if(!this.shouldUseCanvas) {
        for(var i = 0; i < this.children.length; i++) {
            this.children[i].show();
        }
    }else{
        $(this.canvas).show();
    }
}

MultiButton.prototype.hide = function() {
    if(!this.shouldUseCanvas) {
        for(var i = 0; i < this.children.length; i++) {
            this.children[i].hide();
        }
    }else{
        $(this.canvas).hide();
    }
}