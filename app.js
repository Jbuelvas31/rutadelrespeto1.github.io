/* ==========================================================================
   MISIÓN: RUTA DEL RESPETO - APP LOGIC & GAMIFICATION ENGINE
   Ministerio del Interior de Colombia
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Synthesizer (Web Audio API) ---
    let soundEnabled = true;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
        if (!soundEnabled || !audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'warning') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(220, now + 0.15);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'fanfare') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const subOsc = audioCtx.createOscillator();
                const subGain = audioCtx.createGain();
                subOsc.connect(subGain);
                subGain.connect(audioCtx.destination);
                subOsc.type = 'triangle';
                subOsc.frequency.setValueAtTime(freq, now + idx * 0.12);
                subGain.gain.setValueAtTime(0.2, now + idx * 0.12);
                subGain.gain.linearRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
                subOsc.start(now + idx * 0.12);
                subOsc.stop(now + idx * 0.12 + 0.3);
            });
        }
    }

    // Sound toggle UI handler
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const soundIcon = soundToggleBtn.querySelector('.sound-icon');
        const soundText = soundToggleBtn.querySelector('.sound-text');

        if (soundEnabled) {
            soundIcon.textContent = '🔊';
            soundText.textContent = 'Sonido ON';
            playSound('click');
        } else {
            soundIcon.textContent = '🔇';
            soundText.textContent = 'Sonido OFF';
        }
    });

    // --- State Management ---
    let currentStep = 0; // 0: Intro, 1: C1, 2: C2, 3: C3, 4: C4, 5: Final

    // Screens elements
    const screens = {
        0: document.getElementById('screenIntro'),
        1: document.getElementById('screenChallenge1'),
        2: document.getElementById('screenChallenge2'),
        3: document.getElementById('screenChallenge3'),
        4: document.getElementById('screenChallenge4'),
        5: document.getElementById('screenFinal')
    };

    const progressNav = document.getElementById('progressNav');
    const progressBarFill = document.getElementById('progressBarFill');
    const stepCounter = document.getElementById('stepCounter');

    function updateProgressUI(step) {
        if (step >= 1 && step <= 4) {
            progressNav.classList.remove('hidden');
            stepCounter.textContent = `Desafío ${step} / 4`;
            const fillPercentage = (step / 4) * 100;
            progressBarFill.style.width = `${fillPercentage}%`;

            // Update step nodes
            for (let i = 1; i <= 4; i++) {
                const node = document.getElementById(`node-${i}`);
                if (node) {
                    node.classList.remove('active', 'completed');
                    if (i < step) {
                        node.classList.add('completed');
                    } else if (i === step) {
                        node.classList.add('active');
                    }
                }
            }
        } else {
            progressNav.classList.add('hidden');
        }
    }

    function goToScreen(stepNumber) {
        playSound('click');
        currentStep = stepNumber;

        Object.keys(screens).forEach(key => {
            if (parseInt(key) === stepNumber) {
                screens[key].classList.remove('hidden');
                screens[key].classList.add('screen-active');
            } else {
                screens[key].classList.add('hidden');
                screens[key].classList.remove('screen-active');
            }
        });

        updateProgressUI(stepNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (stepNumber === 5) {
            playSound('fanfare');
            startConfetti();
        }
    }

    // --- Intro Screen ---
    document.getElementById('btnStartMission').addEventListener('click', () => {
        goToScreen(1);
        initChallenge1();
    });

    // ==========================================================================
    // DESAFÍO 1: EL SEMÁFORO LOGIC
    // ==========================================================================
    const c1Situations = [
        {
            id: 1,
            text: "Respetar las opiniones y diferencias de los demás.",
            correct: "GREEN",
            correctLabel: "🟢 VERDE - Conducta respetuosa",
            feedback: "Respetar las opiniones y diferencias de los demás es la base fundamental de un clima laboral inclusivo, ético y saludable."
        },
        {
            id: 2,
            text: "Hacer comentarios sobre el cuerpo de una compañera y decir: ‘solo estoy bromeando’.",
            correct: "YELLOW",
            correctLabel: "🟡 AMARILLO - Señal de alerta",
            feedback: "Los comentarios no solicitados sobre la apariencia física o cuerpo de las personas generan incomodidad y pueden constituir microagresiones. No deben justificarse como bromas."
        },
        {
            id: 3,
            text: "Condicionar una oportunidad laboral a aceptar una invitación de carácter sexual.",
            correct: "RED",
            correctLabel: "🔴 ROJO - Conducta de acoso y violencia",
            feedback: "Esta situación constituye chantaje y acoso sexual laboral. Es una violación directa de los derechos laborales y debe ser reportada inmediatamente."
        },
        {
            id: 4,
            text: "Burlarse de una persona por su discapacidad, origen étnico u orientación sexual.",
            correct: "RED",
            correctLabel: "🔴 ROJO - Discriminación y hostigamiento",
            feedback: "La burla y la estigmatización por etnia, discapacidad u orientación sexual atentan contra la dignidad y constituyen actos discriminatorios inaceptables."
        },
        {
            id: 5,
            text: "Escuchar a un compañero sin juzgarlo cuando expresa una situación que le genera incomodidad.",
            correct: "GREEN",
            correctLabel: "🟢 VERDE - Conducta respetuosa y empática",
            feedback: "La escucha activa y empática sin prejuicios es clave para prevenir situaciones de riesgo y hacer que los compañeros se sientan seguros."
        }
    ];

    let c1CurrentIndex = 0;

    function initChallenge1() {
        c1CurrentIndex = 0;
        document.getElementById('c1TotalCount').textContent = c1Situations.length;
        renderC1Dots();
        loadC1Situation(c1CurrentIndex);
        document.getElementById('c1Feedback').classList.add('hidden');
        document.getElementById('c1KeyMessage').classList.add('hidden');
        enableC1Buttons(true);
    }

    function renderC1Dots() {
        const dotsContainer = document.getElementById('c1Dots');
        dotsContainer.innerHTML = '';
        c1Situations.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `dot-step ${idx === c1CurrentIndex ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });
    }

    function loadC1Situation(index) {
        document.getElementById('c1CurrentIndex').textContent = index + 1;
        document.getElementById('c1SituationText').textContent = `"${c1Situations[index].text}"`;
        document.getElementById('c1Feedback').classList.add('hidden');

        // Reset button selection visual states
        document.querySelectorAll('.traffic-btn').forEach(btn => {
            btn.classList.remove('selected-GREEN', 'selected-YELLOW', 'selected-RED');
        });

        renderC1Dots();
        enableC1Buttons(true);
    }

    function enableC1Buttons(enable) {
        document.querySelectorAll('.traffic-btn').forEach(btn => {
            btn.disabled = !enable;
            btn.style.opacity = enable ? '1' : '0.6';
        });
    }

    // Traffic light button click handler
    document.querySelectorAll('.traffic-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedColor = btn.getAttribute('data-color');
            checkC1Answer(selectedColor, btn);
        });
    });

    function checkC1Answer(selectedColor, btnElement) {
        const currentSit = c1Situations[c1CurrentIndex];
        const isCorrect = (selectedColor === currentSit.correct);

        enableC1Buttons(false);
        btnElement.classList.add(`selected-${selectedColor}`);

        const feedbackBox = document.getElementById('c1Feedback');
        const fbTitle = document.getElementById('c1FeedbackTitle');
        const fbBody = document.getElementById('c1FeedbackBody');
        const fbIcon = document.getElementById('c1FeedbackIcon');
        const nextSubBtn = document.getElementById('c1NextSubBtn');

        feedbackBox.classList.remove('hidden', 'incorrect');

        if (isCorrect) {
            playSound('success');
            fbIcon.textContent = '✅';
            fbTitle.textContent = `¡Excelente! Clasificación correcta: ${currentSit.correctLabel}`;
            fbBody.textContent = currentSit.feedback;
        } else {
            playSound('warning');
            feedbackBox.classList.add('incorrect');
            fbIcon.textContent = '💡';
            fbTitle.textContent = `Atención: La clasificación adecuada es ${currentSit.correctLabel}`;
            fbBody.textContent = `${currentSit.feedback} Recuérdalo para el ejercicio profesional cotidiano.`;
        }

        // Check if last situation
        if (c1CurrentIndex === c1Situations.length - 1) {
            nextSubBtn.textContent = 'Ver Mensaje Clave ➔';
        } else {
            nextSubBtn.textContent = 'Siguiente Situación ➔';
        }
    }

    document.getElementById('c1NextSubBtn').addEventListener('click', () => {
        playSound('click');
        c1CurrentIndex++;

        if (c1CurrentIndex < c1Situations.length) {
            loadC1Situation(c1CurrentIndex);
        } else {
            // End of Challenge 1 -> Show Key Message
            document.getElementById('c1Feedback').classList.add('hidden');
            document.getElementById('c1KeyMessage').classList.remove('hidden');
            playSound('success');
        }
    });

    document.getElementById('c1FinishBtn').addEventListener('click', () => {
        goToScreen(2);
        initChallenge2();
    });

    // ==========================================================================
    // DESAFÍO 2: DETECTA LA SEÑAL LOGIC
    // ==========================================================================
    function initChallenge2() {
        const optionsList = document.getElementById('c2OptionsList');
        const feedbackBox = document.getElementById('c2Feedback');
        feedbackBox.classList.add('hidden');

        optionsList.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected-correct', 'selected-wrong');
            btn.disabled = false;
        });
    }

    document.querySelectorAll('#c2OptionsList .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedOpt = btn.getAttribute('data-option');
            const optionsList = document.getElementById('c2OptionsList');
            const feedbackBox = document.getElementById('c2Feedback');

            optionsList.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

            if (selectedOpt === 'C') {
                playSound('success');
                btn.classList.add('selected-correct');
                feedbackBox.classList.remove('hidden');
            } else {
                playSound('warning');
                btn.classList.add('selected-wrong');
                // Auto highlight option C as correct
                const correctBtn = optionsList.querySelector('[data-option="C"]');
                correctBtn.classList.add('selected-correct');
                feedbackBox.classList.remove('hidden');
            }
        });
    });

    document.getElementById('c2FinishBtn').addEventListener('click', () => {
        goToScreen(3);
        initChallenge3();
    });

    // ==========================================================================
    // DESAFÍO 3: ENCUENTRA LA RUTA (DRAG & DROP / MATCHING LOGIC)
    // ==========================================================================
    let c3MatchesCount = 0;
    let selectedDragItem = null;

    function initChallenge3() {
        c3MatchesCount = 0;
        selectedDragItem = null;
        document.getElementById('c3ChannelBlock').classList.add('hidden');

        // Reset drag items and drop zones
        const dragItems = document.querySelectorAll('#c3SituationsCol .drag-item');
        const dropZones = document.querySelectorAll('#c3RoutesCol .drop-zone');

        dragItems.forEach(item => {
            item.classList.remove('matched', 'selected-for-match');
            item.setAttribute('draggable', 'true');
        });

        dropZones.forEach(zone => {
            zone.classList.remove('matched-success', 'drag-over');
            const placeholder = zone.querySelector('.zone-placeholder');
            if (placeholder) {
                placeholder.textContent = 'Selecciona o suelta aquí la situación correspondiente';
                placeholder.style.display = 'block';
            }
        });
    }

    // Touch & Click tap-to-match fallback
    document.querySelectorAll('#c3SituationsCol .drag-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('matched')) return;

            document.querySelectorAll('#c3SituationsCol .drag-item').forEach(i => i.classList.remove('selected-for-match'));
            selectedDragItem = item;
            item.classList.add('selected-for-match');
            playSound('click');
        });

        // HTML5 Drag events
        item.addEventListener('dragstart', (e) => {
            if (item.classList.contains('matched')) return;
            selectedDragItem = item;
            e.dataTransfer.setData('text/plain', item.getAttribute('data-id'));
            item.classList.add('selected-for-match');
        });
    });

    document.querySelectorAll('#c3RoutesCol .drop-zone').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const itemId = e.dataTransfer.getData('text/plain') || (selectedDragItem ? selectedDragItem.getAttribute('data-id') : null);
            attemptMatch(itemId, zone);
        });

        zone.addEventListener('click', () => {
            if (selectedDragItem && !zone.classList.contains('matched-success')) {
                const itemId = selectedDragItem.getAttribute('data-id');
                attemptMatch(itemId, zone);
            }
        });
    });

    function attemptMatch(itemId, targetZone) {
        if (!itemId || !targetZone) return;
        const targetId = targetZone.getAttribute('data-target');

        if (itemId === targetId) {
            playSound('success');
            targetZone.classList.add('matched-success');
            
            const matchedItem = document.querySelector(`#c3SituationsCol .drag-item[data-id="${itemId}"]`);
            if (matchedItem) {
                matchedItem.classList.add('matched');
                matchedItem.classList.remove('selected-for-match');
            }

            const placeholder = targetZone.querySelector('.zone-placeholder');
            if (placeholder) {
                placeholder.textContent = '✅ ¡Ruta vinculada correctamente!';
                placeholder.style.color = '#10b981';
            }

            c3MatchesCount++;
            selectedDragItem = null;

            if (c3MatchesCount === 4) {
                playSound('fanfare');
                document.getElementById('c3ChannelBlock').classList.remove('hidden');
            }
        } else {
            playSound('warning');
            targetZone.style.borderColor = '#ef4444';
            setTimeout(() => {
                targetZone.style.borderColor = '';
            }, 600);
        }
    }

    document.getElementById('c3FinishBtn').addEventListener('click', () => {
        goToScreen(4);
        initChallenge4();
    });

    // ==========================================================================
    // DESAFÍO 4: PONTE EN SUS ZAPATOS LOGIC
    // ==========================================================================
    function initChallenge4() {
        const optionsList = document.getElementById('c4OptionsList');
        const feedbackBox = document.getElementById('c4Feedback');
        feedbackBox.classList.add('hidden');

        optionsList.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected-correct', 'selected-wrong');
            btn.disabled = false;
        });
    }

    document.querySelectorAll('#c4OptionsList .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedOpt = btn.getAttribute('data-option');
            const optionsList = document.getElementById('c4OptionsList');
            const feedbackBox = document.getElementById('c4Feedback');

            optionsList.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

            if (selectedOpt === 'C') {
                playSound('success');
                btn.classList.add('selected-correct');
                feedbackBox.classList.remove('hidden');
            } else {
                playSound('warning');
                btn.classList.add('selected-wrong');
                const correctBtn = optionsList.querySelector('[data-option="C"]');
                correctBtn.classList.add('selected-correct');
                feedbackBox.classList.remove('hidden');
            }
        });
    });

    document.getElementById('c4FinishBtn').addEventListener('click', () => {
        goToScreen(5);
    });

    // ==========================================================================
    // PANTALLA FINAL & CERTIFICATE GENERATOR
    // ==========================================================================
    document.getElementById('btnGenerateCert').addEventListener('click', () => {
        const nameInput = document.getElementById('participantName');
        const certPreview = document.getElementById('certPreview');
        const certNameDisplay = document.getElementById('certNameDisplay');

        const userVal = nameInput.value.trim();
        if (userVal) {
            certNameDisplay.textContent = userVal;
            certPreview.classList.remove('hidden');
            playSound('success');
        } else {
            alert('Por favor escribe tu nombre y apellido para generar la constancia.');
        }
    });

    document.getElementById('btnPrintCert').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('btnRestartMission').addEventListener('click', () => {
        goToScreen(0);
    });

    // --- Lightweight Canvas Confetti Engine ---
    function startConfetti() {
        const canvas = document.getElementById('confettiCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const confettiCount = 80;
        const particles = [];
        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];

        for (let i = 0; i < confettiCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                rotation: Math.random() * 360,
                rotSpeed: Math.random() * 6 - 3
            });
        }

        let animationFrame;
        let opacity = 1;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();

                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
            });

            animationFrame = requestAnimationFrame(animate);
        }

        animate();

        setTimeout(() => {
            cancelAnimationFrame(animationFrame);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 6000);
    }
});
