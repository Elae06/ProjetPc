
var listeProduits = [];
var panier = [];

// Taux de TVA : 19 %
const TAUX_TVA = 0.19;


// 1. Charger les produits depuis le fichier JSON
async function chargerZoneItem() {
    const url = "produits.json";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Status " + response.status);
        }

        // Transformer le JSON en objet JavaScript
        const objJSON = await response.json();

        listeProduits = objJSON.liste;

        // Afficher les produits
        afficherListeProduits();

        // Mettre à jour le nombre d'articles
        calculerFacture();

    } catch (error) {
        alert("Erreur lors du chargement des produits : " + error.message);
    }
}


// 2. Afficher les produits
function afficherListeProduits() {
    const zone = document.getElementById("zoneContenuItem");

    // Vider la zone avant de créer les produits
    zone.innerHTML = "";

    listeProduits.forEach(function(item) {
        var description = item.description;
        var image = item.image;
        var prix = item.prix;

        // Créer le bloc du produit
        var noeudDivItem = document.createElement("div");
        noeudDivItem.setAttribute("class", "item");

        // Créer l'image
        var noeudImage = document.createElement("img");
        noeudImage.setAttribute("class", "imageItem");
        noeudImage.setAttribute("src", image);
        noeudImage.setAttribute("alt", description);

        // Cliquer sur l'image pour afficher les détails
        noeudImage.addEventListener("click", function() {
            afficherDetail(item);
        });

        noeudDivItem.appendChild(noeudImage);

        // Créer la description
        var noeudDescription = document.createElement("div");
        noeudDescription.setAttribute("class", "description");
        noeudDescription.textContent = description;
        noeudDivItem.appendChild(noeudDescription);

        // Créer le prix
        var noeudPrix = document.createElement("div");
        noeudPrix.setAttribute("class", "prix");
        noeudPrix.textContent = prix + " TND";
        noeudDivItem.appendChild(noeudPrix);

        // Créer le bouton Ajouter
        var noeudBtnAjouter = document.createElement("div");
        noeudBtnAjouter.setAttribute("class", "ajouter");
        noeudBtnAjouter.textContent = "Ajouter";

        // Ajouter une unité au panier
        noeudBtnAjouter.addEventListener("click", function() {
            var ligneCommande = {
                produit: item,
                quantite: 1
            };

            ajouterItem(ligneCommande);
        });

        noeudDivItem.appendChild(noeudBtnAjouter);

        // Ajouter le produit à la page
        zone.appendChild(noeudDivItem);
    });
}


// 3. Afficher les détails d'un produit
function afficherDetail(unProduit) {
    document.querySelector("#zoneDetail").style.display = "block";

    // Afficher les informations du produit sélectionné
    document.querySelector("#uneImage").src = unProduit.image;
    document.querySelector("#uneDescription").innerHTML =
        unProduit.description;
    document.querySelector("#unPrix").innerHTML = unProduit.prix;
    document.querySelector("#unDetail").innerHTML = unProduit.details;

    // Action du bouton Ajouter dans la boîte de dialogue
    document.querySelector("#unAjout").onclick = function() {

        // Récupérer la quantité saisie
        var qte = parseInt(
            document.querySelector("#txtQuantite").value
        );

        // Vérifier la quantité
        if (isNaN(qte) || qte < 1) {
            alert("Veuillez saisir une quantité valide.");
            return;
        }

        // Créer la ligne de commande
        var ligneCommande = {
            produit: unProduit,
            quantite: qte
        };

        // Ajouter le produit au panier
        ajouterItem(ligneCommande);

        // Fermer la boîte de dialogue
        fermerDialogue();

        // Remettre la quantité à 1
        document.querySelector("#txtQuantite").value = 1;
    };
}


// 4. Fermer la boîte de dialogue
function fermerDialogue() {
    document.querySelector("#zoneDetail").style.display = "none";
}


// 5. Ajouter un produit au panier
function ajouterItem(ligneCommande) {
    panier.push(ligneCommande);

    // Recalculer la facture et le nombre d'articles
    calculerFacture();
}


// 6. Afficher la facture
function afficheFacture() {
    // Cacher les produits
    document.getElementById("zoneContenuItem").style.display = "none";

    // Afficher la facture
    document.getElementById("zoneContenuFacture").style.display = "block";

    var noeudTBody = document.querySelector("#corpsTableau");

    // Supprimer les anciennes lignes
    noeudTBody.innerHTML = "";

    // Créer une ligne pour chaque commande
    panier.forEach(function(ligneCommande, index) {
        var nomDeProduit = ligneCommande.produit.description;
        var quantite = ligneCommande.quantite;
        var prix = parseFloat(ligneCommande.produit.prix);

        var noeudTr = document.createElement("tr");

        // Colonne Description
        var noeudTd1 = document.createElement("td");
        noeudTd1.textContent = nomDeProduit;
        noeudTr.appendChild(noeudTd1);

        // Colonne Quantité
        var noeudTd2 = document.createElement("td");
        var noeudInput = document.createElement("input");

        noeudInput.setAttribute("type", "number");
        noeudInput.setAttribute("min", "1");
        noeudInput.setAttribute("value", quantite);

        // Modifier la quantité dans la facture
        noeudInput.addEventListener("change", function() {
            var nouvelleQte = parseInt(this.value);

            if (isNaN(nouvelleQte) || nouvelleQte < 1) {
                nouvelleQte = 1;
                this.value = 1;
            }

            panier[index].quantite = nouvelleQte;

            // Recalculer les montants
            calculerFacture();
        });

        noeudTd2.appendChild(noeudInput);
        noeudTr.appendChild(noeudTd2);

        // Colonne Prix unitaire
        var noeudTd3 = document.createElement("td");
        noeudTd3.textContent = prix.toFixed(2) + " TND";
        noeudTr.appendChild(noeudTd3);

        noeudTBody.appendChild(noeudTr);
    });

    calculerFacture();
}


// 7. Calculer le sous-total, la TVA et le total
function calculerFacture() {
    var sousTotal = 0;
    var totalQte = 0;

    // Calculer le sous-total et la quantité totale
    panier.forEach(function(ligneCommande) {
        var quantite = parseInt(ligneCommande.quantite);
        var prix = parseFloat(ligneCommande.produit.prix);

        sousTotal += quantite * prix;
        totalQte += quantite;
    });

    // Calculer la TVA à 19 %
    var totalTVA = sousTotal * TAUX_TVA;

    // Calculer le montant total TTC
    var total = sousTotal + totalTVA;

    // Afficher les montants
    document.querySelector("#idSousTotal").textContent =
        sousTotal.toFixed(2) + " TND";

    document.querySelector("#idTotalTVA").textContent =
        totalTVA.toFixed(2) + " TND";

    document.querySelector("#idTotal").textContent =
        total.toFixed(2) + " TND";

    // Mettre à jour le nombre total d'articles
    document.getElementById("idItem").textContent = totalQte;
}


// 8. Cliquer sur le panier pour afficher la facture
var noeudPanier = document.getElementById("panier");

if (noeudPanier) {
    noeudPanier.style.cursor = "pointer";
    noeudPanier.addEventListener("click", afficheFacture);
}
