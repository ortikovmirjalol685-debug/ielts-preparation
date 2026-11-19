
"use strict";

/* =========================================
   IELTS PRO — MAIN JAVASCRIPT
   ========================================= */

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const store = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem("ieltspro_" + key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem("ieltspro_" + key, JSON.stringify(value));
  }
};

let learnedWords = new Set(store.get("learnedWords", []));
let speakingHistory = store.get("speakingHistory", []);
let speakingCount = store.get("speakingCount", 0);
let testCount = store.get("testCount", 0);
let savedAnswers = store.get("savedAnswers", 0);

function toast(message) {
  const el = $("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2500);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#039;"
  })[char]);
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/* =========================================
   NAVIGATION
   ========================================= */

const pageNames = {
  dashboard: "Dashboard",
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
  vocabulary: "Vocabulary",
  grammar: "Grammar Academy",
  mock: "Mock Test & Band",
  focus: "Focus Timer",
  progress: "My Progress"
};

function openPage(page) {
  if (!pageNames[page]) return;

  $$(".page").forEach(el => el.classList.remove("active"));
  $$(".nav-item").forEach(el => el.classList.remove("active"));

  $(page)?.classList.add("active");
  $(`.nav-item[data-page="${page}"]`)?.classList.add("active");

  $("pageTitle").textContent = pageNames[page];

  $("sidebar")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (page === "vocabulary") renderVocabulary();
  if (page === "grammar") renderGrammar();
  if (page === "dashboard") updateDashboard();
  if (page === "progress") updateProgress();
}

$$(".nav-item").forEach(button => {
  button.addEventListener("click", () => openPage(button.dataset.page));
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-go]");
  if (button) openPage(button.dataset.go);
});

$("menuToggle")?.addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

if ($("todayDate")) {
  $("todayDate").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  });
}

/* =========================================
   VOCABULARY LIBRARY
   ========================================= */

const vocabTopics = {
  "Education": [
    ["academic","akademik","Students need academic support.","Advanced"],
    ["curriculum","o‘quv dasturi","The curriculum includes practical subjects.","Advanced"],
    ["literacy","savodxonlik","Literacy is essential for development.","Advanced"],
    ["scholarship","stipendiya, grant","She received a university scholarship.","Intermediate"],
    ["qualification","malaka, diplom","This qualification is recognised internationally.","Intermediate"],
    ["assessment","baholash","Continuous assessment can improve learning.","Advanced"],
    ["enrolment","ro‘yxatdan o‘tish","University enrolment increased this year.","Advanced"],
    ["tuition","o‘qish to‘lovi","Tuition fees can be expensive.","Intermediate"],
    ["compulsory","majburiy","Mathematics is compulsory at this school.","Intermediate"],
    ["vocational","kasbiy","Vocational education provides practical skills.","Advanced"],
    ["discipline","intizom","Self-discipline is important for success.","Intermediate"],
    ["attainment","erishilgan natija","Educational attainment varies between regions.","Advanced"],
    ["lecture","ma’ruza","The lecture covered modern technology.","Intermediate"],
    ["assignment","topshiriq","Students must complete the assignment.","Intermediate"],
    ["methodology","metodologiya","The research methodology was carefully selected.","Advanced"]
  ],
  "Environment": [
    ["sustainable","barqaror","Cities need sustainable transport systems.","Advanced"],
    ["biodiversity","biologik xilma-xillik","Biodiversity is threatened by habitat loss.","Advanced"],
    ["deforestation","o‘rmonlarning kesilishi","Deforestation contributes to climate change.","Advanced"],
    ["emission","chiqindi gaz","Vehicle emissions affect air quality.","Advanced"],
    ["renewable","qayta tiklanadigan","Solar energy is a renewable resource.","Intermediate"],
    ["conservation","muhofaza qilish","Wildlife conservation requires public support.","Advanced"],
    ["ecosystem","ekotizim","Every species plays a role in its ecosystem.","Intermediate"],
    ["contamination","ifloslanish","Water contamination can threaten public health.","Advanced"],
    ["drought","qurg‘oqchilik","The region experienced a severe drought.","Intermediate"],
    ["habitat","yashash muhiti","Many animals are losing their natural habitat.","Intermediate"],
    ["recycle","qayta ishlamoq","Households should recycle more waste.","Intermediate"],
    ["landfill","chiqindi poligoni","Plastic waste often ends up in landfill sites.","Advanced"],
    ["ecological","ekologik","The project has ecological benefits.","Advanced"],
    ["depletion","tugab borish","The depletion of natural resources is concerning.","Advanced"],
    ["pollutant","ifloslantiruvchi modda","Factories must reduce harmful pollutants.","Advanced"]
  ],
  "Technology": [
    ["innovation","yangilik, innovatsiya","Technological innovation changes daily life.","Intermediate"],
    ["automation","avtomatlashtirish","Automation can improve manufacturing efficiency.","Advanced"],
    ["artificial intelligence","sun’iy intellekt","Artificial intelligence is used in many industries.","Intermediate"],
    ["device","qurilma","This device measures temperature accurately.","Intermediate"],
    ["efficient","samarali","Modern engines are more energy-efficient.","Intermediate"],
    ["breakthrough","katta kashfiyot","The discovery was a scientific breakthrough.","Advanced"],
    ["digitalisation","raqamlashtirish","Digitalisation has transformed education.","Advanced"],
    ["cybersecurity","kiberxavfsizlik","Cybersecurity protects personal information.","Advanced"],
    ["database","ma’lumotlar bazasi","The database stores research information.","Intermediate"],
    ["artificial","sun’iy","Artificial materials are used in construction.","Intermediate"],
    ["mechanism","mexanizm","The mechanism controls the movement.","Advanced"],
    ["software","dasturiy ta’minot","The software analyses large amounts of data.","Intermediate"],
    ["infrastructure","infratuzilma","Digital infrastructure supports modern businesses.","Advanced"],
    ["robotics","robototexnika","Robotics is becoming increasingly important.","Advanced"],
    ["revolutionise","tubdan o‘zgartirmoq","New technology may revolutionise transport.","Advanced"]
  ],
  "Health": [
    ["well-being","farovonlik, salomatlik","Physical activity supports general well-being.","Intermediate"],
    ["nutrition","ovqatlanish","Good nutrition is important for concentration.","Intermediate"],
    ["sedentary","kamharakat","A sedentary lifestyle may affect health.","Advanced"],
    ["prevention","oldini olish","Prevention is better than treatment.","Intermediate"],
    ["diagnosis","tashxis","Early diagnosis can improve treatment.","Advanced"],
    ["outbreak","kasallik tarqalishi","The outbreak affected several communities.","Advanced"],
    ["immune","immun","The immune system protects the body.","Intermediate"],
    ["healthcare","sog‘liqni saqlash","Healthcare services should be accessible.","Intermediate"],
    ["obesity","semizlik","Obesity is influenced by several factors.","Advanced"],
    ["therapy","davolash usuli","The patient received appropriate therapy.","Intermediate"],
    ["mental","aqliy, ruhiy","Mental well-being is important for students.","Intermediate"],
    ["chronic","surunkali","Chronic diseases require long-term care.","Advanced"],
    ["symptom","alomat","A fever can be a symptom of infection.","Intermediate"],
    ["clinical","klinik","Clinical research improves medical knowledge.","Advanced"],
    ["sedation","tinchlantirish","The procedure may require sedation.","Advanced"]
  ],
  "Business": [
    ["revenue","daromad","The company reported higher annual revenue.","Advanced"],
    ["expenditure","xarajat","Public expenditure on education increased.","Advanced"],
    ["investment","investitsiya","Investment in research can support growth.","Intermediate"],
    ["entrepreneur","tadbirkor","The entrepreneur established a new company.","Advanced"],
    ["competition","raqobat","Competition encourages businesses to innovate.","Intermediate"],
    ["profitability","foydalilik","Profitability depends on several factors.","Advanced"],
    ["consumer","iste’molchi","Consumer behaviour has changed significantly.","Intermediate"],
    ["demand","talab","Demand for electric vehicles is growing.","Intermediate"],
    ["supply","taklif","Supply may not meet demand.","Intermediate"],
    ["marketplace","bozor","Online marketplaces connect buyers and sellers.","Intermediate"],
    ["corporation","korporatsiya","The corporation operates internationally.","Advanced"],
    ["productivity","unumdorlik","Technology can increase workplace productivity.","Advanced"],
    ["acquisition","sotib olish","The acquisition expanded the company's operations.","Advanced"],
    ["strategy","strategiya","The company developed a new strategy.","Intermediate"],
    ["economic","iqtisodiy","Economic growth can create employment.","Intermediate"]
  ],
  "Society": [
    ["inequality","tengsizlik","Income inequality remains a major issue.","Advanced"],
    ["community","jamiyat","The community supported the local project.","Intermediate"],
    ["demographic","demografik","Demographic changes affect public services.","Advanced"],
    ["migration","migratsiya","Migration can influence population growth.","Intermediate"],
    ["poverty","qashshoqlik","Education can help reduce poverty.","Intermediate"],
    ["urbanisation","urbanizatsiya","Urbanisation creates both opportunities and challenges.","Advanced"],
    ["diversity","xilma-xillik","Cultural diversity enriches society.","Intermediate"],
    ["population","aholi","The population has increased rapidly.","Intermediate"],
    ["welfare","ijtimoiy farovonlik","The policy aims to improve social welfare.","Advanced"],
    ["accessibility","foydalana olish imkoniyati","Accessibility is essential for public transport.","Advanced"],
    ["integration","integratsiya","Social integration can strengthen communities.","Advanced"],
    ["generation","avlod","Each generation faces different challenges.","Intermediate"],
    ["urban","shaharga oid","Urban areas often have better transport.","Intermediate"],
    ["rural","qishloqqa oid","Rural communities may lack facilities.","Intermediate"],
    ["household","uy xo‘jaligi","Household spending has increased.","Advanced"]
  ],
  "Science": [
    ["hypothesis","ilmiy faraz","The experiment tested the hypothesis.","Advanced"],
    ["evidence","dalil","There is strong evidence for this theory.","Intermediate"],
    ["laboratory","laboratoriya","The samples were analysed in a laboratory.","Intermediate"],
    ["experiment","tajriba","The experiment produced interesting results.","Intermediate"],
    ["observation","kuzatuv","The observation was recorded carefully.","Intermediate"],
    ["theoretical","nazariy","The theoretical model needs further testing.","Advanced"],
    ["empirical","tajribaga asoslangan","The conclusion was based on empirical evidence.","Advanced"],
    ["research","tadqiqot","Further research is required.","Intermediate"],
    ["phenomenon","hodisa","This phenomenon is difficult to explain.","Advanced"],
    ["analysis","tahlil","The analysis revealed several patterns.","Intermediate"],
    ["variable","o‘zgaruvchi","Temperature was the main variable.","Advanced"],
    ["measurement","o‘lchov","Accurate measurement is essential.","Intermediate"],
    ["investigate","tadqiq qilmoq","Scientists investigate the causes of disease.","Intermediate"],
    ["significant","muhim, sezilarli","The results showed significant improvement.","Intermediate"],
    ["reliable","ishonchli","Reliable data is essential for research.","Intermediate"]
  ],
  "Transport": [
    ["commute","ishga qatnamoq","Many people commute by train.","Intermediate"],
    ["congestion","tirbandlik","Traffic congestion affects urban life.","Advanced"],
    ["pedestrian","piyoda","Pedestrians need safe crossing points.","Advanced"],
    ["infrastructure","infratuzilma","Transport infrastructure requires investment.","Advanced"],
    ["efficient","samarali","Efficient public transport reduces travel time.","Intermediate"],
    ["vehicle","transport vositasi","Electric vehicles are becoming more common.","Intermediate"],
    ["mobility","harakatchanlik","Public transport improves urban mobility.","Advanced"],
    ["accessible","foydalanish mumkin bo‘lgan","The station is accessible to everyone.","Intermediate"],
    ["route","yo‘nalish","The new route connects two towns.","Intermediate"],
    ["suburban","shahar chetidagi","Suburban areas are expanding.","Advanced"],
    ["pedestrianisation","piyodalar hududiga aylantirish","Pedestrianisation can improve city centres.","Advanced"],
    ["commuter","qatnovchi","Commuters often travel during peak hours.","Advanced"],
    ["logistics","logistika","Logistics plays a vital role in trade.","Advanced"],
    ["transit","tranzit, transport","The city is improving its transit system.","Advanced"],
    ["vehicle emissions","transport chiqindilari","Vehicle emissions contribute to air pollution.","Advanced"]
  ],
  "Culture": [
    ["heritage","meros","Cultural heritage should be protected.","Intermediate"],
    ["tradition","an’ana","Traditions are passed between generations.","Intermediate"],
    ["custom","urf-odat","Every region has its own customs.","Intermediate"],
    ["identity","o‘zlik","Language is an important part of identity.","Intermediate"],
    ["historical","tarixiy","The city contains many historical buildings.","Intermediate"],
    ["civilisation","sivilizatsiya","Ancient civilisations developed complex systems.","Advanced"],
    ["preservation","saqlab qolish","The preservation of monuments is important.","Advanced"],
    ["cultural","madaniy","Cultural exchange promotes understanding.","Intermediate"],
    ["architecture","me’morchilik","The architecture reflects the region's history.","Advanced"],
    ["generation","avlod","Knowledge is transferred between generations.","Intermediate"],
    ["ritual","marosim","The ritual has cultural significance.","Advanced"],
    ["festival","bayram, festival","The festival attracts international visitors.","Intermediate"],
    ["artefact","tarixiy buyum","The artefact was discovered underground.","Advanced"],
    ["museum","muzey","The museum displays ancient objects.","Intermediate"],
    ["historian","tarixchi","The historian studied ancient documents.","Intermediate"]
  ],
  "Work": [
    ["occupation","kasb","Choosing an occupation can be difficult.","Intermediate"],
    ["employment","bandlik","Employment opportunities vary by region.","Intermediate"],
    ["unemployment","ishsizlik","Unemployment is a major economic concern.","Intermediate"],
    ["workforce","ishchi kuchi","The workforce needs technical training.","Advanced"],
    ["professional","professional","Professional development is important.","Intermediate"],
    ["qualification","malaka","Employers often require specific qualifications.","Intermediate"],
    ["promotion","lavozim ko‘tarilishi","She received a promotion last year.","Intermediate"],
    ["recruitment","ishga qabul qilish","The recruitment process took several weeks.","Advanced"],
    ["flexible","moslashuvchan","Flexible working arrangements are popular.","Intermediate"],
    ["salary","maosh","Salary is not the only factor in job satisfaction.","Intermediate"],
    ["colleague","hamkasb","My colleagues helped me complete the project.","Intermediate"],
    ["workplace","ish joyi","A positive workplace improves motivation.","Intermediate"],
    ["expertise","mutaxassislik","The project requires technical expertise.","Advanced"],
    ["entrepreneurial","tadbirkorlikka oid","Entrepreneurial skills can support innovation.","Advanced"],
    ["career prospects","kasbiy istiqbol","Engineering offers promising career prospects.","Advanced"]
  ],
  "IELTS Academic": [
    ["moreover","bundan tashqari","Moreover, the policy could reduce costs.","Advanced"],
    ["nevertheless","shunga qaramay","Nevertheless, further research is needed.","Advanced"],
    ["consequently","natijada","Consequently, the demand increased.","Advanced"],
    ["subsequently","keyinchalik","The system was subsequently improved.","Advanced"],
    ["whereas","holbuki","Urban areas expanded, whereas rural areas remained stable.","Advanced"],
    ["therefore","shuning uchun","Therefore, governments should consider alternatives.","Intermediate"],
    ["predominantly","asosan","The area is predominantly agricultural.","Advanced"],
    ["approximately","taxminan","Approximately half of the participants agreed.","Intermediate"],
    ["considerable","sezilarli","The project requires considerable investment.","Advanced"],
    ["fluctuate","o‘zgarib turmoq","Prices fluctuate throughout the year.","Advanced"],
    ["decline","pasayish","The number experienced a gradual decline.","Intermediate"],
    ["increase","oshish","There was a significant increase in demand.","Intermediate"],
    ["proportion","nisbat, ulush","A large proportion of students preferred online learning.","Advanced"],
    ["trend","tendensiya","The graph illustrates a clear upward trend.","Intermediate"],
    ["illustrate","ko‘rsatmoq","The chart illustrates changes over time.","Intermediate"]
  ]
};

