/*
 *  OSCPacket.java
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
 *		25-Jan-05	created from de.sciss.meloncillo.net.OSCPacket
 *		26-May-05	moved to de.sciss.net package
 *		05-Aug-05	added printing methods
 *		04-Sep-05	text print supports blobs
 *		02-Oct-06	made some public methods protected (shouldn't be used outside subclasses)
 *		02-Mar-07	readString correctly uses platform default charset
 *		28-Apr-07	moved codec stuff to OSCPacketCodec ;
 *					removed Map argument from decode()
 */

package de.sciss.net;

import java.io.IOException;
import java.io.PrintStream;
import java.nio.ByteBuffer;

/**
 *  <code>OSCPacket</code> is the superclass
 *  of OSC messages and bundles. It provides
 *  methods that apply to both of these OSC packet
 *  types, like calculating the packet's size
 *  encoding the packet from a given byte buffer
 *  or decoding a received message from a given buffer.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.33, 25-Feb-08
 */
public abstract class OSCPacket
{
	// used for hexdump
	private static final byte[] hex = { 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66 };

	/**
	 *  Constructs a new <code>OSCPacket</code>.
	 *  Refer to the subclasses for the particular
	 *  way they instantiate the class
	 */
	protected OSCPacket() { /* empty */ }
	
	/**
	 *  Calculates and returns
	 *  the packet's size in bytes,
	 *  using the default codec.
	 *
	 *  @return the size of the packet in bytes, including the initial
	 *			osc command and aligned to 4-byte boundary. this
	 *			is the amount of bytes written by the <code>encode</code>
	 *			method.
	 *	 
	 *  @throws IOException if an error occurs during the calculation
	 *  @see	#getSize( OSCPacketCodec )
	 */
	public final int getSize()
	throws IOException
	{
		return getSize( OSCPacketCodec.getDefaultCodec() );
	}
	
	/**
	 *  Calculates and returns
	 *  the packet's size in bytes,
	 *  using a given codec.
	 *
	 *	@param	c	the codec that is shall used for encoding the packet
	 *  @return the size of the packet in bytes, including the initial
	 *			osc command and aligned to 4-byte boundary. this
	 *			is the amount of bytes written by the <code>encode</code>
	 *			method.
	 *	 
	 *  @throws IOException if an error occurs during the calculation
	 *  @see	OSCPacketCodec#getSize( OSCPacket )
	 */
	public final int getSize( OSCPacketCodec c )
	throws IOException
	{
		return c.getSize( this );
	}

	/**
	 *  Encodes the contents of this packet
	 *  into the provided <code>ByteBuffer</code>,
	 *	beginning at the buffer's current position, using the
	 *	default codec. To write the
	 *	encoded packet, you will typically call <code>flip()</code>
	 *	on the buffer, then <code>write()</code> on the channel.
	 *
	 *  @param  b							<code>ByteBuffer</code> pointing right at
	 *										the beginning of the osc packet.
	 *										buffer position will be right after the end
	 *										of the packet when the method returns.
	 *
	 *  @throws IOException					in case some of the
	 *										writing procedures failed.
	 *	@see	#encode( OSCPacketCodec, ByteBuffer )
	 */
	public final void encode( ByteBuffer b )
	throws IOException
	{
		encode( OSCPacketCodec.getDefaultCodec(), b );
	}
	
	/**
	 *  Encodes the contents of this packet
	 *  into the provided <code>ByteBuffer</code>,
	 *	beginning at the buffer's current position, using a
	 *	given codec. To write the
	 *	encoded packet, you will typically call <code>flip()</code>
	 *	on the buffer, then <code>write()</code> on the channel.
	 *
	 *  @param  b							<code>ByteBuffer</code> pointing right at
	 *										the beginning of the osc packet.
	 *										buffer position will be right after the end
	 *										of the packet when the method returns.
	 *	@param	c	the codec that is shall used for encoding the packet
	 *
	 *  @throws IOException					in case some of the
	 *										writing procedures failed.
	 *	@see	OSCPacketCodec#encode( OSCPacket, ByteBuffer )
	 */
	public final void encode( OSCPacketCodec c, ByteBuffer b )
	throws IOException
	{
		c.encode( this, b );
	}

	/**
	 *  Creates a new packet decoded
	 *  from the ByteBuffer, using the default codec.
	 *  This method simply calls the equivalent method in <code>OSCPacketCodec</code>.
	 *
	 *  @param  b   <code>ByteBuffer</code> pointing right at
	 *				the beginning of the packet. the buffer's
	 *				limited should be set appropriately to
	 *				allow the complete packet to be read. when
	 *				the method returns, the buffer's position
	 *				is right after the end of the packet.
	 *
	 *  @return		new decoded OSC packet
	 *  
	 *  @throws IOException					in case some of the
	 *										reading or decoding p	rocedures failed.
	 *  @throws IllegalArgumentException	occurs in some cases of buffer underflow
	 *  @see	OSCPacketCodec#decode( ByteBuffer )
	 */
//	public static OSCPacket decode( ByteBuffer b, Map m )
	public static OSCPacket decode( ByteBuffer b )
	throws IOException
	{
		return OSCPacketCodec.getDefaultCodec().decode( b );
	}

