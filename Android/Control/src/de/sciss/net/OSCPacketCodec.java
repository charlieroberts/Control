/*
 *  OSCPacketCodec.java
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
 *		28-Apr-07	created
 */
package de.sciss.net;

import java.io.IOException;
import java.nio.BufferOverflowException;
import java.nio.BufferUnderflowException;
import java.nio.ByteBuffer;

/**
 *	A packet codec defines how the translation between Java objects
 *	and OSC atoms is accomplished. For example, by default, when
 *	an OSC message is assembled for transmission, the encoder will
 *	translate a<code>java.lang.Integer</code> argument into
 *	a four byte integer with typetag <code>'i'</code>. Or when
 *	a received message is being decoded, finding an atom typetagged
 *	<code>'f'</code>, the decoder will create a <code>java.lang.Float</code>
 *	out of it.
 *	<p>
 *	This example sounds trivial, but the codec is also able to handle
 *	type conversions. For instance, in the strict OSC 1.0 specification,
 *	only 32bit numeric atoms are defined (<code>'i'</code> and <code>'f'</code>).
 *	A codec with mode <code>MODE_STRICT_V1</code> will reject a
 *	<code>java.lang.Double</code> in the encoding process and not be
 *	able to decode a typetag <code>'d'</code>. A codec with mode
 *	<code>MODE_MODEST</code> automatically breaks down everything the 32bit,
 *	so a <code>java.lang.Double</code> gets encoded as 32bit <code>'f'</code>
 *	and a received atom tagged <code>'d'</code> becomes a
 *	<code>java.lang.Float</code>. Other configurations exist.
 *	<p>
 *	Another important function of the codec is to specify the charset encoding
 *	of strings, something that was overseen in the OSC 1.0 spec. By default,
 *	<code>UTF-8</code> is used so all special characters can be safely encoded.
 *	<p>
 *	Last but not least, using the <code>putDecoder</code> and <code>putEncoder</code>
 *	methods, the codec can be extended to support additional Java classes or
 *	OSC typetags, without the need to subclass <code>OSCPacketCodec</code>.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.36, 18-Feb-09
 *
 *	@since		NetUtil 0.35
 */
public class OSCPacketCodec
{
	private static final OSCPacketCodec defaultCodec		= new OSCPacketCodec();
	
	public static final int		MODE_READ_DOUBLE			= 0x0001;
	public static final int		MODE_READ_DOUBLE_AS_FLOAT	= 0x0002;
	private static final int	MODE_READ_DOUBLE_MASK		= 0x0003;
	public static final int		MODE_READ_LONG				= 0x0004;
	public static final int		MODE_READ_LONG_AS_INTEGER	= 0x0008;
	private static final int	MODE_READ_LONG_MASK			= 0x000C;
	public static final int		MODE_WRITE_DOUBLE			= 0x0010;
	public static final int		MODE_WRITE_DOUBLE_AS_FLOAT	= 0x0020;
	private static final int	MODE_WRITE_DOUBLE_MASK		= 0x0030;
	public static final int		MODE_WRITE_LONG				= 0x0040;
	public static final int		MODE_WRITE_LONG_AS_INTEGER	= 0x0080;
	private static final int	MODE_WRITE_LONG_MASK		= 0x00C0;
	public static final int		MODE_READ_SYMBOL_AS_STRING	= 0x0100;
	public static final int		MODE_WRITE_PACKET_AS_BLOB	= 0x0200;
	