// Vocabulary ro‘yxatini kengaytirish uchun qo‘shimcha haqiqiy iboralar.
const extraVocab = [
  ["allocate","taqsimlamoq","Governments allocate funds to public services.","Advanced","Education"],
  ["attend","qatnashmoq","Students attend lectures every week.","Intermediate","Education"],
  ["comprehension","tushunish","Reading improves comprehension skills.","Advanced","Education"],
  ["concentrate","diqqatni jamlamoq","It is difficult to concentrate in a noisy room.","Intermediate","Education"],
  ["demonstrate","namoyish qilmoq","The results demonstrate clear progress.","Advanced","Science"],
  ["derive","kelib chiqmoq","Many words derive from Latin.","Advanced","Science"],
  ["establish","tashkil etmoq","The university was established in 1950.","Intermediate","Education"],
  ["evaluate","baholamoq","Researchers evaluate the results carefully.","Advanced","Science"],
  ["expand","kengaymoq","The city continues to expand.","Intermediate","Society"],
  ["facilitate","osonlashtirmoq","Technology can facilitate communication.","Advanced","Technology"],
  ["fundamental","asosiy","Trust is fundamental to a good relationship.","Advanced","Society"],
  ["generate","yaratmoq","Solar panels generate electricity.","Intermediate","Technology"],
  ["implement","amalga oshirmoq","The government implemented a new policy.","Advanced","Society"],
  ["indicate","ko‘rsatmoq","The figures indicate a gradual increase.","Intermediate","IELTS Academic"],
  ["maintain","saqlab qolmoq","It is important to maintain a healthy balance.","Intermediate","Health"],
  ["obtain","qo‘lga kiritmoq","Students can obtain useful qualifications.","Advanced","Education"],
  ["participate","ishtirok etmoq","Young people should participate in community projects.","Intermediate","Society"],
  ["perceive","qabul qilmoq, idrok etmoq","People perceive the issue differently.","Advanced","Society"],
  ["promote","rivojlantirmoq","Exercise can promote better health.","Intermediate","Health"],
  ["require","talab qilmoq","The position requires technical knowledge.","Intermediate","Work"],
  ["reveal","oshkor qilmoq","The research revealed an unexpected result.","Advanced","Science"],
  ["significantly","sezilarli darajada","The figures increased significantly.","Advanced","IELTS Academic"],
  ["specific","aniq, muayyan","The course focuses on specific skills.","Intermediate","Education"],
  ["sufficient","yetarli","There is sufficient evidence to support the claim.","Advanced","Science"],
  ["undergo","boshdan kechirmoq","The building underwent major repairs.","Advanced","Technology"],
  ["vary","farq qilmoq","Prices vary between different regions.","Intermediate","IELTS Academic"],
  ["widespread","keng tarqalgan","The practice is widespread in urban areas.","Advanced","Society"],
  ["adapt","moslashmoq","People must adapt to changing conditions.","Intermediate","Work"],
  ["approach","yondashuv","This approach is more effective.","Intermediate","Education"],
  ["beneficial","foydali","Regular practice is beneficial for learners.","Intermediate","Health"],
  ["challenge","qiyinchilik","Climate change presents a serious challenge.","Intermediate","Environment"],
  ["contribute","hissa qo‘shmoq","Education contributes to economic development.","Intermediate","Education"],
  ["crucial","juda muhim","Planning is crucial for success.","Advanced","Work"],
  ["decline","kamaymoq","The number of visitors declined.","Intermediate","IELTS Academic"],
  ["diverse","turli xil","The city has a diverse population.","Intermediate","Society"],
  ["emerge","paydo bo‘lmoq","New technologies continue to emerge.","Advanced","Technology"],
  ["enhance","yaxshilamoq","Reading can enhance vocabulary.","Advanced","Education"],
  ["factor","omil","Cost is an important factor.","Intermediate","Business"],
  ["impact","ta’sir","Technology has a major impact on society.","Intermediate","Technology"],
  ["influence","ta’sir ko‘rsatmoq","Parents influence children's behaviour.","Intermediate","Society"],
  ["justify","asoslamoq","The researcher justified the decision.","Advanced","Science"],
  ["link","bog‘lamoq","The study links exercise with well-being.","Intermediate","Health"],
  ["occur","sodir bo‘lmoq","Changes occur gradually.","Intermediate","IELTS Academic"],
  ["potential","salohiyat","The technology has significant potential.","Intermediate","Technology"],
  ["predict","bashorat qilmoq","Experts predict further growth.","Intermediate","Science"],
  ["reduce","kamaytirmoq","Public transport can reduce congestion.","Intermediate","Transport"],
  ["relevant","aloqador","The evidence is relevant to the discussion.","Intermediate","Education"],
  ["resource","resurs","Water is a valuable natural resource.","Intermediate","Environment"],
  ["respond","javob bermoq","Governments must respond to public needs.","Intermediate","Society"],
  ["role","rol","Education plays a vital role in society.","Intermediate","Education"],
  ["sector","soha","The technology sector is growing.","Intermediate","Business"],
  ["source","manba","The report uses reliable sources.","Intermediate","Science"],
  ["structure","tuzilma","The essay needs a clearer structure.","Intermediate","Education"],
  ["transfer","ko‘chirmoq","The technology can transfer energy efficiently.","Advanced","Technology"],
  ["trend","yo‘nalish","The trend is expected to continue.","Intermediate","IELTS Academic"],
  ["ultimate","yakuniy","The ultimate aim is to improve quality.","Advanced","Work"],
  ["valid","asosli","The study provides valid evidence.","Advanced","Science"],
  ["welfare","farovonlik","Public welfare should be a priority.","Advanced","Society"],
  ["yield","natija bermoq","The experiment yielded positive results.","Advanced","Science"],
  ["abundant","mo‘l-ko‘l","The region has abundant natural resources.","Advanced","Environment"],
  ["accurate","aniq","Accurate information is essential.","Intermediate","Science"],
  ["acquire","egallamoq","Students acquire skills through practice.","Advanced","Education"],
  ["alternative","muqobil","Renewable energy is an alternative to fossil fuels.","Intermediate","Environment"],
  ["ambiguous","noaniq","The instructions were ambiguous.","Advanced","Education"],
  ["apparent","ravshan","The benefits are apparent.","Advanced","IELTS Academic"],
  ["capacity","salohiyat, sig‘im","The factory increased its production capacity.","Advanced","Business"],
  ["compensate","qoplamoq","Higher wages may compensate for longer hours.","Advanced","Work"],
  ["comprehensive","batafsil","The report provides a comprehensive analysis.","Advanced","Science"],
  ["consistent","izchil","Consistent effort leads to improvement.","Intermediate","Education"],
  ["controversial","bahsli","The proposal remains controversial.","Advanced","Society"],
  ["conventional","an’anaviy","Conventional methods are still widely used.","Advanced","Technology"],
  ["correspond","mos kelmoq","The results correspond with earlier research.","Advanced","Science"],
  ["crucial","hal qiluvchi","Communication is crucial in teamwork.","Advanced","Work"],
  ["decrease","kamayish","There was a decrease in energy use.","Intermediate","IELTS Academic"],
  ["distinguish","farqlamoq","It is important to distinguish facts from opinions.","Advanced","Education"],
  ["eliminate","bartaraf etmoq","The new system may eliminate errors.","Advanced","Technology"],
  ["emphasis","urg‘u","The course places emphasis on practical skills.","Advanced","Education"],
  ["ensure","ta’minlamoq","Governments should ensure equal access.","Intermediate","Society"],
  ["evident","yaqqol","The improvement is evident.","Advanced","IELTS Academic"],
  ["exceed","oshib ketmoq","The final cost may exceed the budget.","Advanced","Business"],
  ["exclude","istisno qilmoq","The survey excluded incomplete responses.","Advanced","Science"],
  ["exhibit","namoyish etmoq","The results exhibit a clear pattern.","Advanced","Science"],
  ["framework","asos, tizim","The framework supports effective planning.","Advanced","Education"],
  ["imply","nazarda tutmoq","The findings imply a strong connection.","Advanced","Science"],
  ["initial","dastlabki","The initial results were promising.","Intermediate","Science"],
  ["interpret","talqin qilmoq","Readers may interpret the data differently.","Advanced","Education"],
  ["isolate","ajratmoq","Scientists isolate the relevant variables.","Advanced","Science"],
  ["likelihood","ehtimollik","The likelihood of success has increased.","Advanced","Science"],
  ["modify","o‘zgartirmoq","The design was modified after testing.","Advanced","Technology"],
  ["monitor","kuzatib bormoq","Authorities monitor air quality.","Intermediate","Environment"],
  ["objective","maqsad","The main objective is to reduce waste.","Intermediate","Work"],
  ["overcome","yengib o‘tmoq","Students can overcome language barriers.","Intermediate","Education"],
  ["prioritise","ustuvor deb bilmoq","Governments should prioritise public health.","Advanced","Society"],
  ["retain","saqlab qolmoq","The system retains important information.","Advanced","Technology"],
  ["substantial","katta, sezilarli","The project requires substantial funding.","Advanced","Business"],
  ["transform","o‘zgartirmoq","Digital tools transform education.","Intermediate","Technology"],
  ["utilise","foydalanmoq","Companies utilise modern technology.","Advanced","Business"],
  ["worsen","yomonlashmoq","Air quality may worsen during winter.","Intermediate","Environment"]
];

