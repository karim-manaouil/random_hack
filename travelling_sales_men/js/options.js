let options = {
  physics : {enabled: true},
  interaction: {
        hover: true
    },

    physics: {barnesHut: {gravitationalConstant: 0,
          centralGravity: 0, springConstant: 0}
        },

    manipulation: {
        enabled: true,
        initiallyActive: true,
    },

    locales: {
        en: {
            edit: 'Modifier',
            del: 'Supprimer',
            back: 'Retour',
            addNode: 'Ajouter Noeud',
            addEdge: 'Ajouter Lien',
            editNode: 'Modifier Noeud',
            editEdge: 'Modifier Lien',
            addDescription: 'Cliquer sur un endroit vide pour créer un noeud.',
            edgeDescription: 'Cliquer sur un noeud et faîtes glisser vers un autre.',
            editEdgeDescription: 'Click on the control points and drag them to a node to connect to it.',
            createEdgeError: 'Cannot link edges to a cluster.',
            deleteClusterError: 'Clusters cannot be deleted.',
            editClusterError: 'Clusters cannot be edited.'
        }
    }
}

let config = {
    attributes: true,
    childList: true,
    characterData: true
}
