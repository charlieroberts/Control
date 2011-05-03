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
import java.net.SocketAddress;
import java.io.StringWriter;
import java.io.PrintWriter;

public class OSCManager extends Plugin {
	
	/** List Action 
		 BOOL shouldPoll;
		ExamplePacketListener  * listener;
		UdpListeningReceiveSocket * s;
		NSMutableDictionary * addresses;
	
		IpEndpointName    * destinationAddress;
		UdpTransmitSocket * output;
		int receivePort;*/
		
	// TODO: does android need polling? how does the webview communicate with java?
	/* THIS LOOKS NASTY
	webview.loadUrl("javascript:(function() { document.getElementsByTagName('body')[0].style.color = 'red';})()");  
	*/
	public boolean hasAddress = false; // send only after selecting ip address / port to send to
	public int receivePort; 
	public static final String OSC_SEND_ADDRESS = "192.168.1.8";
	public final Object        sync = new Object();
	public OSCClient c;
	
	public OSCManager() {
		System.err.print("**************************** CONSTRUCTOR *************************************");
	}
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;
		try {
			//Log.d("OSCManager", "building client");
			if(c == null) { // TODO: wtf is a constructor or onload handler for these plugins?
				c = OSCClient.newUsing(OSCClient.UDP, 10002);
	            c.setTarget( new InetSocketAddress( OSC_SEND_ADDRESS, 10001 ));
				c.start();
				c.addOSCListener( new OSCListener() {
        			public void messageReceived( OSCMessage m, SocketAddress addr, long time ) {
						System.err.print("msg received!");
						String msg = "oscManager.processMessage(";
						msg += m.getName() + ",";
						String tt = "";
						for(int i = 0; i < m.getArgCount(); i++) {
							tt += "s";
						}
						msg += tt + ",";
						for(int i = 0; i < m.getArgCount(); i++) {
							msg += m.getArg(i).toString();
							if(i != m.getArgCount() -1) msg += ",";
						}
						msg += ");";
						System.err.println(msg);
			        }
			    });
	            c.dumpOSC( OSCChannel.kDumpBoth, System.err );
			}
		} catch (Exception e) {
			System.err.println("Error creating / binding OSC client");
		}
		try {
			synchronized( sync ) {
            	sync.wait( 10000 );
			}
        } catch(InterruptedException e1 ) {
	        e1.printStackTrace();
    	}

		if (action.equals("send") && hasAddress) {
			//Log.d("OSCManager", "building message");
			String address = "";
			ArrayList<Object> values = new ArrayList<Object>();
			
			try {
				address = data.getString(0);
				for(int i = 2; i < data.length(); i++) {
					values.add(data.get(i));
					//Log.d("OSCManager", ""+data.get(i));
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
		}else if(action.equals("setIPAddressAndPort")){
			try {
				System.err.println("something");
	            c.setTarget( new InetSocketAddress( data.getString(0), data.getInt(1) ));
				hasAddress = true;
			} catch (JSONException jsonEx) {
				System.err.println("Error creating JSON from js message");
			}
		}else if(action.equals("setOSCReceivePort")){
			try {
				receivePort = data.getInt(0);
			} catch (JSONException jsonEx) {
				System.err.println("Error creating JSON from js message");
			}
		}else{
			result = new PluginResult(Status.INVALID_ACTION);
		}
		return result;
	}
	/*
	@interface OSCManager : PhoneGapCommand {
   
	}

@property (retain) NSMutableDictionary * addresses;
@property (nonatomic) int receivePort;
- (void)oscThread;
- (void)pushInterface:(NSValue *)msgPointer;
- (void)pushDestination:(NSValue *) msgPointer;

- (void)setOSCReceivePort:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)setIPAddressAndPort:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)startReceiveThread:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)send:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)startPolling:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)stopPolling:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
*/

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
