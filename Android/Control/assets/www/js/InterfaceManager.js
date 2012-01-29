/* TODO: Defaults should only load if app is updated, otherwise they should stay deleted. Maybe have a button in preferences that reloads them??? */

function InterfaceManager() {
    this.init = function() {
        this.selectedListItem = 0;

        this.currentInterfaceName = null;
        this.currentInterfaceJSON = null;
        
        this.interfaceIP = null;
        constants = null;
        
        this.interfaceDefaults = [
        "multiXY.js",
        "iphoneLandscapeMixer.js",
        "djcut.js",
        "life.js",
        "monome.js",
        "multibutton.js",
        "sequencer.js",
        "gyro.js",
        //"spacetime.js",
        ];

        control.ifCount = 0;
        if(!localStorage.interfaceFiles) {
            this.loadedInterfaces = [];
            PhoneGap.exec(null, null, "DeviceFeatures", "print", ["INIT LOADING SCRIPTS"]);
            var msg = "now loading default interfaces. this will only happen the first time the app is launched (possibly also after updates) and takes about 8 seconds";
            navigator.notification.alert(msg, null, "loading");
            setTimeout(function() {interfaceManager.loadScripts();}, 1000);
        }else{
            PhoneGap.exec(null, null, "DeviceFeatures", "print", ["NOT RELOADING"]);
            this.loadedInterfaces = JSON.parse(localStorage.interfaceFiles);
            this.createInterfaceListWithArray(this.loadedInterfaces);
        }
    }
    
    this.loadScripts = function() {
        PhoneGap.exec(null, null, "DeviceFeatures", "print", ["LOADING ******************************************************************"]);
        
        var fileref = document.createElement('script')
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", "interfaces/" + interfaceManager.interfaceDefaults[control.ifCount]);
        document.getElementsByTagName('head')[0].appendChild(fileref);
            
        window.setTimeout(function() {
            if(control.ifCount < interfaceManager.interfaceDefaults.length) {
                eval(window.interfaceString);
                // PhoneGap.exec(null, null, "DeviceFeatures", "print", ["ARHAIRH" + window.interfaceString]);
                PhoneGap.exec(null, null, "DeviceFeatures", "print", ["loading " + loadedInterfaceName + " ....................................."]);                
                
                interfaceManager.loadedInterfaces[control.ifCount] = {'name':loadedInterfaceName, 'json':window.interfaceString};
                control.ifCount++;
                interfaceManager.loadScripts();
            }else{
                interfaceManager.createInterfaceListWithArray(interfaceManager.loadedInterfaces);
                localStorage.interfaceFiles = JSON.stringify(interfaceManager.loadedInterfaces);
            }
        }, 1000);
    }
    // assumes portrait; _width will always be less than _height
    this.rotationSet = function(_width, _height) {
        //control.makePages(pages, screen.width * r, screen.height * r);
        PhoneGap.exec(null, null, "DeviceFeatures", "getScale", []);
        //PhoneGap.exec(null, null, "DeviceFeatures", "print", ["h:" + screen.height + " || w: " + screen.width]);
        PhoneGap.exec(null, null, "DeviceFeatures", "print", ["pixelRatio = " + window.devicePixelRatio]);
        var r = 1 / window.devicePixelRatio;
        var w, h;
            // change w / h depending on orientation
        if(control.orientationString == "portrait") {
            w = _width; h = _height;
        }else{
            w = _height; h = _width;
        }   
        // froyo / gingerbread
        //console.log("DEVICE VERSION = " + device.version);
        if(parseFloat(device.version) >= 2.2 && parseFloat(device.version) < 3.0) {
            //console.log("inside froyo / gingerbread");
            //console.log("width = " + _width + " height = " + _height);
            //console.log("ORIENTATION = " + control.orientationString);
            // if(control.orientationString == "portrait") {
            //                 //$("#SelectedInterfacePage").css( {'width': _width * r + "px", 'height' : _height * r + "px"} );
            //             }else{
            //                 //$("#SelectedInterfacePage").css({'width': _width * r + "px", 'height' : _height * r + "px"});
            //                 $("#SelectedInterfacePage").css({'width': "320px", 'height' : "320px"});
            //             }
            // if(control.orientationString == "landscape") {
            //                 $("#SelectedInterfacePage").css({'height' : "320px !important"});
            //             }else{
            //                 $("#SelectedInterfacePage").css({'height' : "100% !important"});
            //             }
            //control.makePages(pages, _width * r, _height * r);

            // $("#SelectedInterfacePage").css({
            //                         'width':  w  + 'px',
            //                         'height': h  + 'px',
            //             });
        
            control.makePages(pages, w * r, h * r);
            if(control.orientationString == "portrait") {
                $("#SelectedInterfacePage").css({ 'height' : '100% !important'});
            }else{
                $("#SelectedInterfacePage").css({ 'height' : "320px !important"});
            }
        }else{ // android 2.1 / honeycomb
            // "height" must always be 320
            if(control.orientationString == "portrait") {
                $("#SelectedInterfacePage").css( {'width': _width * r, 'height' : _height * r} );
            }else{
                $("#SelectedInterfacePage").css({'width': _height * r, 'height' : _width * r});
            }
            
            control.makePages(pages, screen.width * r, screen.height * r);
            PhoneGap.exec(null, null, "DeviceFeatures", "print", ["interface height = " + $("#SelectedInterfacePage").css("height")]);
        }

        if (constants != null) {
            control.loadConstants(constants);
        }

        control.loadWidgets();

        if (control.currentTab != document.getElementById("SelectedInterfacePage")) {
            control.changeTab(document.getElementById("SelectedInterfacePage"));
            $.mobile.changePage('#SelectedInterfacePage');
        }
        control.isLoadingInterface = false;
//        PhoneGap.exec(null, null, "DeviceFeatures", "print", ["interface height = " + $("#SelectedInterfacePage").css("height")]);      
    }
    
    this.promptForInterfaceDownload = function() {
        var interfacesDiv = document.getElementById("Interfaces");
        var promptDiv = document.createElement("div");
        var input = document.createElement("input");
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
        promptDiv.setAttribute("style", "z-index:2; left:0px; top:0px; position:absolute; background-color:rgba(0,0,0,.8); width:100%; height:100%;");
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

    this.downloadInterface = function(ipAddress) {
        // EVENT --- CANNOT REFER TO THIS, MUST USE INTERFACE MANAGER
        console.log("downloading...");
        interfaceManager.myRequest = new XMLHttpRequest();
        var loadedInterfaceName = null;
        PhoneGap.exec(null, null, "DeviceFeatures", "print", ["starting download ....................................."]);  
        interfaceManager.myRequest.onreadystatechange = function() {
        PhoneGap.exec(null, null, "DeviceFeatures", "print", ["downloading stage " + interfaceManager.myRequest.readyState]);
            if (interfaceManager.myRequest.readyState == 4) {
                console.log(interfaceManager.myRequest.responseText);
                eval(interfaceManager.myRequest.responseText);
                if (loadedInterfaceName != null) {
                    if (document.getElementById("promptDiv") != null) {
                        document.getElementById("Interfaces").removeChild(document.getElementById("promptDiv"));
                    }
                    interfaceManager.saveInterface(interfaceManager.myRequest.responseText, true, ipAddress);
                    interfaceManager.interfaceIP = ipAddress;
                    interfaceManager.runInterface(interfaceManager.myRequest.responseText);
                } else {
                    document.getElementById("inputFieldHeader").innerHTML = "Could not load. Please try another URL";
                    return;
                }
            }
        }
        interfaceManager.myRequest.ipAddress = ipAddress;
        interfaceManager.ipAddress = ipAddress;
        //interfaceManager.myRequest.withCredentials = "true";
        interfaceManager.myRequest.open("GET", ipAddress, true);
        interfaceManager.myRequest.send(null);
    }


    this.highlight = function(listNumber) {
        this.selectedListItem = listNumber;
        var list = document.getElementById('interfaceList');
        for (var i = 0; i < list.childNodes.length; i++) {
            if (i != listNumber) {
                list.childNodes[i].style.backgroundColor = "#000";
            } else {
                list.childNodes[i].style.backgroundColor = "#333";
            }
        }
    }

    this.createInterfaceListWithStoredInterfaces = function() {
        $('#interfaceList').empty();
        PhoneGap.exec(null, null, "DeviceFeatures", "print", ["WTF?????????????"]);            
        
        //interfaceManager.interfaceFiles.all(function(r) {
        //    PhoneGap.exec(null, null, "DeviceFeatures", "print", ["RETRIEVED INTERFACE ARRAY PASSING TO LIST CREATION"]);            
            interfaceManager.createInterfaceListWithArray(interfaceManager.loadedInterfaces);
        //});
        PhoneGap.exec(null, null, "DeviceFeatures", "print", ["WTF?????????????"]);                    
        window.isLoadingInterfaces = false;
    }

    this.createInterfaceListWithArray = function(listArray) {
        var list = document.getElementById('interfaceList');
        var count = 0;
        //PhoneGap.exec(null, null, "DeviceFeatures", "print", ["MAKING LIST length " + listArray.length]);            
        for (var i = 0; i < listArray.length; i++) {
            //PhoneGap.exec(null, null, "DeviceFeatures", "print", [listArray[i]]);                        
            var r = listArray[i];
            var item = document.createElement('li');

            item.style.borderBottom = "1px solid #666";
            item.style.fontWeight = "normal";
            item.setAttribute("ontouchend", "$.mobile.changePage('#SelectedInterfacePage');interfaceManager.highlight(" + (count++) + "); interfaceManager.selectInterfaceFromList('" + (count - 1) + "');");
            item.innerHTML = r.name;
            PhoneGap.exec(null, null, "DeviceFeatures", "print", ["MAKING LIST " + r.name]);            
            
            $(item).addClass('destinationListItem');
            $(item).addClass('interfaceListItem');

            list.appendChild(item);
        }
        $(list).listview('refresh');
    }

    this.editInterfaceList = function() {
        var list = document.getElementById('interfaceList');

        if (list.childNodes.length > 0) {
            document.getElementById('interfaceEditBtn').innerHTML = "Done";
            document.getElementById('interfaceEditBtn').ontouchend = interfaceManager.endEditing;

            for (var i = 0; i < list.childNodes.length; i++) {
                var item = list.childNodes[i];
                var deleteButton = document.createElement("div");
                // -webkit-border-radius:10px;
                deleteButton.setAttribute("style", "float:left; margin-right: 5px; position:relative; top:0px; border: #fff 2px solid; -webkit-border-radius:10px; width: 15px; height: 15px; background-color:#f00; color:#fff; font-weight:bold;");
                deleteButton.innerHTML = "<img style='position:relative; top:-.7em; left:-.65em;' src='images/dash.png'>";
                deleteButton.setAttribute("ontouchend", "interfaceManager.removeInterface(" + i + ")");
                item.insertBefore(deleteButton, item.firstChild);
                item.setAttribute("ontouchend", null);
            }
        }
    }

    this.endEditing = function() {
        var list = document.getElementById('interfaceList');

        document.getElementById('interfaceEditBtn').innerHTML = "Edit";
        document.getElementById('interfaceEditBtn').ontouchend = interfaceManager.editInterfaceList;
        for (var i = 0; i < list.childNodes.length; i++) {
            var item = list.childNodes[i];
            item.removeChild(item.childNodes[0]);
            item.setAttribute("ontouchend", "interfaceManager.highlight(" + i + "); interfaceManager.selectInterfaceFromList('" + i + "');");
        }
    }

    this.refreshInterface = function() {
        interfaceManager.myRequest = new XMLHttpRequest();
        interfaceManager.myRequest.onreadystatechange = function() {
            // PhoneGap.exec(null, null, "DeviceFeatures", "print", ["downloading stage " + interfaceManager.myRequest.readyState]);            
            if (interfaceManager.myRequest.readyState == 4) {
                interfaceManager.runInterface(interfaceManager.myRequest.responseText);
                for(var i = 0; i < interfaceManager.loadedInterfaces.length; i++) {
                    var interface = interfaceManager.loadedInterfaces[i];
                    if(interface.name == interfaceManager.currentInterfaceName) {
                        // PhoneGap.exec(null, null, "DeviceFeatures", "print", ["SHOULD BE LOADED"]);
                        var newInterface = {
                            name:interfaceManager.currentInterfaceName,
                            json: interfaceManager.myRequest.responseText,
                            address: interfaceManager.interfaceIP
                        };
                        // PhoneGap.exec(null, null, "DeviceFeatures", "print", [newInterface.json]);
                        interfaceManager.loadedInterfaces.splice(i,1,newInterface);
                        
                        localStorage.interfaceFiles = JSON.stringify(interfaceManager.loadedInterfaces);

                        interfaceManager.runInterface(newInterface.json);
                        break;
                    }
                }
            }
        }
        interfaceManager.myRequest.open("GET", interfaceManager.interfaceIP, true);
        interfaceManager.myRequest.send(null);
    }
    
    this.removeInterface = function(itemNumber) {        
        var listItem = $('#interfaceList > li:eq(' + itemNumber + ')');
        var arr = listItem.html().split("</div>");
        var newKey = arr[1];
        for(var i = 0; i < interfaceManager.loadedInterfaces.length; i++) {
            var interface = interfaceManager.loadedInterfaces[i];
            PhoneGap.exec(null, null, "DeviceFeatures", "print", ["Key = " + newKey + " :: interface.name = " + interface.name]);
            if(interface.name == newKey) {
                interfaceManager.loadedInterfaces.splice(i,1);
                listItem.remove();
                localStorage.interfaceFiles = JSON.stringify(interfaceManager.loadedInterfaces);
                //$('#interfaceList').listview('refresh');
                break;
            }
        }
    }

    this.saveInterface = function(interfaceJSON, shouldReloadList, ipAddress) {
        if (typeof ipAddress == "undefined") ipAddress = "";
        var loadedInterfaceName = null;
        //console.log(interfaceJSON);
        eval(interfaceJSON);
        PhoneGap.exec(null, null, "DeviceFeatures", "print", ["SAVING"]);
        if (loadedInterfaceName != null) {
            interfaceManager.loadedInterfaces.push({
                name:    loadedInterfaceName,
                json:    interfaceJSON,
                address: ipAddress
            });
            
            localStorage.interfaceFiles = JSON.stringify(interfaceManager.loadedInterfaces);
            
            if (shouldReloadList) {
                interfaceManager.createInterfaceListWithStoredInterfaces();
            }
        }
    }

    this.pushInterfaceWithDestination = function(interfaceJSON, nameOfSender, newDestination) {
        if (typeof nameOfSender != "undefined") {
            if (confirm("An interface is being pushed to you by " + nameOfSender + ". Do you accept it?")) {
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
        if (confirm("An interface is being pushed to you. Do you accept it?")) {
            var loadedInterfaceName = null;
            interfaceManager.runInterface(interfaceJSON);
            this.saveInterface(interfaceJSON, false);
        }
    }

    this.runInterface = function(json) {
        if(!control.isLoadingInterface) {
            control.unloadWidgets();
            constants = null;
            pages = null;

            oscManager.delegate = oscManager;
            midiManager.delegate = midiManager;

            eval(json);

            this.currentInterfaceName = loadedInterfaceName;
            this.currentInterfaceJSON = json;

            if (typeof interfaceOrientation != "undefined") {
                control.orientationString = interfaceOrientation;
                //console.log("ROTATING ****************************" + interfaceOrientation);
                PhoneGap.exec(null, null, "DeviceFeatures", "setOrientation", [interfaceOrientation]); // the plugin calls the rotationSet method after it's finished rotating which loads in widgets, sets screen resolution etc.
            }
            control.isLoadingInterface = true;
        }
    }

    this.selectInterfaceFromList = function(interfaceNumber) {
        var r = interfaceManager.loadedInterfaces[interfaceNumber];
        
        if (typeof r.address != "undefined")
            interfaceManager.interfaceIP = r.address;
        
        interfaceManager.runInterface(r.json);
    }

    return this;
}