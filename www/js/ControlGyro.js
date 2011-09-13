// Gyro is a singleton object.

function ControlGyro(props) {
	this.make("sensor", props);
    
    this.hardwareMin = -1.57;
    this.hardwareMax = 1.57;
    this.hardwareRange = this.hardwareMax - this.hardwareMin;
    
	this.rotationHardwareMin = - 25.0;
	this.rotationHardwareMax = 25.0;
	this.rotationHardwareRange = this.rotationHardwareMax - this.rotationHardwareMin;
	
    this.yawHardwareMin = -3.14;
    this.yawHardwareMax = 3.14;
    this.yawHardwareRange = this.yawHardwareMax - this.yawHardwareMin;
	
	if(_protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    this.userDefinedRange = this.max - this.min;
    
	this.pitch = 0;
	this.roll = 0;
	this.yaw = 0;
    
    if(typeof props.updateRate != "undefined") {
        this.updateRate = props.updateRate;
    }else{
        this.updateRate = 10;
    }
    
    return this;
}

ControlGyro.prototype = new Widget();
    	
//gyro._onGyroUpdate({'xRotationRate':0.002622,'yRotationRate':-0.004301,'zRotationRate':-0.012185},{'pitch':0.021584,'roll':-0.002796,'yaw':-0.016728})
	
ControlGyro.prototype._onGyroUpdate = function(rotationRate, euler) {             1
    this.pitch = this.min + (((0 - this.hardwareMin)    + euler.pitch)  / this.hardwareRange )    * this.userDefinedRange;
    this.roll =  this.min + (((0 - this.yawHardwareMin) + euler.roll)   / this.yawHardwareRange ) * this.userDefinedRange;
    this.yaw =   this.min + (((0 - this.yawHardwareMin) + euler.yaw)    / this.yawHardwareRange ) * this.userDefinedRange;
    
    this.xRotationRate = this.rotationHardwareMin + (((0 - this.rotationHardwareMin) + rotationRate.xRotationRate) / this.rotationHardwareRange) * this.userDefinedRange;
    this.yRotationRate = this.rotationHardwareMin + (((0 - this.rotationHardwareMin) + rotationRate.yRotationRate) / this.rotationHardwareRange) * this.userDefinedRange;
    this.zRotationRate = this.rotationHardwareMin + (((0 - this.rotationHardwareMin) + rotationRate.zRotationRate) / this.rotationHardwareRange) * this.userDefinedRange;;
    
    
    if(this.onvaluechange != null) {
        eval(this.onvaluechange);
    }
    
    if(!this.isLocal && _protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.xRotationRate + "," + this.yRotationRate + "," + this.zRotationRate + "," + this.pitch + "," + this.roll + "," + this.yaw;
        control.valuesString += valueString;
    }else if (!this.isLocal && _protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.xRotationRate);			
        control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 1) + "," + Math.round(this.yRotationRate);			
        control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 2) + "," + Math.round(this.zRotationRate);			
        control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 3) + "," + Math.round(this.pitch);			
        control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 4) + "," + Math.round(this.roll);			
        control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 5) + "," + Math.round(this.yaw);			
        control.valuesString += valueString;
    }

}

ControlGyro.prototype.draw = function() {}

ControlGyro.prototype.start = function() {
    PhoneGap.exec("Gyro.start");
    this.setUpdateRate(this.updateRate);
}

ControlGyro.prototype.unload = function() {
    PhoneGap.exec("Gyro.stop");
}

ControlGyro.prototype.setReferenceAttitude = function() {
    PhoneGap.exec("Gyro.setReferenceAttitude");
}

ControlGyro.prototype.setUpdateRate = function(rateInHz) {
    //console.log("setting gyro rate " + rateInHz);
    PhoneGap.exec("Gyro.setUpdateRate", rateInHz);
}
    

