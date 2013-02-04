//
//  MIDI.m
//  PhoneGap
//
//  Created by thecharlie on 12/5/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import "MIDI.h"

#define MIDI_POLLING_RATE .003

#define NoteOn    0x90
#define NoteOff   0x80
#define CC        0xb0
#define PitchBend 0xe0
#define as        0xfe
#define clock     0xf8
#define PgmChange 0xc0
#define Sysex     0xf0

MIDI *me;
static void notifyProc(const MIDINotification *message, void *refCon) {// if MIDI setup is changed
    // TODO: Notify users when MIDI connections are broken
}

static void readProc(const MIDIPacketList *pktlist, void *refCon, void *connRefCon) {
	NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	MIDIPacket *packet = (MIDIPacket *)pktlist->packet; 

  // most (all?) normal MIDI messages are less than 4 bytes long and i can't 
  // find any way to ask if this is a SysEx packet, so this is a hack. we assume
  // that if the packet length is > 3, then this is a SysEx message. also, this
  // does not handle the case where a SysEx message has been broken into many
  // packets. a SysEx message is basically just a list of bytes. here we build
  // up a js array of ints (e.g. [1,2,3]) and pass it to processSysExMessage().
  //   -- karl yerkes
  if (packet->length > 3) {
    NSMutableString* mutableString = [NSMutableString
      stringWithFormat:@"midiManager.processSysExMessage([%d",
      packet->data[0]];
    for (int i = 1; i < packet->length; ++i)
      [mutableString appendFormat:@",%d", (int)packet->data[i]];
    [mutableString appendFormat:@"]);"];

    [me.webView
      performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:)
      withObject:mutableString
      waitUntilDone:NO];

    [pool drain];
    return; // exit this function
  }
	
	int packetStart = packet->data[0];
	int channel = (packetStart &= 15) + 1;
	NSString *msgType;
	
	for (NSString *key in me.midiDict ) {
		int byte = (int)[[me.midiDict objectForKey:key] intValue];
		if(byte == packet->data[0] - (channel - 1)) {
			msgType = key;
			break;
		}
	}
	
	int number = packet->data[1];
	int value = -1;
	if(packet->length == 3)
		value = packet->data[2];

	NSString * jsString = [NSString stringWithFormat:@"midiManager.processMIDIMessage(\"%s\", %d, %d, %d);", [msgType UTF8String], channel, number, value];	
	[me.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString waitUntilDone:NO];
	
	[pool drain];
}

@implementation MIDI
@synthesize midiDict;
- (PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView {	
	if(self = [super init]) {
		shouldSend = NO;
		midiDict = [[NSDictionary alloc] initWithObjectsAndKeys:INT(NoteOn), @"noteon",
					INT(NoteOff), @"noteoff",
					INT(CC), @"cc",
					INT(PitchBend), @"pitchbend",
					INT(PgmChange), @"programchange",
                    INT(Sysex), @"sysex",
					nil];
		[self setWebView:theWebView];
	}
	me = self;
	return self;
}

- (void) start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	session = [MIDINetworkSession defaultSession];
    NSLog(@"SESSION NAME = %@", session.localName);
	session.enabled = YES;
	session.connectionPolicy = MIDINetworkConnectionPolicy_Anyone; // MIDINetworkConnectionPolicy_NoOne; // 
    NSLog(@"session.contacts = %@", session.contacts);

	//NSLog([arguments description]);
	[self browse:nil withDict:nil];
	
	OSStatus err;
	
	if(client != nil) { MIDIClientDispose(client); }
	
	err = MIDIClientCreate(CFSTR("TEST"), notifyProc, self, &client);
	if(err != noErr) { NSLog(@"CLIENT ERROR"); }
	
	if(inPort != nil) { MIDIPortDispose(inPort); }
	err = MIDIInputPortCreate(client, CFSTR("Input Port"), readProc, self, &inPort);
	if(err != noErr) { NSLog(@"INPUT CREATE ERROR"); }
	
	if(outPort != nil) { MIDIPortDispose(outPort); }	
	err = MIDIOutputPortCreate(client, CFSTR("Output Port"), &outPort);
	if(err != noErr) { NSLog(@"OUTPUT CREATE ERROR"); }
	
	//BOOL connectTest = [session addConnection:connection];
}

