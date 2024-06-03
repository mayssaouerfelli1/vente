import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import logo1 from './logo1.jpg';
import SidebarSection from './SidebarSection';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import './application.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { faChartLine, faUser, faTrash, faEdit, faFileAlt, faPlus, faEye, faFileVideo, faFileAudio, faFile, faBook } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faHome, faInfoCircle, faEnvelope, faSignInAlt, faUserPlus, faLanguage, faUserShield } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import i18n from '../utils/i18n.js';

import { navigate } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert, Card, CardContent, CardHeader, Avatar } from '@mui/material';
import StatistiquesVentesChart from './StatistiquesVentesChart.js';


const Application = () => {
  const { t, i18n } = useTranslation('app');
  const sections = [
    { title: t('sciences_math'), items: [] },
    { title: t('langues'), items: [] },
    { title: t('informatique_technologie'), items: [] },
    { title: t('arts_culture'), items: [] },
    { title: t('developpement_personnel'), items: [] },
    { title: t('affaires_economie'), items: [] },
    { title: t('sciences_sociales'), items: [] },
    { title: t('cuisine'), items: [] },
    { title: t('maquillage'), items: [] },
  ];
  const audioRef = useRef(null);
  const languages = ['English', 'Français', 'عربية'];
  const navigate = useNavigate();

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [id_quiz, setIdQuiz] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [option, setOption] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(null);
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fichiers, setFichiers] = useState([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [editingFichier, setEditingFichier] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [showViewFileModal, setShowViewFileModal] = useState(false);
  const [fileUrlToView, setFileUrlToView] = useState('');
  const [transcribedText, setTranscribedText] = useState({});
  const [fileType, setFileType] = useState(''); // Ajoutez cette ligne pour déclarer fileType
  const [transcriptionResult, setTranscriptionResult] = useState(''); // Ajoutez cette ligne pour déclarer transcriptionResult
  const [fileUrl, setFileUrl] = useState(''); // Ajoutez cette ligne pour déclarer fileUrl
  const [fileText, setFileText] = useState(''); // Ajoutez cette ligne pour déclarer fileText
  const [showMediaPlayerModal, setShowMediaPlayerModal] = useState(false);
  const [langueOriginal, setLangueOriginal] = useState('');
  const [langueTranslated, setLangueTranslated] = useState('');
  const [option1, setOption1] = useState('statistique');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedFichier, setSelectedFichier] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedOriginalLanguage, setSelectedOriginalLanguage] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [nouvellesDonnees, setNouvellesDonnees] = useState(null);
  const [quizId, setQuizId] = useState('');
  const [_id, setId] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [quizzes1, setQuizzes1] = useState([]);
  const [showModal2, setShowModal2] = useState(false);
  const [quizData, setQuizData] = useState({
    titre: '',
    description: '',
    questions: []
  });
  const [selectedFileName, setSelectedFileName] = useState('');
  const [showModal4, setShowModal4] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [formData, setFormData] = useState({
    id_cours: '',
    titre2: '',
    fichier: '',
    prix: '',
    langue: '',
    domaine: '',
    instructeur: '',
  });
  const [formTitre2, setTitre2] = useState('');
  const [formFichier, setFichier] = useState(null);
  const [formPrix, setPrix] = useState('');
  const [formLangue, setLangue] = useState('');
  const [formDomaine, setDomaine] = useState('');
  const [formInstructeur, setInstructeur] = useState('');
  const [selectedFile2, setSelectedFile2] = useState('');
  const [user, setUser] = useState({});

  

  useEffect(() => {
    fetchTableData();
    setUser(JSON.parse(sessionStorage.getItem('user')));
  }, []);

  useEffect(() => {
    setQuizData({
      titre: nouvellesDonnees?.titre || '',
      description: nouvellesDonnees?.description || '',
      questions: nouvellesDonnees?.questions || []
    });
  }, [nouvellesDonnees]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (option1 === 'quiz') {
          const response = await axios.get('http://localhost:3001/api/quizzes');
          setQuizzes1(response.data.quizzes);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des quiz :', error);
      }
    };

    fetchQuizzes();
  }, [option1]);

  useEffect(() => {
    setQuizData({
      titre: nouvellesDonnees?.titre || '',
      description: nouvellesDonnees?.description || '',
      questions: nouvellesDonnees?.questions || []
    });
  }, [nouvellesDonnees]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (option1 === 'quiz') {
          const response = await axios.get('http://localhost:3001/api/quizzes');
          setQuizzes1(response.data.quizzes);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des quiz :', error);
      }
    };

    fetchQuizzes();
  }, [option1]);

  /*const handleUpdateQuiz = async (quizId) => {
    try {
        const confirmResult = await Swal.fire({
            title: 'Êtes-vous sûr de vouloir modifier ce quiz ?',
            text: 'Cette action peut affecter les données du quiz.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Oui, modifier !',
            cancelButtonText: 'Annuler'
        });

        if (confirmResult.isConfirmed) {
            // Convertir quizId en une chaîne de caractères
            const selectedQuizId = String(quizId);

            // Créer un objet contenant uniquement les champs que vous souhaitez modifier
            const updatedFields = {
                titre: quizData.titre, // Nouveau titre du quiz
                description: quizData.description, // Nouvelle description du quiz
                questions: quizData.questions.map(question => ({
                    text: question.text, // Nouveau texte de la question
                    suggestions: question.suggestions // Nouvelles suggestions de la question
                    // Ajoutez d'autres champs que vous souhaitez modifier pour chaque question si nécessaire
                }))
                // Ajoutez d'autres champs que vous souhaitez modifier pour le quiz si nécessaire
            };

            // Appel à l'API PUT pour mettre à jour le quiz
            const updateQuizResponse = await axios.put(`http://localhost:3001/modifQ/${selectedQuizId}`, updatedFields);

            if (updateQuizResponse.status === 200) {
                Swal.fire('Succès', 'Le quiz a été modifié avec succès.', 'success');
                closeModal2();
            } else {
                throw new Error(`Erreur lors de la modification du quiz : ${updateQuizResponse.status}`);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la modification du quiz :', error.message);
        Swal.fire('Erreur', 'Une erreur est survenue lors de la modification du quiz.', 'error');
    }
};

*/

  const handleQuestionTextChange = (e, questionIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].text = e.target.value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleSuggestionChange2 = (e, questionIndex, suggestionIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].suggestions[suggestionIndex] = e.target.value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleCorrectAnswerChange2 = (e, questionIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].correctAnswer = e.target.value;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleCorrectAnswerChange = (text, index) => {
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[index] = text;
    setCorrectAnswers(newCorrectAnswers);
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };

  const modifierQuiz = async (quizTitle, nouveauTitre, nouvelleDescription, nouvellesQuestions) => {
    try {
      const confirmResult = await Swal.fire({
        title: 'Êtes-vous sûr de vouloir modifier ce quiz ?',
        text: 'Cette action peut affecter les données du quiz.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Oui, modifier !',
        cancelButtonText: 'Annuler'
      });
      const response = await fetch(`http://localhost:3001/api/modifQ/${(quizTitle)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titre: nouveauTitre,
          description: nouvelleDescription,
          questions: nouvellesQuestions
        })
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message);
      }

      const quizModifie = await response.json();
      Swal.fire('Succès', 'Le quiz a été modifié avec succès.', 'success');
      closeModal2();

      // Traitez la réponse comme vous le souhaitez, par exemple, mettre à jour l'interface utilisateur, etc.
    } catch (error) {
      console.error("Erreur lors de la modification du quiz :", error);
      // Traitez l'erreur, affichez un message à l'utilisateur, etc.
    }
  }

  const openModal2 = (tit) => {
    const selectedQuiz = quizzes1.find(quiz => quiz.titre === tit);
    if (selectedQuiz) {
      setQuizData({
        titre: selectedQuiz.titre,
        description: selectedQuiz.description,
        questions: selectedQuiz.questions
      });
      setSelectedQuizId(quizId);
      setShowModal2(true);
    }
  };

  const closeModal2 = () => {
    setShowModal2(false);
  };

  const Sidebar = () => {
    const { t } = useTranslation('add'); // Assurez-vous d'ajuster la clé de traduction si nécessaire


    return (
      <div className="sidebar2">
        <div className='brand'>
          <br /> <img src={logo1} alt="logo1" /> <br /><br /><br />
        </div>

        <div className={option === 'statistique' ? 'active' : ''} onClick={() => setOption1('statistique')}>
        <FontAwesomeIcon icon={faChartLine} /> {t('Statistique des ventes')}
  </div><br />

        <div className={option === 'profile' ? 'active' : ''} onClick={() => setOption1('profile')}>
        <FontAwesomeIcon icon={faUser} /> {t('Mon profile')}
  </div><br />


        <div className={option1 === 'videos' ? 'active' : ''} onClick={() => setOption1('videos')}>
          <FontAwesomeIcon icon={faFilm} /> {t('Gestion videos audios')}
        </div><br />

        <div className={option1 === 'quiz' ? 'active' : ''} onClick={() => setOption1('quiz')}>
          <FontAwesomeIcon icon={faQuestionCircle} /> {t('Gestion des quizzes')}
        </div>
      </div>
    );
  }

  const openQuizModal = () => {
    setShowQuizModal(true);
  };

  const handleClose = () => {
    setShowQuizModal(false);
  };

  const handleAddQuestion = () => {
    const newQuestions = [...questions, { text: '', suggestions: ['', '', ''] }];
    const newCorrectAnswers = [...correctAnswers, ''];
    setQuestions(newQuestions);
    setCorrectAnswers(newCorrectAnswers);
  };

  const handleQuestionChange = (text, index) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const handleSuggestionChange = (text, questionIndex, sugIndex) => {
    const newQuestions = [...questions]; // Copie du tableau questions
    newQuestions[questionIndex].suggestions[sugIndex] = text; // Mise à jour de la suggestion
    setQuestions(newQuestions); // Mise à jour de l'état avec les nouvelles questions
  };

  const handleCreateQuiz = async () => {
    try {
      if (titre && description && questions.length > 0 && correctAnswers.length > 0) {
        // Ajouter les réponses correctes à chaque question
        const questionsWithAnswers = questions.map((question, index) => ({
          ...question,
          correctAnswer: correctAnswers[index]
        }));

        const requestData = {
          titre: titre,
          description: description,
          questions: questionsWithAnswers // Utiliser les questions avec les réponses correctes
        };

        const response = await axios.post('http://localhost:3001/api/quizs', requestData);
        const resultat = response.data;
        console.log(resultat);
        setTitre('');
        setDescription('');
        setQuestions([]);
        setCorrectAnswers([]);
        setShowQuizModal(false);
        toast.success('Quiz ajouté avec succès !');
      } else {
        toast.error('Veuillez remplir tous les champs du quiz.');
      }
    } catch (erreur) {
      toast.error('Erreur lors de l\'ajout du quiz :', erreur);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      // Affiche une boîte de dialogue de confirmation
      const confirmResult = await Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer ce quiz ?',
        text: 'Cette action est irréversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745', // Vert
        cancelButtonColor: '#dc3545', // Rouge
        confirmButtonText: 'Oui, supprimer !',
        cancelButtonText: 'Annuler'
      });

      // Si l'utilisateur confirme la suppression
      if (confirmResult.isConfirmed) {
        // Envoie une requête DELETE à l'API backend pour supprimer le quiz
        const response = await fetch(`http://localhost:3001/api/supQ/${quizId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Vérifie le statut de la réponse
        if (response.ok) {
          // Supprime le quiz de l'affichage
          setQuizzes1(quizzes1.filter(quiz => quiz._id !== quizId));
          Swal.fire('Succès', 'Le quiz a été supprimé avec succès.', 'success'); // Affiche un message de succès
        } else {
          // Si la réponse n'est pas réussie, lance une erreur avec le statut de la réponse
          throw new Error(`Erreur lors de la suppression du quiz : ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du quiz :', error.message);
      Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression du quiz.', 'error'); // Affiche un message d'erreur
    }
  };

  const handleOpenModal = (quiz) => {
    setSelectedQuiz(quiz);
  };


  const handleOriginalLanguageChange = (event) => {
    setSelectedOriginalLanguage(event.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleNavItemClick = (item) => {
    setActiveNavItem(item);
    setLanguageDropdownVisible(false);
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownVisible(!languageDropdownVisible);
  };

  const ChangeEn = () => {
    i18n.changeLanguage("en");
  };

  const ChangeFr = () => {
    i18n.changeLanguage("fr");
  };

  const ChangeAr = () => {
    i18n.changeLanguage("ar");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setSelectedFile(event.target.files[0]);
    if (file) {
      const fileType = file.type.split('/')[0];
      setFileType(fileType);

      if (fileType !== 'audio' && fileType !== 'video') {
        setSelectedFile(null);
        console.error('Veuillez sélectionner un fichier audio ou vidéo.');
      }
    }
  };

  const updateDescription = (newDescription) => {
    setQuizData({ ...quizData, description: newDescription });
  };

  const handleSaveChanges = async () => {
    try {
      const nouveauTitre = quizData.titre; // Nouveau titre du quiz
      const nouvelleDescription = quizData.description; // Nouvelle description du quiz
      const nouvellesQuestions = quizData.questions; // Nouvelles questions du quiz

      // Modifier le quiz
      await modifierQuiz(quizData.titre, nouveauTitre, nouvelleDescription, nouvellesQuestions);


      // Fermer la modal après la modification
      setShowModal2(false);
    } catch (error) {
      console.error('Erreur lors de la modification du quiz :', error.message);
      Swal.fire('Erreur', 'Une erreur est survenue lors de la modification du quiz.', 'error');
    }
  };

  const handleUploadFile = async () => {
    try {
      if (formTitle && formDescription && selectedFile && selectedDomain) {
        const requestData = {
          title: formTitle,
          description: formDescription,
          dateUpload: new Date().toISOString(),
          domain: selectedDomain,
          fileName: selectedFile.name,
          langueOriginal: selectedOriginalLanguage
        };
        const response = await axios.post('http://localhost:3001/api/addFichier', requestData);
        const result = response.data;
        console.log(result);
        setTranscriptionResult(result.transcription);
        toast.success(t('Ajout terminé avec succès'));
        fetchTableData();
        clearFormAndFile();
        setShowModal(false);
      } else {
        console.error(t('Veuillez remplir tous les champs.'));
      }
    } catch (error) {
      console.error(t('Erreur lors du téléversement du fichier:'), error);
    }
  };

  const clearFormAndFile = () => {
    clearForm();
    document.getElementById('file').value = '';
  };

  const fetchTableData = () => {
    axios.get('http://localhost:3001/api/getFichiers')
      .then(response => {
        setFichiers(response.data);
      })
      .catch(error => {
        console.error('Erreur de récupération des données de la table :', error);
      });
  };

  const clearForm = () => {
    setFormTitle('');
    setFormDescription('');
    setSelectedFile(null);
    setFileUrl('');
    setTranscriptionResult('');
    setEditingFichier(null);
    setEditingRowIndex(null);
  };

  const deleteFile = (row) => {
    const fichierId = row.id_fichier;

    Swal.fire({
      title: t('Êtes-vous sûr?'),
      text: t('Vous ne pourrez pas revenir en arrière après avoir supprimé ce fichier!'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: t('Oui, supprimer!'),
      cancelButtonText: t('Annuler') // Texte du bouton d'annulation
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:3001/api/deleteFichier/${fichierId}`)
          .then(response => {
            console.log(response.data);
            const updatedFichiers = fichiers.filter(fichier => fichier.id_fichier !== fichierId);
            setFichiers(updatedFichiers);

            toast.success(t('Suppression terminée avec succès'));
          })
          .catch(error => {
            console.error(t('Erreur lors de la suppression du fichier:'), error);
          });
      }
    });
  };

  const editFile = (row, index) => {
    setEditingFichier(row);
    setFormTitle(row.title);
    setFormDescription(row.description);
    setSelectedDomain(row.domain);
    setEditingRowIndex(index);
    setSelectedFile({ name: row.fileName });

    openModal(true);
  };

  const openModal = (editMode = false) => {
    setShowModal(true);
    setIsEditMode(editMode);
  };

  const saveEdit = async () => {
    try {
      if (editingFichier && formTitle && formDescription && selectedDomain && selectedOriginalLanguage) {
        await axios.put(`http://localhost:3001/api/updateFichier/${editingFichier.id_fichier}`, {
          title: formTitle,
          description: formDescription,
          domain: selectedDomain,
          fileName: selectedFile.name,
          langueOriginal: selectedOriginalLanguage // Utilise la langue sélectionnée dans le formulaire
        });

        setFichiers((prevFichiers) => {
          return prevFichiers.map((fichier, index) => {
            if (index === editingRowIndex) {
              return {
                ...fichier,
                title: formTitle,
                description: formDescription,
                domaine: selectedDomain,
                fileName: selectedFile.name,
                langueOriginal: selectedOriginalLanguage // Utilise la langue sélectionnée dans le formulaire
              };
            }
            return fichier;
          });
        });

        clearForm();
        setEditingFichier(null);
        setEditingRowIndex(null);
        setShowModal(false);
        setSelectedDomain(selectedDomain);
        toast.success(t('Modification terminée avec succès'));
      } else {
        console.error(t('Veuillez remplir tous les champs.'));
      }
    } catch (error) {
      console.error(t('Erreur lors de la mise à jour du fichier:'), error);
    }
  };

  const showEditButton = (row, index) => (
    <button className="btn-modifier" onClick={() => editFile(row, index)}>
      <FontAwesomeIcon icon={faEdit} />
    </button>
  );

  const transcribeFile = async (file, langueOriginal, id_fichier) => {
    try {
      Swal.fire({
        title: 'Traitement en cours...',
        html: '<l-line-spinner size="40" stroke="3" speed="1" color="black" </l-line-spinner>',
        showConfirmButton: false, // Masquer le bouton de confirmation
        allowOutsideClick: false, // Empêcher la fermeture de la fenêtre de dialogue en cliquant en dehors
        didOpen: () => {
          Swal.showLoading(); // Afficher la charge en cours
        }
      });


      const formData = new FormData();
      formData.append('filePath', file);
      formData.append('langueOriginal', langueOriginal);
      formData.append('langueTranslated', "ar");

      const response = await axios.post('http://localhost:3001/api/transcribeFichier', {
        "filePath": "C:\\Users\\MSI\\pfe\\backend_pfe\\public\\uploads//" + file,
        "langueOriginal": langueOriginal,
        "langueTranslated": "ar",
        "id_fichier": id_fichier
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const result = response.data;

      if (result.success) {
        console.log('Texte origin :', result.contentOriginal);
        Swal.fire('Succès', 'Fichier transcrit avec succès !', 'success');
      } else {
        Swal.fire('Erreur lors de la transcription du fichier : ' + result.message, '', 'error');
      }

    } catch (error) {
      Swal.fire('Erreur lors de la transcription du fichier : ' + error.message, '', 'error');
    }
  };

  

  const fetchFileByName = async (fileName) => {
    try {
      const response = await fetch('http://localhost:3001/api/files/' + fileName);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du fichier');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const customToastStyle = {
        maxWidth: '150%', // Largeur maximale du toast
        height: '150%', // Hauteur du toast
        overflow: 'auto' // Ajout d'un défilement si le contenu dépasse la taille du toast
      };
      toast.success(
        <div style={customToastStyle}>
          {fileName.endsWith('.mp3') ? (
            <audio controls style={{ width: '100%' }}>
              <source src={url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          ) : fileName.endsWith('.mp4') ? (
            <video controls style={{ width: '100%' }}>
              <source src={url} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          ) : (
            <p>Fichier non pris en charge</p>
          )}
        </div>,
        { autoClose: false } // Ne pas fermer automatiquement le toast
      );
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLangueOriginalChange = (event, index) => {
    const newLangueOriginal = event.target.value;
    setLangueOriginal(newLangueOriginal);
  };

  // Fonction pour gérer le changement de langue traduite
  const handleLangueTranslatedChange = (event, index) => {
    const newLangueTranslated = event.target.value;
    setLangueTranslated(newLangueTranslated);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/logout'); // Appeler votre API de déconnexion

      if (response.data.success) {
        // Si la déconnexion est réussie, rediriger vers la page d'accueil
        sessionStorage.setItem('token', '');
        sessionStorage.setItem('user', {});
        navigate('/');
      } else {
        // Sinon, afficher un message d'erreur ou gérer l'erreur selon votre cas
        console.error('Erreur lors de la déconnexion :', response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  const handleCloseModal3 = () => {
    setShowModal3(false);
  };

  const fetchFileText = async (fileName) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/file-content?fileName=${fileName}`);
      setFileContent(response.data); // Mettre à jour le contenu du fichier dans le state
    } catch (error) {
      console.error('Error fetching file content:', error);
      // Gérer l'erreur comme vous le souhaitez
    }
  };

  const handleOpenModal3 = (fileName) => {
    // const data = "C:\Users\MSI\extraction-project-main\backend_pfe\public\original_files\arabic_original.txt";
    // let res = data.search("original_files") + 14;
    // console.log('okk res : ', data.substr(res, data.length));

    setShowModal3(true);
    fetchFileText(fileName); // Appel à la fonction pour obtenir le contenu du fichier lorsque la modal est ouverte
  };

  const handleOpenModal4 = (selectedFichier) => {
    setSelectedFichier(selectedFichier);
    setTitre2(selectedFichier.title);
    setLangue(selectedFichier.langueOriginal);
    setDomaine(selectedFichier.domaine);
    setShowModal4(true);

  };

  const handleCloseModal4 = () => {
    setShowModal4(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const clearForm2 = () => {
    setTitre2('');
    setFichier(null);
    setPrix('');
    setLangue('');
    setDomaine('');
    setSelectedFile2(null);
  };

  const handleSubmit = async () => {
    try {
        console.log('Form values:', formTitre2, selectedFile, formPrix, formLangue, formDomaine, user?.name);

        if (!formTitre2) {
            console.error('Le champ "Titre" est vide.');
        }

        if (!formFichier) {
            console.error('Aucun fichier sélectionné.');
        }

        if (!formPrix) {
            console.error('Le champ "Prix" est vide.');
        }

        if (!formLangue) {
            console.error('Aucune langue sélectionnée.');
        }

        if (!formDomaine) {
            console.error('Aucun domaine sélectionné.');
        }

        if (!user?.name) {
            console.error('Le nom de l\'instructeur est manquant.');
        }

        if (formTitre2 && formFichier && formPrix && formLangue && formDomaine && user?.name) {
            const requestData = {
                titre: formTitre2,
                fichier: selectedFileName,
                prix: formPrix,
                langue: formLangue,
                domaine: formDomaine,
                instructeur: user?.name
            };
            console.log('Request data:', requestData); // Ajoutez ce message pour vérifier les données envoyées
            const response = await axios.post('http://localhost:3001/api/cours', requestData);
            const result = response.data;
            console.log(result);
            setTranscriptionResult(result.transcription);
            toast.success(t('Ajout terminé avec succès'));
            clearFormAndFile();
            setShowModal4(false);
            setSelectedFileName('');
        } else {
            console.error(t('Veuillez remplir tous les champs.'));
        }
    } catch (error) {
        console.error(t('Erreur lors du téléversement du fichier:'), error);
    }
};


const handleFileChange2 = (event) => {
    const file = event.target.files[0];
    setFichier(file);
    setSelectedFile2(file);
    setSelectedFileName(file ? file.name : '');
};

  

  const resetFormAndFile = () => {
    setTitre2('');
    setFichier(null);
    setPrix('');
    setLangue('');
    setDomaine('');
    setInstructeur('');
    setSelectedFile2('');
  };
  
  



  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [instructeur1, setInstructeur1] = useState(null);
  
  useEffect(() => {
    if (option1 === 'profile') { // Correction ici : option1 au lieu de option
      const fetchInstructeur = async () => {
        setLoading(true);
        try {
          const response = await fetch('http://localhost:3001/api/getInstructeurs');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const instructeurs = await response.json();
          console.log("Instructeurs récupérés:", instructeurs);
          console.log("Nom de l'utilisateur connecté:", user?.name);
          
          const instructeurConnecte = instructeurs.find(instructeur => instructeur.nom.trim().toLowerCase() === user?.name.trim().toLowerCase());
          console.log("Instructeur connecté:", instructeurConnecte);
  
          if (!instructeurConnecte) {
            throw new Error('Instructeur non trouvé');
          }
          setInstructeur1(instructeurConnecte);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchInstructeur();
    }
  }, [option1, user?.name]); 

///////////:stat ventes ////////
const [statistiquesVentes, setStatistiquesVentes] = useState(null);

useEffect(() => {
  // Fonction pour charger les statistiques des ventes
  const loadStatistiquesVentes = async () => {
      try {
          // Appel à ton API pour récupérer les statistiques des ventes de l'instructeur
          const response = await axios.get(`http://localhost:3001/api/instructeur/${user?.name}/statistiques-ventes`);
          // Mettre à jour le state avec les données reçues
          setStatistiquesVentes(response.data.statistiquesCours);
      } catch (error) {
          console.error("Erreur lors du chargement des statistiques des ventes :", error);
      }
  };

  // Charger les statistiques des ventes lorsque l'option1 ou l'utilisateur change
  if (option1 === 'statistique' && user?.name) {
      loadStatistiquesVentes();
  } else {
      // Réinitialiser les statistiques si l'option ou l'utilisateur change
      setStatistiquesVentes([]);
  }
}, [option1, user?.name]);



  return (
    <div className="application-container">
      <Sidebar setOption={setOption} />

      <div className="main-content">
        <div className="navbar">
          <div className="left-links">
            <div
              className={`nav-item ${activeNavItem === 'home' ? 'active' : ''}`}
              onClick={() => handleNavItemClick('home')}
            >
              <FontAwesomeIcon icon={faHome} /> {t('accueil')}
            </div>

            <div
              className={`nav-item ${activeNavItem === 'contact' ? 'active' : ''}`}
              onClick={() => handleNavItemClick('contact')}
            >
              <FontAwesomeIcon icon={faEnvelope} />  {t('contact')}
            </div>
          </div>

          <div className="right-links">
            <div
              className={`nav-item ${activeNavItem === 'deconnexion' ? 'active' : ''}`}
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignInAlt} /> {t('Déconnexion')}
            </div>


            <div
              className={`nav-item ${activeNavItem === 'user' ? 'active' : ''}`}
            >

              <FontAwesomeIcon icon={faUser} /> {user?.name}
            </div>


            <div
              className={`nav-item ${activeNavItem === 'language' ? 'active' : ''}`}
              onClick={() => {
                handleNavItemClick('language');
                toggleLanguageDropdown();
              }}
            >
              <FontAwesomeIcon icon={faLanguage} /> {t('langue')}
              {languageDropdownVisible && (
                <div className="language-dropdown">
                  <ul>
                    <li onClick={ChangeEn}>{t('anglais')}</li>
                    <li onClick={ChangeFr}>{t('francais')}</li>
                    <li onClick={ChangeAr}>{t('arabe')}</li>
                  </ul>
                </div>

              )}
            </div>

          </div>
        </div>
        <br /><br />

        {option1 === 'statistique' && (
    <div>
        <StatistiquesVentesChart statistiquesVentes={statistiquesVentes} username={user?.name} />
    </div>
)}


        {option1 === 'profile' && ( // Correction ici : option1 au lieu de option
  <>
    {loading && <CircularProgress />}
    {error && <Alert severity="error">Error: {error.message}</Alert>}
    {instructeur1 && (
      <Container style={{ height: '100vh' }}>
        <Card sx={{ width: 600, margin: 'auto' }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'orange', width: 100, height: 100, fontSize: 50 }}>
                {instructeur1.nom.charAt(0)}
              </Avatar>
            }
            title={<Typography variant="h4" sx={{ fontWeight: 'bold' }}>{`Profil de ${instructeur1.nom}`}</Typography>}
          />
          <CardContent>
            <Typography variant="body1"><strong>Email:</strong> {instructeur1.email}</Typography>
            
            <Typography variant="body1"><strong>Langue:</strong> {instructeur1.langue}</Typography>
            <Typography variant="body1"><strong>Poste:</strong> {instructeur1.poste}</Typography>
            <Typography variant="body1"><strong>Etablissement:</strong> {instructeur1.etablissement}</Typography>
            <Typography variant="body1"><strong>Specialité:</strong> {instructeur1.specialite}</Typography>
            <Typography variant="body1"><strong>Niveau:</strong> {instructeur1.niveau}</Typography>
            <Typography variant="body1"><strong>Tel:</strong> {instructeur1.tel}</Typography>
            
          </CardContent>
        </Card>
      </Container>
    )}
  </>
)}




        {option1 === 'videos' && (
          <div className="container mt-5">
            <h1><center>{t('Téléchargement des vidéos et audios')} </center></h1>
            <br /> <br />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <button
              type="button"
              className="orange-button"
              onClick={() => openModal(false)}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" /> &nbsp;
              <b>{t('Ajouter vidéo ou audio')}</b>
            </button>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? t('Modifier') : t('Ajouter')} {t('vidéo ou audio')}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">{t('Titre')}</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">{t('Description')}</label>
                    <textarea
                      className="form-control"
                      id="description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="domain" className="form-label">{t('Domaine')}</label>
                    <select
                      className="form-select"
                      id="domain"
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                    >
                      <option value="">{t('Sélectionner_domaine')}</option>
                      <option value="Sciences et Mathématiques">{t('sciences_math')}</option>
                      <option value="Langues">{t('langues')}</option>
                      <option value="Informatique et Technologie">{t('informatique_technologie')}</option>
                      <option value="Arts et Culture">{t('arts_culture')}</option>
                      <option value="Développement Personnel">{t('developpement_personnel')}</option>
                      <option value="Affaires et Économie">{t('affaires_economie')}</option>
                      <option value="Sciences Sociales">{t('sciences_sociales')}</option>
                      <option value="Cuisine">{t('Cuisine')}</option>
                      <option value="Maquillage">{t('Maquillage')}</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="file" className="form-label">{t('Fichier MP3 / MP4')}</label>
                    <input
                      type="text"
                      className="form-control"
                      id="file"
                      value={selectedFile ? selectedFile.name : ''}
                      readOnly
                      style={{ display: 'none' }} // Hide the original file field
                    />
                    <input
                      type="file"
                      className="form-control"
                      id="fileInput"
                      accept="audio/*, video/*"
                      onChange={handleFileChange}
                    />
                    {isEditMode && editingFichier && (
                      <label htmlFor="fileInput" className="form-label">
                        {t('Fichier actuel')} : {editingFichier.fileName}
                      </label>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="language" className="form-label">
                      Langue du fichier
                    </label>
                    <select
                      className="form-select"
                      id="language"
                      value={selectedOriginalLanguage}
                      onChange={handleOriginalLanguageChange}
                    >
                      <option value="">Sélectionner une langue</option>
                      <option value="af">Afrikaans</option>
                      <option value="ar">Arabic</option>
                      <option value="hy">Armenian</option>
                      <option value="as">Assamese</option>
                      <option value="ay">Aymara</option>
                      <option value="az">Azerbaijani</option>
                      <option value="bm">Bambara</option>
                      <option value="eu">Basque</option>
                      <option value="be">Belarusian</option>
                      <option value="bn">Bengali</option>
                      <option value="bho">Bhojpuri</option>
                      <option value="bs">Bosnian</option>
                      <option value="bg">Bulgarian</option>
                      <option value="ca">Catalan</option>
                      <option value="ceb">Cebuano</option>
                      <option value="ny">Chichewa</option>
                      <option value="zh-CN">Chinese (Simplified)</option>
                      <option value="zh-TW">Chinese (Traditional)</option>
                      <option value="co">Corsican</option>
                      <option value="hr">Croatian</option>
                      <option value="cs">Czech</option>
                      <option value="da">Danish</option>
                      <option value="dv">Dhivehi</option>
                      <option value="doi">Dogri</option>
                      <option value="nl">Dutch</option>
                      <option value="en">English</option>
                      <option value="eo">Esperanto</option>
                      <option value="et">Estonian</option>
                      <option value="ee">Ewe</option>
                      <option value="tl">Filipino</option>
                      <option value="fi">Finnish</option>
                      <option value="fr">French</option>
                      <option value="fy">Frisian</option>
                      <option value="gl">Galician</option>
                      <option value="ka">Georgian</option>
                      <option value="de">German</option>
                      <option value="el">Greek</option>
                      <option value="gn">Guarani</option>
                      <option value="gu">Gujarati</option>
                      <option value="ht">Haitian Creole</option>
                      <option value="ha">Hausa</option>
                      <option value="haw">Hawaiian</option>
                      <option value="iw">Hebrew</option>
                      <option value="hi">Hindi</option>
                      <option value="hmn">Hmong</option>
                      <option value="hu">Hungarian</option>
                      <option value="is">Icelandic</option>
                      <option value="ig">Igbo</option>
                      <option value="ilo">Ilocano</option>
                      <option value="id">Indonesian</option>
                      <option value="ga">Irish</option>
                      <option value="it">Italian</option>
                      <option value="ja">Japanese</option>
                      <option value="jw">Javanese</option>
                      <option value="kn">Kannada</option>
                      <option value="kk">Kazakh</option>
                      <option value="km">Khmer</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="gom">Konkani</option>
                      <option value="ko">Korean</option>
                      <option value="kri">Krio</option>
                      <option value="ku">Kurdish (Kurmanji)</option>
                      <option value="ckb">Kurdish (Sorani)</option>
                      <option value="ky">Kyrgyz</option>
                      <option value="lo">Lao</option>
                      <option value="la">Latin</option>
                      <option value="lv">Latvian</option>
                      <option value="ln">Lingala</option>
                      <option value="lt">Lithuanian</option>
                      <option value="lg">Luganda</option>
                      <option value="lb">Luxembourgish</option>
                      <option value="mk">Macedonian</option>
                      <option value="mai">Maithili</option>
                      <option value="mg">Malagasy</option>
                      <option value="ms">Malay</option>
                      <option value="ml">Malayalam</option>
                      <option value="mt">Maltese</option>
                      <option value="mi">Maori</option>
                      <option value="mr">Marathi</option>
                      <option value="mni-Mtei">Meiteilon (Manipuri)</option>
                      <option value="lus">Mizo</option>
                      <option value="mn">Mongolian</option>
                      <option value="my">Myanmar</option>
                      <option value="ne">Nepali</option>
                      <option value="no">Norwegian</option>
                      <option value="or">Odia (Oriya)</option>
                      <option value="om">Oromo</option>
                      <option value="ps">Pashto</option>
                      <option value="fa">Persian</option>
                      <option value="pl">Polish</option>
                      <option value="pt">Portuguese</option>
                      <option value="pa">Punjabi</option>
                      <option value="qu">Quechua</option>
                      <option value="ro">Romanian</option>
                      <option value="ru">Russian</option>
                      <option value="sm">Samoan</option>
                      <option value="sa">Sanskrit</option>
                      <option value="gd">Scots Gaelic</option>
                      <option value="nso">Sepedi</option>
                      <option value="sr">Serbian</option>
                      <option value="st">Sesotho</option>
                      <option value="sn">Shona</option>
                      <option value="sd">Sindhi</option>
                      <option value="si">Sinhala</option>
                      <option value="sk">Slovak</option>
                      <option value="sl">Slovenian</option>
                      <option value="so">Somali</option>
                      <option value="es">Spanish</option>
                      <option value="su">Sundanese</option>
                      <option value="sw">Swahili</option>
                      <option value="sv">Swedish</option>
                      <option value="tg">Tajik</option>
                      <option value="ta">Tamil</option>
                      <option value="tt">Tatar</option>
                      <option value="te">Telugu</option>
                      <option value="th">Thai</option>
                      <option value="ti">Tigrinya</option>
                      <option value="ts">Tsonga</option>
                      <option value="tr">Turkish</option>
                      <option value="tk">Turkmen</option>
                      <option value="ak">Twi</option>
                      <option value="uk">Ukrainian</option>
                      <option value="ur">Urdu</option>
                      <option value="ug">Uyghur</option>
                      <option value="uz">Uzbek</option>
                      <option value="vi">Vietnamese</option>
                      <option value="cy">Welsh</option>
                      <option value="xh">Xhosa</option>
                      <option value="yi">Yiddish</option>
                      <option value="yo">Yoruba</option>
                      <option value="zu">Zulu</option>
                    </select>
                  </div>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  style={{ backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545' }}
                  onClick={() => setShowModal(false)}
                >
                  {t('Annuler')}
                </Button>
                <Button
                  style={{ backgroundColor: '#28a745', color: 'white', borderColor: '#28a745' }}
                  onClick={isEditMode ? saveEdit : handleUploadFile}
                >
                  {t('Valider')}
                </Button>
              </Modal.Footer>
            </Modal>
            {/* Quiz modal */}
            <Modal show={showQuizModal} onHide={() => setShowQuizModal(false)} style={{ overflowY: 'auto' }}>
              <Modal.Header closeButton>
                <Modal.Title>Créer un nouveau quiz</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <Form.Group controlId="formTitre">
                  <Form.Label>Titre du quiz</Form.Label>
                  <Form.Control type="text" placeholder="Entrez le titre du quiz" value={titre} onChange={(e) => setTitre(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formDescription">
                  <Form.Label>Description du quiz</Form.Label>
                  <Form.Control as="textarea" rows={3} placeholder="Entrez la description du quiz" value={description} onChange={(e) => setDescription(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formQuestions">
                  <Form.Label>Questions du quiz</Form.Label>
                  {questions.map((question, index) => (
                    <div key={index}>
                      <Form.Label>{`Question ${index + 1}`}</Form.Label>
                      <Form.Control type="text" placeholder={`Entrez la question ${index + 1}`} value={question.text} onChange={(e) => handleQuestionChange(e.target.value, index)} />
                      <div>
                        {question.suggestions.map((suggestion, sugIndex) => (
                          <Form.Control key={sugIndex} type="text" placeholder={`Suggestion ${sugIndex + 1}`} value={suggestion} onChange={(e) => handleSuggestionChange(e.target.value, index, sugIndex)} />
                        ))}
                      </div>
                      <Form.Label>Réponse correcte</Form.Label>
                      <Form.Control type="text" placeholder={`Entrez la réponse correcte à la question ${index + 1}`} value={correctAnswers[index]} onChange={(e) => handleCorrectAnswerChange(e.target.value, index)} />
                    </div>
                  ))} &nbsp;&nbsp;
                  <Button variant="success" onClick={handleAddQuestion}>Ajouter une question</Button>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="success" onClick={handleCreateQuiz}>
                  Créer
                </Button>
              </Modal.Footer>
            </Modal>
            <br /> <br />
            <div className="container mt-5">
              <h2>{t('Fichiers Téléchargés')}</h2>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col" style={{ display: 'none' }}>ID</th>
                    <th scope="col">{t('Titre')}</th>
                    <th scope="col" style={{ display: 'none' }}>{t('Description')}</th>
                    <th scope="col">{t('Fichier')}</th>
                    <th scope="col">{t('Date Upload')}</th>

                    <th scope="col">{t('Domaine')}</th>
                    <th scope="col">{t('Langue')}</th>
                    <th scope="col">{t('Quiz')}</th> 
                    <th scope="col">{t('Actions')}</th>
                    <th scope="col">{t('Transcription')}</th>
                    <th scope="col">{t('Fichier texte')}</th>
                    <th scope="col">{t('Cours')}</th>

                  </tr>
                </thead>
                <tbody>
                  {fichiers.map((fichier, index) => (
                    <tr key={fichier.id_fichier}>
                      <td style={{ display: 'none' }}>{fichier.id_fichier}</td>
                      <td>{fichier.title}</td>
                      <td style={{ display: 'none' }}>{fichier.description}</td>
                      <td>{fichier.fileName}</td>
                      <td>{new Date(fichier.dateUpload).toLocaleDateString()}
                        &nbsp;&nbsp;{new Date(fichier.dateUpload).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{fichier.domaine}</td>
                      <td>{fichier.langueOriginal}</td>
                       <td>
                        <button className="btn-quiz" onClick={openQuizModal}>
                          <FontAwesomeIcon icon={faQuestionCircle} />
                        </button>
                      </td> 
                      <td>
                        <button className="btn-transcrire" onClick={() => fetchFileByName(fichier.fileName)}>
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        &nbsp;&nbsp;
                        {showEditButton(fichier, index)} &nbsp;
                        <button className="btn-supprimer" data-toggle="tooltip" data-placement="top" title="Delete" onClick={() => deleteFile(fichier)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>

                      <td>
                        <button className="btn-transcrire" onClick={() => transcribeFile(fichier.fileName, fichier.langueOriginal, fichier.id_fichier)}>
                          <FontAwesomeIcon icon={faFileVideo} />
                        </button>

                      </td>
                      <td>


                        <a href={`/file-content/${encodeURIComponent(fichier.textFileName)}`}><center>{fichier.textFileName}</center></a>



                      </td>



                      <td>
                        <button className="btn-transcrire" onClick={() => handleOpenModal4(fichier)}>
                          <FontAwesomeIcon icon={faFileVideo} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal show={showModal3} onHide={handleCloseModal3}>
          <Modal.Header closeButton>
            <Modal.Title>Fichier originale</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            {fileContent}
          </Modal.Body>
        </Modal>

        <Modal show={showModal4} onHide={() => setShowModal4(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Ajouter un cours</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="mb-3">
                <label>Titre:</label>
                <input type="text" value={formTitre2} onChange={(e) => setTitre2(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="file" className="form-label">Fichier:</label>
                <input type="file" className="form-control" id="file" onChange={handleFileChange2} />
              </div>
              <div className="mb-3">
                <label>Prix:</label>
                <input type="text" value={formPrix} onChange={(e) => setPrix(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="langue">Langue:</label>
                <select id="langue" value={formLangue} onChange={(e) => setLangue(e.target.value)}>
                  <option value="">Sélectionner une langue</option>
                  <option value="af">Afrikaans</option>
                      <option value="ar">Arabic</option>
                      <option value="hy">Armenian</option>
                      <option value="as">Assamese</option>
                      <option value="ay">Aymara</option>
                      <option value="az">Azerbaijani</option>
                      <option value="bm">Bambara</option>
                      <option value="eu">Basque</option>
                      <option value="be">Belarusian</option>
                      <option value="bn">Bengali</option>
                      <option value="bho">Bhojpuri</option>
                      <option value="bs">Bosnian</option>
                      <option value="bg">Bulgarian</option>
                      <option value="ca">Catalan</option>
                      <option value="ceb">Cebuano</option>
                      <option value="ny">Chichewa</option>
                      <option value="zh-CN">Chinese (Simplified)</option>
                      <option value="zh-TW">Chinese (Traditional)</option>
                      <option value="co">Corsican</option>
                      <option value="hr">Croatian</option>
                      <option value="cs">Czech</option>
                      <option value="da">Danish</option>
                      <option value="dv">Dhivehi</option>
                      <option value="doi">Dogri</option>
                      <option value="nl">Dutch</option>
                      <option value="en">English</option>
                      <option value="eo">Esperanto</option>
                      <option value="et">Estonian</option>
                      <option value="ee">Ewe</option>
                      <option value="tl">Filipino</option>
                      <option value="fi">Finnish</option>
                      <option value="fr">French</option>
                      <option value="fy">Frisian</option>
                      <option value="gl">Galician</option>
                      <option value="ka">Georgian</option>
                      <option value="de">German</option>
                      <option value="el">Greek</option>
                      <option value="gn">Guarani</option>
                      <option value="gu">Gujarati</option>
                      <option value="ht">Haitian Creole</option>
                      <option value="ha">Hausa</option>
                      <option value="haw">Hawaiian</option>
                      <option value="iw">Hebrew</option>
                      <option value="hi">Hindi</option>
                      <option value="hmn">Hmong</option>
                      <option value="hu">Hungarian</option>
                      <option value="is">Icelandic</option>
                      <option value="ig">Igbo</option>
                      <option value="ilo">Ilocano</option>
                      <option value="id">Indonesian</option>
                      <option value="ga">Irish</option>
                      <option value="it">Italian</option>
                      <option value="ja">Japanese</option>
                      <option value="jw">Javanese</option>
                      <option value="kn">Kannada</option>
                      <option value="kk">Kazakh</option>
                      <option value="km">Khmer</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="gom">Konkani</option>
                      <option value="ko">Korean</option>
                      <option value="kri">Krio</option>
                      <option value="ku">Kurdish (Kurmanji)</option>
                      <option value="ckb">Kurdish (Sorani)</option>
                      <option value="ky">Kyrgyz</option>
                      <option value="lo">Lao</option>
                      <option value="la">Latin</option>
                      <option value="lv">Latvian</option>
                      <option value="ln">Lingala</option>
                      <option value="lt">Lithuanian</option>
                      <option value="lg">Luganda</option>
                      <option value="lb">Luxembourgish</option>
                      <option value="mk">Macedonian</option>
                      <option value="mai">Maithili</option>
                      <option value="mg">Malagasy</option>
                      <option value="ms">Malay</option>
                      <option value="ml">Malayalam</option>
                      <option value="mt">Maltese</option>
                      <option value="mi">Maori</option>
                      <option value="mr">Marathi</option>
                      <option value="mni-Mtei">Meiteilon (Manipuri)</option>
                      <option value="lus">Mizo</option>
                      <option value="mn">Mongolian</option>
                      <option value="my">Myanmar</option>
                      <option value="ne">Nepali</option>
                      <option value="no">Norwegian</option>
                      <option value="or">Odia (Oriya)</option>
                      <option value="om">Oromo</option>
                      <option value="ps">Pashto</option>
                      <option value="fa">Persian</option>
                      <option value="pl">Polish</option>
                      <option value="pt">Portuguese</option>
                      <option value="pa">Punjabi</option>
                      <option value="qu">Quechua</option>
                      <option value="ro">Romanian</option>
                      <option value="ru">Russian</option>
                      <option value="sm">Samoan</option>
                      <option value="sa">Sanskrit</option>
                      <option value="gd">Scots Gaelic</option>
                      <option value="nso">Sepedi</option>
                      <option value="sr">Serbian</option>
                      <option value="st">Sesotho</option>
                      <option value="sn">Shona</option>
                      <option value="sd">Sindhi</option>
                      <option value="si">Sinhala</option>
                      <option value="sk">Slovak</option>
                      <option value="sl">Slovenian</option>
                      <option value="so">Somali</option>
                      <option value="es">Spanish</option>
                      <option value="su">Sundanese</option>
                      <option value="sw">Swahili</option>
                      <option value="sv">Swedish</option>
                      <option value="tg">Tajik</option>
                      <option value="ta">Tamil</option>
                      <option value="tt">Tatar</option>
                      <option value="te">Telugu</option>
                      <option value="th">Thai</option>
                      <option value="ti">Tigrinya</option>
                      <option value="ts">Tsonga</option>
                      <option value="tr">Turkish</option>
                      <option value="tk">Turkmen</option>
                      <option value="ak">Twi</option>
                      <option value="uk">Ukrainian</option>
                      <option value="ur">Urdu</option>
                      <option value="ug">Uyghur</option>
                      <option value="uz">Uzbek</option>
                      <option value="vi">Vietnamese</option>
                      <option value="cy">Welsh</option>
                      <option value="xh">Xhosa</option>
                      <option value="yi">Yiddish</option>
                      <option value="yo">Yoruba</option>
                  <option value="zu">Zulu</option>
                  {/* Ajoutez d'autres options selon vos besoins */}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="domaine">Domaine:</label>
                <select id="domaine" value={formDomaine} onChange={(e) => setDomaine(e.target.value)}>
                  <option value="">{t('Sélectionner_domaine')}</option>
                  <option value="Sciences et Mathématiques">{t('sciences_math')}</option>
                  <option value="Langues">{t('langues')}</option>
                  <option value="Informatique et Technologie">{t('informatique_technologie')}</option>
                  <option value="Arts et Culture">{t('arts_culture')}</option>
                  <option value="Développement Personnel">{t('developpement_personnel')}</option>
                  <option value="Affaires et Économie">{t('affaires_economie')}</option>
                  <option value="Sciences Sociales">{t('sciences_sociales')}</option>
                  <option value="Cuisine">{t('Cuisine')}</option>
                  <option value="Maquillage">{t('Maquillage')}</option>
                </select>
              </div>

              <div className="mb-3">
  <label>Nom de l'instructeur:</label>
  <input type="text" value={user?.name} readOnly />
</div>


              


            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={handleSubmit}>Sauvegarder</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showModal2} onHide={closeModal2}>
          <Modal.Header closeButton>
            <Modal.Title>Modifier le quiz</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="formTitre">
              <Form.Label>Titre du quiz</Form.Label>
              <Form.Control type="text" value={quizData.titre} disabled />
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Description du quiz</Form.Label>
              <Form.Control as="textarea" rows={3} value={quizData.description} onChange={(e) => updateDescription(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formQuestions">
              <Form.Label>Questions du quiz</Form.Label>
              {quizData.questions.map((question, index) => (
                <div key={index}>
                  <Form.Label>{`Question ${index + 1}`}</Form.Label>
                  <Form.Control type="text" value={question.text} onChange={(e) => handleQuestionTextChange(e, index)} />
                  <div>
                    {question.suggestions.map((suggestion, sugIndex) => (
                      <Form.Control key={sugIndex} type="text" value={suggestion} onChange={(e) => handleSuggestionChange2(e, index, sugIndex)} />
                    ))}
                  </div>
                  <Form.Label>Réponse correcte</Form.Label>
                  <Form.Control type="text" value={question.correctAnswer} onChange={(e) => handleCorrectAnswerChange2(e, index)} />
                </div>
              ))}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal2}>
              Fermer
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Enregistrer les modifications
            </Button>
          </Modal.Footer>
        </Modal>

        <div>
          {option1 === 'quiz' && (
            <div>
              <h1 className="taille"><center>{t('Les quizzes')}</center></h1>
              <br /><br /><br /><br />
              <div className="grid-container">
                {quizzes1?.map((quiz, index) => (
                  <div className="grid-item" key={quiz._id}>
                    {/* Utilisez une fonction onClick pour ouvrir la modal */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div onClick={() => handleOpenModal(quiz)} style={{ cursor: 'pointer' }}>
                        <p className='tit'>&nbsp;{quiz.titre}</p>
                      </div>

                      <div>
                        <button className="btn-supprimer" data-toggle="tooltip" data-placement="top" title="Delete" onClick={() => handleDeleteQuiz(quiz._id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button> &nbsp;&nbsp;
                        <button className="btn-modifier" onClick={() => openModal2(quiz.titre)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>

                        &nbsp;
                      </div>


                    </div>
                  </div>
                ))}
              </div>




              {/* Afficher le contenu du quiz dans une modal */}
              {selectedQuiz && selectedQuiz.questions && (
                <Modal show={true} onHide={() => setSelectedQuiz(null)}>
                  <Modal.Header closeButton>
                    <Modal.Title>{selectedQuiz.titre}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <form>
                      {selectedQuiz.questions.map((question, index) => (
                        <div key={index}>
                          <p><b>Question {index + 1}:</b></p>
                          <p>{question.text}</p>
                          <ul>
                            {question.suggestions.map((suggestion, optionIndex) => (
                              <li key={optionIndex}>
                                {suggestion} {suggestion === question.correctAnswer && "(Correct)"}
                              </li>
                            ))}
                          </ul>
                          <br /><br />
                        </div>
                      ))}
                    </form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedQuiz(null)}>
                      Fermer
                    </Button>
                  </Modal.Footer>
                </Modal>
              )}

            </div>
          )}


        </div>
        <br /><br />
        <div className="footer">
          <address>
            <p><b>{t('contactez_nous')} :</b></p>
            <p><b>{t('email')} :</b> contact@Intellego.com</p>
            <p><b>{t('telephone')} :</b>  ** *** ***</p>
          </address>
        </div>
      </div>
    </div>
  );
};

export default Application;