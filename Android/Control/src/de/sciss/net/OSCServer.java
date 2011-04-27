/*
 *  OSCServer.java
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
 *		18-Sep-06	created
 *		02-Jul-07	added codec based factory methods
 */

package de.sciss.net;

import java.io.IOException;
import java.io.PrintStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.SocketAddress;
import java.net.UnknownHostException;
import java.nio.channels.ClosedChannelException;
import java.nio.channels.NotYetConnectedException;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 *	This class dynamically groups together a transmitters and receivers, allowing bidirectional
 *	OSC communication from the perspective of a server. It simplifies the
 *	need to use several objects by uniting their functionality, and by automatically
 *	establishing child connections.
 *	<P>
 *	In <code>UDP</code> mode, simply one receiver and transmitter are handling all the
 *	communication. In <code>TCP</code> mode, a <code>ServerSocketChannel</code> is set up to
 *	wait for incoming connection requests. Requests are satisfied by opening a new receiver
 *	and transmitter for each connection.
 *	<P>
 *	In the following example, a simple TCP server is created that accepts connections at
 *	port 0x5454. The connections understand the OSC commands <code>/pause</code>
 *	(disconnect the server for a few seconds), <code>/quit</code> (quit the server),
 *	and <code>/dumpOSC</code> (turn on/off printing of message traffic). Each incoming
 *	message is replied with a <code>/done</code> message.
 *	<pre>
    private boolean pause = false; // (must be an instance or static field to be useable
                                   // from an anonymous inner class)
 
    final Object    sync = new Object();
    final OSCServer c;
    try {
        // create TCP server on loopback port 0x5454
        c = OSCServer.newUsing( OSCServer.TCP, 0x5454, true );
    }
    catch( IOException e1 ) {
        e1.printStackTrace();
        return;
    }
    
    // now add a listener for incoming messages from
    // any of the active connections
    c.addOSCListener( new OSCListener() {
        public void messageReceived( OSCMessage m, SocketAddress addr, long time )
        {
            // first of all, send a reply message (just a demo)
            try {
                c.send( new OSCMessage( "/done", new Object[] { m.getName() }), addr );
            }
            catch( IOException e1 ) {
                e1.printStackTrace();
            }
        
            if( m.getName().equals( "/pause" )) {
                // tell the main thread to pause the server,
                // wake up the main thread
                pause = true;
                synchronized( sync ) {
                    sync.notifyAll();
                }
            } else if( m.getName().equals( "/quit" )) {
                // wake up the main thread
                synchronized( sync ) {
                    sync.notifyAll();
                }
            } else if( m.getName().equals( "/dumpOSC" )) {
                // change dumping behaviour
                c.dumpOSC( ((Number) m.getArg( 0 )).intValue(), System.err );
            }
        }
    });
    try {
        do {
            if( pause ) {
                System.out.println( "  waiting four seconds..." );
                try {
                    Thread.sleep( 4000 );
                }
                catch( InterruptedException e1 ) {}
                pause = false;
            }
            System.out.println( "  start()" );
			// start the server (make it attentive for incoming connection requests)
            c.start();
            try {
                synchronized( sync ) {
                    sync.wait();
                }
            }
            catch( InterruptedException e1 ) {}

            System.out.println( "  stop()" );
            c.stop();
        } while( pause );
    }
    catch( IOException e1 ) {
        e1.printStackTrace();
    }
    
    // kill the server, free its resources
    c.dispose();
 *	</pre>
 *	Here is an example of sending commands to this server from SuperCollider:
 *	<pre>
    n = NetAddr( "127.0.0.1", 0x5454 );
    r = OSCresponderNode( n, '/done', { arg time, resp, msg;
        ("reply : " ++ msg.asString).postln;
    }).add;
    n.connect;
    n.sendMsg( '/dumpOSC', 3 );
    n.sendMsg( '/pause' );
    n.isConnected;	// --> false
    n.connect;
    n.sendMsg( '/quit' );
    r.remove;
 *	</pre>
 *
 *	@see		OSCClient
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.37, 12-May-09
 *
 *	@since		NetUtil 0.30
 *
 *	@todo	should provide means to accept or reject connections
 *	@todo	should provide means to close particular connections
 */
