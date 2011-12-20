//
//  Bonjour.h
//  PhoneGap
//
//  Created by Brant Vasilieff on 3/1/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "PGPlugin.h"

@interface CNTRLBonjour : PGPlugin <NSNetServiceBrowserDelegate, NSNetServiceDelegate>
{
    NSString* __identifier;
	
	NSNetService *netService;

	NSMutableArray *services;
	BOOL isConnected;
    NSNetServiceBrowser *browser;
    NSNetServiceBrowser *midiBrowser;	
    NSNetService *connectedService;
	
	NSString *myIP;
	int count;
    
    BOOL isPublishing;
}

@property (assign) BOOL isConnected;
@property (readwrite, retain) NSNetServiceBrowser *browser, *midiBrowser;
@property (readwrite, retain) NSMutableArray *services;
@property (readwrite, retain) NSNetService *connectedService;


- (NSString *) getIPAddress;

- (void) browse:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) publishService:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) getMyIP:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
@end
