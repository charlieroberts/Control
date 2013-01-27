
#import "ResourceHandler.h"
#import "AudioManager.h"
#import "VideoManager.h"
#import "CameraManager.h"

#ifdef IS_IOS
#import <Foundation/Foundation.h>
#import <AssetsLibrary/AssetsLibrary.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <AVFoundation/AVFoundation.h>
//#import <OpenGLES/ES2/gl.h>
//#import <OpenGLES/ES2/glext.h>
#import <CoreFoundation/CoreFoundation.h>
#import "AppDelegate.h"
#import "PhoneGapViewController.h"

#include "IOSGLView.h"

#endif


#ifdef IS_COCOA
#import "AppDelegate.h"
#import "NSGLView.h"
//#include <OpenGL/gl.h>
//#include <OpenGL/glext.h>
#endif

using namespace std;

AudioManager *audioManager;
VideoManager *videoManager;
CameraManager* cameraManager;


ResourceHandler* ResourceHandler::instance = NULL;

ResourceHandler* ResourceHandler::CreateResourceHandler() {
  instance = new ResourceHandler();
  return instance; 
}

ResourceHandler* ResourceHandler::GetResourceHandler() {
  if (ResourceHandler::instance == NULL) {
    CreateResourceHandler();
  }
  return instance;
}

ResourceHandler::ResourceHandler() { 
}


bool ResourceHandler::IsUsingGyro() {
  
  // IOSGLView* v = (IOSGLView*)(( AppDelegate* )[[ UIApplication sharedApplication ] delegate ]).viewController.view;
  IOSGLView* v = (IOSGLView*) GetView();
  //return false;
  return [v isUsingGyro]; 
}

void* ResourceHandler::GetView() {
  //UIView* ResourceHandler::GetView() {
  //return (( AppDelegate* )[[ UIApplication sharedApplication ] delegate ]).view;
  //return (IOSGLView*)(( AppDelegate* )[[ UIApplication sharedApplication ] delegate ]).viewController.view;
  return (( AppDelegate* )[[ UIApplication sharedApplication ] delegate ]).viewController.view;
}


void ResourceHandler::ResetGyroscope() {
  //IOSGLView* view = (( AppDelegate* )[[ UIApplication sharedApplication ] delegate ]).view;
  IOSGLView* view = (IOSGLView*)(( AppDelegate* )[[ UIApplication sharedApplication ] delegate ]).viewController.view;
  view.referenceAttitude = [view.motionManager.deviceMotion.attitude retain];
}


string ResourceHandler::GetResourcePath() const {
  NSString* bundlePath =[[NSBundle mainBundle] resourcePath];
  return [bundlePath UTF8String];
}

const char* ResourceHandler::GetContentsOfFileAsString(string& file) {
  NSString* filePath = [[NSString alloc] initWithUTF8String:file.c_str()];
  NSString* contents = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];
  return [contents UTF8String];
}

string ResourceHandler::GetPathForResourceOfType(const string& resource, const string& type) {
  
  NSString* resourcePath = [[NSString alloc] initWithUTF8String:resource.c_str()];
  NSString* typePath = [[NSString alloc] initWithUTF8String:type.c_str()];
  NSBundle* mainBundle = [NSBundle mainBundle];
  NSString* fullPath = [mainBundle pathForResource:resourcePath ofType:typePath];
  
  cout << "in GetPathForResourceOfType(...), pathStr = " << [fullPath UTF8String] << "\n";
  return [fullPath UTF8String];
}


