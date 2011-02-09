//
//  MIDI.h
//  PhoneGap
//
//  Created by thecharlie on 12/5/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreMIDI/CoreMIDI.h>
#import <CoreMIDI/MIDINetworkSession.h>
#import "PhoneGapCommand.h"

@interface MIDI : PhoneGapCommand {
	MIDINetworkHost *host;
	MIDINetworkSession *session;
	int count;
	
	MIDIPortRef outPort, inPort;
	MIDIClientRef client;
	
	MIDIEndpointRef src,dst;
	NSDictionary *midiDict;
	BOOL shouldSend;
}

@property (retain) NSDictionary * midiDict;

- (void) start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) pollJavascriptStart:(id)obj;
- (void) pollJavascript:(id)obj;

- (void) send:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
