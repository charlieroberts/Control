//
//  Defaults.h
//  PhoneGap
//
//  Created by thecharlie on 10/23/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"

@interface Defaults : PhoneGapCommand<UIAccelerometerDelegate>  {

}

- (void)loadDefaultScripts:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
@end
