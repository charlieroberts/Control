/*
 *  OSCReceiver.java
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
 *		25-Jan-05	created from de.sciss.meloncillo.net.OSCReceiver
 *		26-May-05	moved to de.sciss.net package
 *		21-Jun-05	extended javadoc, set/getDebugDump
 *		25-Jul-05	removed setSocketAddress in stopListening (test wise)
 *		05-Aug-05	added dumpOSC method. new contract regarding connected channels
 *		26-Aug-05	binding an unbound socket in the constructor uses
 *					InetAddress.getLocalHost() or "127.0.0.1" depending on the
 *					loopback status of the filtering address;
 *					; new empty constructor ; corrected synchronized statements
 *					in add/removeOSCListener ; extends AbstractOSCCommunicator
 *		11-Sep-05	the message dispatcher catches runtime exceptions in the listeners ,
 *					therefore making it behave more like the usual awt event dispatchers
 *					and not killing the listening thread
 *		30-Jul-06	fixed a potential sync problem ; throws exceptions in start/stopListening
 *					when calling from an illegal thread
 *		30-Sep-06	made abstract (unfortunately not backward compatible), finished TCP support
 *		14-Oct-06	revivable channels
 *		02-Jul-07	added codec based factory methods
 */

package de.sciss.net;

import java.io.IOException;
import java.io.PrintStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.UnknownHostException;
import java.nio.BufferUnderflowException;
import java.nio.ByteBuffer;
import java.nio.channels.AlreadyConnectedException;
import java.nio.channels.ClosedChannelException;
import java.nio.channels.DatagramChannel;
import java.nio.channels.SelectableChannel;
import java.nio.channels.SocketChannel;
import java.util.ArrayList;
import java.util.List;
//import java.util.Map;

/**
 *  An <code>OSCReceiver</code> manages reception
 *	of incoming OSC messages. A receiver can be either <B>revivable</B> or
 *	<B>non-revivable</B>.
 *	<UL>
 *	<LI>A non-revivable receiver is bound to one particular network channel
 *	(<code>DatagramChannel</code> (for UDP) or <code>SocketChannel</code> (for TCP)).
 *	When the channel is closed, the receiver cannot be restarted. The network channel
 *	is closed for example when a TCP server shuts down, but also when trying to connect
 *	to a TCP server that is not yet reachable.</LI>
 *	<LI>It is therefore recommended to use revivable receivers. A revivable receiver
 *	is created through one of the <code>newUsing</code> constructors that takes a
 *	protocol and address argument. A revivable receiver can be restarted because it
 *	recreates the network channel if necessary.</LI>
 *	</UL><P>
 *	The receiver launches a listening <code>Thread</code> when
 *	<code>startListening</code> is called.
 *  <p>
 *  The <code>OSCReceiver</code> has methods for registering and unregistering listeners
 *  that get informed about incoming messages. Filtering out specific messages must be
 *	done by the listeners.
 *  <p>
 *  The listening thread is stopped using <code>stopListening</code> method.
 *	<P>
 *	<B>Note that as of v0.3,</B> you will most likely want to use preferably one of
 *	<code>OSCClient</code> or <code>OSCServer</code> over <code>OSCReceiver</code>.
 *	Also note that as of v0.3, <code>OSCReceiver</code> is abstract, which renders
 *	direct instantiation impossible. <B>To update old code,</B> occurrences of
 *	<code>new OSCReceiver()</code> must be replaced by one of the
 *	<code>OSCReceiver.newUsing</code> methods! The &quot;filter&quot; functionality of
 *	NetUtil 0.2 is now implied by calling <code>setTarget( SocketAddress )</code>.
 *	<P>
 *	Here is an example that also demonstrates message sending using an instance of
 *	<code>OSCTransmitter</code>:
 *	<pre>
 *      OSCReceiver     rcv     = null;
 *      OSCTransmitter  trns;
 *      DatagramChannel dch     = null;
 *
 *      try {
 *          final SocketAddress addr    = new InetSocketAddress( InetAddress.getLocalHost(), 57110 );
 *          final Object notify         = new Object();
 *          
 *          // note: using constructors with SelectableChannel implies the receivers and
 *          // transmitters cannot be revived. to create revivable channels on the same socket,
 *          // you must use one of the newUsing methods that take an IP address and/or port
 *          // number.
 *          dch     = DatagramChannel.open();
 *          dch.socket().bind( null );	// assigns an automatic local socket address
 *          rcv     = OSCReceiver.newUsing( dch );
 *          trns    = OSCTransmitter.newUsing( dch );
 *
 *          rcv.addOSCListener( new OSCListener() {
 *              public void messageReceived( OSCMessage msg, SocketAddress sender, long time )
 *              {
 *                  if( msg.getName().equals( "status.reply" )) {
 *                      System.out.println( "scsynth is running. contains " +
 *                          msg.getArg( 1 ) + " unit generators, " +
 *                          msg.getArg( 2 ) + " synths, " +
 *                          msg.getArg( 3 ) + " groups, " +
 *                          msg.getArg( 4 ) + " synth defs.\n" +
 *                          "CPU load is " + msg.getArg( 5 ) + "% (average) / " +
 *                          msg.getArg( 6 ) + "% (peak)" );
 *                      synchronized( notify ) {
 *                          notify.notifyAll();
 *                      }
 *                  }
 *              }
 *          });
 *          rcv.startListening();
 *          trns.send( new OSCMessage( "/status", OSCMessage.NO_ARGS ), addr );
 *
 *          synchronized( notify ) {
 *              notify.wait( 5000 );
 *          }
 *      }
 *      catch( InterruptedException e1 ) {}
 *      catch( IOException e2 ) {
 *          System.err.println( e2.getLocalizedMessage() );
 *      }
 *      finally {
 *          if( rcv != null ) {
 *              rcv.dispose();
 *          } else if( dch != null ) {
 *              try {
 *                  dch.close();
 *              }
 *              catch( IOException e4 ) {};
 *          }
 *      }
 *	</pre>
 *	Note that the datagram channel needs to be bound to a valid reachable address,
 *	because <code>stopListening</code> will be sending a terminating message to
 *	this channel. You can bind the channel using <code>dch.socket().bind()</code>,
 *	as shown in the example above.
 *	<P>
 *	Note that someone has reported trouble with the <code>InetAddress.getLocalHost()</code> method
 *	on a machine that has no proper IP configuration or DNS problems. In such a case when
 *	you need to communicate only on this machine and not a network, use the loopback
 *	address &quot;127.0.0.1&quot; as the filtering address or bind the socket to the loop
 *	address manually before calling <code>new OSCReceiver()</code>.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.37, 12-May-09
 *
 *	@see				OSCClient
 *	@see				OSCServer
 *	@see				OSCTransmitter
 *
 *	@synchronization	starting and stopping and listener registration
 *						is thread safe. starting and stopping listening is thread safe
 *						but must not be carried out in the OSC receiver thread.
 *	@todo				an explicit disconnect method might be useful
 *						(this is implicitly done when calling dispose)
 */
