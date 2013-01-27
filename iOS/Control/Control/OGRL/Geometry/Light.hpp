
#include "Sphere.hpp"
//#include "Renderer.hpp"

#ifndef LIGHT
#define LIGHT

class Light : public Sphere {
  
public:
  Light(vec3 _translate, vec3 _color);
  
private:
  
};

#endif

