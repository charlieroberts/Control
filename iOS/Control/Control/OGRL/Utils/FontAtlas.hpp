
#include <map>
#include "FontData.h"
#include "Texture.hpp"
#include "Vector.hpp"
//#include "Program.hpp"

#ifndef OpenGLRenderLibraryNS_FontAtlas_hpp
#define OpenGLRenderLibraryNS_FontAtlas_hpp

//using namespace std;

class FontAtlas { 
  
public:
  
  
  FontAtlas(Texture* _fontTexture, int _tw, int _th, 
            const string& _fontName, bool _isBold, bool _isItalic, 
            int _lineHeight, int _base,
            map<char, FontData*>& _values );
  
  string fontName;
  Texture* fontTexture;
  bool isBold;
  bool isItalic;
  int tw;
  int th;
  int lineHeight;
  int base;
  map<char, FontData*> values;
  
  map<char, FontData*>& GetValues();
  
//  void Text(float pen_x, float pen_y, string text, vec4 color, bool usePixel);
//  void Text(float pen_x, float pen_y, string text, vec4 color);
  
  void Bind();
  void Unbind();
  
  
  
};

#endif
