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

-(void)rescanForSources {
    MIDIEndpointRef *sources;
	CFStringRef pName;

    int i, j;
    
    ItemCount num_sources = MIDIGetNumberOfSources();
	//NSLog(@"number of sources found = %d", num_sources);
    //sources = (MIDIEndpointRef *)malloc(sizeof(MIDIEndpointRef) * num_sources);
    j = 0;
    for (i = 0; i < num_sources; i++) {
        MIDIEndpointRef source;
        source = MIDIGetSource(i);
		
		MIDIObjectGetStringProperty(source, kMIDIPropertyName, &pName);
		//NSLog(@"MIDI Object %@", (NSString *)pName);
		NSString *ipString = [NSString stringWithFormat: @"destinationManager.addMIDIDestination(\"%@\");", (NSString *)pName];
		//NSLog(ipString);
		[webView stringByEvaluatingJavaScriptFromString:ipString];
	//	sources[j++] = source;
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

- (void) start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	session = [MIDINetworkSession defaultSession];
	session.enabled = YES;
	session.connectionPolicy = MIDINetworkConnectionPolicy_Anyone; // MIDINetworkConnectionPolicy_NoOne; // 
	
	//NSLog([arguments description]);
	//[self rescanForSources];
	
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

- (void) pollJavascriptStart:(id)obj {
	//NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	while(1) {
		[self performSelectorOnMainThread:@selector(pollJavascript:) withObject:nil waitUntilDone:NO];
		[NSThread sleepForTimeInterval:MIDI_POLLING_RATE];
	}
	
	//[pool drain];
}

// form is objectName:paramNumber,val1,val2,val3|objectName:paramNumber,val1,val2,val3|objectName:paramNumber,val1,val2,val3
// form should be |type,channel,val1, ?val2|
- (void) _pollJavascript:(id)obj {
	//NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	NSString *cmdString = [webView stringByEvaluatingJavaScriptFromString:@"control.getValues()"];
	
	if(![cmdString isEqualToString:@""] && cmdString != nil) {
		//NSLog(@"cmdString = %@", cmdString);
		[webView stringByEvaluatingJavaScriptFromString:@"control.clearValuesString()"];
		NSMutableArray *objects = [[NSMutableArray alloc] initWithArray:[cmdString componentsSeparatedByString:@"|"]];
		[objects removeObjectAtIndex:0];
		int objectCount = [objects count];
		
		MIDIPacketList myList;
		myList.numPackets = 1; //objectCount;		
		for(int i = 0; i < 1; i++) {
			NSString *msg = [objects objectAtIndex:i];
			NSLog(msg);
			NSArray *bytes = [msg componentsSeparatedByString:@","];
			if([bytes count] < 3) continue;
		 
            NSString *msgType = [bytes objectAtIndex:0];
            
            MIDIPacket myMessage; 
            myMessage.timeStamp = 0;
            myMessage.length = [bytes count] - 1; // -1 becuase first data byte is msgType + channel
            
//            if([msgType isEqualToString:@"noteon"] && [[bytes objectAtIndex:3] intValue] == 0) {
//                msgType = @"noteoff";
//            }
            
            int firstByte = [[midiDict objectForKey:msgType] intValue];
            firstByte += [[bytes objectAtIndex:1] intValue];
            
            myMessage.data[0] = firstByte;
            myMessage.data[1] = [[bytes objectAtIndex:2] intValue];

            if([bytes count] > 3)
                myMessage.data[2] = [[bytes objectAtIndex:3] intValue];

            myList.packet[i] = myMessage;
            

			//MIDISend(outPort, dst, &myList);
		}
		
		//NSLog(@"before sending");
		MIDISend(outPort, dst, &myList);
		//NSLog(@"after sending");	*/	
	}
	//[pool drain];
}

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

/*
 struct             
 {
 MIDIEndpointRef		destination;
 const Byte *		data;
 UInt32				bytesToSend;
 Boolean				complete;
 Byte				reserved[3];
 MIDICompletionProc	completionProc;
 void *				completionRefCon;
 };
 */

- (void) dealloc {
	if(inPort != nil) { MIDIPortDispose(inPort); }
	if(client != nil) { MIDIClientDispose(client); }
	if(outPort != nil) { MIDIPortDispose(outPort); }	

//	[host release];
	[midiDict release];
	[super dealloc];
}


@end
