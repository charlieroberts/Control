//
//  Defaults.m
//  PhoneGap
//
//  Created by thecharlie on 10/23/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import "Defaults.h"

#define VERSION_ @"1.01"


@implementation Defaults

- (void)loadDefaultScripts:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	NSLog(@"loading default scripts");
	NSUserDefaults * defaults = [NSUserDefaults standardUserDefaults];
    // TODO: remove before publishing
	if([defaults objectForKey:@"Control"] == nil || ![[defaults objectForKey:@"Control"] isEqualToString:VERSION_]) {		
		NSArray * paths = [[NSBundle mainBundle] pathsForResourcesOfType:@"js" inDirectory:@"interfaces"];
		for(int i = 0; i < [paths count]; i++) {
			NSString *path = [paths objectAtIndex:i];
            NSData *fileData = [NSData dataWithContentsOfFile:path];

            NSMutableString *jsString = [[NSMutableString alloc] initWithData:fileData encoding:NSUTF8StringEncoding];

			[jsString replaceOccurrencesOfString:@"\n" withString:@"" options:1 range:NSMakeRange(0, [jsString length])]; // will not work with newlines present
            //NSLog(jsString);
			NSString *jsString2;
			if(i != [paths count] - 1) {
				jsString2 = [[NSString alloc] initWithFormat:@"interfaceManager.saveInterface('%@', false)", jsString];
			}else{
				jsString2 = [[NSString alloc] initWithFormat:@"interfaceManager.saveInterface('%@', false)", jsString];
			}

			[webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString2 waitUntilDone:YES];
		
			[jsString2 release];
			[jsString release];
		}
        //NSLog(@"running defaults");
        //[webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:@"interfaceManager.createInterfaceListWithStoredInterfaces()" waitUntilDone:NO];

		[defaults setObject:VERSION_ forKey:@"Control"];
	}
}

@end
