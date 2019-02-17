/*
 * Author: Karim MANAOUIL @2018, fk_manaouil@esi.dz
 *
 * This file contains the Kruskal algorithm and the brute force
 * algorithm that finds all possible hamiltonian cycles of a graph
 *
 */

/* Color used to highlight graph nodes */
let HIGHLIGHT_COLOR = '#00EE00';

/* Algorithm to find hamiltonian cycles
 * start : Starting node
 * heuristic : a function that chooses the next child of a node to visit
 * action : a callback to be executed once a cycle is found
 * Return an array of cycles (A cycle is an array of nodes)
 */

function find_hamiltonian_cycles (graph, start, heuristic, action) {
    let cycles_list = [];
    let current_cycle = [];
    let visited = [];
    let degree = size_of (graph);

    let config = {
        start : start,
        next : heuristic,
        action : action,
        degree : degree,
        visited : visited,
        cycles_list : cycles_list,
        current_cycle : current_cycle,
        recursion : 1
    };

    current_cycle.push (start);
    find_cycles (graph, start, config);

    return config;
}

/* Helper function of find_hamiltonian_cycles */
function find_cycles (graph, node, config) {
    if (node.id === config.start.id && config.current_cycle.length > 1) {
        if (config.current_cycle.length - 1 === config.degree) {
            if (config.action (config)) {
                config.recursion = 0; /* End recusion */
            }
        }
        config.current_cycle.pop ();
        config.visited[node.id] = undefined;
        return;
    }

    let children = nof_children(graph, node);
    let local = [];

    for (let i = 0; i < children; i++) {
        let next = config.next (graph, node, config.visited, local);
        if (next === undefined) {
            break;
        }
        config.current_cycle.push (next);
        local[next.id] = true;
        config.visited[next.id] = true;
        find_cycles(graph, next, config);
    }

    previous = config.current_cycle.pop ();
    config.visited[previous.id] = undefined;
}

function nof_children (graph, node) {
    let children = 0;

    for (edge of graph.edges.get()) {
        if (edge.to === node.id || edge.from === node.id) {
            children++;
        }
    }

    return children;
}

function action (config) {
    config.cycles_list.push (
        config.current_cycle.slice()
    )
}

/* Heuristic to choose the next node in the brute force algorithm
 * Returns a node.
 */
function brute_next_child (graph, node, visited, local) {
    let child_id = -1;
    for (edge of graph.edges.get()) {
        if (edge.from == node.id) {
            child_id = edge.to;
        } else if (edge.to == node.id) {
            child_id = edge.from;
        }
        if (child_id !== -1 && visited[child_id] === undefined && local[child_id] === undefined) {
            return graph.nodes.get (child_id);
        }
    }
}

/* Heuristic to choose the next node in the Kruskal algorithm
 * Returns a node.
 */
function kruskal_next_child (graph, node, visited, local) {

}

function swap (a, i, j) {
    let t = a[j];
    a[j] = a[i];
    a[i] = t;
}

function copy_edges (edges) {
    let Edges = [];

    /* Push edges in sorted order */
    for (edge of edges) {
        Edges.push (edge);
        let j = Edges.length - 1;

        while (j > 0) {
            let v1 = Edges[j].label - 0;
            let v2 = Edges[j-1].label - 0;

            if (v1 > v2) {
                break;
            }

            swap (Edges, j - 1, j);
            j = j - 1;
        }
    }

    return Edges;
}

function subset_contains_cycle (edges) {
    let subsets = Array(30);

    for (edge of edges) {
        if (subsets[edge.to] == undefined) {
            subsets[edge.to] = edge.to;
        }
        if (!subsets[edge.from] == undefined) {
            subsets[edge.from] = edge.from;
        }
        if (subsets[edge.to] == subsets[edge.from]) {
            return true;
        } else {
            for (index in subsets) {
                if (subsets[index] == edge.to) {
                    subsets[index] = edge.from;
                }
            }
        }
    }

    return false;
}

