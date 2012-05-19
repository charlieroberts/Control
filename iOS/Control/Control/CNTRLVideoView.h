//
//  CNTRLVideoView.h
//  Control
//
//  Created by charlie on 5/1/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface CNTRLVideoView : UIView {
    id delegate;
}

- (void)setDelegate:(id)del;

@end
