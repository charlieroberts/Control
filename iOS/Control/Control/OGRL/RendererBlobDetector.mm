

#include "RendererBlobDetector.h"
#include "Rectangle3D.hpp"
#include "Rectangle.hpp"
#include "Geom.hpp"
#include "TextRect.hpp"
#include "Cube.hpp"
#include "RectBlobDetect.h"
#include "ContainerBlobInfo.h"

float cameraZ;

void RendererBlobDetector::Initialize() {    
  
  
  /*
  Rectangle* r = new Rectangle();
  r->SetColor(1,0,0,1);
  r->SetTranslate(0.0, 0.3);
  
  r->SetSize(1.0, 0.7);
  r->IsSelectable = true;  
  AddGeom(r);
 */
  
  
  
  ContainerBlobInfo* info = new ContainerBlobInfo();
  info->SetColor(new Color(vec4(0.0,0.0,0.0,1.0)));
  info->SetScale(1.0, 0.3);
  AddGeom(info);
  
  RectBlobDetect* rbd = new RectBlobDetect();
  rbd->SetTranslate(0.0,0.3);
  //rbd->SetScaleAnchor(0.5, 0.5);
  rbd->SetScale(1,.7);
  rbd->IsSelectable = true;
  AddGeom(rbd);

  rbd->AttachController(info);
  
  
  
  
/*  
 // GetFont("CMUSerifUprightItalic60")->Bind(); {
    GetFont("Univers36")->Bind(); {
    //TextRect* t1 = new TextRect(GetFont("CMUSerifUprightItalic60"), "hello");
    TextRect* t1 = new TextRect("@@!@#hello");
    t1->SetTranslate(0.3,0,0);
    t1->SetHeight(0.15);
    t1->SetBackgroundColor(Color::Float(1.0,0,0,0.7));
    t1->SetColor(Color::Float(0.0,0,1.0,1.0));
      
    AddGeom(t1);
  }
*/
  /*
  
  Renderer::GetRenderer()->GetFont("Helvetica36")->Bind(); {
    TextRect* t1 = new TextRect("hell....!!o");
    t1->SetTranslate(0.15,0.5,0);
    t1->SetHeight(0.5);
    
  //  t1->SetBackgroundColor(Color::Float(0.5));
     t1->SetBackgroundColor(Color::Float(1.0,0,0,0.7));
    t1->SetColor(Color::RGB(255,255,255,255));
    
    AddGeom(t1);
  }
*/
  
  
  /*
  int numSliders = 3;
  
  float sliderInc = (1.0/numSliders);
  
  for (int i = 0; i < numSliders; i++) {
  Rectangle* doubleSlider1 = new Rectangle();
  doubleSlider1->SetTranslate( sliderInc * i, 0);
  doubleSlider1->SetColor(0,0,0.3*i,1);
  doubleSlider1->SetSize(sliderInc, 1.0);
    doubleSlider1->IsSelectable = true;  
  r2->AddGeom(doubleSlider1);
  
  }
  */
  
}


void RendererBlobDetector::Draw() { 
}

 


void RendererBlobDetector::HandleTouchBegan(ivec2 mouse) {
  
  ivec2 um = ivec2(mouse.x, height - mouse.y);
  printf("height = %d, mouse then um\n", height);
  mouse.Print("mouse = ");
  um.Print("adjusted mouse = ");
  
  vector<Geom*> gcwp = GetGeomsContainingWindowPoint(mouse); //may need to use (um) in real device
  
  printf("we found %lu geoms containing the mouse touch\n", gcwp.size());
  if (gcwp.size() > 0) {
    selectedGeom = gcwp[gcwp.size() - 1]; //this will return one of the more deeply nested, need to do something smarter to get smallest or closest to camera.
    
    cout << "geom at " << selectedGeom->GetTranslate().String() << " contains mouse point!\n";
    selectedGeom->HandleTouchBegan(mouse);
  
  } else {
    selectedGeom = NULL;
  }
}

void RendererBlobDetector::HandleTouchEnded(ivec2 mouse) {
  if (selectedGeom != NULL) {
    selectedGeom->HandleTouchEnded(mouse);
  }
} 
void RendererBlobDetector::HandleTouchMoved(ivec2 prevMouse, ivec2 mouse) {
  if (selectedGeom != NULL) {
    selectedGeom->HandleTouchMoved(prevMouse, mouse);
  }
}

void RendererBlobDetector::HandlePinch(float scale) {
  if (selectedGeom != NULL) {
    selectedGeom->HandlePinch(scale);
  }
}

void RendererBlobDetector::HandlePinchEnded() {
  if (selectedGeom != NULL) {
    selectedGeom->HandlePinchEnded();
  }
}

void RendererBlobDetector::HandleLongPress(ivec2 mouse) {
  if (selectedGeom != NULL) {
    selectedGeom->HandleLongPress(mouse);
  }
}