- (void) browse:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    CFStringRef pName;

    ItemCount num_dest = MIDIGetNumberOfDestinations();
    
    for (int i = 0; i < num_dest; i++) {
        MIDIEndpointRef dest = MIDIGetDestination(i);
		
		MIDIObjectGetStringProperty(dest, kMIDIPropertyName, &pName);
        NSString *n = (NSString *)pName;
        if([n isEqualToString:@"Session 1"]) continue;
		NSString *ipString = [NSString stringWithFormat: @"destinationManager.addMIDIDestination(\"%@\");", (NSString *)pName];
		NSLog(@"%@", ipString);
        [webView stringByEvaluatingJavaScriptFromString:ipString];
    }
}

- (void) connect:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	NSString *midiIP = [arguments objectAtIndex:1];
	int port = [[arguments objectAtIndex:2] intValue];
	
    //NSLog(@"ip = %@, port = %d", midiIP, port);
	host = [MIDINetworkHost hostWithName:@"Control" address:midiIP port:port];	
	MIDINetworkConnection *connection = [MIDINetworkConnection connectionWithHost:host];
	
	BOOL connectTest = [session addConnection:connection];
	
	src = [session sourceEndpoint];
	dst = [session destinationEndpoint];
	MIDIPortConnectSource(inPort, src, NULL);
	
	if(shouldSend == NO) {
		shouldSend = YES;
		[NSThread detachNewThreadSelector:@selector(pollJavascriptStart:) toTarget:self withObject:nil];
	}
}

- (void) connectMIDI:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    CFStringRef pName;
    //NSLog(@"CONNECTING HARDWARE MIDI %@", [arguments objectAtIndex:0]);
    
    ItemCount num_sources = MIDIGetNumberOfDestinations();
	NSLog(@"number of sources found = %d", num_sources);
    //sources = (MIDIEndpointRef *)malloc(sizeof(MIDIEndpointRef) * num_sources);
    for (int i = 0; i < num_sources; i++) {
        MIDIEndpointRef source;
        source = MIDIGetDestination(i);
		
		MIDIObjectGetStringProperty(source, kMIDIPropertyName, &pName);
        NSLog(@"DESTINATION %@", (NSString *)pName);
        if([[arguments objectAtIndex:0] isEqualToString:(NSString *)pName]) {
            //NSLog(@"CONNECTING");
            [self connectSourceWithName:(NSString *)pName];
            dst = source;
            if(shouldSend == NO) {
                shouldSend = YES;
                [NSThread detachNewThreadSelector:@selector(pollJavascriptStart:) toTarget:self withObject:nil];
            }
            break;
        }
    }
}

- (void) connectSourceWithName:(NSString *)sourceName {
    CFStringRef pName;
    //NSLog(@"CONNECTING HARDWARE MIDI %@", sourceName);
    
    ItemCount num_sources = MIDIGetNumberOfSources();

    for (int i = 0; i < num_sources; i++) {
        MIDIEndpointRef source;
        source = MIDIGetSource(i);
		
		MIDIObjectGetStringProperty(source, kMIDIPropertyName, &pName);
        //NSLog(@"Source %@", (NSString *)pName);
        if([sourceName isEqualToString:(NSString *)pName]) {
            //NSLog(@"CONNECTING");
            src = source;
            MIDIPortConnectSource(inPort, src, NULL);
            break;
        }
    }
}

- (void) pollJavascriptStart:(id)obj {
	//NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	while(1) {
		[self performSelectorOnMainThread:@selector(pollJavascript:) withObject:nil waitUntilDone:NO];
		[NSThread sleepForTimeInterval:MIDI_POLLING_RATE];
	}
	
	//[pool drain];
}

