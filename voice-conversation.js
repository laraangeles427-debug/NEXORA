/* NEXORA: conversación accesible continua.
   El usuario activa este modo con un gesto inicial y concede permiso al micrófono.
   La compatibilidad depende del navegador; nunca se simula una escucha si falla. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const toggle = $("voiceModeToggle");
  const listen = $("nexoraListen");
  const question = $("nexoraQuestion");
  const ask = $("nexoraAsk");
  const answer = $("nexoraAnswer");
  const status = $("voiceStatus");
  if (!toggle || !listen || !question || !ask || !answer || !status) return;

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let active = false, listening = false, waitingAnswer = false, recognizer = null;
  let restartTimer = null, lastQuestion = "";
  const storedOn = () => { try { return localStorage.getItem("nexora-voice-mode") === "on"; } catch (_) { return false; } };

  function say(text, done) {
    if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) {
      status.textContent = "La voz no está disponible en este navegador.";
      if (done) done();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text || ""));
    utterance.lang = "es-EC";
    utterance.rate = 0.9;
    utterance.onend = () => { if (active && done) done(); };
    utterance.onerror = () => { if (active && done) done(); };
    window.speechSynthesis.speak(utterance);
  }

  function scheduleListening(delay = 500) {
    clearTimeout(restartTimer);
    if (!active || waitingAnswer || !Recognition) return;
    restartTimer = setTimeout(startListening, delay);
  }

  function startListening() {
    if (!active || waitingAnswer || listening || !Recognition) return;
    try {
      recognizer = new Recognition();
      recognizer.lang = "es-EC";
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.maxAlternatives = 1;
      recognizer.onstart = () => {
        listening = true;
        status.textContent = "NEXORA te escucha. Puedes hablar.";
        listen.textContent = "🎙️ Conversación activa";
        listen.setAttribute("aria-pressed", "true");
      };
      recognizer.onresult = event => {
        const transcript = (event.results?.[0]?.[0]?.transcript || "").trim();
        if (!transcript) return;
        lastQuestion = transcript;
        question.value = transcript;
        waitingAnswer = true;
        status.textContent = "He escuchado tu pregunta. Estoy preparando la respuesta.";
        say("He escuchado tu pregunta.");
        ask.click();
      };
      recognizer.onerror = event => {
        listening = false;
        if (!active) return;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          active = false;
          status.textContent = "No tengo permiso para usar el micrófono. Autorízalo en el navegador y vuelve a activar el modo de conversación.";
          listen.textContent = "🎙️ Iniciar conversación por voz";
          listen.setAttribute("aria-pressed", "false");
        } else if (event.error !== "aborted" && event.error !== "no-speech") {
          status.textContent = "No pude reconocer la voz. Vuelve a hablar después de la indicación.";
        }
      };
      recognizer.onend = () => {
        listening = false;
        if (active && !waitingAnswer) scheduleListening(650);
      };
      recognizer.start();
    } catch (_) {
      listening = false;
      status.textContent = "No se pudo iniciar el micrófono. Comprueba el permiso del navegador.";
    }
  }

  function stopListening() {
    clearTimeout(restartTimer);
    active = false;
    listening = false;
    if (recognizer) {
      try { recognizer.onend = null; recognizer.stop(); } catch (_) {}
    }
    recognizer = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    listen.textContent = "🎙️ Iniciar conversación por voz";
    listen.setAttribute("aria-pressed", "false");
  }

  function startConversation() {
    if (!Recognition) {
      active = false;
      status.textContent = "Este navegador no admite reconocimiento de voz. Prueba Chrome actualizado o usa el dictado del dispositivo.";
      say(status.textContent);
      return;
    }
    active = true;
    waitingAnswer = false;
    status.textContent = "Activando conversación. Te escucharé después de la bienvenida.";
    say("Hola, soy NEXORA. El modo de conversación está activado. Puedes hacer tu pregunta después de la señal.", () => scheduleListening(350));
  }

  /* Sustituye el comportamiento de un solo clic por una conversación continua. */
  listen.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (active) {
      stopListening();
      status.textContent = "Conversación pausada.";
      say("Conversación pausada.");
      return;
    }
    startConversation();
  }, true);

  /* Un único gesto activa el modo accesible y da inicio al micrófono. */
  toggle.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (storedOn()) {
      try { localStorage.setItem("nexora-voice-mode", "off"); } catch (_) {}
      stopListening();
      toggle.textContent = "Activar modo de voz";
      toggle.setAttribute("aria-pressed", "false");
      status.textContent = "Modo de voz desactivado.";
      say("Modo de voz desactivado.");
    } else {
      try { localStorage.setItem("nexora-voice-mode", "on"); } catch (_) {}
      toggle.textContent = "Desactivar modo de voz";
      toggle.setAttribute("aria-pressed", "true");
      const panel = $("voicePanel");
      if (panel) panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      startConversation();
    }
  }, true);

  /* Cuando la IA termina, leer la respuesta y volver a abrir el micrófono. */
  const originalAsk = ask.onclick;
  ask.addEventListener("click", () => {
    if (!active) return;
    waitingAnswer = true;
    const observedQuestion = question.value.trim();
    const before = answer.textContent;
    let attempts = 0;
    const poll = () => {
      if (!active) return;
      attempts++;
      const text = answer.textContent.trim();
      const loading = /preparando tu respuesta/i.test(text);
      if (text && !loading && (text !== before || attempts > 2)) {
        if (/no pude conectar|no se pudo completar/i.test(text)) {
          waitingAnswer = false;
          say("No pude conectar con NEXORA. Comprueba la conexión a internet.", () => scheduleListening(700));
        } else {
          say(text, () => {
            waitingAnswer = false;
            status.textContent = "Puedes continuar hablando. NEXORA te escucha.";
            scheduleListening(450);
          });
        }
      } else if (attempts < 120) {
        setTimeout(poll, 500);
      } else {
        waitingAnswer = false;
        say("La respuesta está tardando. Puedes repetir tu pregunta.", () => scheduleListening(700));
      }
    };
    setTimeout(poll, 300);
  });

  if (!Recognition) {
    listen.textContent = "Micrófono no compatible";
    status.textContent = "La conversación por voz continua requiere un navegador compatible con reconocimiento de voz.";
  } else if (storedOn()) {
    toggle.textContent = "Desactivar modo de voz";
    toggle.setAttribute("aria-pressed", "true");
    status.textContent = "Modo de voz guardado. Si el micrófono no se inicia solo, activa la conversación con el botón de voz.";
  }
})();