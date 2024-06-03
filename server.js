//backend
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require ('bcrypt');
const bodyParser = require('body-parser');
const Apprenant = require('./models/Apprenant');
const Instructeur = require('./models/Instructeur');
const Admin = require ('./models/Admin');
const Fichier = require ('./models/Fichier');


const jwt = require ('jsonwebtoken');
const nodemailer = require('nodemailer');

const { MongoClient } = require('mongodb');
const fs = require('fs');
const speech = require('@google-cloud/speech').v1p1beta1;
const client = new speech.SpeechClient();
const util = require('util'); // Importez le module 'util' pour utiliser la méthode promisify
const readFileAsync = util.promisify(fs.readFile);
const session = require('express-session');
const crypto = require('crypto');




// requirement to upload file 
const multer = require('multer');
const path = require('path');
const { PythonShell } = require('python-shell');
// end requirement to upload file 
require('./config/connect');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());
//app.use(express.urlencoded({ extended: true }));


const { readFile } = require('fs').promises;



const fichiersCollection = mongoose.connection.collection('fichiers');

app.use(express.json());
app.use(express.static('public'));
const DIR = "/public/uploads/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.split('.')[0] + "-" + Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

var upload = multer({
    storage: storage,
});
var uploadMultiple = upload.single('file');

app.post('/api/transcribeFichier', uploadMultiple, async (req, res) => {
    try {
        // Récupérer les données de la requête
        const { filePath, langueOriginal, langueTranslated, id_fichier } = req.body;

        // Exécuter le code Python pour la transcription
        let parameters = {
            mode: 'text',
            args: [filePath, langueOriginal, langueTranslated]
        };

        try {
            const results = await PythonShell.run('./public/script.py', parameters);

            console.log('Transcription réussie');
            const filePathOriginal = results[0];
            const filePathTranslated = results[1];
        
            // Vérifier si les chemins de fichiers sont définis correctement
            if (filePathOriginal && filePathTranslated) {
                // Vérifier si les fichiers existent après la transcription
                if (fs.existsSync(filePathOriginal) && fs.existsSync(filePathTranslated)) {
                    // Lire le contenu des fichiers transcrits
                    const contentOriginal = fs.readFileSync(filePathOriginal, 'utf-8');
                    const contentTranslated = fs.readFileSync(filePathTranslated, 'utf-8');

                    // enregistrer le nom du fichier dans la collection Fichier
                    let originalFilesString = filePathOriginal.search("original_files") + 15;
                    const fileName = filePathOriginal.substr(originalFilesString, filePathOriginal.length);
                    await setTextFileName(fileName, id_fichier);
        
                    // Envoyer la réponse avec les contenus des fichiers transcrits
                    res.json({
                        success: true,
                        message: 'Transcription réussie.',
                        contentOriginal: contentOriginal,
                        contentTranslated: contentTranslated,
                        filePathOriginal: filePathOriginal, // Envoyer les chemins des fichiers transcrits
                        filePathTranslated: filePathTranslated
                    });
        
                    // Afficher le contenu des fichiers transcrits dans la console de Postman
                    console.log('Contenu du fichier original:', contentOriginal);
                    console.log('Contenu du fichier traduit:', contentTranslated);
                } else {
                    // Si l'un des fichiers n'existe pas, renvoyer une erreur
                    throw new Error('Erreur lors de la transcription : Un ou plusieurs fichiers de transcription n\'existent pas.');
                }
            } else {
                // Si l'un des chemins de fichiers est undefined, renvoyer une erreur
                throw new Error('Erreur lors de la transcription : Chemins de fichiers non définis.');
                
            }
        } catch(error) {
            console.error('Erreur lors de l\'exécution du code Python:', error);
            res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'exécution du code Python.', error: error.message });
        };
    } catch (error) {
        console.error('Erreur lors de la transcription:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la transcription.', error: error.message });
    }
});

const setTextFileName = async (fileName, fichierId) => {
    return await fichiersCollection.updateOne(
        { id_fichier: fichierId },
        {
            $set: {
                textFileName: fileName
            },
        }
    );
}



app.post('/api/addFichier', async (req, res) => {
    try {
        const idFichier = req.body.id_fichier || uuidv4();
        const { title, description, dateUpload, domain, fileName, filePathOriginal, langueOriginal, langueTranslated } = req.body;

        // Enregistrement du fichier et autres données dans la base de données
        const result = await fichiersCollection.insertOne({
            id_fichier: idFichier,
            title: title,
            description: description,
            dateUpload: new Date(dateUpload), // Assurez-vous que dateUpload est bien converti en objet Date
            domaine: domain,
            fileName: fileName,
            filePathOriginal: filePathOriginal,
            langueOriginal: langueOriginal, 
            langueTranslated: langueTranslated 
        });

        console.log('Fichier ajouté avec succès :', result);

        res.json({ success: true, message: 'Fichier ajouté avec succès à la base de données.' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du fichier :', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'ajout du fichier.', error: error.message });
    }
});


  




app.get('/api/file-content', async (req, res) => {
    const fileName = req.query.fileName;
    const filePath = path.join(__dirname, 'public', 'uploads','original_files', fileName); // Formez le chemin absolu du fichier

    try {
        const fileContent = await readFile(filePath, 'utf-8'); // Utilisez la méthode readFile de fs.promises
        res.send(fileContent);
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Error reading file');
    }
});

app.post('/api/checkFichierExistence', async (req, res) => {
  try {
      const { fileName } = req.body;

      // Vérifier si le fichier existe déjà dans la base de données
      const existingFichier = await fichiersCollection.findOne({ fileName: fileName });
      if (existingFichier) {
          return res.status(200).json({ exists: true, message: 'Le fichier existe déjà dans la base de données.' });
      } else {
          return res.status(200).json({ exists: false, message: 'Le fichier n\'existe pas dans la base de données.' });
      }
  } catch (error) {
      console.error('Error checking fichier existence:', error);
      res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la vérification de l\'existence de la vidéo.', error: error.message });
  }
});









