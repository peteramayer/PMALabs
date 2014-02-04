#!/usr/bin/env python
import sys
import os
import pygame
import pygame.camera
from pygame.locals import * 

from twython import Twython
import config

from threading import Timer

api = Twython(config.CONSUMER_KEY,config.CONSUMER_SECRET,config.ACCESS_KEY,config.ACCESS_SECRET)

# pygame.init()
# pygame.camera.init()
# cam = pygame.camera.Camera("/dev/video0",(640,480))
# cam.start()
# image = cam.get_image()
# pygame.image.save(image,'webcam.png')
cmd = '/opt/vc/bin/vcgencmd measure_temp'
line = os.popen(cmd).readline().strip()
temp = line.split('=')[1].split("'")[0]
# photo = open('webcam.png','rb')
api.update_status(status='My Raspberry Pi has a current CPU temperature of '+temp+' C #raslabexperiment ')

