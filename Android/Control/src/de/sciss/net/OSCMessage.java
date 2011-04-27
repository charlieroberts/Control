/*
 *  OSCMessage.java
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
 *		25-Jan-05	created from de.sciss.meloncillo.net.OSCMessage
 *		22-Feb-05	new argument type OSCPacket allowed : in this case,
 *					the packet is append as a OSC-blob which is very
 *					convenient for SuperCollider which uses a lot of
 *					optional completion-messages.
 *		26-May-05	moved to de.sciss.net package
 *		21-Jun-05	extended javadoc, NO_ARGS
 *		04-Sep-05	message argument class byte[] added (encoded as blob)
 *		09-Sep-05	fixed blob byte boundary alignment ; fixed getSize() method for blob args
 *		11-Nov-05	fix in blob decode
 *		28-Apr-07	moved codec stuff to OSCPacketCodec
 */

package de.sciss.net;

import java.io.IOException;
import java.nio.ByteBuffer;

/**
 *  Class for decoding OSC messages from 
 *  received datagrams or encoding OSC message
 *  for sending to a target socket. See <A HREF="http://opensoundcontrol.org/spec-1_0">opensoundcontrol.org/spec-1_0</A> for
 *	the specification of the message format.
 *	</P><P>
 *	Here is an example:
 *	<pre>
 *      DatagramChannel dch = null;
 *
 *      final ByteBuffer buf        = ByteBuffer.allocateDirect( 1024 );
 *      final SocketAddress addr    = new InetSocketAddress( "localhost", 57110 );
 *      final Random rnd            = new Random( System.currentTimeMillis() );
 *
 *      try {
 *          dch = DatagramChannel.open();
 *          dch.configureBlocking( true );
 *          new OSCMessage( "/s_new", new Object[] { "default",
 *                          new Integer( 1001 ), new Integer( 1 ), new Integer( 0 ),
 *                          "out", new Integer( 0 ), "freq", new Float( 0 ), "amp", new Float( 0.1f )}
 *          ).encode( buf );
 *          buf.flip();
 *          dch.send( buf, addr );
 *          
 *          for( int i = 0; i < 11; i++ ) {
 *              buf.clear();
 *              // no schoenheitsprize
 *              new OSCMessage( "/n_set", new Object[] { new Integer( 1001 ),
 *                  "freq", new Float( 333 * Math.pow( 2, rnd.nextInt( 12 ) / 12.0f ))}
 *              ).encode( buf );
 *              buf.flip();
 *              dch.send( buf, addr );
 *              Thread.currentThread().sleep( 300 );
 *          }
 *          buf.clear();
 *          new OSCMessage( "/n_free", new Object[] { new Integer( 1001 )}).encode( buf );
 *          buf.flip();
 *          dch.send( buf, addr );
 *      }
 *      catch( InterruptedException e1 ) {}
 *      catch( IOException e2 ) {
 *          System.err.println( e2.getLocalizedMessage() );
 *      }
 *      finally {
 *          if( dch != null ) {
 *              try {
 *                  dch.close();
 *              }
 *              catch( IOException e4 ) {};
 *          }
 *      }
 *	</pre>
 *
 *	Note that this example uses the old way of sending messages.
 *	A easier way is to create an <code>OSCTransmitter</code> which
 *	handles the byte buffer for you. See the <code>OSCReceiver</code> doc
 *	for an example using a dedicated transmitter.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.33, 28-Apr-07
 *
 *	@see		OSCReceiver
 */
public class OSCMessage
extends OSCPacket
{
	private Object[]	args;
	private String		name;
	
	/**
	 *	Shorthand to pass to the constructor
	 *	if you want to create an OSC message
	 *	which doesn't contain any arguments.
	 *	Note: alternatively you can use the
	 *	constructor <code>new OSCMessage( String )</code>.
	 *
	 *	@see	#OSCMessage( String )
	 */
	public static final Object[] NO_ARGS	= new Object[0];

	/**
	 *  Creates a generic OSC message
	 *  with no arguments.
	 *
	 *  @param  name	the OSC command, like "/s_new"
	 */
	public OSCMessage( String name )
	{
		super();

		this.name   = name;
		this.args	= NO_ARGS;
	}

	/**
	 *  Creates a generic OSC message
	 *  from Primitive arguments.
	 *
	 *  @param  name	the OSC command, like "/s_new"
	 *  @param  args	array of arguments which are simply
	 *					assembled. Supported types are <code>Integer</code>,
	 *					<code>Long</code>, <code>Float</code>, <code>Double</code>,
	 *					<code>String</code>, furthermore <code>byte[]</code> and <code>OSCPacket</code> (both of which
	 *					are written as a blob). Note that in a future version of NetUtil, special codecs
	 *					will allow customization of the way classes are encoded.
	 */
	public OSCMessage( String name, Object[] args )
	{
		super();
		
		this.name   = name;
		this.args   = args;
	}
	
	/**
	 *  Returns the OSC command of this message
	 *
	 *  @return		the message's command, e.g. "/synced" etc.
	 */
	public String getName()
	{
		return name;
	}

	/**
	 *  Returns the number of arguments of the message.
	 *
	 *  @return		the number of typed arguments in the message.
	 *				e.g. for [ "/n_go", 1001, 0, -1, -1, 0 ] it returns 5.
	 */
	public int getArgCount()
	{
		return args.length;
	}
	
	/**
	 *  Returns the argument at the given index.
	 *	See <code>decodeMessage()</code> for information about the
	 *	used java classes. The most fail-safe way to handle numeric arguments
	 *	is to assume <code>Number</code> instead of a particular number subclass.
	 *	To read a primitive <code>int</code>, the recommended code is
	 *	<code>((Number) msg.getArg( index )).intValue()</code>, which will
	 *	work with any of <code>Integer</code>, <code>Long</code>, <code>Float</code>, <code>Double</code>.
	 *
	 *  @param  index   index of the argument, beginning at zero,
	 *					must be less than <code>getArgCount()</code>
	 *
	 *  @return		the primitive type (<code>Integer</code>, <code>Float</code>, <code>String</code> etc.) argument at
	 *				the given index.
	 *				e.g. for [ "/n_go", 1001, 0, -1, -1, 0 ], requesting index
	 *				0 would return <code>new Integer( 1001 )</code>.
	 *
	 *	@see	#getArgCount()
	 *	@see	#decodeMessage( String, ByteBuffer )
	 *	@see	Number#intValue()
	 */
	public Object getArg( int index )
	{
		return args[ index ];
	}

	/**
	 *  Creates a new message with arguments decoded
	 *  from the ByteBuffer, using the default codec. Usually you call
	 *  <code>decode</code> from the <code>OSCPacket</code> 
	 *  superclass or directly from the <code>OSCPacketCodec</code>.
	 *
	 *  @param  b   ByteBuffer pointing right at
	 *				the beginning of the type
	 *				declaration section of the
	 *				OSC message, i.e. the name
	 *				was skipped before.
	 *
	 *  @return		new OSC message representing
	 *				the received message described
	 *				by the ByteBuffer.
	 *  
	 *  @throws IOException					in case some of the
	 *										reading or decoding procedures failed.
	 *  @throws IllegalArgumentException	occurs in some cases of buffer underflow
	 *	@see	OSCPacketCodec#decodeMessage( String, ByteBuffer )
	 */
	public static OSCMessage decodeMessage( String command, ByteBuffer b )
	throws IOException
	{
		return OSCPacketCodec.getDefaultCodec().decodeMessage( command, b );
	}
}