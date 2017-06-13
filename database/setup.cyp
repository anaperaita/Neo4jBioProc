CREATE CONSTRAINT ON (s:DNASequence) ASSERT  s.nucleotides IS UNIQUE;
CREATE CONSTRAINT ON (s:AminoacydSequence) ASSERT  s.aminoacyds IS UNIQUE;
CREATE CONSTRAINT ON (s:Structure) ASSERT  s.structure IS UNIQUE;
