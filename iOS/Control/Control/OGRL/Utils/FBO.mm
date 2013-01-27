#include "FBO.hpp"

FBO::FBO() {
  glGenFramebuffers(1, &fboID);
}

FBO::FBO(Texture * t) {
  
  glGenFramebuffers(1, &fboID);
  SetTargetTexture(t);
}

void FBO::SetTargetTexture(Texture* t) {
  
  texture = t;
  glBindFramebuffer(GL_FRAMEBUFFER, fboID);
  
  //glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, t->texID[0], 0);
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, t->texID, 0);
  
  if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
    printf("in FBO : ERROR!!!!: Failed to make complete framebuffer object %x", glCheckFramebufferStatus(GL_FRAMEBUFFER));
    //NSLog(@"in FBO : ERROR!!!!: Failed to make complete framebuffer object %x", glCheckFramebufferStatus(GL_FRAMEBUFFER));
    exit(0);
  }
  
  width = t->width;
  height = t->height;

  //glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
  //glBindFramebuffer(GL_FRAMEBUFFER, 1); //default
  
}

//use this one if you are changing the fbo texture..
void FBO::BindToTexture(Texture* t) {
  SetTargetTexture(t);
  glViewport(0,0, width, height); //w & h MUST match the texture size
}

//otherwise use the one that was already bound to this fbo...
void FBO::Bind() {
  glBindFramebuffer(GL_FRAMEBUFFER, fboID);
  glViewport(0,0, width, height); //w & h MUST match the texture size
}

void FBO::Unbind() {
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
}

