Control.guiAssist = {
	selectedFunctionalities : [],
    
	/* 	request a list of application functionalities / ranges from app 
     for now, let's push this instead
     */
	requestFunctionalities : function() {
		Control.oscManager.sendOSC("/getApplication", "s", "8080");
	},
	
	/* create a list of all functionalities and display it in Control along with checkboxes, an accept button and a cancel button */
	createFunctionalitiesForm : function(functionalities) {
		/* 
         * functionalities take the form
         * name - 1st-grader readable String
         * oscAddress
         * min - minimum value
         * max - maximum value
         */
		console.log("creating table!");
		this.functionalities = functionalities;
		this.table = document.createElement("table");
		$(this.table).css({
                          position: "absolute",
                          top : "40px",
                          left : 0,
                          width: "100%",
                          height: "80%",
                          "background-color" : "rgba(0,0,0,1)",
                          "font-size": "1.5em",
                          });
		
		for(var i = 0; i < this.functionalities.length; i++) {
			var func = this.functionalities[i];
			
			var row = document.createElement("tr");
			$(row).css({"height": "2em"});
			
			var nameCell = document.createElement("td");
			var checkCell = document.createElement("td");
			nameCell.innerHTML = func.name;
			
			var checkbox = document.createElement("input");
			$(checkbox).attr("type", "checkbox");
			checkbox.func = func;
			$(checkbox).bind("touchend", function() {
                             this.checked = !this.checked;
                             this.func.selected = this.checked;
                             });
			$(checkCell).append(checkbox);
			
			$(row).append(nameCell);
			$(row).append(checkCell);
			$(this.table).append(row);
		}
		var that = this;
		
		var killButtonCell = document.createElement("td");
		var createButton = document.createElement("button");
		$(createButton).bind("touchstart", function() {
                             that.selectedFunctionalities = [];
                             for(var i = 0; i < that.functionalities.length; i++) {
                             var func = that.functionalities[i];
                             if(func.selected === true) {
                             that.selectedFunctionalities.push(func);
                             }
                             }
                             $(that.table).remove();
                             that.createInterfaceWithFunctionalities(that.selectedFunctionalities);
                             
                             });
		createButton.innerHTML = "Create GUI";
        
		var r = document.createElement("tr");
		
		$(killButtonCell).append(createButton);
		$(r).append(killButtonCell);
		$(this.table).append(r);
		
		$("body").append(this.table);	
	},
	
	/* create a gui using the chosen set of functionalities */
	createInterfaceWithFunctionalities : function(functionalities) {
		var controlDict = [];
		//console.log("ARGGGGGGGGGGGGGGGGGH")
		for(var i = 0; i < functionalities.length; i++) {
			var f = functionalities[i];
            
            var isImportant = false;
        	console.log("NAME = " + f.name);
			var w = {
				name : f.name,
				type : (f.continuous) ? "Slider" : "Button",
				label : f.name,
				address : f.destination,
				color : "#999",
				range : [f.min, f.max],
            isLocal: true,
				ontouchstart : function() { 
					var _f  = f;
					Control.oscManager.sendOSC("/OSCDeviceMsg", "ssf", "Control", this.name, this.value);
				}
			};
			
			controlDict.push({
                             name : f.name,
                             id	 : i,
                             minimum : f.min,
                             maximum : f.max,
                             expression : "",
                             });
			
			w.page = Control.currentPage;
			var _w = Control.makeWidget(w);
			
			Control.autogui.placeWidget(_w, false);
            
            var widgetPage = (typeof w.page !== "undefined") ? w.page : Control.currentPage;
            Control.addWidget(window[w.name], widgetPage);
		}
		Control.oscManager.sendOSC("/registerDevice", "ssis", "Control", "127.0.0.1", 8080, JSON.stringify(controlDict));
	},
	
	test : function() { 
		var f = [
                 { name : "test1", min : 0,  max : 1, oscAddress : "/test1"},
                 { name : "test2", min : -1, max : 1, oscAddress : "/test2"},
                 ];
		
		this.createFunctionalitiesForm(f);
	},
	
	test2 : function() { 
		this.requestFunctionalities();
	},
	
};