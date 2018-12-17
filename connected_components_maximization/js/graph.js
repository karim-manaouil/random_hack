/*
 * Author: Karim MANAOUIL @2018, fk_manaouil@esi.dz
 *
 * This files contains functions that implements algorithmes to find
 * all the nodes that maximizes the number of connected components of
 * a graph and routines to save and restore the state of a graph used
 * in the maximization routine.
 *
 */

/* Applies DFS on Graph starting from root and marking visited nodes */

/* Color used to highlight graph nodes */ 
let HIGHLIGHT_COLOR = '#00EE00';

/* Graph DFS tarversal */
function depth_first_search(graph, root, visited) {
    let stack = [];

    stack.push(root);

    while (stack.length !== 0) {
        node = stack.pop();
        visited[node] = true;

        for (edge of graph.edges.get()) {
            if (edge.from == node && visited[edge.to] == null) {
                stack.push(edge.to)
            } else if (edge.to == node && visited[edge.from] == null) {
                stack.push(edge.from)
            }
        }
    }
}

/* Counts number of connected components in a graph */
function count_components(graph) {
    let visited = [];
    let count = 0;

    for (node of graph.nodes.get()) {
        if (visited[node.id] == null) {
            depth_first_search(graph, node.id, visited);
            count++;
        }
    }
    return count;
}

/*  Return the set of nodes {node, comps} that maximizes the number
    of connected components in a graph */
function find_maximizing_nodes(graph) {
    let set = new Set();
    let count = 0;

    let savedGraph = {
        nodes: new vis.DataSet([]),
        edges: new vis.DataSet([])
    };

    let initComp = count_components(graph);

    let nodeStack = [];
    for (node of graph.nodes.get()) {
        nodeStack.push(node.id);
    }

    while (nodeStack.length !== 0) {
        saveGraph(graph, savedGraph);
        let node_id = nodeStack.pop();
        removeNode(graph, node_id)
        count = count_components(graph);
        if (count > initComp) {
            set.add({
                node: node_id,
                comps: count
            });
        }
        restoreGraph(graph, savedGraph);
    }
    return set;
}

/* Marks a node with a unique color */
function mark_node(graph, elem) {
    let node = graph.nodes.get(elem.node);
    node.title = elem.comps + " Composantes Connexes";
    node.color = HIGHLIGHT_COLOR;
    graph.nodes.update(node);
  }
  
  /* Takes a set of nodes and marks them with a unique color */
  function highlight_maximizing_nodes(graph, set) {
    for (elem of set) {
      mark_node(graph, elem);
    }
  }

/* Removes a node and its edges from a graph */
function removeNode(graph, node) {
    graph.nodes.remove({
        id: node
    });
    for (edge of graph.edges.get()) {
        if (edge.from == node || edge.to == node) {
            graph.edges.remove({
                id: edge.id
            });
        }
    }
}

/* Saves nodes of a graph for later restore */
function saveNodes(nodes, savedNodes) {
    savedNodes.clear()
    for (node of nodes.get()) {
        savedNodes.add({
            id: node.id,
            label: node.label,
            title: node.title,
            color: node.color
        })
    }
}

/* Saves edges of a graph for later restore */
function saveEdges(edges, savedEdges) {
    savedEdges.clear()
    for (edge of edges.get()) {
        savedEdges.add({
            from: edge.from,
            to: edge.to
        })
    }
}

/* Saves a graph for later restore */
function saveGraph(graph, savedGraph) {
    saveNodes(graph.nodes, savedGraph.nodes);
    saveEdges(graph.edges, savedGraph.edges);
}

/* Restores a graph from a previously saved one */
function restoreGraph(graph, savedGraph) {
    graph.nodes.clear();
    graph.edges.clear();
    graph.nodes.add(savedGraph.nodes.get());
    graph.edges.add(savedGraph.edges.get());
}