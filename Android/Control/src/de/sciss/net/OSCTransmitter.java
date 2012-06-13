/*
 *  OSCTransmitter.java
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
 *		30-Sep-06	made abstract (unfortunately not backward compatible), finished TCP support
 *		02-Jul-07	uses OSCPacketCodec, bugfix in newUsing( String, int )
 */

package de.sciss.net;

import java.io.IOException;
import java.io.PrintStream;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.UnknownHostException;
import java.nio.BufferOverflowException;
import java.nio.ByteBuffer;
import java.nio.channels.DatagramChannel;
import java.nio.channels.SelectableChannel;
import java.nio.channels.SocketChannel;

/**
 *  A class that sends OSC packets (messages
 *	or bundles) to a target OSC server. Each instance takes
 *	a network channel, either explictly specified by a
 *	<code>DatagramChannel</code> (for UDP) or <code>SocketChannel</code> (for TCP),
 *	or internally opened when a protocol type is specified.
 *	<P>
 *	Messages are send by invoking one
 *	of the <code>send</code> methods. For an example,
 *	please refer to the <code>OSCReceiver</code> document.
 *	<P>
 *	<B>Note that as of v0.3,</B> you will most likely want to use preferably one of <code>OSCClient</code> or <code>OSCServer</code>
 *	over <code>OSCTransmitter</code>. Also note that as of v0.3, <code>OSCTransmitter</code> is abstract, which
 *	renders direct instantiation impossible. <B>To update old code,</B> occurences of <code>new OSCTransmitter()</code>
 *	must be replaced by one of the <code>OSCTransmitter.newUsing</code> methods!
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.33, 05-Mar-09
 *
 *	@see				OSCClient
 *	@see				OSCServer
 *	@see				OSCReceiver
 *
 *	@synchronization	sending messages is thread safe
 *	@todo				an explicit disconnect method might be useful
 *						(this is implicitly done when calling dispose)
 */