Texture* ResourceHandler::CreateCubeMapTextureFromImageFile(const string &fname) {
  
  GLubyte** cubeData = (GLubyte**)malloc( sizeof(GLubyte*) * 6 );
  //GLvoid** cubeData = (GLvoid**)malloc( sizeof(GLvoid*) * 6 );
  
  NSString* basePath = [[NSString alloc] initWithUTF8String:fname.c_str()];
  NSArray* splits = [basePath componentsSeparatedByString: @"."];
  
  NSString* fileStr = [splits objectAtIndex:0];
  NSString* typeStr = [splits objectAtIndex:1];
  
  int cw;
  int ch;
  
  
  
  for (int i = 0; i < 6; i++) {
    
    //loading in files like "myCubeMap_0.jpg", etc
    NSString* useFileStr = [NSString stringWithFormat:@"%@_%d", fileStr, i];
    NSString* path = [[NSBundle mainBundle] pathForResource:useFileStr ofType:typeStr];
    NSLog(@"Loading texture: %@.%@\n", useFileStr, typeStr);
    
    NSData *texData = [[NSData alloc] initWithContentsOfFile:path];
    UIImage *image = [[UIImage alloc] initWithData:texData];
    
    if (image == nil) {
      NSLog(@"in ResourceHandler::CreateCubeMapTextureFromImageFile, image %@ is NULL!", useFileStr);
    }
    
    //these better be the same for all six images!
    int _w = CGImageGetWidth(image.CGImage);
    int _h = CGImageGetHeight(image.CGImage);
    
    if (i == 0) {
      cw = _w;
      ch = _h;
    }
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    GLubyte* data = (GLubyte*)malloc( _w * _h * 4 );
    //GLvoid* data = (GLvoid*)malloc( _w * _h * 4 );
    
    CGContextRef context = CGBitmapContextCreate( data, _w, _h, 8, 4 * _w, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big );
    CGColorSpaceRelease( colorSpace );
    CGContextClearRect( context, CGRectMake( 0, 0, _w, _h ) );
    //CGContextTranslateCTM( context, 0, height - height );
    
    CGContextTranslateCTM(context, 0, _h);
    CGContextScaleCTM(context, 1, -1);
    
    CGContextDrawImage( context, CGRectMake( 0, 0, _w, _h ), image.CGImage );
    
    CGContextRelease(context);
    
    [texData release];
    
    cubeData[i] = data;
    //    cubeData[0] = data;
    //    cubeData[1] = data;
    //    cubeData[2] = data;
    //    cubeData[3] = data;
    //    cubeData[4] = data;
    //    cubeData[5] = data;
    
    
  }
  
  return new Texture(cubeData, cw, ch, GL_RGBA, GL_UNSIGNED_BYTE);
}


void ResourceHandler::NextVideoFrameLock() {
  if (videoManager != NULL) {
    [videoManager nextVideoFrameLock];
  }
}
void ResourceHandler::NextVideoFrameUnlock() {
  if (videoManager != NULL) {
    [videoManager nextVideoFrameUnlock];
  }
}

void ResourceHandler::NextVideoFrame() {
  if (videoManager != NULL) {
    [videoManager nextVideoFrame];
  }
}

void* ResourceHandler::RetrieveAsset(const string &fname) {
  
  NSString* basePath = [[NSString alloc] initWithUTF8String:fname.c_str()];
  NSArray* splits = [basePath componentsSeparatedByString: @"."];
  
  NSString* fileStr = [splits objectAtIndex:0];
  NSString* typeStr = [splits objectAtIndex:1];
  
  NSLog(@"Loading asset at: %@.%@\n", fileStr, typeStr);
  NSString* path = [[NSBundle mainBundle] pathForResource:fileStr ofType:typeStr];
  
  if (path == NULL) {
    printf("Could not find video file inside of bundle...\n");
    return NULL;
  }
  
  NSDictionary *options = [NSDictionary dictionaryWithObject:[NSNumber numberWithBool:NO] forKey:AVURLAssetPreferPreciseDurationAndTimingKey];
  return [[AVURLAsset alloc] initWithURL:[NSURL fileURLWithPath:path] options:options];
}


void ResourceHandler::ReleaseVideoCaptureLatch() {
  cameraManager.captureLatch->ReleaseLatch();
}

bool ResourceHandler::CheckVideoCaptureLatch() {
  return cameraManager.captureLatch->CheckLatch(1); 
}

Texture* ResourceHandler::CreateVideoCaptureTexture() {
  
  cameraManager = [[CameraManager alloc] init];
  [cameraManager retain];
  Texture* cameraTexture = [cameraManager setUpCaptureThread];

  return cameraTexture;
}

Texture* ResourceHandler::CreateVideoTexture(const string &fname) {
  return CreateVideoTexture(fname, false, true, true); 
}

