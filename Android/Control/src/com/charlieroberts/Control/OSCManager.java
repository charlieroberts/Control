/**
 * PhoneGap plugin handling OSC communication in Control
 */
package com.charlieroberts.Control;

import java.io.File;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

//import de.sciss.net.*;
import java.io.IOException;
import java.net.*;
import java.nio.channels.DatagramChannel;

import com.illposed.osc.*;

import java.io.StringWriter;
import java.io.PrintWriter;

public class OSCManager extends Plugin {
	public boolean hasAddress = false; // send only after selecting ip address / port to send to
	public int receivePort = 8080; 
	public final Object        sync = new Object();
	
	public OSCPortIn receiver = null;
	public int r = 0;	
	public OSCPortOut sender;
	public com.illposed.osc.OSCListener listener;
	public String ipAddress;
	
	//public de.sciss.net.OSCClient c;
		
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;		
		try {
		    if (action.equals("startPolling") && r == 0) {
     		    //Log.d("OSCManager", "building client");
    			receiver = new OSCPortIn(receivePort);
				r = 1;
				
    			listener = new com.illposed.osc.OSCListener() {
    	        	public void acceptMessage(java.util.Date time, com.illposed.osc.OSCMessage message) {
    	        	    Object[] args = message.getArguments();
						String address = message.getAddress();
            			if(address.equals("/pushInterface") || address.equals("/control/pushInterface")) {
                            String js = "javascript:Control.interfaceManager.pushInterface('" + ((String)args[0]).replace('\n', ' ') + "')"; // remove line breaks
                    
                            webView.loadUrl(js);
            			}else if(address.equals("/pushDestination") || address.equals("/control/pushDestination")) {
            			    String js = "javascript:Control.destinationManager.pushDestination('" + (String)args[0] + "')";
            			    //System.out.println(js);
            			    webView.loadUrl(js);
            			}else{
            			    String jsString = "javascript:Control.oscManager.processOSCMessage(";
                			jsString = jsString + "\"" + message.getAddress() + "\", \"";
    			
                			StringBuffer typeTagString = new StringBuffer();
                			StringBuffer argString = new StringBuffer();
    			
                			for(int i = 0; i < args.length; i++) {
                			    Object arg = args[i];
            			        if(arg instanceof java.lang.Float) {
            			            typeTagString.append('f');
            			            argString.append( ((Float)args[i]).floatValue() );
            			        }else if(arg instanceof java.lang.Integer) {
            			            typeTagString.append('i');
            			            argString.append( ((Integer)args[i]).intValue() );
            			        }else if(arg instanceof java.lang.String) {
		                			System.out.println(args[i]);
									
            			            typeTagString.append('s');
            			            argString.append("\"");
            			            argString.append( ((String)args[i]) );
            			            argString.append("\"");    			            
            			        }
            			        if(i != args.length - 1) { argString.append(','); }
                			}
                			jsString = jsString + typeTagString + "\", " + argString + ");";
                			webView.loadUrl(jsString);
                			//System.out.println(jsString);
                		}
            		}
            	};
				
            	receiver.addListener("/", listener);
            	receiver.startListening(); 
				
    		} else if (action.equals("send") && hasAddress) {
    			//Log.d("OSCManager", "building message");
    			String address = "";
    			ArrayList<Object> values = new ArrayList<Object>();
			
    			address = data.getString(0);
				for(int i = 2; i < data.length(); i++) {
				    Object obj = data.get(i);
				    if(obj instanceof java.lang.Double) { // doubles are returned from JSON instead of floatsbut not handled by the oscmsg class
				        //System.out.println("got a double");
				        values.add( new Float( ( (Double) obj ).doubleValue() ) );
				    }else{
    					values.add( obj);
    				}
					//Log.d("OSCManager", ""+data.get(i).getClass().toString());
				}
    		
    			OSCMessage msg = new OSCMessage( address, values.toArray() );
             	
                sender.send(msg);
    		}else if(action.equals("setIPAddressAndPort")){
    			Log.d("OSCManager", "setting ip address and port");
			    ipAddress = data.getString(0);
				sender = new OSCPortOut( InetAddress.getByName(ipAddress), data.getInt(1) );
				hasAddress = true;
    		}else if(action.equals("setOSCReceivePort")){
				if(data.getInt(0) != receivePort) {
					receivePort = data.getInt(0);
				   	receiver = new OSCPortIn(receivePort);
				   	receiver.addListener("/", listener);
				   	//System.err.println("MADE NEW PORT WHICH WAS " + data.getInt(0));
				}
    		}else{
    			result = new PluginResult(Status.INVALID_ACTION);
    		}
    		return result;
    	}catch (Exception e) {
            System.err.println("Error creating JSON from js message");
        }
        return result;
    }
	
	public String getLocalIpAddress() {
        try {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();) {
                NetworkInterface intf = en.nextElement();
                for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements();) {
                    InetAddress inetAddress = enumIpAddr.nextElement();
                    if (!inetAddress.isLoopbackAddress()) {
                        System.err.println(inetAddress.getHostAddress().toString());
                    }
                }
            }
        } catch (SocketException ex) {
            System.err.println( "can't get ip" );
        }
        return null;
    }
}
