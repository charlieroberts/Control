#include "Vector.hpp"

#ifndef RAY_H
#define RAY_H


class Ray {
  public:
  Ray();
  Ray(vec3 _origin, vec3 _direction);
   
  vec3 origin;
  vec3 direction;

};

typedef Ray ray3;

#endif