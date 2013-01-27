//make a SensorsHandler class - can only be accessed via Obj-C classes

#import "AppDelegate.h"

#import "IOSGLView.h"


@implementation IOSGLView
@synthesize m_renderer;
@synthesize m_context;
@synthesize motionManager;
@synthesize referenceAttitude;
@synthesize attitude;
@synthesize isGyroOn;

bool IS_ANIMATED = true;
bool USING_GYRO = NO; //YES;
bool USE_RETINA = NO;
//float prevRoll = 0.0;
//float prevPitch = 0.0;
//float prevYaw = 0.0;

- (void) initRenderer:(CAEAGLLayer*) eaglLayer {
  
  //set the Renderer that you want to use in the AppDelegate via the GetRenderer function
  AppDelegate* app =  (( AppDelegate* )[[ UIApplication sharedApplication ] delegate ]);
  m_renderer = (Renderer*)[app GetRenderer];
  

  /*
   need to do the following, in order:
   1. instantiate the renderer, which will create and bind the RenderBuffer
   2. set the renderbuffer storage for the GL context
   3. intialize the renderer, which will create the default FrameBuffer and DepthBuffer.
   */
  
  [m_context renderbufferStorage:GL_RENDERBUFFER fromDrawable: eaglLayer]; 
  m_renderer->InitializeRenderBuffers();
  m_renderer->InstallDefaultCamera(Camera::CreateOrthographicCamera(ivec4(0, 0, m_renderer->width, m_renderer->height))); //set default camera 
  m_renderer->Initialize();
}


+ (Class) layerClass {
  return [CAEAGLLayer class];
}

- (bool)isUsingGyro {
  return USING_GYRO;
}

//for stand alone version
- (id) initWithFrame: (CGRect) frame {
  if ((self = [super initWithFrame:frame])) {
    
    if (![self initializeGLView]) {
      [self release];
      return nil;
    }
  }
  return self;
}  

//for version embedded in metabook
- (void)awakeFromNib {  
  //[self initializeGLView];
}

- (void) scaleToDevice {
  if([[UIScreen mainScreen] respondsToSelector: NSSelectorFromString(@"scale")]) {
    if([self respondsToSelector: NSSelectorFromString(@"contentScaleFactor")]) {
      self.contentScaleFactor = [[UIScreen mainScreen] scale];
      NSLog(@"\nscale factor = %f\n", self.contentScaleFactor);
    }
  }
}

- (bool) initializeGLView {

  if (USE_RETINA == YES) {
    [self scaleToDevice];
  }
  self.multipleTouchEnabled=YES; 
  CAEAGLLayer* eaglLayer = (CAEAGLLayer*) self.layer;
  eaglLayer.opaque = YES;
  
  EAGLRenderingAPI api = kEAGLRenderingAPIOpenGLES2;
  m_context = [[EAGLContext alloc] initWithAPI:api];
  
  if (!m_context || ![EAGLContext setCurrentContext:m_context]) {
    return NO;
  } 
  
  [self initRenderer:eaglLayer];
  
//  CADisplayLink* displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(drawView:)];
//  [displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
  
  //[self drawView: nil];
  m_timestamp = CACurrentMediaTime();
  
  printf("HERE!!!!!!!!!!!!!!! animated = %d\n", IS_ANIMATED);
  if (IS_ANIMATED) {
    printf("yes... is animated\n");
    
    if (USING_GYRO) {
      if ([self startGyroscope]) {
        CADisplayLink* displayLink;
        displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(drawView:)];
        [displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode]; 
      }
    } else {
        [self drawView];
        printf("display link on???\n");
        USING_GYRO = NO; //it wasn't available to be used!
        CADisplayLink* displayLink;
        displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(drawView:)];
        [displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
    }
  } else { //NOT ANIMATED
    printf("animation OFF\n");
    [self drawView];
  }
  
  UIPinchGestureRecognizer *twoFingerPinch = [[[UIPinchGestureRecognizer alloc] initWithTarget:self action:@selector(twoFingerPinch:)] autorelease];
  [self addGestureRecognizer:twoFingerPinch];
  
  UILongPressGestureRecognizer *longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(longPress:)];
  //longPressGR = (UILongPressGestureRecognizer *)recognizer;
  longPress.minimumPressDuration = 1.0;
  [self addGestureRecognizer:longPress];
  //[recognizer release];
  
  UIPanGestureRecognizer *panRecognizer = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(panGesture:)];
	[panRecognizer setMinimumNumberOfTouches:1];
	[panRecognizer setMaximumNumberOfTouches:1];
	//[panRecognizer setDelegate:self];
	//[self addGestureRecognizer:panRecognizer];
  
  UISwipeGestureRecognizer *swipeRecognizerUp = [[UISwipeGestureRecognizer alloc] initWithTarget:self action:@selector(swipeDetectedUp:)];
  swipeRecognizerUp.direction = UISwipeGestureRecognizerDirectionUp;
  swipeRecognizerUp.numberOfTouchesRequired = 1;
  //[self addGestureRecognizer:swipeRecognizerUp];
  //[swipeRecognizer release];
  
  UISwipeGestureRecognizer *swipeRecognizerDown = [[UISwipeGestureRecognizer alloc] initWithTarget:self action:@selector(swipeDetectedDown:)];
  swipeRecognizerDown.direction = UISwipeGestureRecognizerDirectionDown;
  swipeRecognizerDown.numberOfTouchesRequired = 1;
  //[self addGestureRecognizer:swipeRecognizerDown];
  //[swipeRecognizer release];
 
  /*
  UIPanGestureRecognizer *twoFingerPanRecognizer = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(twoFingerPanGesture:)];
	[twoFingerPanRecognizer setMinimumNumberOfTouches:2];
	[twoFingerPanRecognizer setMaximumNumberOfTouches:2];
	//[panRecognizer setDelegate:self];
	[self addGestureRecognizer:twoFingerPanRecognizer];
  */
  return YES;
}


