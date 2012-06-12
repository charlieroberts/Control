/**
 * PhoneGap plugin handling Bonjour communication in Control
 */
package com.charlieroberts.Control;

import java.io.File;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;
import android.view.WindowManager;
import com.phonegap.*;


import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

import java.io.IOException;
import java.net.*;
import java.nio.channels.DatagramChannel;

import java.io.StringWriter;
import java.io.PrintWriter;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceListener;
import javax.jmdns.ServiceInfo;

import android.app.Activity;
import android.os.Bundle;

public class Bonjour extends Plugin {
    private String oscType = "_osc._udp.local.";
    private String midiType = "_apple-midi._udp.local.";
	JmDNS jmdns;
	ServiceListener oscListener, midiListener;
	String myIP, myMac;

	public Bonjour() {
	    try{
                jmdns = JmDNS.create();
                jmdns.addServiceListener(oscType, oscListener = new ServiceListener() {
                    @Override
                    public void serviceResolved(ServiceEvent ev) {
                        //System.out.println("Service resolved: " + ev.getInfo().getQualifiedName() + " port:" + ev.getInfo().getPort());
                        String address = ev.getInfo().getHostAddress();
                        if(address.compareTo(myIP) != 0 && address.compareTo(myMac) != 0 ) {
                            String jsString = "javascript:Control.destinationManager.addDestination('" + address + "'," + ev.getInfo().getPort() + ", 1, 0);";
                            //System.out.println(jsString);
                            webView.loadUrl(jsString);
                        }
                    }
                    @Override
                    public void serviceRemoved(ServiceEvent ev) {
                        //System.out.println("Service removed: " + ev.getName());
                        String jsString = "javascript:Control.destinationManager.removeDestinationWithIPAndPort('" + ev.getInfo().getHostAddress() + "'," + ev.getInfo().getPort() + ");";
                        //System.out.println(jsString);
                        webView.loadUrl(jsString);
                    }
                    @Override
                    public void serviceAdded(ServiceEvent event) {
                        // Required to force serviceResolved to be called again
                        // (after the first search)
                        jmdns.requestServiceInfo(event.getType(), event.getName(), 1);
                    }
                });
                                
                jmdns.addServiceListener(midiType, midiListener = new ServiceListener() {
                    @Override
                    public void serviceResolved(ServiceEvent ev) {
                        System.out.println(ev.toString());
                        System.out.println("Service resolved: " + ev.getInfo().getQualifiedName() + " port:" + ev.getInfo().getPort());
                        String address = ev.getInfo().getHostAddress();
                        System.out.println(address + " :: " + myIP);
                        if(address.compareTo(myIP) != 0 && address.compareTo(myMac) != 0 ) {
                            String jsString = "javascript:Control.destinationManager.addDestination('" + address + "'," + ev.getInfo().getPort() + ", 0, 1);";
                            //System.out.println(jsString);
                            webView.loadUrl(jsString);
                        }
                    }
                    @Override
                    public void serviceRemoved(ServiceEvent ev) {
                        System.out.println("Service removed: " + ev.getName());
                        String jsString = "javascript:Control.destinationManager.removeDestinationWithIPAndPort('" + ev.getInfo().getHostAddress() + "'," + ev.getInfo().getPort() + ");";
                        //System.out.println(jsString);
                        webView.loadUrl(jsString);
                    }
                    @Override
                    public void serviceAdded(ServiceEvent event) {
                        // Required to force serviceResolved to be called again
                        // (after the first search)
                        jmdns.requestServiceInfo(event.getType(), event.getName(), 1);
                    }
                });
                
                getLocalIpAddress();
                
            }catch(Exception e) {
                System.out.println("error starting Bonjour");
            }
	    }
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
	    //Log.d("OSCManager", "executing something " + action);	
		PluginResult result = null;
        try {
                    System.out.println("EXECUTING BONJOUR ********************************************");
                    if (action.equals("start") || action.equals("browse")) {
                        System.out.println("STARTING BONJOUR ********************************************");
                    
                        ServiceInfo[] infos = jmdns.list("_osc._udp.local.");
                        for (int i = 0; i < infos.length; i++) {
                            String address = infos[i].getHostAddress();
                            if(address.compareTo(myIP) != 0 && address.compareTo(myMac) != 0 ) {
                                String jsString = "javascript:Control.destinationManager.addDestination('" + address + "'," + infos[i].getPort() + ", 0, 0);";
                                // System.out.println(jsString);
                                webView.loadUrl(jsString);
                            }
                        } // _apple-midi._udp.
                        
                        infos = jmdns.list("_apple-midi._udp.local.");
                        for (int i = 0; i < infos.length; i++) {
                            String address = infos[i].getHostAddress();
                            //System.out.println(address + " :: " + myIP);
                            if(address.compareTo(myIP) != 0 && address.compareTo(myMac) != 0 ) {
                                String jsString = "javascript:Control.destinationManager.addDestination('" + address + "'," + infos[i].getPort() + ", 0, 1);";
                            //    System.out.println(jsString);
                                webView.loadUrl(jsString);
                            }
                        }
                        
                        if(action.equals("start")) {
                            ServiceInfo serviceInfo = ServiceInfo.create("_osc._udp.local.",
                                         "Control_" + (Math.round(Math.random() * 100000)), 8080,
                                         "OSC reception for device running Control");
                            jmdns.registerService(serviceInfo);
                        }
                    }
                } catch (Exception e) {
                    System.out.println("after sending to js");
                }
		return result;
	}
	
	// TODO: where do I call this? how do plugins get deconstructed?
    // jmdns.unregisterAllServices();
    // jmdns.close();
	
	/*
	** This method has to get both the IP address (192.168.1.1??) and the MAC address of the network card. For some reason Android will return
	** the MAC address when querying Bonjour for OSC destinations, but returns the IP address when querying MIDI (wtf?). We want to avoid placing
	** any local destinations in the destination list (since that would just be a loopback) so we must keep track of both of these
	*/
	public String getLocalIpAddress() {
	    System.out.println("getting local ip");
        try {
                   for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();) {
                       NetworkInterface intf = en.nextElement();
                       for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements();) {
                           InetAddress inetAddress = enumIpAddr.nextElement();
                           if (!inetAddress.isLoopbackAddress()) {
                               if(inetAddress.getHostAddress().indexOf(":") == -1) { // avoid local and MAC address
                                    //System.err.println(inetAddress.getHostAddress());
                                   myIP = inetAddress.getHostAddress();
                               }else{
                                   myMac = inetAddress.getHostAddress();
                                   //System.out.println("FOUND MAC : " + myMac);
                               }
                           }
                       }
                   }
               } catch (SocketException ex) {
                   System.err.println( "can't get ip" );
               }
 
        return null;
    }
}