let vocabulary = [];

Object.entries(vocabTopics).forEach(([topic, entries]) => {
  entries.forEach(([word, meaning, example, level]) => {
    vocabulary.push({ word, meaning, example, level, topic });
  });
});

extraVocab.forEach(([word, meaning, example, level, topic]) => {
  vocabulary.push({ word, meaning, example, level, topic });
});

// Duplicate words are removed automatically.
vocabulary = [...new Map(vocabulary.map(v => [v.word.toLowerCase(), v])).values()];

function updateVocabStats() {
  const learned = learnedWords.size;
  $("totalVocab").textContent = vocabulary.length;
  $("learnedVocab").textContent = learned;
  $("remainingVocab").textContent = Math.max(0, vocabulary.length - learned);
  $("vocabPercent").textContent =
    Math.round(learned / vocabulary.length * 100) + "%";
}

function renderVocabulary() {
  const search = ($("vocabSearch")?.value || "").toLowerCase().trim();
  const category = $("vocabCategory")?.value || "all";
  const level = $("vocabLevel")?.value || "all";
  const status = $("vocabStatus")?.value || "all";

  const filtered = vocabulary.filter(item => {
    const matchesSearch = [
      item.word, item.meaning, item.example, item.topic
    ].join(" ").toLowerCase().includes(search);

    const matchesCategory = category === "all" || item.topic === category;
    const matchesLevel = level === "all" || item.level === level;
    const learned = learnedWords.has(item.word);
    const matchesStatus =
      status === "all" ||
      (status === "learned" && learned) ||
      (status === "new" && !learned);

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  $("vocabResults").textContent =
    `Showing ${filtered.length} of ${vocabulary.length} words`;

  const grid = $("vocabGrid");

  if (!filtered.length) {
    grid.innerHTML = `<div class="vocab-empty">No vocabulary found. Try another search or filter.</div>`;
    updateVocabStats();
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const learned = learnedWords.has(item.word);
    return `
      <article class="vocab-card ${learned ? "learned" : ""}">
        <div class="vocab-card-top">
          <h3>${escapeHTML(item.word)}</h3>
          <span>${learned ? "✓" : "✦"}</span>
        </div>
        <p class="meaning">${escapeHTML(item.meaning)}</p>
        <p class="example"><b>Example:</b> ${escapeHTML(item.example)}</p>
        <div class="vocab-meta">
          <span>${escapeHTML(item.topic)}</span>
          <span>${escapeHTML(item.level)}</span>
        </div>
        <button data-vocab="${escapeHTML(item.word)}">
          ${learned ? "✓ Learned — undo" : "Mark as learned"}
        </button>
      </article>`;
  }).join("");

  updateVocabStats();
}

function initVocabulary() {
  const categorySelect = $("vocabCategory");

  categorySelect.innerHTML =
    `<option value="all">All topics</option>` +
    Object.keys(vocabTopics).map(topic =>
      `<option value="${escapeHTML(topic)}">${escapeHTML(topic)}</option>`
    ).join("");

  ["vocabSearch", "vocabCategory", "vocabLevel", "vocabStatus"].forEach(id => {
    $(id)?.addEventListener(id === "vocabSearch" ? "input" : "change", renderVocabulary);
  });

  $("vocabGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-vocab]");
    if (!button) return;

    const word = button.dataset.vocab;

    if (learnedWords.has(word)) {
      learnedWords.delete(word);
      toast("Word removed from learned list.");
    } else {
      learnedWords.add(word);
      toast("Word marked as learned!");
    }

    store.set("learnedWords", [...learnedWords]);
    renderVocabulary();
    updateDashboard();
  });

  renderVocabulary();
}

/* =========================================
   GRAMMAR ACADEMY — 40 TOPICS
   ========================================= */

