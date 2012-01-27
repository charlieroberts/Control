// Compass is a singleton object.

function ControlCompass(props) {
	this.make("sensor", props);
		
    this.hardwareMin = 0;
    this.hardwareMax = 360;
    this.hardwareRange = this.hardwareMax - this.hardwareMin;
    
	if(control.protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : 360;
		this.min = (typeof props.min != "undefined") ? props.min : 0;			
	}
    this.userDefinedRange = this.max - this.min;
    
    return this;
}

ControlCompass.prototype = new Widget();

ControlCompass.prototype._onCompassUpdate = function(_heading) {
    this.value = this.min + (((0 - this.hardwareMin) + _heading) / this.hardwareRange ) * this.userDefinedRange;
    
    if(!this.isLocal && control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.value;
        control.valuesString += valueString;
    }else if (!this.isLocal && control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.value);
        control.valuesString += valueString;
    }

    if(this.onchange != null) {
        eval(this.onvaluechange);
    }
}

this.draw = function() {}

this.start = function() {
    PhoneGap.exec("Compass.start", null);
}

this.unload = function() {
    PhoneGap.exec("Compass.stop", null);
}
    
return this;
}