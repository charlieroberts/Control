//
//  Bonjour.h
//  PhoneGap
//
//  Created by Brant Vasilieff on 3/1/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "PhoneGapCommand.h"

@interface Bonjour : PhoneGapCommand <NSNetServiceBrowserDelegate, NSNetServiceDelegate>
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
}

@property (assign) BOOL isConnected;
@property (readwrite, retain) NSNetServiceBrowser *browser, *midiBrowser;
@property (readwrite, retain) NSMutableArray *services;
@property (readwrite, retain) NSNetService *connectedService;

- (void)start:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void)stop:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (NSString *)getIPAddress;
- (void) browse:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
