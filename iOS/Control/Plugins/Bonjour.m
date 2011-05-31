//
//  Bonjour.m
//  PhoneGap
//
//  Created by Brant Vasilieff on 3/1/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import "Bonjour.h"
#import <sys/socket.h>
#import <netinet/in.h>
#import <arpa/inet.h>
#include <ifaddrs.h>

// TODO: Support for displaying service names
// TODO: Remove Bonjour destinations when they are no longer available... provide popup notification if the user is currently connected???

@implementation Bonjour
@synthesize isConnected, browser, services, connectedService, midiBrowser;

- (PhoneGapCommand*) initWithWebView:(UIWebView*)theWebView {	
    self = [super init];
    if (self) {
		__identifier = nil;
        [self setWebView:theWebView];
		services = [NSMutableArray new];
		count = 0;
	}
    return self;
}

- (void)start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    [self publishService:nil withDict:nil];
	
	self.browser = [NSNetServiceBrowser new];
    self.browser.delegate = self;
	
	self.midiBrowser = [NSNetServiceBrowser new];
    self.midiBrowser.delegate = self;
	
    self.isConnected = NO;
	
    [self browse:nil withDict:nil];
    [self getMyIP:nil withDict:nil];
}

- (void)getMyIP:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    if(myIP != nil) [myIP release];
    
	myIP = [self getIPAddress];
    [myIP retain];
    
    NSString *ipstring = [NSString stringWithFormat:@"control.ipAddress = '%@';", myIP];
    
    [webView stringByEvaluatingJavaScriptFromString:ipstring];
}

- (void)publishService:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    if(netService != nil) {
        [netService stop];
        [netService release];
    }
    netService = [[NSNetService alloc] initWithDomain:@"local." type:@"_osc._udp." 
												 name:@"" port:8080];
    netService.delegate = self;
    isPublishing = YES;
    [netService publish];
}
       
- (void)netServiceDidStop:(NSNetService *)sender {
    isPublishing = NO;
}
       
- (void) browse:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options { 
    self.browser = [NSNetServiceBrowser new];
    self.browser.delegate = self;
	
	self.midiBrowser = [NSNetServiceBrowser new];
    self.midiBrowser.delegate = self;

    
    [self.browser searchForServicesOfType:@"_osc._udp." inDomain:@""];
	[self.midiBrowser searchForServicesOfType:@"_apple-midi._udp." inDomain:@""];      
}

- (void)stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options { }

#pragma mark Net Service Browser Delegate Methods
-(void)netServiceBrowser:(NSNetServiceBrowser *)aBrowser didFindService:(NSNetService *)aService moreComing:(BOOL)more {
    NSLog(@"found something");
	[services addObject:aService];

	NSNetService *remoteService = aService;
    remoteService.delegate = self;
    [remoteService resolveWithTimeout:0];
}

-(void)netServiceBrowser:(NSNetServiceBrowser *)aBrowser didRemoveService:(NSNetService *)aService moreComing:(BOOL)more {
	/*NSLog(@"REMOVING");
    
    //[services removeObject:aService];
	NSLog([aService description]);
	NSArray *addresses = aService.addresses;

	@try {
        //NSData * d = [addresses objectAtIndex:0];
		//struct sockaddr_in *socketAddress  = (struct sockaddr_in *) [d bytes];
        
        int port;
		NSLog(@"before for loop %@", [aService domain]);
        for(NSData *d in [aService addresses]) {
			NSLog(@"in for loop with data...");
            struct sockaddr_in *socketAddress  = (struct sockaddr_in *) [d bytes];
            //NSString *name = [service name];
            char * ipaddress = inet_ntoa(socketAddress->sin_addr);
			NSLog(@"REMOVING address = %s", ipaddress);
            if(strcmp(ipaddress, "0.0.0.0") == 0 || strcmp(ipaddress, [myIP UTF8String]) == 0) { 
                continue;
            }
            port = ntohs(socketAddress->sin_port); // ntohs converts from network byte order to host byte order 
            BOOL isMIDI = ([[aService type] isEqualToString:@"_apple-midi._udp."]);
            NSString *ipString = [NSString stringWithFormat: @"destinationManager.removeDestination(\"%s\", %d);", inet_ntoa(socketAddress->sin_addr), port];

            [webView stringByEvaluatingJavaScriptFromString:ipString];
        }
    } @catch(NSException *e) { NSLog(@"error resolving bonjour address"); }
	NSLog(@"after for loop");
    //if ( aService == self.connectedService ) self.isConnected = NO;*/	
}

-(void)netServiceDidResolveAddress:(NSNetService *)service {
    self.isConnected = YES;
    //self.connectedService = service;
	
	NSArray *addresses = service.addresses;
	//for(NSData *d in addresses) {
    @try {
		// NSData * d = [addresses objectAtIndex:0];
		//struct sockaddr_in *socketAddress  = (struct sockaddr_in *) [d bytes];
        
        int port;
        for(NSData *d in [service addresses]) {
            struct sockaddr_in *socketAddress  = (struct sockaddr_in *) [d bytes];
            //NSString *name = [service name];
            char * ipaddress = inet_ntoa(socketAddress->sin_addr);
			NSLog(@"bonjour address = %s", ipaddress);
            if(strcmp(ipaddress, "0.0.0.0") == 0 || strcmp(ipaddress, [myIP UTF8String]) == 0) { 
                continue;
            }
            port = ntohs(socketAddress->sin_port); // ntohs converts from network byte order to host byte order 
            BOOL isMIDI = ([[service type] isEqualToString:@"_apple-midi._udp."]);
            NSString *ipString = [NSString stringWithFormat: @"destinationManager.addDestination(\"%s\", %d, %d, %d);", inet_ntoa(socketAddress->sin_addr), port, !isMIDI, isMIDI];
            NSLog(ipString);
            [webView stringByEvaluatingJavaScriptFromString:ipString];
        }
    } @catch(NSException *e) { NSLog(@"error resolving bonjour address"); }
}

-(void)netService:(NSNetService *)service didNotResolve:(NSDictionary *)errorDict {
    NSLog(@"Could not resolve: %@", errorDict);
}

- (NSString *)getIPAddress {
  NSString *address = @"error";
  struct ifaddrs *interfaces = NULL;
  struct ifaddrs *temp_addr = NULL;
  int success = 0;

  // retrieve the current interfaces - returns 0 on success
  success = getifaddrs(&interfaces);
  if (success == 0) {
    // Loop through linked list of interfaces
    temp_addr = interfaces;
    while(temp_addr != NULL) {
      if(temp_addr->ifa_addr->sa_family == AF_INET) {
        // Check if interface is en0 which is the wifi connection on the iPhone
        if([[NSString stringWithUTF8String:temp_addr->ifa_name] isEqualToString:@"en0"]) {
          // Get NSString from C String
          address = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr)];
		  NSLog(@"ipaddress = %@", address);
        }
      }
      temp_addr = temp_addr->ifa_next;
    }
  }

  // Free memory
  freeifaddrs(interfaces);

  return address;
}

- (void)dealloc {
	[myIP release];
	[services release];
	[browser release];
    [midiBrowser release];
    [__identifier release];
    [super dealloc];
}

@end
