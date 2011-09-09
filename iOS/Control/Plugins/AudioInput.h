//
//  AudioInput.h
//  Control
//
//  Created by charlie on 7/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "PhoneGapCommand.h"
#import <AudioToolbox/AudioToolbox.h>

@interface AudioInput : PhoneGapCommand {
    int mode;
    
}

@property int mode;
- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)setUpdateRate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
