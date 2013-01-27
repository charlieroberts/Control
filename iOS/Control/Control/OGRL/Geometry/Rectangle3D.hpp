
#include "Vector.hpp"
#include "Matrix.hpp"

#include "Geom.hpp"
//#include "ModelView.hpp"

#include <vector>

#ifndef Rectangle3D_H
#define Rectangle3D_H


class Rectangle3D : public Geom { //ModelView, public Mesh {
  
public:
  Rectangle3D();
  Rectangle3D(vec3 translate, float width, float height);
  
  //from ModelView
  virtual void Transform();
  
  //from Mesh
  virtual void GenerateLineIndices();
  virtual void GenerateTriangleIndices();
  virtual int GetVertexCount() ;
  virtual int GetLineIndexCount() ;
  virtual int GetTriangleIndexCount() ;
  
  string String();
//  float width;
//  float height;

private:
    void GenerateVertices() ;
};



#endif