app.get('/api/getFichiers', async (req, res) => {
    const fichiers = await fichiersCollection.find().toArray();
    res.json(fichiers);
});

app.delete('/api/deleteFichier/:fichierId', async (req, res) => {
    try {
        const fichierId = req.params.fichierId;
        const result = await fichiersCollection.deleteOne({ id_fichier: fichierId });

        if (result.deletedCount > 0) {
            console.log('fichier deleted successfully:', result);
            res.json({ success: true, message: 'fichier supprimée avec succès de la base de données.' });
        } else {
            console.log('fichier not found');
            res.status(404).json({ success: false, message: 'fichier non trouvée dans la base de données.' });
        }
    } catch (error) {
        console.error('Error deleting fichier:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la suppression de la vidéo.', error: error.message });
    }
});

app.put('/api/updateFichier/:fichierId', async (req, res) => {
    try {
        const fichierId = req.params.fichierId;
        const { title, description, domain, fileName, langueOriginal } = req.body;

        const result = await fichiersCollection.updateOne(
            { id_fichier: fichierId },
            {
                $set: {
                    title: title,
                    description: description,
                    domaine: domain,
                    fileName: fileName,
                    dateUpload: new Date(),
                    langueOriginal: langueOriginal
                },
            }
        );

        if (result.modifiedCount > 0) {
            console.log('Fichier updated successfully:', result);
            res.json({ success: true, message: 'Fichier mise à jour avec succès dans la base de données.' });
        } else {
            console.log('Fichier not found');
            res.status(404).json({ success: false, message: 'Fichier non trouvée dans la base de données.' });
        }
    } catch (error) {
        console.error('Error updating fichier:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la mise à jour de la vidéo.', error: error.message });
    }
});




app.post('/api/checkExistingFile', async (req, res) => {
  try {
      const { fileName } = req.body;

      // Vérifie si le fichier existe déjà dans la base de données
      const existingFile = await fichiersCollection.findOne({ fileName });

      if (existingFile) {
          res.status(200).json({ exists: true, message: 'Le fichier existe déjà dans la base de données.' });
      } else {
          res.status(200).json({ exists: false, message: 'Le fichier n\'existe pas dans la base de données.' });
      }
  } catch (error) {
      console.error('Erreur lors de la vérification de l\'existence du fichier :', error);
      res.status(500).json({ exists: false, message: 'Une erreur est survenue lors de la vérification de l\'existence du fichier.' });
  }
});







/////////////////////////////////////////////////////////////////////////////////////////////////

const apprenantsCollection = mongoose.connection.collection('apprenants');


/*app.post('/api/addApprenant', async (req, res) => {
    try {
        const idApprenant = req.body.id;
        const { nom,email,mdp,role,langue,statut,niveau,ville } = req.body;

        const result = await apprenantsCollection.insertOne({
            id: idApprenant,
            nom:nom,
            email:email,
            mdp:mdp,
            role:role,
            langue:langue,
            statut:statut,
            niveau:niveau,
            ville:ville,
            dateNaiss:new Date(),
        });

        console.log('Apprenat added successfully:', result);

        res.json({ success: true, message: 'Apprenant ajoutée avec succès à la base de données.' });
    } catch (error) {
        console.error('Error adding apprenant:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'ajout de l apprenant.', error: error.message });
    }
});*/

app.use(bodyParser.json());


