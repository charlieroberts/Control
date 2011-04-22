/*
 *  NetUtilTest.java
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
 *		09-Aug-06	created
 */

package de.sciss.net.test;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import de.sciss.net.OSCBundle;
import de.sciss.net.OSCChannel;
import de.sciss.net.OSCClient;
import de.sciss.net.OSCListener;
import de.sciss.net.OSCMessage;
import de.sciss.net.OSCReceiver;
import de.sciss.net.OSCTransmitter;
//import de.sciss.net.OSCPacketCodec;
import de.sciss.net.OSCServer;

/**
 *	Some static test run methods.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.37, 12-May-09
 *
 *	@since		NetUtil 0.33
 */
public abstract class NetUtilTest
{
	protected static boolean pause = false;

	private NetUtilTest() { /* empty */ }

	/**
	 *	Tests the client functionality on a given protocol.
	 *	This assumes SuperCollider server (scsynth) is running
	 *	on the local machine, listening at the given protocol and
	 *	port 57110.
	 *
	 *	@param	protocol	<code>UDP</code> or <code>TCP</code>
	 */
	public static void client( String protocol )
	{
		postln( "NetUtilTest.client( \"" + protocol + "\" )\n" );
		postln( "talking to localhost port 57110" );
		
		final Object		sync = new Object();
		final OSCClient		c;
		OSCBundle			bndl1, bndl2;
		Integer				nodeID;
		
		try {
			c = OSCClient.newUsing( protocol );
			c.setTarget( new InetSocketAddress( InetAddress.getLocalHost(), 57110 ));
			postln( "  start()" );
			c.start();
		}
		catch( IOException e1 ) {
			e1.printStackTrace();
			return;
		}
		
		c.addOSCListener( new OSCListener() {
			public void messageReceived( OSCMessage m, SocketAddress addr, long time )
			{
				if( m.getName().equals( "/n_end" )) {
					synchronized( sync ) {
						sync.notifyAll();
					}
				}
			}
		});
		c.dumpOSC( OSCChannel.kDumpBoth, System.err );
		try {
			c.send( new OSCMessage( "/notify", new Object[] { new Integer( 1 )}));
		}
		catch( IOException e3 ) {
			e3.printStackTrace();
		}
		for( int i = 0; i < 4; i++ ) {
			bndl1	= new OSCBundle( System.currentTimeMillis() + 50 );
			bndl2	= new OSCBundle( System.currentTimeMillis() + 1550 );
			nodeID	= new Integer( 1001 + i );
			bndl1.addPacket( new OSCMessage( "/s_new", new Object[] { "default", nodeID, new Integer( 1 ), new Integer( 0 )}));
			bndl1.addPacket( new OSCMessage( "/n_set", new Object[] { nodeID, "freq", new Float( Math.pow( 2, (float) i / 6 ) * 441 )}));
			bndl2.addPacket( new OSCMessage( "/n_set", new Object[] { nodeID, "gate", new Float( -3f )}));
			try {
				c.send( bndl1 );
				c.send( bndl2 );
			
				synchronized( sync ) {
					sync.wait();
				}
			}
			catch( InterruptedException e1 ) { /* ignored */}
			catch( IOException e2 ) {
				e2.printStackTrace();
			}

//			postln( "  stopListening()" );
//			try {
//				c.stop();
//			}
//			catch( IOException e1 ) {
//				e1.printStackTrace();
//			}
		}
		try {
			c.send( new OSCMessage( "/notify", new Object[] { new Integer( 0 )}));
		}
		catch( IOException e3 ) {
			e3.printStackTrace();
		}
		
		c.dispose();
	}

