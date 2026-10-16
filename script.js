var listeProduits = [];
var panier = [];
var produitCourant = null; // AJOUT : produit affiché dans #zoneDetail
const TAUX_TVA =0.19;

function afficherListeProduits() {
    listeProduits.forEach(function(item) {
        var description = item.description;
        var image = item.image;
        var prix = item.prix;
        var noeudDivItem = document.createElement("div");
        noeudDivItem.setAttribute("class", "item");

        var noeudImage = document.createElement("img");
        noeudImage.setAttribute("class", "imageItem");
        noeudImage.setAttribute("src", image);
        noeudDivItem.appendChild(noeudImage);

        noeudImage.addEventListener("click", function() {
            afficherDetail(item);
        });

        var noeudDescription = document.createElement("div");
        noeudDescription.setAttribute("class", "description");
        noeudDescription.appendChild(document.createTextNode(description));
        noeudDivItem.appendChild(noeudDescription);

        var noeudPrix = document.createElement("div");
        noeudPrix.setAttribute("class", "prix");
        noeudPrix.appendChild(document.createTextNode(prix));
        noeudDivItem.appendChild(noeudPrix);

        var noeudBtnAjouter = document.createElement("div");
        noeudBtnAjouter.setAttribute("class", "ajouter");
        noeudBtnAjouter.appendChild(document.createTextNode("Ajouter"));
        
        // MODIFIÉ : on utilise la fonction commune ajouterAuPanier
        noeudBtnAjouter.addEventListener("click", function() {
            ajouterAuPanier(item, 1);
        });
        // ---------------------------------------------------------------------

        noeudDivItem.appendChild(noeudBtnAjouter);

        document.getElementById("zoneContenuItem").appendChild(noeudDivItem);
    });
}

// --- Chargement des produits avec l'API Fetch ---
async function chargerZone() {
    try {
        const response = await fetch("produits.json", {
            headers: { Accept: "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const donnees = await response.json();
        if (!donnees || !Array.isArray(donnees.liste)) {
            throw new Error("Le format des données produits est invalide.");
        }

        listeProduits.length = 0;
        listeProduits.push(...donnees.liste);
        document.getElementById("zoneContenuItem").replaceChildren();
        afficherListeProduits();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        alert(`Erreur lors du chargement des produits : ${message}`);
    }
}

function afficherDetail(unProduit){
    produitCourant = unProduit; // AJOUT
    document.querySelector("#zoneDetail").style.display = "block";
    document.querySelector("#uneImage").src = unProduit.image;
    document.querySelector("#uneDescription").innerHTML = unProduit.description;
    document.querySelector("#unPrix").innerHTML = unProduit.prix;
    document.querySelector("#unDetail").innerHTML = unProduit.details;
    document.querySelector("#txtQuantite").value = 1; // AJOUT
}

function fermerDialogue(){
    document.querySelector("#zoneDetail").style.display = "none";
}

// AJOUT : fonction commune utilisée par les 2 boutons "Ajouter"
function ajouterAuPanier(produit, quantite){
    quantite = parseInt(quantite);
    if (isNaN(quantite) || quantite < 1) quantite = 1;

    var existante = panier.find(function(l){
        return l.produit === produit;
    });
    if (existante) {
        existante.quantite = parseInt(existante.quantite) + quantite;
        calculerFacture();
    } else {
        ajouterItem({ produit: produit, quantite: quantite });
    }
}

function ajouterItem(ligneCommande){
    panier.push(ligneCommande);
    var quantite = ligneCommande.quantite ;
    var nbItemPanier = parseInt(document.getElementById("idItem").innerHTML);
    nbItemPanier += parseInt(quantite);
    document.getElementById("idItem").innerHTML = nbItemPanier;
}
function afficheFacture(){
    document.getElementById("zoneContenuItem").style.display = "none";
    document.getElementById("zoneContenuFacture").style.display = "block";
    document.getElementById("zoneContenuFacture").style.height = "85%";

    var sousTotal = 0;
    var noeudTBody = document.querySelector("#corpsTableau");
    noeudTBody.innerHTML = ""; // AJOUT : évite les lignes dupliquées
    panier.forEach(function(ligneCommande, index){
        var nomDeProduit = ligneCommande.produit.description;
        var quantite = ligneCommande.quantite;
        var prix = ligneCommande.produit.prix;
        sousTotal += parseInt(quantite) * parseFloat(prix);

        var noeudTr = document.createElement("tr");
        var noeudTd1 = document.createElement("td");
        var contenuTd1 = document.createTextNode(nomDeProduit);
        noeudTd1.appendChild(contenuTd1);
        noeudTr.appendChild(noeudTd1);

        var noeudTd2 = document.createElement("td");
        var noeudTd21 = document.createElement("input");
        noeudTd21.setAttribute("type", "text");
        noeudTd21.setAttribute("value", quantite);
        noeudTd21.addEventListener("change", function(){
            var nouvelleQte = this.value;
            panier[index].quantite = nouvelleQte;
            //enregistrerPanier();
            calculerFacture();
        });
        noeudTd2.appendChild(noeudTd21);
        noeudTr.appendChild(noeudTd2);

        var noeudTd3 = document.createElement("td");
        var contenuTd3 = document.createTextNode(prix);
        noeudTd3.appendChild(contenuTd3);
        noeudTr.appendChild(noeudTd3);

        noeudTBody.appendChild(noeudTr);
    });

    var totalTVA = sousTotal * TAUX_TVA;
    var total = sousTotal + totalTVA;

    document.querySelector("#idSousTotal").innerHTML = sousTotal.toFixed(2) + " dt";
    document.querySelector("#idTVA").innerHTML = totalTVA.toFixed(2) + " dt";
    document.querySelector("#idTotal").innerHTML = total.toFixed(2) + " dt";
}
function calculerFacture(){
    var sousTotal = 0;
    var totalQte = 0;
    panier.forEach(function(ligneCommande){
        /*
         un petit rappel pour la ligneCommande
         ligneCommande = {produit : pr, quantite : qte};
        */
        var quantite = ligneCommande.quantite;
        var prix = ligneCommande.produit.prix;
        sousTotal += parseInt(quantite) * parseFloat(prix);
        totalQte += parseInt(quantite);
    });
    var totalTVA = sousTotal * TAUX_TVA;
    var total = sousTotal + totalTVA;
    document.querySelector("#idSousTotal").innerHTML = sousTotal.toFixed(2) + " dt";
    document.querySelector("#idTVA").innerHTML = totalTVA.toFixed(2) + " dt";
    document.querySelector("#idTotal").innerHTML = total.toFixed(2) + " dt";

    //Modification du panier
    document.getElementById("idItem").innerHTML = totalQte;
}
var noeudPanier = document.getElementById("panier");
noeudPanier.style.cursor = "pointer";
noeudPanier.addEventListener("click", afficheFacture);

document.getElementById("btnContinuerMagasiner").addEventListener("click", function(){
    document.getElementById("zoneContenuFacture").style.display = "none";
    document.getElementById("zoneContenuItem").style.display = "block";
});

// AJOUT : bouton "Ajouter" dans la zone détail (utilise la quantité saisie)
document.querySelector("#unAjout").addEventListener("click", function(){
    if (produitCourant) {
        ajouterAuPanier(produitCourant, document.querySelector("#txtQuantite").value);
    }
});
