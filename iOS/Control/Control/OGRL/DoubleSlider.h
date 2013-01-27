





#include "Rectangle.hpp"
#include "Container.hpp"
#include "Color.hpp"
#include <vector>
#include <list>


#ifndef OGRL_DoubleSlider
#define OGRL_DoubleSlider

class DoubleSlider : public Rectangle { 
  
public:
  
  DoubleSlider(Container* _c);
  void Draw();
  
  void HandleTouchBegan(ivec2 mouse); 
  void HandleTouchMoved(ivec2 prevMouse, ivec2 mouse); 
  void HandleTouchEnded(ivec2 mouse); 
  
  float minVal;
  float maxVal;
    
  float handleW; 
  float handleH; 
  
  Container* container;
private:
  void DrawElement(mat4 mv, Color* color);
  void SetHandleModelViews();
  
  mat4 mvBk;
  mat4 mvMin;
  mat4 mvMax;
  
  bool minValSelected;
  bool maxValSelected;
  float offsetY;
  
  Color* backgroundColor;
  
};

#endif
