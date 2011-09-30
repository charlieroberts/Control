/* TODO: Defaults should only load if app is updated, otherwise they should stay deleted. Maybe have a button in preferences that reloads them??? */

function InterfaceManager() {
	this.init = function() {
		this.selectedListItem = 0;
		this.interfaceFiles = new Lawnchair('interfaceFiles');
        this.currentInterfaceName = null;
        this.currentInterfaceJSON = null;
        this.interfaceIP = null;
        interfaceOrientation = null;
        constants = null;
        this.interfaceDefaults = ["iphoneLandscapeMixer.js",
                                  "djcut.js",
                                  "life.js",
								  "monome.js",
								  "multibutton.js",
								  "multiXY.js",
								  "sequencer.js",
								  "gyro.js",
                                  "spacetime.js",
                                  ];
        window.shouldReadFiles = true;
        window.isLoadingInterfaces = false; // stops database calls from being executed twice, for some reason "get" returns two values.
    }
     
    this.loadScripts = function() {
        this.shouldLoadInterfaces = new Lawnchair('shouldLoadInterfaces');
        console.log("LOADING");
        window.setTimeout(function() {  // needs a timeout for the Lawnchair database to be initialized... ARGGGGHHHH
            interfaceManager.shouldLoadInterfaces.get("shouldLoad", function(r) { 
                if(!window.isLoadingInterfaces) {
                    if(r != null)
                        window.shouldReadFiles = false; // this means that Control has been launched before, so we should load the interfaces into the database

                    if(window.shouldReadFiles) {
                        control.ifCount = 0;
                        interfaceManager.shouldLoadInterfaces.save({key:"shouldLoad", sl:true});
                        interfaceManager.readFile(interfaceManager.interfaceDefaults[control.ifCount]);
                    }else{
                        interfaceManager.createInterfaceListWithStoredInterfaces();
                    }
                    window.isLoadingInterfaces = true;
                }
            } )
        }, 250 );
    }
    
    this.readFile = function(filename) {
		console.log("reading " + filename)
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", "interfaces/" + filename);
        document.getElementsByTagName('head')[0].appendChild(fileref);
        
        setTimeout(function() {
            interfaceManager.saveInterface(window.interfaceString, false);
            control.ifCount++;
            if(control.ifCount <= interfaceManager.interfaceDefaults.length) {
                interfaceManager.readFile(interfaceManager.interfaceDefaults[control.ifCount]);
            }else{
                interfaceManager.createInterfaceListWithStoredInterfaces();
			}
        }, 100);
    }
	
	this.promptForInterfaceDownload = function() {
		var interfacesDiv = document.getElementById("Interfaces");
		var promptDiv = document.createElement("div");
		var input =	document.createElement("input");
		var inputHeader = document.createElement("h2");
        
		var cancelButton = document.createElement("button");
        var submitButton = document.createElement("button");
		
		inputHeader.innerHTML = "Enter Interface URL";
		inputHeader.setAttribute("id", "inputFieldHeader");
		inputHeader.setAttribute("style", "top:45px; color:#fff; font-size:1.5em");
		
		input.setAttribute("style", "top: 90px; height:50px; width:90%; font-size:1.25em");
		input.setAttribute("autocorrect", "off");
		input.value = "http://";
		//input.setAttribute("onchange", "interfaceManager.downrunCurrentInterfaceFromPrompt()");
		input.setAttribute("type", "url");
		input.setAttribute("id", "ipField");
        
		cancelButton.innerHTML = "Cancel";
		cancelButton.setAttribute("style", "margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:black; color:#fff; border: 1px solid #fff");
		cancelButton.setAttribute("ontouchend", "document.getElementById('Interfaces').removeChild(document.getElementById('promptDiv'))");
        
        submitButton.innerHTML = "Submit";
		submitButton.setAttribute("style", "margin-left: 1em; margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:#fff; color:#000; border: 1px solid #fff");
        submitButton.setAttribute("ontouchend", "interfaceManager.downloadInterfaceFromPrompt()");
		//submitButton.setAttribute("ontouchend", "document.getElementById('Interfaces').removeChild(document.getElementById('promptDiv'))");
		
		promptDiv.setAttribute("style","z-index:2; left:0px; top:0px; position:absolute; background-color:rgba(0,0,0,.8); width:100%; height:100%;");
		promptDiv.setAttribute("id", "promptDiv");
		promptDiv.appendChild(inputHeader);
		promptDiv.appendChild(input);
        promptDiv.appendChild(document.createElement("br"));
        //promptDiv.appendChild(shouldReloadBox);
        //promptDiv.appendChild(shouldReloadText);
        promptDiv.appendChild(document.createElement("br"));

		promptDiv.appendChild(cancelButton);
        promptDiv.appendChild(submitButton);
		
		interfacesDiv.appendChild(promptDiv);
	}
    
    	
	this.downloadInterfaceFromPrompt = function() {
		var ipAddress = document.getElementById('ipField').value;
        //var shouldReload = document.getElementById('shouldReloadBox').checked;
		interfaceManager.downloadInterface(ipAddress);
	}
	
	this.downloadInterface = function(ipAddress) { // EVENT --- CANNOT REFER TO THIS, MUST USE INTERFACE MANAGER
        console.log("downloading...");
		interfaceManager.myRequest = new XMLHttpRequest();    	
		var loadedInterfaceName = null;
        interfaceManager.myRequest.onreadystatechange = function() {
            console.log("downloading..." + interfaceManager.myRequest.readyState );
            if(interfaceManager.myRequest.readyState == 4) {
                console.log(interfaceManager.myRequest.responseText);
                eval(interfaceManager.myRequest.responseText);
                if(loadedInterfaceName != null) {
                    if(document.getElementById("promptDiv") != null) {
                        document.getElementById("Interfaces").removeChild(document.getElementById("promptDiv"));
                    }
                    interfaceManager.saveInterface(interfaceManager.myRequest.responseText, true, ipAddress);
                    interfaceManager.interfaceIP = ipAddress;
                    interfaceManager.runInterface(interfaceManager.myRequest.responseText);
                }else{
                    document.getElementById("inputFieldHeader").innerHTML = "Could not load. Please try another URL";
                    return;
                }
            }
        }
        interfaceManager.myRequest.ipAddress = ipAddress;        
		//interfaceManager.myRequest.withCredentials = "true";                
		interfaceManager.myRequest.open("GET", ipAddress, true);
        interfaceManager.myRequest.send(null);
	}
	
	
	this.highlight = function (listNumber) {
		this.selectedListItem = listNumber;
		var list = document.getElementById('interfaceList');
		for(var i = 0; i < list.childNodes.length; i++) {
			if(i != listNumber) {
				list.childNodes[i].style.backgroundColor = "#000";
			}else{
				list.childNodes[i].style.backgroundColor = "#333";
			}
		}
	}
    
    this.createInterfaceListWithStoredInterfaces = function() {
		$('#interfaceList').empty();
		interfaceManager.interfaceFiles.all(function(r) { interfaceManager.createInterfaceListWithArray(r); });
        window.isLoadingInterfaces = false;
	}
    
	this.createInterfaceListWithArray = function(listArray) {
		var list = document.getElementById('interfaceList');
		var count = 0;

		for(var i = 0; i < listArray.length; i++) {
			var r = listArray[i];
			var item = document.createElement('li');
            
            function _touchend(_key, _count) { 
                return function(e) {
                    interfaceManager.highlight(_count);
                    interfaceManager.selectInterfaceFromList(_key);
                }
            }
            
            $(item).bind("tap", _touchend(r.key, count++));

            item.innerHTML = r.key;
                        
            $(item).css({
                        "border-bottom" : "1px solid #666", 
                        "font-weight"   : "normal"
                        });
            
            $(item).addClass('destinationListItem interfaceListItem');

   			list.appendChild(item);
		}
        
		$(list).listview('refresh');
	}

	this.editInterfaceList = function() {
		
		var list = document.getElementById('interfaceList');
		
		if(list.childNodes.length > 0) {
			document.getElementById('interfaceEditBtn').innerHTML = "Done";
			document.getElementById('interfaceEditBtn').ontouchend = interfaceManager.endEditing;

			for(var i = 0; i < list.childNodes.length; i++) {
				var item = list.childNodes[i];
				var deleteButton = document.createElement("div"); // -webkit-border-radius:10px;
				deleteButton.setAttribute("style", "float:left; margin-right: 5px; position:relative; top:0px; border: #fff 2px solid; -webkit-border-radius:10px; width: 15px; height: 15px; background-color:#f00; color:#fff; font-weight:bold;");
				deleteButton.innerHTML = "<img style='position:relative; top:-.7em; left:-.65em;' src='images/dash.png'>";
				deleteButton.setAttribute("ontouchend", "interfaceManager.removeInterface("+i+")");
				item.insertBefore(deleteButton, item.firstChild);
				item.setAttribute("ontouchend", null);		
			}
		}
	}
	
	this.endEditing = function() {
		var list = document.getElementById('interfaceList');

		document.getElementById('interfaceEditBtn').innerHTML = "Edit";
		document.getElementById('interfaceEditBtn').ontouchend = interfaceManager.editInterfaceList;
		for(var i = 0; i < list.childNodes.length; i++) {
			var item = list.childNodes[i];
			item.removeChild(item.childNodes[0]);
			item.setAttribute("ontouchend", "interfaceManager.highlight("+ i +"); interfaceManager.selectInterfaceFromList('" + item.innerHTML + "');");		
		}
	}
    
    this.refreshInterface = function() {

        interfaceManager.myRequest = new XMLHttpRequest();    	
        interfaceManager.myRequest.onreadystatechange = function() {
            if(interfaceManager.myRequest.readyState == 4) {              
                interfaceManager.runInterface(interfaceManager.myRequest.responseText);
                interfaceManager.interfaceFiles.save({key:interfaceManager.currentInterfaceName, json:interfaceManager.myRequest.responseText, address:interfaceManager.interfaceIP});
            }
        }
		//interfaceManager.myRequest.withCredentials = "true";                
		interfaceManager.myRequest.open("GET", interfaceManager.interfaceIP, true);
        interfaceManager.myRequest.send(null);

    }
    
	this.saveInterface = function(interfaceJSON, shouldReloadList, ipAddress) {
        console.log("SAVING");
        if(typeof ipAddress == "undefined") ipAddress = "";
		var loadedInterfaceName = null;
        //console.log(interfaceJSON);
		eval(interfaceJSON);
        if(loadedInterfaceName != null) {
            //interfaceManager.interfaceFiles.remove(loadedInterfaceName, 
                interfaceManager.interfaceFiles.save( {key:loadedInterfaceName, json:interfaceJSON, address:ipAddress},
                                                       function(r) {
                                                             //console.log("interface saved");
                                                            if(shouldReloadList) 
                                                                interfaceManager.createInterfaceListWithStoredInterfaces();
                                                       }
                )
            //);
        }
        console.log("END SAVING");
	}
	
	this.pushInterfaceWithDestination = function(interfaceJSON, nameOfSender, newDestination) {
         if(typeof nameOfSender != "undefined") {
            if(confirm("An interface is being pushed to you by " + nameOfSender + ". Do you accept it?")) {
                var loadedInterfaceName = null;
                this.saveInterface(interfaceJSON, false);
                interfaceManager.runInterface(interfaceJSON);
                var segments = newDestination.split(":");
                
                destinationManager.addDestination(segments[0], segments[1], false, false);
                destinationManager.selectPushedDestination(segments[0], segments[1]);
            }
        }
    }

	this.pushInterface = function(interfaceJSON) {
		// TODO: change so it gets rid of the index.html at top of confirm window. Might require a new version of phonegap or else something tricky.
       
        if(confirm("An interface is being pushed to you. Do you accept it?")) {
            var loadedInterfaceName = null;
            interfaceManager.runInterface(interfaceJSON);
            this.saveInterface(interfaceJSON, false);

        }

	}
	
	this.removeInterface = function (itemNumber) {
        var listItem = $('#interfaceList > li:eq(' + itemNumber +')');
        var arr = listItem.html().split("</div>");
		var newKey = arr[1];
        interfaceManager.interfaceFiles.remove(newKey);        
        //console.log("removing " + newKey);
		listItem.remove();
        $('#interfaceList').listview('refresh');
	}
    
    this.runInterface = function(json) {
		control.unloadWidgets();
        constants = null;
        pages = null;
                
        oscManager.delegate = oscManager;
        midiManager.delegate = midiManager;
        
        eval(json);
        
        this.currentInterfaceName = loadedInterfaceName;
        this.currentInterfaceJSON = json;
		
		if(typeof interfaceOrientation != "undefined") {
			console.log(interfaceOrientation);
            PhoneGap.exec("Device.setRotation", interfaceOrientation);
        }
        //if(control.orientation == 0 || control.orientation == 180) {
		if(interfaceOrientation == "portrait") {
            control.makePages(pages, screen.width, screen.height);
        }else{
            control.makePages(pages, screen.height, screen.width);
        }

        if(constants != null) {
            control.loadConstants(constants);
        }
        control.loadWidgets();
        if(this.currentTab != document.getElementById("selectedInterface")) {
            control.shouldPrevent = true;
            control.changeTab(document.getElementById("selectedInterface"));
            $.mobile.changePage('#SelectedInterfacePage');
		}
    }
	
	this.selectInterfaceFromList = function(interfaceName) {
		interfaceManager.interfaceFiles.get(interfaceName, 
			function(r){
                if(typeof r.address != "undefined")
                    interfaceManager.interfaceIP = r.address;
                interfaceManager.runInterface(r.json);
			}
		);
	}
		
	return this;
}


