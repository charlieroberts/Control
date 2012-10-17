	// TODO: Make Accelerometer, Gyro etc. also work as widgets even though they're not visible. A lot of code could be reused this way
function Widget() { return this; } // x, y, width, height, color, startingValue, stroke, protocol) {

Widget.prototype.make = function(ctx, props) {
	if(ctx != null) {
		this.props = props;
        this.name = props.name;
		this.ctx = ctx;
		this.widgetType = props.type;
        
        if(this.ctx != "sensor") {
            if(typeof props.bounds != "undefined") {
                props.x = props.bounds[0];
                props.y = props.bounds[1];
                if(props.bounds.length > 3) {
                    props.width = props.bounds[2];
                    props.height = props.bounds[3];
                }else{ // radius
                    props.width = props.bounds[2];
                    props.height = props.bounds[2];
                }
            }
            if(typeof props.width  == "undefined") props.width  = .2;
            if(typeof props.height == "undefined") props.height = .2;	
//            this.width = Math.round(parseFloat(Control.deviceWidth)* props.width);
//            this.height = Math.round(parseFloat(Control.deviceHeight) * props.height);
//            console.log("DIV HEIGHT " + $("#selectedInterface").height());
//            this.width  = ($("#selectedInterface").width() / 100) * Control.deviceWidth * props.width;
//            this.height = ($("#selectedInterface").height() / 100) * Control.deviceHeight * props.height;
            
            
            this.width  = props.width  <= 1 ? $("#selectedInterface").width() * props.width   : props.width;
            this.height = props.height <= 1 ? $("#selectedInterface").height() * props.height : props.height;
            
            if(typeof props.x == "undefined") props.x = 0;
            if(typeof props.y == "undefined") props.y = 0;	
            
//            this.x = ( ($("#selectedInterface").width() /  100) * Control.deviceWidth  * props.x) + .5;
//            this.y = ( ($("#selectedInterface").height() / 100) * Control.deviceHeight * props.y) + .5;
            this.x = props.x < 1 ? ($("#selectedInterface").width() * props.x) : props.x;
            this.y = props.y < 1 ? ($("#selectedInterface").height()* props.y) : props.y;
                        
            //console.log("x = " + props.x + " :: y = " + props.y + " :: width = " + props.width + " :: height = " + props.height);

            if(typeof props.colors != "undefined") {
                this.backgroundColor = props.colors[0];
                this.fillColor = props.colors[1];
                this.color = this.fillColor;
                this.strokeColor = props.colors[2];
                this.stroke = this.strokeColor;
            }else{
                this.color =  props.color || "#cccccc";
                this.fillColor = props.fillColor || this.color;
                this.stroke = props.stroke || "#ffffff";
                this.strokeColor = props.strokeColor || this.stroke;
                this.backgroundColor = props.backgroundColor || "rgba(0,0,0,0)";
            }			
            
            this.sendPressure = false;
            this.pressureMin = 6.0;
            this.pressureMax = 13.0;
            this.pressureRange = this.pressureMax - this.pressureMin;
            this.processingTouch = null;
            
            this.activeTouches = new Array();
        }
		
        //this.events = $.extend(this.__proto__.events);
        
		this.isLocal = (typeof props.isLocal != "undefined") ? props.isLocal : false;
		
		if(typeof props.midi != "undefined") {
			props.midiType = props.midi[0];
			props.channel = props.midi[1];
			props.midiNumber = props.midi[2];
		}
		
		this.midiType   = (typeof props.midiType != "undefined") ? props.midiType : "cc";
		this.channel	= (typeof props.channel != "undefined") ? props.channel : 1;
		this.midiNumber = (typeof props.midiNumber != "undefined") ? props.midiNumber : 0;
            		
		if(typeof props.address != "undefined") { 
			this.address = props.address;
		}else{
			this.address = "/" + this.name;
		}   

		if(Control.protocol == "MIDI") {
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

Widget.prototype.form = {
    "_bounds_": "Position + Size", 
    "width": "width", 
    "height": "height", 
    "x": "x",
    "y": "y", 
    "_colors_": "Colors", 
    "backgroundColor": "background color", 
    "fillColor": "fill color", 
    "strokeColor": "stroke color", 
    "_ranges_": "Ranges", 
    "min": "osc minimum value", 
    "max": "osc maximum value",
    "midiMin": "MIDI minimum value", 
    "midiMax": "MIDI maximum value",
    "_destinations_": "Output Destination", 
    "address": "osc address", 
    "midiType": "MIDI message type", 
    "channel": "MIDI Channel", 
    "midiNumber": "MIDI Number",
    "_event handlers_": "Event Handlers", 
    "ontouchstart": "ontouchstart",  
    "ontouchmove": "ontouchmove", 
    "ontouchend": "ontouchend", 
    "onvaluechange": "onvaluechange", 
    "oninit": "oninit", 
    "_misc_": "Miscellaneous", 
    "value": "value",
    "name": "widget js name",
};

Widget.prototype.setRange = function(min, max) {
    this.min = min;
    this.max = max;
    
    this.setValue(this.value);
};

Widget.prototype.hitTest = function(x,y) { 
	if(x >= this.x && x < this.x + this.width) {
		if(y >= this.y && y < this.y + this.height) {  
			return true;
		} 
	}
	return false;
};

Widget.prototype.setValue = function(newValue) {
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
};

Widget.prototype.setValueNoOutput = function(newValue) {
	if(newValue > this.max) { 
        newValue = this.max;
    }else if(newValue < this.min) {
        newValue = this.min;
    }
    this.value = newValue;
    this.draw();    
    eval(this.onvaluechange);
};

Widget.prototype.output = function() {
    var pressure;
    if(this.sendPressure) {
        var pressureID = this.processingTouch.pageX + ":" + this.processingTouch.pageY;
        pressure = Control.pressures[pressureID];
        pressure = (pressure - this.pressureMin) / this.pressureRange;
        if(pressure > 1) {
            pressure = 1;
        }else if(pressure < 0) {
            pressure = 0;
        }
    }
    if(!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.value;
        
        if(this.sendPressure) {
            valueString += "," + pressure;
        }
                
        Control.valuesString += valueString;
        //Control.oscManager.sendOSC(this.addresss, 'f', this.value);
        //PhoneGap.exec(null, null, 'OSCManager', 'send', [this.address, 'f', this.value]);
    }else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.value);
        
        if(this.sendPressure) {
            valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber + 1) + "," + Math.round(pressure * 127);
        }

        Control.valuesString += valueString;
    }  
};

Widget.prototype.event = function(event) {
    if(event.type != "touchend") {
        touch = event.changedTouches.item(0);
        if(this.hitTest(touch.pageX, touch.pageY)) {
          this.changeValue(touch.pageX);
        }
    }
};