
#include "Vector.hpp"
#include "Matrix.hpp"

#include "Mesh.hpp"
#include "ModelView.hpp"

#include <vector>

#ifndef GRID_H
#define GRID_H


class Grid : public ModelView, public Mesh {
  
public:
  Grid(vec3 translate, float width, float height, int rows, int cols);
  
  //from ModelView
  virtual void Transform();
  
  //from Mesh
  virtual void GenerateLineIndices();
  virtual void GenerateTriangleIndices();
  virtual int GetVertexCount() ;
  virtual int GetLineIndexCount() ;
  virtual int GetTriangleIndexCount() ;
  
  string String();
  float width;
  float height;
  float rows;
  float cols;
  float rowInc;
  float colInc;
  float rowTexInc;
  float colTexInc;
  
private:
  
  void GenerateVertices() ;
  
};



#endif
