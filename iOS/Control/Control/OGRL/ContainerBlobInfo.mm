#include "ContainerBlobInfo.h"
#include "Renderer.hpp"
#include "TextRect.hpp"


ContainerBlobInfo::ContainerBlobInfo() {
  widgetsInstalled = false;
}

void ContainerBlobInfo::InstallWidgets() {
  
  float sliderH = 0.7;
  float sliderInc = (1.0/6.0);
  
 
  
  /*
  Renderer::GetRenderer()->GetFont("Helvetica36")->Bind(); {
    TextRect* t1 = new TextRect("hell....!!o");
    t1->SetTranslate(0.15,0.2,0);
    t1->SetHeight(0.2);
    
    t1->SetBackgroundColor(Color::Float(0.5));
    t1->SetColor(Color::RGB(255,255,255,255));
    
    AddGeom(t1);
  }
  */
  
  //text above y=0.7
  //sliders below y=0.7
  
  doubleSliderRed = new DoubleSlider(this);
  doubleSliderRed->CenterAt(sliderInc * 0 + sliderInc/2.0, 0.5);
  doubleSliderRed->SetColor(Color::RGB(255,0,0));
  doubleSliderRed->SetScale(sliderInc, sliderH);
  doubleSliderRed->IsSelectable = true;  
  AddGeom(doubleSliderRed);
  
  doubleSliderGreen = new DoubleSlider(this);
  doubleSliderGreen->CenterAt(sliderInc * 1 + sliderInc/2.0, 0.5);
  doubleSliderGreen->SetColor(Color::RGB(0,255,0));
  doubleSliderGreen->SetScale(sliderInc, sliderH);
  doubleSliderGreen->IsSelectable = true;  
  AddGeom(doubleSliderGreen);

  doubleSliderBlue = new DoubleSlider(this);
  doubleSliderBlue->CenterAt(sliderInc * 2 + sliderInc/2.0, 0.5);
  doubleSliderBlue->SetColor(Color::RGB(0,0,255));
  doubleSliderBlue->SetScale(sliderInc, sliderH);
  doubleSliderBlue->IsSelectable = true;  
  AddGeom(doubleSliderBlue);
  
  pixelView = new Rectangle();
  //pixelView->drawBorder = true;
  pixelView->CenterAt(sliderInc * 3 + sliderInc/2.0, 0.5);
  pixelView->SetColor(Color::RGB(150));
  pixelView->SetScale(sliderInc*.75, 0.3);
  AddGeom(pixelView);
  
  doubleSliderSize = new DoubleSlider(this);
  doubleSliderSize->CenterAt(sliderInc * 4 + sliderInc/2.0, 0.5);
  doubleSliderSize->SetColor(Color::RGB(0,0,255));
  doubleSliderSize->SetScale(sliderInc, sliderH);
  doubleSliderSize->IsSelectable = true;  
  AddGeom(doubleSliderSize);
  
  doubleSliderDensity = new DoubleSlider(this);
  doubleSliderDensity->CenterAt(sliderInc * 5 + sliderInc/2.0, 0.5);
  doubleSliderDensity->SetColor(Color::RGB(0,0,255));
  doubleSliderDensity->SetScale(sliderInc, sliderH);
  doubleSliderDensity->IsSelectable = true;  
  AddGeom(doubleSliderDensity);
  
  widgetsInstalled = true;
}


void ContainerBlobInfo::SetPixel(ivec4 pixel) {
  pixelView->SetColor(new Color(pixel)); //Color::Float(pixel.x/255.0, pixel.y/255.0, pixel.z/255.0, pixel.w/255.0));
}

void ContainerBlobInfo::SetRed(int min, int max) {
  doubleSliderRed->minVal = (float) (min / 255.0);
  doubleSliderRed->maxVal = (float) (max / 255.0);
}

ivec2 ContainerBlobInfo::GetRed() {
  return ivec2((int)(doubleSliderRed->minVal * 255.0), (int)(doubleSliderRed->maxVal * 255.0));
}

void ContainerBlobInfo::SetGreen(int min, int max) {
  doubleSliderGreen->minVal = (float) (min / 255.0);
  doubleSliderGreen->maxVal = (float) (max / 255.0);
}

ivec2 ContainerBlobInfo::GetGreen() {
  return ivec2((int)(doubleSliderGreen->minVal * 255.0), (int)(doubleSliderGreen->maxVal * 255.0));

}


void ContainerBlobInfo::SetBlue(int min, int max) {
  doubleSliderBlue->minVal =(float) (min / 255.0);
  doubleSliderBlue->maxVal =(float) (max / 255.0);
}

ivec2 ContainerBlobInfo::GetBlue() {
  return ivec2((int)(doubleSliderBlue->minVal * 255.0), (int)(doubleSliderBlue->maxVal * 255.0));

}


void ContainerBlobInfo::Draw() {

  Container::Draw();
  
  //Rectangle::Draw();
  
  

}


//void ContainerBlobInfo::HandleTouchBegan(ivec2 mouse) {}
//void ContainerBlobInfo::HandleTouchMoved(ivec2 prevMouse, ivec2 mouse) {



//}
