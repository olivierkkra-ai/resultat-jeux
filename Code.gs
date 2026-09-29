function doGet(e) {
  // Récupérer les paramètres de l'URL (GET)
  let data = {
    nom: e.parameter.nom || "",
    telephone: e.parameter.telephone || ""
  };
  
  const resultat = verifierParticipation(data);
  const jsonString = JSON.stringify(resultat);
  
  // Support JSONP (Contournement universel des blocages CORS)
  if (e.parameter.callback) {
    return ContentService.createTextOutput(e.parameter.callback + '(' + jsonString + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}

// Nettoie le texte : supprime accents, espaces et minuscules pour une comparaison fiable
function normaliserTexte(txt) {
  if (!txt) return "";
  return txt
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents (é -> e, etc.)
    .toLowerCase()
    .replace(/[\s\-_'".]/g, "");    // Supprime espaces et ponctuations
}

function verifierParticipation(data) {
  // LockService évite les conflits d'écriture si plusieurs personnes valident en même temps
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const ss = SpreadsheetApp.openById("1uhy1rofYVpc7GXrMX6A-frFv_ry0svahJE89WELgNmQ");
    let sheet = ss.getSheetByName("Clients");

    if (!sheet) {
      sheet = ss.insertSheet("Clients");
      sheet.appendRow(["Nom", "Téléphone", "Statut", "Lot", "Image", "Date Inscription"]);
      sheet.getRange("A1:F1").setFontWeight("bold");
    }

    const rows = sheet.getDataRange().getValues();
    const saisieNom = normaliserTexte(data.nom);
    const telPropre = (data.telephone || "").toString().trim();

    let ligneTrouveeIndex = -1;
    let clientTrouve = null;

    // Parcours de la liste à partir de la ligne 2 (index 1)
    for (let i = 1; i < rows.length; i++) {
      const rowNom = normaliserTexte(rows[i][0]);

      // Correspondance sur le nom
      if (rowNom === saisieNom || (saisieNom.length >= 3 && rowNom.includes(saisieNom))) {
        ligneTrouveeIndex = i + 1; // +1 car les lignes Sheets commencent à 1
        clientTrouve = {
          nom: rows[i][0],
          telephoneExistant: rows[i][1],
          statut: rows[i][2] ? rows[i][2].toString().trim().toLowerCase() : "perdu",
          lot: rows[i][3] || "",
          image: rows[i][4] || ""
        };
        break;
      }
    }

    // ==========================================
    // CAS 1 : CLIENT TROUVÉ DANS LA FEUILLE
    // ==========================================
    if (clientTrouve) {
      // Si la colonne Téléphone (colonne B / 2) est vide ou différente, on la remplit automatiquement
      if (!clientTrouve.telephoneExistant || clientTrouve.telephoneExistant.toString().trim() === "") {
        sheet.getRange(ligneTrouveeIndex, 2).setValue("'" + telPropre);
      }

      const statutPropre = normaliserTexte(clientTrouve.statut);
      const estGagnant = (statutPropre === "gagne" || statutPropre === "gagnant");

      return {
        match: true,
        nom: clientTrouve.nom,
        telephone: telPropre,
        gagne: estGagnant,
        lot: clientTrouve.lot,
        image: clientTrouve.image
      };
    }

    // =======================================================
    // CAS 2 : NON TROUVÉ -> ENREGISTREMENT AUTOMATIQUE
    // =======================================================
    sheet.appendRow([
      data.nom.trim(),
      "'" + telPropre,
      "Non éligible",        // Statut attribué
      "",                    // Pas de lot
      "",                    // Pas d'image
      new Date()             // Horodatage de l'inscription
    ]);

    return {
      match: false,
      nonInscrit: true
    };

  } catch (err) {
    return { match: false, error: err.toString() };
  } finally {
    lock.releaseLock();
  }
}