	/**
	 *	Prints a text version of a packet to a given stream.
	 *	The format is similar to scsynth using dump mode 1.
	 *	Bundles will be printed with each message on a separate
	 *	line and increasing indent.
	 *
	 *	@param	stream	the print stream to use, for example <code>System.out</code>
	 *	@param	p		the packet to print (either a message or bundle)
	 */
	public static void printTextOn( PrintStream stream, OSCPacket p )
	{
		OSCPacket.printTextOn( stream, p, 0 );
	}

	/**
	 *	Prints a hexdump version of a packet to a given stream.
	 *	The format is similar to scsynth using dump mode 2.
	 *	Unlike <code>printTextOn</code> this takes a raw received
	 *	or encoded byte buffer and not a decoded instance
	 *	of <code>OSCPacket</code>.
	 *
	 *	@param	stream	the print stream to use, for example <code>System.out</code>
	 *	@param	b		the byte buffer containing the packet. read position
	 *					should be at the very beginning of the packet, limit
	 *					should be at the end of the packet. this method alters
	 *					the buffer position in a manner that a successive <code>flip()</code>
	 *					will restore the original position and limit.
	 *
	 *	@see	java.nio.Buffer#limit()
	 *	@see	java.nio.Buffer#position()
	 */
	public static void printHexOn( PrintStream stream, ByteBuffer b )
	{
		final int		lim	= b.limit(); // len = b.limit() - off;
		final byte[]	txt	= new byte[ 74 ];
		int				i, j, k, n, m;

		for( i = 4; i < 56; i++ ) {
			txt[ i ] = (byte) 0x20;
        }
		txt[ 56 ] = (byte) 0x7C;
		
		stream.println();
		for( i = b.position(); i < lim; ) {
			j = 0;
			txt[ j++ ]	= hex[ (i >> 12) & 0xF ];
			txt[ j++ ]	= hex[ (i >> 8) & 0xF ];
			txt[ j++ ]	= hex[ (i >> 4) & 0xF ];
			txt[ j++ ]	= hex[ i & 0xF ];
			m = 57;
			for( k = 0; k < 16 && i < lim; k++, i++ ) {
				if( (k & 7) == 0 ) j += 2; else j++;
				n			= b.get();
				txt[ j++ ]	= hex[ (n >> 4) & 0xF ];
				txt[ j++ ]	= hex[ n & 0xF ];
				txt[ m++ ]	= (n > 0x1F) && (n < 0x7F) ? (byte) n : (byte) 0x2E;
			}
			txt[ m++ ] = (byte) 0x7C;
			while( j < 54 ) {
				txt[ j++ ] = (byte) 0x20;
			}
			while( m < 74 ) {
				txt[ m++ ] = (byte) 0x20;
			}
			stream.write( txt, 0, 74 );
			stream.println();
        }
		stream.println();
    }

	private static void printTextOn( PrintStream stream, OSCPacket p, int nestCount )
	{
		OSCMessage	msg;
		OSCBundle	bndl;
		Object		o;
		
		if( p instanceof OSCMessage ) {
			msg = (OSCMessage) p;
			for( int i = 0; i < nestCount; i++ ) stream.print( "  " );
			stream.print( "[ \"" + msg.getName() + "\"" );
			for( int i = 0; i < msg.getArgCount(); i++ ) {
				o = msg.getArg( i );
				if( o instanceof Number ) {
					if( o instanceof Float || o instanceof Double ) {
						stream.print( ", " + ((Number) o).floatValue() );
					} else {
						stream.print( ", " + ((Number) o).longValue() );
					}
				} else if( o instanceof OSCPacket ) {
					stream.println( "," );
					printTextOn( stream, (OSCPacket) o, nestCount + 1 );
				} else if( o instanceof byte[] ) {
					stream.print( ", DATA[" + ((byte[]) o).length + "]" );
				} else {
					stream.print( ", \"" + o.toString()+"\"" );
				}
			}
			stream.print( " ]" );
		} else {
			bndl = (OSCBundle) p;
			for( int i = 0; i < nestCount; i++ ) stream.print( "  " );
			stream.print( "[ \"#bundle\"" );
			for( int i = 0; i < bndl.getPacketCount(); i++ ) {
				stream.println( "," );
				OSCPacket.printTextOn( stream, bndl.getPacket( i ), nestCount + 1 );
			}
			for( int i = 0; i < nestCount; i++ ) stream.print( "  " );
			stream.print( "]" );
		}
	
		if( nestCount == 0 ) stream.println();
	}
}