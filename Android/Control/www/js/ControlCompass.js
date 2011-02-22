// Compass is a singleton object.

function ControlCompass(props) {
	this.name = props.name;
	this.value = 0;
	this.address  = (typeof props.address  != "undefined") ? props.address  : "/" + this.name;
	this.onvaluechange = (typeof props.onvaluechange != "undefined") ? props.onvaluechange : null;
    
	this.isLocal    = (typeof props.isLocal != "undefined") ? props.isLocal : false;
    
	this.midiType   = (typeof props.midiType   != "undefined") ? props.midi       : "cc";
	this.channel    = (typeof props.channel    != "undefined") ? props.channel    : 1;
	this.midiNumber = (typeof props.midiNumber != "undefined") ? props.midiNumber : 0;
	
	this.address = (typeof props.address != "undefined") ? props.address : "/" + this.name;
	
    this.hardwareMin = 0;
    this.hardwareMax = 360;
    this.hardwareRange = this.hardwareMax - this.hardwareMin;
    
	if(_protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : 360;
		this.min = (typeof props.min != "undefined") ? props.min : 0;			
	}
    this.userDefinedRange = this.max - this.min;
    
    //if(typeof props.updateRate != "undefined") this.setUpdateRate(props.updateRate);

	this._onCompassUpdate = function(_heading) {
        this.value = this.min + (((0 - this.hardwareMin) + _heading) / this.hardwareRange ) * this.userDefinedRange;
        
        if(!this.isLocal && _protocol == "OSC") {
            var valueString = "|" + this.address;
            valueString += ":" + this.value;
            control.valuesString += valueString;
        }else if (!this.isLocal && _protocol == "MIDI") {
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