const grammarLessons = [
  {
    title:"Present Simple",
    category:"Tenses",
    rule:"Used for habits, routines, facts and general truths.",
    formula:"Subject + V1(s/es)",
    examples:[
      ["She studies English every day.","U har kuni ingliz tilini o‘rganadi."],
      ["Water boils at 100°C.","Suv 100°C da qaynaydi."]
    ],
    question:"He ___ to university every morning.",
    answer:"goes",
    explanation:"He/She/It bilan fe’lga -s yoki -es qo‘shiladi."
  },
  {
    title:"Present Continuous",
    category:"Tenses",
    rule:"Used for actions happening now or temporary situations.",
    formula:"Subject + am/is/are + V-ing",
    examples:[
      ["I am preparing for IELTS.","Men IELTSga tayyorlanyapman."],
      ["They are working on a project.","Ular loyiha ustida ishlashyapti."]
    ],
    question:"She ___ (study) at the moment.",
    answer:"is studying",
    explanation:"Present Continuous: is + verb-ing."
  },
  {
    title:"Present Perfect",
    category:"Tenses",
    rule:"Describes past actions connected to the present.",
    formula:"Subject + have/has + V3",
    examples:[
      ["I have completed the assignment.","Men topshiriqni tugatdim."],
      ["She has visited London twice.","U Londonga ikki marta borgan."]
    ],
    question:"They ___ already ___ the task. (finish)",
    answer:"have finished",
    explanation:"They bilan have + V3 ishlatiladi."
  },
  {
    title:"Present Perfect Continuous",
    category:"Tenses",
    rule:"Emphasises the duration of an action continuing until now.",
    formula:"Subject + have/has been + V-ing",
    examples:[
      ["I have been studying for three hours.","Men uch soatdan beri o‘qiyapman."],
      ["She has been working here since 2020.","U 2020-yildan beri shu yerda ishlaydi."]
    ],
    question:"He ___ ___ learning English for a year.",
    answer:"has been",
    explanation:"He bilan has been ishlatiladi."
  },
  {
    title:"Past Simple",
    category:"Tenses",
    rule:"Used for completed actions at a definite time in the past.",
    formula:"Subject + V2",
    examples:[
      ["I studied yesterday.","Men kecha o‘qidim."],
      ["They visited the museum last week.","Ular o‘tgan hafta muzeyga borishdi."]
    ],
    question:"She ___ to school yesterday. (go)",
    answer:"went",
    explanation:"Go fe’lining Past Simple shakli went."
  },
  {
    title:"Past Continuous",
    category:"Tenses",
    rule:"Describes an action in progress at a particular past time.",
    formula:"Subject + was/were + V-ing",
    examples:[
      ["I was reading at 8 pm.","Men soat 8 da kitob o‘qiyotgan edim."],
      ["They were studying when I arrived.","Men kelganimda ular o‘qishayotgan edi."]
    ],
    question:"We ___ watching television at 9 pm.",
    answer:"were",
    explanation:"We bilan were ishlatiladi."
  },
  {
    title:"Past Perfect",
    category:"Tenses",
    rule:"Shows that one past action happened before another past action.",
    formula:"Subject + had + V3",
    examples:[
      ["She had left before I arrived.","Men kelishimdan oldin u ketgan edi."],
      ["They had finished the work.","Ular ishni tugatgan edi."]
    ],
    question:"He ___ already left when I called.",
    answer:"had",
    explanation:"Past Perfect barcha shaxslarda had + V3."
  },
  {
    title:"Past Perfect Continuous",
    category:"Tenses",
    rule:"Emphasises the duration of an activity before a past point.",
    formula:"Subject + had been + V-ing",
    examples:[
      ["I had been waiting for an hour.","Men bir soatdan beri kutayotgan edim."],
      ["She had been studying before dinner.","U kechki ovqatdan oldin o‘qiyotgan edi."]
    ],
    question:"They ___ been working all day.",
    answer:"had",
    explanation:"Past Perfect Continuous: had been + V-ing."
  },
  {
    title:"Future Simple",
    category:"Tenses",
    rule:"Used for predictions, promises and spontaneous decisions.",
    formula:"Subject + will + V1",
    examples:[
      ["Technology will continue to develop.","Texnologiya rivojlanishda davom etadi."],
      ["I will help you.","Men sizga yordam beraman."]
    ],
    question:"I think the world ___ change.",
    answer:"will",
    explanation:"Kelajakdagi bashorat uchun will ishlatiladi."
  },
  {
    title:"Future Continuous",
    category:"Tenses",
    rule:"Describes an action that will be in progress at a future time.",
    formula:"Subject + will be + V-ing",
    examples:[
      ["I will be studying at 8 pm.","Men soat 8 da o‘qiyotgan bo‘laman."],
      ["She will be travelling tomorrow.","U ertaga safarda bo‘ladi."]
    ],
    question:"At this time tomorrow, I ___ be working.",
    answer:"will",
    explanation:"Future Continuous: will be + V-ing."
  },
  {
    title:"Future Perfect",
    category:"Tenses",
    rule:"Describes something completed before a specific future time.",
    formula:"Subject + will have + V3",
    examples:[
      ["I will have finished by Friday.","Men jumagacha tugatgan bo‘laman."],
      ["They will have arrived by noon.","Ular tushgacha yetib kelgan bo‘ladi."]
    ],
    question:"By 2030, she ___ have graduated.",
    answer:"will",
    explanation:"Future Perfect: will have + V3."
  },
  {
    title:"Future Perfect Continuous",
    category:"Tenses",
    rule:"Emphasises how long an action will have continued by a future point.",
    formula:"Subject + will have been + V-ing",
    examples:[
      ["By June, I will have been studying for a year.","Iyun oyiga kelib bir yil o‘qigan bo‘laman."],
      ["He will have been working here for ten years.","U bu yerda o‘n yil ishlagan bo‘ladi."]
    ],
    question:"By 2027, I will have ___ studying for two years.",
    answer:"been",
    explanation:"Future Perfect Continuous: will have been + V-ing."
  },
  {
    title:"Present Passive",
    category:"Passive Voice",
    rule:"Used when the action or result is more important than the doer.",
    formula:"Subject + am/is/are + V3",
    examples:[
      ["English is spoken worldwide.","Ingliz tilida butun dunyoda gaplashiladi."],
      ["Cars are produced in this factory.","Bu zavodda avtomobillar ishlab chiqariladi."]
    ],
    question:"Many products ___ made here.",
    answer:"are",
    explanation:"Products ko‘plik bo‘lgani uchun are ishlatiladi."
  },
  {
    title:"Past Passive",
    category:"Passive Voice",
    rule:"Used for actions completed in the past when the doer is unknown or unimportant.",
    formula:"Subject + was/were + V3",
    examples:[
      ["The bridge was built in 1990.","Ko‘prik 1990-yilda qurilgan."],
      ["The documents were checked.","Hujjatlar tekshirildi."]
    ],
    question:"The building ___ constructed in 2000.",
    answer:"was",
    explanation:"Building birlik bo‘lgani uchun was."
  },
  {
    title:"Present Perfect Passive",
    category:"Passive Voice",
    rule:"Describes an action completed with a present result.",
    formula:"Subject + have/has been + V3",
    examples:[
      ["The report has been completed.","Hisobot tugatildi."],
      ["Several changes have been introduced.","Bir nechta o‘zgarishlar kiritildi."]
    ],
    question:"The project has ___ completed.",
    answer:"been",
    explanation:"Present Perfect Passive: has/have been + V3."
  },
  {
    title:"Modal Verbs",
    category:"Modals",
    rule:"Modal verbs express ability, possibility, advice, obligation and permission.",
    formula:"Subject + modal + V1",
    examples:[
      ["Governments should invest in education.","Hukumatlar ta’limga sarmoya kiritishi kerak."],
      ["This may cause problems.","Bu muammolarga sabab bo‘lishi mumkin."]
    ],
    question:"You ___ practise regularly to improve. (advice)",
    answer:"should",
    explanation:"Maslahat berish uchun should ishlatiladi."
  },
  {
    title:"First Conditional",
    category:"Conditionals",
    rule:"Describes a realistic future possibility.",
    formula:"If + Present Simple, will + V1",
    examples:[
      ["If I study hard, I will pass the exam.","Agar qattiq o‘qisam, imtihondan o‘taman."],
      ["If it rains, we will stay home.","Yomg‘ir yog‘sa, uyda qolamiz."]
    ],
    question:"If she studies, she ___ pass.",
    answer:"will",
    explanation:"First Conditional natija qismida will ishlatiladi."
  },
  {
    title:"Second Conditional",
    category:"Conditionals",
    rule:"Describes imaginary or unlikely present and future situations.",
    formula:"If + Past Simple, would + V1",
    examples:[
      ["If I had more time, I would travel.","Vaqtim ko‘proq bo‘lsa, sayohat qilardim."],
      ["If I were you, I would apply.","Sizning o‘rningizda bo‘lsam, ariza topshirardim."]
    ],
    question:"If I were rich, I ___ buy a house.",
    answer:"would",
    explanation:"Second Conditional natija qismida would ishlatiladi."
  },
  {
    title:"Third Conditional",
    category:"Conditionals",
    rule:"Describes an unreal past situation and its imagined result.",
    formula:"If + Past Perfect, would have + V3",
    examples:[
      ["If I had studied, I would have passed.","O‘qiganimda, imtihondan o‘tgan bo‘lardim."],
      ["If they had left earlier, they would have arrived on time.","Ular ertaroq ketishganida, vaqtida yetib kelishardi."]
    ],
    question:"If she had studied, she would have ___.",
    answer:"passed",
    explanation:"Would have dan keyin V3 ishlatiladi."
  },
  {
    title:"Mixed Conditionals",
    category:"Conditionals",
    rule:"Connects an unreal past condition with a present result, or vice versa.",
    formula:"If + Past Perfect, would + V1",
    examples:[
      ["If I had studied medicine, I would be a doctor now.","Tibbiyotni o‘qiganimda, hozir shifokor bo‘lardim."],
      ["If he were more careful, he would not have made that mistake.","U ehtiyotkorroq bo‘lganida, o‘sha xatoni qilmagan bo‘lardi."]
    ],
    question:"If I had slept earlier, I ___ feel better now.",
    answer:"would",
    explanation:"O‘tgan shartning hozirgi natijasi."
  },
  {
    title:"Zero Conditional",
    category:"Conditionals",
    rule:"Used for facts, scientific truths and things that are generally true.",
    formula:"If + Present Simple, Present Simple",
    examples:[
      ["If water reaches 100°C, it boils.","Suv 100°C ga yetsa, qaynaydi."],
      ["If people exercise, they become fitter.","Odamlar mashq qilsa, chiniqadi."]
    ],
    question:"If ice gets warm, it ___.",
    answer:"melts",
    explanation:"Umumiy fakt uchun ikkala qismda Present Simple."
  },
  {
    title:"Relative Clauses",
    category:"Sentence Structure",
    rule:"Relative clauses give additional information about people, things and places.",
    formula:"who = people | which = things | where = places | whose = possession",
    examples:[
      ["The student who won the prize is my friend.","Mukofotni yutgan talaba mening do‘stim."],
      ["This is the book which I bought yesterday.","Bu kecha sotib olgan kitobim."]
    ],
    question:"The woman ___ teaches us is very kind.",
    answer:"who",
    explanation:"Odamlar haqida who ishlatiladi."
  },
  {
    title:"Defining Relative Clauses",
    category:"Sentence Structure",
    rule:"Provides essential information identifying the person or thing.",
    formula:"Noun + who/which/that + clause",
    examples:[
      ["People who exercise regularly are often healthier.","Muntazam mashq qiladigan odamlar ko‘pincha sog‘lomroq."],
      ["The car that I bought is economical.","Men sotib olgan mashina tejamkor."]
    ],
    question:"The book ___ I borrowed was interesting.",
    answer:"that",
    explanation:"Narsalar uchun defining clause da that ishlatilishi mumkin."
  },
  {
    title:"Gerunds",
    category:"Verb Forms",
    rule:"A gerund is an -ing form used as a noun.",
    formula:"Verb + ing",
    examples:[
      ["Reading improves vocabulary.","Kitob o‘qish lug‘at boyligini oshiradi."],
      ["I enjoy learning English.","Men ingliz tilini o‘rganishni yoqtiraman."]
    ],
    question:"She enjoys ___ (read) books.",
    answer:"reading",
    explanation:"Enjoy fe’lidan keyin gerund ishlatiladi."
  },
  {
    title:"Infinitives",
    category:"Verb Forms",
    rule:"The infinitive is to + base verb and follows many verbs.",
    formula:"to + V1",
    examples:[
      ["I want to study abroad.","Men chet elda o‘qishni xohlayman."],
      ["They decided to leave.","Ular ketishga qaror qilishdi."]
    ],
    question:"He hopes ___ (study) engineering.",
    answer:"to study",
    explanation:"Hope dan keyin to-infinitive ishlatiladi."
  },
  {
    title:"Gerund vs Infinitive",
    category:"Verb Forms",
    rule:"Some verbs take gerunds, some take infinitives, and some can take both with a change in meaning.",
    formula:"enjoy + V-ing | decide + to V1 | stop + V-ing/to V1",
    examples:[
      ["I enjoy swimming.","Men suzishni yoqtiraman."],
      ["She decided to study abroad.","U chet elda o‘qishga qaror qildi."]
    ],
    question:"They decided ___ (apply) for a scholarship.",
    answer:"to apply",
    explanation:"Decide dan keyin to-infinitive ishlatiladi."
  },
  {
    title:"Comparatives",
    category:"Comparison",
    rule:"Used to compare two people, objects or situations.",
    formula:"short adjective + er + than | more + adjective + than",
    examples:[
      ["This method is more effective than the old one.","Bu usul eskisidan samaraliroq."],
      ["A train is faster than a bicycle.","Poyezd velosipeddan tezroq."]
    ],
    question:"This task is ___ (easy) than the previous one.",
    answer:"easier",
    explanation:"Easy so‘zi comparative shaklida easier bo‘ladi."
  },
  {
    title:"Superlatives",
    category:"Comparison",
    rule:"Used to identify the highest or lowest degree in a group.",
    formula:"the + adjective-est | the most + adjective",
    examples:[
      ["This is the most important issue.","Bu eng muhim masala."],
      ["It is the fastest route.","Bu eng tez yo‘l."]
    ],
    question:"This is the ___ (good) solution.",
    answer:"best",
    explanation:"Good ning superlative shakli best."
  },
  {
    title:"Articles",
    category:"Determiners",
    rule:"A/an introduce non-specific singular countable nouns; the identifies something specific.",
    formula:"a + consonant sound | an + vowel sound | the + specific noun",
    examples:[
      ["I bought a book.","Men kitob sotib oldim."],
      ["The book is interesting.","O‘sha kitob qiziqarli."]
    ],
    question:"She is ___ engineer.",
    answer:"an",
    explanation:"Engineer unli tovush bilan boshlanadi."
  },
  {
    title:"Countable & Uncountable Nouns",
    category:"Nouns",
    rule:"Countable nouns have singular and plural forms. Uncountable nouns are not normally counted individually.",
    formula:"many + countable | much + uncountable | some + both",
    examples:[
      ["There are many students.","Talabalar ko‘p."],
      ["There is much information available.","Ko‘p ma’lumot mavjud."]
    ],
    question:"How ___ information do you need?",
    answer:"much",
    explanation:"Information sanalmaydigan ot."
  },
  {
    title:"Subject–Verb Agreement",
    category:"Sentence Structure",
    rule:"The verb must agree with the grammatical subject in number and person.",
    formula:"Singular subject + singular verb | plural subject + plural verb",
    examples:[
      ["The number of students is increasing.","Talabalar soni ortib bormoqda."],
      ["Many students are studying.","Ko‘plab talabalar o‘qishyapti."]
    ],
    question:"The number of cars ___ increasing.",
    answer:"is",
    explanation:"The number birlik ma’nosida ishlatiladi."
  },
  {
    title:"Reported Speech",
    category:"Sentence Structure",
    rule:"Reports what someone said without quoting the exact words.",
    formula:"said (that) + backshifted clause",
    examples:[
      ["He said that he was tired.","U charchaganini aytdi."],
      ["She said that she had finished.","U tugatganini aytdi."]
    ],
    question:"He said, 'I am busy.' → He said he ___ busy.",
    answer:"was",
    explanation:"Reported Speech da am ko‘pincha was ga o‘zgaradi."
  },
  {
    title:"Question Tags",
    category:"Sentence Structure",
    rule:"Short questions added to statements to confirm information.",
    formula:"Positive statement + negative tag | Negative statement + positive tag",
    examples:[
      ["You are a student, aren't you?","Siz talabamisiz, shundaymi?"],
      ["She doesn't work here, does she?","U bu yerda ishlamaydi, shundaymi?"]
    ],
    question:"He is your brother, ___?",
    answer:"isn't he",
    explanation:"Ijobiy gapdan keyin inkor tag keladi."
  },
  {
    title:"Prepositions of Time",
    category:"Prepositions",
    rule:"At is used for precise times, on for days and dates, and in for months, years and periods.",
    formula:"at 8 o'clock | on Monday | in 2026",
    examples:[
      ["The exam starts at 9 am.","Imtihon soat 9 da boshlanadi."],
      ["I was born in 2008.","Men 2008-yilda tug‘ilganman."]
    ],
    question:"My birthday is ___ July.",
    answer:"in",
    explanation:"Oylar bilan in ishlatiladi."
  },
  {
    title:"Prepositions of Place",
    category:"Prepositions",
    rule:"In refers to enclosed spaces, on to surfaces and at to particular points or locations.",
    formula:"in a room | on a table | at school",
    examples:[
      ["The keys are on the table.","Kalitlar stol ustida."],
      ["She lives in London.","U Londonda yashaydi."]
    ],
    question:"The picture is ___ the wall.",
    answer:"on",
    explanation:"Yuzada joylashgan narsalar bilan on ishlatiladi."
  },
  {
    title:"Linking Words",
    category:"IELTS Writing",
    rule:"Linking expressions connect ideas and improve coherence.",
    formula:"Addition: moreover | Contrast: however | Result: therefore",
    examples:[
      ["Moreover, public transport is affordable.","Bundan tashqari, jamoat transporti arzon."],
      ["However, this approach has limitations.","Biroq, bu yondashuvning cheklovlari bor."]
    ],
    question:"The policy was expensive. ___, it was effective.",
    answer:"however",
    explanation:"Qarama-qarshi fikr uchun however ishlatiladi."
  },
  {
    title:"Complex Sentences",
    category:"IELTS Writing",
    rule:"Combine an independent clause with one or more dependent clauses.",
    formula:"Main clause + although/because/while + dependent clause",
    examples:[
      ["Although it was raining, we continued working.","Yomg‘ir yog‘ayotgan bo‘lsa-da, ishlashda davom etdik."],
      ["People exercise because it improves health.","Odamlar sog‘liqni yaxshilagani uchun mashq qilishadi."]
    ],
    question:"___ it was difficult, she completed the task.",
    answer:"although",
    explanation:"Although qarama-qarshilikni ifodalaydi."
  },
  {
    title:"Inversion",
    category:"Advanced Grammar",
    rule:"Inversion places an auxiliary verb before the subject for emphasis.",
    formula:"Negative adverbial + auxiliary + subject + verb",
    examples:[
      ["Never have I seen such a beautiful place.","Men hech qachon bunday go‘zal joyni ko‘rmaganman."],
      ["Rarely do people consider this issue.","Odamlar bu masalani kamdan-kam hisobga olishadi."]
    ],
    question:"Never ___ I experienced such difficulty.",
    answer:"have",
    explanation:"Never gap boshida kelganda inversion ishlatiladi."
  },
  {
    title:"Cleft Sentences",
    category:"Advanced Grammar",
    rule:"Used to emphasise a particular part of a sentence.",
    formula:"It is/was + emphasised information + that/who...",
    examples:[
      ["It is education that drives progress.","Taraqqiyotga aynan ta’lim turtki beradi."],
      ["It was John who solved the problem.","Muammoni aynan John hal qilgan."]
    ],
    question:"It is technology ___ changes society.",
    answer:"that",
    explanation:"Cleft sentence da that ishlatilishi mumkin."
  },
  {
    title:"Participle Clauses",
    category:"Advanced Grammar",
    rule:"Participle clauses make sentences more concise by reducing relative or adverbial clauses.",
    formula:"V-ing / V3 + main clause",
    examples:[
      ["Having finished the work, she went home.","Ishni tugatib, u uyga ketdi."],
      ["Built in 1900, the building is still in use.","1900-yilda qurilgan bino hanuz ishlatiladi."]
    ],
    question:"___ the report, he submitted it. (finish)",
    answer:"having finished",
    explanation:"Oldin bajarilgan ish uchun having + V3."
  },
  {
    title:"Parallel Structure",
    category:"Advanced Grammar",
    rule:"Items in a list or comparison should use grammatically consistent forms.",
    formula:"A + B + C in the same grammatical form",
    examples:[
      ["The course develops reading, writing and speaking.","Kurs o‘qish, yozish va gapirishni rivojlantiradi."],
      ["She enjoys reading, writing and travelling.","U o‘qish, yozish va sayohat qilishni yoqtiradi."]
    ],
    question:"He enjoys reading, writing and ___.",
    answer:"travelling",
    explanation:"Ro‘yxatdagi fe’llar bir xil -ing shaklida bo‘lishi kerak."
  },
  {
    title:"Hedging Language",
    category:"IELTS Writing",
    rule:"Hedging makes academic claims cautious rather than absolute.",
    formula:"may / might / could / appears to / tends to / is likely to",
    examples:[
      ["This may indicate a change in behaviour.","Bu xulq-atvordagi o‘zgarishni ko‘rsatishi mumkin."],
      ["The results appear to support the theory.","Natijalar nazariyani qo‘llab-quvvatlayotgandek ko‘rinadi."]
    ],
    question:"The results ___ suggest a positive trend.",
    answer:"may",
    explanation:"May ehtimollikni bildiradi."
  }
];

