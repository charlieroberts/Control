//#include "GLView.h"


//#include "Interfaces.hpp"
#include "Sphere.hpp"
#include "Ray.hpp"
#include "Vector.hpp"

#ifndef UTILS_H
#define UTILS_H

class Utils {

public:
  static int IntersectsWithRay(ray3 theRay, Sphere* s, vec3* intersection);
  static int IntersectsWithRay2(ray3 theRay, Sphere* s, vec3* intersection);
  static bool Epsilon(float val, float target, float range);
  static ray3 GetPickingRay(int mx, int my);
  static int RandomIntBetween(int a, int b);
  static int RandomIntRange(int a, int b);

  static float RandomFloat();
  static float RandomFloatBetween(float a, float b); 
  static void Sleep(double seconds);
  
  static vec3 ArbitraryRotate(vec3 p, float theta, vec3 r);
  
private:
  
};

#endif