public abstract class OSCServer
implements OSCBidi
{
	protected OSCPacketCodec	defaultCodec;
	private final String		protocol;

	protected OSCServer( OSCPacketCodec c, String protocol )
	{
		defaultCodec	= c;
		this.protocol	= protocol;
	}

	/**
	 *	Creates a new instance of an <code>OSCServer</code>, using
	 *	default codec and a specific transport protocol. It picks an arbitrary free port
	 *	and uses the local machine's IP. To determine the resulting
	 *	port, you can use <code>getLocalAddress</code> afterwards.
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created server
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@see	OSCChannel#UDP
	 *	@see	OSCChannel#TCP
	 *	@see	#getLocalAddress
	 */
	public static OSCServer newUsing( String protocol )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol );
	}
	
	/**
	 *	Creates a new instance of an <code>OSCServer</code>, using
	 *	a specific codec and transport protocol. It picks an arbitrary free port
	 *	and uses the local machine's IP. To determine the resulting
	 *	port, you can use <code>getLocalAddress</code> afterwards.
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created server
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
	public static OSCServer newUsing( OSCPacketCodec c, String protocol )
	throws IOException
	{
		return newUsing( c, protocol, 0 );
	}

	/**
	 *	Creates a new instance of an <code>OSCServer</code>, using
	 *	default codec and a specific transport protocol and port. It
	 *	uses the local machine's IP.
	 *	<p>
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the server listens and from which it sends, or
	 *	in the case of TCP transport, from which it establishes client connections),
	 *	it does not determine the remote sockets. The address of a remote client
	 *	communicating to this server is passed in the <code>messageReceived</code>
	 *	method of any registered <code>OSCListener</code>, and must be picked
	 *	up and handed in to the <code>send</code> method to reply back to the client!
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@return				the newly created server
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCServer newUsing( String protocol, int port )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, port );
	}

	/**
	 *	Creates a new instance of an <code>OSCServer</code>, using
	 *	a specific codec and transport protocol and port. It
	 *	uses the local machine's IP.
	 *	<p>
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the server listens and from which it sends, or
	 *	in the case of TCP transport, from which it establishes client connections),
	 *	it does not determine the remote sockets. The address of a remote client
	 *	communicating to this server is passed in the <code>messageReceived</code>
	 *	method of any registered <code>OSCListener</code>, and must be picked
	 *	up and handed in to the <code>send</code> method to reply back to the client!
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@return				the newly created server
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCServer newUsing( OSCPacketCodec c, String protocol, int port )
	throws IOException
	{
		return newUsing( c, protocol, port, false );
	}

	/**
	 *	Creates a new instance of an <code>OSCServer</code>, using
	 *	default codec and a specific transport protocol and port. It
	 *	uses the local machine's IP or the &quot;loopback&quot; address.
	 *	<p>
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the server listens and from which it sends, or
	 *	in the case of TCP transport, from which it establishes client connections),
	 *	it does not determine the remote sockets. The address of a remote client
	 *	communicating to this server is passed in the <code>messageReceived</code>
	 *	method of any registered <code>OSCListener</code>, and must be picked
	 *	up and handed in to the <code>send</code> method to reply back to the client!
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@param	loopBack	if <code>true</code>, the &quot;loopback&quot; address (<code>&quot;127.0.0.1&quot;</code>)
	 *						is used which limits communication to the local machine. If <code>false</code>, the
	 *						special IP <code>"0.0.0.0"</code> is used which means messages from any IP as well as from
	 *						the loopback are accepted
	 *	
	 *	@return				the newly created server
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCServer newUsing( String protocol, int port, boolean loopBack )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, port, loopBack );
	}
		
	/**
	 *	Creates a new instance of an <code>OSCServer</code>, using
	 *	a specific codec and transport protocol and port. It
	 *	uses the local machine's IP or the &quot;loopback&quot; address.
	 *	<p>
	 *	Note that the <code>port</code> specifies the
	 *	local socket (at which the server listens and from which it sends, or
	 *	in the case of TCP transport, from which it establishes client connections),
	 *	it does not determine the remote sockets. The address of a remote client
	 *	communicating to this server is passed in the <code>messageReceived</code>
	 *	method of any registered <code>OSCListener</code>, and must be picked
	 *	up and handed in to the <code>send</code> method to reply back to the client!
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@param	loopBack	if <code>true</code>, the &quot;loopback&quot; address (<code>&quot;127.0.0.1&quot;</code>)
	 *						is used which limits communication to the local machine. If <code>false</code>, the
	 *						special IP <code>"0.0.0.0"</code> is used which means messages from any IP as well as from
	 *						the loopback are accepted
	 *	
	 *	@return				the newly created server
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCServer newUsing( OSCPacketCodec c, String protocol, int port, boolean loopBack )
	throws IOException
	{
//		final InetSocketAddress localAddress = loopBack ? new InetSocketAddress( "127.0.0.1", port ) :
//														  new InetSocketAddress( InetAddress.getLocalHost(), port );
		final InetSocketAddress localAddress = new InetSocketAddress( loopBack ? "127.0.0.1" : "0.0.0.0", port );
	
		if( protocol.equals( UDP )) {
			return new UDPOSCServer( c, localAddress );
			
		} else if( protocol.equals( TCP )) {
			return new TCPOSCServer( c, localAddress );
			
		} else {
			throw new IllegalArgumentException( NetUtil.getResourceString( "errUnknownProtocol" ) + protocol );
		}
	}

	public String getProtocol()
	{
		return protocol;
	}

	/**
	 *	Queries the server socket's address. This is the address
	 *	at which the server accepts connections (when using TCP)
	 *	or receives and sends messages (when using UDP).
	 *	You can determine the host and port from the returned address
	 *	by calling <code>getHostName()</code> (or for the IP <code>getAddress().getHostAddress()</code>)
	 *	and <code>getPort()</code>.
	 *	<p>
	 *	Note that if the server is bound to the accept-any IP <code>"0.0.0.0"</code>,
	 *	which happens for example when calling <code>newUsing( &lt;protocol&gt;, 0, false )</code>,
	 *	the returned IP will be the localhost's IP, so you can
	 *	patch the result directly into any <code>setTarget</code> call.
	 *	
	 *	@return				the address of the server's local socket.
	 *
	 *	@throws	IOException	if the local host could not be resolved
	 *
	 *	@see	java.net.InetSocketAddress#getHostName()
	 *	@see	java.net.InetSocketAddress#getAddress()
	 *	@see	java.net.InetSocketAddress#getPort()
	 *
	 *	@see	#getProtocol()
	 */
	public abstract InetSocketAddress getLocalAddress() throws IOException;

	/**
	 *	Sends an OSC packet (bundle or message) to the given
	 *	network address. The address should correspond to one of the connected
	 *	clients. Particularly, in <code>TCP</code> mode, trying to send
	 *	to a client which is not connected will throw an exception.
	 *	In a future version of NetUtil, there will be an interface
	 *	to detect clients connecting and disconnecting. For now,
	 *	clients can be implicitly detected by a registered <code>OSCListener</code>.
	 *
	 *	@param	p		the packet to send
	 *	@param	target	the target address to send the packet to
	 *
	 *	@throws	IOException	if a write error, OSC encoding error,
	 *						buffer overflow error or network error occurs,
	 *						if no client connection for the given address exists
	 */
	public abstract void send( OSCPacket p, SocketAddress target ) throws IOException;

	/**
	 *  Registers a listener that gets informed
	 *  about incoming messages (from any of the connected clients). You can call this
	 *  both when the server is active or inactive.
	 *
	 *  @param  listener	the listener to register
	 */
	public abstract void addOSCListener( OSCListener listener );

	/**
	 *  Unregisters a listener that gets informed
	 *  about incoming messages
	 *
	 *  @param  listener	the listener to remove from
	 *						the list of notified objects.
	 */
	public abstract void removeOSCListener( OSCListener listener );

	/**
	 *	Starts the server. The server becomes
	 *	attentive to requests for connections from clients,
	 *	starts to receive OSC messages and is able to reply
	 *	back to connected clients.
	 *
	 *	@throws	IOException	if a networking error occurs
	 */
	public abstract void start() throws IOException;

	/**
	 *	Checks whether the server is active (was started) or not (is stopped).
	 *
	 *	@return	<code>true</code> if the server is active, <code>false</code> otherwise
	 */
	public abstract boolean isActive();

	/**
	 *	Stops the server. For <code>TCP</code> mode, this implies
	 *	that all client connections are closed. Stops listening for
	 *	incoming OSC traffic.
	 *
	 *	@throws	IOException	if a networking error occurs
	 */
	public abstract void stop() throws IOException;
		
	public abstract void setBufferSize( int size );

	public abstract int getBufferSize();
	
	public void setCodec( OSCPacketCodec c )
	{
		defaultCodec = c;
	}
	
	public OSCPacketCodec getCodec()
	{
		return defaultCodec;
	}

	/**
	 *	Specifies which codec is used in packet coding and decoding
	 *	for a given client socket.
	 *
	 *	@param	c		the codec to use
	 *	@param	target	the client's address for whom the codec is changed
	 *	@throws	IOException	if a networking error occurs or the client does not exist
	 *
	 *	@since		NetUtil 0.33
	 */
	public abstract void setCodec( OSCPacketCodec c, SocketAddress target ) throws IOException;

	/**
	 *	Queries the codec used in packet coding and decoding
	 *	for a given client socket.
	 *
	 *	@param	target	the client's address for whom the codec is queried
	 *	@return	the current codec of this channel
	 *	@throws	IOException	if a networking error occurs or the client does not exist
	 *
	 *	@see	OSCPacketCodec#getDefaultCodec()
	 *
	 *	@since		NetUtil 0.33
	 */
	public abstract OSCPacketCodec getCodec( SocketAddress target ) throws IOException;

	public final void dumpOSC( int mode, PrintStream stream )
	{
		dumpIncomingOSC( mode, stream );
		dumpOutgoingOSC( mode, stream );
	}

	public abstract void dumpIncomingOSC( int mode, PrintStream stream );

	public abstract void dumpOutgoingOSC( int mode, PrintStream stream );

	/**
	 *	Destroys the server and frees resources associated with it.
	 *	This automatically stops the server and closes the networking channels.
	 *	Do not use this server instance any more after calling <code>dispose.</code>
	 */
	public abstract void dispose();

	protected InetSocketAddress getLocalAddress( InetAddress addr, int port )
	throws UnknownHostException
	{
		return new InetSocketAddress( addr.getHostName().equals( "0.0.0.0" ) ? InetAddress.getLocalHost() : addr, port );
	}

	private static class UDPOSCServer
	extends OSCServer
	{
//		private final Map				mapCodecs	= new HashMap();	// key = SocketAddress (remote), value = OSCPacketCodec

		private final OSCReceiver		rcv;
		private final OSCTransmitter	trns;

		protected UDPOSCServer( OSCPacketCodec c, InetSocketAddress localAddress )
		throws IOException
		{
			super( c, UDP );
		
			rcv				= OSCReceiver.newUsing( c, UDP, localAddress );
			trns			= OSCTransmitter.newUsing( c, UDP, localAddress );
		}
		
		public InetSocketAddress getLocalAddress()
		throws IOException
		{
			return rcv.getLocalAddress();
		}

		public void addOSCListener( OSCListener listener )
		{
			rcv.addOSCListener( listener );
		}
		
		public void removeOSCListener( OSCListener listener )
		{
			rcv.removeOSCListener( listener );
		}
		
		public void setCodec( OSCPacketCodec c )
		{
			rcv.setCodec( c );
			trns.setCodec( c );
			super.setCodec( c );
		}
		
		public void setCodec( OSCPacketCodec c, SocketAddress target )
		throws IOException
		{
			throw new IOException( "Not supported in UDP mode" );
		}
		
		public OSCPacketCodec getCodec( SocketAddress target )
		throws IOException
		{
			throw new IOException( "Not supported in UDP mode" );
		}

		public void start()
		throws IOException
		{
			if( !trns.isConnected() ) {
				trns.connect();
				rcv.setChannel( trns.getChannel() );
			}
			rcv.startListening();
		}

		public void stop()
		throws IOException
		{
			rcv.stopListening();
		}
		
		public boolean isActive()
		{
			return rcv.isListening();
		}
		
		public void send( OSCPacket p, SocketAddress target )
		throws IOException
		{
			trns.send( p, target );
		}

//		protected SelectableChannel getChannel()
//		{
//			return rcv.getChannel();
//		}
		
		public void dispose()
		{
			rcv.dispose();
			trns.dispose();
		}

		public void setBufferSize( int size )
		{
			rcv.setBufferSize( size );
			trns.setBufferSize( size );
		}

		public int getBufferSize()
		{
			return rcv.getBufferSize();
		}

		public void dumpIncomingOSC( int mode, PrintStream stream )
		{
			rcv.dumpOSC( mode, stream );
		}
		
		public void dumpOutgoingOSC( int mode, PrintStream stream )
		{
			trns.dumpOSC( mode, stream );
		}
	}

	private static class TCPOSCServer
	extends OSCServer
	implements Runnable, OSCListener
	{
		private final Map					mapRcv			= new HashMap();	// key = SocketAddress (remote), value = OSCReceiver
		private final Map					mapTrns			= new HashMap();	// key = SocketAddress (remote), value = OSCTransmitter

		private final List					collListeners   = new ArrayList();
		private Thread						thread			= null;
		private final Object				startStopSync	= new Object();		// mutual exclusion startListening / stopListening
		private final Object				threadSync		= new Object();		// communication with receiver thread
		private final Object				connSync		= new Object();		// syncs mapRcv and mapTrns
		
		private boolean						isListening		= false;

		private int							bufSize			= DEFAULTBUFSIZE;

		private int							inMode			= kDumpOff;
		private int							outMode			= kDumpOff;
		private PrintStream					inStream		= null;
		private PrintStream					outStream		= null;
		
//		private final InetSocketAddress		localAddress;
		private final ServerSocketChannel	ssch;
		
		protected TCPOSCServer( OSCPacketCodec c, InetSocketAddress localAddress )
		throws IOException
		{
			super( c, TCP );
			
//			this.localAddress	= localAddress;
			ssch				= ServerSocketChannel.open();
			ssch.socket().bind( localAddress );
		}

		public InetSocketAddress getLocalAddress()
		throws IOException
		{
			final ServerSocket ss = ssch.socket();
			return getLocalAddress( ss.getInetAddress(), ss.getLocalPort() );
//			return new InetSocketAddress( ssch.socket().getInetAddress(), ssch.socket().getLocalPort() );
//			return localAddress;
		}

		public void addOSCListener( OSCListener listener )
		{
			synchronized( collListeners ) {
				collListeners.add( listener );
			}
		}
		
		public void removeOSCListener( OSCListener listener )
		{
			synchronized( collListeners ) {
				collListeners.remove( listener );
			}
		}
		
		public void setCodec( OSCPacketCodec c )
		{
			OSCTransmitter trns;
			synchronized( connSync ) {
				for( Iterator iter = mapTrns.values().iterator(); iter.hasNext(); ) {
					trns = (OSCTransmitter) iter.next();
					if( trns.getCodec() == defaultCodec ) {
						trns.setCodec( c );
					}
				}
			}
			super.setCodec( c );
		}

		public void setCodec( OSCPacketCodec c, SocketAddress target )
		throws IOException
		{
			final OSCTransmitter trns;
			
			synchronized( connSync ) {
				trns = (OSCTransmitter) mapTrns.get( target );
			}
			if( trns == null ) throw new NotYetConnectedException();
		}

		public OSCPacketCodec getCodec( SocketAddress target )
		throws IOException
		{
			final OSCTransmitter trns;
			
			synchronized( connSync ) {
				trns = (OSCTransmitter) mapTrns.get( target );
			}
			if( trns == null ) throw new NotYetConnectedException();
			return trns.getCodec();
		}

		public void start()
		throws IOException
		{
			synchronized( startStopSync ) {
				if( Thread.currentThread() == thread ) throw new IllegalStateException( "Cannot call startListening() in the server body thread" );

				if( isListening && ((thread == null) || !thread.isAlive()) ) {
					isListening			= false;
				}
				if( !isListening ) {
					isListening			= true;
					thread				= new Thread( this, "TCPServerBody" );
					thread.setDaemon( true );
					thread.start();
				}
			}
		}

		public void stop()
		throws IOException
		{
			synchronized( startStopSync ) {
				if( Thread.currentThread() == thread ) throw new IllegalStateException( "Cannot call stopListening() in the server body thread" );

				if( isListening ) {
					isListening = false;
					if( (thread != null) && thread.isAlive() ) {
						try {
							synchronized( threadSync ) {
								final SocketChannel guard;
								guard = SocketChannel.open();
								guard.connect( ssch.socket().getLocalSocketAddress() );
								guard.close();
//								try {
//								
//								}
//								finally {
//									try { guard.close(); } catch( IOException e1 ) {}
//								}
//								guard.send( guardPacket );
								threadSync.wait( 5000 );
							}
						}
						catch( InterruptedException e2 ) {
							System.err.println( e2.getLocalizedMessage() );
						}
						catch( IOException e1 ) {
							System.err.println( "TCPServerBody.stopListening : "+e1 );
							throw e1;
						}
						finally {
//							guard = null;
							if( (thread != null) && thread.isAlive() ) {
								try {
									System.err.println( "TCPServerBody.stopListening : rude task killing (" + this.hashCode() + ")" );
									ssch.close();     // rude task killing
								}
								catch( IOException e3 ) {
									System.err.println( "TCPServerBody.stopListening 2: "+e3 );
								}
							}
							thread = null;
							stopAll();
						}
					}
				}
			}
		}

		public boolean isActive()
		{
			return isListening;
		}
		
		public void send( OSCPacket p, SocketAddress target )
		throws IOException
		{
			final OSCTransmitter trns;
			
			synchronized( connSync ) {
				trns = (OSCTransmitter) mapTrns.get( target );
			}
			if( trns == null ) throw new NotYetConnectedException();
		
			trns.send( p );
		}
		
//		protected SelectableChannel getChannel()
//		{
//			return ssch;
//		}
		
		public void dispose()
		{
			try {
				stop();
			}
			catch( IOException e1 ) { /* ignored */ }
			
			try {
				ssch.close();
			}
			catch( IOException e1 ) {
				e1.printStackTrace();
			}
		}
		
		private void stopAll()
		{
			synchronized( connSync ) {
				for( Iterator iter = mapRcv.values().iterator(); iter.hasNext(); ) {
					((OSCReceiver) iter.next()).dispose();
				}
				mapRcv.clear();
				for( Iterator iter = mapTrns.values().iterator(); iter.hasNext(); ) {
					((OSCTransmitter) iter.next()).dispose();
				}
				mapTrns.clear();
			}
		}

		public void setBufferSize( int size )
		{
			synchronized( connSync ) {
				bufSize = size;
	
				for( Iterator iter = mapRcv.values().iterator(); iter.hasNext(); ) {
					((OSCReceiver) iter.next()).setBufferSize( size );
				}
				for( Iterator iter = mapTrns.values().iterator(); iter.hasNext(); ) {
					((OSCTransmitter) iter.next()).setBufferSize( size );
				}
			}
		}

		public int getBufferSize()
		{
			synchronized( connSync ) {
				return bufSize;
			}
		}

		public void dumpIncomingOSC( int mode, PrintStream stream )
		{
			synchronized( connSync ) {
				inMode		= mode;
				inStream	= stream;
				
				for( Iterator iter = mapRcv.values().iterator(); iter.hasNext(); ) {
					((OSCReceiver) iter.next()).dumpOSC( mode, stream );
				}
			}
		}
		
		public void dumpOutgoingOSC( int mode, PrintStream stream )
		{
			synchronized( connSync ) {
				outMode		= mode;
				outStream	= stream;

				for( Iterator iter = mapTrns.values().iterator(); iter.hasNext(); ) {
					((OSCTransmitter) iter.next()).dumpOSC( mode, stream );
				}
			}
		}

		public void run()
		{
			SocketAddress	sender;
			SocketChannel	sch;
			OSCReceiver		rcv;
			OSCTransmitter	trns;
			
			try {
listen:			while( isListening )
				{
					try {
						sch		= ssch.accept();
						if( !isListening ) break listen;
						if( sch == null ) continue listen;

						sender	= sch.socket().getRemoteSocketAddress();
						
						synchronized( connSync ) {
							rcv		= OSCReceiver.newUsing( defaultCodec, sch );
							rcv.setBufferSize( bufSize );
							mapRcv.put( sender, rcv );
							trns	= OSCTransmitter.newUsing( defaultCodec, sch );
							trns.setBufferSize( bufSize );
//System.err.println ("put "+sender );
							mapTrns.put( sender, trns );
							rcv.dumpOSC( inMode, inStream );
							trns.dumpOSC( outMode, outStream );
							rcv.addOSCListener( this );
							rcv.startListening();
						}
					}
					catch( ClosedChannelException e11 ) {	// bye bye, we have to quit
						if( isListening ) {
							System.err.println( e11 );
						}
						return;
					}
					catch( IOException e1 ) {
						if( isListening ) {
							System.err.println( new OSCException( OSCException.RECEIVE, e1.toString() ));
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
		
		public void messageReceived( OSCMessage msg, SocketAddress sender, long time )
		{
			OSCListener listener;

			synchronized( collListeners ) {
				for( int i = 0; i < collListeners.size(); i++ ) {
					listener = (OSCListener) collListeners.get( i );
					listener.messageReceived( msg, sender, time );
				}
			}
		}
	}	
}