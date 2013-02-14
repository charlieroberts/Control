#include "Blob.h"

#define INCLUSION_DISTANCE 30 //should be at least PIXEL_SKIP or PIXEL_SKIP * some multiple
#define MAX_BLOB_WIDTH 250 //should be related to resolution of video
#define MAX_BLOB_HEIGHT 250
//for blob made from a starting pixel seed
Blob::Blob(ivec2 pixel) {

    //Hey
  numPixels = 0;
    left = pixel.x;
    right = pixel.x;
    bottom = pixel.y;
    top = pixel.y;
  
    inclusionPixelDistance = INCLUSION_DISTANCE;
    markedForRemoval = false;
}

//for merged blobs
Blob::Blob(ivec4 merged, int _numPixels) {
  
  numPixels = _numPixels;
  left = merged.x;
  right = merged.y;
  bottom = merged.z;
  top = merged.w;
  inclusionPixelDistance = INCLUSION_DISTANCE;
  markedForRemoval = false;
}

int Blob::CalculateSize() {
  return ((right - left) + 1) * ((top - bottom) + 1);
}

float Blob::CalculateDensity(int pixelSkip) {
  return ( (float) (numPixels * pixelSkip * pixelSkip )/ (float) CalculateSize()  );
}

bool Blob::AddPixel(ivec2 pixel) {
  //printf("add %d/%d into %d/%d -> %d/%d? ...", pixel.x, pixel.y, left - inclusionPixelDistance,     bottom - inclusionPixelDistance,     right + inclusionPixelDistance,     top + inclusionPixelDistance);
  
  
  if (pixel.x <= left - inclusionPixelDistance || 
      pixel.x >= right + inclusionPixelDistance || 
      pixel.y <= bottom - inclusionPixelDistance || 
      pixel.y >= top + inclusionPixelDistance) 
  {
    return false;
  }
     
  float _left = min(pixel.x, left );
  float _right = max(pixel.x, right );
  float _bottom = min(pixel.y, bottom );
  float _top = max(pixel.y, top );
  
  if (_top - _bottom > MAX_BLOB_HEIGHT || 
      _right - _left > MAX_BLOB_WIDTH) {
    return false;
  }
   
  left = _left;
  right = _right;
  bottom = _bottom;
  top = _top;
    
  numPixels++;
  
  return true; 
  
}
  