//this.divs[page],w.x,w.y,w.width,w.height,w.color,w.isMomentary,w.startingValue,w.ontouchstart,w.ontouchend,w.protocol,w.min,w.max,w.requiresTouchDown

/**
 * A widget representing a simple rectangular button.
 * @class
 * @param {Object} ctx The HTML Div holding all widgets
 * @param {Number} x The x position for the widget, from 0.0 to 1.0
 * @param {Number} y The y position for the widget, from 0.0 to 1.0 
 * @param {Number} width The width for the widget, from 0.0 to 1.0
 * @param {Number} height The width for the widget, from 0.0 to 1.0
 * @param {String} color The color of the widget in HTML/CSS hexadecimal color format, ex: #ff00ff
 * @param {String} mode select between the following button behaviors:
                        latch (outputs max when pressed or rolled onto, min when released NOT min when rolled off) 
                        toggle (switches between outputting min and max on press)
                        momentary (outputs max when pressed or rolled onto, outputs min when released or rolledOff)
                        contact (outputs max on initial contact never outputs min)
                        visualToggle (always outputs max but toggles visual state)
                        
 * @param {Number} startingValue The original value for the widget
 * @param {String} ontouchstart JavaScript to be executed whenever the widget is first touched
 * @param {String} ontouchend JavaScript to be executed whenever a touch is lifted from the widget
 * @param {String} protocol What protocol the widget outputs (e.g. OSC or MIDI) 
 * @param {Number} min The value the button outputs when toggled off (only works if isMomentary = false)
 * @param {Number} max The value the button outputs when toggled on, or every time it's pressed if isMomentary = true
 * @param {Boolean} requiresTouchDown Button only activates if touchdown occurs on widget, if equal to true it will not
                                      activate if a touch starts outside the button and rolls over it
 */
	
