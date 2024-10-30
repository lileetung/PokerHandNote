document.addEventListener("DOMContentLoaded", function () {
    // Helper Functions
    function addActionElement(stage) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'action';
        actionDiv.innerHTML = `
            <select class="input-position">
                <option value="">位置</option>
                <option value="我">我</option>
                <option value="BB">BB</option>
                <option value="SB">SB</option>
                <option value="BTN">BTN</option>
                <option value="CO">CO</option>
                <option value="HJ">HJ</option>
                <option value="LJ">LJ</option>
                <option value="UTG1">UTG1</option>
                <option value="UTG">UTG</option>
            </select>
            <select class="input-action">
                <option value="">動作</option>
                <option value="check">Check</option>
                <option value="bet">Bet</option>
                <option value="call">Call</option>
                <option value="fold">Fold</option>
                <option value="raise">Raise</option>
                <option value="Allin">Allin</option>
            </select>
            <input type="number" class="input-amount" placeholder="$" />
            <button class="delete-action">x</button>
        `;
        stage.querySelector('.container-actions').appendChild(actionDiv);

        // Event listeners for each element
        actionDiv.querySelectorAll('select, input').forEach(elem => {
            elem.addEventListener('input', updateOutput);
        });

        // Delete button functionality
        actionDiv.querySelector('.delete-action').addEventListener('click', function () {
            actionDiv.remove();
            updateOutput();
        });
    }

    function addOpponentElement() {
        const opponentDiv = document.createElement('div');
        opponentDiv.innerHTML = `
            <select class="input-position">
                <option value="">位置</option>
                <option value="BB">BB</option>
                <option value="SB">SB</option>
                <option value="BTN">BTN</option>
                <option value="CO">CO</option>
                <option value="HJ">HJ</option>
                <option value="LJ">LJ</option>
                <option value="UTG1">UTG1</option>
                <option value="UTG">UTG</option>
            </select>
            <select class="input-card">
                <option value="">卡</option>
                <option value="A">A</option>
                <option value="K">K</option>
                <option value="Q">Q</option>
                <option value="J">J</option>
                <option value="T">T</option>
                <!-- Add options for 9 through 2 -->
                <option value="9">9</option>
                <option value="8">8</option>
                <option value="7">7</option>
                <option value="6">6</option>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
            </select>
            <select class="input-suit">
                <option value="♠">♠️</option>
                <option value="♥">♥️</option>
                <option value="♦">♦️</option>
                <option value="♣">♣️</option>
            </select>
            <select class="input-card">
                <option value="">卡</option>
                <option value="A">A</option>
                <option value="K">K</option>
                <option value="Q">Q</option>
                <option value="J">J</option>
                <option value="T">T</option>
                <!-- Add options for 9 through 2 -->
                <option value="9">9</option>
                <option value="8">8</option>
                <option value="7">7</option>
                <option value="6">6</option>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
            </select>
            <select class="input-suit">
                <option value="♠">♠️</option>
                <option value="♥">♥️</option>
                <option value="♦">♦️</option>
                <option value="♣">♣️</option>
            </select>
        `;
        document.querySelector('.container-opponents').appendChild(opponentDiv);
        opponentDiv.querySelectorAll('select, input').forEach(elem => {
            elem.addEventListener('input', updateOutput);
        });
    }

    function getCardString(inputElements) {
        let cardString = '';
        for (let i = 0; i < inputElements.length; i += 2) {
            const cardValue = inputElements[i].value;
            const suitValue = inputElements[i + 1].value;
            let suitEmoji = suitValue;

            // Map suit symbols to emojis
            switch (suitValue) {
                case '♠': suitEmoji = '♠️'; break;
                case '♥': suitEmoji = '♥️'; break;
                case '♦': suitEmoji = '♦️'; break;
                case '♣': suitEmoji = '♣️'; break;
                default: break;
            }

            cardString += cardValue + suitEmoji + ' ';
        }
        return cardString.trim();
    }

    // Function to handle Enter key press in input/select elements
    function handleEnterKeyPress(event) {
        if (event.key === "Enter") {
            const formElements = Array.from(document.querySelectorAll('input'));
            const currentIdx = formElements.indexOf(event.target);
            if (currentIdx > -1 && currentIdx < formElements.length - 1) {
                formElements[currentIdx + 1].focus();
                event.preventDefault();
            }
        }
    }

    function updateOutput() {
        const blindsInputs = document.querySelectorAll(".blinds-info .input-blinds");
        const playerNum = blindsInputs[0].value;
        const smallBlind = blindsInputs[1].value;
        const bigBlind = blindsInputs[2].value;
        const ante = blindsInputs[3].value;

        let outputText = `${playerNum}人 ${smallBlind}/${bigBlind}`;

        if (ante.trim() !== "") {
            outputText += ` (${ante})\n`;
        } else {
            outputText += ` (No Ante)\n`;
        }

        outputText += '我: ' + document.querySelector('.hero-info .input-position').value;
        outputText += ' ' + getCardString(document.querySelectorAll('.hero-info .input-card, .hero-info .input-suit'));
        outputText += ', 碼量: ' + document.querySelector('.hero-info .input-hero-stack').value + '\n\n';

        // Function to get card string for community cards
        function getCommunityCardString(stageSelector) {
            return getCardString(document.querySelectorAll(`${stageSelector} .input-card, ${stageSelector} .input-suit`));
        }

        // Stages (Preflop, Flop, Turn, River)
        document.querySelectorAll('.stage').forEach(stage => {
            let stageText = stage.querySelector('h2').textContent + ": ";

            // Append community cards for Flop, Turn, and River
            if (stage.classList.contains('preflop') || stage.classList.contains('flop') || stage.classList.contains('turn') || stage.classList.contains('river')) {
                stageText += getCommunityCardString(`.${stage.classList[1]}`) + '\n';
            }

            const actions = stage.querySelectorAll('.container-actions div');
            actions.forEach(action => {
                const position = action.querySelector('.input-position').value;
                const actionType = action.querySelector('.input-action').value;
                const amount = action.querySelector('input[type="number"]').value;
                stageText += `${position} ${actionType} ${amount}\n`;
            });
            outputText += stageText.trim() + '\n.\n';
        });

        // Opponents
        const opponents = document.querySelectorAll('.container-opponents div');
        opponents.forEach(opponent => {
            const position = opponent.querySelector('.input-position').value;
            const cards = getCardString(opponent.querySelectorAll('.input-card, .input-suit'));
            outputText += `${position} ${cards}\n`;
        });

        // Update Textarea
        document.getElementById('output-text').textContent = outputText.trim();
    }

    // Attach keypress event listener to all input and select elements
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('keypress', handleEnterKeyPress);
        input.addEventListener('input', updateOutput); // Existing event listener
    });

    // Event listeners for adding actions and opponents
    document.querySelectorAll('.btn-add-action').forEach(button => {
        button.addEventListener('click', function () {
            addActionElement(this.parentElement);
            updateOutput();
        });
    });

    document.querySelector('.btn-add-opponent').addEventListener('click', function () {
        addOpponentElement();
        updateOutput();
    });

    // Copy to clipboard functionality
    document.getElementById('btn-copy').addEventListener('click', function () {
        const outputText = document.getElementById('output-text');
        outputText.select();
        document.execCommand('copy');
        const flashMessage = document.getElementById('flash-message');
        flashMessage.style.display = 'block';
        setTimeout(() => flashMessage.style.display = 'none', 3000); // Hide after 3 seconds
    });
});
