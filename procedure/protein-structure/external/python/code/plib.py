#
# Copyright (C) 2010-2017 MyCompany - All rights reserved.
#

#
#  Molecular structure
#  plib
#  Rev. 1.1
#  May 11, 2015
#
#  (C) Simone Santini, 2015
#
#  Library of functions for the probabilistic prediction algorithm

########################################################################
#
# Conversion from three letters to one letter code
#
threeconv = {'ALA': 'A',
	     'ARG': 'R',
	     'ASP': 'D',
	     'ASN': 'N',
	     'CYS': 'C',
	     'GLU': 'E',
	     'GLN': 'Q',
	     'GLY': 'G',
	     'HIS': 'H',
	     'ILE': 'I',
	     'LEU': 'L',
	     'LYS': 'K',
	     'MET': 'M',
	     'PHE': 'F',
	     'PRO': 'P',
	     'SER': 'S',
	     'THR': 'T',
	     'TRP': 'W',
	     'TYR': 'Y',
	     'VAL': 'V'}

#
# Reads the probability factors from the table file, and creates two
# dictionaries: one with the probabilities conditioned to the residual
# triplets, the other with the probabilities conditioned to the
# structural pairs.
#
#  Returns a structure with two dictionaries. The first is indexed by
#  residual triplets and in each element has the three probabilities
#  for helices, sheets, and coils (in this order); the second has the
#  same structure but is indexed by structure pairs.
#
def table_read(file):
    resP = {}
    strP = {}

    f = open(file, 'r')
    
    lines = [l[0:-1] for l in f if l[0] != '#']

    if lines[0] != 'RESIDUALS':
        print('Incorrect table format: abort')

    k = 1
    while lines[k] != 'STRUCTURE':
        a = lines[k].split(", ")
        resP[a[0]] = [float(a[1]), float(a[2]), float(a[3])]
        k = k+1
    k = k+1
    while k<len(lines):
        a = lines[k].split(", ")
        strP[a[0]] = [float(a[1]), float(a[2]), float(a[3])]
        k = k+1

    return (resP, strP)


#
# Reads a ".ale" file and extracts a list of residuals and one of
# structures
#
#
def ale_fileread(fname):
    rlist = [];
    strlist = [];
    f = open(fname, 'r')
    for line in f:
        if line[0] != '#':
            a = line[:-1].split(" ")
            if len(a) > 2 and a[0] in threeconv:   # don't want to deal with empty lines nor lines without a residual
                rlist.append(a[0]);
                strlist.append(a[2]);
    rlist = [threeconv[x] for x in rlist]
    strlist = ['H' if x == 'HELIX' else ('S' if x == 'SHEET' else 'U')
               for x in strlist]
    return (rlist, strlist)


#
# Creates the initial probability structure: at each position, except
# the first and the last, it creates a list of three probabilities:
# the conditional probability of an helix, of a sheet, and of a
# coil. The first and the last positions are not predicted, and the
# probabilities are initialized to uniform.
#
def mkps(rlist,rDict):
    str = [[0.33,0.33,0.33] for i in range(len(rlist))]

    for i in range(1,len(rlist)-1):
        key = rlist[i-1]+rlist[i]+rlist[i+1]
        str[i] = rDict[key]

    return str


#
# Creates the initial structure prediction given the residual
# probabilities. This function leaves the boundaries of the chain
# uninitialized (symbol 'X'). Each position contains the highest
# probability structure element for the triplet at that position
#
def inistr(strlst):
    q = len(strlst)*['X']

    for i in range(1,len(strlst)-1):
        w = max(strlst[i])
        if w == strlst[i][0]:
            q[i] = 'H'
        elif w == strlst[i][1]:
            q[i] = 'S'
        else:
            q[i] = 'U'
    return q

#
# Completes a structure prediction, assigning the first and last
# element to achieve maximum consistency with the already predicted
# structure
#
def top_off(strlst, strP):
    
    # Assign the first element
    p = [0.0, 0.0, 0.0]
    idx = 0 if strlst[1] == 'H' else (1 if strlst[1] == 'S' else 2)
             
    k = 0
    for q in ['H', 'S', 'U']:
        key = q+strlst[2]
        p[k] = strP[key][idx]
        k = k+1

    w = max(p)
    if w == p[0]:
        strlst[0] = 'H'
    elif w == p[1]:
        strlst[0] = 'S'
    else:
        strlst[0] = 'U'

    # Assign the last element
    r = len(strlst)-1
    p = [0.0, 0.0, 0.0]
    idx = 0 if strlst[r-1] == 'H' else (1 if strlst[r-1] == 'S' else 2)
             
    k = 0
    for q in ['H', 'S', 'U']:
        key = strlst[r-2]+q
        p[k] = strP[key][idx]
        k = k+1

    w = max(p)
    if w == p[0]:
        strlst[r] = 'H'
    elif w == p[1]:
        strlst[r] = 'S'
    else:
        strlst[r] = 'U'
    
    return strlst


