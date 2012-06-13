/*
 *  OSCClient.java
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
 *		17-Sep-06	created
 *		14-Oct-06	using revivable channels
 *		02-Jul-07	added codec based factory methods
 */

package de.sciss.net;

import java.io.IOException;
import java.io.PrintStream;
import java.net.InetSocketAddress;
import java.net.SocketAddress;

/**
 *	This class groups together a transmitter and receiver, allowing bidirectional
 *	OSC communication from the perspective of a client. It simplifies the
 *	need to use several objects by uniting their functionality.
 *	</P><P>
 *	In the following example, a client for UDP to SuperCollider server (scsynth)
 *	on the local machine is created. The client starts a synth by sending
 *	a <code>/s_new</code> message, and stops the synth by sending a delayed
 *	a <code>/n_set</code> message. It waits for the synth to die which is recognized
 *	by an incoming <code>/n_end</code> message from scsynth after we've registered
 *	using a <code>/notify</code> command.
 *
 *	<pre>
    final Object        sync = new Object();
    final OSCClient     c;
    final OSCBundle     bndl1, bndl2;
    final Integer       nodeID;
    
    try {
        c = OSCClient.newUsing( OSCClient.UDP );    // create UDP client with any free port number
        c.setTarget( new InetSocketAddress( "127.0.0.1", 57110 ));  // talk to scsynth on the same machine
        c.start();  // open channel and (in the case of TCP) connect, then start listening for replies
    }
    catch( IOException e1 ) {
        e1.printStackTrace();
        return;
    }
    
    // register a listener for incoming osc messages
    c.addOSCListener( new OSCListener() {
        public void messageReceived( OSCMessage m, SocketAddress addr, long time )
        {
            // if we get the /n_end message, wake up the main thread
            // ; note: we should better also check for the node ID to make sure
            // the message corresponds to our synth
            if( m.getName().equals( "/n_end" )) {
                synchronized( sync ) {
                    sync.notifyAll();
                }
            }
        }
    });
    // let's see what's going out and coming in
    c.dumpOSC( OSCChannel.kDumpBoth, System.err );
    
    try {
        // the /notify message tells scsynth to send info messages back to us
        c.send( new OSCMessage( "/notify", new Object[] { new Integer( 1 )}));
        // two bundles, one immediately (with 50ms delay), the other in 1.5 seconds
        bndl1   = new OSCBundle( System.currentTimeMillis() + 50 );
        bndl2   = new OSCBundle( System.currentTimeMillis() + 1550 );
        // this is going to be the node ID of our synth
        nodeID  = new Integer( 1001 + i );
        // this next messages creates the synth
        bndl1.addPacket( new OSCMessage( "/s_new", new Object[] { "default", nodeID, new Integer( 1 ), new Integer( 0 )}));
        // this next messages starts to releases the synth in 1.5 seconds (release time is 2 seconds)
        bndl2.addPacket( new OSCMessage( "/n_set", new Object[] { nodeID, "gate", new Float( -(2f + 1f) )}));
        // send both bundles (scsynth handles their respective timetags)
        c.send( bndl1 );
        c.send( bndl2 );

        // now wait for the signal from our osc listener (or timeout in 10 seconds)
        synchronized( sync ) {
            sync.wait( 10000 );
        }
        catch( InterruptedException e1 ) {}
        
        // ok, unsubscribe getting info messages
        c.send( new OSCMessage( "/notify", new Object[] { new Integer( 0 )}));

        // ok, stop the client
        // ; this isn't really necessary as we call dispose soon
        c.stop();
    }
    catch( IOException e11 ) {
        e11.printStackTrace();
    }
    
    // dispose the client (it gets stopped if still running)
    c.dispose();
 *	</pre>
 *
 *	@see		OSCTransmitter
 *	@see		OSCReceiver
 *	@see		OSCServer
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.37, 12-May-09
 *
 *	@since		NetUtil 0.30
 */
