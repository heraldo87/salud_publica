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

/**
 * Função principal que inicia o quiz.
 * Busca as questões, as embaralha e seleciona um subconjunto.
 */
async function startQuiz() {
    startScreen.classList.add('hide');
    resultsContainer.classList.add('hide');
    
    let questionsData = [];
    try {
        // Busca os dados do arquivo de questões.
        // O arquivo "preguntas_salud_bolivia_01.json" deve ser renomeado para "questoes.json"
        // ou o nome do arquivo deve ser alterado aqui.
        const response = await fetch('questoes.json'); 
        if (!response.ok) {
            throw new Error('Erro de rede: Não foi possível carregar o arquivo de questões.');
        }
        questionsData = await response.json();
    } catch (error) {
        console.error("Falha ao carregar o quiz:", error);
        alert("Ops! Não consegui carregar as perguntas. Verifique o console para mais detalhes.");
        startScreen.classList.remove('hide');
        return;
    }
    
    quizContainer.classList.remove('hide');
    
    // --- ESTA É A PARTE MAIS IMPORTANTE PARA A SUA PERGUNTA ---
    // 1. .sort(() => Math.random() - 0.5) -> Embaralha aleatoriamente todo o array de questões.
    // 2. .slice(0, 20) -> Pega os primeiros 20 itens do array já embaralhado.
    // O resultado é um novo array com 20 questões aleatórias.
    shuffledQuestions = questionsData
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

    console.log(`Total de questões selecionadas: ${shuffledQuestions.length}`); // Irá mostrar 20 no console.
    
    // Reseta as variáveis do quiz
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];

    // Inicia a primeira questão
    setNextQuestion();
}

/**
 * Prepara e exibe a próxima questão ou mostra os resultados se o quiz terminou.
 */
function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < shuffledQuestions.length) {
        showQuestion(shuffledQuestions[currentQuestionIndex]);
    } else {
        showResults();
    }
}

/**
 * Mostra uma questão e suas opções na tela.
 * @param {object} question - O objeto da questão a ser exibida.
 */
function showQuestion(question) {
    questionContainer.innerText = question.pergunta;
    questionCounterElement.innerText = `Questão ${currentQuestionIndex + 1} de ${shuffledQuestions.length}`;
    
    // Limpa os botões de resposta anteriores
    answerButtonsElement.innerHTML = '';

    // Cria um botão para cada opção de resposta
    question.opcoes.forEach(optionText => {
        const button = document.createElement('button');
        button.innerText = optionText;
        button.classList.add('btn');
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

/**
 * Reseta o estado dos botões de resposta.
 */
function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

/**
 * É chamada quando o usuário clica em uma resposta.
 * @param {Event} e - O evento de clique.
 */
function selectAnswer(e) {
    const selectedButton = e.target;
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correct = selectedButton.innerText === currentQuestion.respostaCorreta;

    // Salva a resposta do usuário para exibição nos resultados detalhados
    userAnswers[currentQuestionIndex] = {
        question: currentQuestion.pergunta,
        selected: selectedButton.innerText,
        correct: currentQuestion.respostaCorreta,
        isCorrect: correct,
        explanation: currentQuestion.explicacao
    };

    // Aumenta a pontuação se a resposta estiver correta
    if (correct) {
      score++;
    }
    
    // Define as classes CSS para feedback visual (correto/errado)
    setStatusClass(selectedButton, correct);
    Array.from(answerButtonsElement.children).forEach(button => {
        if (button.innerText === currentQuestion.respostaCorreta) {
          setStatusClass(button, true);
        }
        button.disabled = true; // Desabilita todos os botões após a seleção
    });
    
    // Mostra o botão "Próxima" ou finaliza o quiz
    if (currentQuestionIndex + 1 < shuffledQuestions.length) {
        nextButton.classList.remove('hide');
    } else {
        setTimeout(showResults, 1200); // Aguarda um pouco antes de mostrar os resultados
    }
}

/**
 * Adiciona classes CSS a um elemento para indicar se a resposta está correta ou errada.
 * @param {HTMLElement} element - O botão que foi clicado.
 * @param {boolean} correct - Verdadeiro se a resposta for correta.
 */
function setStatusClass(element, correct) {
    element.classList.remove('correct', 'wrong');
    element.classList.add(correct ? 'correct' : 'wrong');
}

/**
 * Exibe a tela de resultados finais.
 */
function showResults() {
    quizContainer.classList.add('hide');
    resultsContainer.classList.remove('hide');
    
    scoreElement.innerText = score;
    totalQuestionsElement.innerText = shuffledQuestions.length;
    
    detailedResultsElement.innerHTML = '';
    // Itera sobre as respostas do usuário para criar os resultados detalhados
    userAnswers.forEach(answer => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.innerHTML = `
            <p class="result-question">${answer.question}</p>
            <p class="user-answer ${answer.isCorrect ? 'correct' : 'wrong'}">Sua resposta: ${answer.selected}</p>
            ${!answer.isCorrect ? `<p class="correct-answer">Resposta correta: ${answer.correct}</p>` : ''}
            <p class="explanation"><strong>Explicação:</strong> ${answer.explanation}</p>
        `;
        detailedResultsElement.appendChild(resultItem);
    });
}