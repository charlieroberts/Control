    //
//  OSCManager.m
//  PhoneGap
//
//  Created by thecharlie on 5/17/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import "OSCManager.h"
#import "PhoneGapDelegate.h"

#define OSC_RECEIVE_PORT 8080
#define OSC_POLLING_RATE .003
#define OUTPUT_BUFFER_SIZE 1024

OSCManager *_oscManager;

class ExamplePacketListener : public osc::OscPacketListener {
protected:

    virtual void ProcessMessage( const osc::ReceivedMessage& m, const IpEndpointName& remoteEndpoint ) {
		NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
		NSString *oscAddress = [NSString stringWithUTF8String:m.AddressPattern()];
		if([_oscManager.addresses objectForKey:oscAddress] != nil) {
			[_oscManager performSelector:NSSelectorFromString([_oscManager.addresses objectForKey:oscAddress]) withObject:[NSValue valueWithPointer:&m]];
		}else{
			osc::ReceivedMessage::const_iterator arg = m.ArgumentsBegin();
			NSMutableString *jsString = [NSMutableString stringWithFormat:@"Control.oscManager.processOSCMessage(\"%s\", \"%s\", ", m.AddressPattern(), m.TypeTags(), nil];
            
			const char * tags = m.TypeTags();

			for(int i = 0; i < m.ArgumentCount(); i++) {
					switch(tags[i]) {
						case 'f':
                            [jsString appendString:[NSString stringWithFormat:@"%f", (arg++)->AsFloat()]];
						break;
                        case 'i':
                            [jsString appendString:[NSString stringWithFormat:@"%i", (arg++)->AsInt32()]];						
						break;
					case 's':
                            [jsString appendString:[NSString stringWithFormat:@"\"%s\"", (arg++)->AsString()]];
						break;
					default:
						break;
				}
				if(i != m.ArgumentCount() - 1) [jsString appendString:@","];
			}
			
			[jsString appendString:@");"];
			[_oscManager.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString waitUntilDone:NO];
		}
		[pool drain];
	}
};

@implementation OSCManager
@synthesize addresses, receivePort;

- (PGPlugin*) initWithWebView:(UIWebView*)theWebView {

	if(self = (OSCManager *)[super initWithWebView:theWebView]) {
        isOutputInitialized = NO;
        isInputInitialized = NO;        
        shouldPoll = NO;
		listener = new ExamplePacketListener();
        self.receivePort = -1;
        // TODO: the below line should happen with the preferences manager looks up the osc receive port, not automatically
		//[NSThread detachNewThreadSelector:@selector(oscThread) toTarget:self withObject:nil];
		[NSThread detachNewThreadSelector:@selector(pollJavascriptStart:) toTarget:self withObject:nil];
		
		NSArray * keys = [NSArray arrayWithObjects:@"/pushInterface", @"/pushDestination", @"/control/pushInterface", @"/control/pushDestination", nil];
		NSArray * objects = [NSArray arrayWithObjects:NSStringFromSelector(@selector(pushInterface:)), NSStringFromSelector(@selector(pushDestination:)), NSStringFromSelector(@selector(pushInterface:)), NSStringFromSelector(@selector(pushDestination:)), nil];
		addresses = [[NSMutableDictionary alloc] initWithObjects:objects forKeys:keys];		
	}
	_oscManager = self;
	return self;
}

- (void)oscThread {
	s = new UdpListeningReceiveSocket( IpEndpointName( IpEndpointName::ANY_ADDRESS, self.receivePort ),listener );
	s->RunUntilSigInt();
}

- (void)setOSCReceivePort:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    //NSLog([arguments description]);
    //NSLog(@"CALLED %d %d", self.receivePort, [[arguments objectAtIndex:1] intValue]);
	if([[arguments objectAtIndex:1] intValue] != self.receivePort || !isInputInitialized) {
        if (s != NULL) {
            //NSLog(@"deleting socket");
            s->AsynchronousBreak();
            //delete(s);   // causes error for some reason...
        }
        //NSLog(@"started with %d",[[arguments objectAtIndex:0] intValue]);
        isInputInitialized = YES;
		self.receivePort = [[arguments objectAtIndex:1] intValue];
		[NSThread detachNewThreadSelector:@selector(oscThread) toTarget:self withObject:nil];
	}
}

- (void)pushInterface:(NSValue *)msgPointer {
    //NSLog(@"PUSH INTERFACE");
   osc::ReceivedMessage& msg = *(osc::ReceivedMessage *)[msgPointer pointerValue];
   try{
		osc::ReceivedMessageArgumentStream args = msg.ArgumentStream();
		osc::ReceivedMessage::const_iterator arg = msg.ArgumentsBegin();
				
		if(msg.ArgumentCount() == 1) { // push interface ony
			const char * a1;
			args >> a1 >> osc::EndMessage;
				
			NSMutableString *jsStringStart = [NSMutableString stringWithUTF8String:a1];
			
			[jsStringStart replaceOccurrencesOfString:@"\n" withString:@"" options:1 range:NSMakeRange(0, [jsStringStart length])]; // will not work with newlines present
			
			NSString *jsString = [NSString stringWithFormat:@"Control.interfaceManager.pushInterface('%@')", jsStringStart];

			[self.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString waitUntilDone:NO];
		}else{	// push interface + destination;
            //NSLog(@"push interface 2");
			const char * a1, *a2, *a3;
			args >> a1 >> a2 >> a3 >> osc::EndMessage;

			NSMutableString *jsStringStart = [[NSMutableString alloc] initWithCString:a1 encoding:1];
			[jsStringStart replaceOccurrencesOfString:@"\n" withString:@"" options:1 range:NSMakeRange(0, [jsStringStart length])]; // will not work with newlines present
			
			NSString *name = [[NSString alloc] initWithCString:a2 encoding:1];
			NSString *destination = [[NSString alloc] initWithCString:a3 encoding:1];

			NSString *jsString = [[NSString alloc] initWithFormat:@"Control.interfaceManager.pushInterfaceWithDestination('%@', '%@', '%@')", jsStringStart, name, destination];
			
			[self.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString waitUntilDone:NO];
		}
	}catch( osc::Exception& e ){
		NSLog(@"an exception occurred");
	}
}

