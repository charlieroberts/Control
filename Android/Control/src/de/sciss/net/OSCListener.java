/*
 *  OSCListener.java
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
 *		25-Jan-05	created from de.sciss.meloncillo.net.OSCListener
 *		26-May-05	moved to de.sciss.net package
 *		11-Sep-05	before more people are starting to use the library,
 *					we'll better change the interface NOW to include the
 *					bundle's time tag information
 */

package de.sciss.net;

import java.net.SocketAddress;

/**
 *  The <code>OSCListener</code>
 *  interface is used to register
 *  a client to an <code>OSCReceiver</code>
 *  object which will be notified when
 *  an incoming message was received.
 *	<p>
 *	See <code>OSCReceiver</code> for a code example.
 *	<P>
 *	Note that these methods are typically called from the OSC receiver thread
 *	which is not the regular AWT event dispatcher thread. You may often want
 *	to defer actual code to the event thread. You can do this by adding the
 *	received messages to a list and invoking the actual code using
 *	<code>EventQueue.invokeLater()</code>. This is particularly required when
 *	dealing with GUI processes which require methods to be called in the event
 *	thread. A future version of NetUtil may include a utility deferrer class.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.24, 11-Sep-05
 *
 *  @see	OSCReceiver
 *	@see	java.awt.EventQueue#invokeLater( Runnable )
 */
public interface OSCListener
{
	/**
	 *  Called when a new OSC message
	 *  arrived at the receiving local socket.
	 *
	 *  @param  msg     the newly arrived and decoded message
     *  @param  sender  who sent the message
	 *	@param	time	the time tag as returned by <code>OSCBundle.getTimeTag()</code>
	 *					; or <code>OSCBundle.NOW</code> if no time tag was specified
	 *					or the message is expected to be processed immediately
	 */
	public void messageReceived( OSCMessage msg, SocketAddress sender, long time );
}