	/**
	 *	Support mode: coder only accepts <code>java.lang.Integer</code>,
	 *	<code>java.lang.Float</code>, <code>java.lang.String</code>,
	 *	and <code>byte[]</code>.
	 *	Decoder only accepts <code>'i'</code>, <code>'f'</code>,
	 *	<code>'s'</code>, and <code>'b'</code>. Note that <code>byte[]</code>
	 *	is used to represents blobs (<code>'b'</code>).
	 */
	public static final int		MODE_STRICT_V1				= 0x0000;
	/**
	 *	Support mode: like <code>MODE_STRICT_V1</code>, but coder additionally
	 *	encodes <code>java.lang.Long</code> as a <code>'i'</code>,
	 *	<code>java.lang.Double</code> as a <code>'f'</code>, and
	 *	<code>de.sciss.net.OSCPacket</code> as a blob <code>'b'</code>.
	 *	The decoder decodes <code>'h'</code> into <code>java.lang.Integer</code>,
	 *	<code>'d'</code> into <code>java.lang.Float</code>, and
	 *	<code>'S'</code> (Symbol) into <code>java.lang.String</code>.
	 */
	public static final int		MODE_MODEST					= MODE_READ_DOUBLE_AS_FLOAT | MODE_READ_LONG_AS_INTEGER | MODE_WRITE_DOUBLE_AS_FLOAT | MODE_WRITE_LONG_AS_INTEGER | MODE_READ_SYMBOL_AS_STRING | MODE_WRITE_PACKET_AS_BLOB;
	/**
	 *	Support mode: like <code>MODE_MODEST</code>, that is, it will
	 *	downgrade to 32bit in the encoding process, but decoding leaves
	 *	64bit values intact, so <code>'h'</code> becomes <code>java.lang.Long</code>,
	 *	and <code>'d'</code> into <code>java.lang.Double</code>.
	 */
	public static final int		MODE_GRACEFUL				= MODE_READ_DOUBLE | MODE_READ_LONG | MODE_WRITE_DOUBLE_AS_FLOAT | MODE_WRITE_LONG_AS_INTEGER | MODE_READ_SYMBOL_AS_STRING | MODE_WRITE_PACKET_AS_BLOB;
	/**
	 *	Support mode: like <code>MODE_STRICT_V1</code>, but with additional
	 *	64bit support, that is a mutual mapping between
	 *	<code>'h'</code> &lt;--&gt; <code>java.lang.Long</code>, and
	 *	<code>'d'</code> &lt;--&gt; <code>java.lang.Double</code>.
	 *	Also, <code>'S'</code> (Symbol) is decoded into <code>java.lang.String</code>,
	 *	and <code>de.sciss.net.OSCPacket</code> is encoded as a blob <code>'b'</code>.
	 */
	public static final int		MODE_FAT_V1					= MODE_READ_DOUBLE | MODE_READ_LONG | MODE_WRITE_DOUBLE | MODE_WRITE_LONG | MODE_READ_SYMBOL_AS_STRING | MODE_WRITE_PACKET_AS_BLOB;
	
	private final Atom[]		atomDecoders				= new Atom[ 128 ];
//	private final Map			atomEncoders				= new HashMap();
	private final Class[]		atomEncoderC				= new Class[ 128 ];
	private final Atom[]		atomEncoderA				= new Atom[ 128 ];
	
	protected String			charsetName;

	private static final byte[] bndlIdentifier  			= { 0x23, 0x62, 0x75, 0x6E, 0x64, 0x6C, 0x65, 0x00 }; // "#bundle" (4-aligned)

	private static final byte[] pad							= new byte[ 4 ];

	/**
	 *	Creates a new codec with <code>MODE_GRACEFUL</code> and
	 *	<code>UTF-8</code> encoding. Note that since a codec
	 *	and be shared between <code>OSCServer</code> or
	 *	<code>OSCClient</code> instances, usually you will just
	 *	want to call <code>getDefaultCodec</code>!
	 *
	 *	@see	#MODE_GRACEFUL
	 *	@see	#getDefaultCodec()
	 */
	public OSCPacketCodec()
	{
		this( MODE_GRACEFUL );
	}

	/**
	 *	Creates a new codec with a given support mode and
	 *	<code>UTF-8</code> encoding.
	 *
	 *	@param	mode	the support mode flag field to use
	 */
	public OSCPacketCodec( int mode )
	{
		this( mode, "UTF-8" );
	}
	
	/**
	 *	Creates a new codec with a given support mode and
	 *	a given charset for string encoding.
	 *
	 *	@param	mode	the support mode flag mask to use
	 *	@param	charset	the name of the charset to use for
	 *					string coding and decoding, like
	 *					<code>&quot;UTF-8&quot;</code>,
	 *					<code>&quot;ISO-8859-1&quot;</code> etc.
	 *	@see	java.nio.charset.Charset
	 */
	public OSCPacketCodec( int mode, String charset )
	{
		Atom a;
		int  encIdx = 0;
		
		// OSC version 1.0 strict type tag support
		a = new IntegerAtom();
		atomDecoders[ a.getTypeTag( null )] = a;
//		atomEncoders.put( Integer.class, a );
		atomEncoderC[ encIdx ] = Integer.class;
		atomEncoderA[ encIdx++ ] = a;
		a = new FloatAtom();
		atomDecoders[ a.getTypeTag( null )] = a;
//		atomEncoders.put( Float.class, a );
		atomEncoderC[ encIdx ] = Float.class;
		atomEncoderA[ encIdx++ ] = a;
		a = new StringAtom();
		atomDecoders[ a.getTypeTag( null )] = a;
//		atomEncoders.put( String.class, a );
		atomEncoderC[ encIdx ] = String.class;
		atomEncoderA[ encIdx++ ] = a;
		a = new BlobAtom();
		atomDecoders[ a.getTypeTag( null )] = a;
//		atomEncoders.put( byte[].class, a );
		atomEncoderC[ encIdx ] = byte[].class;
		atomEncoderA[ encIdx++ ] = a;
		
		setStringCharsetCodec( charset );
		setSupportMode( mode );
	}
	
