/**
 * PhoneGap plugin handling OSC communication in Control
 */
package com.charlieroberts.Control;

import de.humatic.nmj.NMJConfig;
import de.humatic.nmj.NMJSystemListener;
import de.humatic.nmj.NetworkMidiInput;
import de.humatic.nmj.NetworkMidiListener;
import de.humatic.nmj.NetworkMidiOutput;
import de.humatic.nmj.NetworkMidiSystem;
import de.humatic.nmj.NetworkMidiClient;

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

import java.io.StringWriter;
import java.io.PrintWriter;

public class MIDIManager extends Plugin implements NetworkMidiListener, NMJSystemListener {
	public boolean hasAddress = false; // send only after selecting ip address / port to send to
	public int receivePort; 
	public final Object        sync = new Object();

	public String ipAddress;
	
	private NetworkMidiOutput midiOut;
	private byte[] myNote = new byte[]{(byte)0x90, (byte)0x24, 0};
	
	private NetworkMidiSystem nmjs;

	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;
		try {
		    if (action.equals("start")) {
		        Log.d("MIDIManager", "starting native midimanager code");
		        try{
                	nmjs = NetworkMidiSystem.get(this.ctx);
                } catch (Exception e) {
                	// This would happen if no network permissions were given. See AndroidManifest.xml
			        Log.d("MIDIManager", "failed to create network midi system code");

                	e.printStackTrace();
                	return result;
                }
                
                
                NMJConfig.addSystemListener(this);
                NMJConfig.setIP(0,"192.168.1.102");
                NMJConfig.setPort(0, 10233);
                NMJConfig.setIO(0,1);
                Log.d("MIDIManager", "add system listener");
                /** can't use "this" in the below event handler **/
                final NetworkMidiClient nmc = (NetworkMidiClient)this;
                Log.d("MIDIManager", " make midi client");
                final NetworkMidiListener ml = this;
                Log.d("MIDIManager", " midi listener");
                
                NMJConfig.connectLocalSession(0,0);
                
                // try{ midiOut.close(nmc); } catch (NullPointerException ne){}
                // 
                //                 try{
                //                  midiOut = nmjs.openOutput(8, nmc);
                //              } catch (Exception e){
                //                  Log.d("MIDIManager", "unable to open output");
                //                  e.printStackTrace();
                //              }
                //              
                //                 midiOut.sendMidi(myNote);


            	Log.d("MIDIManager", "finished setting up MIDI receiver and now listening");
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
    		}else{
    			result = new PluginResult(Status.INVALID_ACTION);
    		}
    		return result;
    	}catch (Exception e) {
            System.err.println("Error creating JSON from js message");
        }
        return result;
    }
	
	@Override
	public void midiReceived(int channel, int ssrc, byte[] data, long timestamp) {

		/**
		 * As MIDI does not arrive on the GUI thread, it needs to be offloaded in
		 * order to be displayed. Android's Handler class is one way to do this.
		 */
		//Message msg = Message.obtain();
    	//Bundle b = new Bundle();
    	//b.putByteArray("MIDI", data);
    	//b.putInt("CH", channel);
    	//msg.setData(b);

    	//midiLogger.sendMessage(msg);

	}
	
	@Override
	public void systemChanged(int channel, int property, int value) {

		System.out.println(" System changed "+channel+" "+property+" "+value);

		if (property == NMJConfig.RTPA_EVENT && value == NMJConfig.RTPA_CH_DISCOVERED) {
			/**
			 * Given multicast works then DNS might uncover more
			 * channels and call this for notification. Time to update the spinner.
			 */
		}

	}

	@Override
	public void systemError(int channel, int err, String description) {
		// TODO Auto-generated method stub

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
