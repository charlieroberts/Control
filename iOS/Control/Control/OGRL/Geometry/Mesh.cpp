
#include "Mesh.hpp"
#include <iostream>
#include "Renderer.hpp"
//#include "Program.hpp"

Mesh::Mesh() { 
  useTexCoords = false;
  useNormals = false;
  useColors = false;
}

vector<float>& Mesh::GetVertices() {
  return vertices;
}

vector<float>& Mesh::GetTexCoords() {
  return texCoords;
}

vector<float>& Mesh::GetNormals() {
  return normals;
}

vector<float>& Mesh::GetColors() {
  return colors;
}

void Mesh::SetVertexAttributes(bool _useTexCoords, bool _useNormals, bool _useColors) {
  useTexCoords = _useTexCoords;
  useNormals = _useNormals;
  useColors = _useColors;
}

vector<unsigned short>& Mesh::GetLineIndices() {
  return lineIndices;
}

vector<unsigned short>& Mesh::GetTriangleIndices() {
  return triangleIndices; 
}

void Mesh::PrintVertices() {
  int pIdx = 0;
  for (int i = 0; i < GetVertices().size(); i+=3) {
    printf("p%d: (%f.%f.%f) ", pIdx, GetVertices()[i], GetVertices()[i+1], GetVertices()[i+2]); 
    pIdx++;
  }
  printf("\n");
  
}

void Mesh::PassVertices(Program* program, int mode) {
  
  /*
  for (int i = 0; i < GetVertices().size(); i++) {
    printf("%f.", GetVertices()[i]); 
  }
  
  printf("\n");
  */
  
  glVertexAttribPointer ( program->Attribute("position"), 3, GL_FLOAT, GL_FALSE, 0, &GetVertices()[0] );
  glEnableVertexAttribArray ( program->Attribute("position") );
  
  if (useTexCoords) {
    glVertexAttribPointer ( program->Attribute("texCoord"), 3, GL_FLOAT, GL_FALSE, 0, &GetTexCoords()[0] );
    glEnableVertexAttribArray ( program->Attribute("texCoord") );
  }
  
  if (useNormals) {
    glVertexAttribPointer ( program->Attribute("normal"), 3, GL_FLOAT, GL_FALSE, 0, &GetNormals()[0] );
    glEnableVertexAttribArray ( program->Attribute("normal") );
  }
  
  if (useColors) { //prob should use unsigned short 0-255
    glVertexAttribPointer ( program->Attribute("color"), 4, GL_FLOAT, GL_FALSE, 0, &GetColors()[0] );
    glEnableVertexAttribArray ( program->Attribute("color") );
    
  }
  
  
  if (mode == GL_TRIANGLES) {
    glDrawElements( GL_TRIANGLES, GetTriangleIndexCount(), GL_UNSIGNED_SHORT, &GetTriangleIndices()[0] );
  } else if (mode == GL_LINES) {
    glDrawElements( GL_LINES, GetLineIndexCount(), GL_UNSIGNED_SHORT, &GetLineIndices()[0] );
  }
  
  
  glDisableVertexAttribArray ( program->Attribute("position") );
  
  if (useTexCoords) {
    glDisableVertexAttribArray ( program->Attribute("texCoord") );
  }
  
  if (useNormals) {
    glDisableVertexAttribArray ( program->Attribute("normal") );
  }
  if (useColors) {
    glDisableVertexAttribArray ( program->Attribute("color") );
  }
  
}



void Mesh::GenerateLineIndices() {}
void Mesh::GenerateTriangleIndices() {};
int Mesh::GetVertexCount() {return 0;}
int Mesh::GetLineIndexCount() {return 0;}
int Mesh::GetTriangleIndexCount() {return 0;}