	/**
	 * 	Queries the standard codec which is used in all
	 * 	implicit client and server creations. This codec adheres
	 * 	to the <code>MODE_GRACEFUL</code> scheme and uses
	 * 	<code>UTF-8</code> string encoding.
	 * 	<p>
	 * 	Note that although it is not recommended, it is
	 * 	possible to modify the returned codec. That means that
	 * 	upon your application launch, you could query the default
	 * 	codec and switch its behaviour, e.g. change the string
	 * 	charset, so all successive operations with the default
	 * 	codec will be subject to those customizations.
	 * 
	 *	@return	the default codec
	 *	@see	#MODE_GRACEFUL
	 */
	public static OSCPacketCodec getDefaultCodec()
	{
		return defaultCodec;
	}
	
	/**
	 * 	Specifies the charset to use in string coding and decoding.
	 * 
	 *	@param charsetName	the name of the charset, e.g. 
	 *						<code>&quot;UTF-8&quot;</code>,
	 *						<code>&quot;ISO-8859-1&quot;</code> etc.
	 *	@see	java.nio.charset.Charset
	 */
	public void setStringCharsetCodec( String charsetName )
	{
		this.charsetName = charsetName;
	}

	/**
	 * 	Registers an atomic decoder with the packet codec. This
	 * 	decoder is called whenever an OSC message with the
	 * 	given typetag is encountered.
	 * 
	 *	@param typeTag	the typetag which is to be decoded with the
	 *					new <code>Atom</code>. <code>typeTag</code>
	 *					must be in the ASCII value range 0 to 127.
	 *	@param a		the decoder to use
	 *
	 *	@see	OSCPacketCodec.Atom
	 */
	public void putDecoder( byte typeTag, Atom a )
	{
		atomDecoders[ typeTag ] = a;
	}
	
	/**
	 * 	Registers an atomic encoder with the packet codec. This
	 * 	encoder is called whenever an OSC message to be assembled
	 * 	contains an argument of the given Java class.
	 * 
	 *	@param javaClass	the class for which the encoder is responsible
	 *	@param a			the encoder to use
	 *
	 *	@see	OSCPacketCodec.Atom
	 */
	public void putEncoder( Class javaClass, Atom a )
	{
		int encIdx = 0;
//		atomEncoders.put( javaClass, a );
		while( (atomEncoderC[ encIdx ] != javaClass) && (atomEncoderC[ encIdx ] != null) ) encIdx++;
		if( a != null ) {
			atomEncoderC[ encIdx ] = javaClass;
			atomEncoderA[ encIdx ] = a;
		} else if( atomEncoderC[ encIdx ] != null ) {
			int encIdx2;
			for( encIdx2 = encIdx + 1; atomEncoderC[ encIdx2 ] != null; encIdx2 ++ ) ;
			System.arraycopy( atomEncoderC, encIdx + 1, atomEncoderC, encIdx, encIdx2 - encIdx );
			System.arraycopy( atomEncoderA, encIdx + 1, atomEncoderA, encIdx, encIdx2 - encIdx );
		}
	}
	
