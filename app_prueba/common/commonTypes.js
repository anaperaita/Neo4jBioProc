

//Type of graph enum
const GraphType = {
    ALLIGN: 0,
    DEPTH: 1, 
    NONE:2
}

//Type of graph enum
const AllignType = {
    DNA: 0,
    AMINO: 1
}


if(typeof module != 'undefined' ){
    module.exports.GraphType = GraphType;
    module.exports.AllignType = AllignType;
}