public abstract class OSCReceiver
implements OSCChannel, Runnable
{
	private final List					collListeners   = new ArrayList();
	protected Thread					thread			= null;

//	private Map							map				= null;

	protected final Object				generalSync		= new Object();	// mutual exclusion startListening / stopListening
	protected final Object				threadSync		= new Object();	// communication with receiver thread

	protected boolean					isListening		= false;
	
	private final Object				bufSync			= new Object();	// buffer (re)allocation
	private int							bufSize			= DEFAULTBUFSIZE;
	protected ByteBuffer				byteBuf			= null;
	protected boolean					allocBuf		= true;

    private int							dumpMode		= kDumpOff;
	private PrintStream					printStream		= null;
	
	private OSCPacketCodec				c;
	private final String				protocol;

	protected final InetSocketAddress	localAddress;
	protected final boolean				revivable;

	protected SocketAddress				target			= null;

	protected OSCReceiver( OSCPacketCodec c, String protocol, InetSocketAddress localAddress, boolean revivable )
	{
		this.c				= c;
		this.protocol		= protocol;
		this.localAddress	= localAddress;
		this.revivable		= revivable;
	}

	/**
	 *	Creates a new instance of a revivable <code>OSCReceiver</code>, using
	 *	default codec and a specific transport protocol. It picks an arbitrary free port
	 *	and uses the local machine's IP. To determine the resulting
	 *	port, you can use <code>getLocalAddress</code> afterwards.
	 *	<P>
	 *	<B>TCP</B> receivers are required
	 *	to be connected to one particular target, so <code>setTarget</code> is
	 *	must be called prior to <code>connect</code> or <code>startListening</code>! 
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@see	OSCChannel#UDP
	 *	@see	OSCChannel#TCP
	 *	@see	#getLocalAddress
	 */
	public static OSCReceiver newUsing( String protocol )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol );
	}
	
	/**
	 *	Creates a new instance of a revivable <code>OSCReceiver</code>, using
	 *	a specific codec and transport protocol. It picks an arbitrary free port
	 *	and uses the local machine's IP. To determine the resulting
	 *	port, you can use <code>getLocalAddress</code> afterwards.
	 *	<P>
	 *	<B>TCP</B> receivers are required
	 *	to be connected to one particular target, so <code>setTarget</code> is
	 *	must be called prior to <code>connect</code> or <code>startListening</code>! 
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@see	OSCChannel#UDP
	 *	@see	OSCChannel#TCP
	 *	@see	#getLocalAddress
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCReceiver newUsing( OSCPacketCodec c, String protocol )
	throws IOException
	{
		return newUsing( c, protocol, 0 );
	}
	
	/**
	 *	Creates a new instance of a revivable <code>OSCReceiver</code>, using
	 *	default codec and a specific transport protocol and port. It
	 *	uses the local machine's IP. Note that the <code>port</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. If you want to filter
	 *	out a particular remote (or target) socket, this can be done
	 *	using the <code>setTarget</code> method!
	 *	<P>
	 *	<B>TCP</B> receivers are required
	 *	to be connected to one particular target, so <code>setTarget</code> is
	 *	must be called prior to <code>connect</code> or <code>startListening</code>! 
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCReceiver newUsing( String protocol, int port )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, 0 );
	}

	/**
	 *	Creates a new instance of a revivable <code>OSCReceiver</code>, using
	 *	a specific codec and transport protocol and port. It
	 *	uses the local machine's IP. Note that the <code>port</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. If you want to filter
	 *	out a particular remote (or target) socket, this can be done
	 *	using the <code>setTarget</code> method!
	 *	<P>
	 *	<B>TCP</B> receivers are required
	 *	to be connected to one particular target, so <code>setTarget</code> is
	 *	must be called prior to <code>connect</code> or <code>startListening</code>! 
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCReceiver newUsing( OSCPacketCodec c, String protocol, int port )
	throws IOException
	{
		return newUsing( c, protocol, 0, false );
	}

	/**
	 *	Creates a new instance of a revivable <code>OSCReceiver</code>, using
	 *	default codec and a specific transport protocol and port. It
	 *	uses the local machine's IP or the &quot;loopback&quot; address.
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. If you want to filter
	 *	out a particular remote (or target) socket, this can be done
	 *	using the <code>setTarget</code> method!
	 *	<P>
	 *	<B>TCP</B> receivers are required
	 *	to be connected to one particular target, so <code>setTarget</code> is
	 *	must be called prior to <code>connect</code> or <code>startListening</code>! 
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@param	loopBack	if <code>true</code>, the &quot;loopback&quot; address (<code>&quot;127.0.0.1&quot;</code>)
	 *						is used which limits communication to the local machine. If <code>false</code>, the
	 *						special IP <code>"0.0.0.0"</code> is used which means messages from any IP as well as from
	 *						the loopback are accepted
	 *	
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCReceiver newUsing( String protocol, int port, boolean loopBack )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, port, loopBack );
	}

	/**
	 *	Creates a new instance of a revivable <code>OSCReceiver</code>, using
	 *	a specific codec and transport protocol and port. It
	 *	uses the local machine's IP or the &quot;loopback&quot; address.
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. If you want to filter
	 *	out a particular remote (or target) socket, this can be done
	 *	using the <code>setTarget</code> method!
	 *	<P>
	 *	<B>TCP</B> receivers are required
	 *	to be connected to one particular target, so <code>setTarget</code> is
	 *	must be called prior to <code>connect</code> or <code>startListening</code>! 
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@param	loopBack	if <code>true</code>, the &quot;loopback&quot; address (<code>&quot;127.0.0.1&quot;</code>)
	 *						is used which limits communication to the local machine. If <code>false</code>, the
	 *						special IP <code>"0.0.0.0"</code> is used which means messages from any IP as well as from
	 *						the loopback are accepted
	 *	
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCReceiver newUsing( OSCPacketCodec c, String protocol, int port, boolean loopBack )
	throws IOException
	{
//		final InetSocketAddress localAddress = loopBack ? new InetSocketAddress( "127.0.0.1", port ) :
//			  new InetSocketAddress( InetAddress.getLocalHost(), port );
		final InetSocketAddress localAddress = new InetSocketAddress( loopBack ? "127.0.0.1" : "0.0.0.0", port );
		return newUsing( c, protocol, localAddress );
	}

	/**
	 *	Creates a new instance of a revivable <code>OSCReceiver</code>, using
	 *	default codec and a specific transport protocol and local socket address.
	 *	Note that <code>localAdress</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. If you want to filter
	 *	out a particular remote (or target) socket, this can be done
	 *	using the <code>setTarget</code> method!
	 *	<P>
	 *	<B>TCP</B> receivers are required
	 *	to be connected to one particular target, so <code>setTarget</code> is
	 *	must be called prior to <code>connect</code> or <code>startListening</code>! 
	 *
	 *	@param	protocol		the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	localAddress	a valid address to use for the OSC socket. If the port is <code>0</code>,
	 *							an arbitrary free port is picked when the receiver is started. (you can find out
	 *							the actual port in this case by calling <code>getLocalAddress()</code> after the
	 *							receiver was started).
	 *	
	 *	@return					the newly created receiver
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCReceiver newUsing( String protocol, InetSocketAddress localAddress )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, localAddress );
	}

	/**
	 *	Creates a new instance of a revivable <code>OSCReceiver</code>, using
	 *	a specific codec and transport protocol and local socket address.
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. If you want to filter
	 *	out a particular remote (or target) socket, this can be done
	 *	using the <code>setTarget</code> method!
	 *	<P>
	 *	<B>TCP</B> receivers are required
	 *	to be connected to one particular target, so <code>setTarget</code> is
	 *	must be called prior to <code>connect</code> or <code>startListening</code>! 
	 *
	 *	@param	c				the codec to use
	 *	@param	protocol		the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	localAddress	a valid address to use for the OSC socket. If the port is <code>0</code>,
	 *							an arbitrary free port is picked when the receiver is started. (you can find out
	 *							the actual port in this case by calling <code>getLocalAddress()</code> after the
	 *							receiver was started).
	 *	
	 *	@return					the newly created receiver
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCReceiver newUsing( OSCPacketCodec c, String protocol, InetSocketAddress localAddress )
	throws IOException
	{
		if( protocol.equals( UDP )) {
			return new UDPOSCReceiver( c, localAddress );
			
		} else if( protocol.equals( TCP )) {
			return new TCPOSCReceiver( c, localAddress );
			
		} else {
			throw new IllegalArgumentException( NetUtil.getResourceString( "errUnknownProtocol" ) + protocol );
		}
	}

	/**
	 *	Creates a new instance of a non-revivable <code>OSCReceiver</code>, using
	 *	default codec and UDP transport on a given channel. The caller should ensure that
	 *	the provided channel's socket was bound to a valid address
	 *	(using <code>dch.socket().bind( SocketAddress )</code>).
	 *	Note that <code>dch</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. If you want to filter
	 *	out a particular remote (or target) socket, this can be done
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	dch			the <code>DatagramChannel</code> to use as UDP socket.
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException	if a networking error occurs while configuring the socket
	 */
	public static OSCReceiver newUsing( DatagramChannel dch )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), dch );
	}

	/**
	 *	Creates a new instance of a non-revivable <code>OSCReceiver</code>, using
	 *	a specific codec and UDP transport on a given channel. The caller should ensure that
	 *	the provided channel's socket was bound to a valid address
	 *	(using <code>dch.socket().bind( SocketAddress )</code>).
	 *	Note that <code>dch</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. If you want to filter
	 *	out a particular remote (or target) socket, this can be done
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	c			the codec to use
	 *	@param	dch			the <code>DatagramChannel</code> to use as UDP socket.
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException	if a networking error occurs while configuring the socket
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCReceiver newUsing( OSCPacketCodec c, DatagramChannel dch )
	throws IOException
	{
		return new UDPOSCReceiver( c, dch );
	}

	/**
	 *	Creates a new instance of a non-revivable <code>OSCReceiver</code>, using
	 *	default codec and TCP transport on a given channel. The caller should ensure that
	 *	the provided channel's socket was bound to a valid address
	 *	(using <code>sch.socket().bind( SocketAddress )</code>). Furthermore,
	 *	the channel must be connected (using <code>connect()</code>) before
	 *	being able to receive messages. Note that <code>sch</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. The remote (or target)
	 *	socket must be explicitly specified using <code>setTarget</code> before
	 *	trying to connect!
	 *
	 *	@param	sch			the <code>SocketChannel</code> to use as TCP socket.
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException	if a networking error occurs while configuring the socket
	 */
	public static OSCReceiver newUsing( SocketChannel sch )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), sch );
	}

	/**
	 *	Creates a new instance of a non-revivable <code>OSCReceiver</code>, using
	 *	a specific codec and TCP transport on a given channel. The caller should ensure that
	 *	the provided channel's socket was bound to a valid address
	 *	(using <code>sch.socket().bind( SocketAddress )</code>). Furthermore,
	 *	the channel must be connected (using <code>connect()</code>) before
	 *	being able to receive messages. Note that <code>sch</code> specifies the
	 *	local socket (at which the receiver listens), it does not determine the
	 *	remote sockets from which messages can be received. The remote (or target)
	 *	socket must be explicitly specified using <code>setTarget</code> before
	 *	trying to connect!
	 *
	 *	@param	c			the codec to use
	 *	@param	sch			the <code>SocketChannel</code> to use as TCP socket.
	 *	@return				the newly created receiver
	 *
	 *	@throws	IOException	if a networking error occurs while configuring the socket
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCReceiver newUsing( OSCPacketCodec c, SocketChannel sch )
	throws IOException
	{
		return new TCPOSCReceiver( c, sch );
	}

	public String getProtocol()
	{
		return protocol;
	}

	/**
	 *	Queries the receiver's local socket address.
	 *	You can determine the host and port from the returned address
	 *	by calling <code>getHostName()</code> (or for the IP <code>getAddress().getHostAddress()</code>)
	 *	and <code>getPort()</code>. This port number may be <code>0</code>
	 *	if the receiver was called with an unspecified port and has not yet been
	 *	started. In this case, to determine the port actually used, call this
	 *	method after the receiver has been started.
	 *	<p>
	 *	Note that if the receiver is bound to the accept-any IP <code>"0.0.0.0"</code>,
	 *	which happens for example when calling <code>newUsing( &lt;protocol&gt;, 0, false )</code>,
	 *	the returned IP will be the localhost's IP, so you can
	 *	patch the result directly into any <code>setTarget</code> call.
	 *	
	 *	@return				the address of the receiver's local socket.
	 *	@throws	IOException	if the local host could not be resolved
	 *
	 *	@see	java.net.InetSocketAddress#getHostName()
	 *	@see	java.net.InetSocketAddress#getAddress()
	 *	@see	java.net.InetSocketAddress#getPort()
	 *
	 */
	public abstract InetSocketAddress getLocalAddress() throws IOException;

	public abstract void setTarget( SocketAddress target );
	
	public void setCodec( OSCPacketCodec c )
	{
		this.c = c;
	}
	
	public OSCPacketCodec getCodec()
	{
		return c;
	}

	/**
	 *  Registers a listener that gets informed
	 *  about incoming messages. You can call this
	 *  both when listening was started and stopped.
	 *
	 *  @param  listener	the listener to register
	 */
	public void addOSCListener( OSCListener listener )
	{
		synchronized( collListeners ) {
//			if( collListeners.contains( listener )) return;
			collListeners.add( listener );
		}
	}

	/**
	 *  Unregisters a listener that gets informed
	 *  about incoming messages
	 *
	 *  @param  listener	the listener to remove from
	 *						the list of notified objects.
	 */
	public void removeOSCListener( OSCListener listener )
	{
		synchronized( collListeners ) {
			collListeners.remove( listener );
		}
	}

	/**
	 *  Starts to wait for incoming messages.
	 *	See the class constructor description to learn how
	 *	connected and unconnected channels are handled.
	 *	You should never modify the
	 *	the channel's setup between the constructor and calling
	 *	<code>startListening</code>. This method will check
	 *	the connection status of the channel, using <code>isConnected</code>
	 *	and establish the connection if necessary. Therefore,
	 *	calling <code>connect</code> prior to <code>startListening</code>
	 *	is not necessary.
	 *	<p>
	 *	To find out at which port we are listening, call
	 *	<code>getLocalAddress().getPort()</code>.
	 *	<p>
	 *	If the <code>OSCReceiver</code> is already listening,
	 *	this method does nothing.
     *
     *  @throws IOException when an error occurs
     *          while establishing the channel connection.
     *          In that case, no thread has been started
     *          and hence stopListening() needn't be called
	 *
	 *	@throws	IllegalStateException	when trying to call this method from within the OSC receiver thread
	 *									(which would obviously cause a loop)
	 */
	public void startListening()
	throws IOException
	{
		synchronized( generalSync ) {
			if( Thread.currentThread() == thread ) throw new IllegalStateException( NetUtil.getResourceString( "errNotInThisThread" ));

			if( isListening && ((thread == null) || !thread.isAlive()) ) {
				isListening		= false;
			}
			if( !isListening ) {
				if( !isConnected() ) connect();
				isListening		= true;
				thread			= new Thread( this, "OSCReceiver" );
				thread.setDaemon( true );
				thread.start();
			}
		}
	}

	/**
	 *	Queries whether the <code>OSCReceiver</code> is
	 *	listening or not.
	 */
	public boolean isListening()
	{
        synchronized( generalSync ) {
			return isListening;
		}
	}
	
	/**
	 *  Stops waiting for incoming messages. This
	 *	method returns when the receiving thread has terminated.
     *  To prevent deadlocks, this method cancels after
     *  five seconds, calling <code>close()</code> on the datagram
	 *	channel, which causes the listening thread to die because
	 *	of a channel-closing exception.
     *
     *  @throws IOException if an error occurs while shutting down
	 *
	 *	@throws	IllegalStateException	when trying to call this method from within the OSC receiver thread
	 *									(which would obviously cause a loop)
	 */
	public void stopListening()
	throws IOException
	{
        synchronized( generalSync ) {
			if( Thread.currentThread() == thread ) throw new IllegalStateException( NetUtil.getResourceString( "errNotInThisThread" ));

			if( isListening ) {
				isListening = false;
				if( (thread != null) && thread.isAlive() ) {
					try {
						synchronized( threadSync ) {
							sendGuardSignal();
//							guard.send( guardPacket );
							threadSync.wait( 5000 );
						}
					}
					catch( InterruptedException e2 ) {
						e2.printStackTrace();
					}
//					catch( IOException e1 ) {
//						System.err.println( "OSCReceiver.stopListening : "+e1 );
//						throw e1;
//					}
					finally {
						if( (thread != null) && thread.isAlive() ) {
							try {
								System.err.println( "OSCReceiver.stopListening : rude task killing (" + this.hashCode() + ")" );
//								ch.close();     // rude task killing
								closeChannel();
							}
							catch( IOException e3 ) {
								e3.printStackTrace();
//								System.err.println( "OSCReceiver.stopListening 2: "+e3 );
							}
						}
						thread = null;
					}
				}
			}
		}
	}

	public void setBufferSize( int size )
	{
		synchronized( bufSync ) {
			if( isListening ) throw new IllegalStateException( NetUtil.getResourceString( "errNotWhileActive" ));
			if( bufSize != size ) {
				bufSize		= size;
				allocBuf	= true;
			}
		}
	}

	public int getBufferSize()
	{
		synchronized( bufSync ) {
			return bufSize;
		}
	}

	public void dumpOSC( int mode, PrintStream stream )
	{
		this.dumpMode		= mode;
		this.printStream	= stream == null ? System.err : stream;
	}

	public void dispose()
	{
		try {
			stopListening();
		}
		catch( IOException e1 ) {
			e1.printStackTrace();
		}
		try {
//			ch.close();
			closeChannel();
		}
		catch( IOException e1 ) {
			e1.printStackTrace();
		}
		collListeners.clear();
		byteBuf	= null;
	}
	