app.post('/api/registerA', async (req, res) => {
    try {
        const data = req.body;

        // Ajouter l'attribut statut avec la valeur "actif" par défaut
        data.etat = "actif";

        const app = new Apprenant(data);

        // Hashage du mot de passe
        const salt = bcrypt.genSaltSync(10);
        const cryptedPass = await bcrypt.hashSync(data.mdp, salt);
        app.mdp = cryptedPass;

        app.save()
            .then(savedApprenant => {
                res.send(savedApprenant);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    } catch (error) {
        console.error('Error registering apprenant:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'enregistrement de l\'apprenant.', error: error.message });
    }
});



/////////////////////////////////////////////////////////////////
// Route pour l'ajout d'un utilisateur apprenant
app.post('/api/addStudent', async (req, res) => {
    try {
        // Récupérer les données de la requête
        const { id, nom, email, mdp, langue, dateNaiss, statut, niveau, ville } = req.body;

        // Vérifier si les champs requis sont fournis
        if (!nom || !email || !mdp ||!langue || !dateNaiss || !statut || !niveau || !ville) {
            throw new Error('Tous les champs obligatoires doivent être fournis.');
        }

        // Créer un nouvel objet étudiant avec les données reçues
        const newStudent = new Apprenant({
            nom,
            email,
            mdp,
            langue,
            dateNaiss,
            statut,
            niveau,
            ville,
           
            role: 'apprenant' // Définir le rôle de l'utilisateur comme apprenant
        });

        // Enregistrer le nouvel étudiant dans la base de données
        const savedStudent = await newStudent.save();

        // Répondre avec les données de l'utilisateur ajouté
        res.json(savedStudent);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur apprenant:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur apprenant' });
    }
});




// Route pour l'ajout d'un utilisateur instructeur
app.post('/api/addInstructor', async (req, res) => {
    try {
        // Récupérer les données de la requête
        const { nom, email, mdp, poste, etablissement, specialite, niveau, tel } = req.body;

        // Créez un nouveau document instructeur avec les données reçues
        const newInstructor = new Instructeur({
            nom,
            email,
            mdp,
            poste,
            etablissement,
            specialite,
            niveau,
            tel
        });

        // Enregistrez le nouvel instructeur dans la base de données
        const savedInstructor = await newInstructor.save();

        // Répondre avec les données de l'instructeur ajouté
        res.json(savedInstructor);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'instructeur:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'instructeur' });
    }
});

/*app.post('/api/loginA', async (req, res) => {
    try {
        const data = req.body;

        // Recherche de l'apprenant par l'email
        const appr = await Apprenant.findOne({ email: data.email });

        // Vérification de l'existence de l'apprenant
        if (!appr) {
            return res.status(404).send('Email or password invalid');
        }

        // Vérification du mot de passe
        const validPass = await bcrypt.compare(data.mdp, appr.mdp);

        if (!validPass) {
            return res.status(401).send('Email or password invalid');
        }

        // Génération du token
        const payload = {
            id: appr.id,
            email: appr.email,
            name: appr.nom,
        };

        const token = jwt.sign(payload, "123456");

        // Envoi du token dans la réponse
        res.status(200).send({ mytoken: token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la connexion.', error: error.message });
    }
});*/



app.post('/api/login', async (req, res) => {
    try {
      const data = req.body;
      let user, role, etat;
  
      // Recherchez l'utilisateur par email dans chaque collection
      const apprenant = await Apprenant.findOne({ email: data.email });
      const instructeur = await Instructeur.findOne({ email: data.email });
      const admin = await Admin.findOne({ email: data.email });
  
      if (!apprenant && !instructeur && !admin) {
        return res.status(404).send('Email or password invalid');
      }
  
      // Vérifiez le mot de passe et déterminez le rôle et l'état de l'utilisateur
      if (apprenant) {
        const validPassA = await bcrypt.compare(data.mdp, apprenant.mdp);
        if (!validPassA) {
          return res.status(401).send('Email or password invalid');
        }
        user = {
          id: apprenant.id,
          email: apprenant.email,
          name: apprenant.nom,
          _id: apprenant._id,
        };
        role = 'apprenant';
        etat = apprenant.etat;
      } else if (instructeur) {
        const validPassI = await bcrypt.compare(data.mdp, instructeur.mdp);
        if (!validPassI) {
          return res.status(401).send('Email or password invalid');
        }
        user = {
          id: instructeur.id,
          email: instructeur.email,
          name: instructeur.nom,
        };
        role = 'instructeur';
        etat = instructeur.etat;
      } else if (admin) {
        const validPassAdmin = await bcrypt.compare(data.mdp, admin.mdp);
        if (!validPassAdmin) {
          return res.status(401).send('Email or password invalid');
        }
        user = {
          id: admin.id,
          email: admin.email,
          name: admin.nom,
        };
        role = 'admin';
        etat = admin.etat;
      }
  
      // Vérifiez l'état de l'utilisateur
      if (etat === 'inactif') { // Assurez-vous que 'inactif' correspond à la valeur réelle dans votre base de données
        return res.status(403).send('Votre compte est inactif'); // Utilisez 403 Forbidden pour indiquer que l'accès est interdit
      }
  
      // Générez le token JWT
      const token = jwt.sign({ user, role }, '123456');
  
      // Renvoyez le token JWT avec le rôle et l'état
      res.status(200).send({ mytoken: token, role, etat, user });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la connexion.',
        error: error.message,
      });
    }
  });
  
  


const generateSecret = () => {
    return crypto.randomBytes(64).toString('hex');
};

app.use(session({
    secret: generateSecret(), // Utilisez la fonction generateSecret pour générer votre secret
    resave: false,
    saveUninitialized: false
}));

app.get('/api/checkSession', (req, res) => {
    try {
        if (req.session && req.session.user) {
            res.json({
                success: true,
                message: 'Session utilisateur existante',
                user: req.session.user,
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Aucune session utilisateur trouvée',
            });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de la session :', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la vérification de la session.',
            error: error.message,
        });
    }
});

app.get('/api/logout', (req, res) => {
    try {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Erreur lors de la destruction de la session :', err);
                    res.status(500).json({
                        success: false,
                        message: 'Erreur lors de la déconnexion',
                        error: err.message,
                    });
                } else {
                    res.json({ success: true, message: 'Déconnexion réussie' });
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'La session n\'est pas initialisée',
            });
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la déconnexion.',
            error: error.message,
        });
    }
});



////////

app.get('/api/getApprenants', async (req, res) => {
    const apprenants = await apprenantsCollection.find().toArray();
    res.json(apprenants);
});


/*app.post('/api/ajouterApprenant', async (req, res) => {
    try {
      // Extraire les données de la requête
      const { nom, email, login, mdp, langue, statut, niveau, ville, dateNaiss } = req.body;
  
      // Créer une nouvelle instance de l'apprenant
      const nouvelApprenant = new Apprenant({
        
        nom,
        email,
        
        mdp,
        role: 'apprenant',
        langue,
        statut,
        niveau,
        ville,
        dateNaiss
      });
  
      // Sauvegarder l'apprenant dans la base de données
      const apprenantSauvegarde = await nouvelApprenant.save();
  
      // Répondre avec les données de l'apprenant sauvegardé
      res.status(201).json({ success: true, apprenant: apprenantSauvegarde });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'apprenant :', error);
      // Répondre avec un message d'erreur
      res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout de l\'apprenant' });
    }
  });
  */