function renderGrammar() {
  const grid = $("grammarGrid");
  if (!grid) return;

  grid.innerHTML = grammarLessons.map((lesson, index) => `
    <button class="grammar-topic ${index === 0 ? "active" : ""}" data-lesson="${index}">
      <small>${escapeHTML(lesson.category.toUpperCase())} · LESSON ${index + 1}</small>
      <b>${escapeHTML(lesson.title)}</b>
    </button>
  `).join("");

  grid.onclick = event => {
    const button = event.target.closest("[data-lesson]");
    if (!button) return;
    showGrammarLesson(Number(button.dataset.lesson));
  };

  showGrammarLesson(0);
}

function showGrammarLesson(index) {
  const lesson = grammarLessons[index];
  if (!lesson) return;

  $$(".grammar-topic").forEach(el => el.classList.remove("active"));
  $(`.grammar-topic[data-lesson="${index}"]`)?.classList.add("active");

  $("grammarDetail").innerHTML = `
    <p class="eyebrow">${escapeHTML(lesson.category)} · LESSON ${index + 1}</p>
    <h3>${escapeHTML(lesson.title)}</h3>
    <h4>Explanation</h4>
    <p>${escapeHTML(lesson.rule)}</p>
    <h4>Structure / Formula</h4>
    <div class="formula">${escapeHTML(lesson.formula)}</div>
    <h4>Examples</h4>
    ${lesson.examples.map(example => `
      <div class="example-line">
        <b>${escapeHTML(example[0])}</b>
        <small>${escapeHTML(example[1])}</small>
      </div>
    `).join("")}
    <div class="exercise-box">
      <h4>Quick exercise</h4>
      <p>${escapeHTML(lesson.question)}</p>
      <input id="grammarAnswer" type="text" placeholder="Type your answer">
      <button class="primary-btn" id="checkGrammar">Check answer</button>
      <div class="exercise-feedback" id="grammarFeedback"></div>
    </div>
  `;

  $("checkGrammar").addEventListener("click", () => {
    const answer = $("grammarAnswer").value.trim().toLowerCase();
    const correct = lesson.answer.toLowerCase();
    const feedback = $("grammarFeedback");

    if (answer === correct) {
      feedback.textContent = "✓ Correct! " + lesson.explanation;
      feedback.style.color = "#b9d69c";
    } else {
      feedback.textContent = "Not quite. Correct answer: " + lesson.answer +
        ". " + lesson.explanation;
      feedback.style.color = "#e58e83";
    }
  });

  $("grammarAnswer").addEventListener("keydown", event => {
    if (event.key === "Enter") $("checkGrammar").click();
  });
}

/* =========================================
   SPEAKING QUESTION BANK
   100 QUESTIONS FOR EACH PART
   ========================================= */