//   /**
//     *  Call this method to supply a map of custom
//     *  OSCMessage subclasses used for decoding received
//     *  messages.
//     *
//     *  @param  map a map whose keys are OSC command strings and whose
//     *              values are <code>OSCMessage</code> subclasses which will
//     *              be used for decoding in case the OSC command
//     *              matches the map entry. For instance you might
//     *              want to have a key <code>"/b_setn"</code> and a special subclass
//     *              <code>OSCBufSetNMessage</code> for faster and efficient decoding
//     *              of this type of OSC message.
//	 *
//	 *	@deprecated	a future version will feature special codec classes which are
//	 *				not subclasses of <code>OSCMessage</code>! Prepare for API change!
//     */
//    public void setCustomMessageDecoders( Map map )
//    {
//        this.map = map;
//    }

	protected abstract void sendGuardSignal() throws IOException;
	
	protected abstract void setChannel( SelectableChannel ch ) throws IOException;

	protected abstract void closeChannel() throws IOException;

	protected static String debugTimeString()
	{
		return new java.text.SimpleDateFormat( "HH:mm:ss.SSS" ).format( new java.util.Date() );
	}

	protected void flipDecodeDispatch( SocketAddress sender )
	throws IOException
	{
		final OSCPacket p;

		try {
			byteBuf.flip();
//			p = OSCPacket.decode( byteBuf, map );
//			p = OSCPacket.decode( byteBuf );
			p = c.decode( byteBuf );
			
			if( dumpMode != kDumpOff ) {
				printStream.print( "r: " );
				if( (dumpMode & kDumpText) != 0 ) OSCPacket.printTextOn( printStream, p );
				if( (dumpMode & kDumpHex)  != 0 ) {
					byteBuf.flip();
					OSCPacket.printHexOn( printStream, byteBuf );
				}
			}
			dispatchPacket( p, sender, OSCBundle.NOW );	// OSCBundles will override this dummy time tag
		}
		catch( BufferUnderflowException e1 ) {
			if( isListening ) {
				System.err.println( new OSCException( OSCException.RECEIVE, e1.toString() ));
			}
		}
	}

	private void dispatchPacket( OSCPacket p, SocketAddress sender, long time )
	{
		if( p instanceof OSCMessage ) {
			dispatchMessage( (OSCMessage) p, sender, time );
		} else if( p instanceof OSCBundle ) {
			final OSCBundle bndl	= (OSCBundle) p;
			time					= bndl.getTimeTag();
			for( int i = 0; i < bndl.getPacketCount(); i++ ) {
				dispatchPacket( bndl.getPacket( i ), sender, time );
			}
		} else {
			assert false : p.getClass().getName();
		}
	}

	private void dispatchMessage( OSCMessage msg, SocketAddress sender, long time )
	{
		OSCListener listener;

		synchronized( collListeners ) {
			for( int i = 0; i < collListeners.size(); i++ ) {
				listener = (OSCListener) collListeners.get( i );
//				try {
					listener.messageReceived( msg, sender, time );
//				}
//				catch( java.lang.RuntimeException e1 ) {
//					e1.printStackTrace();
//				}
			}
		}
	}
	
	protected void checkBuffer()
	{
		synchronized( bufSync ) {
			if( allocBuf ) {
				byteBuf	= ByteBuffer.allocateDirect( bufSize );
				allocBuf = false;
			}
		}
	}

	protected InetSocketAddress getLocalAddress( InetAddress addr, int port )
	throws UnknownHostException
	{
		return new InetSocketAddress( addr.getHostName().equals( "0.0.0.0" ) ? InetAddress.getLocalHost() : addr, port );
	}

	/**
	 *	Establishes connection for transports requiring
	 *	connectivity (e.g. TCP). For transports that do not require connectivity (e.g. UDP),
	 *	this ensures the communication channel is created and bound.
	 *  <P>
	 *  Having a connected channel without actually listening to incoming messages
	 *  is usually not making sense. You can call <code>startListening</code> without
	 *  explicit prior call to <code>connect</code>, because <code>startListening</code>
	 *  will establish the connection if necessary.
	 *  <P>
	 *	When a <B>UDP</B> transmitter
	 *	is created without an explicit <code>DatagramChannel</code> &ndash; say by
	 *	calling <code>OSCReceiver.newUsing( &quot;udp&quot; )</code>, calling
	 *	<code>connect()</code> will actually create and bind a <code>DatagramChannel</code>.
	 *	For a <B>UDP</B> receiver which was created with an explicit
	 *	<code>DatagramChannel</code>. However, for <B>TCP</B> receivers, 
	 *	this may throw an <code>IOException</code> if the receiver
	 *	was already connected, therefore be sure to check <code>isConnected()</code> before.
	 *	
	 *	@throws	IOException	if a networking error occurs. Possible reasons: - the underlying
	 *						network channel had been closed by the server. - the transport
	 *						is TCP and the server is not available.
	 *
	 *	@see	#isConnected()
	 *	@see	#startListening()
	 *	@throws IOException
	 */
	public abstract void connect() throws IOException;
	
	/**
	 *	Queries the connection state of the receiver.
	 *
	 *	@return	<code>true</code> if the receiver is connected, <code>false</code> otherwise. For transports that do not use
	 *			connectivity (e.g. UDP) this returns <code>false</code>, if the
	 *			underlying <code>DatagramChannel</code> has not yet been created.
	 *
	 *	@see	#connect()
	 */
	public abstract boolean isConnected();

	// --------------------- internal classes ---------------------

	private static class UDPOSCReceiver
	extends OSCReceiver
	{
		private DatagramChannel	dch;
	
		protected UDPOSCReceiver( OSCPacketCodec c, InetSocketAddress localAddress )
		throws IOException
		{
			super( c, UDP, localAddress, true );
		}
		
		protected UDPOSCReceiver( OSCPacketCodec c, DatagramChannel dch )
		throws IOException
		{
			super( c, UDP, new InetSocketAddress( dch.socket().getLocalAddress(), dch.socket().getLocalPort() ), false );
			
			this.dch	= dch;
		}
		
		protected void setChannel( SelectableChannel ch )
		throws IOException
		{
			synchronized( generalSync ) {
				if( isListening ) throw new IllegalStateException( NetUtil.getResourceString( "errNotWhileActive" ));
		
				dch	= (DatagramChannel) ch;
				if( !dch.isBlocking() ) {
					dch.configureBlocking( true );
				}
				if( dch.isConnected() ) throw new IllegalStateException( NetUtil.getResourceString( "errChannelConnected" ));
			}
		}
		
		public InetSocketAddress getLocalAddress()
		throws IOException
		{
			synchronized( generalSync ) {
				if( dch != null ) {
					final DatagramSocket ds = dch.socket();
					return getLocalAddress( ds.getLocalAddress(), ds.getLocalPort() );
				} else {
					return getLocalAddress( localAddress.getAddress(), localAddress.getPort() );
				}
			}
		}

		public void setTarget( SocketAddress target )
		{
			this.target	= target;
		}
		
		public void connect()
		throws IOException
		{
			synchronized( generalSync ) {
				if( isListening ) throw new IllegalStateException( NetUtil.getResourceString( "errNotWhileActive" ));

				if( (dch != null) && !dch.isOpen() ) {
					if( !revivable ) throw new IOException( NetUtil.getResourceString( "errCannotRevive" ));
					dch = null;
				}
				if( dch == null ) {
					final DatagramChannel newCh = DatagramChannel.open();
					newCh.socket().bind( localAddress );
//					dch = newCh;
					setChannel( newCh );
				}
			}
		}

		public boolean isConnected()
		{
			synchronized( generalSync ) {
				return( (dch != null) && dch.isOpen() );
			}
		}

		protected void closeChannel()
		throws IOException
		{
			if( dch != null ) {
				try {
					dch.close();
				}
				finally {
					dch = null;
				}
			}
		}

		/**
		 *	This is the body of the listening thread
		 */
		public void run()
		{
			SocketAddress sender;
		
			checkBuffer();

			try {
listen:			while( isListening )
				{
					try {
						byteBuf.clear();
						sender = dch.receive( byteBuf );

						if( !isListening ) break listen;
						if( sender == null ) continue listen;
						if( (target != null) && !target.equals( sender )) continue listen;
						
						flipDecodeDispatch( sender );
					}
					catch( ClosedChannelException e1 ) {	// bye bye, we have to quit
						if( isListening ) {
//							System.err.println( e1 );
							System.err.println( "OSCReceiver.run : " + e1.getClass().getName() + " : " + e1.getLocalizedMessage() );
						}
						return;
					}
					catch( IOException e1 ) {
						if( isListening ) {
							System.err.println( "OSCReceiver.run : " + e1.getClass().getName() + " : " + e1.getLocalizedMessage() );
//							System.err.println( new OSCException( OSCException.RECEIVE, e1.toString() ));
						}
					}
				} // while( isListening )
			}
			finally {
				synchronized( threadSync ) {
					thread = null;
					threadSync.notifyAll();   // stopListening() might be waiting
				}
			}
		}
		
		protected void sendGuardSignal()
		throws IOException
		{
			final DatagramSocket	guard;
			final DatagramPacket	guardPacket;
			
			guard		= new DatagramSocket();
			guardPacket	= new DatagramPacket( new byte[0], 0 );
			guardPacket.setSocketAddress( getLocalAddress() );
			guard.send( guardPacket );
			guard.close();
		}
	}

	private static class TCPOSCReceiver
	extends OSCReceiver
	{
		private SocketChannel	sch		= null;
	
		protected TCPOSCReceiver( OSCPacketCodec c, InetSocketAddress localAddress )
		{
			super( c, TCP, localAddress, true );
		}
		
		protected TCPOSCReceiver( OSCPacketCodec c, SocketChannel sch )
		{
			super( c, TCP, new InetSocketAddress( sch.socket().getLocalAddress(), sch.socket().getLocalPort() ), false );
			
			this.sch	= sch;
		}

		protected void setChannel( SelectableChannel ch )
		throws IOException
		{
			synchronized( generalSync ) {
				if( isListening ) throw new IllegalStateException( NetUtil.getResourceString( "errNotWhileActive" ));
		
				sch	= (SocketChannel) ch;
				if( !sch.isBlocking() ) {
					sch.configureBlocking( true );
				}
			}
		}

		public InetSocketAddress getLocalAddress()
		throws IOException
		{
			synchronized( generalSync ) {
				if( sch != null ) {
					final Socket s = sch.socket();
					return getLocalAddress( s.getLocalAddress(), s.getLocalPort() );
				} else {
					return getLocalAddress( localAddress.getAddress(), localAddress.getPort() );
				}
			}
		}

		public void setTarget( SocketAddress target )
		{
			synchronized( generalSync ) {
				if( isConnected() ) throw new AlreadyConnectedException();
		
				this.target	= target;
			}
		}

		public void connect()
		throws IOException
		{
			synchronized( generalSync ) {
				if( isListening ) throw new IllegalStateException( NetUtil.getResourceString( "errNotWhileActive" ));

				if( (sch != null) && !sch.isOpen() ) {
					if( !revivable ) throw new IOException( NetUtil.getResourceString( "errCannotRevive" ));
					sch = null;
				}
				if( sch == null ) {
					final SocketChannel newCh = SocketChannel.open();
					newCh.socket().bind( localAddress );
					sch = newCh;
				}
				if( !sch.isConnected() ) {
					sch.connect( target );
				}
			}
		}

		public boolean isConnected()
		{
			synchronized( generalSync ) {
				return( (sch != null) && sch.isConnected() );
			}
		}

		protected void closeChannel()
		throws IOException
		{
			if( sch != null ) {
				try {
//System.err.println( "TCPOSCReceiver.closeChannel()" );
					sch.close();
//System.err.println( "...ok" );
				}
				finally {
					sch = null;
				}
			}
		}

		public void run()
		{
			final SocketAddress sender = sch.socket().getRemoteSocketAddress();
			int					len, packetSize;
			
			checkBuffer();
			
			try {
listen:			while( isListening ) {
					try {
						byteBuf.rewind().limit( 4 );	// in TCP mode, first four bytes are packet size in bytes
						do {
							len = sch.read( byteBuf );
							if( len == -1 ) break listen;
						} while( byteBuf.hasRemaining() );
						
						byteBuf.rewind();
						packetSize = byteBuf.getInt();
						byteBuf.rewind().limit( packetSize );
						
						while( byteBuf.hasRemaining() ) {
							len = sch.read( byteBuf );
							if( len == -1 ) break listen;
						}
						
						flipDecodeDispatch( sender );
//						flipDecodeDispatch( target );
					}
					catch( IllegalArgumentException e1 ) {	// thrown on illegal byteBuf.limit() calls
						if( isListening ) {
//							System.err.println( new OSCException( OSCException.RECEIVE, e1.toString() ));
							final OSCException e2 = new OSCException( OSCException.RECEIVE, e1.toString() );
							System.err.println( "OSCReceiver.run : " + e2.getClass().getName() + " : " + e2.getLocalizedMessage() );
						}
					}
					catch( ClosedChannelException e1 ) {	// bye bye, we have to quit
						if( isListening ) {
							System.err.println( "OSCReceiver.run : " + e1.getClass().getName() + " : " + e1.getLocalizedMessage() );
						}
						return;
					}
					catch( IOException e1 ) {
						if( isListening ) {
							System.err.println( "OSCReceiver.run : " + e1.getClass().getName() + " : " + e1.getLocalizedMessage() );
//							System.err.println( new OSCException( OSCException.RECEIVE, e1.toString() ));
						}
					}
				}
			}
			finally {
				synchronized( threadSync ) {
					thread = null;
					threadSync.notifyAll();   // stopListening() might be waiting
				}
			}
		}

		/**
		 *	@warning	this calls socket().shutdownInput()
		 *				to unblock the listening thread. unfortunately this
		 *				cannot be undone, so it's not possible to revive the
		 *				receiver in TCP mode ;-( have to check for alternative ways
		 */
		protected void sendGuardSignal()
		throws IOException
		{
			sch.socket().shutdownInput();
		}
	}
}