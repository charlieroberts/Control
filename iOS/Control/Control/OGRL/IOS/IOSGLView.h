
#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>
#import <CoreMotion/CoreMotion.h>

#import "Renderer.hpp"

#include <OpenGLES/ES2/gl.h>
#include <OpenGLES/ES2/glext.h>


@interface IOSGLView : UIView {
  float m_timestamp;
}

@property Renderer* m_renderer;
@property (retain) EAGLContext* m_context;

@property (retain) CMMotionManager* motionManager;
@property (retain) CMAttitude *attitude;
@property (retain) CMAttitude *referenceAttitude;
@property bool isGyroOn; 

- (bool) initializeGLView;
- (void) initRenderer:(CAEAGLLayer*) eaglLayer;
- (void) scaleToDevice;
- (void) drawView;
- (void) drawView:(CADisplayLink*) displayLink;

- (void) calculateCurrentAttitude;
- (void) updateGyroscopeMatrix;
- (bool) startGyroscope;
- (bool) isUsingGyro;

- (void) swipeDetectedUp:(UIPanGestureRecognizer *)recognizer;
- (void) swipeDetectedDown:(UIPanGestureRecognizer *)recognizer;

@end
