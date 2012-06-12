Control.Menu = function(ctx, props) {
    this.make(ctx, props);
    this.ctx = ctx;   
	this.menu = $("<select>");
	this.fontSize = props.fontSize;
	this.options = props.options;
	this.onvaluechange = props.onvaluechange;
	
	for(var i = 0; i < this.options.length; i++) {
		var opt = $("<option>");
		opt.value = this.options[i];
		$(opt).text(opt.value);
		
		if(i === 0) this.value = opt.value;
		
		$(this.menu).append(opt);
	}

	var close = this;	
	if(typeof this.onvaluechange !== "undefined") {
		$(this.menu).change( function() {
			close.value = $(close.menu).val();
			close.onvaluechange();
		});
	}else{
		$(this.menu).change( function(obj) {
			close.value = $(close.menu).val();
			Control.oscManager.sendOSC( close.address, "s", close.value );
		});
	}

	$(this.ctx).append(this.menu);

	$(this.menu).css({
		"display": "block",
		"position": "absolute", 
		"top": this.y, 
		"left": this.x,
		"width": this.width, 
		"height": this.height,
		"font-size": this.fontSize + "px",
	});
	
    this.events = { 
        "touchstart": Control.Menu.prototype.touchstart, 
        "touchmove" : Control.Menu.prototype.touchmove, 
        "touchend"  : Control.Menu.prototype.touchend,
    };
    
    return this;
}

Control.Menu.prototype = new Widget();

Control.Menu.prototype.draw = function() { };

Control.Menu.prototype.setColors = function(newColors) {
    // this.backgroundColor = newColors[0];
    // this.fillColor = newColors[1] || this.fillColor;
    // this.strokeColor = newColors[2] || this.strokeColor;
    // 
    // this.draw();
}
	
Control.Menu.prototype.reposition = function() {
    this.menu.style.width  = this.width - 2 + "px";
    this.menu.style.height = this.height - 2 + "px";
    this.menu.style.left = this.x  + "px";
    this.menu.style.top  = this.y  + "px";
}

Control.Menu.prototype.events = {};
Control.Menu.prototype.event = function(event) {}

Control.Menu.prototype.output = function() {
	if(window.device.platform === "iPhone") {
	    if (!this.isLocal && Control.protocol == "OSC") {
	        var valueString = "|" + this.address;
	        valueString += ":" + this.value;
	        Control.valuesString += valueString;
	    } else if (!this.isLocal && Control.protocol == "MIDI") {
	        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber + "," + Math.round(this.value);
	        Control.valuesString += valueString;
	    }
	}else{
		Control.oscManager.sendOSC(this.address, 's', this.value);
	}
}

Control.Menu.prototype.setValue = function(newValue) {
    this.value = newValue;
	$(this.menu).value(newValue);
	
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

Control.Menu.prototype.show = function() {
    $(this.menu).css("display", "block");
};

Control.Menu.prototype.hide = function() {
    $(this.menu).css("display", "none");
}