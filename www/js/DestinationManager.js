function DestinationManager() {
	this.init = function() {
		this.selectedListItem = 0;
		this.myRequest = new XMLHttpRequest();
		this.destinations = new Lawnchair('destinations');
		this.destinationsSynch = [];
		this.ipaddress = null;
		this.bonjourDestinations = new Array();
		PhoneGap.exec("Bonjour.start", null);

		setTimeout(function() { window.destinationManager.createDestinationList(); }, 1000);

	}
	
	this.setIPAndPort = function() {
		if(ipaddress != null) {
			destinationManager.ipaddress = ipaddress;
			destinationManager.addDestination(this.ipaddress);

			//PhoneGap.exec("OSCManager.setIPAddressAndPort", ipaddress, 10000);
		}
	}
	
	this.removeDestination = function(ip, port) {
		console.log("destinationmanager removing " + ip + " : " + port);
	}
	this.pushDestination = function(newDestination) {
		var segments = newDestination.split(":");
		this.addDestination(segments[0], segments[1], false, false);
		this.selectPushedDestination(segments[0], segments[1]);
	}
	
	this.addDestination = function(address, port, isBonjour, isMIDI) {
		for(var i = 0; i < this.destinationsSynch.length; i++) {
			var destCheck = this.destinationsSynch[i];
			//console.log(destCheck);
			if(address == destCheck.ip && port == destCheck.port) return;
		}
		this.destinationsSynch.push({ip:address, port:port});
		if(isBonjour) destinationManager.bonjourDestinations.push([address, port]);
		var list = document.getElementById('destinationList');
		var item = document.createElement('li');
		if(isBonjour) item.setAttribute("class", "isBonjour");
		if(isMIDI) item.setAttribute("class", "isMIDI");
		//console.log("address: " + address + " | port : " + port + " | isBonjour | " + isBonjour);
		if(!isMIDI) 
			item.setAttribute("ontouchend", "destinationManager.highlight(" + list.childNodes.length + "); _protocol='OSC'; destinationManager.selectIPAddressAndPort('" + address + "'," + port + ");");		
		else
			item.setAttribute("ontouchend", "destinationManager.highlight(" + list.childNodes.length + "); _protocol='MIDI';destinationManager.selectMIDIIPAddressAndPort('" + address + "'," + port + ");");		

		if(isBonjour) {
			item.innerHTML = "<div style='display:inline'>" + address + ":" + port +  "</div><img style='margin-top:.15em; width:2.5em; height:2.5em; float:right' src='images/bonjour.png'>";
		}else if(isMIDI) {
			item.innerHTML = "<div style='display:inline'>" + address + ":" + port +  "</div><img style='margin-top:.15em; width:2.5em; height:2.5em; float:right' src='images/MIDI_Icon.png'>";
		}else{
			item.innerHTML = "<div style='display:inline'>" + address + ":" + port +  "</div>";
		}
		list.appendChild(item);
	}
    
    /*
    * takes a recently pushed destination (pushed via OSC), highlights it and mimics its selection 
    */
    this.selectPushedDestination = function(address, port) {
        var list = document.getElementById('destinationList');
        destinationManager.highlight(list.childNodes.length - 1);
        _protocol = "OSC";
        destinationManager.selectIPAddressAndPort(address, port);
    }
	
	this.selectMIDIIPAddressAndPort = function(address,port) {
		this.ipaddress = address;
		this.port = port;
		PhoneGap.exec("MIDI.start", this.ipaddress, this.port);
        PhoneGap.exec("OSCManager.stopPolling");
	}
	
	this.selectIPAddress = function(address) {
		this.ipaddress = address;
		PhoneGap.exec("OSCManager.setIPAddressAndPort", this.ipaddress, "12000");
	}
	
	this.selectIPAddressAndPort = function(address, port) {
        console.log("selecting ip and port");
		this.ipaddress = address;
		this.port = port;
		PhoneGap.exec("OSCManager.setIPAddressAndPort", this.ipaddress, this.port);
	}
	
	this.promptForIP = function() { // TODO: NO ABSOLUTE PIXEL VALUES. SHEESH.
		var destinationsDiv = document.getElementById("Destinations");
		var promptDiv = document.createElement("div");
		var input = document.createElement("input");
		var portInput = document.createElement("input");
		var inputHeader = document.createElement("h2");
		var portHeader = document.createElement("h2");
		var cancelButton = document.createElement("button");
		var addButton = document.createElement("button");
		
		
		inputHeader.innerHTML = "Enter Destination URL";
		inputHeader.setAttribute("id", "inputFieldHeader");
		inputHeader.setAttribute("style", "top:45px; color:#fff; font-size:1.5em");
		
		portHeader.innerHTML = "Enter Destination Port";
		portHeader.setAttribute("id", "inputFieldHeader");
		portHeader.setAttribute("style", "top:160px; color:#fff; font-size:1.5em");
		
		input.setAttribute("style", "top: 90px; height:50px; width:90%; font-size:1.25em");
		input.setAttribute("autocorrect", "off");
		input.value = "";
		//input.setAttribute("onchange", "destinationManager.inputEnd()");
		input.setAttribute("type", "text");
		input.setAttribute("id", "ipField");
	
		portInput.setAttribute("style", "top: 200px; height:50px; width:90%; font-size:1.25em");
		portInput.setAttribute("autocorrect", "off");
		portInput.value = "10000";
		portInput.setAttribute("type", "text");
		portInput.setAttribute("id", "portField");
	
		cancelButton.innerHTML = "Cancel";
		cancelButton.setAttribute("style", "margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:black; color:#fff; border: 1px solid #fff");
		cancelButton.setAttribute("ontouchend", "document.getElementById('Destinations').removeChild(document.getElementById('promptDiv'))");
		
		addButton.innerHTML = "Add";
		addButton.setAttribute("ontouchend", "destinationManager.inputEnd()");		
		addButton.setAttribute("style", "margin-top: 1em; margin-left: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:#fff; color:#000; border: 1px solid #fff");
		
		promptDiv.setAttribute("style","z-index:2; left:0px; top:0px; position:absolute; background-color:rgba(0,0,0,.6); width:100%; height:100%;");
		promptDiv.setAttribute("id", "promptDiv");
		
		promptDiv.appendChild(inputHeader);
		promptDiv.appendChild(input);
		promptDiv.appendChild(portHeader);
		promptDiv.appendChild(portInput);		
		promptDiv.appendChild(cancelButton);
		promptDiv.appendChild(addButton);		
		
		destinationsDiv.appendChild(promptDiv);
	}
	
	this.highlight = function (listNumber) {
		this.selectedListItem = listNumber;
		var list = document.getElementById('destinationList');
		for(var i = 0; i < list.childNodes.length; i++) {
			if(i != listNumber) {
				list.childNodes[i].style.backgroundColor = "#000";
			}else{
				list.childNodes[i].style.backgroundColor = "#333";
			}
		}
	}
	
	this.inputEnd = function() { 
		var ipAddress = document.getElementById('ipField').value;
		var port = document.getElementById('portField').value;	
		//debug.log("ipaddress = " + ipAddress + " :: port = " + port);
		document.getElementById("Destinations").removeChild(document.getElementById("promptDiv"));
		var keyString = ipAddress + ":" + port;
		destinationManager.destinations.save({key:keyString, ip:""+ipAddress, port:port}, 
			function(r) {
				//destinationManager.createDestinationList();
				destinationManager.addDestination(ipAddress, port, false, false);
			}
		);
	}
	
	this.createDestinationList = function() {
		this.destinations.each( function(r){ destinationManager.addDestination(r.ip, r.port, false, false); } );

		/*debug.log("creating destination list");
		var list = document.getElementById('destinationList');
		list.innerHTML = "";
		for(var i = 0; i < this.bonjourDestinations.length; i++) {
			
			var destination = this.bonjourDestinations[i];
			debug.log("destination = " + destination);
			this.addDestination(destination[0],destination[1], true);
		}
		destinationManager.destinations.each( function(r){ debug.log("key = " + r.key); destinationManager.addDestination(r.key, false); } );
		*/
	}
	
	this.editDestinationList = function() {

		var list = document.getElementById('destinationList');
		
		if(list.childNodes.length > 0) {
			document.getElementById('destinationEditBtn').innerHTML = "Done";
			document.getElementById('destinationEditBtn').ontouchend = destinationManager.endEditing;
			
			for(var i = 0; i < list.childNodes.length; i++) {
				var item = list.childNodes[i];
				//if(item.getAttribute("class") != "isBonjour") {
					var deleteButton = document.createElement("div"); // -webkit-border-radius:10px;
					deleteButton.setAttribute("style", "float:left; margin-right: 5px; position:relative; top:10px; border: #fff 2px solid; -webkit-border-radius:10px; width: 15px; height: 15px; background-color:#f00; color:#fff; font-weight:bold;");
					deleteButton.innerHTML = "<img style='position:relative; top:-.5em; left:-.5em;' src='dash.png'>";
					deleteButton.setAttribute("ontouchend", "destinationManager.removeDestination("+i+")");
					item.insertBefore(deleteButton, item.firstChild);
				//}
			}
		}
	}
	
	this.endEditing = function() {
		var list = document.getElementById('destinationList');
		
		document.getElementById('destinationEditBtn').innerHTML = "Edit";
		document.getElementById('destinationEditBtn').ontouchend = destinationManager.editDestinationList;
		for(var i = 0; i < list.childNodes.length; i++) {
			var item = list.childNodes[i];
			//if(item.getAttribute("class") != "isBonjour")
			item.removeChild(item.childNodes[0]);
		}
	}
	
	
	this.removeDestination = function (itemNumber) {
		var listItem = document.getElementById('destinationList').childNodes[itemNumber];
		var jsonKey = listItem.childNodes[1].innerHTML;
		console.log("removing "+ jsonKey);
		document.getElementById('destinationList').removeChild(listItem);
		destinationManager.destinations.remove(jsonKey);
	}
	
	return this;
}