function tsp_with_kruskal_heuristic (graph) {
    let SortedEdges = copy_edges(graph.edges.get());
    let VertexOrders = Array(graph.nodes.length).fill(0);

    let number_of_edges = 0;
    let sorted_edges_iterator = 0;

    let SelectedEdges = [];

    let total_nodes = graph.nodes.length;
    let total_edges = SortedEdges.length;

    while (number_of_edges != total_nodes && sorted_edges_iterator < total_edges) {
        let edge = SortedEdges[sorted_edges_iterator++];
        if (VertexOrders[edge.from] < 2 && VertexOrders[edge.to] < 2) {
            SelectedEdges.push (edge);
            if (subset_contains_cycle (SelectedEdges)) {
                SelectedEdges.pop();
                continue; /* refue edge & check next one in while loop */
            } else { /* Otherwise edge accepted */
                number_of_edges++;
                VertexOrders[edge.from]++;
                VertexOrders[edge.to]++;

            }
        }
    }

    return SelectedEdges;
}

function minimal_cost_algo (graph, start) {
  let visited = new Set();
  let cycle = [];
  let node_count = 0;
  let current_id = start.id;

  visited.add(start.id);

  let which_edge;
  
  while (node_count < graph.nodes.length - 1) {
    let next_candidate;
    let min_cost = Number.POSITIVE_INFINITY;
    edges_list = graph.edges.get({
      filter: function (item) {
        return item.from === current_id || item.to === current_id;
      }
    });

    for (edge of edges_list) {
      let edge_cost = edge.label - 0;
      which_edge = (edge.from === current_id) ? edge.to : edge.from;
      if (!visited.has(which_edge) && edge_cost < min_cost) {
        min_cost = edge_cost;
        next_candidate = edge;
      }
    }
    cycle.push (next_candidate);
    which_edge = (next_candidate.from === current_id) ? next_candidate.to : next_candidate.from;
    visited.add (which_edge);
    current_id = which_edge;
    node_count++;
  }

  let first = visited.values().next().value;

  let last_edge = graph.edges.get({
      filter : function (item) {
          return item.from === first && item.to === which_edge || item.from === which_edge && item.to === first;
      }
  });

  cycle.push(last_edge[0]);

  return cycle;
}

/* degree of a graph */
function size_of (graph) {
    let degree = 0;

    for (node of graph.nodes.get())
        degree++;

    return degree;
}

function weight_of_cycle (graph, cycle) {
  let weight = 0;
  let cycle_edges = [];
  for (let i = 0; i < cycle.length - 1; i++) {
    let from = cycle[i].id;
    let to = cycle[i+1].id;
    let edge = graph.edges.get({
      filter: function (item) {
        return (item.from === from && item.to === to) ||
          (item.from === to && item.to === from);
      }
    })[0];
    cycle_edges.push (edge);
    let label = edge.label - 0;
    weight += label;
  }
  return {weight: weight, edges: cycle_edges};
}

function find_minimum_path (graph, cycles_list) {
  let min_weight = Number.POSITIVE_INFINITY;
  let minimal_cycle;

  for (cycle of cycles_list) {
    let ret = weight_of_cycle (graph, cycle);
    if (ret.weight < min_weight) {
      min_weight = ret.weight;
      minimal_cycle = ret.edges;
    }
  }
  return minimal_cycle;
}

function get_path_cost (cycle) {
  let cost = 0;
  for (edge of cycle) {
      cost += edge.label - 0;
  }
  return cost;
}

function highlight_edges (graph, cycle, color) {
  for (edge of cycle) {
    edge.color = {color:color, highlight:color, hover:color};
    edge.width = 4;
    graph.edges.update(edge);
  }
}

function set_default_options (graph) {
  for (edge of graph.edges.get()) {
    edge.color = {color:'#848484', highlight:'#848484', hover:'#848484'};
    edge.width = 1;
    graph.edges.update(edge);
  }
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