app.delete('/api/deleteApprenant/:apprenantId', async (req, res) => {
    try {
        const apprenantId = req.params.apprenantId;
        const result = await apprenantsCollection.deleteOne({ id: apprenantId });

        if (result.deletedCount > 0) {
            console.log('apprenant deleted successfully:', result);
            res.json({ success: true, message: 'apprenant supprimée avec succès de la base de données.' });
        } else {
            console.log('apprenant not found');
            res.status(404).json({ success: false, message: 'apprenant non trouvée dans la base de données.' });
        }
    } catch (error) {
        console.error('Error deleting apprenant:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la suppression de l apprenant.', error: error.message });
    }
});
/////////////////////////////////////////////////////////////////////////////////////////


const instructeursCollection = mongoose.connection.collection('instructeurs');
const adminsCollection = mongoose.connection.collection('admins');

app.use(bodyParser.json());


app.post('/api/registerI', async (req, res) => {
    try {
        const data = req.body;

        // Ajouter l'attribut statut avec la valeur "actif" par défaut
        data.etat = "actif";

        const instr = new Instructeur(data);

        // Hashage du mot de passe
        const salt = bcrypt.genSaltSync(10);
        const cryptedPass = await bcrypt.hashSync(data.mdp, salt);
        instr.mdp = cryptedPass;

        instr.save()
            .then(savedInstructeur => {
                res.send(savedInstructeur);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    } catch (error) {
        console.error('Error registering instructeur:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'enregistrement de l\'instructeur.', error: error.message });
    }
});


//////
app.post('/api/registerInstr', async (req, res) => {
    try {
        const data = req.body;
        const instr = new Instructeur(data);

        // Hashage du mot de passe
        const salt = bcrypt.genSaltSync(10);
        const cryptedPass = await bcrypt.hashSync(data.mdp, salt);
        instr.mdp = cryptedPass;

        try {
            const savedInstructeur = await instr.save();
            res.send(savedInstructeur);
        } catch (error) {
            res.status(500).send(error);
        }
    } catch (error) {
        console.error('Error registering instructeur:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'enregistrement de l\'instructeur.', error: error.message });
    }
});


/*app.post('/api/ajouterInstructeur', async (req, res) => {
    try {
      // Récupérer les données du corps de la requête
      const { id,nom, email, login, mdp, role,langue, poste, etablissement, specialite, niveau, tel } = req.body;
  
      // Créer une nouvelle instance d'Instructeur avec les données reçues
      const nouvelInstructeur = new Instructeur({
        id,
        nom,
        email,
        login,
        mdp,
        role,
        langue,
        poste,
        etablissement,
        specialite,
        niveau,
        tel
      });
  
      // Enregistrer le nouvel instructeur dans la base de données
      const instructeurAjoute = await nouvelInstructeur.save();
  
      // Répondre avec le nouvel instructeur ajouté
      res.status(201).json({ success: true, instructeur: instructeurAjoute });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'instructeur :', error);
      res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'ajout de l\'instructeur.' });
    }
  });
*/

// Backend API pour récupérer tous les utilisateurs avec leur état
app.get('/api/getUsers', async (req, res) => {
    try {
        const apprenants = await apprenantsCollection.find().toArray();
        const instructeurs = await instructeursCollection.find().toArray();
        const users = [...apprenants, ...instructeurs];
        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
});



app.get('/api/getInstructeurs', async (req, res) => {
    const instructeurs = await instructeursCollection.find().toArray();
    res.json(instructeurs);
});


app.get('/api/getAdmins', async (req, res) => {
  const admins = await adminsCollection.find().toArray();
  res.json(admins);
});


app.delete('/api/deleteInstructeur/:instructeurId', async (req, res) => {
    try {
        const instructeurId = req.params.instructeurId;
        const result = await instructeursCollection.deleteOne({ id: instructeurId });

        if (result.deletedCount > 0) {
            console.log('instructeur deleted successfully:', result);
            res.json({ success: true, message: 'instructeur supprimée avec succès de la base de données.' });
        } else {
            console.log('instructeur not found');
            res.status(404).json({ success: false, message: 'instructeur non trouvée dans la base de données.' });
        }
    } catch (error) {
        console.error('Error deleting instructeur:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la suppression de l instructeur.', error: error.message });
    }
});

// Fonction pour générer un nouveau mot de passe aléatoire
function generateNewPassword() {
    // Implémentez votre propre logique de génération de mot de passe
    // Par exemple, utilisez une bibliothèque de génération de mots de passe
    return uuidv4().substr(0, 8); // Utilisation d'un nouveau mot de passe aléatoire de 8 caractères
}

const transporter = nodemailer.createTransport({
    service: 'gmail', // Utilisez le service de messagerie de votre choix
    auth: {
        user: 'mayssaouerfelli2002@gmail.com', // Remplacez par votre adresse e-mail
        pass: 'tdjj soev ishu bian', // Remplacez par votre mot de passe
    },
});

