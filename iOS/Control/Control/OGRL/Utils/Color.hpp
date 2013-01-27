
#include "Vector.hpp"

#ifndef OGRL_Color_hpp
#define OGRL_Color_hpp

class Color {

public:
  
  static Color* RGB(int r, int g, int b, int a);
  static Color* RGB(int r, int g, int b);
  static Color* RGB(int gray);
  static Color* RGB(int gray, int a);
  static Color* Float(float r, float g, float b, float a);
  static Color* Float(float r, float g, float b);
  static Color* Float(float gray);
  static Color* Float(float gray, float a);
  
 // Color();
  Color(ivec4 color);
  Color(ivec3 color);
  Color(vec4 color);
  Color(vec3 color);
   
  
  vec4 AsFloat();
  //const float* Pointer() const;
  ivec4 AsInt();
  int Red();
  int Green();
  int Blue();
  int Alpha();
  int Luma();
  
  
  static float Luma(vec4 rgba);
  static int Luma(ivec4 rgba);
  
  
  ivec4 color;
  
  
   
private:
  void AliasElements();
};
#endif
