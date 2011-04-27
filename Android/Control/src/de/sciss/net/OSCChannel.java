/*
 *  OSCChannel.java
 *  de.sciss.net (NetUtil)
 *
 *  Copyright (c) 2004-2009 Hanns Holger Rutz. All rights reserved.
 *
 *	This library is free software; you can redistribute it and/or
 *	modify it under the terms of the GNU Lesser General Public
 *	License as published by the Free Software Foundation; either
 *	version 2.1 of the License, or (at your option) any later version.
 *
 *	This library is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *	Lesser General Public License for more details.
 *
 *	You should have received a copy of the GNU Lesser General Public
 *	License along with this library; if not, write to the Free Software
 *	Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 *
 *	For further information, please contact Hanns Holger Rutz at
 *	contact@sciss.de
 *
 *
 *  Changelog:
 *		26-Aug-05	created
 *		30-Sep-06	renamed from AbstractOSCCommunicator to OSCChannel, now an interface
 *		02-Jul-07	added setCodec, getCodec
 */

package de.sciss.net;

import java.io.IOException;
import java.io.PrintStream;
import java.net.InetSocketAddress;

/**
 *	A collection of common constants and methods that apply to all kinds of OSC communicators.
 *	Formely being abstract superclass <code>AbstractOSCCommunicator</code> of <code>OSCTransmitter</code> and
 *	<code>OSCReceiver</code>, the functionality has been reduced and converted to an interface as of v0.30.
 *	</P><P>
 *	The method for getting a socket's <code>DatagramChannel</code> has been removed in the course of TCP integration, also with
 *	keeping in mind the possible future integration of other channel types such as <code>FileChannel</code>
 *	or <code>PipeChannel</code>.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.37, 12-May-09
 *
 *	@since		NetUtil 0.30
 */
public interface OSCChannel
{
	/**
	 *	Protocol type : user datagram protocol.
	 *	<A HREF="http://en.wikipedia.org/wiki/User_Datagram_Protocol">en.wikipedia.org/wiki/User_Datagram_Protocol</A> for explanation
	 */
	public static final String			UDP				= "udp";
	/**
	 *	Protocol type : transmission control protocol.
	 *	<A HREF="http://en.wikipedia.org/wiki/Transmission_Control_Protocol">en.wikipedia.org/wiki/Transmission_Control_Protocol</A> for explanation
	 */
	public static final String			TCP				= "tcp";
//	/**
//	 *	Protocol type :
//	 *	(currently not supported)
//	 */
//	public static final String			PIPE			= "pipe";
//	/**
//	 *	Protocol type :
//	 *	(currently not supported)
//	 */
//	public static final String			FILE			= "file";

	/**
	 *	Dump mode: do not dump messages
	 */
	public static final int				kDumpOff		= 0;
	/**
	 *	Dump mode: dump messages in text formatting
	 */
	public static final int				kDumpText		= 1;
	/**
	 *	Dump mode: dump messages in hex (binary) view
	 */
	public static final int				kDumpHex		= 2;
	/**
	 *	Dump mode: dump messages both in text and hex view
	 */
	public static final int				kDumpBoth		= 3;
	
	/**
	 *	The default buffer size (in bytes) and maximum OSC packet
	 *	size (8K at the moment).
	 */
	public static final int				DEFAULTBUFSIZE	= 8192;

	/**
	 *	Queries the transport protocol used by this communicator.
	 *	
	 *	@return				the protocol, such as <code>UDP</code> or <code>TCP</code>
	 *
	 *	@see	#UDP
	 *	@see	#TCP
	 */
	public String getProtocol();

	/**
	 *	Queries the communicator's local socket address.
	 *	You can determine the host and port from the returned address
	 *	by calling <code>getHostName()</code> (or for the IP <code>getAddress().getHostAddress()</code>)
	 *	and <code>getPort()</code>.
	 *	
	 *	@return				the address of the communicator's local socket.
	 *	@throws	IOException	if the local host could not be resolved
	 *
	 *	@see	java.net.InetSocketAddress#getHostName()
	 *	@see	java.net.InetSocketAddress#getAddress()
	 *	@see	java.net.InetSocketAddress#getPort()
	 *
	 *	@see	#getProtocol()
	 */
	public InetSocketAddress getLocalAddress() throws IOException;
	
	/**
	 *	Adjusts the buffer size for OSC messages.
	 *	This is the maximum size an OSC packet (bundle or message) can grow to.
	 *
	 *	@param	size					the new size in bytes.
	 *
	 *	@see	#getBufferSize()
	 */
	public void setBufferSize( int size );

	/**
	 *	Queries the buffer size used for coding or decoding OSC messages.
	 *	This is the maximum size an OSC packet (bundle or message) can grow to.
	 *
	 *	@return			the buffer size in bytes.
	 *
	 *	@see	#setBufferSize( int )
	 */
	public int getBufferSize();

	/**
	 *	Changes the way processed OSC messages are printed to the standard err console.
	 *	By default messages are not printed.
	 *
	 *  @param	mode	one of <code>kDumpOff</code> (don't dump, default),
	 *					<code>kDumpText</code> (dump human readable string),
	 *					<code>kDumpHex</code> (hexdump), or
	 *					<code>kDumpBoth</code> (both text and hex)
	 *	@param	stream	the stream to print on, or <code>null</code> which
	 *					is shorthand for <code>System.err</code>
	 *
	 *	@see	#kDumpOff
	 *	@see	#kDumpText
	 *	@see	#kDumpHex
	 *	@see	#kDumpBoth
	 */
	public void dumpOSC( int mode, PrintStream stream );

	/**
	 *	Disposes the resources associated with the OSC communicator.
	 *	The object should not be used any more after calling this method.
	 */
	public void dispose();
	
	/**
	 *	Specifies which codec is used in packet coding and decoding.
	 *
	 *	@param	c	the codec to use
	 *
	 *	@since		NetUtil 0.33
	 */
	public void setCodec( OSCPacketCodec c );
	
	/**
	 *	Queries the codec used in packet coding and decoding.
	 *
	 *	@return	the current codec of this channel
	 *	@see	OSCPacketCodec#getDefaultCodec()
	 *
	 *	@since		NetUtil 0.33
	 */
	public OSCPacketCodec getCodec();
}