Texture* ResourceHandler::CreateVideoTexture(const string &fname, bool useAudio, bool autoPlay, bool autoLoop ) {
  AVAsset* currentAsset = (AVAsset*)RetrieveAsset(fname);
  NSDate *date = [NSDate dateWithTimeIntervalSinceNow: 3.0];
  double atTime = [date timeIntervalSinceReferenceDate];
  
  //SET UP AUDIO TRACK
  if (useAudio) {
    PlayAudioResource(fname, atTime);
  }
  
  //SET UP VIDEO TRACK
  videoManager = [[VideoManager alloc] init];
  [videoManager retain];
  Texture* videoTexture = [videoManager setUpVideoThread:currentAsset isLooping:autoLoop];
  
  if (autoPlay) {
    [videoManager startVideoThread:atTime];
  }
  return videoTexture;
}

void ResourceHandler::PlayAudioResource(const string &fname) {
  NSDate *atTime = [NSDate dateWithTimeIntervalSinceNow: 3.0];
  double threeSec = [atTime timeIntervalSinceReferenceDate];
  PlayAudioResource(fname, threeSec);
}

void ResourceHandler::PlayAudioResource(const string &fname, double atTime) {
  
  AVAsset* currentAsset = (AVAsset*)RetrieveAsset(fname);
  
  if ([[currentAsset tracksWithMediaType:AVMediaTypeAudio] count] > 0) {
    audioManager = [[AudioManager alloc] init];
    [audioManager retain]; 
    [audioManager resetData];
    [audioManager setUpAudioThread:currentAsset];
    [audioManager startAudioThread:atTime]; 
  }
}

Texture* ResourceHandler::CreateTextureFromBytes(int tw, int th, GLubyte* bytes) {
  
  return new Texture(bytes, tw, th, GL_RGBA, GL_UNSIGNED_BYTE);
}

Texture* ResourceHandler::CreateTextureFromImageFile(const string &fname) {
  
  NSString* basePath = [[NSString alloc] initWithUTF8String:fname.c_str()];
  NSArray* splits = [basePath componentsSeparatedByString: @"."];
  
  NSString* fileStr = [splits objectAtIndex:0];
  NSString* typeStr = [splits objectAtIndex:1];
  
  NSString* path = [[NSBundle mainBundle] pathForResource:fileStr ofType:typeStr];
  NSLog(@"Loading texture: %@.%@\n", fileStr, typeStr);
  
  NSData *texData = [[NSData alloc] initWithContentsOfFile:path];
  UIImage *image = [[UIImage alloc] initWithData:texData];
  
  if (image == nil) {
    NSLog(@"Umm... ERROR!!!! image is NULL!!!!");
  }
  
  int _w = CGImageGetWidth(image.CGImage);
  int _h = CGImageGetHeight(image.CGImage);
  
  /* //test to make POT
   
   int useW = 2048;
   int useH = 2048;
   int marginW = (_w - useW)/2;
   int marginH = (_h - useH)/2;
   _w = useW;
   _h = useH;
   */
  
  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  GLubyte* data = (GLubyte*)malloc( _w * _h * 4 );
  
  CGContextRef context = CGBitmapContextCreate( data, _w, _h, 8, 4 * _w, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big );
  CGColorSpaceRelease( colorSpace );
  CGContextClearRect( context, CGRectMake( 0, 0, _w, _h ) );
  //CGContextTranslateCTM( context, 0, height - height );
  
  //  CGContextTranslateCTM(context, _w, 0);
  //  CGContextScaleCTM(context, -1, 1);
  
  
  
  CGContextDrawImage( context, CGRectMake( 0, 0, _w, _h ), image.CGImage );
  //CGContextDrawImage( context, CGRectMake( marginW, marginH, useW, useH ), image.CGImage );
  
  
  CGContextRelease(context);
  
  [texData release];
  
  return new Texture(data, _w, _h, GL_RGBA, GL_UNSIGNED_BYTE);
  //return new Texture(data, useW, useH, GL_RGBA, GL_UNSIGNED_BYTE);
}


