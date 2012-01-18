// TODO: Implement refresh for MIDI Hardware destinations. Might be best to do this using MIDI scanning instead of Bonjour, and just abandon
// Bonjour for MIDI sources altogether.

function DestinationManager() {
	this.init = function() {
		this.selectedListItem = 0;
		this.myRequest = new XMLHttpRequest();
		
		this.destinationsSynch 		= [];
		this.midiDestinations 		= [];
		this.bonjourDestinations 	= [];		
		
		this.ipaddress = null;
		this.destinations = [];
		
        if(typeof localStorage.destinations == "undefined") {
			localStorage.destinations = [];
        }else{
			this.destinations = jQuery.parseJSON(localStorage.destinations);
        }
		
		Bonjour.start();
        
        window.destinationManager.createDestinationList();        
	}
    
    this.refreshList = function() {
        this.clearList();
        this.destinationsSynch = [];
        this.midiDestinations = [];
        //PhoneGap.exec("Bonjour.browse", null);
        Bonjour.browse();
        //PhoneGap.exec("MIDI.browse", null);
        window.destinationManager.createDestinationList();        
    }
	
    this.clearList = function() {
        $("#destinationList").empty();
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
        this.selectIPAddressAndPort(segments[0], segments[1]);
		this.addDestination(segments[0], segments[1], false, false, false);
		this.selectPushedDestination(segments[0], segments[1]);
	}
	
	// TODO: change to add Bonjour destination. Make all midi in add MIDI destination.
	
	this.addDestination = function(address, port, isBonjour, isMIDI, isHardware) {
		for(var i = 0; i < this.destinationsSynch.length; i++) {
			var destCheck = this.destinationsSynch[i];
			if(address == destCheck.ip && port == destCheck.port) return;
		}
		this.destinationsSynch.push({ip:address, port:port});
		if(isBonjour) destinationManager.bonjourDestinations.push([address, port]);
        
		var list = document.getElementById('destinationList');
		var item = document.createElement('li');
        $(item).addClass('destinationListItem');

		//console.log("address: " + address + " | port : " + port + " | isBonjour | " + isBonjour);

		if(!isMIDI) 
			item.setAttribute("ontouchend", "destinationManager.highlight(" + list.childNodes.length + "); _protocol='OSC'; destinationManager.selectIPAddressAndPort('" + address + "'," + port + ");");		
		else if(!isHardware)
			item.setAttribute("ontouchend", "destinationManager.highlight(" + list.childNodes.length + "); _protocol='MIDI';destinationManager.selectMIDIIPAddressAndPort('" + address + "'," + port + ");");		
		else
			//item.setAttribute("ontouchend", "destinationManager.highlight(" + list.childNodes.length + "); _protocol='MIDI';destinationManager.selectHardwareMIDI('" + address + ");");
            item.setAttribute("ontouchend", "destinationManager.highlight(" + list.childNodes.length + "); _protocol='MIDI';destinationManager.selectMIDIIPAddressAndPort('" + address + "'," + port + ");");	

        var innerDiv = document.createElement('div');
        $(innerDiv).css('display', 'inline');
        $(innerDiv).append(document.createTextNode("" + address + ":" + port));

		if(isBonjour || isMIDI) {
            var _img = document.createElement('img');
            $(_img).addClass('destinationImage');
            if(isBonjour)
                $(_img).attr('src', 'images/bonjour.png');
            else
                $(_img).attr('src', 'images/MIDI_Icon.png');
            
            $(innerDiv).append(_img);
		}

        $(item).append(innerDiv);        
		list.appendChild(item);

        $('#destinationList').listview('refresh');        
	}
	
	this.addMIDIDestination = function(destName) {
		for(var i = 0; i < this.midiDestinations.length; i++) {
			var destCheck = this.midiDestinations[i];
			if(destName == destCheck) return;
		}
		
		this.midiDestinations.push(destName);
		var list = document.getElementById('destinationList');
		var item = document.createElement('li');
        $(item).addClass('destinationListItem');
        
        function destinationListItemSelect(itemNumber, name) { 
            return function(e) {
                console.log(destName + "highlighting " + itemNumber); 
                destinationManager.highlight(itemNumber);
                destinationManager.selectMIDI(name);                
                _protocol='MIDI';

            }
        }
                
        $(item).bind("touchend", destinationListItemSelect(list.childNodes.length, destName));
        
        // destinationManager.selectMIDIIPAddressAndPort('" + address + "'," + port + ");

		//item.innerHTML = destName;
		//item.setAttribute("ontouchend", "destinationManager.highlight(" + list.childNodes.length + "); _protocol='MIDI';destinationManager.selectMIDIDestination('" + destName + ");");		
        
        var innerDiv = document.createElement('div');
        $(innerDiv).css('display', 'inline');
        $(innerDiv).append(document.createTextNode(destName));

		var _img = document.createElement('img');
        $(_img).addClass('destinationImage');

        $(_img).attr('src', 'images/MIDI_Icon.png');
        
        $(innerDiv).append(_img);
        $(item).append(innerDiv);        
        $(list).append(item);
    
        $('#destinationList').listview('refresh');    
	}
    
    this.selectMIDI = function(destName) {
        console.log("JS CALLING HARDWARE MIDI CONNECT" + destName);
        PhoneGap.exec('MIDI.connectMIDI', destName);
    }
    
    /*
    * takes a recently pushed destination (pushed via OSC), highlights it and mimics its selection 
    */
    this.selectPushedDestination = function(address, port) {
        console.log("selecting");
        var list = document.getElementById('destinationList');
        destinationManager.highlight(list.childNodes.length - 1);
        _protocol = "OSC";
        destinationManager.selectIPAddressAndPort(address, port);
        console.log("selected");        
    }
	
	this.selectMIDIIPAddressAndPort = function(address,port) {
		this.ipaddress = address;
		this.port = port;
		PhoneGap.exec("MIDI.connect", 1, this.ipaddress, this.port);
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
		
		document.getElementById("Destinations").removeChild(document.getElementById("promptDiv"));
		// $("#Destinations").remove("#promptDiv");
		destinationManager.addDestination(ipAddress, port, false, false);

		destinationManager.destinations.push({"ip":ipAddress, "port":port});

		localStorage.destinations = JSON.stringify(destinationManager.destinations);
	}
	
	this.createDestinationList = function() {
		$(this.destinations).each( function(index, r){ destinationManager.addDestination(r.ip, r.port, false, false); } );
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
					deleteButton.setAttribute("style", "float:left; margin-right: 5px; position:relative; border: #fff 2px solid; -webkit-border-radius:10px; width: 15px; height: 15px; background-color:#f00; color:#fff; font-weight:bold;");
                    deleteButton.innerHTML = "<img style='position:relative; top:-.65em; left:-.65em;' src='images/dash.png'>";
					deleteButton.setAttribute("ontouchend", "console.log('blhteateataeteatea');destinationManager.removeDestination("+i+")");
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
		console.log("removing " + itemNumber);
		var listItem = document.getElementById('destinationList').childNodes[itemNumber];
		var jsonKey = $(listItem).text();
		console.log("dest = " + jsonKey);
		var arr = jsonKey.split(':');
		var obj = { "ip":arr[0], "port":arr[1] };
		console.log(obj);
		
		console.log("remove");
		
		document.getElementById('destinationList').removeChild(listItem);
		
		// TODO: The line below doesn't work.... why?
        for(var i = 0; i < destinationManager.destinations.length; i++) {
            console.log(destinationManager.destinations[i]);
        }
		while(jQuery.inArray(obj, destinationManager.destinations) != -1) {
            console.log("SOMETHING");
			var idx = jQuery.inArray(obj, destinationManager.destinations);
            console.log("DELETING " + idx);
			destinationManager.destinations.splice(idx, 1);
		}
		
		console.log("new dest " + destinationManager.destinations);
		localStorage.destinations = JSON.stringify(destinationManager.destinations);
	}
	
	return this;
}