#
#
##
#  Project: Neo4J secondary structure integration
#  File:    fileconv.py
#  Rev.     1.0
#  Date:    2/28/2017
#
#
#
#  (C) Simone Santini, 2017
#
# function to predict the secondary structure of a protein given the
# primary structure chain.

import plib


def pred(rlist):
    (resP, strP) = plib.table_read("../external/python/code/probtable.dat")

    strlst = plib.mkps(rlist, resP)
    
    pred = plib.inistr(strlst)
    pred = plib.top_off(pred, strP)
    p1 = pred[:];
    p2 = plib.cycle(p1, rlist, resP, strP)
    p2 = plib.top_off(p2, strP)

    k = 1
    while k<10 and plib.are_eq(p1,p2) != 0:
        p1 = p2[:]
        p2 = plib.cycle(p1, rlist, resP, strP)
        p2 = plib.top_off(p2, strP)
        k = k+1
        #        sys.stdout.write('{0}  '.format(k))
        #        print(''.join(p2))
    return ''.join(p2)

#
# Usage example
# (remove the comments to use it)
#
#f = open("test.txt")
#
#for line in f:
#    p = pred(line[:-1])
#    print p
#
#f.close()
#
