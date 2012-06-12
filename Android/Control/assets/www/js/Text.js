Control.Text = function(ctx, props) {
    this.make(ctx, props);
    this.ctx = ctx;   
	this.text = $("<input>");
	this.fontSize = props.fontSize;
	this.options = props.options;
	this.onvaluechange = props.onvaluechange;

	var close = this;	
	if(typeof this.onvaluechange !== "undefined") {
		$(this.text).change( function() {
			close.value = $(close.text).val();
			close.onvaluechange();
		});
	}else{
		$(this.text).change( function(obj) {
			close.value = $(close.text).val();
			Control.oscManager.sendOSC( close.address, "s", close.value );
		});
	}

	$(this.ctx).append(this.text);

	$(this.text).css({
		"display": "block",
		"position": "absolute", 
		"top": this.y, 
		"left": this.x,
		"width": this.width, 
		"height": this.height,
		"font-size": this.fontSize + "px",
	});
	
    this.events = { 
        "touchstart": Control.Text.prototype.touchstart, 
        "touchmove" : Control.Text.prototype.touchmove, 
        "touchend"  : Control.Text.prototype.touchend,
    };
    
    return this;
}

Control.Text.prototype = new Widget();

Control.Text.prototype.draw = function() { };

Control.Text.prototype.setColors = function(newColors) {
    // this.backgroundColor = newColors[0];
    // this.fillColor = newColors[1] || this.fillColor;
    // this.strokeColor = newColors[2] || this.strokeColor;
    // 
    // this.draw();
}
	
Control.Text.prototype.reposition = function() {
    this.text.style.width  = this.width - 2 + "px";
    this.text.style.height = this.height - 2 + "px";
    this.text.style.left = this.x  + "px";
    this.text.style.top  = this.y  + "px";
}

Control.Text.prototype.events = {};

Control.Text.prototype.event = function(event) {}

Control.Text.prototype.output = function() {
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
		Control.oscManager.sendOSC(this.address, 'f', this.value);
	}
}

Control.Text.prototype.setValue = function(newValue) {
    this.value = newValue;
	$(this.text).value(newValue);
	
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

Control.Text.prototype.show = function() {
    $(this.text).css("display", "block");
};

Control.Text.prototype.hide = function() {
    $(this.text).css("display", "none");
}