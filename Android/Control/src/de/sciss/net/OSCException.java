/*
 *  OSCException.java
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
 *		25-Jan-05	created from de.sciss.meloncillo.net.OSCException
 *		26-May-05	moved to de.sciss.net package
 */

package de.sciss.net;

import java.io.IOException;

/**
 *  Exception thrown by some OSC related methods.
 *  Typical reasons are communication timeout and
 *  buffer underflows or overflows.
 *
 *  @author		Hanns Holger Rutz
 *  @version	0.10, 26-May-05
 */
public class OSCException
extends IOException
{
    /**
	 *  causeType : communication timeout
	 */
	public static final int TIMEOUT = 0;
	/**
	 *  causeType : supercollider replies "fail"
	 */
	public static final int FAILED  = 1;
	/**
	 *  causeType : buffer overflow or underflow
	 */
	public static final int BUFFER  = 2;
	/**
	 *  causeType : osc message has invalid format
	 */
	public static final int FORMAT  = 3;
	/**
	 *  causeType : osc message has invalid or unsupported type tags
	 */
	public static final int TYPETAG  = 4;
	/**
	 *  causeType : osc message cannot convert given java class to osc primitive
	 */
	public static final int JAVACLASS  = 5;
	/**
	 *  causeType : network error while receiving osc message
	 */
	public static final int RECEIVE  = 6;
	
	private					int			causeType;
	private static final	String[]	errMessages = {
        "errOSCTimeOut", "errOSCFailed", "errOSCBuffer", "errOSCFormat",
        "errOSCTypeTag", "errOSCArgClass", "errOSCReceive"
    };
	
	/**
	 *  Constructs a new <code>OSCException</code> with
	 *  the provided type of cause (e.g. <code>TIMEOUT</code>)
	 *  and descriptive message.
	 *
	 *  @param  causeType   cause of the exception
	 *  @param  message		human readble description of the exception,
     *                      may be <code>null</code>
	 */
	public OSCException( int causeType, String message )
	{
		super( NetUtil.getResourceString( errMessages[ causeType ]) +
                (message == null ? "" : (": " + message)) );
		
		this.causeType  = causeType;
	}
	
	/**
	 *  Queries the cause of the exception
	 *
	 *  @return cause of the exception, e.g. <code>BUFFER</code>
	 *			if a buffer underflow or overflow occured
	 */
	public int getCauseType()
	{
		return causeType;
	}
	
	public String getLocalizedMessage()
	{
		return getMessage();
	}
}