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
	private NetworkMidiInput midiIn;	
	private byte[] myNote = new byte[]{(byte)0x90, (byte)0x24, 0};
	private boolean showDialog;

	private NetworkMidiSystem nmjs;
    private  NetworkMidiOutput out;
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;

		try {
		    if (action.equals("start")) {
		        System.out.println("TESTING MIDI ******************************");
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
                final NetworkMidiClient nmc = (NetworkMidiClient)this;
                final NetworkMidiListener ml = this;

		        
                System.out.println("num channels = " + NMJConfig.getNumChannels());
                for (int i = 0; i < NMJConfig.getNumChannels(); i++) {
			         System.out.println("MIDI :: " + NMJConfig.getName(i));
			    }
                //NMJConfig.setNumChannels(4);
                // NMJConfig.setMode(3, NMJConfig.RAW);
                // NMJConfig.setIP(3,"192.168.1.102");
                // NMJConfig.setPort(3, 10233);
                // NMJConfig.connectLocalSession(3,0);
    		} else if (action.equals("send") && hasAddress) {
    		    System.out.println("SENDING MIDI");
    		                    final NetworkMidiListener ml = this;

                final NetworkMidiClient nmc = (NetworkMidiClient)this;
                try{
	        		midiIn = nmjs.openInput(3, nmc);
	        		midiIn.addMidiListener(ml);
		        } catch (Exception e){
	        		e.printStackTrace();
		        }
		        
		        try{
	        		out = nmjs.openOutput(4, nmc);
	        	} catch (Exception e){
	        		e.printStackTrace();
		        }
			    out.sendMidi(new byte[]{(byte)0x80, 7, 0});
    			//Log.d("OSCManager", "building message");
    			// String address = "";
    			//               ArrayList<Object> values = new ArrayList<Object>();
    			//           
    			//               address = data.getString(0);
    			//               for(int i = 2; i < data.length(); i++) {
    			//                   Object obj = data.get(i);
    			//                   if(obj instanceof java.lang.Double) { // doubles are returned from JSON instead of floatsbut not handled by the oscmsg class
    			//                       //System.out.println("got a double");
    			//                       values.add( new Float( ( (Double) obj ).doubleValue() ) );
    			//                   }else{
    			//                       values.add( obj);
    			//                   }
    			//                   //Log.d("OSCManager", ""+data.get(i).getClass().toString());
    			//               }
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
