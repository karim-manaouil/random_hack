/*
 * Author: Karim MANAOUIL @2018, fk_manaouil@esi.dz
 *
 * This files contains the entrypoint of the application,
 * global state and the visjs network component
 *
 */

let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);

let graph = {
  nodes: nodes,
  edges: edges
};

/* Global config returned from the execution of the algorithm
 * contains the cycles list and other information
 */
let g_config = Object();

/* Global ID -- Increments each time */
let ids = 0;

/* Next char */
function charAt(chr, off) {
  return String.fromCharCode(chr.charCodeAt(0) + off);
}

/* Assigns an ID to a newly created nodes */
function setId(node) {
  node.label = ids + "";
  node.id = ids++;
};

/* This function launches the algorithm and shows the results */
function execute (param) {
  let ts = performance.now();
  if (param === 0) {
    g_config = find_hamiltonian_cycles (graph, nodes.get (0), brute_next_child, action);
  } else {
    let selected_edges = minimal_cost_algo(graph, nodes.get(0))
    g_config.selected_edges = selected_edges;
  }
  let te = performance.now();
  show_result_on_modal (param, te - ts);
}

/* revert back */
function rollback(graph, states) {
  if (states.length > 0) {
    restoreGraph(graph, states.pop());
  }
}

/* Saves graph states for rollback */
function push_graph_state(graph, states) {
  let savedGraph = {
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([])
  };
  saveGraph(graph, savedGraph);
  states.push(savedGraph);
}

function show_result_on_modal (param, time = 0) {
  modal_div = document.getElementsByClassName("modal-body")[0];
  let cycle;
  let str = "";
  if (param === 0) {
    str = "Trivial";
    cycle = find_minimum_path(graph, g_config.cycles_list);
  } else {
    str = "Kruskal";
    cycle = g_config.selected_edges;
  }
  set_default_options (graph);
  highlight_edges (graph, cycle, HIGHLIGHT_COLOR);
  let show = "Temps d'execution " + str + ": " + time + " ms";
  show += "\n";
  show += "Coût: " + get_path_cost (cycle);
  alert (show);
}

function build_modal_table_tr(couple, id) {
  tr = document.createElement("tr");
  th = document.createElement("th");
  td_node = document.createElement("td");
  td_comps = document.createElement("td");

  th.setAttribute("scope", "row")
  th.innerText = id;

  td_node.innerText = couple.node;
  td_comps.innerText = couple.comps;

  tr.appendChild(th);
  tr.appendChild(td_node);
  tr.appendChild(td_comps);

  return tr;
}

function append_set_to_modal(set) {
  let count = 1;
  let table = document.getElementById("modal-table-body");

  table.innerHTML = "";

  for (couple of set) {
    table.appendChild (
      build_modal_table_tr(couple, count++)
    );
  }
}

/* Builds custom buttons (reverts and action) */
function build_toolbar_button(params, callback) {
  let button_div = document.createElement("div");
  let label_div = document.createElement("div");
  let separator = document.createElement("div");

  separator.className = "vis-separator-line";
  button_div.style = "touch-action: pan-y; -moz-user-select: none;";
  button_div.onclick = callback;
  button_div.className = "vis-button " + params.buttonClass;
  label_div.className = "vis-label";

  let textNode = document.createTextNode(params.text);

  label_div.appendChild(textNode);
  button_div.appendChild(label_div);

  return {
    button: button_div,
    separator: separator
  };
}

/* Appends custom buttons to toolbar */
function append_button_on_toolbar(params, toolbar) {
  toolbar.appendChild(params.separator);
  toolbar.appendChild(params.button);
}

/* Creates the customized toolbar */
function setup_custom_toolbar(buttons, toolbar) {
  for (button of buttons) {
    append_button_on_toolbar(button, toolbar);
  }
}

let states = [];

function rollback_wrapper() {
  rollback(graph, states);
}

function show_modal() {
  document.getElementById("showModal").click();
}

function brute_force () {
  execute (0);
}

function kruskal () {
  execute (1);
}

/* Extends the base toolbar with customized buttons */
function extend_toolbar(toolbar) {
  let toolbar_buttons = [
    build_toolbar_button({
      buttonClass: "vis-revert",
      text: " Retour"
    }, rollback_wrapper),
    build_toolbar_button({
      buttonClass: "vis-execute",
      text: " Trivial"
    }, brute_force),
    build_toolbar_button({
      buttonClass: "vis-execute",
      text: " Kruskal"
    }, kruskal)
  ];
  setup_custom_toolbar(toolbar_buttons, toolbar);
}

/******** This is somehow the main entrypoint of the applciation ********/

/* If you want to understand this piece of code then
   you need to read about vis.js library on the net */

/* Observe and save graph changes for rollback */
options.manipulation.addNode = function (node, callback) {
  push_graph_state(graph, states);
  setId(node);
  callback(node);
};

options.manipulation.addEdge = function (edge, callback) {
  push_graph_state(graph, states);

  let label = prompt ("Coût: ");
  if (label == null || label == "") {
    alert ("coût obligatoire");
  } else {
    edge.label = label + "";
    callback(edge);
  }
};

options.manipulation.deleteNode = function (node, callback) {
  push_graph_state(graph, states);
  callback(node);
}

options.manipulation.deleteEdge = function (node, callback) {
  push_graph_state(graph, states);
  callback(node);
}


/* Create the network */
let container = document.getElementById('network');
let network = new vis.Network(container, graph, options);

/* Observe changes on toolbar and append cutomized buttons */
let toolbar = document.getElementsByClassName("vis-manipulation")[0];

extend_toolbar(toolbar);

let observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type === 'childList') {
      let nodesA = toolbar.getElementsByClassName("vis-button vis-add");
      let nodesB = toolbar.getElementsByClassName("vis-button vis-execute");
      if (nodesA.length !== 0 && nodesB.length === 0) {
        extend_toolbar(toolbar);
      }
    }
  });
});

observer.observe(toolbar, config);

/*
nodes.add ([
  {id:0, label:"0"},
  {id:1, label:"1"},
  {id:2, label:"2"},
  {id:3, label:"3"}
])

edges.add ([
  {from:0, to:1, label:"1"},
  {from:0, to:2, label:"4"},
  {from:0, to:3, label:"2"},
  {from:1, to:2, label:"5"},
  {from:1, to:3, label:"3"},
  {from:2, to:3, label:"6"}
])
*/

/*
nodes.add ([
  {id:0, label:"0"},
  {id:1, label:"1"},
  {id:2, label:"2"},
  {id:3, label:"3"},
  {id:4, label:"4"},
  {id:5, label:"5"}
]);

edges.add ([
  {from:0, to:1, label:"10"},
  {from:0, to:2, label:"11"},
  {from:0, to:3, label:"12"},
  {from:0, to:4, label:"13"},
  {from:0, to:5, label:"14"},
  {from:1, to:2, label:"15"},
  {from:1, to:3, label:"16"},
  {from:1, to:4, label:"17"},
  {from:1, to:5, label:"18"},
  {from:2, to:3, label:"19"},
  {from:2, to:4, label:"20"},
  {from:2, to:5, label:"21"},
  {from:3, to:4, label:"22"},
  {from:3, to:5, label:"23"},
  {from:4, to:5, label:"24"}
])
*/
/*
 physics : {enabled: true},
  interaction: {
        hover: true
    },
*/
