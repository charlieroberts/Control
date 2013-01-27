#include "Vector.hpp"


#ifndef VirtualDatasetsIOS_Blob_h
#define VirtualDatasetsIOS_Blob_h

class Blob { 
  
public:
  
  Blob(ivec2 pixel);
  Blob(ivec4 merged, int _numPixels);
  
  int numPixels; ///use to calculate pixel density
  int left;
  int right;
  int top;
  int bottom;
  
  int inclusionPixelDistance;
  
  bool AddPixel(ivec2 pixel);
  
  bool markedForRemoval;
  
  
  int CalculateSize();
  float CalculateDensity(int pixelSkip);
  
private:
  
};



#endif
