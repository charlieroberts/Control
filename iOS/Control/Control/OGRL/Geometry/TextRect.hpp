
#include "Matrix.hpp"
#include "Geom.hpp"
#include "FBO.hpp"
#include "Rectangle.hpp"
#include "FontAtlas.hpp"
#include <vector>

#ifndef OGRL_TextRect_H
#define OGRL_TextRect_H


class TextRect : public Rectangle { 
  
public:
  TextRect(string _text);
  TextRect(FontAtlas* _font, string _text);
  //TextRect(vec3 translate, float width, float height);

  FontAtlas* font;
  string text;
  void Init();
  FBO* fontFBO;
  Texture* fontTexture;
  
  void SetWidth(float _w); //sets bounds by width and aspectRatio
  void SetHeight(float _h); //sets bounds by height and aspectRatio
  void SetBackgroundColor(Color* _c);
  
  //from Geom
  virtual void Draw();
  virtual bool ContainsWindowPoint(ivec2 windowPt);
  void SetColor(Color* _c);
  
  //from ModelView
  //virtual void Transform();
  
  //from Mesh
 // virtual void GenerateLineIndices();
 // virtual void GenerateTriangleIndices();
 // virtual int GetVertexCount() ;
 // virtual int GetLineIndexCount() ;
 // virtual int GetTriangleIndexCount() ;
  
  
  string String();
  //float width;
  //float height;

  
private:

  bool needsToBeInitialized;
  
  Color* backgroundColor;
  void DrawBackground();
  void DrawGlyph(FontAtlas* font, float* vs, float* ts);
  float TranslateYOffset;
  float AspectRatio;
  float TextHeight;
  void GenerateVertices();
  
};



#endif
