
/**
 *  
 * @return Instance of OSC
 */
var OSCPlugin = function() { 
	console.log("making OSC start");
}

/**
 * @param directory The directory for which we want the listing
 * @param successCallback The callback which will be called when directory listing is successful
 * @param failureCallback The callback which will be called when directory listing encouters an error
 */
OSCPlugin.prototype.send = function(msg, successCallback, failureCallback) {

    return PhoneGap.exec(successCallback,   //Callback which will be called when directory listing is successful
    					failureCallback,    //Callback which will be called when directory listing encounters an error
    					'OSCPlugin',  		//Telling PhoneGap that we want to run "OSC" Plugin
    					'send',             //Telling the plugin, which action we want to perform
    					msg);        		//Passing a list of arguments to the plugin, in this case this is the directory path
};

/**
 * <ul>
 * <li>Register the Directory Listing Javascript plugin.</li>
 * <li>Also register native call which will be called when this plugin runs</li>
 * </ul>
 */
PhoneGap.addConstructor(function() {
	console.log("phonegap add constructor....");
	//Register the javascript plugin with PhoneGap
	PhoneGap.addPlugin('OSCPlugin', new OSCPlugin());
	
	//Register the native class of plugin with PhoneGap
	PluginManager.addService("OSCPlugin","com.charlieroberts.Control.OSCPlugin");
});