// Magnetometer is a singleton object.
Control.Magnetometer = function(props) {
	this.make("sensor", props);
    
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.heading = 0;
    
    this.hardwareMin = 0;
    this.hardwareMax = 360;
    this.hardwareRange = this.hardwareMax - this.hardwareMin;
    
	if(Control.protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : 360;
		this.min = (typeof props.min != "undefined") ? props.min : 0;			
	}
    this.userDefinedRange = this.max - this.min;
    this.start();
    
    return this;
}

Control.Magnetometer.prototype = new Widget();

Control.Magnetometer.prototype.onUpdate = function(_heading, x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.heading = this.min + (((0 - this.hardwareMin) + _heading) / this.hardwareRange ) * this.userDefinedRange;
    
    if(!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.heading;
        Control.valuesString += valueString;
    }else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.heading);
        Control.valuesString += valueString;
    }

    if(this.onvaluechange != null) {
        if(typeof this.onvaluechange === "string") {
            eval(this.onvaluechange);
        }else{
            this.onvaluechange();
        }
    }
}

Control.Magnetometer.prototype.draw = function() {}

Control.Magnetometer.prototype.start = function() {
    PhoneGap.exec("Magnetometer.start", null);
}

Control.Magnetometer.prototype.unload = function() {
    PhoneGap.exec("Magnetometer.stop", null);
}