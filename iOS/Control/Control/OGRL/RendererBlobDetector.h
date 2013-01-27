
//#include "TextureCamera.hpp"
#include "Renderer.hpp" 

#ifndef RendererBlobDetector_hpp
#define RendererBlobDetector_hpp


class RendererBlobDetector : public Renderer {
  
public:
  void Initialize();
  void Draw();
  
 private:
  
  
  Geom* selectedGeom;

  
 //  bool ContainsWindowPoint(ivec2 windowPt);
   void HandleTouchMoved(ivec2 prevMouse, ivec2 mouse);
   void HandleTouchBegan(ivec2 mouse);
  void HandleTouchEnded(ivec2 mouse);
  void HandlePinchEnded();
  void HandlePinch(float scale);
  void HandleLongPress(ivec2 mouse);
  

};


#endif 