public abstract class OSCTransmitter
implements OSCChannel
{
	protected final Object				sync			= new Object();	// buffer (re)allocation
	protected boolean					allocBuf		= true;
	private int							bufSize			= DEFAULTBUFSIZE;
	protected ByteBuffer				byteBuf			= null;

    protected int						dumpMode		= kDumpOff;
    protected PrintStream				printStream		= null;
	
	private OSCPacketCodec				c;
	private final String				protocol;
	
	protected SocketAddress				target			= null;
	
	protected final InetSocketAddress	localAddress;
	protected final boolean				revivable;

	protected OSCTransmitter( OSCPacketCodec c, String protocol, InetSocketAddress localAddress, boolean revivable )
	{
		this.c				= c;
		this.protocol		= protocol;
		this.localAddress	= localAddress;
		this.revivable		= revivable;
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	default codec and a specific transport protocol. It picks an arbitrary free port
	 *	and uses the local machine's IP. To determine the resulting
	 *	port, you can use <code>getLocalAddress</code> afterwards.
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@see	OSCChannel#UDP
	 *	@see	OSCChannel#TCP
	 *	@see	#getLocalAddress
	 */
	public static OSCTransmitter newUsing( String protocol )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	a specific codec and transport protocol. It picks an arbitrary free port
	 *	and uses the local machine's IP. To determine the resulting
	 *	port, you can use <code>getLocalAddress</code> afterwards.
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@return				the newly created transmitter
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
	public static OSCTransmitter newUsing( OSCPacketCodec c, String protocol )
	throws IOException
	{
		return newUsing( c, protocol, 0 );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	default codec and a specific transport protocol and port. It
	 *	uses the local machine's IP. Note that the <code>port</code> specifies the
	 *	local socket, not the remote (or target) port. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCTransmitter newUsing( String protocol, int port )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, port );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	a specific codec and transport protocol and port. It
	 *	uses the local machine's IP. Note that the <code>port</code> specifies the
	 *	local socket, not the remote (or target) port. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCTransmitter newUsing( OSCPacketCodec c, String protocol, int port )
	throws IOException
	{
		return newUsing( c, protocol, port, false );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	default codec and a specific transport protocol and port. It
	 *	uses the local machine's IP or the &quot;loopback&quot; address.
	 *	Note that the <code>port</code> specifies the
	 *	local socket, not the remote (or target) port. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@param	loopBack	if <code>true</code>, the &quot;loopback&quot; address (<code>&quot;127.0.0.1&quot;</code>)
	 *						is used which limits communication to the local machine. If <code>false</code>, the
	 *						special IP <code>"0.0.0.0"</code> is used which means any local host is picked
	 *	
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCTransmitter newUsing( String protocol, int port, boolean loopBack )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, port, loopBack );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	a specific codec and transport protocol and port. It
	 *	uses the local machine's IP or the &quot;loopback&quot; address.
	 *	Note that the <code>port</code> specifies the
	 *	local socket, not the remote (or target) port. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	c			the codec to use
	 *	@param	protocol	the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	port		the port number for the OSC socket, or <code>0</code> to use an arbitrary free port
	 *	@param	loopBack	if <code>true</code>, the &quot;loopback&quot; address (<code>&quot;127.0.0.1&quot;</code>)
	 *						is used which limits communication to the local machine. If <code>false</code>, the
	 *						special IP <code>"0.0.0.0"</code> is used which means any local host is picked
	 *	
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCTransmitter newUsing( OSCPacketCodec c, String protocol, int port, boolean loopBack )
	throws IOException
	{
//		final InetSocketAddress localAddress = loopBack ? new InetSocketAddress( "127.0.0.1", port ) :
//														  new InetSocketAddress( InetAddress.getLocalHost(), port );
		final InetSocketAddress localAddress = new InetSocketAddress( loopBack ? "127.0.0.1" : "0.0.0.0", port );
		return newUsing( c, protocol, localAddress );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	default codec and a specific transport protocol and local socket address.
	 *	Note that <code>localAddress</code> specifies the
	 *	local socket, not the remote (or target) socket. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	protocol		the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	localAddress	a valid address to use for the OSC socket. If the port is <code>0</code>,
	 *							an arbitrary free port is picked when the transmitter is connected. (you can find out
	 *							the actual port in this case by calling <code>getLocalAddress()</code> after the
	 *							transmitter was connected).
	 *	
	 *	@return					the newly created transmitter
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 */
	public static OSCTransmitter newUsing( String protocol, InetSocketAddress localAddress )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), protocol, localAddress );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	a specific codec and transport protocol and local socket address.
	 *	Note that <code>localAddress</code> specifies the
	 *	local socket, not the remote (or target) socket. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	c				the codec to use
	 *	@param	protocol		the protocol to use, currently either <code>UDP</code> or <code>TCP</code>
	 *	@param	localAddress	a valid address to use for the OSC socket. If the port is <code>0</code>,
	 *							an arbitrary free port is picked when the transmitter is connected. (you can find out
	 *							the actual port in this case by calling <code>getLocalAddress()</code> after the
	 *							transmitter was connected).
	 *	
	 *	@return					the newly created transmitter
	 *
	 *	@throws	IOException					if a networking error occurs while creating the socket
	 *	@throws	IllegalArgumentException	if an illegal protocol is used
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCTransmitter newUsing( OSCPacketCodec c, String protocol, InetSocketAddress localAddress )
	throws IOException
	{
		if( protocol.equals( UDP )) {
			return new UDPOSCTransmitter( c, localAddress );
			
		} else if( protocol.equals( TCP )) {
			return new TCPOSCTransmitter( c, localAddress );
			
		} else {
			throw new IllegalArgumentException( NetUtil.getResourceString( "errUnknownProtocol" ) + protocol );
		}
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	default codec and UDP transport on a given channel. The caller should ensure that
	 *	the provided channel's socket was bound to a valid address
	 *	(using <code>dch.socket().bind( SocketAddress )</code>).
	 *	Note that <code>dch</code> specifies the
	 *	local socket, not the remote (or target) socket. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	dch			the <code>DatagramChannel</code> to use as UDP socket.
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException	if a networking error occurs while configuring the socket
	 */
	public static OSCTransmitter newUsing( DatagramChannel dch )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), dch );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	a specific codec and UDP transport on a given channel. The caller should ensure that
	 *	the provided channel's socket was bound to a valid address
	 *	(using <code>dch.socket().bind( SocketAddress )</code>).
	 *	Note that <code>dch</code> specifies the
	 *	local socket, not the remote (or target) socket. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	c			the codec to use
	 *	@param	dch			the <code>DatagramChannel</code> to use as UDP socket.
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException	if a networking error occurs while configuring the socket
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCTransmitter newUsing( OSCPacketCodec c, DatagramChannel dch )
	throws IOException
	{
		return new UDPOSCTransmitter( c, dch );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	default codec and TCP transport on a given channel. The caller should ensure that
	 *	the provided channel's socket was bound to a valid address
	 *	(using <code>sch.socket().bind( SocketAddress )</code>). Furthermore,
	 *	the channel must be connected (using <code>connect()</code>) before
	 *	being able to transmit messages.
	 *	Note that <code>sch</code> specifies the
	 *	local socket, not the remote (or target) socket. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	sch			the <code>SocketChannel</code> to use as TCP socket.
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException	if a networking error occurs while configuring the socket
	 */
	public static OSCTransmitter newUsing( SocketChannel sch )
	throws IOException
	{
		return newUsing( OSCPacketCodec.getDefaultCodec(), sch );
	}

	/**
	 *	Creates a new instance of an <code>OSCTransmitter</code>, using
	 *	a specific codec and TCP transport on a given channel. The caller should ensure that
	 *	the provided channel's socket was bound to a valid address
	 *	(using <code>sch.socket().bind( SocketAddress )</code>). Furthermore,
	 *	the channel must be connected (using <code>connect()</code>) before
	 *	being able to transmit messages.
	 *	Note that <code>sch</code> specifies the
	 *	local socket, not the remote (or target) socket. This can be set
	 *	using the <code>setTarget</code> method!
	 *
	 *	@param	c			the codec to use
	 *	@param	sch			the <code>SocketChannel</code> to use as TCP socket.
	 *	@return				the newly created transmitter
	 *
	 *	@throws	IOException	if a networking error occurs while configuring the socket
	 *
	 *	@since		NetUtil 0.33
	 */
	public static OSCTransmitter newUsing( OSCPacketCodec c, SocketChannel sch )
	throws IOException
	{
		return new TCPOSCTransmitter( c, sch );
	}

	public String getProtocol()
	{
		return protocol;
	}
	
	/**
	 *	Queries the transmitter's local socket address.
	 *	You can determine the host and port from the returned address
	 *	by calling <code>getHostName()</code> (or for the IP <code>getAddress().getHostAddress()</code>)
	 *	and <code>getPort()</code>. This port number may be <code>0</code>
	 *	if the transmitter was called with an unspecified port and has not yet been
	 *	connected. In this case, to determine the port actually used, call this
	 *	method after the transmitter has been connected.
	 *	
	 *	@return				the address of the transmitter's local socket.
	 *	@throws	IOException	if the local host could not be resolved
	 *
	 *	@see	java.net.InetSocketAddress#getHostName()
	 *	@see	java.net.InetSocketAddress#getAddress()
	 *	@see	java.net.InetSocketAddress#getPort()
	 */
	public abstract InetSocketAddress getLocalAddress() throws IOException;

	/**
	 *	Specifies the transmitter's target address, that is the address of the remote side to talk to.
	 *	You should call this method only once and you must call it before starting to
	 *	send messages using the shortcut call <code>send( OSCPacket )</code>.
	 *
	 *	@param	target	the address of the remote target socket. Usually you construct an appropriate <code>InetSocketAddress</code>
	 *
	 *	@see	InetSocketAddress
	 */
	public void setTarget( SocketAddress target )
	{
		this.target	= target;
	}
	
	public void setCodec( OSCPacketCodec c )
	{
		this.c	= c;
	}
	
	public OSCPacketCodec getCodec()
	{
		return c;
	}

	/**
	 *	Establishes connection for transports requiring
	 *	connectivity (e.g. TCP). For transports that do not require connectivity (e.g. UDP),
	 *	this ensures the communication channel is created and bound.
	 *  <P>
	 *	When a <B>UDP</B> transmitter
	 *	is created without an explicit <code>DatagramChannel</code> &ndash; say by
	 *	calling <code>OSCTransmitter.newUsing( &quot;udp&quot; )</code>, you are required
	 *	to call <code>connect()</code> so that an actual <code>DatagramChannel</code> is
	 *	created and bound. For a <B>UDP</B> transmitter which was created with an explicit
	 *	<code>DatagramChannel</code>, this method does noting, so it is always safe
	 *	to call <code>connect()</code>. However, for <B>TCP</B> transmitters, 
	 *	this may throw an <code>IOException</code> if the transmitter
	 *	was already connected, therefore be sure to check <code>isConnected()</code> before.
	 *	
	 *	@throws	IOException	if a networking error occurs. Possible reasons: - the underlying
	 *						network channel had been closed by the server. - the transport
	 *						is TCP and the server is not available. - the transport is TCP
	 *						and an <code>OSCReceiver</code> sharing the same socket was stopped before (unable to revive).
	 *
	 *	@see	#isConnected()
	 */
	public abstract void connect() throws IOException;
		
	protected InetSocketAddress getLocalAddress( InetAddress addr, int port )
	throws UnknownHostException
	{
		return new InetSocketAddress( addr.getHostName().equals( "0.0.0.0" ) ? InetAddress.getLocalHost() : addr, port );
	}

	/**
	 *	Queries the connection state of the transmitter.
	 *
	 *	@return	<code>true</code> if the transmitter is connected, <code>false</code> otherwise. For transports that do not use
	 *			connectivity (e.g. UDP) this returns <code>false</code>, if the
	 *			underlying <code>DatagramChannel</code> has not yet been created.
	 *
	 *	@see	#connect()
	 */
	public abstract boolean isConnected();

	/**
	 *	Sends an OSC packet (bundle or message) to the given
	 *	network address, using the current codec.
	 *
	 *	@param	p		the packet to send
	 *	@param	target	the target address to send the packet to
	 *
	 *	@throws	IOException	if a write error, OSC encoding error,
	 *						buffer overflow error or network error occurs
	 */
	public final void send( OSCPacket p, SocketAddress target )
	throws IOException
	{
		send( c, p, target );
	}

	/**
	 *	Sends an OSC packet (bundle or message) to the given
	 *	network address, using a particular codec.
	 *
	 *	@param	c			the codec to use
	 *	@param	p			the packet to send
	 *	@param	target		the target address to send the packet to
	 *
	 *	@throws	IOException	if a write error, OSC encoding error,
	 *						buffer overflow error or network error occurs
	 *
	 *	@since		NetUtil 0.33
	 */
	public abstract void send( OSCPacketCodec c, OSCPacket p, SocketAddress target ) throws IOException;

	/**
	 *	Sends an OSC packet (bundle or message) to the default
	 *	network address, using the current codec. The default address is the one specified
	 *	using the <code>setTarget</code> method. Therefore
	 *	this will throw a <code>NullPointerException</code> if
	 *	no default address was specified.
	 *
	 *	@param	p		the packet to send
	 *
	 *	@throws	IOException				if a write error, OSC encoding error,
	 *									buffer overflow error or network error occurs
	 *	@throws	NullPointerException	if no default address was specified
	 *
	 *	@see	#setTarget( SocketAddress )
	 */
	public final void send( OSCPacket p )
	throws IOException
	{
		send( p, target );
	}

	/**
	 *	Sends an OSC packet (bundle or message) to the default
	 *	network address, using a particular codec. The default address is the one specified
	 *	using the <code>setTarget</code> method. Therefore
	 *	this will throw a <code>NullPointerException</code> if
	 *	no default address was specified.
	 *
	 *	@param	c			the codec to use
	 *	@param	p			the packet to send
	 *
	 *	@throws	IOException				if a write error, OSC encoding error,
	 *									buffer overflow error or network error occurs
	 *	@throws	NullPointerException	if no default address was specified
	 *
	 *	@see	#setTarget( SocketAddress )
	 *
	 *	@since		NetUtil 0.33
	 */
	public abstract void send( OSCPacketCodec c, OSCPacket p ) throws IOException;

	public void setBufferSize( int size )
	{
		synchronized( sync ) {
			if( bufSize != size ) {
				bufSize		= size;
				allocBuf	= true;
			}
		}
	}
	
	public int getBufferSize()
	{
		synchronized( sync ) {
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
		byteBuf	= null;
	}

	// @synchronization	caller must ensure synchronization
	protected void checkBuffer()
	{
		if( allocBuf ) {
			byteBuf		= ByteBuffer.allocateDirect( bufSize );
			allocBuf	= false;
		}
	}
	
	protected abstract SelectableChannel getChannel();

//	protected abstract void setChannel( SelectableChannel ch );

	// --------------------- internal classes ---------------------

	private static class UDPOSCTransmitter
	extends OSCTransmitter
	{
		private DatagramChannel	dch;
	
		protected UDPOSCTransmitter( OSCPacketCodec c, InetSocketAddress localAddress )
		{
			super( c, UDP, localAddress, true );
		}

		protected UDPOSCTransmitter( OSCPacketCodec c, DatagramChannel dch )
		{
			super( c, UDP, new InetSocketAddress( dch.socket().getLocalAddress(), dch.socket().getLocalPort() ), false );
			
			this.dch	= dch;
		}
	
//		protected void setChannel( SelectableChannel ch )
//		{
//			dch	= (DatagramChannel) ch;
//		}

		protected SelectableChannel getChannel()
		{
			synchronized( sync ) {
				return dch;
			}
		}
	
		public InetSocketAddress getLocalAddress() 
		throws UnknownHostException
		{
			synchronized( sync ) {
				if( dch != null ) {
					final DatagramSocket ds = dch.socket();
					return new InetSocketAddress( ds.getLocalAddress(), ds.getLocalPort() );
				} else {
					return getLocalAddress( localAddress.getAddress(), localAddress.getPort() );
				}
			}
		}

		public void connect()
		throws IOException
		{
			synchronized( sync ) {
				if( (dch != null) && !dch.isOpen() ) {
					if( !revivable ) throw new IOException( NetUtil.getResourceString( "errCannotRevive" ));
					dch = null;
				}
				if( dch == null ) {
					final DatagramChannel newCh = DatagramChannel.open();
					newCh.socket().bind( localAddress );
					dch = newCh;
				}
			}
		}

		public boolean isConnected()
		{
			synchronized( sync ) {
				return( (dch != null) && dch.isOpen() );
			}
		}

		public void dispose()
		{
			super.dispose();
			if( dch != null ) {
				try {
					dch.close();
				}
				catch( IOException e1 ) { /* ignored */ }
				dch = null;
			}
		}

		public void send( OSCPacketCodec c, OSCPacket p )
		throws IOException
		{
			send( c, p, target );
		}

		public void send( OSCPacketCodec c, OSCPacket p, SocketAddress target )
		throws IOException
		{
			try {
				synchronized( sync ) {
//					if( dch == null ) throw new NotYetConnectedException();
					if( dch == null ) throw new IOException( NetUtil.getResourceString( "errChannelNotConnected" ));

					checkBuffer();
					byteBuf.clear();
					c.encode( p, byteBuf );
					byteBuf.flip();

					if( dumpMode != kDumpOff ) {
						printStream.print( "s: " );
						if( (dumpMode & kDumpText) != 0 ) OSCPacket.printTextOn( printStream, p );
						if( (dumpMode & kDumpHex)  != 0 ) {
							OSCPacket.printHexOn( printStream, byteBuf );
							byteBuf.flip();
						}
					}
					
					dch.send( byteBuf, target );
				}
			}
			catch( BufferOverflowException e1 ) {
				throw new OSCException( OSCException.BUFFER,
					p instanceof OSCMessage ? ((OSCMessage) p).getName() : p.getClass().getName() );
			}
		}
	}

	private static class TCPOSCTransmitter
	extends OSCTransmitter
	{
		private SocketChannel sch;
	
		protected TCPOSCTransmitter( OSCPacketCodec c, InetSocketAddress localAddress )
		{
			super( c, TCP, localAddress, true );
		}
		
		protected TCPOSCTransmitter( OSCPacketCodec c, SocketChannel sch )
		{
			super( c, TCP, new InetSocketAddress( sch.socket().getLocalAddress(), sch.socket().getLocalPort() ), false );
			
			this.sch	= sch;
			
			if( sch.isConnected() ) setTarget( sch.socket().getRemoteSocketAddress() );
		}

		public InetSocketAddress getLocalAddress()
		throws UnknownHostException
		{
			synchronized( sync ) {
				if( sch != null ) {
					final Socket s = sch.socket();
					return new InetSocketAddress( s.getLocalAddress(), s.getLocalPort() );
				} else {
					return getLocalAddress( localAddress.getAddress(), localAddress.getPort() );
				}
			}
		}

//		protected void setChannel( SelectableChannel ch )
//		{
//			sch	= (SocketChannel) ch;
//		}

		protected SelectableChannel getChannel()
		{
			synchronized( sync ) {
				return sch;
			}
		}

		public void connect()
		throws IOException
		{
			synchronized( sync ) {
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

//		protected void disconnect()
//		throws IOException
//		{
//
//		}

		public boolean isConnected()
		{
			synchronized( sync ) {
				return( (sch != null) && sch.isConnected() );
			}
		}

		public void dispose()
		{
			super.dispose();
			if( sch != null ) {
				try {
//System.err.println( "TCPOSCTransmitter.closeChannel()" );
//new IOException( "TCPOSCTransmitter.closeChannel()" ).printStackTrace();
					sch.close();
//System.err.println( "... ok " );
				}
				catch( IOException e1 ) {
					e1.printStackTrace();
				}
				sch = null;
			}
		}

		public void send( OSCPacketCodec c, OSCPacket p, SocketAddress target )
		throws IOException
		{
			synchronized( sync ) {
				if( (target != null) && !target.equals( this.target )) throw new IllegalStateException( NetUtil.getResourceString( "errNotBoundToAddress" ) + target );
			
				send( c, p );
			}
		}

		public void send( OSCPacketCodec c, OSCPacket p )
		throws IOException
		{
			final int len;
		
			try {
				synchronized( sync ) {
//					if( sch == null ) throw new NotYetConnectedException();
					if( sch == null ) throw new IOException( NetUtil.getResourceString( "errChannelNotConnected" ));

					checkBuffer();
					byteBuf.clear();
					byteBuf.position( 4 );
					c.encode( p, byteBuf );
					len = byteBuf.position() - 4;
					byteBuf.flip();
					byteBuf.putInt( 0, len );

					if( dumpMode != kDumpOff ) {
						printStream.print( "s: " );
						if( (dumpMode & kDumpText) != 0 ) OSCPacket.printTextOn( printStream, p );
						if( (dumpMode & kDumpHex)  != 0 ) {
							OSCPacket.printHexOn( printStream, byteBuf );
							byteBuf.flip();
						}
					}
					
					sch.write( byteBuf );
				}
			}
			catch( BufferOverflowException e1 ) {
				throw new OSCException( OSCException.BUFFER,
					p instanceof OSCMessage ? ((OSCMessage) p).getName() : p.getClass().getName() );
			}
		}
	}
}