public class OSCClient
implements OSCBidi
{
	private final OSCReceiver			rcv;
	private final OSCTransmitter		trns;
	private int							bufSize			= DEFAULTBUFSIZE;
	private final String				protocol;
	
	private OSCClient( OSCReceiver rcv, OSCTransmitter trns, String protocol )
	{
		this.rcv		= rcv;
		this.trns		= trns;
		this.protocol	= protocol;
	}

	/**
	 *	Creates a new instance of an <code>OSCClient</code>, using
	 *	default codec and a specific transport protocol. It picks an arbitrary free port
	 *	and uses the local machine's IP. To determine the resulting
	 *	port, you can use <code>getLocalAddress</code> afterwards.
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created client
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@see	OSCChannel#UDP
	 *	@see	OSCChannel#TCP
	 *	@see	#getLocalAddress
	 */
	public static OSCClient newUsing( String protocol )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol );
	}
	
	/**
	 *	Creates a new instance of an <code>OSCClient</code>, using
	 *	a specific codec and transport protocol. It picks an arbitrary free port
	 *	and uses the local machine's IP. To determine the resulting
	 *	port, you can use <code>getLocalAddress</code> afterwards.
	 * 
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created client
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
	public static OSCClient newUsing( OSCPacketCodec c, String protocol )
	throws IOException
	{
		return newUsing( c, protocol, 0 );
	}
	
	/**
	 *	Creates a new instance of an <code>OSCClient</code>, using
	 *	default codec and a specific transport protocol and port. It
	 *	uses the local machine's IP.
	 *	<p>
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the client listens and from which it sends),
	 *	it does not determine the remote sockets from which messages can be received
	 *	and to which messages are sent. The target socket can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@return				the newly created client
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCClient newUsing( String protocol, int port )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, port );
	}

	/**
	 *	Creates a new instance of an <code>OSCClient</code>, using
	 *	a specific codec and transport protocol and port. It
	 *	uses the local machine's IP.
	 *	<p>
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the client listens and from which it sends),
	 *	it does not determine the remote sockets from which messages can be received
	 *	and to which messages are sent. The target socket can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@return				the newly created client
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCClient newUsing( OSCPacketCodec c, String protocol, int port )
	throws IOException
	{
		return newUsing( c, protocol, port, false );
	}

	/**
	 *	Creates a new instance of an <code>OSCClient</code>, using
	 *	default codec and a specific transport protocol and port. It
	 *	uses the local machine's IP or the &quot;loopback&quot; address.
	 *	<p>
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the client listens and from which it sends),
	 *	it does not determine the remote sockets from which messages can be received
	 *	and to which messages are sent. The target socket can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@param	loopBack	if <code>true</code>, the &quot;loopback&quot; address (<code>&quot;127.0.0.1&quot;</code>)
	 *						is used which limits communication to the local machine. If <code>false</code>, the
	 *						special IP <code>"0.0.0.0"</code> is used which means messages from any IP as well as from
	 *						the loopback are accepted
	 *	
	 *	@return				the newly created client
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCClient newUsing( String protocol, int port, boolean loopBack )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, port, loopBack );
	}

	/**
	 *	Creates a new instance of an <code>OSCClient</code>, using
	 *	a specific codec and transport protocol and port. It
	 *	uses the local machine's IP or the &quot;loopback&quot; address.
	 *	<p>
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the client listens and from which it sends),
	 *	it does not determine the remote sockets from which messages can be received
	 *	and to which messages are sent. The target socket can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@param	loopBack	if <code>true</code>, the &quot;loopback&quot; address (<code>&quot;127.0.0.1&quot;</code>)
	 *						is used which limits communication to the local machine. If <code>false</code>, the
	 *						special IP <code>"0.0.0.0"</code> is used which means messages from any IP as well as from
	 *						the loopback are accepted
	 *	
	 *	@return				the newly created client
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCClient newUsing( OSCPacketCodec c, String protocol, int port, boolean loopBack )
	throws IOException
	{
		final OSCReceiver		rcv		= OSCReceiver.newUsing( c, protocol, port, loopBack );
		final OSCTransmitter	trns	= OSCTransmitter.newUsing( c, protocol, port, loopBack );

		return new OSCClient( rcv, trns, protocol );
	}

	/**
	 *	Creates a new instance of an <code>OSCClient</code>, using
	 *	default codec and a specific transport protocol and local socket address.
	 *	Note that <code>localAdress</code> specifies the
	 *	local socket (at which the receiver listens and from which the transmitter sends),
	 *  it does not determine the
	 *	remote sockets to which the client connects. To specify the remote socket,
	 *	use the <code>setTarget</code> method!
	 *	<P>
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created client
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.39
	 */
	public static OSCClient newUsing( String protocol, InetSocketAddress localAddress )
	throws IOException
	{
		final OSCReceiver		rcv		= OSCReceiver.newUsing( protocol, localAddress );
		final OSCTransmitter	trns	= OSCTransmitter.newUsing( protocol, localAddress );

		return new OSCClient( rcv, trns, protocol );
	}

	/**
	 *	Creates a new instance of an <code>OSCClient</code>, using
	 *	a given codec, a specific transport protocol and local socket address.
	 *	Note that <code>localAdress</code> specifies the
	 *	local socket (at which the receiver listens and from which the transmitter sends),
	 *  it does not determine the
	 *	remote sockets to which the client connects. To specify the remote socket,
	 *	use the <code>setTarget</code> method!
	 *	<P>
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created client
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.39
	 */
	public static OSCClient newUsing( OSCPacketCodec c, String protocol, InetSocketAddress localAddress )
	throws IOException
	{
		final OSCReceiver		rcv		= OSCReceiver.newUsing( c, protocol, localAddress );
		final OSCTransmitter	trns	= OSCTransmitter.newUsing( c, protocol, localAddress );

		return new OSCClient( rcv, trns, protocol );
	}

	public String getProtocol()
	{
		return protocol;
	}

	/**
	 *	Queries the client side socket address. This is the address
	 *	from which the client sends and at which it listens for replies.
	 *	You can determine the host and port from the returned address
	 *	by calling <code>getHostName()</code> (or for the IP <code>getAddress().getHostAddress()</code>)
	 *	and <code>getPort()</code>.
	 *	<p>
	 *	Note that if the client is bound to the accept-any IP <code>"0.0.0.0"</code>,
	 *	which happens for example when calling <code>newUsing( &lt;protocol&gt;, 0, false )</code>,
	 *	the returned IP will be the localhost's IP, so you can
	 *	patch the result directly into any <code>setTarget</code> call.
	 *	
	 *	@return				the address of the client's local socket.
	 *
	 *	@throws	IOException	if the local host could not be resolved
	 *
	 *	@see	java.net.InetSocketAddress#getHostName()
	 *	@see	java.net.InetSocketAddress#getAddress()
	 *	@see	java.net.InetSocketAddress#getPort()
	 *
	 *	@see	#getProtocol()
	 */
	public InetSocketAddress getLocalAddress()
	throws IOException
	{
		return rcv.getLocalAddress();
	}
	
	/**
	 *	Specifies the client's target address, that is the address of the server to talk to.
	 *	You should call this method only once and you must call it before starting the client
	 *	or sending messages.
	 *
	 *	@param	target	the address of the server. Usually you construct an appropriate <code>InetSocketAddress</code>
	 *
	 *	@see	InetSocketAddress
	 */
	public void setTarget( SocketAddress target )
	{
		rcv.setTarget( target );
		trns.setTarget( target );
	}
	
	public void setCodec( OSCPacketCodec c )
	{
		rcv.setCodec( c );
		trns.setCodec( c );
	}
	
	public OSCPacketCodec getCodec()
	{
		return rcv.getCodec();
	}
	
	/**
	 *	Initializes network channel (if necessary) and establishes connection for transports requiring
	 *	connectivity (e.g. TCP). Do not call this method when the client is already connected.
	 *	Note that <code>start</code> implicitly calls <code>connect</code> if necessary, so
	 *	usually you will not need to call <code>connect</code> yourself.
	 *	
	 *	@throws	IOException	if a networking error occurs. Possible reasons: - the underlying
	 *						network channel had been closed by the server. - the transport
	 *						is TCP and the server is not available. - the transport is TCP
	 *						and the client was stopped before (unable to revive).
	 *
	 *	@see	#isConnected()
	 *	@see	#start()
	 */
	public void connect()
	throws IOException
	{
		trns.connect();
	}

	/**
	 *	Queries the connection state of the client.
	 *
	 *	@return	<code>true</code> if the client is connected, <code>false</code> otherwise. For transports that do not use
	 *			connectivity (e.g. UDP) this returns <code>false</code>, if the
	 *			underlying <code>DatagramChannel</code> has not yet been created.
	 *
	 *	@see	#connect()
	 */
	public boolean isConnected()
	{
		return trns.isConnected();
	}
	
	/**
	 *	Sends an OSC packet (bundle or message) to the target
	 *	network address. Make sure that the client's target
	 *	has been specified before by calling <code>setTarget()</code>
	 *
	 *	@param	p		the packet to send
	 *
	 *	@throws	IOException				if a write error, OSC encoding error,
	 *									buffer overflow error or network error occurs,
	 *									for example if a TCP client was not connected before.
	 *	@throws	NullPointerException	for a UDP client if the target has not been specified
	 *
	 *	@see	#setTarget( SocketAddress )
	 */
	public void send( OSCPacket p )
	throws IOException
	{
		trns.send( p );
	}

	/**
	 *  Registers a listener that gets informed
	 *  about incoming messages. You can call this
	 *  both when the client is active or inactive.
	 *
	 *  @param  listener	the listener to register
	 */
	public void addOSCListener( OSCListener listener )
	{
		rcv.addOSCListener( listener );
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
		rcv.removeOSCListener( listener );
	}

	/**
	 *	Starts the client. This calls <code>connect</code> if the transport requires
	 *	connectivity (e.g. TCP) and the channel is not yet connected.
	 *	It then tells the underlying OSC receiver to start listening.
	 *	
	 *	@throws	IOException	if a networking error occurs. Possible reasons: - the underlying
	 *						network channel had been closed by the server. - the transport
	 *						is TCP and the server is not available. - the transport is TCP
	 *						and the client was stopped before (unable to revive).
	 *
	 *	@warning	in the current version, it is not possible to &quot;revive&quot;
	 *				clients after the server has closed the connection. Also it's not
	 *				possible to start a TCP client more than once. This might be
	 *				possible in a future version.
	 */
	public void start()
	throws IOException
	{
		if( !trns.isConnected() ) {
			trns.connect();
			rcv.setChannel( trns.getChannel() );
		}
		rcv.startListening();
	}
	
	/**
	 *	Queries whether the client was activated or not. A client is activated by
	 *	calling its <code>start()</code> method and deactivated by calling <code>stop()</code>.
	 *
	 *	@return	<code>true</code> if the client is active (connected and listening), <code>false</code> otherwise.
	 *
	 *	@see	#start()
	 *	@see	#stop()
	 */
	public boolean isActive()
	{
		return rcv.isListening();
	}

	public void stop()
	throws IOException
	{
		rcv.stopListening();
	}

	/**
	 *	Adjusts the buffer size for OSC messages (both for sending and receiving).
	 *	This is the maximum size an OSC packet (bundle or message) can grow to.
	 *	The initial buffer size is <code>DEFAULTBUFSIZE</code>. Do not call this
	 *	method while the client is active!
	 *
	 *	@param	size					the new size in bytes.
	 *
	 *	@throws	IllegalStateException	if trying to change the buffer size while the client is active
	 *									(listening).
	 *
	 *	@see	#isActive()
	 *	@see	#getBufferSize()
	 */
	public void setBufferSize( int size )
	{
		bufSize = size;
		rcv.setBufferSize( size );
		trns.setBufferSize( size );
	}
	
	/**
	 *	Queries the buffer size used for sending and receiving OSC messages.
	 *	This is the maximum size an OSC packet (bundle or message) can grow to.
	 *	The initial buffer size is <code>DEFAULTBUFSIZE</code>.
	 *
	 *	@return			the buffer size in bytes.
	 *
	 *	@see	#setBufferSize( int )
	 */
	public int getBufferSize()
	{
		return bufSize;
	}

	/**
	 *	Changes the way incoming and outgoing OSC messages are printed to the standard err console.
	 *	By default messages are not printed.
	 *
	 *  @param	mode	one of <code>kDumpOff</code> (don't dump, default),
	 *					<code>kDumpText</code> (dump human readable string),
	 *					<code>kDumpHex</code> (hexdump), or
	 *					<code>kDumpBoth</code> (both text and hex)
	 *	@param	stream	the stream to print on, or <code>null</code> which
	 *					is shorthand for <code>System.err</code>
	 *
	 *	@see	#dumpIncomingOSC( int, PrintStream )
	 *	@see	#dumpOutgoingOSC( int, PrintStream )
	 *	@see	#kDumpOff
	 *	@see	#kDumpText
	 *	@see	#kDumpHex
	 *	@see	#kDumpBoth
	 */
	public void dumpOSC( int mode, PrintStream stream )
	{
		dumpIncomingOSC( mode, stream );
		dumpOutgoingOSC( mode, stream );
	}

	public void dumpIncomingOSC( int mode, PrintStream stream )
	{
		rcv.dumpOSC( mode, stream );
	}

	public void dumpOutgoingOSC( int mode, PrintStream stream )
	{
		trns.dumpOSC( mode, stream );
	}

	/**
	 *	Destroys the client and frees resources associated with it.
	 *	This automatically stops the client and closes the networking channel.
	 *	Do not use this client instance any more after calling <code>dispose.</code>
	 */
	public void dispose()
	{
		rcv.dispose();
		trns.dispose();
	}
}