const speakingParts = {
  1: {
    title: "Part 1 — Interview",
    description: "Short questions about familiar topics, your life and everyday experiences.",
    duration: "4–5 minutes",
    style: "Short answers",
    questions: [
      "Do you work or are you a student?",
      "What do you like most about your studies?",
      "Why did you choose your field of study?",
      "What subject did you enjoy at school?",
      "Do you prefer studying alone or with others?",
      "How do you organise your study time?",
      "What do you usually do in the morning?",
      "Are you an early riser?",
      "What is your favourite part of the day?",
      "Do you prefer mornings or evenings?",
      "How often do you use public transport?",
      "What is your favourite means of transport?",
      "Is public transport popular in your city?",
      "Do you enjoy travelling?",
      "Where would you like to travel in the future?",
      "Do you prefer travelling alone or with friends?",
      "What kind of weather do you like?",
      "Does the weather affect your mood?",
      "What is the weather usually like in your country?",
      "Do you prefer hot or cold weather?",
      "Do you enjoy reading books?",
      "What kinds of books do you read?",
      "Did you read a lot as a child?",
      "Do you prefer paper books or digital books?",
      "How often do you visit libraries?",
      "What kind of music do you enjoy?",
      "Do you listen to music while studying?",
      "Have your musical preferences changed?",
      "Can you play a musical instrument?",
      "Do you enjoy watching films?",
      "What type of films do you prefer?",
      "Do you prefer watching films at home or at the cinema?",
      "How often do you watch television?",
      "Do you use social media every day?",
      "Which social media platform do you use most?",
      "Do you think people spend too much time online?",
      "How often do you use the internet for learning?",
      "What technology do you use most often?",
      "Do you enjoy taking photographs?",
      "Do you prefer photographs or videos?",
      "What is your favourite food?",
      "Do you enjoy cooking?",
      "Who usually prepares meals in your home?",
      "Do you prefer eating at home or in restaurants?",
      "What food is popular in your country?",
      "Do you drink tea or coffee?",
      "How often do you eat fruit?",
      "Do you prefer sweet or savoury food?",
      "Do you enjoy shopping?",
      "Do you prefer shopping online or in stores?",
      "How often do you buy clothes?",
      "What do you usually spend money on?",
      "Do you save money regularly?",
      "Did you enjoy sports at school?",
      "Do you exercise regularly?",
      "What sports are popular in your country?",
      "Do you prefer watching or playing sports?",
      "Do you enjoy walking?",
      "Where do you usually go for a walk?",
      "Do you like spending time outdoors?",
      "What do you do to relax?",
      "How do you deal with stress?",
      "Do you prefer quiet or busy places?",
      "What is your favourite place in your city?",
      "Is your hometown a good place to live?",
      "Has your hometown changed in recent years?",
      "Would you like to live in another city?",
      "Do you prefer living in a house or an apartment?",
      "What is your favourite room at home?",
      "Do you enjoy gardening?",
      "Do you have plants at home?",
      "Are you interested in history?",
      "What historical places have you visited?",
      "Do you think history should be taught at school?",
      "What historical period interests you most?",
      "Do you enjoy learning languages?",
      "Why are you learning English?",
      "Which language would you like to learn next?",
      "Is it easier to learn languages as a child?",
      "How do you practise speaking English?",
      "Do you prefer writing by hand or typing?",
      "How often do you make plans?",
      "Do you enjoy making lists?",
      "Are you good at remembering names?",
      "Do you often use a calendar?",
      "Do you enjoy meeting new people?",
      "Are you more comfortable in small groups?",
      "Do you prefer spending time with family or friends?",
      "How often do you visit relatives?",
      "Do you enjoy celebrating birthdays?",
      "What is your favourite celebration?",
      "Do you enjoy receiving gifts?",
      "What kind of gifts do you like giving?",
      "Do you like animals?",
      "Did you have a pet as a child?",
      "Would you like to have a pet?",
      "Do you prefer working indoors or outdoors?",
      "What kind of job would you like in the future?",
      "What skills are important for your future career?"
    ],
    cue: "Answer naturally. Give a direct answer, a reason and a short example."
  },
  2: {
    title: "Part 2 — Long Turn",
    description: "Speak about a topic for up to two minutes after one minute of preparation.",
    duration: "3–4 minutes",
    style: "Long individual talk",
    questions: [
      "Describe a person who has influenced your life.",
      "Describe a teacher who helped you learn something important.",
      "Describe a friend you enjoy spending time with.",
      "Describe someone you admire.",
      "Describe a person who has an interesting job.",
      "Describe a family member you are close to.",
      "Describe a person who is good at solving problems.",
      "Describe someone who taught you a useful skill.",
      "Describe a person you would like to meet.",
      "Describe a successful person you know.",
      "Describe a book that you enjoyed reading.",
      "Describe a film that made you think.",
      "Describe a historical event you find interesting.",
      "Describe a subject you would like to study.",
      "Describe a language you would like to learn.",
      "Describe a useful website you often visit.",
      "Describe a piece of technology you find useful.",
      "Describe an educational video you watched.",
      "Describe a scientific discovery that interests you.",
      "Describe a skill you learned online.",
      "Describe a place you would like to visit.",
      "Describe a city you enjoyed visiting.",
      "Describe a beautiful natural place.",
      "Describe a quiet place where you like to study.",
      "Describe a place that is important to your country.",
      "Describe a building with interesting architecture.",
      "Describe a park or garden you enjoy visiting.",
      "Describe a place where you go to relax.",
      "Describe a country you would like to live in.",
      "Describe a place you visited as a child.",
      "Describe a memorable journey.",
      "Describe a time when you learned something new.",
      "Describe a difficult decision you made.",
      "Describe a goal you achieved.",
      "Describe a time when you helped someone.",
      "Describe a time when someone helped you.",
      "Describe a time when you solved a problem.",
      "Describe a challenge you overcame.",
      "Describe a time when you were proud of yourself.",
      "Describe an important change in your life.",
      "Describe a useful object you own.",
      "Describe a gift you received.",
      "Describe something you bought and found useful.",
      "Describe a photograph you like.",
      "Describe an item you would like to buy.",
      "Describe a piece of equipment you use regularly.",
      "Describe an invention that changed the world.",
      "Describe something old that your family keeps.",
      "Describe an object that is important to you.",
      "Describe something you made yourself.",
      "Describe a hobby you enjoy.",
      "Describe a sport you would like to try.",
      "Describe an activity you do to stay healthy.",
      "Describe a creative activity you enjoy.",
      "Describe a skill you want to improve.",
      "Describe something you do in your free time.",
      "Describe a new activity you tried recently.",
      "Describe a time when you worked in a team.",
      "Describe a competition you took part in.",
      "Describe an achievement you are proud of.",
      "Describe a memorable meal.",
      "Describe a traditional dish from your country.",
      "Describe a restaurant you enjoyed visiting.",
      "Describe a special celebration.",
      "Describe a festival in your country.",
      "Describe a time when you tried unusual food.",
      "Describe a meal you prepared yourself.",
      "Describe a family tradition.",
      "Describe a celebration you attended recently.",
      "Describe a time when you received good news.",
      "Describe a time when you waited for something.",
      "Describe a time when you were late.",
      "Describe a time when you lost something important.",
      "Describe a time when you changed your opinion.",
      "Describe a time when you gave someone advice.",
      "Describe a time when you received useful advice.",
      "Describe a time when you had to learn quickly.",
      "Describe a time when you used your imagination.",
      "Describe a time when you made a mistake.",
      "Describe a time when you organised an event.",
      "Describe a time when you used public transport.",
      "Describe a journey that did not go as planned.",
      "Describe a place with a lot of traffic.",
      "Describe a time when you travelled with friends.",
      "Describe a long walk you enjoyed.",
      "Describe a time when you visited a museum.",
      "Describe a time when you saw something beautiful.",
      "Describe an environmental problem in your area.",
      "Describe something you do to protect the environment.",
      "Describe a person who cares about nature.",
      "Describe a time when you used technology to solve a problem.",
      "Describe a useful app on your phone.",
      "Describe a website you would recommend.",
      "Describe a future career you are interested in.",
      "Describe a job that is important to society.",
      "Describe a subject you found difficult.",
      "Describe a time when you studied for an important exam.",
      "Describe a plan you have for the future.",
      "Describe a country where you would like to study.",
      "Describe a personal quality you want to develop."
    ],
    cue: "Include what it was, when it happened, details and why it was important."
  },
  3: {
    title: "Part 3 — Discussion",
    description: "Discuss broader issues, compare ideas and explain your opinions.",
    duration: "4–5 minutes",
    style: "Extended discussion",
    questions: [
      "Why is education important for economic development?",
      "Should universities focus more on practical skills?",
      "How has online learning changed education?",
      "Do examinations accurately measure ability?",
      "Should higher education be free?",
      "What makes a good teacher?",
      "How can schools encourage creativity?",
      "Is studying abroad beneficial for young people?",
      "How might education change in the future?",
      "What role does technology play in education?",
      "What are the main causes of environmental problems?",
      "Should individuals or governments be more responsible for protecting nature?",
      "How can cities reduce air pollution?",
      "Why is biodiversity important?",
      "Should companies be required to reduce emissions?",
      "How can children learn to protect the environment?",
      "What are the advantages of renewable energy?",
      "Is recycling enough to solve waste problems?",
      "How might climate change affect future generations?",
      "Should economic growth be prioritised over environmental protection?",
      "How has technology changed communication?",
      "Can artificial intelligence replace human workers?",
      "What are the disadvantages of relying on technology?",
      "Should children have access to smartphones?",
      "How can people protect their personal information online?",
      "Will robots become common in workplaces?",
      "Does technology make people less social?",
      "What inventions have had the greatest impact?",
      "How might transport technology develop?",
      "Should governments invest more in scientific research?",
      "Why do people move from rural areas to cities?",
      "What problems are caused by rapid urbanisation?",
      "How can governments reduce income inequality?",
      "Is it important to preserve cultural traditions?",
      "How does migration influence society?",
      "Why do some people prefer living in large cities?",
      "Should public services be available to everyone?",
      "How can communities support older people?",
      "What makes a society successful?",
      "How might family structures change in the future?",
      "What qualities make someone a good leader?",
      "Is salary the most important factor when choosing a job?",
      "How can employers improve workplace productivity?",
      "Should people change careers during their lives?",
      "What are the benefits of working in a team?",
      "How has remote working affected businesses?",
      "Why is job satisfaction important?",
      "Should schools teach entrepreneurship?",
      "How might the job market change in the future?",
      "What skills will be important for future workers?",
      "Why do people enjoy travelling?",
      "How can tourism benefit local communities?",
      "What problems can mass tourism cause?",
      "Should governments limit the number of tourists?",
      "How has international travel changed?",
      "Why are historical sites important?",
      "How can countries protect their cultural heritage?",
      "Does globalisation threaten local traditions?",
      "Why do people enjoy visiting museums?",
      "How might tourism develop in the future?",
      "Why is physical activity important?",
      "How can governments encourage healthy lifestyles?",
      "Should healthcare be free for everyone?",
      "How does advertising influence food choices?",
      "Why are mental health discussions important?",
      "What causes stress among young people?",
      "How can workplaces support employee well-being?",
      "Should schools teach nutrition?",
      "How has modern life affected people's health?",
      "What role does sport play in society?",
      "Why do some people prefer online shopping?",
      "How does advertising affect consumers?",
      "Should people save money from a young age?",
      "What are the advantages of international trade?",
      "How can small businesses compete with large companies?",
      "Does competition always improve product quality?",
      "What makes a business successful?",
      "How has online shopping changed local shops?",
      "Should governments support new businesses?",
      "How might consumer habits change in the future?",
      "Why is public transport important in cities?",
      "How can governments reduce traffic congestion?",
      "Should cities prioritise pedestrians or cars?",
      "What are the benefits of cycling?",
      "How might electric vehicles change transport?",
      "Is it better to live near the workplace?",
      "Why do people prefer private cars?",
      "How can transport become more sustainable?",
      "Should public transport be cheaper?",
      "What will cities look like in the future?",
      "Why do people read less than they did in the past?",
      "Should children be encouraged to read fiction?",
      "How do books influence people's thinking?",
      "Is digital information as reliable as printed information?",
      "Why is critical thinking important?",
      "How can people distinguish facts from opinions?",
      "Should libraries remain important in modern society?",
      "How does history help people understand the present?",
      "Why is lifelong learning necessary?",
      "What makes a person successful?"
    ],
    cue: "Give an opinion, explain why, add an example and consider another viewpoint."
  }
};

function getPartQuestions(part) {
  return speakingParts[part].questions;
}

let currentPart = 1;
let currentQuestion = "";
let rouletteBusy = false;

function updatePartInfo() {
  const data = speakingParts[currentPart];

  $("partTitle").textContent = data.title;
  $("partDescription").textContent = data.description;
  $("partDuration").textContent = data.duration;
  $("partStyle").textContent = data.style;

  $("questionLabel").textContent = `PART ${currentPart} · ${data.title.split("—")[1].trim().toUpperCase()}`;
  $("questionText").textContent = "Ready to practise?";
  $("questionHint").textContent = data.cue;

  $("rouletteNote").textContent =
    `${data.questions.length} questions available in Part ${currentPart}.`;
}

$$(".part-tab").forEach(button => {
  button.addEventListener("click", () => {
    currentPart = Number(button.dataset.part);
    $$(".part-tab").forEach(el => el.classList.remove("active"));
    button.classList.add("active");
    updatePartInfo();
  });
});

function addHistory(part, question) {
  speakingHistory.unshift({ part, question, time: new Date().toLocaleString() });
  speakingHistory = speakingHistory.slice(0, 30);
  store.set("speakingHistory", speakingHistory);
  renderHistory();
}

