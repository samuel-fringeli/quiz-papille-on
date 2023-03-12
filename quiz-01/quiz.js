// Récupérer mes 3 blocks div HTML (le header, la div questions et la div result)
let header_screen = document.getElementById("header_screen");
let questions_screen = document.getElementById("questions_screen");
let result_screen = document.getElementById("result_screen");

// Etablir la fonction Quiz permettant d'ajouter des questions et de voir combien de bonnes réponse le user a
function Quiz(){
    this.questions = [];
    this.nbrPoints = 0;
    this.indexCurrentQuestion = 0;

    // Ajouts de questions
    this.addQuestion = function(question) {
        this.questions.push(question);
    }

    // fonction permettant de savoir combien il y a de points au maximum
    this.maxPoints = function() {
        return this.questions.map(q => q.answerPoints
            .filter(p => p >= 0).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
    }

    // Fonction servant à passer à la question suivante s'il y en a une, sinon ça affiche le résultat final
    this.displayCurrentQuestion = function() {
        if(this.indexCurrentQuestion < this.questions.length) {
            this.questions[this.indexCurrentQuestion].getElement(
                this.indexCurrentQuestion + 1, this.questions.length
            );
        }
        else {
            questions_screen.style.display = "none";

            let nbrPercentPointsEl = document.querySelector("#nbrPercentPoints")
            let nbrPercentPoints = Math.round(this.nbrPoints / this.maxPoints() * 100)
            nbrPercentPointsEl.textContent = nbrPercentPoints.toString()

            result_screen.style.display = "block";
            document.getElementById('validate-btn').style.display = 'none';

            this.recommendation_result();
        }
    }
    // Valeur de résulat + recommandation textuelle
    this.recommendation_result = function() {
        let nbrPercentPoints = Math.round(this.nbrPoints / this.maxPoints() * 100)
        let result = ''

        if (nbrPercentPoints < 40) {
            result = "Votre alimentation n'est malheureusement pas du tout saine, nous vous conseillons d'y remédier pour votre bonne santé !";
        } else if (nbrPercentPoints < 60) {
            result = "Votre alimentation est partiellement saine, vous êtes sur la bonne voie !";
        } else {
            result = "Votre alimentation est très saine ! Un grand bravo !";
        }

        document.getElementById('recommationResultat').textContent = result;
    }
}


// Fonction Question permettant de créer les questions avec le titre, les réponses et la réponse correcte
function Question(title, answers, answerCorrect, answerPoints) {
    this.title = title
    this.answers = answers
    this.answerCorrect = !Array.isArray(answerCorrect) ? [answerCorrect]:answerCorrect
    this.answerPoints = !Array.isArray(answerPoints) ? [answerPoints]:answerPoints

    if (answerPoints.length !== answers.length) {
        alert("Toutes les réponses ne sont pas associées à un nombre de points (même nul)");
        return;
    }

    // Mise en place et structuration du HTML et CSS pour mes questions
    this.getElement = function(indexQuestion, nbrOfQuestions) {
        let questionTitle = document.createElement("h3");
        questionTitle.classList.add("title_questions");
        questionTitle.innerHTML = this.title;

        // Le append sert à afficher le html (il existe le after et le prepend si on veut afficher au-dessus ou en-dessous)
        questions_screen.append(questionTitle);

        let questionAnswer = document.createElement("ul");
        questionAnswer.classList.add("list_questions");

        // Boucle en ForEach pour placer à chaque fois un <li> pour chaque réponse
        this.answers.forEach((answer, index) => {
            let answerElement = document.createElement("li");
            answerElement.classList.add("answers");
            answerElement.classList.add("points_" + this.answerPoints[index]);

            if (typeof(answer) === 'string') {
                if (answer.startsWith('./') || answer.startsWith('/') || answer.startsWith('http')) {
                    answerElement.innerHTML = `<img src="${answer}" class="answer_image" alt="image" />`;
                } else {
                    answerElement.innerHTML = answer;
                }
            } else if (typeof(answer) === 'object') {
                if (answer.hasOwnProperty('text') && answer.hasOwnProperty('image')) {
                    answerElement.innerHTML = `<div class="answer_text">${answer.text}</div>
                        <img src="${answer.image}" class="answer_image" alt="image" />`;
                } else if (answer.hasOwnProperty('text')) {
                    answerElement.innerHTML = answer.text;
                } else if (answer.hasOwnProperty('image')) {
                    answerElement.innerHTML = `<img src="${answer.image}" class="answer_image" alt="image" />`;
                }
            }

            answerElement.id = index + 1;
            answerElement.addEventListener("click", this.checkAnswer)
            questionAnswer.append(answerElement);
        });

        // Fonction pour voir à combien de question on est sur le total de questions présents
        let questionNumber = document.createElement("h4");
        questionNumber.classList.add("avancement_question");
        questionNumber.textContent = "Questions : " + indexQuestion + "/" + nbrOfQuestions;

        questions_screen.append(questionNumber);
        questions_screen.append(questionAnswer);
    }

    this.addAnswer = function(answer) {
        this.answers.push(answer);
    }

    // Ici on va checker la réponse correcte avec une écoute d'évènement :
    this.checkAnswer = (e) => {
        let answerSelect = e.target;

        if (answerSelect.classList.contains('answersSelected')) {
            answerSelect.classList.remove('answersSelected');
        } else {
            answerSelect.classList.add('answersSelected');
        }
    }

    // Si la réponse choisit par le user est égale à la réponse correcte retourner True sinon False
    this.isCorrectAnswer = function(answerUser) {
        for (let i = 0; i < this.answerCorrect.length; i++) {
            let currentAnswer = this.answerCorrect[i];
            if (answerUser.toString() === currentAnswer.toString()) {
                return true;
            }
        }
        return false;
    }

    this.checkAllAnswers = function() {
        let answers = document.querySelectorAll('.list_questions .answers')
        let all_answers_correct = true
        for (let answerSelect of answers) {
            // incrémentation nombre de points
            if (answerSelect.classList.contains('answersSelected')) {
                quiz.nbrPoints += parseInt(Array.from(answerSelect.classList)
                    .find(c => c.startsWith('points_'))
                    .replace('points_', ''));
            }

            if (this.isCorrectAnswer(answerSelect.id)) {
                if (!answerSelect.classList.contains('answersSelected')) {
                    all_answers_correct = false
                }
                answerSelect.classList.add("answersCorrect");
            }
            else if (!answerSelect.classList.contains('answersCorrect')) {
                if (answerSelect.classList.contains('answersSelected')) {
                    all_answers_correct = false
                }
                answerSelect.classList.add("answersWrong");
            }
        }
    }
}


// On va récupérer notre fonction Quiz pour implémenter ses données dans ses arguments
// Partie Création des mes données de Questions :
let quiz = new Quiz();

// Exemple : Réponses multiple (entre crochet, N° de réponse correcte (1) séparer d'une virgule puis N° de réponse correcte (2))
let question1 = new Question("Quel est ou quels sont les thèmes traités par l'Association Papille-ON 1<br>Quel est ou quels sont les thèmes traités par l'Association Papille-ON 2",
    ["L'alimentation", "Le réseautage alimentaire<br>Le réseautage alimentaire 2<br>Le réseautage alimentaire 3<br>Le réseautage alimentaire 4", "La permaculture", "Le réchauffement climatique"],
    [1,2],
    [10,10,-10,-10]);
quiz.addQuestion(question1);

// Exemple : Réponse unique (N° de réponse correcte (1))
let question2 = new Question("De quel livre sont extraites les questions de ce Quiz ?",
    ["Le Dictionnaire de le Survie alimentaire",
        "Apprendre à se nourir sainement",
        "L'abécédaire de l'alimentation"],
    [1],
    [10,0,0]);
quiz.addQuestion(question2);

let question3 = new Question("Qui est l'auteur de ce dictionnaire alimentaire ?",
    ["Hervé Pasquier", "Valentin Pasquier", "Sylvain Pasquier"],
    [2],
    [0,10,0]);
quiz.addQuestion(question3);

let question4 = new Question("Quelle image est en rouge ?",
    [{ image: "./00-images/image-01.jpg", text: 'image 1' },
        { image: "./00-images/image-02.jpg", text: 'image 2' },
        { image: "./00-images/image-03.jpg", text: 'image 3' },
        { image: "./00-images/image-04.jpg", text: 'image 4' },
        { image: "./00-images/image-05.jpg", text: 'image 5' },
        { image: "./00-images/image-06.jpg", text: 'image 6' }],
    [4],
    [0,0,0,10,0,0]);
quiz.addQuestion(question4);

let question5 = new Question("Quelle image est en rouge ?",
    ["./00-images/image-01.jpg", "./00-images/image-02.jpg", "./00-images/image-03.jpg",
        "./00-images/image-04.jpg",  "./00-images/image-05.jpg",  "./00-images/image-06.jpg"],
    [4],
    [0,0,0,10,0,0]);
quiz.addQuestion(question5);

// nombre de questions sur la page d'entrée du quiz
document.getElementById('nbrQuestion').textContent = quiz.questions.length;

// Fonction servant à lancer le questionnaire en enlevant la page d'introduction du quiz et en mettant la 1e question
function startQuestions() {
    header_screen.style.display = "none";
    questions_screen.style.display = "block";
    document.getElementById('validate-btn').style.display = 'block';

    quiz.displayCurrentQuestion();
}

document.getElementById('validate-btn').addEventListener('click', (ev) => {
    let currentQuestion = quiz.questions[quiz.indexCurrentQuestion];
    currentQuestion.checkAllAnswers();

    setTimeout(() => {
        questions_screen.textContent = '';
        quiz.indexCurrentQuestion++;
        quiz.displayCurrentQuestion();
    }, 500)
});

// Récupérer le bouton dans mon html avec le ElementById car le ElementsByClassName n'a pas le addEventListener)
let btn_start = document.getElementById("btn_start");
btn_start.addEventListener("click", startQuestions);
