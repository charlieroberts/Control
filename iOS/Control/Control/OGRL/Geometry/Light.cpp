
#include "Light.hpp"
#include "Renderer.hpp"
Light::Light(vec3 _translate, vec3 _color) : Sphere(_translate, 0.3) {
  SetColor(_color);
}


