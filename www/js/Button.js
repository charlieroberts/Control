function Button(ctx, props) {
    this.make(ctx, props);
    this.ctx = ctx;
    this.mode = (typeof props.mode != "undefined") ? props.mode: "toggle";
    
    this.widgetID = -1;
    
    this.activeTouches = new Array();
    
    if (typeof props.requiresTouchDown == "undefined") {
        this.requiresTouchDown = true;
    } else {
        this.requiresTouchDown = props.requiresTouchDown;
    }
    
    this.contactOn = false;
    // used to trigger flash for contact mode buttons
    if (typeof props.label != "undefined") {
        this.text = props.label;
        this.labelSize = props.labelSize || 12;
        {   //remove for canvas

            this.label = {"name": this.name + "Label", "type": "Label", "bounds":[props.x, props.y, props.width, props.height], "color":this.strokeColor, "value":this.text, "size":props.labelSize || 12,};
                        
            var _w = control.makeWidget(this.label);
            control.widgets.push(_w);
            if(!control.isAddingConstants)
                eval("control.addWidget(" + _w.name + ", control.currentPage);"); // PROBLEM
            else
                eval("control.addConstantWidget(" + _w.name + ");"); // PROBLEM
            
            this.label = _w;
            //this.label.label.style.backgroundColor = "rgba(255,0,0,1)";
            //this.label.show();
            //this.label.draw();
            //this.label.label.style.zIndex = 100;
        }
    }
    
    {   // remove for canvas
        this.fillDiv   = document.createElement("div");
		  $(this.fillDiv).addClass('widget button');

        this.fillDiv.style.width = this.width - 2 + "px";
        this.fillDiv.style.height = this.height - 2 + "px";	
        this.fillDiv.style.position = "absolute";
        this.fillDiv.style.left = this.x + "px";
        this.fillDiv.style.top  = this.y + "px";
        this.fillDiv.style.border = "1px solid " + this.strokeColor;
        
        this.ctx.appendChild(this.fillDiv);
    }
    
    this.yOffset = 0;
    this.xOffset = 0;
    
    /**
     The current value of the button
     */
    if (props.mode == "visualToggle") this.visualToggleLit = (this.value == this.max);
    
    this.isLit = (this.value == this.max);
    
    return this;
}

Button.prototype = new Widget();

Button.prototype.draw = function() {
    //console.log("drawing " + this.value );
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);
    {   // remove for canvas
        if(this.mode != "contact") {
            this.fillDiv.style.backgroundColor = (this.isLit) ? this.fillColor : this.backgroundColor;
        } else {
            this.fillDiv.style.backgroundColor = this.fillColor;
            var str = "gButton"+parseInt(Math.random()*10000);
            eval(str + " = this;");
            var evalString = 'setTimeout(function() {'+str+'.fillDiv.style.backgroundColor=' + str + '.backgroundColor;}, 50)';
            eval(evalString);
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


/**
 * The event handler for the widget
 * @param {Object} event The event object containing the type of event, touch coordinates etc.	 
 */
Button.prototype.event = function(event) {
    for (var j = 0; j < event.changedTouches.length; j++) {
        var touch = event.changedTouches.item(j);
        breakCheck = false;
        var isHit = this.hitTest(touch.pageX, touch.pageY);
        //if(isHit) console.log("button " + this.name + " is hit");
        //if(!isHit && this.mode == "contact") return; // needed for moving on and off of !requiresTouchDown button without releasing touch
        var newValue;
        switch (event.type) {
            case "touchstart":
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
                    eval(this.ontouchstart);
                    //this.output();
                    //this.draw();
                    return;
                }
                
                break;
            case "touchmove":
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
                    eval(this.ontouchmove);
                    eval(this.onvaluechange);
                    this.output();
                    this.draw();
                } else if (rollOff && this.mode == "momentary") {
                    this.value = this.min;
                    this.isLit = false;
                    eval(this.onvaluechange);
                    this.output();
                    this.draw();
                }
                break;
                
            case "touchend":
                if (isHit || this.mode == "latch" || this.mode == "momentary") {
                    for (var i = 0; i < this.activeTouches.length; i++) {
                        if (touch.identifier == this.activeTouches[i]) {
                            this.activeTouches.splice(i, 1);
                            // remove touch ID from array
                            breakCheck = true;
                            
                            if (this.mode == "latch" || this.mode == "momentary") {
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
        if (breakCheck) break;
    }
}

/**
 * Outputs the widget's value according to its protocol
 */

Button.prototype.output = function() {
    if (!this.isLocal && _protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.value;
        control.valuesString += valueString;
    } else if (!this.isLocal && _protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber + "," + Math.round(this.value);
        control.valuesString += valueString;
    }
}

/**
 * Sets the value of the widget, outputs the value via the widget's protocol and redraws the widget.
 */

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

/**
 * Reveals the widget if it is hidden. Normally called when switching "pages" in an interface
 */
Button.prototype.show = function() {
    //this.draw();
    this.fillDiv.style.display = "block";
}

/**
 * Hides the widget if it is visible. Normally called when switching "pages" in an interface
 */
Button.prototype.hide = function() {
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);
    
    this.fillDiv.style.display = "none";
}

Button.prototype.unload = function() {
    //this.ctx.clearRect(this.x, this.y, this.width, this.height);
    
    this.ctx.removeChild(this.fillDiv);
}

