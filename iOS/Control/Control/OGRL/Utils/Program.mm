
#include "Program.hpp"


//Program::Program() {
//}


Program::Program(string _name, string _vertex, string _frag)  {
  programName = _name;
  programID = -1;
  vertID = -1;
  fragID = -1;    
  
  CompileShaders(_vertex, _frag);
  
  InstallProgram();
}


Program::Program(string _name)  {
  programName = _name;
  programID = -1;
  vertID = -1;
  fragID = -1;    
  
  CompileShaders();
  
  InstallProgram();
}

//pass in the name of a shader program, like "MyShader". assumes there is a file in your bundle
//named "MyShader.vsh" and one named "MyShader.fsh".
bool Program::CompileShaders() {
  
  programID = glCreateProgram();
  
  cout << "in CompileShaders : installing " << programName << " into ID " << programID << "\n";
  
  string vertShaderPathname = ResourceHandler::GetResourceHandler()->GetPathForResourceOfType(programName, "vsh");
  
  cout << "vertex shader located at: " << vertShaderPathname << "\n";
  string vertexSource = GetSource(vertShaderPathname);
  
  if (!CompileShader(&vertID, GL_VERTEX_SHADER, vertexSource )) {
    return false;
  }
  
  string fragShaderPathname = ResourceHandler::GetResourceHandler()->GetPathForResourceOfType(programName, "fsh");
  //const GLchar* fragSource = GetSource(fragShaderPathname);
  string fragSource = GetSource(fragShaderPathname);
  
  if (!CompileShader(&fragID, GL_FRAGMENT_SHADER, fragSource)) {
    return false;
  }
  return true;
}

bool Program::CompileShaders(string _vertex, string _frag) {
  
  programID = glCreateProgram();
  cout << "in CompileShaders(" << _vertex << ", " << _frag << "): installing " << programName << " into ID " << programID << "\n";
  
  if (!CompileShader(&vertID, GL_VERTEX_SHADER, _vertex)) {
    return false;
  }
  
  if (!CompileShader(&fragID, GL_FRAGMENT_SHADER, _frag)) {
    return false;
  }
  return true;
}
  
bool Program::InstallProgram() {
 
  // Attach vertex shader to program.
  //NSLog(@"attaching '%@.vsh' to '%@'\n", name, programName);
  glAttachShader(programID, vertID);
  
  // Attach fragment shader to program.
  //NSLog(@"attaching '%@.fsh' to '%@'\n", name, programName);
  glAttachShader(programID, fragID);
  
  if (!LinkProgram(programID)) {
    return false; 
  }
    
  MapAttributes();
  MapUniforms();
  
  // Release vertex and fragment shaders.
  if (vertID) {
    glDeleteShader(vertID);
  }
  if (fragID) {
    glDeleteShader(fragID);
  }
  
  return true;
}

bool Program::LinkProgram(GLuint prog) {
  GLint status;
  
  glLinkProgram(prog);
  
  GLint logLength;
  glGetProgramiv(prog, GL_INFO_LOG_LENGTH, &logLength);
  if (logLength > 0)
  {
    GLchar *log = (GLchar *)malloc(logLength);
    glGetProgramInfoLog(prog, logLength, &logLength, log);
    cout << "Program link log:\n" << log;
    free(log);
  }

  glGetProgramiv(prog, GL_LINK_STATUS, &status);
  if (status == 0) {
    cout << "Failed to link program " << programID;
    
    if (vertID) {
      glDeleteShader(vertID);
      vertID = 0;
    }
    if (fragID) {
      glDeleteShader(fragID);
      fragID = 0;
    }
    if (programID) {
      glDeleteProgram(programID);
      programID = 0;
    }
    
    return false;
  }
  
  return true;
}

const string Program::GetSource(string path) {
  const char *source;

  source = (char *) (ResourceHandler::GetResourceHandler()->GetContentsOfFileAsString(path));
  if (!source) {
    cout << "Failed to load the shader at " << path;
    return NULL;
  }

  string str = source;

  return str;
}
bool Program::CompileShader(GLuint* shader, GLenum type, string const &source) {
  //NSLog(@"compiling shader '%@'", file);
  
  GLint status;
  
  *shader = glCreateShader(type);
  GLchar const *shader_source = source.c_str();
  GLint const shader_length = source.size(); //length;

  glShaderSource(*shader, 1, &shader_source, &shader_length);
  glCompileShader(*shader);
  
  GLint logLength;
  glGetShaderiv(*shader, GL_INFO_LOG_LENGTH, &logLength);
  if (logLength > 0) {
    GLchar *log = (GLchar *)malloc(logLength);
    glGetShaderInfoLog(*shader, logLength, &logLength, log);
    cout << "Shader compile log:\n" << log;
    free(log);
  }
  
  glGetShaderiv(*shader, GL_COMPILE_STATUS, &status);
  if (status == 0) {
    glDeleteShader(*shader);
    cout << "Failed to create the shader named " << programName;
    return false;
  }
  
  return true;
}


void Program::Bind() {
  //printf("about to bind %d\n", programID);
  glUseProgram(programID);
}

void Program::Unbind() {
  glUseProgram(0);
}


GLuint Program::Uniform(string name) {
  return uniforms[name];
}

GLuint Program::Attribute(string name) {
  return attributes[name];
}

void Program::MapUniforms() {
  
  GLsizei length[1];
  GLint size[1];
  GLenum type[1];
  char name[256];
  GLint count[1];
  
  glGetProgramiv(programID, GL_ACTIVE_UNIFORMS, count);
  
  for (int i = 0; i < count[0]; i++) {
    glGetActiveUniform(programID, i, 100, length, size, type, name);
    uniforms[name] = glGetUniformLocation(programID, name);
    //uniforms.insert(std::pair<string, GLuint>(name, glGetUniformLocation(programID, name)));
  }
}


void Program::MapAttributes() {
  
  GLsizei length[1];
  GLint size[1];
  GLenum type[1];
  char name[256];
  GLint count[1];
  
  glGetProgramiv(programID, GL_ACTIVE_ATTRIBUTES, count);
  
  for (int i = 0; i < count[0]; i++) {
    glGetActiveAttrib(programID, i, 100, length, size, type, name);
    attributes[name] = glGetAttribLocation(programID, name);
    //attributes.insert(std::pair<string, GLuint>(name, glGetAttribLocation(programID, name)));
  }
}

