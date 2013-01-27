
#include "FontAtlas.hpp"
#include "Renderer.hpp"

FontAtlas::FontAtlas(Texture* _fontTexture, int _tw, int _th, 
          const string &_fontName, bool _isBold, bool _isItalic, 
          int _lineHeight, int _base,
          map<char, FontData*>& _values ) {


  fontTexture = _fontTexture;
  tw = _tw;
  th = _th;
  fontName = _fontName;
  isBold = _isBold;
  isItalic = _isItalic;
  lineHeight = _lineHeight;
  base = _base;
  values = _values;
  
  //should include kerning in here as well... haven't gotten around to it...

 }

map<char, FontData*>& FontAtlas::GetValues() {

  return values;
}

void FontAtlas::Bind() {
  Renderer::GetRenderer()->CurrentFont = this;  
}

void FontAtlas::Unbind() {
  Renderer::GetRenderer()->CurrentFont = NULL;  
}

/*
void FontAtlas::Text( float penx, float peny, string text, vec4 color, bool usePixel ) {
  Renderer::GetRenderer()->Text(this, penx, peny, text, color, usePixel);
}

void FontAtlas::Text( float penx, float peny, string text, vec4 color ) {
  Renderer::GetRenderer()->Text(this, penx, peny, text, color, false);
}
*/
                           
