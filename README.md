Control
========

THIS IS THE DEVELOPMENT VERSION AND LOTS OF STUFF CURRENTLY DOESN'T WORK.

Right now I know OSC and MIDI transmission / reception works. Buttons, Sliders, Knobs, MultiButtons all work as of 1/28/2012. 

There are no more globals except for the Control object. So, oscManager is now Control.oscManager.

The interface format has changed. Here is a sample interface:

	Control.data = {} // store any variables here

	Control.functions = { // any functions you'd like to call. You can use 'this' to indicate the widget triggering the function
		sliderTouch : function() {
			console.log("slider value = " + this.val);
		}
	}

	Control.interface = {
		name : "test",
		orientation : "portrait",

		pages : [[
		{
			name: "slider2",
			type: "Button",
			bounds: [.0,.0,.5,.5],
			ontouchstart: Control.functions.sliderTouch,
		},
		{
		    "name": "refresh",
		    "type": "Button",
		    "x": 0,
		    "y": .8,
		    "width": .2,
		    "height": .2,
		    "startingValue": 0,
		    "isLocal": true,
		    "mode": "contact",
		    "ontouchstart": Control.interfaceManager.refreshInterface,
		    "stroke": "#aaa",
		},
		]],

		constants : [],
	}

You don't have to put your functions / data in the Control object (you can use globals), but this is the recommended way to do it and certain features might eventually depend on it. Note that we no longer use strings for event handlers. Actually, technically a string will still work, but it's more efficient to use a function pointer. You can also use an anonymous function if you want to pass arguments. Please ask any questions in the forum!!!

Get started
-----------

[charlie-roberts.com/Control/](http://www.charlie-roberts.com/Control)

Community
---------

- [Website](http://www.charlie-roberts.com/Control)
- [Forum](http://www.charlie-roberts.com/Control/forum)
    
License
-------
### The MIT License

Copyright (c) <2010> <Charlie Roberts., et. al., >

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

---