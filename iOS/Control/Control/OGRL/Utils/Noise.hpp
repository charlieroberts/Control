
#include "Vector.hpp"

#ifndef OpenGLRenderLibraryNS_Noise_hpp
#define OpenGLRenderLibraryNS_Noise_hpp

class Noise {

public:
  static GLubyte* CreateRgbNoise(int _w, int _h);
  static GLubyte* CreateColorNoise(int _w, int _h);
  
  static GLubyte* CreateColorSolid(ivec4 _color, int _w, int _h);
  
};
#endif