	/**
	 * 	Adjusts the support mode for type tag handling. Usually
	 * 	you specify the mode directly in the instantiation of
	 * 	<code>OSCPacketCodec</code>, but you can change it later
	 * 	using this method.
	 * 
	 *	@param	mode	the new mode to use. A flag field combination
	 *					of <code>MODE_READ_DOUBLE</code> or
	 *					<code>MODE_READ_DOUBLE_AS_FLOAT</code> etc.,
	 *					or a ready made combination such as
	 *					<code>MODE_FAT_V1</code>.
	 *
	 *	@see	#OSCPacketCodec( int )
	 */
	public void setSupportMode( int mode )
	{
		Atom a;
		
		switch( mode & MODE_READ_DOUBLE_MASK ) {
		case MODE_STRICT_V1:
			atomDecoders[ 0x64 ] = null;	// 'd' double
			break;
		case MODE_READ_DOUBLE:
			atomDecoders[ 0x64 ] = new DoubleAtom();
			break;
		case MODE_READ_DOUBLE_AS_FLOAT:
			atomDecoders[ 0x64 ] = new DoubleAsFloatAtom();
			break;
		default:
			throw new IllegalArgumentException( String.valueOf( mode ));
		}
		
		switch( mode & MODE_READ_LONG_MASK ) {
		case MODE_STRICT_V1:
			atomDecoders[ 0x68 ] = null;	// 'h' long
			break;
		case MODE_READ_LONG:
			atomDecoders[ 0x68 ] = new LongAtom();
			break;
		case MODE_READ_LONG_AS_INTEGER:
			atomDecoders[ 0x68 ] = new LongAsIntegerAtom();
			break;
		default:
			throw new IllegalArgumentException( String.valueOf( mode ));
		}

		switch( mode & MODE_WRITE_DOUBLE_MASK ) {
		case MODE_STRICT_V1:
//			atomEncoders.remove( Double.class );
			putEncoder( Double.class, null );
			break;
		case MODE_WRITE_DOUBLE:
//			atomEncoders.put( Double.class, new DoubleAtom() );
			putEncoder( Double.class, new DoubleAtom() );
			break;
		case MODE_WRITE_DOUBLE_AS_FLOAT:
//			atomEncoders.put( Double.class, new DoubleAsFloatAtom() );
			putEncoder( Double.class, new DoubleAsFloatAtom() );
			break;
		default:
			throw new IllegalArgumentException( String.valueOf( mode ));
		}
		
		switch( mode & MODE_WRITE_LONG_MASK ) {
		case MODE_STRICT_V1:
//			atomEncoders.remove( Long.class );
			putEncoder( Long.class, null );
			break;
		case MODE_WRITE_LONG:
//			atomEncoders.put( Long.class, new LongAtom() );
			putEncoder( Long.class, new LongAtom() );
			break;
		case MODE_WRITE_LONG_AS_INTEGER:
//			atomEncoders.put( Long.class, new LongAsIntegerAtom() );
			putEncoder( Long.class, new LongAsIntegerAtom() );
			break;
		default:
			throw new IllegalArgumentException( String.valueOf( mode ));
		}
		
		if( (mode & MODE_READ_SYMBOL_AS_STRING) != 0 ) {
			atomDecoders[ 0x53 ] = new StringAtom();	// 'S' symbol
		} else {
			atomDecoders[ 0x53 ] = null;
		}

		if( (mode & MODE_WRITE_PACKET_AS_BLOB) != 0 ) {
			a = new PacketAtom();
//			atomEncoders.put( OSCBundle.class, a );
//			atomEncoders.put( OSCMessage.class, a );
			putEncoder( OSCBundle.class, a );
			putEncoder( OSCMessage.class, a );
		} else {
//			atomEncoders.remove( OSCBundle.class );
//			atomEncoders.remove( OSCMessage.class );
			putEncoder( OSCBundle.class, null );
			putEncoder( OSCMessage.class, null );
		}
	}
	
	/**
	 *  Creates a new packet decoded
	 *  from the ByteBuffer. This method tries
	 *  to read a null terminated string at the
	 *  beginning of the provided buffer. If it
	 *  equals the bundle identifier, the
	 *  <code>decode</code> of <code>OSCBundle</code>
	 *  is called (which may recursively decode
	 *  nested bundles), otherwise the one from
	 *  <code>OSCMessage</code>.
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
	 *										reading or decoding procedures failed.
	 *  @throws BufferUnderflowException	in case of a parsing
	 *										error that causes the
	 *										method to read past the buffer limit
	 *  @throws IllegalArgumentException	occurs in some cases of buffer underflow
	 */
	public OSCPacket decode( ByteBuffer b )
	throws IOException
	{
		final String command = readString( b );
		skipToAlign( b );
        
        if( command.equals( OSCBundle.TAG )) {
			return decodeBundle( b );
        } else {
        	return decodeMessage( command, b );
        }
	}
	
	/**
	 *  Encodes the contents of this packet
	 *  into the provided <code>ByteBuffer</code>,
	 *	beginning at the buffer's current position. To write the
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
	 */
	public void encode( OSCPacket p, ByteBuffer b )
	throws IOException
	{
		if( p instanceof OSCBundle ) {
			encodeBundle( (OSCBundle) p, b );
		} else {
			encodeMessage( (OSCMessage) p, b );
		}
	}

	/**
	 *  Calculates and returns
	 *  the packet's size in bytes
	 *
	 *  @return the size of the packet in bytes, including the initial
	 *			osc command and aligned to 4-byte boundary. this
	 *			is the amount of bytes written by the <code>encode</code>
	 *			method.
	 *	 
	 *  @throws IOException if an error occurs during the calculation
	 */
	public int getSize( OSCPacket p )
	throws IOException
	{
		if( p instanceof OSCBundle ) {
			return getBundleSize( (OSCBundle) p );
		} else {
			return getMessageSize( (OSCMessage) p );
		}
	}
	
	protected int getBundleSize( OSCBundle bndl )
	throws IOException
	{
		synchronized( bndl.collPackets ) {
			int result = bndlIdentifier.length + 8 + (bndl.collPackets.size() << 2); // name, timetag, size of each bundle element

			for( int i = 0; i < bndl.collPackets.size(); i++ ) {
				result += getSize( ((OSCPacket) bndl.collPackets.get( i )));
			}

			return result;
		}
	}
	
