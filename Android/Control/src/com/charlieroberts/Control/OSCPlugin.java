/**
 * Example of Android PhoneGap Plugin
 */
package com.charlieroberts.Control;

import java.io.File;
import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

import de.sciss.net.*;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.io.StringWriter;
import java.io.PrintWriter;

public class OSCPlugin extends Plugin {

	/** List Action */
	public static final String ACTION="send";
	public static final String OSC_SEND_ADDRESS = "192.168.1.2";
	public final Object        sync = new Object();
	public OSCClient c;

	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;
		try {
			//Log.d("OSCPlugin", "building client");
			if(c == null) { // TODO: wtf is a constructor or onload handler for these plugins?
				c = OSCClient.newUsing(OSCClient.UDP);
	            c.setTarget( new InetSocketAddress( OSC_SEND_ADDRESS, 10001 ));
				c.start();
	            //c.dumpOSC( OSCChannel.kDumpBoth, System.err );
			}
		} catch (IOException e) {
			System.err.println("Error creating / binding OSC client");
		}
		if (ACTION.equals(action)) {
			//Log.d("OSCPlugin", "building message");
			String address = "";
			ArrayList<Object> values = new ArrayList<Object>();
			
			try {
				address = data.getString(0);
				for(int i = 2; i < data.length(); i++) {
					values.add(data.get(i));
					//Log.d("OSCPlugin", ""+data.get(i));
				}
			} catch (JSONException jsonEx) {
				System.err.println("Error creating JSON from js message");
			}
			
			OSCMessage msg = new OSCMessage( address, values.toArray() );

         	try {
	          	c.send(msg);
				JSONObject oscInfo = new JSONObject();
				result = new PluginResult(Status.OK, oscInfo);
	         }
	         catch( IOException e ) {
	            System.err.println("CRAP NetUtil osc sending isn't working!!!");

	            StringWriter sw = new StringWriter();
	            e.printStackTrace(new PrintWriter(sw));
	            System.err.println( sw.toString());
	         }
		}else{
			result = new PluginResult(Status.INVALID_ACTION);
		}
		return result;
	}

	/** Leave as reference for passing received OSC msgs into javascript

	private JSONObject getOSC(File file) throws JSONException {
		JSONObject fileInfo = new JSONObject();
		fileInfo.put("filename", file.getName());
		fileInfo.put("isdir", file.isDirectory());

		if (file.isDirectory()) {
			JSONArray children = new JSONArray();
			fileInfo.put("children", children);
			if (null != file.listFiles()) {
				for (File child : file.listFiles()) {
					children.put(getOSC(child));
				}
			}
		}

		return fileInfo;
	}*/
}
