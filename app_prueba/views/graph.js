/**
 * This example shows how to use the dragNodes plugin.
 */
var i,
    s,
    g = {
      nodes: [],
      edges: []
    };

function populateGraph(relaciones, nodos){
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
            sourcestr: relaciones[i]['Sequence1']['low'],
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

    s.bind('overNode outNode clickNode doubleClickNode rightClickNode', function(e) {
        console.log("overNode " + e.data.node.label );
        document.getElementById('status').innerHTML = "Selected node with " + e.data.node.label
    });
    s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function(e) {
        console.log("overEdge " + e.data.edge.label + " " +
          e.data.edge.source);

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