
#include "Vector.hpp"
#include "Matrix.hpp"
#include "Geom.hpp"
#include <vector>

#ifndef OGRL_TRIANGLE_H
#define OGRL_TRIANGLE_H


class Triangle : public Geom { 
  
public:
  Triangle(vec3 _p0, vec3 _p1, vec3 _p2);
 
  vec3 p0;
  vec3 p1;
  vec3 p2;
  
  
  //from Geom
  virtual bool ContainsWindowPoint(ivec2 windowPt);
  
  //from ModelView
  //virtual void Transform();
  
  //from Mesh
  virtual void GenerateLineIndices();
  virtual void GenerateTriangleIndices();
  virtual int GetVertexCount() ;
  virtual int GetLineIndexCount() ;
  virtual int GetTriangleIndexCount() ;
  
protected:
 // float width;
 // float height;

  
private:

    void GenerateVertices() ;
  
};



#endif
