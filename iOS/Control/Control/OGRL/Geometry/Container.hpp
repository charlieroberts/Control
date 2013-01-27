#include "Rectangle.hpp"

#ifndef OGRLContainer_H
#define OGRLContainer_H


//A Container is a Geom that holds an a series of sub Geoms, but doesn't actually draw anything itself. Rather it's Draw method runs once only to Install all the children Geoms.

//This is needed because otherwise the children Geoms won't inheret from the parent properly (because the parent hasn't been completely created - the parent itself hasn't yet been added to the Scene Graph, and has no parent or camera, etc.

//To use: Inheret this class and put all logic into an overridden InstallWidgets method.


class Container : public Rectangle { 
  
public:
  
  Container();
  void Draw();
  virtual void InstallWidgets() = 0;
  
  bool isUpdated;
  
protected:
  
  bool widgetsInstalled;
};

#endif
