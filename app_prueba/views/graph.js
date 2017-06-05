/**
 * This example shows how to use the dragNodes plugin.
 */
var i,
    s,
    g = {
      nodes: [],
      edges: []
    };

//Populates the graph for the aligns
function populateGraphAllign(relaciones, nodos){
    i=0;
    s=null;
    g = {
      nodes: [],
      edges: []
    };
    document.getElementById('graph-container').innerHTML="";
    // Generate a random graph:
    for (i in nodos){
        
        g.nodes.push({
            id: nodos[i]['NodeId']['low'],
            label: nodos[i]['Sequence'],
            data: nodos[i]['Sequence'],
            infoId: nodos[i]['InfoId'],
            infoName: nodos[i]['Name'],
            x: Math.random(),
            y: Math.random(),
            size: 5,
            color: '#666'
        });
    }
    for(i in relaciones){
        g.edges.push({
            id: relaciones[i]['EdgeId']['low'],
            label: relaciones[i]['score']['low'],
            source: relaciones[i]['NodeId1']['low'],
            target: relaciones[i]['NodeId2']['low'],
            size: relaciones[i]['score']['low'],
            color: '#ccc',
            type: ['line', 'curve', 'arrow', 'curvedArrow'][Math.random() * 4 | 0]
        });
    }
    // sigma.renderers.def = sigma.renderers.canvas
    // Instantiate sigma:
    s = new sigma({
    graph: g,
    renderer: {
        container: document.getElementById('graph-container'),
        type: 'canvas'
    },
    settings: {
        edgeLabelSize: 'proportional',
        doubleClickEnabled: false,
        defaultEdgeHoverColor: '#607D8B',
        defaultNodeColor: '#ec5148',
        edgeHoverSizeRatio: 2,
        drawLabels: false,
        drawEdgeLabels:false,
        animationsTime: 1000,
        borderSize: 2,
        outerBorderSize: 3,
        defaultNodeOuterBorderColor: 'rgb(236, 81, 72)',
        enableEdgeHovering: true,
        edgeHoverHighlightNodes: 'circle',
        sideMargin: 1,
        edgeHoverColor: 'edge',
        edgeHoverExtremities: true,
        scalingMode: 'outside'
    }
    });

    s.bind('overNode outNode clickNode rightClickNode', function(e) {
        console.log("overNode " + e.data.node.label );
        
        let graphNode = g.nodes.find(x => x.id ==e.data.node.id)

        let htmlVal = "<p>Selected node with id" + e.data.node.id +"</p>"
        htmlVal +=  "<p> Data value" + graphNode.data +"</p>"
        htmlVal += "<p> Info Name " + graphNode.infoName +"</p>"

        document.getElementById('elem').innerHTML= htmlVal
    });

    s.bind('doubleClickNode', function(e) {
        
    });

    s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function(e) {
        console.log("overEdge " + e.data.edge.label + " " +
          e.data.edge.source);
        document.getElementById('elem').innerHTML = "Selected edge with id" + e.data.edge.id
    });

    // Initialize the dragNodes plugin:
    var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
    dragListener.bind('startdrag', function(event) {
        console.log(event);
    });
    dragListener.bind('drag', function(event) {
        console.log(event);
    });
    dragListener.bind('drop', function(event) {
        console.log(event);
    });
    dragListener.bind('dragend', function(event) {
        console.log(event);
    });
}