Texture* ResourceHandler::MakeLookupTable() {
  GLubyte* lookup = (GLubyte*)malloc( (4 * 4) * 1 ); //luminance texture
  
  lookup[0] = 1;
  lookup[1] = 2;
  lookup[2] = 4;
  lookup[3] = 8;
  lookup[4] = 16;
  lookup[5] = 32;
  lookup[6] = 64;
  lookup[7] = 128;
  lookup[8] = 1;
  lookup[9] = 2;
  lookup[10] = 4;
  lookup[11] = 8;
  lookup[12] = 16;
  lookup[13] = 32;
  lookup[14] = 64;
  lookup[15] = 128;
  
  Texture* lookupTexture = new Texture(lookup, 4, 4, GL_LUMINANCE, GL_UNSIGNED_BYTE);
  return lookupTexture;
}

GLubyte* ResourceHandler::CompressToBits(int tw, int th, GLubyte* data) {
  
  int bw = tw/4;
  int bh = th/4;
  GLubyte* compressedData = (GLubyte*)malloc( (bw) * (bh) * 4 );
  
  int cidx = 0;
  
  for (int by = 0; by < bh; by++) {
    for (int bx = 0; bx < bw; bx++) {
      
      int red = 0;
      int green = 0;
      
      for (int m = 0; m < 4; m++) {
        for (int n = 0; n < 4; n++) {
          
          int rowOffset = ((by * 16) * tw) + ((m*4) * (tw)); //correct
          int colOffset = (bx * 16) + (n*4); 
          
          int idx = rowOffset  +  colOffset;
          
          //    printf("(%d/%d):(%d,%d): rowIdx/colOffset = %d/%d, idx = %d\n", by,bx,m,n, rowOffset, colOffset, idx);
          
          //just need to check the red pixel to see if black or white
          if (data[idx] > 0) {
            //white
            
            int bit = (m * 4) + n; //0 -> 15
            if (bit >= 8) {
              //use green
              bit -= 8;
              green += (int)pow(2.0, bit);
            } else {
              //use red
              red += (int)pow(2.0, bit);
            }
            
          } else {
            //black 
          }
        }
      }
      
      compressedData[cidx] = red;
      compressedData[cidx+1] = green;
      compressedData[cidx+2] = 0;
      compressedData[cidx+3] = 0;
      
      cidx+=4;
    }
  }
  
  return compressedData;
}

GLubyte* ResourceHandler::UncompressFromBits(int bw, int bh, GLubyte* data) {
  
  GLubyte* uncompressedData = (GLubyte*)malloc( (bw*4) * (bh*4) * 4 );
  
  int ubw = bw * 4;
  
  int cidx = 0;
  int uidx; 
  
  for (int i = 0; i < bh; i++) {
    for (int j = 0; j < bw; j++) {
      
      int red = data[cidx];
      int green = data[cidx + 1];
      
      // printf("block (%d,%d), red=%d, green=%d\n", i, j, red, green);
      
      for (int m = 0; m < 4; m++) {
        for (int n = 0; n < 4; n++) {
          
          int rowOffset = 4 * ((i * ubw * 4) + (m * ubw));
          int colOffset = (j * 16) + (n*4);                   
          
          uidx = rowOffset + colOffset; 
          
          // printf("\tpos(%d/%d) = %d/%d, %d : ", m,n,rowOffset, colOffset,uidx);
          
          bool isOn = false;
          int bit = (m * 4) + n; //0 -> 15
          if (bit >= 8) {
            //use green
            bit -= 8;
            
            int mask = (int)pow(2.0, bit);
            //  printf(" bit = %d, green, %d ", bit, mask);
            
            if ((green & mask) > 0 ) {
              isOn = true;
              //printf("is ON!!!\n");
            }
          } else {
            //use red
            int mask = (int)pow(2.0, bit);
            if ((red & mask) > 0) {
              isOn = true;
            }
          }
          
          if (isOn) {
            uncompressedData[uidx] = 255;
            uncompressedData[uidx + 1] = 255;
            uncompressedData[uidx + 2] = 255;
            uncompressedData[uidx + 3] = 255;
          } else {
            uncompressedData[uidx] = 0;
            uncompressedData[uidx + 1] = 0;
            uncompressedData[uidx + 2] = 0;
            uncompressedData[uidx + 3] = 255;
          }
          
        }
      }
      
      cidx += 4;
    }
  }
  
  return uncompressedData;
}

