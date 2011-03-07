// Compass is a singleton object.

function ControlCompass(props) {
	this.name = props.name;
	this.value = 0;
	this.address  = (typeof props.address  != "undefined") ? props.address  : "/" + this.name;
	this.onvaluechange = (typeof props.onvaluechange != "undefined") ? props.onvaluechange : null;
    console.log("set onvaluechange to: " + this.onvaluechange);
    
	this.isLocal    = (typeof props.isLocal != "undefined") ? props.isLocal : false;
    
	this.midiType   = (typeof props.midiType   != "undefined") ? props.midi       : "cc";
	this.channel    = (typeof props.channel    != "undefined") ? props.channel    : 1;
	this.midiNumber = (typeof props.midiNumber != "undefined") ? props.midiNumber : 0;
	
	this.address = (typeof props.address != "undefined") ? props.address : "/" + this.name;

	this.watchID = null;
	var delay = 1000;
	var first = true;
	var self = this;
	
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
    
	this._onCompassUpdate = function(_heading) {
        self.value = self.min + (((0 - self.hardwareMin) + _heading) / self.hardwareRange ) * self.userDefinedRange;
        
        if(!self.isLocal && _protocol == "OSC") {
            var valueString = "|" + self.address;
            valueString += ":" + self.value;
            control.valuesString += valueString;
        }else if (!self.isLocal && _protocol == "MIDI") {
            var valueString = "|" + self.midiType + "," + (self.channel - 1) + "," + self.midiNumber+ "," + Math.round(self.value);
            control.valuesString += valueString;
        }
        if (first) {
            console.log("new heading:" + _heading + "; calling " + self.onvaluechange + " with new heading: " + self.value);
            first = false;
        }
		if(self.onvaluechange != "undefined") {
			eval(self.onvaluechange);
		}
	}

	function onError() {
	    alert('Error: failed to get heading!');
	};

	this.draw = function() {}
	
	this.start = function() {
		//PhoneGap.exec("Compass.start", null);
	    var options = new Object();
	    options.frequency = delay;  //options.frequency is actually the period in milliseconds
	    this.watchID = navigator.compass.watchHeading(
	            this._onCompassUpdate, 
	            onError, 
	            options);	    
	    console.log("Started compass: " + this.watchID);
	}
	
	this.unload = function() {
        //PhoneGap.exec("Compass.stop", null);
        navigator.compass.clearWatch(this.watchID);
    }
	
    this.setUpdateRate = function(rateInHz) {
        //debug.log("setting accelerometer updateRate " + rateInHz);
        //PhoneGap.exec("CNTRL_Accelerometer.setUpdateRate", rateInHz);
        this.unload();
        delay = (1/rateInHz) * 1000;
        console.log("Delay set to " + delay + " milliseconds.");
        this.start();
    }

    if(typeof props.updateRate != "undefined") {
        this.setUpdateRate(props.updateRate);
    }else{
        this.setUpdateRate(10);
    }
		
	return this;
}