app.post('/api/resetPassword', async (req, res) => {
    try {
        const { email } = req.body;

        // Vérifiez si l'utilisateur (apprenant ou instructeur) existe
        const apprenant = await Apprenant.findOne({ email });
        const instructeur = await Instructeur.findOne({ email });

        if (!apprenant && !instructeur) {
            return res.status(404).send('Email not found');
        }

        // Générez un nouveau mot de passe
        const newPassword = generateNewPassword();

        // Mettez à jour le mot de passe dans la base de données
        if (apprenant) {
            apprenant.mdp = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
            await apprenant.save();
        } else {
            instructeur.mdp = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
            await instructeur.save();
        }

        // Envoyez le nouveau mot de passe par e-mail
        const mailOptions = {
            from: 'mayssaouerfelli2002@gmail.com',
            to: email,
            subject: 'Réinitialisation de mot de passe',
            text: `Votre nouveau mot de passe est : ${newPassword}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'envoi de l\'e-mail.', error: error.message });
            } else {
                console.log('Email sent:', info.response);
                res.status(200).send('Password reset successful');
            }
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la réinitialisation du mot de passe.', error: error.message });
    }
});

////////////////////////////////////////////////////////////////////////////////////////// Admin
app.post('/api/registerAd', async (req, res) => {
    try {
        const data = req.body;
        const adm = new Admin(data);
        data.etat = "actif";

        // Hashage du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.mdp, saltRounds);
        adm.mdp = hashedPassword;

        adm.save()
            .then(savedAdmin => {
                res.send(savedAdmin);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'enregistrement de l\'admin.', error: error.message });
    }
});


//////////////////////////// apprenant ////////////////////////////////////////////


app.use(bodyParser.json());

const mongoURI = 'mongodb://127.0.0.1:27017/intellego';

// Fonction pour récupérer tous les e-mails dans la base de données MongoDB
const getAllEmailsFromDatabaseA = async () => {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true });

  try {
    await client.connect();

    const database = client.db();
    const emails = await database.collection('apprenants').distinct('email');

    return emails;
  } finally {
    await client.close();
  }
};

// Fonction de vérification si l'e-mail existe dans la liste
const checkEmailInListA = async (emailToCheck) => {
  try {
    const allEmails = await getAllEmailsFromDatabaseA();
    return allEmails.includes(emailToCheck);
  } catch (error) {
    console.error('Erreur lors de la récupération des e-mails dans la base de données:', error);
    throw error;
  }
};

// Route pour vérifier si un e-mail existe
app.post('/api/checkEmailExistsA', async (req, res) => {
  const { email } = req.body;

  try {
    console.log('Tentative de vérification de l\'e-mail:', email);

    // Vérifier si l'e-mail existe dans la liste
    const emailExists = await checkEmailInListA(email);

    console.log('Résultat de la vérification:', emailExists);

    res.json({ exists: emailExists });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'e-mail dans la base de données:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la vérification de l\'e-mail' });
  }
});

//////////////////////////////////////// Instructeur /////////////////////////////////////////

app.use(bodyParser.json());



// Fonction pour récupérer tous les e-mails dans la base de données MongoDB
const getAllEmailsFromDatabaseI = async () => {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true });

  try {
    await client.connect();

    const database = client.db();
    const emails = await database.collection('instructeurs').distinct('email');

    return emails;
  } finally {
    await client.close();
  }
};

// Fonction de vérification si l'e-mail existe dans la liste
const checkEmailInListI = async (emailToCheck) => {
  try {
    const allEmails = await getAllEmailsFromDatabaseI();
    return allEmails.includes(emailToCheck);
  } catch (error) {
    console.error('Erreur lors de la récupération des e-mails dans la base de données:', error);
    throw error;
  }
};

// Route pour vérifier si un e-mail existe
app.post('/api/checkEmailExistsI', async (req, res) => {
  const { email } = req.body;

  try {
    console.log('Tentative de vérification de l\'e-mail:', email);

    // Vérifier si l'e-mail existe dans la liste
    const emailExists = await checkEmailInListI(email);

    console.log('Résultat de la vérification:', emailExists);

    res.json({ exists: emailExists });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'e-mail dans la base de données:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la vérification de l\'e-mail' });
  }
});



//////////////////////////////////////// Administrateur/////////////////////////////////////////

app.use(bodyParser.json());



// Fonction pour récupérer tous les e-mails dans la base de données MongoDB
const getAllEmailsFromDatabaseAd = async () => {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true });

  try {
    await client.connect();

    const database = client.db();
    const emails = await database.collection('admins').distinct('email');

    return emails;
  } finally {
    await client.close();
  }
};

// Fonction de vérification si l'e-mail existe dans la liste
const checkEmailInListAd = async (emailToCheck) => {
  try {
    const allEmails = await getAllEmailsFromDatabaseAd();
    return allEmails.includes(emailToCheck);
  } catch (error) {
    console.error('Erreur lors de la récupération des e-mails dans la base de données:', error);
    throw error;
  }
};

// Route pour vérifier si un e-mail existe
app.post('/api/checkEmailExistsAd', async (req, res) => {
  const { email } = req.body;

  try {
    console.log('Tentative de vérification de l\'e-mail:', email);

    // Vérifier si l'e-mail existe dans la liste
    const emailExists = await checkEmailInListAd(email);

    console.log('Résultat de la vérification:', emailExists);

    res.json({ exists: emailExists });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'e-mail dans la base de données:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la vérification de l\'e-mail' });
  }
});


/////////////////// search///////////////////
// Route pour la recherche d'un utilisateur par nom (instructeur ou apprenant)
// Route pour la recherche d'un utilisateur par nom (instructeur ou apprenant)
app.get('/api/searchUser/:searchTerm', async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm;
        // Recherche d'apprenants par nom
        const apprenants = await Apprenant.find({ nom: { $regex: searchTerm, $options: 'i' } });
        // Recherche d'instructeurs par nom
        const instructeurs = await Instructeur.find({ nom: { $regex: searchTerm, $options: 'i' } });
        // Concaténer les résultats des deux collections
        const users = [...apprenants, ...instructeurs];
        res.json({ success: true, users: users }); // Renvoyer les utilisateurs trouvés
    } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la recherche d\'utilisateurs.' });
    }
});

  

app.get('/api/searchFichier/:searchTerm', async (req, res) => {
    try {
      const searchTerm = req.params.searchTerm;
      
      const fichiers = await Fichier.find({ title: { $regex: searchTerm, $options: 'i' } });
      res.json({ success: true, fichiers: fichiers }); // Renvoyer les vidéos trouvées
    } catch (error) {
      console.error('Erreur lors de la recherche de fichiers:', error);
      res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la recherche de fichiers.' });
    }
  });
///////////////////////////////////// etat ///////////////////////

app.put('/api/apprenants/:id/etat', async (req, res) => {
    const { id } = req.params;
    const { etat } = req.body;

    try {
        const updatedApprenant = await Apprenant.findByIdAndUpdate(id, { etat }, { new: true });
        res.json(updatedApprenant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour mettre à jour l'état d'un instructeur
app.put('/api/instructeurs/:id/etat', async (req, res) => {
    const { id } = req.params;
    const { etat } = req.body;

    try {
        const updatedInstructeur = await Instructeur.findByIdAndUpdate(id, { etat }, { new: true });
        res.json(updatedInstructeur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//////////////////////////////////////////////// lecteur video audio 


app.get('/api/audio/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        // Recherche du fichier audio dans la base de données en utilisant le modèle Fichier
        const fichier = await Fichier.findOne({ fileName: fileName });
        if (!fichier) {
            console.error('Le fichier audio demandé n\'existe pas.');
            return res.status(404).json({ error: 'Fichier non trouvé' });
        }
        // Renvoyer le fichier audio en utilisant un chemin absolu
        res.sendFile(path.join(__dirname, fichier.filePathOriginal));
    } catch (err) {
        console.error('Erreur lors de la récupération du fichier audio depuis la base de données:', err);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});


  
  // Endpoint pour servir les fichiers vidéo
  app.get('/api/video/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(fileName); // Chemin vers le dossier contenant les fichiers vidéo
  
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Erreur : Le fichier vidéo "${fileName}" demandé n'existe pas.`);
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }
  
      // Renvoyer le fichier vidéo
      res.sendFile(filePath);
    });
  });


  const cheminVersDossier = path.join(__dirname, '/public/uploads');

  // Point de terminaison pour récupérer un fichier par son nom
  app.get('/api/files/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(cheminVersDossier, fileName);
  
    // Envoyer le fichier demandé au client
    res.sendFile(filePath);
  });
  