#
# Does one cycle of the iterative algorithm: replaces each position
# (except for the first and the last) with the structure element that
# has the maximal combined residual-structure probability, that is, if
# R is the residual chain and S the structure chain, the element at
# spot k is assigned the symbol X that maximizes
#
#    P(X|R[i-1],R[i],R[i+1])*P(X|S[i-1],S[i])
#
def cycle(strlst, reslst, resP, strP):
    r = len(strlst)*['X']

    for k in range(1,len(strlst)-1):
        key = reslst[k-1]+reslst[k]+reslst[k+1]
        skey = strlst[k-1]+strlst[k]
        p = [resP[key][i]*strP[skey][i] for i in [0,1,2]]
        w = max(p)
        if w == p[0]:
            r[k] = 'H'
        elif w == p[1]:
            r[k] = 'S'
        else:
            r[k] = 'U'

#
# Kludge
#
#    for k in range(len(reslst)):
#        if reslst[k] == 'D':
#            r[k] = 'U'
#
    return r

#
# Determines is two lists are the same
#
def are_eq(a,b):
    if len(a) != len(b):
        return 0
    p = 1;
    for i in range(len(a)):
        p = p*(a[i]==b[i])
    return p
    


#
# Accumulates error and prediction statistics
#
# This function receibes 4 parameters: the first three (rlist, slist,
# gtruth) are a list of residuals of a protein, the structural
# prediction and the ground truth. The final argument is a list with
# partial count that this function will integrate with the data of
# this protein and return. The list is as follows:
#
#  [N, c, w, hs, hc, sh, sc, ch, cs, Dct, DctTot]
#
#  where:
#
#  N: total number of residuals
#  c: number of correctly predicted residuals
#  w: number of incorrectly predicted residuals
#  hs: number of errors in which a H has been incorrectly predicted as
#      an S
#  hc: number of errors in which a H has been incorrectly predicted as
#      an C
#  sh: number of errors in which a S has been incorrectly predicted as
#      an H
#  sc: number of errors in which a S has been incorrectly predicted as
#      an C
#  ch: number of errors in which a C has been incorrectly predicted as
#      an H
#  cs: number of errors in which a C has been incorrectly predicted as
#      an S
#  Dct: dictionary indexed by residuals; each element contains the
#       number of times in which that residual gave rise to an error
#  DctTot: dictionary indexed by residuals; each element contains the
#       number of times that a residual was observed in input
#
LN = 0
LC = 1
LW = 2
LHS = 3
LHC = 4
LSH = 5
LSC = 6
LCH = 7
LCS = 8
LDCT = 9
LDCTOT = 10

def statAdd(rlist, slist, gtruth, lst):
    Dct = lst[LDCT]
    DcTot = lst[LDCTOT]

    for k in range(len(rlist)):

        lst[LN] = lst[LN]+1;
        DcTot[rlist[k]] = DcTot[rlist[k]] + 1

        if slist[k] != gtruth[k]:
            lst[LW] = lst[LW] + 1
            Dct[rlist[k]] = Dct[rlist[k]] + 1
            if slist[k] == 'H':
                if gtruth[k] == 'S':
                    lst[LHS] = lst[LHS] + 1
                elif gtruth[k] == 'U':
                    lst[LHC] = lst[LHC] + 1
            elif slist[k] == 'S':
                if gtruth[k] == 'H':
                    lst[LSH] = lst[LSH] + 1
                elif gtruth[k] == 'U':
                    lst[LSC] = lst[LSC] + 1
            elif slist[k] == 'U':
                if gtruth[k] == 'H':
                    lst[LCH] = lst[LCH] + 1
                elif gtruth[k] == 'S':
                    lst[LCS] = lst[LCS] + 1
        else:
            lst[LC] = lst[LC] + 1
    return lst


#
# Initializes a list for statAdd
#
def statInit():
    Dct = {};
    DcTot = {};
    for k in threeconv.keys():
        Dct[threeconv[k]] = 0.0
        DcTot[threeconv[k]] = 0.0
    lst = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, Dct, DcTot]
    return lst;


#
# Specific statistics: creates a double dictionary: a dictionary
# indexed by residual names associated to another dictionary indexed
# by the strings HH, HS, HU, SH, SS, SU, UH, US, UU that counts how
# many times the second element has been predicted for that residual
# when the correct one was the first element
#
def SpecInit(reslist):
    MDct = {}
    for res in reslist:
        Dct = {'HH':0.0, 'HS':0.0, 'HU':0.0, 
               'SH':0.0, 'SS':0.0, 'SU':0.0, 
               'UH':0.0, 'US':0.0, 'UU':0.0}
        MDct[res] = Dct

    return MDct


#
# Updates specific statistics: updates a double dictionary: a
# dictionary indexed by residual names associated to another
# dictionary indexed by the strings HH, HS, HU, SH, SS, SU, UH, US, UU
# that counts how many times the second element has been predicted for
# that residual when the correct one was the first element
#
def SpecUpdate(rlist, strlist, gtruth, MDct):
    lst = MDct.keys()

    for k in range(len(rlist)):
        if rlist[k] in lst:
            key = gtruth[k]+strlist[k]
            Dct = MDct[rlist[k]]
            Dct[key] = Dct[key] + 1
    
    return MDct

#
# Compares two lists: returns the fraction of elements
# in which they coincide.
#
# returns 0 if the two are not of the same length
#
def lcmp(a,b):
    if len(a) != len(b):
        return 0
    c = 0.0
    for i in range(len(a)):
        c = c + (a[i] == b[i])
    return c/len(a)