function Button(ctx, props) {
	this.__proto__ = new Widget(ctx,props);
	
	this.mode = (typeof props.mode != "undefined") ? props.mode : "toggle";
    
	this.widgetID = -1;
	
	this.activeTouches = new Array();

	if(typeof props.requiresTouchDown == "undefined") {
		this.requiresTouchDown = true;
	}else{
		this.requiresTouchDown = props.requiresTouchDown;
	}
	
	this.yOffset = 0;
	this.xOffset = 0;
	
	/**
	    fillDiv is the DIV tag representing the button in the DOM
	*/
	this.fillDiv   = document.createElement("div");
	this.fillDiv.style.width = this.width + "px";
	this.fillDiv.style.height = this.height + "px";	
	this.fillDiv.style.position = "absolute";
	this.fillDiv.style.left = this.x + "px";
	this.fillDiv.style.top  = this.y + "px";
    this.stroke = (typeof props.stroke != "undefined") ? props.stroke : "#ffffff";
	this.fillDiv.style.border = "1px solid " + this.stroke;
	
	this.ctx.appendChild(this.fillDiv);
    
	/**
	    The current value of the button
	*/
    if(props.mode == "visualToggle") this.visualToggleLit = (this.value == this.max);
    
    this.isLit = (this.value == this.max);
    
	/**
	 * The drawing routine for the widget
	 */
	this.draw = function() {
        if(this.mode != "contact") {
            this.fillDiv.style.backgroundColor = (this.isLit) ? this.color : "rgb(0,0,0)";
        } else {
            this.fillDiv.style.backgroundColor = this.color;
            var str = "gButton"+parseInt(Math.random()*10000);
            eval(str + " = this;");
            var evalString = 'setTimeout(function() {'+str+'.fillDiv.style.backgroundColor="#000";}, 50)';
            eval(evalString);
        }
	}

	
	/**
	 * The event handler for the widget
     * @param {Object} event The event object containing the type of event, touch coordinates etc.	 
	 */
	this.event = function(event) {
		for (var j = 0; j < event.changedTouches.length; j++){
			var touch = event.changedTouches.item(j);
			breakCheck = false;
			var isHit = this.hitTest(touch.pageX, touch.pageY);
			//if(isHit) console.log("button " + this.name + " is hit");
			//if(!isHit && this.mode == "contact") return; // needed for moving on and off of !requiresTouchDown button without releasing touch
            var newValue;
			switch(event.type) {
				case "touchstart":
					if(isHit) {
						this.xOffset = (touch.pageX - this.x) / (this.width - this.x);
						this.yOffset = (touch.pageY - this.y) / (this.height- this.y);	
						this.activeTouches.push(touch.identifier);
                        switch(this.mode){ 
                            case "toggle" :
                                newValue = (this.value == this.min) ? this.max : this.min;
                                break;
                            case "visualToggle" :
                                newValue = this.max;
                                this.visualToggleLit = ! this.visualToggleLit;
                                break;    
                            case "latch" : case "momentary" :
                                newValue = this.max;
                                break;
                            case "contact" :
                                newValue = this.max;
                                break;
                        }
                        this.setValue(newValue);
                        eval(this.ontouchstart);                        
                        //this.output();
                        //this.draw();
                        return;
					}
					
					break;
				case "touchmove":
					var shouldChange = true;
                    var rollOff = false;
					if(!this.requiresTouchDown) {
						var touchFound = false;
						var l = this.activeTouches.length;
						for(var i = 0; i < l; i++) {
							if(touch.identifier == this.activeTouches[i]) {
								shouldChange = false;

								if(isHit) {
									touchFound = true;
								}else{
                                    if(this.mode != "latch") {
                                        this.activeTouches.splice(i,1);
                                        shouldChange = true;
                                        rollOff = true;
                                    }
								}
							}
						}
						if(!touchFound && isHit) {
							this.activeTouches.push(touch.identifier);
							this.xOffset = (touch.pageX - this.x) / (this.width - this.x);
							this.yOffset = (touch.pageY - this.y) / (this.height- this.y);
                            shouldChange = true;
						}
					}

					if(shouldChange && isHit && !this.requiresTouchDown) {
						switch(this.mode){ 
                            case "toggle" :
                                this.value = (this.value == this.min) ? this.max : this.min;
                                this.isLit = (this.value == this.max);
                                break;
                            case "visualToggle" :
                                this.value = this.max;
                                this.isLit = !this.isLit;
                                break;    
                            case "latch" : 
                                this.value = this.max;
                                this.isLit = true;
                                break;
                            case "momentary" :
                                if(!rollOff) {
                                    this.value = this.max;
                                    this.isLit = true;
                                }else{
                                    this.value = this.min;
                                    this.isLit = false;
                                }
                                break;
                            case "contact" :
                                this.value = this.max;
                                break;
                        }
                        eval(this.ontouchmove);
						eval(this.onvaluechange);						                     
                        this.output();
                        this.draw();
					}else if(rollOff && this.mode == "momentary") {
                        this.value = this.min;
                        this.isLit = false;
						eval(this.onvaluechange);						
                        this.output();
                        this.draw();
                    }
					break;
				
				case "touchend":
					if(isHit || this.mode == "latch" || this.mode == "momentary") {
                        for(var i = 0; i < this.activeTouches.length; i++) {
                            if(touch.identifier == this.activeTouches[i]) {
                                this.activeTouches.splice(i,1);	// remove touch ID from array
                                breakCheck = true;

                                if(this.mode == "latch" || this.mode == "momentary") {
                                    this.isLit = false;
                                    this.value = this.min;
									eval(this.onvaluechange);
                                    this.draw();
                                    this.output();
                                }
                                eval(this.ontouchend);
                                //break;
                            }
                        }
					}
					break;
			}
        if(breakCheck) break;
		}    
	}
    
    /**
	 * Outputs the widget's value according to its protocol
	 */ 
		
	this.output = function() {
		if(!this.isLocal && _protocol == "OSC") {
            var valueString = "|" + this.address;
            valueString += ":" + this.value;
            control.valuesString += valueString;
        }else if (!this.isLocal && _protocol == "MIDI") {
            var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.value);
            control.valuesString += valueString;
        }
	}
	
    /**
	 * Sets the value of the widget, outputs the value via the widget's protocol and redraws the widget.
	 */ 
	
    this.setValue = function(newValue) {
        this.value = newValue;
        switch(this.mode){ 
            case "toggle" :
                this.isLit = (this.value == this.max);
                break;
            case "visufile://localhost/Users/charlie/Documents/code/control/iphone/www/OSCManager.jsalToggle" :
                this.isLit = (this.visualToggleLit);
                break;    
            case "latch" : case "momentary" :
                this.isLit = (this.value == this.max);
                break;
        }
        
        this.draw();
		if(!(arguments[1] === false)) 
			eval(this.onvaluechange);
		if(!(arguments[1] === false)) {
			this.output();
		}
    }
    
    /**
	 * Reveals the widget if it is hidden. Normally called when switching "pages" in an interface
	 */ 
	this.show = function() {
		this.fillDiv.style.display = "block";
	}
	
	/**
	 * Hides the widget if it is visible. Normally called when switching "pages" in an interface
	 */
	this.hide = function() {
		this.fillDiv.style.display = "none";
	}
	
	return this;
}