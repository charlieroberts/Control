//
//  OSCManager.h
//  PhoneGap
//
//  Created by thecharlie on 5/17/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PGPlugin.h"
#include "osc/OscReceivedElements.h"
#include "osc/OscPacketListener.h"
#include "ip/UdpSocket.h"
#include "ip/IpEndpointName.h"
#include "osc/OscOutboundPacketStream.h"

class ExamplePacketListener;
@interface OSCManager : PGPlugin {
    BOOL shouldPoll;
    BOOL isOutputInitialized;
    BOOL isInputInitialized;
    
	ExamplePacketListener  * listener;
	UdpListeningReceiveSocket * s;
	NSMutableDictionary * addresses;
	
	IpEndpointName    * destinationAddress;
	UdpTransmitSocket * output;

    NSThread *pollingThread;
    
	int receivePort;
}

@property (retain) NSMutableDictionary * addresses;
@property (nonatomic) int receivePort;
- (void)oscThread;
- (void)pushInterface:(NSValue *)msgPointer;
- (void)pushDestination:(NSValue *) msgPointer;

- (void)setOSCReceivePort:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)setIPAddressAndPort:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)startReceiveThread:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)send:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)startPolling:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)stopPolling:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) pollJavascript:(id)obj;

@end
