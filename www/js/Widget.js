// TODO: Make Accelerometer, Gyro etc. also work as widgets even though they're not visible. A lot of code could be reused this way
function Widget(ctx, props) { // x, y, width, height, color, startingValue, stroke, protocol) {

	if(ctx != null) {
        this.name = props.name;
		this.ctx = ctx;
		this.widgetType = props.type;
		if(typeof props.bounds != "undefined") {
			props.x = props.bounds[0];
			props.y = props.bounds[1];
			props.width = props.bounds[2];
			props.height = props.bounds[3];
		}
		//debug.log("x = " + props.x + " :: y = " + props.y + " :: width = " + props.width + " :: height = " + props.height);
		if(typeof props.x == "undefined") props.x = 0;
		if(typeof props.y == "undefined") props.y = 0;		
		this.x = Math.round(parseFloat(control.deviceWidth) * props.x);
		this.y = Math.round(parseFloat(control.deviceHeight) * props.y);
		//debug.log("x = " + this.x + " :: y = " + this.y);
		
		if(typeof props.width  == "undefined") props.width  = .2;
		if(typeof props.height == "undefined") props.height = .2;	
		this.width = Math.round(parseFloat(control.deviceWidth)* props.width);
		this.height = Math.round(parseFloat(control.deviceHeight) * props.height);
	
		//debug.log("width = " + this.width + " :: height = " + this.height);
		this.shouldSend = false;

		this.activeTouches = new Array();
        
		var widgetColor = (typeof props.color != "undefined") ? props.color : "#ffffff";
		this.color =  widgetColor;
		this.stroke = props.stroke || widgetColor;
		
		this.isLocal = (typeof props.isLocal != "undefined") ? props.isLocal : false;
		
		if(typeof props.midi != "undefined") {
			props.midiType = props.midi[0];
			props.channel = props.midi[1];
			props.midiNumber = props.midi[2];
		}
		
		this.midiType   = (typeof props.midiType != "undefined") ? props.midiType : "cc";
		this.channel	= (typeof props.channel != "undefined") ? props.channel : 1;
		this.midiNumber = (typeof props.midiNumber != "undefined") ? props.midiNumber : 0;
            
		if(props.name == "refreshButton") debug.log("after type / channel / number");
		
		if(typeof props.address != "undefined") { 
			this.address = props.address;
		}else{
			this.address = "/" + this.name;
		}   

		if(_protocol == "MIDI") {
			if(typeof props.midiRange != "undefined") {
				props.midiMin = props.midiRange[0];
				props.midiMax = props.midiRange[1];
			}
			this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
			this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
			this.value = (typeof props.midiStartingValue != "undefined") ? props.midiStartingValue : this.min;			
		}else{
			if(typeof props.range != "undefined") {
				props.min = props.range[0];
				props.max = props.range[1];
			}
			this.max = (typeof props.max != "undefined") ? props.max : 1;
			this.min = (typeof props.min != "undefined") ? props.min : 0;			
			this.value = (typeof props.startingValue != "undefined") ? props.startingValue : this.min;			
		}
		
		//this.value = (typeof props.startingValue != "undefined") ? props.startingValue : this.min;
		
		this.ontouchstart  = (typeof props.ontouchstart  != "undefined") ? props.ontouchstart  : null; 
		this.ontouchmove   = (typeof props.ontouchmove   != "undefined") ? props.ontouchmove   : null;
		this.ontouchend    = (typeof props.ontouchend    != "undefined") ? props.ontouchend    : null;
        this.onvaluechange = (typeof props.onvaluechange != "undefined") ? props.onvaluechange : null;
        this.oninit		   = (typeof props.oninit        != "undefined") ? props.oninit        : null;
	}		
	
	return this;
}

Widget.prototype.hitTest = function(x,y) { 
	if(x >= this.x && x < this.x + this.width) {
		if(y >= this.y && y < this.y + this.height) {  
			return true;
		} 
	}
	return false;
}

Widget.prototype.setValue = function(newValue) {
    if(newValue > this.max) { 
        newValue = this.max;
    }else if(newValue < this.min) {
        newValue = this.min;
    }
    this.value = newValue;
    this.draw();    
    eval(this.onvaluechange);
	if(!(arguments[1] === false))
		this.output();
}

Widget.prototype.setValueNoOutput = function(newValue) {
	if(newValue > this.max) { 
        newValue = this.max;
    }else if(newValue < this.min) {
        newValue = this.min;
    }
    this.value = newValue;
    this.draw();    
    eval(this.onvaluechange);
}

Widget.prototype.output = function() {
    if(!this.isLocal && _protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.value;
        control.valuesString += valueString;
    }else if (!this.isLocal && _protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.value);
        control.valuesString += valueString;
    }
}

Widget.event = function(event) {
  if(event.type != "touchend") {
    touch = event.changedTouches.item(0);
    if(this.hitTest(touch.pageX, touch.pageY)) {
      this.changeValue(touch.pageX);
    }
  }
}