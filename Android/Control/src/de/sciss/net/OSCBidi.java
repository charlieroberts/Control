/*
 *  OSCBidi.java
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
 *		30-Sep-06	created
 */

package de.sciss.net;

import java.io.IOException;
import java.io.PrintStream;

/**
 *	An interface describing common functionality in bidirectional OSC communicators.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.32, 02-Mar-07
 *
 *	@since		NetUtil 0.30
 */
public interface OSCBidi
extends OSCChannel
{
	/**
	 *	Starts the communicator.
	 *
	 *	@throws	IOException	if a networking error occurs
	 */
	public void start() throws IOException;

	/**
	 *	Checks whether the communicator is active (was started) or not (is stopped).
	 *
	 *	@return	<code>true</code> if the communicator is active, <code>false</code> otherwise
	 */
	public boolean isActive();

	/**
	 *	Stops the communicator.
	 *
	 *	@throws	IOException	if a networking error occurs
	 */
	public void stop() throws IOException;

	/**
	 *	Changes the way incoming messages are dumped
	 *	to the console. By default incoming messages are not
	 *	dumped. Incoming messages are those received
	 *	by the client from the server, before they
	 *	get delivered to registered <code>OSCListener</code>s.
	 *
	 *	@param	mode	see <code>dumpOSC( int )</code> for details
	 *	@param	stream	the stream to print on, or <code>null</code> which
	 *					is shorthand for <code>System.err</code>
	 *
	 *	@see	#dumpOSC( int, PrintStream )
	 *	@see	#dumpOutgoingOSC( int, PrintStream )
	 */
	public void dumpIncomingOSC( int mode, PrintStream stream );

	/**
	 *	Changes the way outgoing messages are dumped
	 *	to the console. By default outgoing messages are not
	 *	dumped. Outgoing messages are those send via
	 *	<code>send</code>.
	 *
	 *	@param	mode	see <code>dumpOSC( int )</code> for details
	 *	@param	stream	the stream to print on, or <code>null</code> which
	 *					is shorthand for <code>System.err</code>
	 *
	 *	@see	#dumpOSC( int, PrintStream )
	 *	@see	#dumpIncomingOSC( int, PrintStream )
	 */
	public void dumpOutgoingOSC( int mode, PrintStream stream );
}