	/**
	 *	Tests the server functionality on a given protocol.
	 *	This opens a server listening at port 0x5454. Recognized
	 *	messages are <code>/pause</code>, <code>/quit</code>, <code>/dumpOSC</code>.
	 *	See <code>NetUtil_Tests.rtf</code> for a way to check the server.
	 *
	 *	@param	protocol	<code>UDP</code> or <code>TCP</code>
	 */
	public static void server( String protocol )
	{
		postln( "NetUtilTest.server( \"" + protocol + "\" )\n" );
		postln( "listening at port 21588. recognized commands: /pause, /quit, /dumpOSC" );
		
		final Object	sync = new Object();
		final OSCServer c;
		try {
			c = OSCServer.newUsing( protocol, 0x5454 );
		}
		catch( IOException e1 ) {
			e1.printStackTrace();
			return;
		}
		
		c.addOSCListener( new OSCListener() {
			public void messageReceived( OSCMessage m, SocketAddress addr, long time )
			{
				try {
					postln( "send "+addr );
					c.send( new OSCMessage( "/done", new Object[] { m.getName() }), addr );
				}
				catch( IOException e1 ) {
					e1.printStackTrace();
				}
			
//				postln( "message : "+m.getName() );
				if( m.getName().equals( "/pause" )) {
					pause = true;
					synchronized( sync ) {
						sync.notifyAll();
					}
				} else if( m.getName().equals( "/quit" )) {
					synchronized( sync ) {
						sync.notifyAll();
					}
				} else if( m.getName().equals( "/dumpOSC" )) {
					c.dumpOSC( ((Number) m.getArg( 0 )).intValue(), System.err );
				}
			}
		});
		try {
			do {
				if( pause ) {
					postln( "  waiting four seconds..." );
					try {
						Thread.sleep( 4000 );
					}
					catch( InterruptedException e1 ) { /* ignored */ }
					pause = false;
				}
				postln( "  start()" );
				c.start();
				try {
					synchronized( sync ) {
						sync.wait();
					}
				}
				catch( InterruptedException e1 ) { /* ignore */ }

				postln( "  stop()" );
				c.stop();
			} while( pause );
		}
		catch( IOException e1 ) {
			e1.printStackTrace();
		}
		
		c.dispose();
	}

