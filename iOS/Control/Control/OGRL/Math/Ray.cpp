#include "Ray.hpp"

Ray::Ray() {
  origin = vec3(0,0,0);
  direction = vec3(0,0,0);   
}
Ray::Ray(vec3 _origin, vec3 _direction) {
  origin = _origin;
  direction = _direction; 
}