// form is objectName:paramNumber,val1,val2,val3|objectName:paramNumber,val1,val2,val3|objectName:paramNumber,val1,val2,val3
// form should be |type,channel,val1,?val2|
- (void) pollJavascript:(id)obj {
	NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	NSString *cmdString = [webView stringByEvaluatingJavaScriptFromString:@"control.getValues()"];
	
	if(![cmdString isEqualToString:@""] && cmdString != nil) {
		//NSLog(@"cmdString = %@", cmdString);
	
		[webView stringByEvaluatingJavaScriptFromString:@"control.clearValuesString()"];
		NSMutableArray *objects = [[NSMutableArray alloc] initWithArray:[cmdString componentsSeparatedByString:@"|"]];
		
		[objects removeObjectAtIndex:0];
		int objectCount = [objects count];

		for(int i = 0; i < objectCount; i++) {
			MIDIPacketList myList;
			myList.numPackets = 1;
			NSString *msg = [objects objectAtIndex:i];
			
			NSArray *bytes = [msg componentsSeparatedByString:@","];
			if([bytes count] < 3) continue;
            
			MIDIPacket myMessage; 
			myMessage.timeStamp = 0;
			myMessage.length = [bytes count] - 1; // -1 becuase first data byte is msgType + channel
			
			NSString *msgType = [bytes objectAtIndex:0];
            if([msgType isEqualToString:@"noteon"] && [[bytes objectAtIndex:3] intValue] == 0) {
                msgType = @"noteoff";
            }
            
			int firstByte = [[midiDict objectForKey:msgType] intValue];
			firstByte += [[bytes objectAtIndex:1] intValue];
			
			myMessage.data[0] = firstByte;
			myMessage.data[1] = [[bytes objectAtIndex:2] intValue];

			if([bytes count] > 3)
				myMessage.data[2] = [[bytes objectAtIndex:3] intValue];

			myList.packet[0] = myMessage;

			MIDISend(outPort, dst, &myList);
		}
	}
	[pool drain];
}

void MyCompletionProc(MIDISysexSendRequest *request) {
//    free(request->data); // HOW DOES DATA GET FREED? AUTOMATICALLY?
    free(request);
};
- (void)send:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	MIDIPacketList myList;
	myList.numPackets = 1;
	
	MIDIPacket myMessage; 
    myMessage.timeStamp = 0;
    myMessage.length = [arguments count] - 1;
	
    //NSLog(@"midi type = %@", [arguments objectAtIndex:0]);
    int msgType = [[midiDict objectForKey:[arguments objectAtIndex:0]] intValue];

    if(msgType != Sysex) {
        //NSLog(@"msgType = %d, value = %d", msgType, [[arguments objectAtIndex:1] intValue] - 1);
        myMessage.data[0] = msgType + [[arguments objectAtIndex:1] intValue] - 1;
        myMessage.data[1] = [[arguments objectAtIndex:2] intValue];
        
        if (myMessage.length > 2) 
            myMessage.data[2] = [[arguments objectAtIndex:3] intValue];
        
        myList.packet[0] = myMessage;
        
        MIDISend(outPort, dst, &myList);
    }else{
        NSMutableString *data = [NSMutableString stringWithString:[arguments objectAtIndex:1]];
        [data deleteCharactersInRange:NSMakeRange(0, 1)];
        [data deleteCharactersInRange:NSMakeRange([data length] - 1, 1)];
        
        Byte * charData = malloc(sizeof(Byte) * [data length]);
        
        NSArray *charArray = [data componentsSeparatedByString:@","];
        
        for(int i = 0; i < [charArray count]; i++) {
            int _i = [[charArray objectAtIndex:i] intValue];
            charData[i] = (Byte)_i;
        }
        
        MIDISysexSendRequest * sysex = malloc(sizeof(MIDISysexSendRequest));
        sysex->destination = dst;
        sysex->data = charData;
        sysex->bytesToSend = 11; //[[arguments objectAtIndex:2]  intValue];
        sysex->complete = false;
        sysex->completionProc = MyCompletionProc;
        sysex->completionRefCon = sysex;
        MIDISendSysex(sysex);
    }
}

- (void) dealloc {
	if(inPort != nil) { MIDIPortDispose(inPort); }
	if(client != nil) { MIDIClientDispose(client); }
	if(outPort != nil) { MIDIPortDispose(outPort); }	

//	[host release];
	[midiDict release];
	[super dealloc];
}


@end
