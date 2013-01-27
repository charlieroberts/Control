
#include "Defines.h"

#include "Texture.hpp"
#include "FontAtlas.hpp"
//#include <CoreMotion/CoreMotion.h>
#include <iostream> 
//#include "Renderer.hpp"


#ifndef RESOURCE_HANDLER_H
#define RESOURCE_HANDLER_H

//#import <AVFoundation/AVFoundation.h>

//using namespace std;



class ResourceHandler {
public:
    
  static ResourceHandler* CreateResourceHandler();
  static ResourceHandler* GetResourceHandler();
  
  string GetResourcePath() const;
  
  const char* GetContentsOfFileAsString(string& file);  
  string GetPathForResourceOfType(const string& resource, const string& type);  
  
  Texture* CreateTextureFromImageFile(const string &fname) ;  
  Texture* CreateCubeMapTextureFromImageFile(const string &fname) ;
  Texture* CreateTextureFromBytes(int tw, int th, GLubyte* bytes) ;
  
  Texture* LoadDunitesTexture(const string &fname);
  Texture** LoadNaturalMaterialsTexture(const string &fname, int tw, int th, int cols, int rows, int slices, int textures);

  GLubyte* CompressToBits(int tw, int th, GLubyte* data);
  GLubyte* UncompressFromBits(int bw, int bh, GLubyte* data);
  Texture* MakeLookupTable();
  
  
  FontAtlas* LoadFontAtlas(const string &fname);

  
  void* GetView();
  bool IsUsingGyro();
  void ResetGyroscope();
//  void LoadPngImage(const string& name);
//  void* GetImageData();
//  
//  ivec2 GetImageSize();
//  void UnloadImage();
  
//  void StartAudioThread();
//  void FreeAudio();
//  void AudioSetupTest();
  
  void* RetrieveAsset(const string &fname);
  
  
 
  bool CheckVideoCaptureLatch();
  void ReleaseVideoCaptureLatch();
  
  Texture* CreateVideoCaptureTexture();
  
  Texture* CreateVideoTexture(const string &fname);
  Texture* CreateVideoTexture(const string &fname, bool useAudio, bool autoPlay, bool autoLoop );
  void NextVideoFrame();
  void NextVideoFrameLock();
  void NextVideoFrameUnlock();
  
  void PlayAudioResource(const string &fname);
  //void PlayAudioResource(const string &fname, NSDate* d);
  void PlayAudioResource(const string &fname, double d);


  //void HandlePlayback( Texture* videoTexture, bool isLooping);
  //void HandlePlayback(const Texture &videoTexture) const;
  
  //CMSampleBufferRef* HandlePlayback() const;
  //void ProcessPixelBuffer(CMSampleBufferRef pixelBuffer);
  //void ProcessPixelBuffer() const;
private:
  ResourceHandler();
  static ResourceHandler* instance;
  
  void Replay();
//  CFDataRef m_imageData;
//  ivec2 m_imageSize;
};

#endif