	/**
	 *	Tests the performance of OSCMessage encoding and decoding.
	 *	A cyclic random list of messages get decoded and encoded
	 *	for five seconds, the number of codec operations during this
	 *	interval is printed.
	 *
	 *	Benchmarks for MacBook Pro 2.0 GHz, Mac OS X 10.4.8, 1.5.0_07:
	 *	NetUtil 0.33 (build 07-May-07) vs. Illposed JavaOSC (20060402):
	 *	encoding : NetUtil roughly 220% faster
	 *	decoding : Illposed roughly 50% faster
	 *
	 *	NetUtil 0.32 vs. 0.33 are very similar, decoding is 
	 *	a few percent faster in v0.33
	 */
	public static void codecSpeed()
	{
//		final OSCPacketCodec	c		= OSCPacketCodec.getDefaultCodec();
		final ByteBuffer		b		= ByteBuffer.allocateDirect( 65536 );
		final List				args	= new ArrayList( 1024 );
		final Object[][]		argsArgs = new Object[ 1024 ][];
		final Random			rnd		= new Random( 0x1234578L );
		final ByteBuffer[]		b2		= new ByteBuffer[ 1024 ];
		byte[]					bytes	= new byte[ 16 ];
		long					t1;
		int						cnt;
		OSCMessage				msg;
		ByteBuffer				b3;
		
		postln( "Testing OSCMessage encoding speed..." );
		for( int i = 0; i < argsArgs.length; i++ ) {
			args.clear();
			for( int j = 0; j < (i % 1024); j++ ) {
				switch( j % 5 ) {
				case 0:
					args.add( new Integer( rnd.nextInt() ));
					break;
				case 1:
					args.add( new Float( rnd.nextFloat() ));
					break;
				case 2:
					args.add( new Long( rnd.nextLong() ));
					break;
				case 3:
					args.add( new Double( rnd.nextDouble() ));
					break;
				case 4:
					rnd.nextBytes( bytes );
					for( int k = 0; k < bytes.length; k++ ) bytes[ k ] = (byte) (Math.max( 32, bytes[ k ]) & 0x7F);
					args.add( new String( bytes ));
					break;
				}
			}
			argsArgs[ i ] = args.toArray();
		}
		try {
			t1 = System.currentTimeMillis();
			for( cnt = 0; (System.currentTimeMillis() - t1) < 5000; cnt++ ) {
				b.clear();
//				c.encode( new OSCMessage( "/test", args.toArray() ), b );
				new OSCMessage( "/test", argsArgs[ cnt % argsArgs.length ] ).encode(  b );
			}
			postln( String.valueOf( cnt ) + " messages encoded in 5 seconds." );
		}
		catch( IOException e1 ) { e1.printStackTrace(); }
		
		postln( "Testing OSCMessage decoding speed..." );
		try {
			for( int i = 0; i < b2.length; i++ ) {
				args.clear();
				for( int j = 0; j < (i % 1024); j++ ) {
					switch( j % 3 ) {
					case 0:
						args.add( new Integer( rnd.nextInt() ));
						break;
					case 1:
						args.add( new Float( rnd.nextFloat() ));
						break;
					case 2:
						rnd.nextBytes( bytes );
						for( int k = 0; k < bytes.length; k++ ) bytes[ k ] = (byte) (Math.max( 32, bytes[ k ]) & 0x7F);
						args.add( new String( bytes ));
						break;
					}
//					System.err.println( "arg " + args.get( args.size() - 1 ));
				}
				msg	= new OSCMessage( "/test", args.toArray() );
//				System.err.println( "msg.getSize() " + msg.getSize() );
				b3	= ByteBuffer.allocateDirect( msg.getSize() );
				msg.encode( b3 );
				b2[ i ] = b3;
			}
			t1 = System.currentTimeMillis();
			for( cnt = 0; (System.currentTimeMillis() - t1) < 5000; cnt++ ) {
				b3 = b2[ cnt % b2.length ];
				b3.clear();
				b3.position( 8 );	// have to skip msg name
				OSCMessage.decodeMessage( "/test", b3 );
			}
			postln( String.valueOf( cnt ) + " messages decoded in 5 seconds." );
		}
		catch( IOException e1 ) { e1.printStackTrace(); }
	}

	protected static volatile boolean received; 
		