	/**
	 *	Calculates the byte size of the encoded message
	 *
	 *	@return	the size of the OSC message in bytes
	 *
	 *	@throws IOException	if the message contains invalid arguments
	 */
	protected int getMessageSize( OSCMessage msg )
	throws IOException
	{
		final int	numArgs = msg.getArgCount();
		int			result  = ((msg.getName().length() + 4) & ~3) + ((1+numArgs + 4) & ~3);
		Object		o;
		Class		cl;
//		Class		oldCl	= null;
//		Atom		a		= null;
		int			j;
		
		for( int i = 0; i < numArgs; i++ ) {
			o	= msg.getArg( i );
			cl	= o.getClass();
			j	= 0;
			try {
				while( atomEncoderC[ j ] != cl ) j++;
//				a = (Atom) atomEncoders.get( cl );
//				result += a.getAtomSize( o );
				result += atomEncoderA[ j ].getAtomSize( o );
			}
			catch( NullPointerException e1 ) {
				throw new OSCException( OSCException.JAVACLASS, cl.getName() );
			}
		}
		
		return result;
	}

	protected OSCBundle decodeBundle( ByteBuffer b )
	throws IOException
	{
		final OSCBundle	bndl        = new OSCBundle();
		final int		totalLimit  = b.limit();

		bndl.setTimeTagRaw( b.getLong() );

		try {
			while( b.hasRemaining() ) {
				b.limit( b.getInt() + b.position() );   // msg size
//				bndl.addPacket( OSCPacket.decode( b, m ));
				bndl.addPacket( decode( b ));
				b.limit( totalLimit );
			}
			return bndl;
		}
		catch( IllegalArgumentException e1 ) {	// throws by b.limit if bundle size is corrupted
			throw new OSCException( OSCException.FORMAT, e1.getLocalizedMessage() );
		}
	}

	/**
	 *  Creates a new message with arguments decoded
	 *  from the ByteBuffer. Usually you call
	 *  <code>decode</code> from the <code>OSCPacket</code> 
	 *  superclass which will invoke this method of
	 *  it finds an OSC message.
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
	 *  @throws BufferUnderflowException	in case of a parsing
	 *										error that causes the
	 *										method to read past the buffer limit
	 *  @throws IllegalArgumentException	occurs in some cases of buffer underflow
	 */
	protected OSCMessage decodeMessage( String command, ByteBuffer b )
	throws IOException
	{	
		final Object[]		args;
		final int			numArgs;
		final ByteBuffer	b2;
		final int			pos1;
//		int					pos1, pos2;
		byte				typ	= 0;
		
		if( b.get() != 0x2C ) throw new OSCException( OSCException.FORMAT, null );
		b2		= b.slice();	// faster to slice than to reposition all the time!
		pos1	= b.position();
//		b2.position( pos1 );
//		pos1	= b.position();
//		OSCPacket.skipToValues( b );
		while( b.get() != 0x00 ) ;
		numArgs	= b.position() - pos1 - 1;
		args	= new Object[ numArgs ];
		skipToAlign( b );
//		pos2	= (b.position() + 3) & ~3;
	
		try {
			for( int argIdx = 0; argIdx < numArgs; argIdx++ ) {
				typ = b2.get();
//				if( typ == 0 ) break;
				args[ argIdx ] = atomDecoders[ typ ].decodeAtom( typ, b );
			}
		} catch (NullPointerException e1 ) {
			throw new OSCException( OSCException.TYPETAG, String.valueOf( (char) typ ));
		}
//System.err.println( "done. numArgs = "+args.length );
		return new OSCMessage( command, args );
	}
	
	protected void encodeBundle( OSCBundle bndl, ByteBuffer b )
	throws IOException
	{
		int	pos1, pos2;

		b.put( bndlIdentifier ).putLong( bndl.getTimeTag() );
		
		synchronized( bndl.collPackets ) {
			for( int i = 0; i < bndl.collPackets.size(); i++ ) {
				b.mark();
				b.putInt( 0 );			// calculate size later
				pos1 = b.position();
				encode( (OSCPacket) bndl.collPackets.get( i ), b );
				pos2 = b.position();
				b.reset();
				b.putInt( pos2 - pos1 ).position( pos2 );			
			}
		}
	}

