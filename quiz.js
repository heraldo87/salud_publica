// Seleciona os elementos do DOM
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results-container');
const questionContainer = document.getElementById('question-text');
const questionCounterElement = document.getElementById('question-counter');
const answerButtonsElement = document.getElementById('answer-buttons');
const scoreElement = document.getElementById('score');
const totalQuestionsElement = document.getElementById('total-questions');
const detailedResultsElement = document.getElementById('detailed-results');

let shuffledQuestions, currentQuestionIndex, score, userAnswers;

// Adiciona os 'escutadores' de eventos
startButton.addEventListener('click', startQuiz);
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});
restartButton.addEventListener('click', () => {
    resultsContainer.classList.add('hide');
    startScreen.classList.remove('hide');
});

// A função que inicia o quiz
async function startQuiz() {
    startScreen.classList.add('hide');
    resultsContainer.classList.add('hide');
    
    let questionsData = [];
    try {
        // A linha mais importante: busca os dados do arquivo questoes.json
        const response = await fetch('questoes.json');
        if (!response.ok) {
            throw new Error('Erro de rede: Não foi possível carregar o arquivo de questões.');
        }
        questionsData = await response.json();
    } catch (error) {
        console.error("Falha ao carregar o quiz:", error);
        alert("Ops! Não consegui carregar as perguntas. Verifique o console para mais detalhes.");
        startScreen.classList.remove('hide'); // Mostra a tela inicial de novo
        return;
    }
    
    quizContainer.classList.remove('hide');
    
    shuffledQuestions = questionsData.sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = []; 

    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < shuffledQuestions.length) {
        showQuestion(shuffledQuestions[currentQuestionIndex]);
    } else {
        showResults();
    }
}

function showQuestion(question) {
    questionContainer.innerText = question.pergunta;
    questionCounterElement.innerText = `Questão ${currentQuestionIndex + 1} de ${shuffledQuestions.length}`;
    
    question.opcoes.forEach(optionText => {
        const button = document.createElement('button');
        button.innerText = optionText;
        button.classList.add('btn');
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correct = selectedButton.innerText === currentQuestion.respostaCorreta;

    userAnswers[currentQuestionIndex] = {
        question: currentQuestion.pergunta,
        selected: selectedButton.innerText,
        correct: currentQuestion.respostaCorreta,
        isCorrect: correct,
        explanation: currentQuestion.explicacao
    };

    if (correct) {
        score++;
    }
    
    setStatusClass(selectedButton, correct);
    Array.from(answerButtonsElement.children).forEach(button => {
        if(button.innerText === currentQuestion.respostaCorreta){
            setStatusClass(button, true);
        }
        button.disabled = true;
    });
    
    if(shuffledQuestions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide');
    } else {
        setTimeout(showResults, 1200); 
    }
}

function setStatusClass(element, correct) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function showResults() {
    quizContainer.classList.add('hide');
    resultsContainer.classList.remove('hide');
    
    scoreElement.innerText = score;
    totalQuestionsElement.innerText = shuffledQuestions.length;
    
    detailedResultsElement.innerHTML = '';
    userAnswers.forEach(answer => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        const answerClass = answer.isCorrect ? 'correct' : 'wrong';
        resultItem.innerHTML = `
            <p class="result-question">${answer.question}</p>
            <p class="user-answer ${answerClass}">Sua resposta: ${answer.selected}</p>
            ${!answer.isCorrect ? `<p class="correct-answer">Resposta correta: ${answer.correct}</p>` : ''}
            <p class="explanation"><strong>Explicação:</strong> ${answer.explanation}</p>
        `;
        detailedResultsElement.appendChild(resultItem);
    });
}
