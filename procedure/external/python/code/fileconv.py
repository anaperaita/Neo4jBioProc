#
#  Project: Neo4J secondary structure integration
#  File:    fileconv.py
#  Rev.     1.0
#  Date:    2/28/2017
#
#
#
#  (C) Simone Santini, 2017
#
# Reads a file in the .ale format and prints out a representation of
# the protein as a string using the single 
#
#
#  Usage:
#    python fileconv <input_file> [<output_file>]                     
#

import sys
import plib


#
# Prints the help message
#
def phelp():
    print('fileconv                                                             ')
    print(' Reads a file in the .ale format and prints out a representation of  ')
    print(' the protein as a string using the single                            ')
    print('                                                                     ')
    print('                                                                     ')
    print('  Usage:                                                             ')
    print('    python fileconv <input_file> [<output_file>]                     ')
    print('                                                                     ')


if len(sys.argv) == 1 or sys.argv[1] == '-help' or sys.argv[1] == '-h':
    phelp()
else:
    if len(sys.argv) >= 3:
        ofile = open(sys.argv[2], 'w')
    else:
        ofile = sys.stdout


    (rlist, gtruth) = plib.ale_fileread(sys.argv[1])

    [sys.stdout.write("%c" % r) for r in rlist]
    sys.stdout.write("\n")