- (void)pushDestination:(NSValue *) msgPointer {
	osc::ReceivedMessage& msg = *(osc::ReceivedMessage *)[msgPointer pointerValue];
	try{
		osc::ReceivedMessageArgumentStream args = msg.ArgumentStream();
		osc::ReceivedMessage::const_iterator arg = msg.ArgumentsBegin();
		const char * a1;
		args >> a1 >> osc::EndMessage;
		NSString *destination = [[NSString alloc] initWithCString:a1 encoding:1];

		NSString *jsString = [[NSString alloc] initWithFormat:@"Control.destinationManager.pushDestination('%@')", destination];
		[_oscManager.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString waitUntilDone:NO];
	}catch( osc::Exception& e ){
		NSLog(@"an exception occurred");
	}
}


- (void)startPolling:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    shouldPoll = YES;
    
    if(pollingThread == nil) {
        pollingThread = [[NSThread alloc] initWithTarget:self selector:@selector(pollJavascriptStart:) object:nil];
        [pollingThread start];
    }
}
- (void)stopPolling:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    shouldPoll = NO;
}
- (void)startReceiveThread:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	// this can be (and is) blank... it will still force the command object to be created which will start the OSC thread
}

- (void)setIPAddressAndPort:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	char * dest_ip = (char *)[[arguments objectAtIndex:0] UTF8String];
	int dest_port  = (int)[[arguments objectAtIndex:1] intValue];

	delete destinationAddress;
	destinationAddress = new IpEndpointName( dest_ip, dest_port );
	
	delete output;
	output = new UdpTransmitSocket(*destinationAddress);
	
    isOutputInitialized = YES;
    [self startPolling:nil withDict:nil];
}


- (void) pollJavascriptStart:(id)obj {
	//NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	while(shouldPoll) {
		[self performSelectorOnMainThread:@selector(pollJavascript:) withObject:nil waitUntilDone:YES];
        //[self pollJavascript:nil];
		[NSThread sleepForTimeInterval:OSC_POLLING_RATE];
	}
	
	//[pool drain];
}

// form is objectName:paramNumber,val1,val2,val3|objectName:paramNumber,val1,val2,val3|objectName:paramNumber,val1,val2,val3
- (void) pollJavascript:(id)obj {
	//NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	
    if(isOutputInitialized) {
        NSString *cmdString = [self.webView stringByEvaluatingJavaScriptFromString:@"Control.getValues()"];
        if([cmdString length] == 0) return;
        
        char buffer[OUTPUT_BUFFER_SIZE];
        osc::OutboundPacketStream p( buffer, OUTPUT_BUFFER_SIZE );		
        p << osc::BeginBundleImmediate;
        
        [self.webView stringByEvaluatingJavaScriptFromString:@"Control.clearValuesString()"];
        NSArray *objects = [cmdString componentsSeparatedByString:@"|"];

        for(int i = 0; i < [objects count]; i++) {
            NSString *str = [objects objectAtIndex:i];
            NSArray  *nameValues = [str componentsSeparatedByString:@":"];
            
            if([nameValues count] < 2) continue; // avoids problem caused by starting polling before JavaScript state is ready
            
            NSString *oscAddress = [nameValues objectAtIndex:0];
            NSString *allvalues  = [nameValues objectAtIndex:1];
                        
            p << osc::BeginMessage( [oscAddress UTF8String] );

            NSArray *strValues = [allvalues componentsSeparatedByString:@","];
            for(int j = 0; j < [strValues count]; j++) {
                NSString * value = [strValues objectAtIndex:j];
                p << [value floatValue];
            }
            p << osc::EndMessage;
        }
        
        p << osc::EndBundle;
        output->Send(p.Data(), p.Size());
    }
	
//	[pool drain];
//  [pool release];
}

- (void)send:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    //NSLog(@"arguments length = %d", [arguments count]);
    //NSLog(@"ARGUMENTS = %@", [arguments description]);
    if(isOutputInitialized) {
        char buffer[OUTPUT_BUFFER_SIZE];
        osc::OutboundPacketStream p( buffer, OUTPUT_BUFFER_SIZE );		
        p << osc::BeginBundleImmediate << osc::BeginMessage( [[arguments objectAtIndex:1] UTF8String] );
        
        NSString *typetags= [arguments objectAtIndex:2];
        for(int i = 0; i < [typetags length]; i++) {	
            char c = [typetags characterAtIndex:i];
            switch(c) {
                case 'i':
                    p << [[arguments objectAtIndex:i+3] intValue];
                    break;
                case 'f':
                    p << [[arguments objectAtIndex:i+3] floatValue];
                    break;
                case 's':
                    p << [[arguments objectAtIndex:i+3] UTF8String];
                    break;
             }
        }
        p << osc::EndMessage << osc::EndBundle;
        output->Send(p.Data(), p.Size());
    }
}

- (void) dealloc {
    [pollingThread release];
	s->Break();
	delete(s);

	delete(listener); 	
	delete(destinationAddress);
	delete(output);
	[super dealloc];
}

@end
