Control.guiAssist = {
	selectedFunctionalities : [],
    
	/* 	request a list of application functionalities / ranges from app 
     for now, let's push this instead
     */
	requestFunctionalities : function() {
		
		
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
			$(checkbox).bind("change", function() {
				console.log(this.func.name + " : " + this.checked);
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
			console.log("BEFORE LOOP")
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
		console.log("creating interface");
		for(var i = 0; i < functionalities.length; i++) {
			console.log("Creating " + functionalities[i].name);
		}
	},
	
	test : function() { 
		console.log("TESTING");
		var f = [
        { name : "test1", min : 0,  max : 1, oscAddress : "/test1"},
        { name : "test2", min : -1, max : 1, oscAddress : "/test2"},
		];
		
		this.createFunctionalitiesForm(f);
	},
};