///////////////////////////////////////quiz //////////////////////
const quizzesCollection = mongoose.connection.collection('quizzes');

app.post('/api/quizs', async (req, res) => {
    try {
        const { titre, description, questions } = req.body;

        // Génération d'un identifiant unique pour le quiz
        const id_quiz = uuidv4();

        // Enregistrement du quiz dans la base de données
        const result = await quizzesCollection.insertOne({
            id_quiz: id_quiz,
            titre: titre,
            description: description,
            questions: questions
        });

        console.log('Quiz ajouté avec succès :', result);

        res.json({ success: true, message: 'Quiz ajouté avec succès à la base de données.' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du quiz :', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'ajout du quiz.', error: error.message });
    }
});


const Quiz = require('./models/Quiz'); // Assurez-vous d'importer le modèle Quiz correctement

app.delete('/api/supQ/:quizId', async (req, res) => {
    try {
      const quizId = req.params.quizId;
  
      // Vérifier si le quiz existe
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Le quiz n\'existe pas.' });
      }
  
      // Supprimer le quiz
      await Quiz.findByIdAndDelete(quizId);
      
      res.json({ message: 'Le quiz a été supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression du quiz :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la suppression du quiz.', error: error.message });
    }
  });




app.get('/api/quizzes', async (req, res) => {
    try {
        // Récupérer tous les quiz depuis la base de données
        const quizzes = await quizzesCollection.find({}).toArray();

        res.json({ success: true, quizzes: quizzes });
    } catch (error) {
        console.error('Erreur lors de la récupération des quiz :', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la récupération des quiz.', error: error.message });
    }
});


// Modification du quiz par titre
app.put('/api/modifQ/:quizTitle', async (req, res) => {
    const quizTitle = req.params.quizTitle;

    const { titre, description, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Le format des questions est incorrect." });
    }

    try {
        // Utilisez findOneAndUpdate pour mettre à jour le quiz par titre
        const quiz = await Quiz.findOneAndUpdate(
            { titre: quizTitle },
            { titre, description, questions },
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({ message: "Le quiz spécifié n'a pas été trouvé." });
        }

        res.json(quiz);
    } catch (error) {
        console.error("Erreur lors de la modification du quiz :", error);
        res.status(500).json({ message: "Erreur lors de la modification du quiz." });
    }
});

// Recherche du quiz par titre
app.get('/api/quizByTitle/:quizTitle', async (req, res) => {
    const quizTitle = req.params.quizTitle;
  
    try {
      // Récupérer le quiz depuis la base de données en utilisant son titre
      const quiz = await Quiz.findOne({ titre: quizTitle });
  
      if (!quiz) {
        return res.status(404).json({ message: "Le quiz spécifié n'a pas été trouvé." });
      }
  
      // Envoyer le quiz récupéré en tant que réponse
      res.json(quiz);
    } catch (error) {
      console.error("Erreur lors de la récupération du quiz :", error);
      res.status(500).json({ message: "Erreur lors de la récupération du quiz." });
    }
});

  

///////////////////////////////////////////////cours//////////////////////////



const Cours = require('./models/Cours');
const coursCollection = mongoose.connection.collection('cours');

app.post('/api/cours', async (req, res) => {
    try {
        const idCours = req.body.id_cours || uuidv4();
        const { titre, fichier, prix, langue, domaine, instructeur } = req.body;

        // Recherche de l'instructeur par son nom dans la base de données
        const instructeurTrouve = await Instructeur.findOne({ nom: instructeur });
        if (!instructeurTrouve) {
            return res.status(404).json({ success: false, message: 'Instructeur non trouvé.' });
        }

        // Enregistrement du cours dans la base de données avec l'ObjectId de l'instructeur
        const newCours = new Cours({
            id_cours: idCours,
            titre: titre,
            fichier: fichier,
            prix: prix,
            langue: langue,
            domaine: domaine,
            instructeur: instructeurTrouve._id // Utiliser l'ObjectId de l'instructeur
        });

        const result = await newCours.save();

        console.log('Cours ajouté avec succès :', result);

        res.json({ success: true, message: 'Cours ajouté avec succès à la base de données.', cours: result });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du cours :', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de l\'ajout du cours.', error: error.message });
    }
});

