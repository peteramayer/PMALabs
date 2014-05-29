#!/usr/bin/env python
#
# Copyright (c) 2013 OpenElectrons.com
# Pi-Pan isntallation script.
# for more information about Pi-Pan and PiLight,  please visit:
# http://www.openelectrons.com/Pi-Pan
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 2 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
#
# History:
# Date      Author      Comments
# 09/15/13    Nitin Patil    Initial authoring.
# 01/31/14   Deepak          changed i2c calls to use OpenElectrons_i2c
#
# this is driver for the driveing Openelectrons.com PiLight with any RGB values 

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.


from OpenElectrons_i2c import OpenElectrons_i2c
import time

class PILIGHT(OpenElectrons_i2c):

    # Minimal constants required by library
    
    PILIGHT_ADDRESS = (0x30 >> 1)  
    
    PILIGHT_WHO_AM_I    =  0x10
    PILIGHT_VERSION    =  0x00
    PILIGHT_VENDOR    =  0x08
    
    PILIGHT_RED  = 0x42
    PILIGHT_GREEN  =  0x43
    PILIGHT_BLUE   =  0x44
    
    def __init__(self):

        #define the pilight address
        OpenElectrons_i2c.__init__(self, self.PILIGHT_ADDRESS)
        

    def readPiLight(self):
        # read  the piLight RGB values
        list = self.readArray(self.PILIGHT_RED, 3)
        return list    
        
    def setTimeout(self, timeoutValue):
        # write the piLight
        list = [] 
        list.append(0)
        list.append(0)
        list.append(0)
        list.append(timeoutValue)
        self.writeArray(self.PILIGHT_RED, list)

    def createPiLight(self, red, green, blue):
        # write the piLight
        list = [] 
        list.append(red)
        list.append(green)
        list.append(blue)
        self.writeArray(self.PILIGHT_RED, list)
        
if __name__ == '__main__':
    import sys
    # Get the total number of args passed to the PiLight.py
    total = len(sys.argv)
    if total < 4 :
        print "insufficient parameters : PiLight R G B"
        sys.exit(1)
    # Get the arguments list 
    cmdargs = str(sys.argv)
        

    pilight = PILIGHT()
    print "firmware   : " + pilight.GetFirmwareVersion()
    print "vendor name: " + pilight.GetVendorName()
    print "device id  : " + pilight.GetDeviceId()
    pilight.createPiLight(int(sys.argv[1]),int(sys.argv[2]),int(sys.argv[3]))

