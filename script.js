const ANSWERS = [
  "gonne",
  "magliette",
  "maglioni",
  "cappotti",
  "accessori",
  "camicia",
  "pantaloni",
  "vestito",
  "giacca",
  "camicetta",
];

const STORAGE_KEY = "haohao-facciamo-shopping-v2";
const form = document.querySelector("#dialogue-form");
const inputs = [...form.querySelectorAll("input[type='text']")];
const checkButton = document.querySelector("#check-answers");
const feedback = document.querySelector("#feedback");
const completion = document.querySelector("#completion");
const restartButton = document.querySelector("#restart");
const audio = document.querySelector("#dialogue-audio");
const audioSource = document.querySelector("#audio-source");
const audioStatus = document.querySelector("#audio-status");

function normalizeAnswer(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("it-IT")
    .replace(/[.,!?;:，。！？；：]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ answers: inputs.map((input) => input.value) }),
    );
  } catch {
    // The exercise remains usable when storage is unavailable.
  }
}

function restoreProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved?.answers)) return;
    inputs.forEach((input, index) => {
      input.value = saved.answers[index] ?? "";
    });
  } catch {
    // Ignore unavailable or invalid saved data.
  }
}

function clearFieldState(input) {
  input.classList.remove("is-correct", "is-wrong");
  input.removeAttribute("aria-invalid");
}

function checkAnswers() {
  let correctCount = 0;
  let firstWrong = null;

  inputs.forEach((input, index) => {
    const isCorrect = normalizeAnswer(input.value) === ANSWERS[index];
    input.classList.toggle("is-correct", isCorrect);
    input.classList.toggle("is-wrong", !isCorrect);
    input.setAttribute("aria-invalid", String(!isCorrect));

    if (isCorrect) {
      correctCount += 1;
    } else if (!firstWrong) {
      firstWrong = input;
    }
  });

  saveProgress();

  if (correctCount === ANSWERS.length) {
    feedback.textContent = "Tutto corretto! Hai completato il dialogo.";
    feedback.className = "feedback is-success";
    completion.hidden = false;
    completion.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }

  completion.hidden = true;
  feedback.textContent = "Ci sono ancora alcune parole da rivedere. Correggi i campi evidenziati e controlla di nuovo.";
  feedback.className = "feedback is-wrong";
  firstWrong?.focus({ preventScroll: true });
  firstWrong?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function restartExercise() {
  form.reset();
  inputs.forEach(clearFieldState);
  feedback.textContent = "";
  feedback.className = "feedback";
  completion.hidden = true;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The visible reset still succeeds when storage is unavailable.
  }

  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    // Some browsers disallow seeking before audio metadata is available.
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  inputs[0].focus({ preventScroll: true });
}

form.addEventListener("submit", (event) => event.preventDefault());

form.addEventListener("keydown", (event) => {
  if (event.key === "Enter") event.preventDefault();
});

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    clearFieldState(input);
    feedback.textContent = "";
    feedback.className = "feedback";
    completion.hidden = true;
    saveProgress();
  });
});

audio.addEventListener("error", () => {
  audioStatus.hidden = false;
});

audioSource.addEventListener("error", () => {
  audioStatus.hidden = false;
});

audio.addEventListener("loadedmetadata", () => {
  audioStatus.hidden = true;
});

checkButton.addEventListener("click", checkAnswers);
restartButton.addEventListener("click", restartExercise);

restoreProgress();
