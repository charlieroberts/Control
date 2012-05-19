//
//  CNTRLVideoView.m
//  Control
//
//  Created by charlie on 5/1/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CNTRLVideoView.h"

@implementation CNTRLVideoView

- (id)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
    }
    return self;
}

- (void)setDelegate:(id)del {
    delegate = del;
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event {
    [delegate touchesEnded:touches withEvent:event];
}
- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    [delegate touchesEnded:touches withEvent:event];
}
- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event {
    [delegate touchesEnded:touches withEvent:event];
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
}
*/

@end