app.get('/api/getcours', async (req, res) => {
    try {
        const cours = await Cours.find();
        res.json(cours);
    } catch (error) {
        console.error("Erreur lors de la récupération des cours :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des cours." });
    }
});


const Commentaire = require('./models/Commentaire');




app.post('/api/:id_cours/commentaires', async (req, res) => {
    try {
        const { id_cours } = req.params;
        const { commentaire, apprenantId } = req.body;

        const apprenant = await Apprenant.findById(apprenantId);
        if (!apprenant) {
            return res.status(404).json({ message: 'Apprenant non trouvé' });
        }

        const nouveauCommentaire = await Commentaire.create({
            id_cours,
            commentaire,
            apprenant: apprenantId
        });

        res.status(201).json({ message: 'Commentaire ajouté avec succès', commentaire: nouveauCommentaire });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire :', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
    }
});



app.get('/api/apprenants/:id', async (req, res) => {
    try {
      const apprenant = await Apprenant.findById(req.params.id);
      if (!apprenant) {
        return res.status(404).json({ message: 'Apprenant non trouvé' });
      }
      res.status(200).json(apprenant);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'apprenant :', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des détails de l\'apprenant' });
    }
  });


app.delete('/api/cours/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier si le cours existe
        const cours = await Cours.findById(id);
        if (!cours) {
            return res.status(404).json({ message: 'Le cours n\'existe pas' });
        }

        // Supprimer le cours de la base de données
        await Cours.findByIdAndDelete(id);

        res.json({ message: 'Cours supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du cours :', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du cours' });
    }
});





app.get('/api/:id_cours/GETcommentaires', async (req, res) => {
    try {
        const { id_cours } = req.params;

        // Récupérez les commentaires du cours spécifié
        const commentaires = await Commentaire.find({ id_cours }).populate('apprenant', 'nom');

        res.status(200).json({ commentaires });
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
    }
});

////////////////////////////////////////////////satatistique//////:
app.get('/api/userstats', async (req, res) => {
    try {
      const apprenantsCount = await Apprenant.countDocuments();
      const instructeursCount = await Instructeur.countDocuments();
      const totalUsers = apprenantsCount + instructeursCount;
  
      res.json({
        totalUsers,
        apprenantsCount,
        instructeursCount
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques utilisateur:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques utilisateur." });
    }
  });


  app.get('/api/userstatus', async (req, res) => {
    try {
      const apprenantsActifs = await Apprenant.countDocuments({ etat: 'actif' });
      const apprenantsInactifs = await Apprenant.countDocuments({ etat: 'inactif' });
      const instructeursActifs = await Instructeur.countDocuments({ etat: 'actif' });
      const instructeursInactifs = await Instructeur.countDocuments({ etat: 'inactif' });
  
      res.json({
        apprenants: {
          actifs: apprenantsActifs,
          inactifs: apprenantsInactifs
        },
        instructeurs: {
          actifs: instructeursActifs,
          inactifs: instructeursInactifs
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre d'utilisateurs actifs et inactifs :", error);
      res.status(500).json({ message: "Erreur lors de la récupération du nombre d'utilisateurs actifs et inactifs." });
    }
  });  







  app.get('/api/cours/total', async (req, res) => {
    try {
      const totalCourses = await Cours.countDocuments({});
      res.json({ totalCourses });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération du nombre total de cours' });
    }
  });










  app.get('/api/instructors/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'ID de l\'instructeur non fourni.' });
        }

        const instructeur = await Instructeur.findById(id);

        if (!instructeur) {
            return res.status(404).json({ success: false, message: 'Instructeur non trouvé.' });
        }

        res.json({ success: true, nom: instructeur.nom });
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'instructeur:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la récupération des détails de l\'instructeur.' });
    }
});


  app.get('/api/instructors', async (req, res) => {
    try {

        const instructeurs = await Instructeur.find();
     

        res.json({ success: true, data: instructeurs });
    } catch (error) {
        console.error('Erreur lors de la récupération des instructeurs:', error);
        res.status(500).json({ success: false, message: 'Une erreur est survenue lors de la récupération des instructeurs.' });
    }
});




