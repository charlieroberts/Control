#include "Container.hpp"
#include "DoubleSlider.h"

#ifndef ContainerBlobInfo_h
#define ContainerBlobInfo_h

class ContainerBlobInfo : public Container { 
  
public:
  
  ContainerBlobInfo();
  
  DoubleSlider* doubleSliderRed;
  DoubleSlider* doubleSliderGreen;
  DoubleSlider* doubleSliderBlue;
  Rectangle* pixelView;
  DoubleSlider* doubleSliderSize;
   DoubleSlider* doubleSliderDensity;
  
  
  ivec4 selectedPixel;
  int minRed;
  int maxRed;
  int minGreen;
  int maxGreen;
  int minBlue;
  int maxBlue;
  int minLuma;
  int maxLuma;
  float minDensity;
  int minBlobSize;
  int maxBlobWidth;
  int maxBlobHeight;
  
  
  void SetRed(int min, int max);
  ivec2 GetRed();
  void SetGreen(int min, int max);
  ivec2 GetGreen();
  void SetBlue(int min, int max);
  ivec2 GetBlue();
  void SetPixel(ivec4 pixel);
  void Draw();

//  void HandleTouchBegan(ivec2 mouse); 
//  void HandleTouchMoved(ivec2 prevMouse, ivec2 mouse); 
  void InstallWidgets();
  
private:
  
};

#endif