Texture** ResourceHandler::LoadNaturalMaterialsTexture(const string &fname, int tw, int th, int cols, int rows, int slices, int numTextures) {
  
  bool compressToBits = false; //true;
  bool useLuminance = true;
  NSString* basePath = [[NSString alloc] initWithUTF8String:fname.c_str()];
  NSArray* splits = [basePath componentsSeparatedByString: @"."];
  
  NSString* fileStr = [splits objectAtIndex:0];
  NSString* typeStr = [splits objectAtIndex:1];
  
  int dw = tw * cols;
  int dh = th * rows;
  
  //int numTextures = 2;
  Texture** textures = (Texture**)malloc(numTextures * sizeof(Texture*));
  
  int i = 1;
  
  for (int t = 0; t < numTextures; t++) {
    
    Texture* duniteTex;
    
    if (compressToBits == true) {
      duniteTex = new Texture(dw / 4, dh / 4, GL_RGBA, GL_UNSIGNED_BYTE);
      duniteTex->SetFilterModes(GL_LINEAR, GL_LINEAR);
    } else if (useLuminance == true) {
      duniteTex = new Texture(dw, dh, GL_LUMINANCE, GL_UNSIGNED_BYTE);
      // duniteTex->SetFilterModes(GL_NEAREST, GL_NEAREST);
      
    } else {
      duniteTex = new Texture(dw, dh, GL_RGBA, GL_UNSIGNED_BYTE);
    }    
    
    for (int y = 0; y < rows; y++) {
      for (int x = 0; x < cols; x++) {
        
        NSString* useFileStr = [NSString stringWithFormat:@"%@%d", fileStr, i];
        NSString* path = [[NSBundle mainBundle] pathForResource:useFileStr ofType:typeStr];
        //NSLog(@"Loading texture: %@.%@\n", useFileStr, typeStr);
        
        NSData *texData = [[NSData alloc] initWithContentsOfFile:path];
        UIImage *image = [[UIImage alloc] initWithData:texData];
        
        int _w = CGImageGetWidth(image.CGImage);
        int _h = CGImageGetHeight(image.CGImage);
        
        //CGColorSpaceRef colorSpace = CGImageGetColorSpace(image.CGImage);
        //CGColorSpaceRef colorSpace = kCGColorSpaceModelMonochrome;
        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        //CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceGray();
        GLubyte* data = (GLubyte*)malloc( _w * _h * 4 );
        
        CGContextRef context = CGBitmapContextCreate( data, _w, _h, 8, 4 * _w, colorSpace, kCGImageAlphaPremultipliedLast |kCGBitmapByteOrder32Big );
        
        CGColorSpaceRelease( colorSpace );
        CGContextClearRect( context, CGRectMake( 0, 0, _w, _h ) );
        
        CGContextDrawImage( context, CGRectMake( 0, 0, _w, _h ), image.CGImage );
        //CGContextDrawImage( context, CGRectMake( marginW, marginH, useW, useH ), image.CGImage );    
        CGContextRelease(context);
        [texData release];
        
        //write this data into the big texture
        duniteTex->Bind();
        
        if (compressToBits == true) {
          
          GLubyte* compressedData = CompressToBits(tw, th, data);
          
          glTexSubImage2D(GL_TEXTURE_2D, 0, x * (_w/4), y * (_h/4), (_w/4), (_h/4), GL_RGBA, GL_UNSIGNED_BYTE, compressedData);
          free(data);
          
        } else if (useLuminance == true) {
          
          GLubyte* luminanceData = (GLubyte*)malloc( _w * _h );
          for (int idx = 0, lidx = 0; idx < _w * _h * 4; idx += 4, lidx++) {
            luminanceData[lidx] = data[idx];
          }
          
          glTexSubImage2D(GL_TEXTURE_2D, 0, x * _w, y * _h, _w, _h, GL_LUMINANCE, GL_UNSIGNED_BYTE, luminanceData);
          
          free(luminanceData);
          free(data);
          
        } else {
          
          //normal rgba
          glTexSubImage2D(GL_TEXTURE_2D, 0, x * _w, y * _h, _w, _h, GL_RGBA, GL_UNSIGNED_BYTE, data);
          free(data);
        }
        
        duniteTex->Unbind();
        i++;
      }
    }
    
    textures[t] = duniteTex;
    
  }
  
  return textures;
}