///////////////////////////achat////////////////////

const Achat = require('./models/Achat'); // Assurez-vous de spécifier le chemin correct vers votre modèle Achat

app.post('/api/ajouter-achat', async (req, res) => {
  try {
    console.log('Requête d\'ajout d\'achat reçue avec les données suivantes:', req.body);

    const { apprenantId, coursId, montant, dateA } = req.body;
    console.log('apprenantId:', apprenantId);
    console.log('coursId:', coursId);
    console.log('montant:', montant);
    console.log('dateA:', dateA);

    // Vérifier si apprenantId est un identifiant ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(apprenantId)) {
      console.log('Identifiant de l\'apprenant invalide');
      return res.status(400).json({ message: 'Identifiant de l\'apprenant invalide' });
    }

    // Convertir le montant en nombre
    const montantNumber = parseFloat(montant);

    // Vérifier si le montant est un nombre valide
    if (isNaN(montantNumber)) {
      console.log('Montant invalide');
      return res.status(400).json({ message: 'Montant invalide' });
    }

    // Générer un identifiant unique pour l'achat
    const id_achat = uuidv4();

    // Créer une nouvelle instance d'achat avec les données reçues
    const nouvelAchat = new Achat({
      id_achat: id_achat,
      apprenant: apprenantId,
      cours: coursId,
      montant: montantNumber,
      dateA: dateA
    });

    // Enregistrer l'achat dans la base de données
    const achatEnregistre = await nouvelAchat.save();

    console.log('Achat ajouté avec succès:', achatEnregistre);

    res.status(200).json({ message: "Achat ajouté avec succès", achat: achatEnregistre });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'achat:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'achat", error: error.message });
  }
});








app.get('/api/apprenants/:id',  async (req, res) => {
  try {
      const { id } = req.params;
      const apprenant = await Apprenant.findById(id);

      if (!apprenant) {
          console.error('Apprenant non trouvé');
          return res.status(404).json({ message: "Apprenant non trouvé" });
      }

      res.json(apprenant);
  } catch (error) {
      console.error('Erreur lors de la récupération de l\'apprenant:', error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'apprenant", error: error.message });
  }
});

// Ajout de la route pour récupérer un cours
app.get('/api/cours/:id',  async (req, res) => {
  try {
      const { id } = req.params;
      const cours = await Cours.findById(id);

      if (!cours) {
          return res.status(404).json({ message: "Cours non trouvé" });
      }

      res.json(cours);
  } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du cours", error: error.message });
  }
});


/////////////////////////////////////translate/////////////////////////




app.post('/translate_file', async (req, res) => {
  const { fileName, targetLang } = req.body;

  if (!fileName || !targetLang) {
    return res.status(400).json({ error: 'fileName and targetLang are required' });
  }

  try {
    const startTime = Date.now();

    // Chemin du script Python
    const scriptPath = path.join(__dirname, 'public', 'script.py');
    // Chemin du fichier d'origine
    const filePathOriginal = path.join(__dirname, 'public', 'uploads', 'original_files', fileName);
    // Chemin du fichier traduit
    const filePathTranslated = path.join(__dirname, 'public', 'uploads', 'translated_files', `${fileName}_translated_${targetLang}.txt`);

    // Vérifier si le fichier d'origine existe
    if (!fs.existsSync(filePathOriginal)) {
      return res.status(404).json({ error: 'Original file not found' });
    }

    // Exécuter le script Python de manière asynchrone
    PythonShell.run(scriptPath, { args: [filePathOriginal, targetLang, filePathTranslated] }, (err, result) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ error: 'Translation failed', details: err });
      }

      // Vérifier si le fichier traduit a été créé
      if (!fs.existsSync(filePathTranslated)) {
        return res.status(500).json({ error: 'Translated file not created' });
      }

      // Calculer le temps écoulé
      const endTime = Date.now();
      const elapsedTime = (endTime - startTime) / 1000; // Temps en secondes

      // Lire le contenu du fichier traduit
      const translatedText = fs.readFileSync(filePathTranslated, 'utf-8');

      res.json({ translation: translatedText, filePathTranslated, elapsedTime });
    });

  } catch (error) {
    console.error('Error during translation:', error);
    res.status(500).json({ error: 'Translation failed', details: error });
  }
});


////////////////////// stat instructeur ////////////////////
app.get('/api/instructeur/:instructeurName/statistiques-ventes', async (req, res) => {
  try {
      const instructeurName = req.params.instructeurName;

      // Recherche de l'instructeur par son nom
      const instructeur = await Instructeur.findOne({ nom: instructeurName });

      if (!instructeur) {
          return res.status(404).json({ message: "Instructeur non trouvé." });
      }

      // Recherche des cours associés à l'instructeur
      const cours = await Cours.find({ instructeur: instructeur._id });

      // Initialisation d'un tableau pour stocker les statistiques des ventes par cours
      const statistiquesCours = [];

      // Pour chaque cours, compter le nombre d'achats
      for (const coursItem of cours) {
          const achats = await Achat.find({ cours: coursItem._id });
          const nombreAchats = achats.length;
          statistiquesCours.push({ cours: coursItem.titre, nombreAchats });
      }

      // Envoyer la réponse avec les statistiques des ventes par cours
      res.json({ statistiquesCours });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors du calcul des statistiques des ventes par cours." });
  }
});



app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});



















