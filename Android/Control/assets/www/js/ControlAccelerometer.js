// Accelerometer is a singleton object.

function ControlAccelerometer(props) {
	this.name = props.name;

	this.x = 0;
	this.y = 0;
	this.z = 0;
	
    this.hardwareMin = -2.307; // as found here: http://www.iphonedevsdk.com/forum/iphone-sdk-development/4822-maximum-accelerometer-reading.html
    this.hardwareMax = 2.307;  // -1 to 1 works much better for devices without gyros to measure tilt, -2 to 2 much better to measure force
    this.hardwareRange = this.hardwareMax - this.hardwareMin;
    
	if(_protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    this.userDefinedRange = this.max - this.min;
    
	this.isLocal = (typeof props.isLocal != "undefined") ? props.isLocal : false;
    
	this.midiType   = (typeof props.midiType   != "undefined") ? props.midiType   : "cc";
	this.channel    = (typeof props.channel    != "undefined") ? props.channel    : 1;
	this.midiNumber = (typeof props.midiNumber != "undefined") ? props.midiNumber : 0;
	
	this.address = (typeof props.address != "undefined") ? props.address : "/" + this.name;
	
	this.onvaluechange = (typeof props.onvaluechange != "undefined") ? props.onvaluechange : null;
    
	this._onAccelUpdate = function(x,y,z) {
        //console.log("x = " + x + " || y = " + y + " || z = " + z);
        
        this.x = this.min + (((0 - this.hardwareMin) + x) / this.hardwareRange ) * this.userDefinedRange;
		this.y = this.min + (((0 - this.hardwareMin) + y) / this.hardwareRange ) * this.userDefinedRange;
		this.z = this.min + (((0 - this.hardwareMin) + z) / this.hardwareRange ) * this.userDefinedRange;
		
        //console.log("this.x = " + this.x + " || this.y = " + this.y + " || z = " + this.z);
        if(typeof this.onvaluechange != "undefined") {
			eval(this.onvaluechange);
		}
        
		if(!this.isLocal && _protocol == "OSC") {
			var valueString = "|" + this.address;
			valueString += ":" + this.x + "," + this.y + "," + this.z;
			control.valuesString += valueString;
		}else if (!this.isLocal && _protocol == "MIDI") {
			var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.x);			
			control.valuesString += valueString;
			valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 1) + "," + Math.round(this.y);			
			control.valuesString += valueString;
			valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 2) + "," + Math.round(this.z);			
			control.valuesString += valueString;	
		}
	}
	
	this.draw = function() {}
	
	this.start = function() {
		PhoneGap.exec("CNTRL_Accelerometer.start", null);
		this.setUpdateRate(this.updateRate);
	}
		
	this.unload = function() {
		PhoneGap.exec("CNTRL_Accelerometer.stop");
	}
    
    this.setUpdateRate = function(rateInHz) {
		//console.log("setting accelerometer updateRate " + rateInHz);
        PhoneGap.exec("CNTRL_Accelerometer.setUpdateRate", rateInHz);
    }
	
	if(typeof props.updateRate != "undefined") {
		this.updateRate = props.updateRate;
	}else{
		this.updateRate = 10;
	}
	
	return this;
}