int MatchPattern(NSString *string, NSString* pattern) {
  
  NSError *error;
  //NSString *pattern = @"x=[0-9+]";
  
  NSRegularExpression *regularExpression = [NSRegularExpression regularExpressionWithPattern:pattern options:0 error:&error];
  if ( ! regularExpression) {
    NSLog(@"Error in pattern <%@>: %@", pattern, error);
    exit(0);
  }
  
  NSRange range = NSMakeRange(0, [string length]);
  NSArray *matches = [regularExpression matchesInString:string options:0 range:range];
  if ([matches count]) {
    NSTextCheckingResult *firstMatch = [matches objectAtIndex:0];
    // NSLog(@"Found %lu submatches", (unsigned long)[firstMatch numberOfRanges]);
    for (NSUInteger i = 0; i < [firstMatch numberOfRanges]; ++i) {
      NSRange range = [firstMatch rangeAtIndex:i];
      NSString *submatch = [string substringWithRange:range];
      // NSLog(@"submatch %lu: <%@>", (unsigned long)i, submatch);   
      
      NSArray* splits = [submatch componentsSeparatedByString: @"="];
      return [[splits objectAtIndex:1] intValue];
    }
  } else {
    // NSLog(@"Pattern <%@> doesn't match string <%@>", pattern, string);
  }
  return -1;
}

NSString* MatchPatternString(NSString *string, NSString* pattern) {
  
  NSError *error;
  
  NSRegularExpression *regularExpression = [NSRegularExpression regularExpressionWithPattern:pattern options:0 error:&error];
  if ( ! regularExpression) {
    NSLog(@"Error in pattern <%@>: %@", pattern, error);
    exit(0);
  }
  
  NSRange range = NSMakeRange(0, [string length]);
  NSArray *matches = [regularExpression matchesInString:string options:0 range:range];
  if ([matches count]) {
    NSTextCheckingResult *firstMatch = [matches objectAtIndex:0];
    // NSLog(@"Found %lu submatches", (unsigned long)[firstMatch numberOfRanges]);
    for (NSUInteger i = 0; i < [firstMatch numberOfRanges]; ++i) {
      NSRange range = [firstMatch rangeAtIndex:i];
      NSString *submatch = [string substringWithRange:range];
      // NSLog(@"submatch %lu: <%@>", (unsigned long)i, submatch);   
      
      NSArray* splits = [submatch componentsSeparatedByString: @"=\""];
      return [splits objectAtIndex:1];
    }
  } else {
    // NSLog(@"Pattern <%@> doesn't match string <%@>", pattern, string);
  }
  return @"UNKNOWN";
}


//requires there to be a (.png) texture atlas and its associated AngelFont (.fnt) file 
FontAtlas* ResourceHandler::LoadFontAtlas(const string &fname) {
  
  NSString* face;
  int sizeVal;
  bool isBold;
  bool isItalic;
  int lineHeightVal;
  int baseVal;
  int twVal;
  int thVal;
  map<char, FontData*> values;
  
  cout << "fontName = " <<fname <<"\n"; 
  Texture* fontTexture = CreateTextureFromImageFile(fname + ".png");
  
  NSString* basePath = [[NSString alloc] initWithUTF8String:fname.c_str()];
  NSString* path = [[NSBundle mainBundle] pathForResource:basePath ofType:@"fnt"];
  //NSLog(@"path: %@\n", path);
  
  NSString *contents = [NSString stringWithContentsOfFile:path encoding:NSASCIIStringEncoding error:nil];
  NSArray *lines = [contents componentsSeparatedByCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"\r\n"]];
  for (NSString* line in lines) {
    if (line.length) {
      //NSLog(@"line: %@", line);
      
      if([line hasPrefix:@"info"]) {
        //printf("info line...\n");
        
        face = MatchPatternString(line, @"face=\"[0-9a-zA-Z]+");
        sizeVal = MatchPattern(line, @"size=[0-9]+");
        isBold = MatchPattern(line, @"bold=[0-9]+");
        isItalic = MatchPattern(line, @"italic=[0-9]+");
        //NSLog(@"info: face=%@, size=%d, isBold=%d, isItalic=%d\n", face, sizeVal, isBold, isItalic); 
      } else if ([line hasPrefix:@"common"]) {
        lineHeightVal = MatchPattern(line, @"lineHeight=[0-9]+");
        baseVal = MatchPattern(line, @"base=[0-9]+");
        twVal = MatchPattern(line, @"scaleW=[0-9]+");
        thVal = MatchPattern(line, @"scaleH=[0-9]+");
        //printf("found line lineHeight:%d, base:%d, scaleW:%d scaleH:%d\n", lineHeightVal, baseVal, twVal, thVal);
      } else if ([line hasPrefix:@"char id"]) {
        int idVal = MatchPattern(line, @"id=[0-9]+");
        int xVal = MatchPattern(line, @"x=[0-9]+");
        int yVal = MatchPattern(line, @"y=[0-9]+");
        int wVal = MatchPattern(line, @"width=[0-9]+");
        int hVal = MatchPattern(line, @"height=[0-9]+");
        int xOffsetVal = MatchPattern(line, @"xoffset=[0-9]+");
        int yOffsetVal = MatchPattern(line, @"yoffset=[0-9]+");
        int xAdvance = MatchPattern(line, @"xadvance=[0-9]+");
        
        //printf("found x (%c) ,y,id : %d, %d, %d\n", idVal, xVal, yVal, idVal);
        values.insert(std::pair<char, FontData*>(idVal, new FontData((char)idVal, xVal, yVal, wVal, hVal, xOffsetVal, yOffsetVal, xAdvance)));
        
      } else {
        //printf("HUH???");
      }
    }
  }
  
  return new FontAtlas(fontTexture, twVal, thVal, 
                       [face UTF8String], isBold, isItalic, 
                       lineHeightVal, baseVal,
                       values );
  
}




