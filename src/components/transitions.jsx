import React from 'react'
import { CSSTransition } from 'react-transition-group'

function transition(className) {
  return props => (
    <CSSTransition
      in={props.in}
      timeout={200}
      classNames={className}
      unmountOnExit
    >
      {props.children}
    </CSSTransition>
  )
}

export let SlideRight = transition('slide-right'),
  SlideDown = transition('slide-down'),
  Fade = transition('fade')

<style>
.slide-right-enter {
  position: absolute;
  opacity: 0.01;
  transform: translateX(-50px);
}

.slide-right-enter-active {
  opacity: 1;
  transition: all 200ms ease-out;
  transform: translateX(0);
}

.slide-right-exit {
  position: absolute;
  opacity: 1;
  transform: translateX(0);
}

.slide-right-exit-active {
  opacity: 0.01;
  transition: all 200ms ease-out;
  transform: translateX(-50px);
}

.slide-down-enter {
  position: absolute;
  opacity: 0.01;
  transform: translateY(-50px);
}

.slide-down-enter-active {
  opacity: 1;
  transition: all 200ms ease-out;
  transform: translateY(0);
}

.slide-down-exit {
  position: absolute;
  opacity: 1;
  transform: translateY(0);
}

.slide-down-exit-active {
  opacity: 0.01;
  transition: all 200ms ease-out;
  transform: translateY(-50px);
}

.fade-enter {
  position: absolute;
  opacity: 0.01;
}

.fade-enter-active {
  opacity: 1;
  transition: all 200ms ease-out;
}

.fade-exit {
  position: absolute;
  opacity: 1;
}

.fade-exit-active {
  opacity: 0.01;
  transition: all 200ms ease-out;
}
</style>
