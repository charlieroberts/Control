/*
 *  Device.h
 *  Used to display Device centric details handset.
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 */

#import <UIKit/UIKit.h>
#import <UIKit/UIDevice.h>
#import "PGPlugin.h"

@interface CNTRLDevice : PGPlugin {
}

//- (NSDictionary*) deviceProperties;
//- (NSDictionary*) deviceProperties:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) autolockToggle:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) setRotation:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end