- (bool) startGyroscope {
    motionManager = [[CMMotionManager alloc] init]; // motionManager is an instance variable
   if([motionManager isGyroAvailable]) {
  
    referenceAttitude = [motionManager.deviceMotion.attitude retain];
    [motionManager startDeviceMotionUpdates];
     return true;
   }
  return false;
}

- (void) drawView {  
  
  if (USING_GYRO) {
    [self updateGyroscopeMatrix];
  }
 
  if (m_renderer->isReady) {
    m_renderer->isRendering = true;
    m_renderer->Render();
    m_renderer->isRendering = false;
  } else {
    printf("Renderer is not ready ... view is not done loading\n");
  }
  
  [m_context presentRenderbuffer:GL_RENDERBUFFER];
}

- (void) drawView: (CADisplayLink*) displayLink {
  if (displayLink != nil) {
    //float elapsedSeconds = displayLink.timestamp - m_timestamp;
    m_timestamp = displayLink.timestamp;
    //m_applicationEngine->UpdateAnimation(elapsedSeconds);
  }
  
  [self drawView];
}


- (void)swipeDetectedUp:(UIPanGestureRecognizer *)recognizer {
  printf("UPPP!!!\n");
}

- (void)swipeDetectedDown:(UIPanGestureRecognizer *)recognizer {
  printf("Down!!!\n");
}

- (void)panGesture:(UIPanGestureRecognizer *)recognizer {
  //CGPoint velocity = [recognizer velocityInView:self];

  //m_appHandler->OnPan(ivec2(velocity.x, velocity.y));
  //[self drawView];
}

//to "strafe" camera
- (void)nnpanGesture:(UIPanGestureRecognizer *)recognizer {
  /*
  CGPoint velocity = [recognizer velocityInView:self];
  CGPoint pixelPos = [recognizer translationInView:self];
  CGFloat pixelsPerSecond = sqrtf(velocity.x * velocity.x + velocity.y * velocity.y);
  // NSLog(@"speed = %f", pixelsPerSecond);
    */
  
  //  NSLog(@"recorded trans %f,%f",pixelPos.x,pixelPos.y);
//  NSLog(@"recorded veloc %f,%f",velocity.x,velocity.y);
//  
//  CGPoint currentPos = [recognizer locationInView:self];
//  NSLog(@"current point %f,%f",currentPos.x,currentPos.y);
  
  
  
  
  /*
  if(velocity.x > 0)
  {
    NSLog(@"gesture went right");
  }
  else
  {
    NSLog(@"gesture went left");
  }
  */
 
  /*
  CGPoint previous  = [recognizer previousLocationInView: self];
  CGPoint current = [recognizer locationInView: self];
  m_appHandler->OnFingerMove(ivec2(previous.x, previous.y), ivec2(current.x, current.y));
  [self drawView];
   */
//  m_appHandler->OnPan(ivec2(location.x, location.y));
//  [self drawView];
}

//to zoom camera in or out
- (void) twoFingerPinch:(UIPinchGestureRecognizer *)recognizer {
  
  if (recognizer.state == UIGestureRecognizerStateChanged) {
    m_renderer->HandlePinch(recognizer.scale);
  } else if (recognizer.state == UIGestureRecognizerStateEnded ||
             recognizer.state == UIGestureRecognizerStateCancelled ||
             recognizer.state == UIGestureRecognizerStateFailed)
  {
    m_renderer->HandlePinchEnded();
  }
  
 // [self drawView];
}


- (void) longPress:(UILongPressGestureRecognizer *)recognizer {
  CGPoint current = [recognizer locationInView: self];
  m_renderer->HandleLongPress(ivec2(current.x, current.y));
}

- (void) touchesBegan: (NSSet*) touches withEvent: (UIEvent*) event {
 
   for (UITouch* touch in touches) {
     CGPoint location  = [touch locationInView: self];
     m_renderer->HandleTouchBegan(ivec2(location.x, location.y));
   }
}