	/**
	 *	Encodes the message onto the given <code>ByteBuffer</code>,
	 *	beginning at the buffer's current position. To write the
	 *	encoded message, you will typically call <code>flip()</code>
	 *	on the buffer, then <code>write()</code> on the channel.
	 *
	 *  @param  b		<code>ByteBuffer</code> pointing right at
	 *					the beginning of the osc packet.
	 *					buffer position will be right after the end
	 *					of the message when the method returns.
	 *
	 *  @throws IOException			in case some of the
	 *								writing procedures failed
	 *								(buffer overflow, illegal arguments).
	 */
	protected void encodeMessage( OSCMessage msg, ByteBuffer b )
	throws BufferOverflowException, IOException
	{
		final int			numArgs = msg.getArgCount(); // args.length;
		final ByteBuffer	b2;
//		int					pos1, pos2;
		int					j;
		Object				o		= null;
		Class				cl		= null;
//		Class				oldCl	= null;
		Atom				a		= null;
		
		b.put( msg.getName().getBytes() );
		terminateAndPadToAlign( b );
		// it's important to slice at a 4-byte boundary because
		// the position will become 0 and terminateAndPadToAlign
		// will be malfunctioning otherwise
		b2		= b.slice();
		b2.put( (byte) 0x2C );		// ',' to announce type string
		b.position( b.position() + ((numArgs + 5) & ~3) );	// comma + numArgs + zero + align
		try {
			for( int i = 0; i < numArgs; i++ ) {
				o	= msg.getArg( i );
				cl	= o.getClass();
				j	= 0;
				while( atomEncoderC[ j ] != cl ) j++;
				a	= atomEncoderA[ j ];
				a.encodeAtom( o, b2, b );
			}
		}
		catch( NullPointerException e1 ) {
			throw new OSCException( OSCException.JAVACLASS, o == null ? "null" : cl.getName() );
		}
		terminateAndPadToAlign( b2 );
	}

	/**
	 *  Reads a null terminated string from
	 *  the current buffer position
	 *
	 *  @param  b   buffer to read from. position and limit must be
	 *				set appropriately. new position will be right after
	 *				the terminating zero byte when the method returns
	 *  
	 *  @throws BufferUnderflowException	in case the string exceeds
	 *										the provided buffer limit
	 */
	public static String readString( ByteBuffer b )
	{
		final int		pos = b.position();
		final byte[]	bytes;
//		int len = 1;
		while( b.get() != 0 ) ; // len++;
		final int len = b.position() - pos;
		bytes = new byte[ len ];
		b.position( pos );
		b.get( bytes );
		return new String( bytes, 0, len - 1 );
	}

	/**
	 *  Adds as many zero padding bytes as necessary to
	 *  stop on a 4 byte alignment. if the buffer position
	 *  is already on a 4 byte alignment when calling this
	 *  function, another 4 zero padding bytes are added.
	 *  buffer position will be on the new aligned boundary
	 *  when return from this method
	 *
	 *  @param  b   the buffer to pad
	 *  
	 *  @throws BufferOverflowException		in case the padding exceeds
	 *										the provided buffer limit
	 */
	public static void terminateAndPadToAlign( ByteBuffer b )
	{
		b.put( pad, 0, 4 - (b.position() & 0x03) );
	}
	
	/**
	 *  Adds as many zero padding bytes as necessary to
	 *  stop on a 4 byte alignment. if the buffer position
	 *  is already on a 4 byte alignment when calling this
	 *  function, this method does nothing.
	 *
	 *  @param  b   the buffer to align
	 *  
	 *  @throws BufferOverflowException		in case the padding exceeds
	 *										the provided buffer limit
	 */
	public static void padToAlign( ByteBuffer b )
	{
		b.put( pad, 0, -b.position() & 0x03 );  // nearest 4-align
	}

	/**
	 *  Advances in the buffer as long there
	 *  are non-zero bytes, then advance to a
	 *  four byte alignment.
	 *
	 *  @param  b   the buffer to advance
	 *  
	 *  @throws BufferUnderflowException	in case the reads exceed
	 *										the provided buffer limit
	 *  @throws IllegalArgumentException	in case the skipping exceeds
	 *										the provided buffer limit
	 */
	public static void skipToValues( ByteBuffer b )
	throws BufferUnderflowException
	{
		while( b.get() != 0x00 ) ;
		b.position( (b.position() + 3) & ~3 );
	}

	/**
	 *  Advances the current buffer position
	 *  to an integer of four bytes. The position
	 *  is not altered if it is already
	 *  aligned to a four byte boundary.
	 *  
	 *  @param  b   the buffer to advance
	 *  
	 *  @throws IllegalArgumentException	in case the skipping exceeds
	 *										the provided buffer limit
	 */
	public static void skipToAlign( ByteBuffer b )
	{
        b.position( (b.position() + 3) & ~3 );
	}