//Populates the graph for the aligns
function populateGraphDepth(info){
    i=0;
    s=null;
    g = {
      nodes: [],
      edges: []
    };
    document.getElementById('graph-container').innerHTML="";
    // Generate a random graph:
    for (i in info){
        idInfo=info[i]['InfoId']['low']
        if(g.nodes.find(x=> x.id===idInfo)===undefined){
            g.nodes.push({
                id: idInfo,
                label:  "Name " +info[i]['InfoName'],
                x: 0.90,
                y: Math.random(),
                size: 5,
                color: '#870058'
            });
        }

        dnaseq = info[i]['DNASequence']
        if(dnaseq!= null){
            iddna = info[i]['DNAId']['low']
            if(g.nodes.find(x=> x.id===iddna)===undefined){
                g.nodes.push({
                    id: iddna,
                    label:  "DNA " +dnaseq,
                    x: 0.70,
                    y: Math.random(),
                    size: 5,
                    color: '#390099'
                });
            }

            g.edges.push({
                id: Math.random(),
                label: Math.random(),
                source: idInfo,
                target: iddna,
                size: 1,
                color: '#ccc',
                type: ['line', 'curve', 'arrow', 'curvedArrow'][Math.random() * 4 | 0]
            });
            aminoseq = info[i]['AminoacydSequence']
            if(dnaseq!= null){
                idamino= info[i]['AminoacydId']['low']
                if(g.nodes.find(x=> x.id===idamino)===undefined){
                    g.nodes.push({
                        id: idamino,
                        label:  "Aminoacyd " +aminoseq,
                        x: 0.50,
                        y: Math.random(),
                        size: 5,
                        color: '#ff5400'
                    });
                }
                g.edges.push({
                    id: Math.random(),
                    label: Math.random(),
                    source: iddna,
                    target: idamino,
                    size: 1,
                    color: '#ccc',
                    type: ['line', 'curve', 'arrow', 'curvedArrow'][Math.random() * 4 | 0]
                });

                structureseq = info[i]['Structure']
                if(structureseq!= null){
                    idstr= info[i]['StructureId']['low']
                    if(g.nodes.find(x=> x.id===idstr)===undefined){
                        g.nodes.push({
                            id:  idstr,
                            label:  "Structure " + structureseq ,
                            x: 0.30,
                            y: Math.random(),
                            size: 5,
                            color: '#02010a'
                        });
                    }

                    g.edges.push({
                        id: Math.random(),
                        label: Math.random(),
                        source: idamino,
                        target: idstr,
                        size: 1,
                        color: '#ccc',
                        type: ['line', 'curve', 'arrow', 'curvedArrow'][Math.random() * 4 | 0]
                    });


                }
            }


        }
    
    }
    // sigma.renderers.def = sigma.renderers.canvas
    // Instantiate sigma:
    s = new sigma({
    graph: g,
    renderer: {
        container: document.getElementById('graph-container'),
        type: 'canvas'
    },
    settings: {
        edgeLabelSize: 'proportional',
        doubleClickEnabled: false,
        defaultEdgeHoverColor: '#607D8B',
        defaultNodeColor: '#ec5148',
        edgeHoverSizeRatio: 2,
        drawLabels: false,
        drawEdgeLabels:false,
        animationsTime: 1000,
        borderSize: 2,
        outerBorderSize: 3,
        defaultNodeOuterBorderColor: 'rgb(236, 81, 72)',
        enableEdgeHovering: true,
        edgeHoverHighlightNodes: 'circle',
        sideMargin: 1,
        edgeHoverColor: 'edge',
        edgeHoverExtremities: true,
        scalingMode: 'outside'
    }
    });

    s.bind('overNode outNode clickNode doubleClickNode rightClickNode', function(e) {
        console.log("overNode " + e.data.node.label );
        document.getElementById('elem').innerHTML = "Selected node with " + e.data.node.id
    });
    s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function(e) {
        console.log("overEdge " + e.data.edge.label + " " +
          e.data.edge.source);
        document.getElementById('elem').innerHTML = "Selected edge with " + e.data.edge.id
    });

    // Initialize the dragNodes plugin:
    var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
    dragListener.bind('startdrag', function(event) {
        console.log(event);
    });
    dragListener.bind('drag', function(event) {
        console.log(event);
    });
    dragListener.bind('drop', function(event) {
        console.log(event);
    });
    dragListener.bind('dragend', function(event) {
        console.log(event);
    });
}
