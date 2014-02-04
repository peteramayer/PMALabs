#!/usr/bin/env python
import sys
import os
import pygame
import pygame.camera
from pygame.locals import * 

import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)

from twython import Twython
import config


from threading import Timer

api = Twython(config.CONSUMER_KEY,config.CONSUMER_SECRET,config.ACCESS_KEY,config.ACCESS_SECRET)

GPIO.setup(18,GPIO.IN)

import time
#initialise a previous input variable to 0 (assume button not pressed last)
prev_input = 1
while True:
  #take a reading
  input = GPIO.input(18)
  #if the last reading was low and this one high, print
  if ((not prev_input) and input):
    print("Button pressed")
    api.update_status(status='Apologies for the Raspberry Pi tweetbomb. This time, just one. '+str(time.time())+' #raslabexperiment ')
  #update previous input
  prev_input = input
  #slight pause to debounce
  time.sleep(0.05)