function renderHistory() {
  const history = $("questionHistory");

  if (!speakingHistory.length) {
    history.innerHTML = `<p class="muted">Your questions will appear here.</p>`;
    return;
  }

  history.innerHTML = speakingHistory.map(item => `
    <div class="history-item">
      <small>PART ${item.part} · ${escapeHTML(item.time)}</small>
      ${escapeHTML(item.question)}
    </div>
  `).join("");
}

$("spinBtn").addEventListener("click", () => {
  if (rouletteBusy) return;

  rouletteBusy = true;
  const button = $("spinBtn");
  const card = $("rouletteCard");
  const questions = getPartQuestions(currentPart);

  button.disabled = true;
  button.textContent = "⟳ SPINNING...";
  card.classList.add("spinning");

  let ticks = 0;
  const interval = setInterval(() => {
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    $("questionText").textContent = randomQuestion;
    ticks++;

    if (ticks >= 14) {
      clearInterval(interval);

      let selected;
      do {
        selected = questions[Math.floor(Math.random() * questions.length)];
      } while (questions.length > 1 && selected === currentQuestion);

      currentQuestion = selected;
      $("questionText").textContent = selected;
      $("questionHint").textContent = speakingParts[currentPart].cue;

      card.classList.remove("spinning");
      button.disabled = false;
      button.textContent = "⟳ SPIN AGAIN";

      speakingCount++;
      store.set("speakingCount", speakingCount);
      addHistory(currentPart, selected);
      updateDashboard();
      updateProgress();

      rouletteBusy = false;
    }
  }, 90);
});

$("clearHistory").addEventListener("click", () => {
  speakingHistory = [];
  store.set("speakingHistory", []);
  renderHistory();
  toast("Question history cleared.");
});

$("speakingAnswer").addEventListener("input", () => {
  $("answerWords").textContent =
    wordCount($("speakingAnswer").value) + " words";
});

$("saveAnswer").addEventListener("click", () => {
  const answer = $("speakingAnswer").value.trim();
  if (!answer) return toast("Write your answer first.");

  savedAnswers++;
  store.set("savedAnswers", savedAnswers);
  store.set("lastSpeakingAnswer", answer);
  updateProgress();
  toast("Speaking answer saved.");
});

$("speakingAnswer").value = store.get("lastSpeakingAnswer", "");
$("answerWords").textContent = wordCount($("speakingAnswer").value) + " words";

updatePartInfo();
renderHistory();

/* =========================================
   SPEAKING TIMER
   ========================================= */

let speakingSeconds = 120;
let speakingInterval = null;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateSpeakingTimer() {
  $("speakingTimer").textContent = formatTime(speakingSeconds);
}

$("startSpeakingTimer").addEventListener("click", () => {
  if (speakingInterval) {
    clearInterval(speakingInterval);
    speakingInterval = null;
    $("startSpeakingTimer").textContent = "Resume";
    return;
  }

  $("startSpeakingTimer").textContent = "Pause";

  speakingInterval = setInterval(() => {
    if (speakingSeconds > 0) {
      speakingSeconds--;
      updateSpeakingTimer();
    } else {
      clearInterval(speakingInterval);
      speakingInterval = null;
      $("startSpeakingTimer").textContent = "Start";
      toast("Speaking time is over!");
    }
  }, 1000);
});

$("resetSpeakingTimer").addEventListener("click", () => {
  clearInterval(speakingInterval);
  speakingInterval = null;
  speakingSeconds = 120;
  updateSpeakingTimer();
  $("startSpeakingTimer").textContent = "Start";
});

updateSpeakingTimer();

/* =========================================
   LISTENING PRACTICE
   ========================================= */

const listeningData = [
  {
    title:"Booking a language course",
    text:"Good morning. I would like to register for an English course. My name is Daniel Brown. I am interested in the evening programme because I work during the day. The course begins on the fifteenth of September and lasts for twelve weeks. The registration fee is forty pounds. Classes take place every Tuesday and Thursday at six thirty in the evening. The classroom is number fourteen. Students should bring a notebook and a dictionary. The teacher's name is Mr Wilson.",
    questions:[
      ["What is the student's first name?","Daniel",["Daniel","David","Darren"]],
      ["What programme does he want?","Evening",["Morning","Evening","Weekend"]],
      ["When does the course begin?","15 September",["5 September","15 September","25 September"]],
      ["How many weeks does it last?","12",["8","10","12"]],
      ["How much is the registration fee?","40 pounds",["30 pounds","40 pounds","50 pounds"]]
    ]
  },
  {
    title:"Information about a city park",
    text:"Welcome to Green Valley Park. The park opens every day at seven in the morning and closes at eight in the evening. Visitors can use the tennis courts without charge, but they must reserve a time online. The cafe is located beside the lake. Bicycle rental is available near the main entrance. Guided tours begin at eleven in the morning on Saturdays. The park also has a small museum about local wildlife.",
    questions:[
      ["What time does the park open?","7 am",["6 am","7 am","8 am"]],
      ["Which facility is free to use?","Tennis courts",["Swimming pool","Tennis courts","Museum"]],
      ["Where is the cafe?","Beside the lake",["Near the entrance","Beside the lake","Next to the museum"]],
      ["Where can visitors rent bicycles?","Main entrance",["Main entrance","Cafe","Museum"]],
      ["When do guided tours begin?","11 am",["9 am","10 am","11 am"]]
    ]
  },
  {
    title:"University group project",
    text:"Three students are discussing a research project about renewable energy. They decide to focus on solar power because information is widely available. Their presentation will take place on the twenty-second of October. Maria will prepare the introduction, James will collect statistics, and Ahmed will design the slides. They agree to meet in the library every Wednesday afternoon. Their final presentation should last fifteen minutes.",
    questions:[
      ["What is the project about?","Renewable energy",["Space exploration","Renewable energy","Public transport"]],
      ["Which energy source will they focus on?","Solar power",["Wind power","Solar power","Hydropower"]],
      ["When is the presentation?","22 October",["12 October","20 October","22 October"]],
      ["Who will collect statistics?","James",["Maria","James","Ahmed"]],
      ["Where will they meet?","Library",["Library","Laboratory","Cafeteria"]]
    ]
  },
  {
    title:"Lecture on renewable energy",
    text:"Today we will examine the development of renewable energy. Solar power has become more affordable because manufacturing costs have fallen. Wind energy is another important source, particularly in coastal regions. However, both sources depend on weather conditions. Energy storage is therefore essential. Modern batteries can store electricity for use when generation is low. Researchers are also investigating hydrogen as a possible long-term storage solution. Governments can support development through research funding and investment in infrastructure.",
    questions:[
      ["Why has solar power become more affordable?","Manufacturing costs have fallen",["Demand has disappeared","Manufacturing costs have fallen","Electricity is free"]],
      ["Where is wind energy particularly important?","Coastal regions",["Deserts","Coastal regions","Mountains"]],
      ["What is essential when generation is low?","Energy storage",["More roads","Energy storage","Coal production"]],
      ["What alternative storage solution is being investigated?","Hydrogen",["Petrol","Hydrogen","Wood"]],
      ["How can governments support development?","Research funding",["Reducing education","Research funding","Stopping investment"]]
    ]
  }
];

let currentSpeech = null;

function renderListening() {
  const section = Number($("listeningSection").value);
  const data = listeningData[section];

  $("audioTitle").textContent = data.title;
  $("audioDescription").textContent = `Section ${section + 1} · ${data.questions.length} questions`;

  $("listeningQuestions").innerHTML = data.questions.map((q, i) => `
    <div class="question-item" data-listen-item="${i}">
      <p><b>${i + 1}.</b> ${escapeHTML(q[0])}</p>
      ${q[2] ? `
        ${q[2].map(option => `
          <label class="option-label">
            <input type="radio" name="listen${i}" value="${escapeHTML(option)}">
            ${escapeHTML(option)}
          </label>
        `).join("")}
      ` : `
        <input type="text" id="listen${i}" placeholder="Your answer">
      `}
    </div>
  `).join("");

  $("listeningResult").textContent = "";
}

$("listeningSection").addEventListener("change", renderListening);

$("playAudio").addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    toast("Text-to-speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const data = listeningData[Number($("listeningSection").value)];
  currentSpeech = new SpeechSynthesisUtterance(data.text);
  currentSpeech.lang = "en-GB";
  currentSpeech.rate = 0.85;

  const voices = speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith("en-GB")) ||
                      voices.find(v => v.lang.startsWith("en"));
  if (englishVoice) currentSpeech.voice = englishVoice;

  speechSynthesis.speak(currentSpeech);
});

$("stopAudio").addEventListener("click", () => {
  window.speechSynthesis?.cancel();
});

$("checkListening").addEventListener("click", () => {
  const data = listeningData[Number($("listeningSection").value)];
  let score = 0;

  data.questions.forEach((q, i) => {
    const item = $(`[data-listen-item="${i}"]`);
    const selected = item.querySelector(`input[type="radio"]:checked`);
    const textInput = item.querySelector(`input[type="text"]`);
    const answer = (selected?.value || textInput?.value || "").trim().toLowerCase();
    const correct = q[1].toLowerCase();

    const isCorrect = answer === correct;
    item.classList.toggle("correct", isCorrect);
    item.classList.toggle("incorrect", !isCorrect);
    if (isCorrect) score++;
  });

  $("listeningResult").textContent = `Score: ${score}/${data.questions.length}`;
  testCount++;
  store.set("testCount", testCount);
  updateDashboard();
  updateProgress();
});

$("resetListening").addEventListener("click", renderListening);

renderListening();

/* =========================================
   READING PRACTICE
   ========================================= */

const readingData = [
  {
    title:"Urban Green Spaces",
    text:`<h3>Urban Green Spaces</h3>
    <p>Urban green spaces are an important feature of modern cities. Parks, gardens and tree-lined streets provide residents with places to relax and exercise. They can also improve the environmental quality of urban areas.</p>
    <p>One major benefit of green spaces is their ability to reduce the urban heat island effect. Buildings and roads absorb heat during the day and release it slowly. Trees provide shade and help cool the surrounding environment. Plants also absorb carbon dioxide and can improve air quality.</p>
    <p>Green spaces may have social benefits too. Public parks provide opportunities for people from different backgrounds to meet. Children can play safely, while older residents may use walking paths for exercise. However, these benefits depend on the quality and accessibility of the facilities.</p>
    <p>City planners increasingly recognise the importance of green infrastructure. Nevertheless, rapid urban development can reduce available land. Governments therefore need to balance construction with environmental protection.</p>`,
    questions:[
      ["What can green spaces provide for residents?","places to relax and exercise"],
      ["What effect can trees reduce?","urban heat island effect"],
      ["What gas do plants absorb?","carbon dioxide"],
      ["Who can benefit from walking paths?","older residents"],
      ["What can reduce available land?","rapid urban development"]
    ]
  },
  {
    title:"The History of Public Libraries",
    text:`<h3>The History of Public Libraries</h3>
    <p>Libraries have played an important role in the development of education and public knowledge. In the past, access to books was often limited to wealthy individuals, religious institutions and universities. The development of public libraries gradually changed this situation.</p>
    <p>During the nineteenth century, several countries established publicly funded libraries. These institutions allowed people to borrow books without purchasing them. They also provided quiet places for reading and study. As literacy increased, libraries became important community centres.</p>
    <p>In the digital age, libraries have adapted to new forms of information. Many now provide computers, internet access and digital collections. Librarians also help visitors evaluate information and develop research skills.</p>
    <p>Although some people believe that digital technology will make physical libraries unnecessary, many communities continue to value them. Libraries provide equal access to resources and create opportunities for social learning.</p>`,
    questions:[
      ["Who had limited access to books in the past?","ordinary people"],
      ["What century saw the growth of publicly funded libraries?","nineteenth century"],
      ["What did libraries allow people to borrow?","books"],
      ["What do modern libraries provide besides books?","internet access"],
      ["What do libraries create opportunities for?","social learning"]
    ]
  },
  {
    title:"Renewable Energy Storage",
    text:`<h3>Renewable Energy Storage</h3>
    <p>Renewable energy sources such as wind and solar power are becoming increasingly important. However, electricity generation from these sources can vary according to weather conditions. Solar panels produce less electricity at night, while wind turbines depend on wind speed.</p>
    <p>Energy storage systems help solve this problem. Batteries can store electricity when production is high and release it when demand increases. This can make electricity networks more reliable and reduce the need for traditional power stations.</p>
    <p>Several technologies are being developed. Lithium-ion batteries are widely used because they have high energy density. Pumped hydro storage uses electricity to move water to a higher reservoir, which can later generate electricity. Researchers are also investigating hydrogen storage.</p>
    <p>Despite their advantages, storage systems can be expensive. The production of batteries also requires raw materials. Future research aims to reduce costs, improve efficiency and make storage technologies more sustainable.</p>`,
    questions:[
      ["What affects solar electricity generation?","weather conditions"],
      ["What can batteries store?","electricity"],
      ["Which batteries have high energy density?","lithium-ion batteries"],
      ["What does pumped hydro storage move?","water"],
      ["What is one aim of future research?","reduce costs"]
    ]
  }
];