Texture* ResourceHandler::LoadDunitesTexture(const string &fname) { //, int _w, int _h, int _d) {
  
  int _w = 123;
  int _h = 200;
  //int _d = 60;
  
  int cols = 10;
  int rows = 6;
  //let's try 10x6
  int dw = _w * cols;
  int dh = _h * rows;
  
  Texture* duniteTex = new Texture(dw, dh, GL_RGBA, GL_UNSIGNED_BYTE);
  
  NSString* basePath = [[NSString alloc] initWithUTF8String:fname.c_str()];
  NSArray* splits = [basePath componentsSeparatedByString: @"."];
  
  NSString* fileStr = [splits objectAtIndex:0];
  NSString* typeStr = [splits objectAtIndex:1];
  
  //GLubyte* alldata = (GLubyte*)malloc( (_w * _h * 4) * _d );
  
  int i = 1;
  
  for (int y = 0; y < rows; y++) {
    
    for (int x = 0; x < cols; x++) {
      
      NSString* useFileStr = [NSString stringWithFormat:@"%@%02d", fileStr, i];
      NSString* path = [[NSBundle mainBundle] pathForResource:useFileStr ofType:typeStr];
      NSLog(@"Loading texture: %@.%@\n", useFileStr, typeStr);
      
      NSData *texData = [[NSData alloc] initWithContentsOfFile:path];
      UIImage *image = [[UIImage alloc] initWithData:texData];
      
      int _w = CGImageGetWidth(image.CGImage);
      int _h = CGImageGetHeight(image.CGImage);
      
      CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
      GLubyte* data = (GLubyte*)malloc( _w * _h * 4 );
      
      CGContextRef context = CGBitmapContextCreate( data, _w, _h, 8, 4 * _w, colorSpace, kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big );
      CGColorSpaceRelease( colorSpace );
      CGContextClearRect( context, CGRectMake( 0, 0, _w, _h ) );
      
      CGContextDrawImage( context, CGRectMake( 0, 0, _w, _h ), image.CGImage );
      //CGContextDrawImage( context, CGRectMake( marginW, marginH, useW, useH ), image.CGImage );    
      CGContextRelease(context);
      [texData release];
      
      //write this data into the big texture
      duniteTex->Bind();
      glTexSubImage2D(GL_TEXTURE_2D, 0, x * _w, y * _h, _w, _h, GL_RGBA, GL_UNSIGNED_BYTE, data);
      duniteTex->Unbind();
      
      i++;
    }
  }
  
  return duniteTex;
  // return new Texture(alldata, _w, _h, _d, GL_RGBA, GL_UNSIGNED_BYTE); 
  
}