- (void) touchesEnded: (NSSet*) touches withEvent: (UIEvent*) event {
   for (UITouch* touch in touches) {
     CGPoint location  = [touch locationInView: self];
     m_renderer->HandleTouchEnded(ivec2(location.x, location.y));
   }
}

- (void) touchesMoved: (NSSet*) touches withEvent: (UIEvent*) event {
 for (UITouch* touch in touches) {
  CGPoint location  = [touch locationInView: self];
  CGPoint prevLocation  = [touch previousLocationInView: self];
  m_renderer->HandleTouchMoved(ivec2(prevLocation.x, prevLocation.y), ivec2(location.x, location.y));
 }
}

- (void) calculateCurrentAttitude {
  attitude = motionManager.deviceMotion.attitude;
  if (referenceAttitude != nil) {
    [attitude multiplyByInverseOfAttitude: referenceAttitude];
  }
}

-(void) testRotMatToEulerXYZ:(CMRotationMatrix) rotMat {
  float thetaY;
  float thetaX;
  float thetaZ;
  
  float r00 = rotMat.m11;
  float r01 = rotMat.m12;
  float r02 = rotMat.m13;
  float r10 = rotMat.m21;
  float r11 = rotMat.m22;
  float r12 = rotMat.m23;
  float r22 = rotMat.m33;
  
  if (r02 < +1)
  {
    if (r02 > -1)
    {
      thetaY = asin(r02);
      thetaX = atan2(-r12,r22);
      thetaZ = atan2(-r01,r00);
    }
    else // r02 = -1
    {
      // Not a unique solution: thetaZ - thetaX = atan2(r10,r11)
      thetaY = -M_PI/2.0;
      thetaX = -atan2(r10,r11);
      thetaZ = 0;
    }
  }
  else // r02 = +1
  {
    // Not a unique solution: thetaZ + thetaX = atan2(r10,r11)
    thetaY = +M_PI/2.0;
    thetaX = atan2(r10,r11);
    thetaZ = 0;
  }
    
  printf("euler: %f %f %f \n", thetaX, thetaY, thetaZ);
    
}

float accX = 0.0;
float accY = 0.0;
float accZ = 0.0;


//#define radians(x) (x * M_PI / 180.0f)
//#define degrees(x) (180.0 * x / M_PI)

- (void) updateGyroscopeMatrix {
  
  
  [self calculateCurrentAttitude]; 
  //printf("pitch = %f\n", attitude.pitch);
  CMRotationMatrix rotMat = attitude.rotationMatrix;
  
  //[self testRotMatToEulerXYZ:rotMat];
  
  mat4 mvm = mat4::Identity();
  
  mvm.x.x = rotMat.m11;
	mvm.x.y = rotMat.m21;
	mvm.x.z = rotMat.m31;
  
  mvm.y.x = rotMat.m12;
  mvm.y.y = rotMat.m22;
  mvm.y.z = rotMat.m32;
  
  mvm.z.x = rotMat.m13;
  mvm.z.y = rotMat.m23;
  mvm.z.z = rotMat.m33;

  /*
  CMAcceleration userAcceleration = motionManager.deviceMotion.userAcceleration;
  
//  if (userAcceleration.x < 0) {
//    printf("LEFT\n");
//  } else if (userAcceleration.x > 0) {
//    printf("RIGHT\n");
//  }
  float absX = fabs(userAcceleration.x);
  if (absX > 0.05 && absX < 0.15) {
    printf("slowX\n");
  }
  else if (absX >= 0.15 && absX < 0.4) {
    printf("medX\n");
  }else if (absX >= 0.4) {
    printf("fastX\n");
  }else { printf("."); } 
  //printf("accel x, y, z = %f, %f, %f\n", accX, accY, accZ); 
  //mvm.x.w = userAcceleration.x;
  accX = userAcceleration.x;
  //mvm.x.w = accX;
  */
  /* This only works on a real device, comment out if testing on simulator */
  m_renderer->SetGyroscopeMatrix(mvm);
  
    /*
  float curRoll = attitude.roll;
  //printf("prevRoll = %f\n", prevRoll);
  //printf("curRoll = %f\n", curRoll);
  float rollInc = attitude.roll - prevRoll;
  //printf("rollInc = %f\n", rollInc);
  float rollUpdate = degrees(rollInc);
  
  
  float curPitch = attitude.pitch;
  float pitchInc = attitude.pitch - prevPitch;
  float pitchUpdate = degrees(pitchInc);
  
  
  float curYaw = attitude.yaw;
  float yawInc = attitude.yaw - prevYaw;
  float yawUpdate = degrees(yawInc);
  
  
  prevPitch = curPitch; //around x axis
  prevRoll = curRoll; //around y axis
  prevYaw = curYaw; //around z axis
   */
}

@end