let readingSeconds = 3600;
let readingInterval = null;

function renderReading() {
  const passage = readingData[Number($("readingPassage").value)];
  $("readingText").innerHTML = passage.text;

  $("readingQuestions").innerHTML = passage.questions.map((q, i) => `
    <div class="question-item" data-reading-item="${i}">
      <p><b>${i + 1}.</b> ${escapeHTML(q[0])}</p>
      <input type="text" id="reading${i}" placeholder="Your answer">
    </div>
  `).join("");

  $("readingResult").textContent = "";
}

$("readingPassage").addEventListener("change", renderReading);

$("checkReading").addEventListener("click", () => {
  const passage = readingData[Number($("readingPassage").value)];
  let score = 0;

  passage.questions.forEach((q, i) => {
    const input = $(`reading${i}`);
    const answer = input.value.trim().toLowerCase();
    const correct = q[1].toLowerCase();

    const isCorrect = answer === correct;
    input.parentElement.classList.toggle("correct", isCorrect);
    input.parentElement.classList.toggle("incorrect", !isCorrect);
    if (isCorrect) score++;
  });

  $("readingResult").textContent = `Score: ${score}/${passage.questions.length}`;
  testCount++;
  store.set("testCount", testCount);
  updateDashboard();
  updateProgress();
});

$("resetReading").addEventListener("click", renderReading);

function updateReadingClock() {
  $("readingClock").textContent = formatTime(readingSeconds);
}

$("readingTimerToggle").addEventListener("click", () => {
  if (readingInterval) {
    clearInterval(readingInterval);
    readingInterval = null;
    $("readingTimerToggle").textContent = "Resume timer";
    return;
  }

  $("readingTimerToggle").textContent = "Pause timer";

  readingInterval = setInterval(() => {
    if (readingSeconds > 0) {
      readingSeconds--;
      updateReadingClock();
    } else {
      clearInterval(readingInterval);
      readingInterval = null;
      $("readingTimerToggle").textContent = "Start timer";
      toast("Reading time is over.");
    }
  }, 1000);
});

$("readingTimerReset").addEventListener("click", () => {
  clearInterval(readingInterval);
  readingInterval = null;
  readingSeconds = 3600;
  updateReadingClock();
  $("readingTimerToggle").textContent = "Start 60-minute timer";
});

renderReading();
updateReadingClock();

/* =========================================
   WRITING WORKSPACE
   ========================================= */

const writingTasks = {
  1: {
    eyebrow:"ACADEMIC REPORT",
    title:"Task 1 — Describe visual information",
    target:"150+ words",
    prompt:"The chart below shows changes in the use of three types of public transport in a city between 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
  },
  2: {
    eyebrow:"ACADEMIC ESSAY",
    title:"Task 2 — Essay writing",
    target:"250+ words",
    prompt:"Some people believe that university education should be free for everyone. Others think students should pay for their own education. Discuss both views and give your own opinion."
  }
};

let currentWritingTask = 1;

function setWritingTask(task) {
  currentWritingTask = task;

  $$(".tab[data-task]").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.task) === task);
  });

  const data = writingTasks[task];
  $("writingEyebrow").textContent = data.eyebrow;
  $("writingTitle").textContent = data.title;
  $("writingTarget").textContent = data.target;
  $("writingPrompt").textContent = data.prompt;
  $("writingEditor").value = store.get("writingTask" + task, "");
  updateWritingCount();
}

$$(".tab[data-task]").forEach(button => {
  button.addEventListener("click", () => setWritingTask(Number(button.dataset.task)));
});

function updateWritingCount() {
  $("writingWords").textContent =
    wordCount($("writingEditor").value) + " words";
}

$("writingEditor").addEventListener("input", updateWritingCount);

$("saveWriting").addEventListener("click", () => {
  store.set("writingTask" + currentWritingTask, $("writingEditor").value);
  toast("Writing draft saved.");
});

$("clearWriting").addEventListener("click", () => {
  if (!confirm("Clear this writing draft?")) return;
  $("writingEditor").value = "";
  store.set("writingTask" + currentWritingTask, "");
  updateWritingCount();
});

setWritingTask(1);

/* =========================================
   IELTS BAND CALCULATOR
   ========================================= */

function getBand(score, type) {
  const listening = [
    [39,40,9],[37,38,8.5],[35,36,8],[32,34,7.5],
    [30,31,7],[26,29,6.5],[23,25,6],[18,22,5.5],
    [16,17,5],[13,15,4.5],[10,12,4]
  ];

  const reading = [
    [39,40,9],[37,38,8.5],[35,36,8],[33,34,7.5],
    [30,32,7],[27,29,6.5],[23,26,6],[19,22,5.5],
    [15,18,5],[13,14,4.5],[10,12,4]
  ];

  const table = type === "listening" ? listening : reading;
  const match = table.find(([min, max]) => score >= min && score <= max);
  return match ? match[2] : score >= 0 && score <= 40 ? "Below 4.0" : "Invalid";
}

$("calculateBand").addEventListener("click", () => {
  const listening = Number($("listeningScore").value);
  const reading = Number($("readingScore").value);

  if (
    $("listeningScore").value === "" ||
    $("readingScore").value === "" ||
    listening < 0 || listening > 40 ||
    reading < 0 || reading > 40
  ) {
    $("bandResult").textContent = "Enter valid scores from 0 to 40.";
    return;
  }

  $("bandResult").innerHTML =
    `Listening: ${getBand(listening, "listening")} band<br>` +
    `Academic Reading: ${getBand(reading, "reading")} band`;
});

/* =========================================
   FOCUS TIMER
   ========================================= */

let focusSeconds = 25 * 60;
let focusDuration = 25 * 60;
let focusInterval = null;

function updateFocusClock() {
  $("focusClock").textContent = formatTime(focusSeconds);
}

$$(".focus-modes .tab").forEach(button => {
  button.addEventListener("click", () => {
    clearInterval(focusInterval);
    focusInterval = null;

    $$(".focus-modes .tab").forEach(el => el.classList.remove("active"));
    button.classList.add("active");

    focusDuration = Number(button.dataset.minutes) * 60;
    focusSeconds = focusDuration;

    $("focusStart").textContent = "Start";
    $("focusStatus").textContent = "Ready for your next focused session.";
    updateFocusClock();
  });
});

$("focusStart").addEventListener("click", () => {
  if (focusInterval) {
    clearInterval(focusInterval);
    focusInterval = null;
    $("focusStart").textContent = "Resume";
    $("focusStatus").textContent = "Timer paused.";
    return;
  }

  if (focusSeconds <= 0) return;

  $("focusStart").textContent = "Pause";
  $("focusStatus").textContent = "Stay focused. You can do this.";

  focusInterval = setInterval(() => {
    focusSeconds--;
    updateFocusClock();

    if (focusSeconds <= 0) {
      clearInterval(focusInterval);
      focusInterval = null;
      $("focusStart").textContent = "Start";
      $("focusStatus").textContent = "Session completed!";
      toast("Focus session completed!");
    }
  }, 1000);
});

$("focusReset").addEventListener("click", () => {
  clearInterval(focusInterval);
  focusInterval = null;
  focusSeconds = focusDuration;
  updateFocusClock();
  $("focusStart").textContent = "Start";
  $("focusStatus").textContent = "Timer reset.";
});

updateFocusClock();

/* =========================================
   DAILY GOALS
   ========================================= */

const todayKey = new Date().toISOString().slice(0, 10);
let goalState = store.get("goals_" + todayKey, [false, false, false, false]);

function updateGoals() {
  $$(".daily-goal").forEach((checkbox, index) => {
    checkbox.checked = Boolean(goalState[index]);
  });

  const completed = goalState.filter(Boolean).length;
  const percentage = Math.round(completed / 4 * 100);

  $("goalCount").textContent = `${completed}/4`;
  $("dashGoals").textContent = `${percentage}%`;
}

$$(".daily-goal").forEach((checkbox, index) => {
  checkbox.addEventListener("change", () => {
    goalState[index] = checkbox.checked;
    store.set("goals_" + todayKey, goalState);
    updateGoals();
  });
});

updateGoals();

/* =========================================
   DASHBOARD & PROGRESS
   ========================================= */

function updateDashboard() {
  $("dashWords").textContent = learnedWords.size;
  $("dashQuestions").textContent = speakingCount;
  $("dashTests").textContent = testCount;
  updateGoals();
}

function updateProgress() {
  $("progressWords").textContent = learnedWords.size;
  $("progressQuestions").textContent = speakingCount;
  $("progressTests").textContent = testCount;
  $("progressAnswers").textContent = savedAnswers;
}

function updateCountdown() {
  const target = new Date("2026-12-18T00:00:00");
  const now = new Date();
  const days = Math.max(0, Math.ceil((target - now) / 86400000));

  $("countdown").textContent = days + " days";

  const total = Math.ceil((target - new Date("2026-11-18T00:00:00")) / 86400000);
  const elapsed = total - days;
  const percentage = Math.min(100, Math.max(0, elapsed / total * 100));

  $("deadlineProgress").style.width = percentage + "%";
}

function updateProgressPage() {
  updateDashboard();
  updateProgress();
}

updateDashboard();
updateProgress();

/* =========================================
   INITIALISE
   ========================================= */

function init() {
  initVocabulary();
  renderGrammar();
  updateCountdown();
  updateDashboard();
  updateProgress();
}

init();

console.log("IELTS PRO loaded successfully.");
console.log("Vocabulary entries:", vocabulary.length);
console.log("Grammar lessons:", grammarLessons.length);
console.log("Speaking Part 1:", speakingParts[1].questions.length);
console.log("Speaking Part 2:", speakingParts[2].questions.length);
console.log("Speaking Part 3:", speakingParts[3].questions.length);
