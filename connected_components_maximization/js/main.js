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

/* Global ID -- Increments each time */
let ids = 0;

/* Assigns an ID to a newly created nodes */
function setId(node) {
  node.id = ids++
  node.label = node.id + ''
};

/* This function launches the algorithm and shows the results */
function find_max(show_finished = true) {
  let set = find_maximizing_nodes(graph);
  highlight_maximizing_nodes(graph, set);
  append_set_to_modal(set);

  if (show_finished)
    alert("Calcule terminé");
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

/* Extends the base toolbar with customized buttons */
function extend_toolbar(toolbar) {
  let toolbar_buttons = [
    build_toolbar_button({
      buttonClass: "vis-revert",
      text: " Retour"
    }, rollback_wrapper),
    build_toolbar_button({
      buttonClass: "vis-execute",
      text: " Executer"
    }, find_max),
    build_toolbar_button({
      buttonClass: "vis-display",
      text: " Afficher Les Composantes"
    }, show_modal)
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

options.manipulation.addEdge = function (node, callback) {
  push_graph_state(graph, states);
  callback(node);
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