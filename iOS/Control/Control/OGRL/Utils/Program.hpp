//#include <iostream>
#include <map>
#include "ResourceHandler.h"

#ifndef PROGRAM
#define PROGRAM

//using namespace std;

class Program {
  
public:
 
  //Program();
  Program(string _name);
  Program(string _name, string vertexString, string fragString);
  GLuint programID;
  GLuint vertID;
  GLuint fragID;
  string programName;
  void Bind();
  void Unbind();
  GLuint Uniform(string name);
  GLuint Attribute(string name);
  
  
private:
  bool CompileShaders();
  bool CompileShaders(string _vertex, string _frag);

  bool InstallProgram();
  
  const string GetSource(string path);
  bool CompileShader(GLuint* shader, GLenum type, string const &source);
  
//  bool compileShader(GLuint* shader, GLenum type, const GLchar* source);
  bool LinkProgram(GLuint prog);
  void MapAttributes();
  void MapUniforms();
  map<string, GLuint> uniforms;
  map<string, GLuint> attributes;
};
#endif