	/**
	 *	Creates two receivers and two transmitters, one of each
	 *	being restricted to loopback. Sends from each transmitter
	 *	to each receiver. The expected result is that all messages
	 *	arrive except those sent from the local host transmitter
	 *	to loopback receiver (trns2 to rcv1, i.e. "five", "six").
	 */
	public static void pingPong()
	{
		final String[]	protos	= { OSCChannel.UDP, OSCChannel.TCP };
		final String[]	words	= { "One", "Two", "Three", "Four", "Five", "Six",
									"Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve" };
		final Object	sync	= new Object();
		int wordIdx = 0;
		int failures = 0;
		
		System.out.println( "\n---------- RECEIVER / TRANSMITTER ----------" );
		for( int i = 0; i < 1; i++ ) { // note: tcp requires a server socket
			final String proto = protos[ i ];
			System.out.println( "---------- Testing protocol '" + proto + "' ----------" );
			for( int j = 0; j < 4; j++ ) {
				final boolean rcvLoop		= j/2 == 0;
				final boolean trnsLoop		= j % 2 == 0;
				final boolean shouldFail	= !trnsLoop && rcvLoop;
				received = false;
				
				System.out.println( "Receiver loopBack = " + rcvLoop + "; Transmitter loopBack = " + trnsLoop );
				
				OSCReceiver		rcv		= null;
				OSCTransmitter	trns	= null;
	
				try {
					rcv		= OSCReceiver.newUsing( proto, 0, rcvLoop );
					trns	= OSCTransmitter.newUsing( proto, 0, trnsLoop );
		
					rcv.dumpOSC( OSCChannel.kDumpText, System.out );
					rcv.startListening();
					rcv.addOSCListener( new OSCListener() {
						public void messageReceived( OSCMessage msg, SocketAddress addr, long when )
						{
							System.out.println( "   Received msg '" + msg.getName() + "' from " + addr );
							synchronized( sync ) {
								received = true;
								sync.notifyAll();
							}
						}
					});
			
					trns.connect();
					final int targetPort = rcv.getLocalAddress().getPort();
					final InetSocketAddress targetAddr = trnsLoop ?
						new InetSocketAddress( "127.0.0.1", targetPort ) :
						new InetSocketAddress( InetAddress.getLocalHost(), targetPort );
					trns.setTarget( targetAddr );
					trns.send( new OSCMessage( "/test", new Object[] { words[ wordIdx ], new Integer( wordIdx + 1 )}));
						
					try {
						synchronized( sync ) {
							sync.wait( 2000 );
						}
					} catch( InterruptedException e1 ) { /* ignore */ }
				}
				catch( IOException e1 ) {
					e1.printStackTrace();
				}
				
				if( received != shouldFail ) {
					System.out.println( "... OK" );
				} else {
					System.out.println( "\n... FAILED!!!\n" );
					failures++;
				}
				
				rcv.dispose();
				trns.dispose();
				wordIdx = (wordIdx + 1) % words.length;
			}
		}
		
		System.out.println( "\n------------- CLIENT / SERVER --------------" );
		for( int i = 0; i < protos.length; i++ ) {
			final String proto = protos[ i ];
			System.out.println( "---------- Testing protocol '" + proto + "' ----------" );
			for( int j = 0; j < 4; j++ ) {
				final boolean clientLoop	= j/2 == 0;
				final boolean serverLoop	= j % 2 == 0;
				final boolean shouldFail	= !clientLoop && serverLoop;
				received = false;

				System.out.println( "Client loopBack = " + clientLoop + "; Server loopBack = " + serverLoop );

				OSCClient	client	= null;
				OSCServer	server	= null;
				
				try {
					client	= OSCClient.newUsing( proto, 0, clientLoop );
					server	= OSCServer.newUsing( proto, 0, serverLoop );
		
					server.dumpOSC( OSCChannel.kDumpText, System.out );
					server.start();
					server.addOSCListener( new OSCListener() {
						public void messageReceived( OSCMessage msg, SocketAddress addr, long when )
						{
							System.out.println( "   Received msg '" + msg.getName() + "' from " + addr );
							synchronized( sync ) {
								received = true;
								sync.notifyAll();
							}
						}
					});
			
					final int targetPort = server.getLocalAddress().getPort();
					final InetSocketAddress targetAddr = clientLoop ?
						new InetSocketAddress( "127.0.0.1", targetPort ) :
						new InetSocketAddress( InetAddress.getLocalHost(), targetPort );
					client.setTarget( targetAddr );
					client.connect();
					client.send( new OSCMessage( "/test", new Object[] { words[ wordIdx ], new Integer( wordIdx + 1 )}));
						
					try {
						synchronized( sync ) {
							sync.wait( 2000 );
						}
					} catch( InterruptedException e1 ) { /* ignore */ }
				}
				catch( IOException e1 ) {
					e1.printStackTrace();
				}

				if( received != shouldFail ) {
					System.out.println( "... OK" );
				} else {
					System.out.println( "\n... FAILED!!!\n" );
					failures++;
				}
				
				client.dispose();
				server.dispose();
				wordIdx = (wordIdx + 1) % words.length;
			}
		}
		
		System.out.println( "\nNumber of tests failed: " + failures );
	}
	
	protected static void postln( String s )
	{
		System.err.println( s );
	}
}