	// abstract class is a bit faster than interface!
//	public static interface Atom
	/**
	 * 	The <code>Atom</code> class represents a combination of
	 * 	an encoder and decoder of a Java respectively OSC atom.
	 * 	While typically an <code>Atom</code> does a one-to-one
	 * 	mapping between a single Java class and a single OSC
	 * 	type tag, other mappings are possible, such as different
	 * 	type tags for the same Java class, or decoding the
	 * 	same typetag into different Java classes.
	 * 	<p>
	 * 	An example of the <B>first case</B> would be a colour atom:
	 *	The <code>decodeAtom</code> method would require a
	 *	<code>'r'</code> typetag and return a <code>java.awt.Color</code>
	 *	object, with a body similar to this:
	 *	<PRE>
	 *		return new java.awt.Color( b.getInt(), true );
	 *	</PRE>
	 *	The <code>encodeAtom</code> and <code>getTypeTag</code>
	 *	methods would require its argument to be a <code>java.awt.Color</code>,
	 *	<code>getTypeTag</code> would return <code>'r'</code>,
	 *	<code>getAtomSize</code> would return <code>4</code>, and
	 *	<code>encodeAtom</code> would do something like
	 *	<pre>
	 *		tb.put( (byte) 'r' );
	 *		db.putInt( ((java.awt.Color) o).getRGB() );
	 *	</pre>
	 *	<p>
	 *	And example of the <B>latter case</B> (one-to-many mapping) would be
	 *	a codec for the <code>'T'</code> (&quot;true&quot;) and <code>'F'</code>
	 *	(&quot;false&quot;) typetags. This codec would be registered once
	 *	as an encoder, using <code>putEncoder( Boolean.class, myAtomCodec )</code>,
	 *	and twice as a decoder, using <code>putDecoder( (byte) 'F', myAtomCodec )</code>
	 *	and <code>putDecoder( (byte) 'T', myAtomCodec )</code>. The codec's
	 *	<code>getAtomSize</code> method would return <code>0</code>, <code>getTypeTag</code>
	 *	would return
	 *	<pre>
	 *		((Boolean) o).booleanValue() ? (byte) 'T' : (byte) 'F'
	 *	</pre>
	 *	<code>decodeAtom</code> would return
	 *	<pre>
	 *		Boolean.valueOf( typeTag == (byte) 'T' )
	 *	</pre>
	 *	and finally <code>encodeAtom</code> would be:
	 *	<pre>
	 *		tb.put( this.getTypeTag( o ));
	 *	</pre>
	 *
	 *	@see	OSCPacketCodec#putDecoder( byte, de.sciss.net.OSCPacketCodec.Atom )
	 *	@see	OSCPacketCodec#putEncoder( java.lang.Class, de.sciss.net.OSCPacketCodec.Atom ) 
	 */
	public static abstract class Atom
	{
		public abstract Object decodeAtom( byte typeTag, ByteBuffer b ) throws IOException;
		public abstract void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db ) throws IOException;
		public abstract byte getTypeTag( Object o );
		public abstract int getAtomSize( Object o ) throws IOException;
	}
	
	private class IntegerAtom
//	implements Atom
	extends Atom
	{
		protected IntegerAtom() { /* empty */ }
		
		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
// requires Java 1.5+
//			return Integer.valueOf( b.getInt() );
			return new Integer( b.getInt() );
		}
		
		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			tb.put( (byte) 0x69 );	// 'i'
			db.putInt( ((Integer) o).intValue() );
		}
		
		public byte getTypeTag( Object o )
		{
			return 0x69;	// 'i'
		}
		
		public int getAtomSize( Object o )
		throws IOException
		{
			return 4;
		}
	}

	private class FloatAtom
//	implements Atom
	extends Atom
	{
		protected FloatAtom() { /* empty */ }

		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
//			 requires Java 1.5+
//			return Float.valueOf( b.getFloat() );
			return new Float( b.getFloat() );
		}
		
		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			tb.put( (byte) 0x66 );	// 'f'
			db.putFloat( ((Float) o).floatValue() );
		}
		
		public byte getTypeTag( Object o )
		{
			return 0x66;	// 'f'
		}

		public int getAtomSize( Object o )
		throws IOException
		{
			return 4;
		}
	}

	private class LongAtom
//	implements Atom
	extends Atom
	{
		protected LongAtom() { /* empty */ }

		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
//			 requires Java 1.5+
//			return Long.valueOf( b.getLong() );
			return new Long( b.getLong() );
		}
		
		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			tb.put( (byte) 0x68 );	// 'h'
			db.putLong( ((Long) o).longValue() );
		}
		
		public byte getTypeTag( Object o )
		{
			return 0x68;	// 'h'
		}

		public int getAtomSize( Object o )
		throws IOException
		{
			return 8;
		}
	}

	private class DoubleAtom
