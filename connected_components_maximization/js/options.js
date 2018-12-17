let options = {
    interaction: {
        hover: true
    },
    manipulation: {
        enabled: true,
        initiallyActive: true,
    },

    edges: {
        color: {
            inherit: false
        }
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