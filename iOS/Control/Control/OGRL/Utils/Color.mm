
#include "Color.hpp"
#include "Utils.hpp"


Color::Color(ivec4 _color)  {
  color = _color;
}

Color::Color(ivec3 _color) {
  color = ivec4(_color.x, _color.y, _color.z, 255);
}

Color::Color(vec4 _color) { 
  color = ivec4(_color.x * 255.0, _color.y * 255.0, _color.z * 255.0, _color.w * 255.0);
}

Color::Color(vec3 _color) {
  color = ivec4(_color.x * 255, _color.y * 255, _color.z * 255, 255);
}

Color* Color::RGB(int r, int g, int b, int a) {
  return new Color(ivec4(r,g,b,a));
}

Color* Color::RGB(int r, int g, int b) {
  return new Color(ivec3(r,g,b));
}

Color* Color::RGB(int gray) {
  return new Color(ivec3(gray,gray,gray));
}

Color* Color::RGB(int gray, int a) {
  return new Color(ivec4(gray,gray,gray,a));
}

Color* Color::Float(float r, float g, float b, float a) {
  return new Color(vec4(r,g,b,a));
}

Color* Color::Float(float r, float g, float b) {
  return new Color(vec3(r,g,b));
}

Color* Color::Float(float gray) {
  return new Color(vec3(gray,gray,gray));
}

Color* Color::Float(float gray, float a) {
  return new Color(vec4(gray,gray,gray,a));
}

vec4 Color::AsFloat() {
  return vec4(color.x/255.0, color.y/255.0, color.z/255.0, color.w/255.0);
}

ivec4 Color::AsInt() {
  return color; 
}

int Color::Red() {
  return color.x;
}

int Color::Green() {
  return color.y;
}

int Color::Blue() {
  return color.z;
}

int Color::Alpha() {
  return color.w;
}

float Color::Luma(vec4 rgba) {
  return ((float)rgba.x * 0.2126) +  ((float)rgba.y * 0.7152) + ((float)rgba.z * 0.0722) ;  
}


int Color::Luma(ivec4 rgba) {
  return (int)((float)rgba.x * 0.2126) +  ((float)rgba.y * 0.7152) + ((float)rgba.z * 0.0722) ;  
}

int Color::Luma() {
  return (int)((float)color.x * 0.2126) +  ((float)color.y * 0.7152) + ((float)color.z * 0.0722) ;
}


