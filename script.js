// Main application using IIFE for module pattern
const PokerHandApp = (function() {
    // Configuration constants
    const CONFIG = {
        DEBOUNCE_DELAY: 300,
        FLASH_MESSAGE_DURATION: 3000,
        CARD_RANKS: ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'],
        POSITIONS: ['BB', 'SB', 'BTN', 'CO', 'HJ', 'LJ', 'UTG1', 'UTG'],
        SUITS: {
            '♠': '♠️',
            '♥': '♥️',
            '♦': '♦️',
            '♣': '♣️'
        },
        ACTIONS: ['check', 'bet', 'call', 'fold', 'raise', 'Allin']
    };

    // DOM element cache for better performance
    let DOM = {};
    
    // Stage progression state
    let stageState = {
        preflop: false,
        flop: false,
        turn: false,
        river: false,
        opponents: false
    };
    
    // Debounce function to limit function calls
    function debounce(func, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Initialize DOM cache
    function cacheDOMElements() {
        DOM = {
            outputText: document.getElementById('output-text'),
            flashMessage: document.getElementById('flash-message'),
            copyButton: document.getElementById('btn-copy'),
            blindsInputs: document.querySelectorAll(".blinds-info .input-blinds"),
            heroPosition: document.querySelector('.hero-info .input-position'),
            heroStack: document.querySelector('.hero-info .input-hero-stack'),
            heroCards: document.querySelectorAll('.hero-info .input-card, .hero-info .input-suit'),
            stages: document.querySelectorAll('.stage'),
            preflopStage: document.querySelector('.stage.preflop'),
            flopStage: document.querySelector('.stage.flop'),
            turnStage: document.querySelector('.stage.turn'),
            riverStage: document.querySelector('.stage.river'),
            addActionButtons: document.querySelectorAll('.btn-add-action'),
            addOpponentButton: document.querySelector('.btn-add-opponent'),
            actionsContainers: document.querySelectorAll('.container-actions'),
            opponentsContainer: document.querySelector('.container-opponents'),
            sectionOpponents: document.querySelector('.section-opponents'),
            sectionOutput: document.querySelector('.section-output')
        };
    }

    // UI Module: Handles UI updates and DOM operations
    const UI = {
        // Create a new action element with a document fragment
        createActionElement: function(stage) {
            const fragment = document.createDocumentFragment();
            const actionDiv = document.createElement('div');
            actionDiv.className = 'action';
            
            // Create position dropdown
            const positionSelect = document.createElement('select');
            positionSelect.className = 'input-position';
            
            // Add default option
            let option = document.createElement('option');
            option.value = '';
            option.textContent = '位置';
            positionSelect.appendChild(option);
            
            // Add "我" (me) option
            option = document.createElement('option');
            option.value = '我';
            option.textContent = '我';
            positionSelect.appendChild(option);
            
            // Add position options
            CONFIG.POSITIONS.forEach(position => {
                option = document.createElement('option');
                option.value = position;
                option.textContent = position;
                positionSelect.appendChild(option);
            });
            
            // Create action dropdown
            const actionSelect = document.createElement('select');
            actionSelect.className = 'input-action';
            
            // Add default option
            option = document.createElement('option');
            option.value = '';
            option.textContent = '動作';
            actionSelect.appendChild(option);
            
            // Add action options
            CONFIG.ACTIONS.forEach(action => {
                option = document.createElement('option');
                option.value = action;
                option.textContent = action;
                actionSelect.appendChild(option);
            });
            
            // Create amount input
            const amountInput = document.createElement('input');
            amountInput.type = 'number';
            amountInput.inputMode = 'numeric';
            amountInput.className = 'input-amount';
            amountInput.placeholder = '$';
            
            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-action';
            deleteButton.textContent = 'x';
            deleteButton.setAttribute('aria-label', '刪除');
            
            // Append all elements to action div
            actionDiv.appendChild(positionSelect);
            actionDiv.appendChild(actionSelect);
            actionDiv.appendChild(amountInput);
            actionDiv.appendChild(deleteButton);
            
            fragment.appendChild(actionDiv);
            stage.querySelector('.container-actions').appendChild(fragment);
            
            // Check if we should progress to next stage
            UI.checkStageProceed();
            
            // Highlight newly added action
            actionDiv.classList.add('newly-added');
            setTimeout(() => {
                actionDiv.classList.remove('newly-added');
            }, 1000);
            
            // Focus on the first element (for better UX)
            setTimeout(() => {
                positionSelect.focus();
            }, 0);
            
            return actionDiv;
        },
        
        // Create a new opponent element
        createOpponentElement: function() {
            const fragment = document.createDocumentFragment();
            const opponentDiv = document.createElement('div');
            opponentDiv.className = 'action'; // Reuse action styling for consistent appearance
            
            // Create position dropdown
            const positionSelect = document.createElement('select');
            positionSelect.className = 'input-position';
            
            // Add default option
            let option = document.createElement('option');
            option.value = '';
            option.textContent = '位置';
            positionSelect.appendChild(option);
            
            // Add position options
            CONFIG.POSITIONS.forEach(position => {
                option = document.createElement('option');
                option.value = position;
                option.textContent = position;
                positionSelect.appendChild(option);
            });
            
            // Create card container div
            const cardContainer = document.createElement('div');
            cardContainer.className = 'opponent-cards';
            cardContainer.style.display = 'flex';
            cardContainer.style.gap = '2px';  // 使用小間距，與Hero區域一致
            cardContainer.style.alignItems = 'center';
            cardContainer.style.height = '44px';
            
            // Add card selects (2 cards with suits)
            for (let i = 0; i < 2; i++) {
                // 創建卡對容器
                const cardPair = document.createElement('div');
                cardPair.className = 'card-pair';
                cardPair.style.height = '44px';
                cardPair.style.display = 'inline-flex';
                cardPair.style.alignItems = 'center';
                
                // Card rank select
                const cardSelect = document.createElement('select');
                cardSelect.className = 'input-card';
                
                // Add default option
                option = document.createElement('option');
                option.value = '';
                option.textContent = '卡';
                cardSelect.appendChild(option);
                
                // Add card rank options
                CONFIG.CARD_RANKS.forEach(rank => {
                    option = document.createElement('option');
                    option.value = rank;
                    option.textContent = rank;
                    cardSelect.appendChild(option);
                });
                
                // Card suit select
                const suitSelect = document.createElement('select');
                suitSelect.className = 'input-suit';
                
                // Add suit options
                Object.entries(CONFIG.SUITS).forEach(([suit, emoji]) => {
                    option = document.createElement('option');
                    option.value = suit;
                    option.textContent = emoji;
                    suitSelect.appendChild(option);
                });
                
                // 將卡和花色添加到卡對中
                cardPair.appendChild(cardSelect);
                cardPair.appendChild(suitSelect);
                
                // 將卡對添加到容器中
                cardContainer.appendChild(cardPair);
            }
            
            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-action';
            deleteButton.textContent = 'x';
            deleteButton.setAttribute('aria-label', '刪除對手');
            
            // Add position select first
            opponentDiv.appendChild(positionSelect);
            opponentDiv.appendChild(cardContainer);
            opponentDiv.appendChild(deleteButton);
            
            // Highlight newly added opponent
            opponentDiv.classList.add('newly-added');
            setTimeout(() => {
                opponentDiv.classList.remove('newly-added');
            }, 1000);
            
            fragment.appendChild(opponentDiv);
            DOM.opponentsContainer.appendChild(fragment);
            
            // Focus on the position select
            setTimeout(() => {
                positionSelect.focus();
            }, 0);
            
            return opponentDiv;
        },
        
        // Show flash message with output section flash effect
        showFlashMessage: function(message) {
            // 設置消息文本
            DOM.flashMessage.textContent = message;
            
            // 清除可能的現有動畫和計時器
            clearTimeout(window.flashMessageTimer);
            
            // 將flash message放置在output區域內並顯示
            DOM.flashMessage.style.display = 'block';
            DOM.flashMessage.classList.add('flash-animation');
            
            // 同時給輸出文本區添加閃爍效果
            DOM.outputText.classList.add('output-flash');
            
            // 設定淡出效果及清除動畫類
            window.flashMessageTimer = setTimeout(() => {
                DOM.flashMessage.style.display = 'none';
                DOM.flashMessage.classList.remove('flash-animation');
                DOM.outputText.classList.remove('output-flash');
            }, 1200); // 與動畫時長匹配
        },
        
        // Check if game info and hero info are filled to proceed to preflop
        checkInitialInfoComplete: function() {
            // 檢查Game Info，包括新增的賽制選擇器
            const blindsComplete = Array.from(DOM.blindsInputs).some(input => input.value.trim() !== '');
            
            if (blindsComplete) {
                DOM.preflopStage.classList.add('active');
                stageState.preflop = true;
                DOM.sectionOutput.classList.add('active');
            }
        },
        
        // Check if preflop has actions to proceed to flop
        checkPreflopComplete: function() {
            if (!stageState.preflop) return false;
            
            const preflopActions = DOM.preflopStage.querySelectorAll('.container-actions .action');
            if (preflopActions.length > 0) {
                DOM.flopStage.classList.add('active');
                stageState.flop = true;
                return true;
            }
            return false;
        },
        
        // Check if flop has community cards to proceed to turn
        checkFlopComplete: function() {
            if (!stageState.flop) return false;
            
            const flopCardInputs = DOM.flopStage.querySelectorAll('.input-card');
            const hasCards = Array.from(flopCardInputs).some(select => select.value.trim() !== '');
            
            if (hasCards) {
                DOM.turnStage.classList.add('active');
                stageState.turn = true;
                return true;
            }
            return false;
        },
        
        // Check if turn has community cards to proceed to river
        checkTurnComplete: function() {
            if (!stageState.turn) return false;
            
            const turnCardInputs = DOM.turnStage.querySelectorAll('.input-card');
            const hasCards = Array.from(turnCardInputs).some(select => select.value.trim() !== '');
            
            if (hasCards) {
                DOM.riverStage.classList.add('active');
                stageState.river = true;
                return true;
            }
            return false;
        },
        
        // Check if river is complete to show opponents section
        checkRiverComplete: function() {
            if (!stageState.river) return false;
            
            const riverCardInputs = DOM.riverStage.querySelectorAll('.input-card');
            const hasCards = Array.from(riverCardInputs).some(select => select.value.trim() !== '');
            
            if (hasCards) {
                DOM.sectionOpponents.classList.add('active');
                stageState.opponents = true;
                return true;
            }
            return false;
        },
        
        // Main function to check and proceed stages
        checkStageProceed: function() {
            UI.checkInitialInfoComplete();
            UI.checkPreflopComplete();
            UI.checkFlopComplete();
            UI.checkTurnComplete();
            UI.checkRiverComplete();
        },
        
        // Scroll to newly added element or focused element
        scrollToElement: function(element) {
            if (!element) return;
            
            // Get element position
            const rect = element.getBoundingClientRect();
            const isVisible = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
            
            if (!isVisible) {
                // Scroll with a small offset for better visibility
                window.scrollTo({
                    top: window.scrollY + rect.top - 100,
                    behavior: 'smooth'
                });
            }
        }
    };
    
    // Data Module: Handles data processing and formatting
    const Data = {
        // Get card string from input elements
        getCardString: function(inputElements) {
            let cardString = '';
            for (let i = 0; i < inputElements.length; i += 2) {
                const cardValue = inputElements[i].value;
                const suitValue = inputElements[i + 1].value;
                
                if (cardValue) {
                    const suitEmoji = CONFIG.SUITS[suitValue] || suitValue;
                    cardString += cardValue + suitEmoji + ' ';
                }
            }
            return cardString.trim();
        },
        
        // Generate output text based on current form state
        generateOutputText: function() {
            const gameFormat = DOM.blindsInputs[0].value;
            const playerNum = DOM.blindsInputs[1].value;
            const smallBlind = DOM.blindsInputs[2].value;
            const bigBlind = DOM.blindsInputs[3].value;
            const ante = DOM.blindsInputs[4].value;
            
            let outputText = ``;
            
            if (gameFormat) {
                outputText += `${gameFormat} `;
            }
            
            outputText += `${playerNum}人 ${smallBlind}/${bigBlind}`;
            
            if (ante && ante.trim() !== "") {
                outputText += ` (${ante})\n`;
            } else {
                outputText += ` (No Ante)\n`;
            }
            
            // Hero info - 只有當Hero資訊有填寫時才添加
            const heroPosition = DOM.heroPosition.value;
            const heroCards = Data.getCardString(DOM.heroCards);
            const heroStack = DOM.heroStack.value;
            
            if (heroPosition || heroCards || heroStack) {
                outputText += '我: ';
                if (heroPosition) outputText += heroPosition + ' ';
                if (heroCards) outputText += heroCards;
                if (heroStack) outputText += ', 碼量: ' + heroStack;
                outputText += '\n';
            }
            
            outputText += '\n'; // 添加空行作為分隔
            
            // Process each stage (Preflop, Flop, Turn, River)
            DOM.stages.forEach(stage => {
                let stageText = stage.querySelector('h2').textContent + ": ";
                
                // Append community cards for Flop, Turn, and River
                if (stage.classList.contains('flop') || 
                    stage.classList.contains('turn') || 
                    stage.classList.contains('river')) {
                    const cardInputs = stage.querySelectorAll('.input-card, .input-suit');
                    stageText += Data.getCardString(cardInputs) + '\n';
                } else if (stage.classList.contains('preflop')) {
                    stageText += '\n';
                }
                
                // Process actions
                const actions = stage.querySelectorAll('.container-actions div');
                actions.forEach(action => {
                    const position = action.querySelector('.input-position').value;
                    const actionType = action.querySelector('.input-action').value;
                    const amount = action.querySelector('input[type="number"]').value;
                    stageText += `${position} ${actionType} ${amount}\n`;
                });
                outputText += stageText.trim() + '\n.\n';
            });
            
            // Process opponents
            const opponents = document.querySelectorAll('.container-opponents .action');
            if (opponents.length > 0) {
                outputText += '\n'; // 新增空行作為對手資訊的分隔
                opponents.forEach(opponent => {
                    const position = opponent.querySelector('.input-position').value;
                    
                    // 尋找卡片對並收集卡片和花色值
                    const cardPairs = opponent.querySelectorAll('.card-pair');
                    let cards = '';
                    
                    // 如果找到卡片對
                    if (cardPairs.length > 0) {
                        cardPairs.forEach(cardPair => {
                            const cardSelects = cardPair.querySelectorAll('.input-card, .input-suit');
                            cards += Data.getCardString(cardSelects) + ' ';
                        });
                    } else {
                        // 備選方案：直接尋找卡片和花色輸入
                        const cardInputs = opponent.querySelectorAll('.input-card, .input-suit');
                        cards = Data.getCardString(cardInputs);
                    }
                    
                    outputText += `${position} ${cards.trim()}\n`;
                });
            }
            
            return outputText.trim();
        }
    };
    
    // Events Module: Handles event listeners and delegated events
    const Events = {
        // Initialize event listeners
        init: function() {
            // Event delegation for form inputs
            document.body.addEventListener('input', function(event) {
                const target = event.target;
                if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
                    UI.checkStageProceed();
                    debouncedUpdateOutput();
                }
            });
            
            // Event delegation for keyboard navigation
            document.body.addEventListener('keydown', Events.handleKeyNavigation);
            
            // Add action buttons
            DOM.addActionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const actionElement = UI.createActionElement(this.parentElement);
                    UI.checkStageProceed();
                    debouncedUpdateOutput();
                    UI.scrollToElement(actionElement);
                });
            });
            
            // Add opponent button
            DOM.addOpponentButton.addEventListener('click', function() {
                const opponentElement = UI.createOpponentElement();
                UI.checkStageProceed();
                debouncedUpdateOutput();
                UI.scrollToElement(opponentElement);
            });
            
            // Event delegation for delete buttons
            document.body.addEventListener('click', function(event) {
                if (event.target.classList.contains('delete-action')) {
                    const actionDiv = event.target.closest('.action');
                    if (actionDiv) {
                        actionDiv.remove();
                        UI.checkStageProceed();
                        debouncedUpdateOutput();
                    }
                }
            });
            
            // Copy button with modern interaction
            DOM.copyButton.addEventListener('click', function(e) {
                // 添加點擊動畫效果
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // 設置波紋效果的起始位置
                this.style.setProperty('--ripple-x', x + 'px');
                this.style.setProperty('--ripple-y', y + 'px');
                
                // 添加波紋類
                this.classList.add('btn-ripple');
                
                // 移除波紋類（為下次點擊做準備）
                setTimeout(() => {
                    this.classList.remove('btn-ripple');
                }, 600);
                
                // 複製文本
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(DOM.outputText.value)
                        .then(() => {
                            UI.showFlashMessage('Copied!');
                        })
                        .catch(() => {
                            // Fallback to the old method if Clipboard API fails
                            DOM.outputText.select();
                            document.execCommand('copy');
                            UI.showFlashMessage('Copied!');
                        });
                } else {
                    // Fallback for browsers that don't support Clipboard API
                    DOM.outputText.select();
                    document.execCommand('copy');
                    UI.showFlashMessage('Copied!');
                }
            });
            
            // Add focus handling for better mobile UX
            document.body.addEventListener('focus', function(event) {
                if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
                    UI.scrollToElement(event.target);
                }
            }, true);
            
            // Initialize FastClick to reduce touch delay on mobile
            Events.initFastClick();
        },
        
        // Initialize FastClick to improve mobile responsiveness
        initFastClick: function() {
            if ('addEventListener' in document) {
                document.addEventListener('DOMContentLoaded', function() {
                    // This creates a polyfill to reduce tap delay on mobile without needing the FastClick library
                    if ('touchAction' in document.body.style) {
                        document.body.style.touchAction = 'manipulation';
                    }
                });
            }
        },
        
        // Handle keyboard navigation
        handleKeyNavigation: function(event) {
            // Enter key navigation
            if (event.key === "Enter") {
                const formElements = Array.from(document.querySelectorAll('input, select'));
                const currentIdx = formElements.indexOf(document.activeElement);
                if (currentIdx > -1 && currentIdx < formElements.length - 1) {
                    formElements[currentIdx + 1].focus();
                    event.preventDefault();
                }
            }
            
            // Implement keyboard shortcuts
            if (event.ctrlKey || event.metaKey) {
                // Ctrl+C or Cmd+C for Copy
                if (event.key === 'c' && document.activeElement !== DOM.outputText) {
                    DOM.copyButton.click();
                    event.preventDefault();
                }
            }
        }
    };
    
    // Function to update output text
    function updateOutput() {
        DOM.outputText.textContent = Data.generateOutputText();
    }
    
    // Create debounced version of updateOutput
    const debouncedUpdateOutput = debounce(updateOutput, CONFIG.DEBOUNCE_DELAY);
    
    // Public init function
    function init() {
        cacheDOMElements();
        Events.init();
        updateOutput(); // Initial render
    }
    
    // Return public API
    return {
        init: init
    };
})();

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    PokerHandApp.init();
});
