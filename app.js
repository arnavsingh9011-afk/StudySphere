const $ = (id) => document.getElementById(id);
const STORE = "studysphere_v1";
const defaults = {streak:0,lastVisit:null,sessions:0,exam:null,cards:[],quizDate:null,quizDone:false};
let data = {...defaults};
try { data = {...defaults, ...JSON.parse(localStorage.getItem(STORE) || "{}")}; } catch {}
function save(){ localStorage.setItem(STORE, JSON.stringify(data)); }
function toast(message){ const el=$("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2400); }
function localDateKey(date=new Date()){ return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function updateStreak(){ const today=localDateKey(); if(data.lastVisit!==today){ const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1); data.streak=data.lastVisit===localDateKey(yesterday)?data.streak+1:1; data.lastVisit=today; save(); } renderStreak(); }
function renderStreak(){ $("streakNumber").textContent=`${data.streak} day${data.streak===1?"":"s"} streak`; $("overviewStreak").innerHTML=`${data.streak} <small>days</small>`; $("sessionCount").textContent=data.sessions; }
function go(view){ document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view")); $("view-"+view).classList.add("active-view"); document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view)); const label={overview:"Overview",focus:"Focus timer",calculators:"Calculators",countdown:"Exam countdown",flashcards:"Flashcards",quiz:"Daily quiz"}; $("crumb").textContent=label[view]; $("sidebar").classList.remove("open"); window.scrollTo({top:0,behavior:"smooth"}); }
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
const now=new Date(); $("todayLabel").textContent=now.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}); $("dateChip").textContent=now.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"}).toUpperCase(); $("year").textContent=now.getFullYear();
renderStreak();




// Focus timer with custom settings
const TIMER_STORAGE_KEY = "studysphere_custom_timer";

const defaultDurations = {
  Focus: 25,
  "Short break": 5,
  "Long break": 15
};

let customDurations = { ...defaultDurations };

try {
  const saved = JSON.parse(localStorage.getItem(TIMER_STORAGE_KEY));
  if (saved) {
    for (const mode of Object.keys(defaultDurations)) {
      const value = Number(saved[mode]);
      if (Number.isInteger(value) && value >= 1 &&
          value <= (mode === "Focus" ? 180 : 60)) {
        customDurations[mode] = value;
      }
    }
  }
} catch (error) {
  console.warn("Could not load timer settings:", error);
}

let timerSeconds = customDurations.Focus * 60;
let remaining = timerSeconds;
let timerInterval = null;
let timerRunning = false;
let currentMode = "Focus";

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function renderTimer() {
  $("timerDisplay").textContent = formatTime(remaining);

  const elapsed = timerSeconds - remaining;
  const deg = timerSeconds ? elapsed / timerSeconds * 360 : 0;

  $("timerRing").style.background =
    `conic-gradient(#83aaff ${deg}deg,#253650 ${deg}deg)`;

  $("timerStart").textContent =
    timerRunning ? "Pause session" : "Start session";

  $("timerCaption").textContent =
    timerRunning ? "Stay with the task" : "Time to concentrate";

  const foot = document.querySelector(".timer-foot span");
  if (foot) foot.textContent = `◷ ${customDurations[currentMode]} MINUTES`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  renderTimer();
}

function setMode(minutes, mode) {
  stopTimer();

  currentMode = mode;
  timerSeconds = minutes * 60;
  remaining = timerSeconds;

  $("timerMode").textContent = mode.toUpperCase() + " SESSION";

  document.querySelectorAll(".timer-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  renderTimer();
}

// Load saved values into the custom settings inputs
$("customFocus").value = customDurations.Focus;
$("customShort").value = customDurations["Short break"];
$("customLong").value = customDurations["Long break"];

// Save custom settings
$("saveCustomTimer").addEventListener("click", () => {
  const focus = Number($("customFocus").value);
  const shortBreak = Number($("customShort").value);
  const longBreak = Number($("customLong").value);

  if (
    !Number.isInteger(focus) || focus < 1 || focus > 180 ||
    !Number.isInteger(shortBreak) || shortBreak < 1 || shortBreak > 60 ||
    !Number.isInteger(longBreak) || longBreak < 1 || longBreak > 60
  ) {
    $("customTimerStatus").textContent =
      "Please enter valid durations within the allowed limits.";
    return;
  }

  customDurations = {
    Focus: focus,
    "Short break": shortBreak,
    "Long break": longBreak
  };

  localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(customDurations));

  document.querySelectorAll(".timer-tab").forEach(button => {
    button.dataset.minutes = customDurations[button.dataset.mode];
  });

  setMode(customDurations[currentMode], currentMode);

  $("customTimerStatus").textContent =
    "Settings saved successfully!";
});

// Timer mode buttons
document.querySelectorAll(".timer-tab").forEach(button => {
  button.addEventListener("click", () => {
    setMode(
      customDurations[button.dataset.mode],
      button.dataset.mode
    );
  });
});

// Start and pause
$("timerStart").addEventListener("click", () => {
  if (timerRunning) {
    stopTimer();
    return;
  }

  timerRunning = true;
  renderTimer();

  timerInterval = setInterval(() => {
    remaining--;
    renderTimer();

    if (remaining <= 0) {
      stopTimer();

      if (currentMode === "Focus") {
        data.sessions++;
        save();
        updateStreak();
        renderStreak();
        toast("Focus session complete. Great work!");
      } else {
        toast("Break complete. Ready to focus?");
      }
    }
  }, 1000);
});

// Reset
$("timerReset").addEventListener("click", () => {
  stopTimer();
  remaining = timerSeconds;
  renderTimer();
});

// Quick start
$("quickStartBtn").addEventListener("click", () => {
  const task = $("quickTask").value.trim();

  if (task) $("focusTask").value = task;

  go("focus");
  setMode(customDurations.Focus, "Focus");
  $("timerStart").click();
});

renderTimer();

// Percentage calculator
$("percentBtn").addEventListener("click",()=>{const v=Number($("percentValue").value),t=Number($("percentTotal").value);if($("percentValue").value===""||$("percentTotal").value===""||!Number.isFinite(v)||!Number.isFinite(t)||t===0){$("percentResult").textContent="Enter valid numbers. The total cannot be zero.";return;} $("percentResult").innerHTML=`<strong>${(v/t*100).toFixed(2)}%</strong> <span class="muted">(${v} out of ${t})</span>`;});
$("addGrade").addEventListener("click",()=>{if($("gradeRows").children.length>=12){toast("Maximum 12 subjects.");return;}const row=document.createElement("div");row.className="grade-row";row.innerHTML='<input type="text" placeholder="Subject" aria-label="Subject"><input type="number" min="0" max="100" placeholder="Score %" aria-label="Score percentage">';$("gradeRows").append(row);});
$("gradeBtn").addEventListener("click",()=>{const inputs=[...$("gradeRows").querySelectorAll('input[type="number"]')].filter(i=>i.value!=="");if(!inputs.length||inputs.some(i=>Number(i.value)<0||Number(i.value)>100)){$("gradeResult").textContent="Enter at least one score between 0 and 100.";return;}const avg=inputs.reduce((s,i)=>s+Number(i.value),0)/inputs.length;$("gradeResult").innerHTML=`Average: <strong>${avg.toFixed(2)}%</strong> <span class="muted">across ${inputs.length} subject${inputs.length===1?"":"s"}</span>`;});


// MULTIPLE EXAM COUNTDOWNS

// Migrate the old single-exam format, if one exists.
if (!Array.isArray(data.exams)) {
  data.exams = data.exam
    ? [{
        id: "legacy-exam",
        name: data.exam.name || "Upcoming exam",
        date: data.exam.date.slice(0, 10)
      }]
    : [];
}

function getExamDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatExamDate(date) {
  return getExamDate(date).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

let editingExamId = null;

function updateExamDateMinimum() {
  $("examDate").min = localDateKey();
}

function renderExamCountdown() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = data.exams
    .filter(exam => getExamDate(exam.date) >= today)
    .sort((a, b) => getExamDate(a.date) - getExamDate(b.date));

  const nextExam = upcoming[0];

  if (!nextExam) {
    $("examNameDisplay").textContent = "No upcoming exams";
    $("daysRemaining").textContent = "—";
    $("countCaption").textContent = "ADD YOUR FIRST EXAM";
    $("examDateDisplay").textContent =
      "Your upcoming exams will appear here.";
  } else {
    const difference = getExamDate(nextExam.date) - today;
    const days = Math.round(difference / 86400000);

    $("examNameDisplay").textContent = nextExam.name;
    $("daysRemaining").textContent = days;
    $("countCaption").textContent =
      days === 0 ? "EXAM DAY" : "DAYS TO GO";
    $("examDateDisplay").textContent =
      formatExamDate(nextExam.date);
  }

  renderExamList();
}

function renderExamList() {
  const list = $("examList");
  list.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedExams = [...data.exams].sort((a, b) => {
    const aDate = getExamDate(a.date);
    const bDate = getExamDate(b.date);

    const aPast = aDate < today;
    const bPast = bDate < today;

    if (aPast !== bPast) return aPast ? 1 : -1;
    return aDate - bDate;
  });

  $("examCount").textContent =
    `${data.exams.length} EXAM${data.exams.length === 1 ? "" : "S"}`;

  if (!sortedExams.length) {
    const empty = document.createElement("div");
    empty.className = "panel exam-empty";

    const heading = document.createElement("h3");
    heading.textContent = "No exams added yet";

    const message = document.createElement("p");
    message.className = "muted";
    message.textContent =
      "Add your first exam using the form above.";

    empty.append(heading, message);
    list.append(empty);
    return;
  }

  sortedExams.forEach(exam => {
    const card = document.createElement("div");
    card.className = "panel exam-card";

    const details = document.createElement("div");
    details.className = "exam-details";

    const name = document.createElement("h3");
    name.textContent = exam.name;

    const date = document.createElement("p");
    date.className = "muted";
    date.textContent = formatExamDate(exam.date);

    const remaining = Math.round(
      (getExamDate(exam.date) - today) / 86400000
    );

    const status = document.createElement("span");
    status.className = "exam-status";

    if (remaining < 0) {
      status.textContent = "Completed";
      status.classList.add("exam-completed");
    } else {
      status.textContent = remaining === 0
        ? "Exam day"
        : `${remaining} days remaining`;
    }

    details.append(name, date, status);

    const actions = document.createElement("div");
    actions.className = "exam-actions";

    const edit = document.createElement("button");
    edit.className = "secondary-btn";
    edit.textContent = "Edit";
    edit.type = "button";
    edit.addEventListener("click", () => editExam(exam.id));

    const remove = document.createElement("button");
    remove.className = "text-btn danger";
    remove.textContent = "Delete";
    remove.type = "button";
    remove.addEventListener("click", () => deleteExam(exam.id));

    actions.append(edit, remove);
    card.append(details, actions);
    list.append(card);
  });
}

function editExam(id) {
  const exam = data.exams.find(item => item.id === id);
  if (!exam) return;

  editingExamId = id;

  $("examName").value = exam.name;
  $("examDate").value = exam.date;
  $("examFormTitle").textContent = "Edit exam";
  $("examFormHeading").textContent = "UPDATE YOUR SCHEDULE";
  $("saveExam").textContent = "Save changes";
  $("cancelExamEdit").hidden = false;

  $("examName").focus();
}

function resetExamForm() {
  editingExamId = null;

  $("examName").value = "";
  $("examDate").value = "";
  $("examFormTitle").textContent = "Add an exam";
  $("examFormHeading").textContent = "BUILD YOUR SCHEDULE";
  $("saveExam").textContent = "Add exam";
  $("cancelExamEdit").hidden = true;

  updateExamDateMinimum();
}

function deleteExam(id) {
  data.exams = data.exams.filter(exam => exam.id !== id);
  save();

  if (editingExamId === id) {
    resetExamForm();
  }

  renderExamCountdown();
  toast("Exam deleted.");
}

$("saveExam").addEventListener("click", () => {
  const name = $("examName").value.trim();
  const date = $("examDate").value;

  if (!name) {
    toast("Please enter an exam name.");
    return;
  }

  if (!date || Number.isNaN(getExamDate(date).getTime())) {
    toast("Please choose a valid exam date.");
    return;
  }

  if (getExamDate(date) < new Date(new Date().setHours(0, 0, 0, 0))) {
    toast("Please choose today or a future date.");
    return;
  }

  if (editingExamId) {
    const exam = data.exams.find(item => item.id === editingExamId);

    if (exam) {
      exam.name = name;
      exam.date = date;
    }

    toast("Exam updated.");
  } else {
    data.exams.push({
      id: String(Date.now()) + Math.random().toString(36).slice(2),
      name,
      date
    });

    toast("Exam added successfully.");
  }

  save();
  resetExamForm();
  renderExamCountdown();
});

$("cancelExamEdit").addEventListener("click", resetExamForm);

updateExamDateMinimum();
renderExamCountdown();

// Refresh countdowns periodically.
setInterval(renderExamCountdown, 60000);


// Flashcards
let cardIndex=0,flipped=false;
function renderCards(){const n=data.cards.length;$("cardPosition").textContent=n?`${cardIndex+1} OF ${n}`:"0 CARDS";$("deckCount").textContent=`${n} card${n===1?"":"s"} saved`;if(!n){$("flashLabel").textContent="YOUR QUESTION";$("flashText").textContent="Add your first flashcard to begin.";$("flashHint").textContent="Your cards stay saved on this device.";$("deleteCard").disabled=true;return;}const c=data.cards[cardIndex];$("flashLabel").textContent=flipped?"THE ANSWER":"YOUR QUESTION";$("flashText").textContent=flipped?c.answer:c.question;$("flashHint").textContent="Click the card to "+(flipped?"see the question":"reveal the answer");$("deleteCard").disabled=false;}
function flip(){if(!data.cards.length)return;flipped=!flipped;renderCards();}
$("flashcard").addEventListener("click",flip);$("flipCard").addEventListener("click",flip);
$("addCard").addEventListener("click",()=>{const q=$("newQuestion").value.trim(),a=$("newAnswer").value.trim();if(!q||!a){toast("Add both a question and an answer.");return;}data.cards.push({question:q,answer:a});cardIndex=data.cards.length-1;flipped=false;save();$("newQuestion").value="";$("newAnswer").value="";renderCards();toast("Flashcard added.");});
$("prevCard").addEventListener("click",()=>{if(!data.cards.length)return;cardIndex=(cardIndex-1+data.cards.length)%data.cards.length;flipped=false;renderCards();});
$("nextCard").addEventListener("click",()=>{if(!data.cards.length)return;cardIndex=(cardIndex+1)%data.cards.length;flipped=false;renderCards();});
$("deleteCard").addEventListener("click",()=>{if(!data.cards.length)return;data.cards.splice(cardIndex,1);cardIndex=Math.max(0,cardIndex-1);flipped=false;save();renderCards();toast("Flashcard deleted.");});renderCards();

// Daily quiz (rotates question order by date)
const questionBank=[
 {q:"Which planet is known as the Red Planet?",o:["Venus","Mars","Jupiter","Mercury"],a:1,e:"Mars looks reddish because iron minerals in its soil have oxidised."},
 {q:"What is the chemical symbol for gold?",o:["Ag","Gd","Au","Go"],a:2,e:"Au comes from the Latin word aurum."},
 {q:"Which part of a plant mainly absorbs water from soil?",o:["Leaves","Flower","Root hairs","Stem"],a:2,e:"Root hairs provide a large surface area for water absorption."},
 {q:"What is the largest ocean on Earth?",o:["Atlantic","Indian","Arctic","Pacific"],a:3,e:"The Pacific Ocean is the largest and deepest ocean."},
 {q:"How many sides does a hexagon have?",o:["Five","Six","Seven","Eight"],a:1,e:"A hexagon is a polygon with six sides."},
 {q:"Which gas do plants absorb during photosynthesis?",o:["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"],a:2,e:"Plants use carbon dioxide and water to make glucose during photosynthesis."},
 {q:"What is the square root of 144?",o:["10","11","12","14"],a:2,e:"12 × 12 = 144."},
 {q:"Which is the closest star to Earth?",o:["Sirius","The Sun","Proxima Centauri","Polaris"],a:1,e:"The Sun is our nearest star."},
 {q:"What is the SI unit of electric current?",o:["Volt","Ohm","Watt","Ampere"],a:3,e:"Electric current is measured in amperes (A)."},
 {q:"Which continent has the most countries?",o:["Asia","Europe","Africa","South America"],a:2,e:"Africa has the highest number of sovereign countries."}
];
let quizQuestions=[],quizIndex=0,quizScore=0,quizAnswered=false;
function initQuiz(){const day=Math.floor(Date.now()/86400000);quizQuestions=Array.from({length:5},(_,i)=>questionBank[(day*3+i*2)%questionBank.length]);quizIndex=0;quizScore=0;quizAnswered=false;renderQuiz();}
function renderQuiz(){const q=quizQuestions[quizIndex];$("quizProgress").textContent=`QUESTION ${quizIndex+1} OF ${quizQuestions.length}`;$("quizProgressBar").style.width=`${(quizIndex+1)/quizQuestions.length*100}%`;$("quizQuestion").textContent=q.q;$("quizOptions").innerHTML="";q.o.forEach((opt,i)=>{const b=document.createElement("button");b.className="quiz-option";b.textContent=String.fromCharCode(65+i)+".  "+opt;b.addEventListener("click",()=>answerQuiz(i));$("quizOptions").append(b);});$("quizFeedback").textContent="";$("quizScore").textContent=`Score: ${quizScore}`;$("quizNext").disabled=true;$("quizNext").textContent=quizIndex===quizQuestions.length-1?"Finish quiz":"Next question →";quizAnswered=false;}
function answerQuiz(i){if(quizAnswered)return;quizAnswered=true;const q=quizQuestions[quizIndex];[...$("quizOptions").children].forEach((b,j)=>{b.disabled=true;if(j===q.a)b.classList.add("correct");if(j===i&&i!==q.a)b.classList.add("wrong");});if(i===q.a){quizScore++;$("quizFeedback").textContent="Correct! "+q.e;}else $("quizFeedback").textContent="Not quite. "+q.e;$("quizScore").textContent=`Score: ${quizScore}`;$("quizNext").disabled=false;}
$("quizNext").addEventListener("click",()=>{if(!quizAnswered)return;if(quizIndex<quizQuestions.length-1){quizIndex++;renderQuiz();}else{$("quizQuestion").textContent=`You scored ${quizScore} out of ${quizQuestions.length}!`;$("quizOptions").innerHTML="";$("quizFeedback").textContent=quizScore===5?"Perfect score. Excellent work!":"Nice effort. Come back tomorrow for another challenge.";$("quizNext").textContent="Play again";$("quizNext").disabled=false;$("quizNext").onclick=()=>{initQuiz();$("quizNext").onclick=null;};data.quizDone=true;save();updateStreak();}});
initQuiz();
