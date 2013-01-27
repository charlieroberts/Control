#include "Container.hpp"



Container::Container() {
  widgetsInstalled = false;
  
}

void Container::InstallWidgets() {
  int numSliders = 3;
  
  float sliderInc = (1.0/numSliders);
  for (int i = 0; i < numSliders; i++) {
    Rectangle* doubleSlider1 = new Rectangle();
    doubleSlider1->SetTranslate( sliderInc * i, 0);
    doubleSlider1->SetColor(new Color(vec4(0,0.3*i,0,1)));
    doubleSlider1->SetSize(sliderInc, 1.0);
    doubleSlider1->IsSelectable = true;  
    AddGeom(doubleSlider1);
  }
  
  widgetsInstalled = true;
}



void Container::Draw() {

  if (!widgetsInstalled) {
    InstallWidgets();
  }
  
  //I don't actually draw anything

}

//void Container::HandleTouchBegan(ivec2 mouse) {}
//void Container::HandleTouchMoved(ivec2 prevMouse, ivec2 mouse) {}