//	implements Atom
	extends Atom
	{
		protected DoubleAtom() { /* empty */ }

		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
//			 requires Java 1.5+
//			return Double.valueOf( b.getDouble() );
			return new Double( b.getDouble() );
		}
		
		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			tb.put( (byte) 0x64 );	// 'd'
			db.putDouble( ((Double) o).doubleValue() );
		}

		public byte getTypeTag( Object o )
		{
			return 0x64;	// 'd'
		}

		public int getAtomSize( Object o )
		throws IOException
		{
			return 8;
		}
	}

	private class DoubleAsFloatAtom
//	implements Atom
	extends Atom
	{
		protected DoubleAsFloatAtom() { /* empty */ }

		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
//			 requires Java 1.5+
//			return Float.valueOf( (float) b.getDouble() );
			return new Float( b.getDouble() );
		}
		
		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			tb.put( (byte) 0x66 );	// 'f'
			db.putFloat( ((Double) o).floatValue() );
		}

		public byte getTypeTag( Object o )
		{
			return 0x66;	// 'f'
		}

		public int getAtomSize( Object o )
		throws IOException
		{
			return 4;
		}
	}

	private class LongAsIntegerAtom
//	implements Atom
	extends Atom
	{
		protected LongAsIntegerAtom() { /* empty */ }
		
		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
//			 requires Java 1.5+
//			return Integer.valueOf( (int) b.getLong() );
			return new Integer( (int) b.getLong() );
		}
		
		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			tb.put( (byte) 0x69 );	// 'i'
			db.putInt( ((Long) o).intValue() );
		}

		public byte getTypeTag( Object o )
		{
			return 0x69;	// 'i'
		}

		public int getAtomSize( Object o )
		throws IOException
		{
			return 4;
		}
	}

	private class StringAtom
//	implements Atom
	extends Atom
	{
//		private String		lastString;
////		private ByteBuffer	lastBuf;
//		private byte[]		lastBuf;
		
		protected StringAtom() { /* empty */ }

		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
			final int		pos1	= b.position();
//			final int		lim		= b.limit();
			final String	s;
			final int		pos2;
			final byte[]	bytes; 
			final int		len;
			while( b.get() != 0 ) ;
			pos2	= b.position() - 1;
//			b.limit( pos2 - 1 );
			b.position( pos1 );
//final byte[] test = new byte[ b.limit() - pos ];
//b.get( test );
//s = new String( test );
//			s = charsetDecoder.decode( b ).toString();
			len		= pos2 - pos1;
			bytes	= new byte[ len ];
			b.get( bytes, 0, len );
			s		= new String( bytes, charsetName );
//			b.limit( lim );
			b.position( (pos2 + 4) & ~3 );
//			skipToAlign( b );
			return s;
		}
		
		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			tb.put( (byte) 0x73 );					// 's'
			final String s = (String) o;			// cassting seems tp be faster tan toString()!
			db.put( s.getBytes( charsetName ));		// faster than using Charset or CharsetEncoder
			terminateAndPadToAlign( db );
		}
		
		public byte getTypeTag( Object o )
		{
			return 0x73;	// 's'
		}

		public int getAtomSize( Object o )
		throws IOException
		{
			final String s = (String) o;
			return( (s.getBytes( charsetName ).length + 4) & ~3 );
		}
	}

	private class BlobAtom
//	implements Atom
	extends Atom
	{
		protected BlobAtom() { /* empty */ }

		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
			final byte[] blob = new byte[ b.getInt() ];
			b.get( blob );
			skipToAlign( b );
			return blob;
		}
		
		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			final byte[] blob = (byte[]) o;
			tb.put( (byte) 0x62 );	// 'b'
			db.putInt( blob.length );
			db.put( blob );
			padToAlign( db );
		}

		public byte getTypeTag( Object o )
		{
			return 0x62;	// 'b'
		}

		public int getAtomSize( Object o )
		throws IOException
		{
			return( (((byte[]) o).length + 7) & ~3 );
		}
	}

	private class PacketAtom
//	implements Atom
	extends Atom
	{
		protected PacketAtom() { /* empty */ }

		public Object decodeAtom( byte typeTag, ByteBuffer b )
		throws IOException
		{
			throw new IOException( "Not supported" );
		}

		public void encodeAtom( Object o, ByteBuffer tb, ByteBuffer db )
		throws IOException
		{
			tb.put( (byte) 0x62 );	// 'b'
			final int pos = db.position();
			final int pos2 = pos + 4;
			db.position( pos2 );
			encode( (OSCPacket) o, db ); // XXX
			db.putInt( pos, db.position() - pos2 );
		}

		public byte getTypeTag( Object o )
		{
			return 0x62;	// 'b'
		}
		
		public int getAtomSize( Object o )
		throws IOException
		{
			return( getSize( (OSCPacket) o ) + 4 );
		}
	}
}
