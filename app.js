const APP_VERSION = "1.1.2";
const BUILD_TIME = "2026-08-08 19:30";
const STORAGE_KEY = "mapleSpecLabV10Dev5";
const GITHUB_REPOSITORY = "PerthroIne/MapleSpecLab";

const STAT_META = {
  attack: ["공격력", false], attack_pct: ["공격력 %", true],
  main_stat: ["주스탯", false], main_stat_pct: ["주스탯 %", true],
  critical_rate: ["크리티컬 확률", true], critical_damage: ["크리티컬 데미지", true],
  attack_speed: ["공격 속도", true], damage: ["데미지", true],
  damage_amp: ["데미지 증폭", true], basic_damage: ["기본 공격 데미지", true],
  skill_damage: ["스킬 데미지", true], defense_pen: ["방어 관통력", true],
  boss_damage: ["보스 몬스터 데미지", true], normal_damage: ["일반 몬스터 데미지", true],
  min_damage: ["최소 데미지 배율", true], max_damage: ["최대 데미지 배율", true],
  final_damage: ["최종 데미지", true], mos_level: ["모스렙", false],
  third_level: ["3차 스킬 레벨", false], fourth_level: ["4차 스킬 레벨", false],
  all_skill_level: ["모든 스킬 레벨", false], status_damage: ["상태이상 데미지", true], hp: ["최대 HP", false],
  accuracy: ["명중", false], evasion: ["회피", false]
};


const STAT_GROUPS = [
  { title: "기본 능력치", description: "공격력과 주스탯처럼 모든 계산의 기반이 되는 값입니다.", keys: ["attack", "attack_pct", "main_stat", "main_stat_pct", "hp"] },
  { title: "치명타와 공격 속도", description: "치명타 발생과 공격 주기에 관련된 능력치입니다.", keys: ["critical_rate", "critical_damage", "attack_speed"] },
  { title: "피해 증가", description: "공통 피해, 증폭, 기본 공격 및 스킬 피해를 모아 표시합니다.", keys: ["damage", "damage_amp", "basic_damage", "skill_damage", "final_damage"] },
  { title: "대상별 피해와 배율", description: "보스·일반 몬스터 보너스와 최소·최대 데미지 배율입니다.", keys: ["boss_damage", "normal_damage", "min_damage", "max_damage", "status_damage"] },
  { title: "관통과 성장", description: "방어 관통 및 스킬 레벨 관련 능력치입니다.", keys: ["defense_pen", "mos_level", "third_level", "fourth_level", "all_skill_level"] },
  { title: "전투 보조", description: "명중과 회피처럼 전투 안정성에 영향을 주는 값입니다.", keys: ["accuracy", "evasion"] }
];

const DEFAULT_STATS = {
  attack: 0, attack_pct: 0, main_stat: 0, main_stat_pct: 0, critical_rate: 0, critical_damage: 0,
  attack_speed: 0, damage: 0, damage_amp: 0, basic_damage: 0, skill_damage: 0, defense_pen: 0,
  boss_damage: 0, normal_damage: 0, min_damage: 0, max_damage: 0, final_damage: 0, mos_level: 0,
  third_level: 0, fourth_level: 0, all_skill_level: 0, status_damage: 0, hp: 0, accuracy: 0, evasion: 0
};

const ALIASES = [
  ["보스 몬스터 데미지", "boss_damage"], ["일반 몬스터 데미지", "normal_damage"],
  ["최소 데미지 배율", "min_damage"], ["최대 데미지 배율", "max_damage"],
  ["크리티컬 데미지", "critical_damage"], ["크리티컬 확률", "critical_rate"],
  ["기본 공격 데미지", "basic_damage"], ["스킬 데미지", "skill_damage"],
  ["방어 관통력", "defense_pen"], ["공격 속도", "attack_speed"],
  ["데미지 증폭", "damage_amp"], ["최종 데미지", "final_damage"],
  ["3차 스킬 레벨", "third_level"], ["4차 스킬 레벨", "fourth_level"],
  ["모든 스킬 레벨", "all_skill_level"], ["주 스탯", "main_stat"],
  ["주스탯", "main_stat"], ["최대 HP", "hp"], ["공격력", "attack"],
  ["명중", "accuracy"], ["회피", "evasion"], ["데미지", "damage"]
];

let state = {
  stats: structuredClone(DEFAULT_STATS),
  images: [],
  ocr: {},
  ocrReview: {},
  changes: [],
  deferredInstallPrompt: null,
  companionDb: null,
  companionSelections: {},
  equipmentImages: [],
  equipmentBeforeImages: [],
  equipmentAfterImages: [],
  abilityBeforeImages: [],
  abilityAfterImages: [],
  companionInventory: {},
  companionInventoryImages: {epic:[], unique:[], legendary:[]},
  pendingCompanionDetections: [],
  optimizerResults: [],
  pendingOcrDiffs: {},
  pendingAbilityRows: {before: [], after: []},
  pendingEquipmentRows: {before: [], after: []},
  savedCompanionTeam: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function officialGuideEntry(key, topic = false) {
  const guide = window.MAPLE_OFFICIAL_GUIDE;
  return topic ? guide?.topics?.[key] : guide?.stats?.[key];
}

function officialHelpButton(key, topic = false, label = "공식 설명 보기") {
  if (!officialGuideEntry(key, topic)) return "";
  return `<button class="official-help-button" data-official-help="${key}" data-help-topic="${topic ? "1" : "0"}" type="button" aria-label="${label}" title="${label}">ⓘ</button>`;
}

function openOfficialHelp(key, topic = false) {
  const guide = window.MAPLE_OFFICIAL_GUIDE;
  const entry = officialGuideEntry(key, topic);
  const dialog = $("#officialHelpDialog");
  if (!guide || !entry || !dialog) return;
  $("#officialHelpTitle").textContent = entry.title;
  $("#officialHelpSummary").textContent = entry.summary;
  $("#officialHelpDetail").textContent = entry.detail;
  const cap = $("#officialHelpCap");
  cap.textContent = entry.cap || "";
  cap.hidden = !entry.cap;
  $("#officialHelpSection").textContent = entry.section ? `관련 안내: ${entry.section}` : "";
  $("#officialHelpLimitation").hidden = !entry.limitation;
  $("#officialHelpSource").href = guide.sourceUrl;
  $("#officialHelpSource").textContent = `${guide.sourceLabel}에서 확인`;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function setupOfficialGuideUI() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-official-help]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    openOfficialHelp(button.dataset.officialHelp, button.dataset.helpTopic === "1");
  });
  $("#officialHelpClose")?.addEventListener("click", () => $("#officialHelpDialog")?.close());
  $("#officialHelpDialog")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
}

function parseNumber(raw) {
  const text = String(raw ?? "").replaceAll(",", "").replaceAll(" ", "").replace("%", "");
  if (!text) return 0;
  const sign = text.startsWith("-") ? -1 : 1;
  const s = text.replace(/^[+-]/, "");
  const units = [["경", 1e16], ["조", 1e12], ["억", 1e8], ["만", 1e4]];
  let total = 0, matched = false;
  for (const [unit, mult] of units) {
    const match = s.match(new RegExp(`(\\d+(?:\\.\\d+)?)${unit}`));
    if (match) { total += Number(match[1]) * mult; matched = true; }
  }
  const tail = s.replace(/\d+(?:\.\d+)?[경조억만]/g, "");
  if (tail && /^\d+(?:\.\d+)?$/.test(tail)) { total += Number(tail); matched = true; }
  if (matched) return sign * total;
  const nums = text.match(/-?\d+(?:\.\d+)?/g);
  return nums ? Number(nums.at(-1)) : 0;
}

function formatValue(key, value) {
  const percent = STAT_META[key]?.[1];
  const number = Number(value || 0);
  if (percent) return `${number.toLocaleString("ko-KR", {maximumFractionDigits: 3})}%`;
  return number.toLocaleString("ko-KR", {maximumFractionDigits: 3});
}

function factor(p) { return Math.max(0.000001, 1 + Number(p || 0) / 100); }

function damageIndex(stats, target="boss", mode="skill") {
  const attack = Math.max(1, stats.attack || 0) * factor(stats.attack_pct);
  const mainStat = Math.max(1, stats.main_stat || 0) * factor(stats.main_stat_pct);
  const avgMultiplier = Math.max(.000001, ((stats.min_damage || 100) + (stats.max_damage || 100)) / 200);
  const critRate = Math.min(Math.max(stats.critical_rate || 0, 0), 100) / 100;
  const critFactor = 1 + critRate * Math.max(stats.critical_damage || 0, 0) / 100;
  const targetBonus = target === "boss" ? stats.boss_damage : stats.normal_damage;
  const modeBonus = mode === "skill" ? stats.skill_damage : stats.basic_damage;
  const levelBonus =
    (stats.mos_level || 0) * .35 +
    (stats.fourth_level || 0) * .17 +
    (stats.third_level || 0) * .13 +
    (stats.all_skill_level || 0) * .13;
  const speedFactor = Math.max(.000001, Math.min(Math.max(stats.attack_speed || 0, 0), 150) / 100);
  const penetrationFactor = factor((stats.defense_pen || 0) * .25);

  return attack * mainStat * factor(stats.damage) * factor(stats.damage_amp) *
    avgMultiplier * critFactor * factor(targetBonus) * factor(modeBonus) *
    factor(levelBonus) * factor(stats.final_damage) * speedFactor * penetrationFactor;
}

function compare(before, after) {
  const out = {};
  for (const target of ["boss", "normal"]) {
    for (const mode of ["skill", "basic"]) {
      const a = damageIndex(before, target, mode);
      const b = damageIndex(after, target, mode);
      out[`${target}_${mode}`] = a ? (b / a - 1) * 100 : 0;
    }
  }
  return out;
}

function contributionAnalysis(before, after) {
  const base = damageIndex(before, "boss", "skill");
  return Object.keys(STAT_META)
    .filter(key => Number(before[key] || 0) !== Number(after[key] || 0))
    .map(key => {
      const temp = {...before, [key]: after[key]};
      const changed = damageIndex(temp, "boss", "skill");
      return [key, base ? (changed / base - 1) * 100 : 0];
    })
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
}

function saveLocal() {
  // v1.0-dev.7: 입력값은 자동 저장하지 않습니다. 프로필 저장/열기를 사용하세요.
}

function loadLocal() {
  // 이전 개발 버전의 자동 저장값을 불러오지 않습니다.
  try {
    ["mapleSpecLabV10Dev1","mapleSpecLabV10Dev2","mapleSpecLabV10Dev3","mapleSpecLabV10Dev4","mapleSpecLabV10Dev5"].forEach(key => localStorage.removeItem(key));
  } catch {}
}

function activateTab(tabName) {
  const panel = $(`#tab-${tabName}`);
  if (!panel) return;

  $$(".tab").forEach(button =>
    button.classList.toggle("active", button.dataset.tab === tabName)
  );
  $$(".secondary-link").forEach(button =>
    button.classList.toggle("active", button.dataset.tab === tabName)
  );
  $$(".tab-panel").forEach(item =>
    item.classList.toggle("active", item === panel)
  );
  window.scrollTo({top: 0, behavior: "smooth"});
}

function setupTabs() {
  $$(".tab, .secondary-link").forEach(button =>
    button.addEventListener("click", () => activateTab(button.dataset.tab))
  );
  $$('[data-go-tab]').forEach(button =>
    button.addEventListener('click', () => activateTab(button.dataset.goTab))
  );
}


function formatHomeValue(key, value){
  const [,isPercent]=STAT_META[key]||[key,false];
  const number=Number(value||0);
  return `${number.toLocaleString("ko-KR",{maximumFractionDigits:3})}${isPercent?"%":""}`;
}

function renderHomeDashboard(){
  const statKeys=["attack","attack_pct","main_stat","main_stat_pct","hp","critical_rate","critical_damage","attack_speed"];
  const cards=document.querySelector("#homeStatCards");
  if(cards) cards.innerHTML=statKeys.map(key=>`<article class="dashboard-stat-card"><span>${STAT_META[key][0]}${STAT_META[key][1]?" %":""}</span><strong>${formatHomeValue(key,state.stats[key])}</strong></article>`).join("");

  const preview=document.querySelector("#homeOcrPreview");
  if(preview) preview.innerHTML=statKeys.slice(0,12).map(key=>{
    const value=Number(state.stats[key]||0), filled=value!==0;
    return `<article class="ocr-preview-item ${filled?"":"empty"}"><span>${STAT_META[key][0]}</span><strong>${formatHomeValue(key,value)}</strong><em>${filled?"입력됨":"미입력"}</em></article>`;
  }).join("");

  const team=getBaselineCompanionTeam();
  const teamBox=document.querySelector("#homeCurrentCompanionTeam");
  const count=document.querySelector("#homeTeamCount");
  const stateLabel=document.querySelector("#homeProfileTeamState");
  const updatedLabel=document.querySelector("#homeProfileUpdated");
  const saveStateLabel=document.querySelector("#homeProfileSaveState");
  if(count) count.textContent=`${team.length}/7`;
  if(stateLabel) stateLabel.textContent=team.length===7?"등록 완료":"미등록";
  if(teamBox){
    teamBox.innerHTML=team.length?team.slice(0,7).map(x=>`<div class="dashboard-team-member"><img src="${x.companion.icon_data||x.companion.icon}" alt="${x.companion.name}"><b>${x.companion.name}</b><small>Lv.${x.level}</small></div>`).join(""):'<p class="dashboard-empty">현재 사용 중인 동료를 등록해 주세요.</p>';
  }

  const equipment=document.querySelector("#homeEquipmentSummary");
  const ability=document.querySelector("#homeAbilitySummary");
  const makeRows=(source, fallback)=>{
    const rows=(state.changes||[]).filter(row=>String(row.source||"").includes(source)).slice(0,5);
    if(!rows.length) return fallback.map(([icon,title,sub,value])=>`<div class="module-list-row"><span class="module-list-icon">${icon}</span><div><b>${title}</b><small>${sub}</small></div><span>${value}</span></div>`).join("");
    return rows.map(row=>`<div class="module-list-row"><span class="module-list-icon">↔</span><div><b>${STAT_META[row.key]?.[0]||row.key}</b><small>${row.before} → ${row.after}</small></div><span>${Number(row.after)-Number(row.before)>=0?"+":""}${Number(row.after)-Number(row.before)}</span></div>`).join("");
  };
  if(equipment) equipment.innerHTML=makeRows("장비",[["⚔","장비 비교 미등록","현재 장비 A와 변경 장비 B를 입력하세요.","대기"],["＋","OCR 또는 직접 입력","최대 7개 옵션 비교","시작"]]);
  if(ability) ability.innerHTML=makeRows("어빌",[["✦","어빌리티 비교 미등록","현재 어빌 A와 변경 어빌 B를 입력하세요.","대기"],["＋","OCR 또는 직접 입력","최대 7개 슬롯 비교","시작"]]);
}

function renderStats() {
  const grid = $("#statsGrid");
  grid.innerHTML = "";
  for (const group of STAT_GROUPS) {
    const section = document.createElement("details");
    section.className = "stat-group panel";
    section.open = true;
    const fields = group.keys.map(key => {
      const [label, isPercent] = STAT_META[key];
      return `
        <div class="stat-field">
          <label>
            <span class="stat-label-row"><span>${label}${isPercent ? '<span class="unit">%</span>' : ""}</span>${officialHelpButton(key)}</span>
            <input data-stat-key="${key}" inputmode="decimal" value="${state.stats[key] ?? 0}" aria-label="${label}">
          </label>
        </div>`;
    }).join("");
    section.innerHTML = `
      <summary class="stat-group-heading">
        <div>
          <h3>${group.title}</h3>
          <p>${group.description}</p>
        </div>
        <span class="collapse-hint" aria-hidden="true">접기/펼치기</span>
      </summary>
      <div class="stat-group-grid">${fields}</div>`;
    grid.appendChild(section);
  }
  grid.querySelectorAll("input").forEach(input => {
    const updateCurrentStat = () => {
      state.stats[input.dataset.statKey] = parseNumber(input.value);
      syncChangeBefore();
      renderCurrentStateSummary(state.stats);
      saveLocal();
    };
    input.addEventListener("input", updateCurrentStat);
    input.addEventListener("change", () => {
      updateCurrentStat();
      input.value = state.stats[input.dataset.statKey];
    });
  });

  renderCurrentStateSummary(state.stats);
  renderStatsCurrentCompanionTeam();
  renderHomeDashboard();
}

function renderStatsCurrentCompanionTeam(){
  const box = document.querySelector("#statsCurrentCompanionTeam");
  if(!box) return;
  const team = getBaselineCompanionTeam();
  if(!team.length){
    box.className = "stats-current-team empty-state";
    box.textContent = "현재 사용 중인 동료가 등록되지 않았습니다.";
    return;
  }
  box.className = "stats-current-team";
  box.innerHTML = team.map((x, index) => `
    <div class="stats-team-chip">
      <img src="${x.companion.icon_data || x.companion.icon}" alt="${x.companion.name}">
      <span><b>장착 ${index+1}</b>${x.companion.name}<small>${x.companion.rarities[x.rarity].name} · Lv.${x.level}</small></span>
    </div>`).join("");
}
function renderChangeSelect() {
  const select = $("#changeKey");
  select.innerHTML = Object.entries(STAT_META)
    .map(([key, [label]]) => `<option value="${key}">${label}</option>`).join("");
  syncChangeBefore();
}

function syncChangeBefore() {
  const key = $("#changeKey").value || "attack";
  $("#changeBefore").value = state.stats[key] ?? 0;
  $("#changeAfter").value = state.stats[key] ?? 0;
}

function renderChanges() {
  const body = $("#changeTableBody");
  body.innerHTML = "";
  $("#changeEmpty").style.display = state.changes.length ? "none" : "block";
  state.changes.forEach((change, index) => {
    const delta = change.after - change.before;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${change.source}</td>
      <td><span class="table-stat-label">${STAT_META[change.key]?.[0] || change.key}${officialHelpButton(change.key)}</span></td>
      <td class="num">${formatValue(change.key, change.before)}</td>
      <td class="num">${formatValue(change.key, change.after)}</td>
      <td class="num ${delta >= 0 ? "positive" : "negative"}">${delta >= 0 ? "+" : ""}${formatValue(change.key, delta)}</td>
      <td><button class="icon-button" data-remove-change="${index}" type="button">삭제</button></td>`;
    body.appendChild(row);
  });
  $$("[data-remove-change]").forEach(button => {
    button.addEventListener("click", () => {
      state.changes.splice(Number(button.dataset.removeChange), 1);
      renderChanges(); saveLocal();
    });
  });
  if($("#liveImpactMetrics")) renderLiveImpactPreview();
}

function getAfterStats() {
  const after = {...state.stats};
  for (const change of state.changes) {
    const delta = Number(change.after || 0) - Number(change.before || 0);
    after[change.key] = Number(after[change.key] || 0) + delta;
  }
  return after;
}


function formatDamageIndex(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "계산 불가";
  const abs = Math.abs(n);
  const units = [
    [1e24, "자"], [1e20, "해"], [1e16, "경"],
    [1e12, "조"], [1e8, "억"], [1e4, "만"]
  ];
  for (const [unit, label] of units) {
    if (abs >= unit) {
      return `${(n / unit).toLocaleString("ko-KR", {maximumFractionDigits: 4})}${label}`;
    }
  }
  return n.toLocaleString("ko-KR", {maximumFractionDigits: 2});
}

function currentStateAnalysis(stats) {
  const scores = {
    boss_skill: damageIndex(stats, "boss", "skill"),
    normal_skill: damageIndex(stats, "normal", "skill"),
    boss_basic: damageIndex(stats, "boss", "basic"),
    normal_basic: damageIndex(stats, "normal", "basic")
  };

  const targetBias = scores.boss_skill > scores.normal_skill * 1.05
    ? "보스 특화"
    : scores.normal_skill > scores.boss_skill * 1.05
      ? "일반 사냥 특화"
      : "범용";

  const attackStyle = scores.boss_skill > scores.boss_basic * 1.05
    ? "스킬 공격 중심"
    : scores.boss_basic > scores.boss_skill * 1.05
      ? "기본 공격 중심"
      : "기본 공격과 스킬이 균형";

  const critText = Number(stats.critical_rate || 0) >= 100
    ? "크리티컬 확률은 100% 이상으로 기대 피해 계산 상한에 도달했습니다."
    : `크리티컬 확률은 ${Number(stats.critical_rate || 0).toFixed(1)}%입니다.`;

  const damageRange = Number(stats.max_damage || 0) - Number(stats.min_damage || 0);
  const rangeText = damageRange >= 100
    ? "최소·최대 데미지 배율 차이가 커 타격 편차가 비교적 큰 편입니다."
    : "최소·최대 데미지 배율 차이가 비교적 작아 피해 편차가 안정적인 편입니다.";

  return {
    scores,
    text: `현재 스펙은 ${targetBias}, ${attackStyle} 성향입니다. ${critText} ${rangeText} 표시되는 연구소 비교 지수는 동일 모델 안에서 장비·어빌·동료 변경 전후를 비교하기 위한 참고값이며 공식 전투력이나 실제 DPS가 아닙니다.`
  };
}

function renderCurrentStateSummary(stats) {
  const current = currentStateAnalysis(stats);
  const cards = [
    ["보스 스킬", current.scores.boss_skill],
    ["일반몹 스킬", current.scores.normal_skill],
    ["보스 기본공격", current.scores.boss_basic],
    ["일반몹 기본공격", current.scores.normal_basic]
  ];

  const cardHtml = cards.map(([label, value]) => `
    <article class="metric-card">
      <span>${label} 비교 지수 ${officialHelpButton("comparisonModel", true)}</span>
      <strong class="positive">${formatDamageIndex(value)}</strong>
    </article>`).join("");

  if ($("#statsCurrentMetricCards")) $("#statsCurrentMetricCards").innerHTML = cardHtml;
  if ($("#currentMetricCards")) $("#currentMetricCards").innerHTML = cardHtml;

  if ($("#statsCurrentMainDamage")) $("#statsCurrentMainDamage").textContent = formatDamageIndex(current.scores.boss_skill);
  if ($("#currentMainDamage")) $("#currentMainDamage").textContent = formatDamageIndex(current.scores.boss_skill);

  if ($("#statsCurrentAnalysisText")) $("#statsCurrentAnalysisText").textContent = current.text;
  if ($("#currentAnalysisText")) $("#currentAnalysisText").textContent = current.text;

  return current;
}

function renderResults() {
  renderHomeDashboard();
  const before = {...state.stats};
  const after = getAfterStats();
  renderCurrentStateSummary(before);
  const comp = compare(before, after);

  const metrics = [
    ["보스 스킬 비교 지수", comp.boss_skill],
    ["일반몹 스킬 비교 지수", comp.normal_skill],
    ["보스 기본공격 비교 지수", comp.boss_basic],
    ["일반몹 기본공격 비교 지수", comp.normal_basic]
  ];

  $("#metricCards").innerHTML = metrics.map(([label, value]) => `
    <article class="metric-card">
      <span>${label} 변화 ${officialHelpButton("comparisonModel", true)}</span>
      <strong class="${value >= 0 ? "positive" : "negative"}">${value >= 0 ? "+" : ""}${value.toFixed(3)}%</strong>
    </article>`).join("");

  const changedKeys = Object.keys(STAT_META).filter(
    key => Number(before[key] || 0) !== Number(after[key] || 0)
  );

  $("#afterStatsBody").innerHTML = changedKeys.map(key => {
    const delta = after[key] - before[key];
    return `<tr>
      <td><span class="table-stat-label">${STAT_META[key][0]}${officialHelpButton(key)}</span></td>
      <td class="num">${formatValue(key, before[key])}</td>
      <td class="num">${formatValue(key, after[key])}</td>
      <td class="num ${delta >= 0 ? "positive" : "negative"}">${delta >= 0 ? "+" : ""}${formatValue(key, delta)}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="4" class="empty-state">변경된 스탯이 없습니다.</td></tr>`;

  const contrib = contributionAnalysis(before, after);
  $("#contributionBody").innerHTML = contrib.map(([key, value]) => `
    <tr>
      <td><span class="table-stat-label">${STAT_META[key][0]}${officialHelpButton(key)}</span></td>
      <td class="num ${value >= 0 ? "positive" : "negative"}">${value >= 0 ? "+" : ""}${value.toFixed(3)}%</td>
    </tr>`
  ).join("") || `<tr><td colspan="2" class="empty-state">분석할 변경이 없습니다.</td></tr>`;

  let analysis = "적용된 변경사항이 없습니다.";
  if (contrib.length) {
    const boss = comp.boss_skill;
    const normal = comp.normal_skill;
    const top = contrib[0];
    const use = boss > normal + .1 ? "보스용" : normal > boss + .1 ? "사냥용" : "범용";
    analysis = `연구소 비교 모델에서 보스 스킬 지수 변화는 ${boss >= 0 ? "+" : ""}${boss.toFixed(3)}%, 일반 몬스터 기준은 ${normal >= 0 ? "+" : ""}${normal.toFixed(3)}%입니다. 현재 변화는 ${use} 성향이며, 가장 큰 단독 영향 항목은 '${STAT_META[top[0]][0]}' (${top[1] >= 0 ? "+" : ""}${top[1].toFixed(3)}%)입니다. 실제 전투 결과는 콘텐츠·대상·스킬별 조건에 따라 달라질 수 있습니다.`;
  }
  $("#analysisText").textContent = analysis;
  saveLocal();
}
function addFiles(fileList) {
  for (const file of [...fileList]) {
    if (!file.type.startsWith("image/")) continue;
    state.images.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), name: file.name || "clipboard-image.png" });
  }
  renderImages();
}

function renderImages() {
  const gallery = $("#imageGallery");
  if (!state.images.length) {
    gallery.className = "image-gallery empty";
    gallery.innerHTML = "<p>아직 가져온 이미지가 없습니다.</p>";
    return;
  }
  gallery.className = "image-gallery";
  gallery.innerHTML = state.images.map(item => `
    <article class="image-card">
      <img src="${item.url}" alt="${item.name}">
      <button class="remove-image" type="button" data-remove-image="${item.id}" aria-label="이미지 삭제">×</button>
      <footer>${item.name}</footer>
    </article>`).join("");
  $$("[data-remove-image]").forEach(button => {
    button.addEventListener("click", () => {
      const idx = state.images.findIndex(x => x.id === button.dataset.removeImage);
      if (idx >= 0) {
        URL.revokeObjectURL(state.images[idx].url);
        state.images.splice(idx, 1);
        renderImages();
      }
    });
  });
}

function extractStatsFromText(text) {
  const normalized = text.replaceAll("％", "%").replaceAll("|", " ");
  const found = {};
  const lines = normalized.split(/\r?\n/).map(line => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  for (const line of lines) {
    for (const [label, key] of ALIASES) {
      if (!line.includes(label)) continue;
      const tail = line.split(label).slice(1).join(label);
      const matches = tail.match(/[-+]?\d[\d,\s]*(?:\.\d+)?\s*(?:[경조억만])?%?/g);
      if (matches?.length) found[key] = parseNumber(matches.at(-1));
      break;
    }
  }
  return found;
}

function renderOcrResults() {
  const box = $("#ocrResults");
  box.className = "ocr-results";
  box.innerHTML = Object.entries(STAT_META).map(([key, meta]) => {
    const recognized = Object.prototype.hasOwnProperty.call(state.ocr, key);
    const value = recognized ? state.ocr[key] : 0;
    const review = recognized ? (state.ocrReview[key] || "warning") : "missing";
    const statusLabel = review === "confirmed" ? "확인 완료" : review === "warning" ? "확인 필요" : "미인식";
    return `<div class="ocr-item review-${review}" data-ocr-item="${key}">
      <label>
        <span class="stat-label-row"><span>${meta[0]} <small class="ocr-status-badge ${review}">${statusLabel}</small></span>${officialHelpButton(key)}</span>
        <input data-ocr-key="${key}" inputmode="decimal" value="${value}">
        ${review === "warning" ? `<button class="ocr-confirm-button" data-confirm-ocr="${key}" type="button">이 값 확인 완료</button>` : ""}
      </label>
    </div>`;
  }).join("");
  $$("[data-ocr-key]").forEach(input => {
    input.addEventListener("input", () => {
      const key = input.dataset.ocrKey;
      state.ocr[key] = parseNumber(input.value);
      state.ocrReview[key] = "confirmed";
      const item=input.closest("[data-ocr-item]");
      item?.classList.remove("review-warning","review-missing");item?.classList.add("review-confirmed");
      const badge=item?.querySelector(".ocr-status-badge");if(badge){badge.className="ocr-status-badge confirmed";badge.textContent="확인 완료"}
      item?.querySelector(".ocr-confirm-button")?.remove();
    });
  });
  $$("[data-confirm-ocr]").forEach(button => button.addEventListener("click", () => {
    state.ocrReview[button.dataset.confirmOcr] = "confirmed";
    renderOcrResults();
  }));
}

async function runOcr() {
  if (!state.images.length) return alert("먼저 이미지를 추가하세요.");
  if (!window.Tesseract) return alert("OCR 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인하세요.");

  $("#ocrStatus").textContent = "OCR 준비 중";
  $("#runOcrBtn").disabled = true;
  let fullText = "";
  const recognized = {};
  const review = {};
  try {
    for (let i = 0; i < state.images.length; i++) {
      const image = state.images[i];
      $("#ocrStatus").textContent = `OCR ${i + 1}/${state.images.length}`;
      const result = await Tesseract.recognize(image.file, "kor+eng", {
        logger: msg => {
          if (msg.status === "recognizing text") {
            $("#ocrStatus").textContent = `OCR ${i + 1}/${state.images.length} · ${Math.round(msg.progress * 100)}%`;
          }
        }
      });
      fullText += `\n\n--- ${image.name} ---\n${result.data.text}`;
      const imageStats = extractStatsFromText(result.data.text);
      const confidence = Number(result.data.confidence || 0);
      for (const [key, value] of Object.entries(imageStats)) {
        recognized[key] = value;
        review[key] = confidence >= 85 ? "confirmed" : "warning";
      }
    }
    $("#rawOcrText").value = fullText.trim();
    state.ocr = {...recognized};
    state.ocrReview = {...review};
    renderOcrResults();
    $("#ocrStatus").textContent = `${Object.keys(recognized).length}개 인식`;
  } catch (error) {
    console.error(error);
    $("#ocrStatus").textContent = "OCR 실패";
    alert("OCR에 실패했습니다. 네트워크 연결 또는 이미지 상태를 확인하세요.");
  } finally {
    $("#runOcrBtn").disabled = false;
  }
}

function applyOcr() {
  if (!Object.keys(state.ocr).length) return alert("적용할 OCR 결과가 없습니다.");
  const warnings = Object.keys(state.ocr).filter(key => state.ocrReview[key] !== "confirmed");
  if (warnings.length) return alert(`확인 필요 항목이 ${warnings.length}개 남아 있습니다. 주황색 박스의 값을 확인한 뒤 '이 값 확인 완료'를 눌러 주세요.`);
  state.stats = {...state.stats, ...state.ocr};
  renderStats();
  syncChangeBefore();
  saveLocal();
  activateTab("stats");
}


function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function setupInputs() {
  $("#imageInput").addEventListener("change", e => addFiles(e.target.files));
  $("#cameraInput").addEventListener("change", e => addFiles(e.target.files));

  const drop = $("#dropZone");
  ["dragenter", "dragover"].forEach(type => drop.addEventListener(type, e => {
    e.preventDefault(); drop.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach(type => drop.addEventListener(type, e => {
    e.preventDefault(); drop.classList.remove("dragover");
  }));
  drop.addEventListener("drop", e => addFiles(e.dataTransfer.files));

  window.addEventListener("paste", event => {
    const files = [...(event.clipboardData?.files || [])].filter(file => file.type.startsWith("image/"));
    if (files.length) {
      addFiles(files);
      activateTab("capture");
    }
  });

  $("#clipboardBtn").addEventListener("click", async () => {
    if (!navigator.clipboard?.read) return alert("이 브라우저에서는 직접 클립보드 이미지 읽기를 지원하지 않습니다. 붙여넣기 또는 사진 선택을 이용하세요.");
    try {
      const items = await navigator.clipboard.read();
      const files = [];
      for (const item of items) {
        for (const type of item.types.filter(t => t.startsWith("image/"))) {
          const blob = await item.getType(type);
          files.push(new File([blob], `clipboard-${Date.now()}.png`, {type}));
        }
      }
      if (!files.length) return alert("클립보드에 이미지가 없습니다.");
      addFiles(files);
    } catch {
      alert("클립보드 권한이 거부되었거나 브라우저에서 지원하지 않습니다.");
    }
  });

  $("#clearImagesBtn").addEventListener("click", () => {
    state.images.forEach(item => URL.revokeObjectURL(item.url));
    state.images = []; state.ocr = {}; state.ocrReview = {}; renderImages(); renderOcrResults();
    $("#rawOcrText").value = ""; $("#ocrStatus").textContent = "OCR 대기";
  });
  $("#runOcrBtn").addEventListener("click", runOcr);
  $("#applyOcrBtn").addEventListener("click", applyOcr);
}

function setupActions() {
  $("#changeKey").addEventListener("change", syncChangeBefore);
  $("#addChangeBtn").addEventListener("click", () => {
    const key = $("#changeKey").value;
    state.changes.push({
      source: $("#changeSource").value,
      key,
      before: parseNumber($("#changeBefore").value),
      after: parseNumber($("#changeAfter").value)
    });
    renderChanges(); saveLocal();
  });
  $("#clearChangesBtn").addEventListener("click", () => {
    state.changes = [];
    state.pendingOcrDiffs = {};
    state.pendingAbilityRows = {before:[],after:[]};
    renderChanges(); renderResults(); renderLiveImpactPreview(); saveLocal();
  });
  $("#clearManualChangesBtn").addEventListener("click",()=>clearChangeSource("수동"));
  $("#clearEquipmentChangesBtn").addEventListener("click",()=>clearChangeSource("장비",{clearImages:true,clearPreview:true}));
  $("#clearAbilityChangesBtn").addEventListener("click",()=>clearChangeSource("어빌리티",{clearImages:true,clearPreview:true}));
  $("#clearCompanionChangesBtn").addEventListener("click",()=>clearChangeSource("동료"));
  ["#runCompareBtn", "#runCompareBtn2"].forEach(id => $(id).addEventListener("click", () => {
    renderResults(); activateTab("results");
  }));
  $("#restoreSampleBtn").addEventListener("click", () => {
    if (!confirm("현재 스펙을 모두 0으로 초기화할까요?")) return;
    state.stats = structuredClone(DEFAULT_STATS);
    renderStats(); syncChangeBefore(); renderResults(); saveLocal();
  });

  $("#saveProfileBtn").addEventListener("click", () => downloadJson("maple-spec-profile.json", {
    version: "0.2-web", stats: state.stats, changes: state.changes
  }));
  $("#profileFile").addEventListener("change", async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      state.stats = {...DEFAULT_STATS, ...(data.stats || data.profile?.stats || {})};
      state.changes = data.changes || [];
      renderStats(); renderChanges(); renderResults(); syncChangeBefore(); saveLocal();
    } catch { alert("프로필 JSON 형식이 올바르지 않습니다."); }
  });


}


function setupChangeSourceTabs(){
  $$(".source-tab").forEach(button=>button.addEventListener("click",()=>{
    $$(".source-tab").forEach(b=>b.classList.toggle("active",b===button));
    $$(".source-panel").forEach(panel=>panel.classList.toggle(
      "active",panel.id===`source-panel-${button.dataset.sourcePanel}`
    ));
  }));
}

function createLocalImageEntries(files){
  return [...files].filter(f=>f.type.startsWith("image/")).map(file=>({
    id:crypto.randomUUID(),file,url:URL.createObjectURL(file),name:file.name||"clipboard.png"
  }));
}

function renderMiniGallery(selector,items){
  const box=$(selector);
  if(!items.length){box.className="mini-image-gallery empty-state";box.textContent="이미지가 없습니다.";return}
  box.className="mini-image-gallery";
  box.innerHTML=items.map(x=>`<img src="${x.url}" alt="${x.name}">`).join("");
}

async function readClipboardImageEntries(){
  if(!navigator.clipboard?.read)throw new Error("이 브라우저는 클립보드 이미지 읽기를 지원하지 않습니다.");
  const items=await navigator.clipboard.read(),files=[];
  for(const item of items)for(const type of item.types.filter(t=>t.startsWith("image/"))){
    const blob=await item.getType(type);
    files.push(new File([blob],`clipboard-${Date.now()}.png`,{type}))
  }
  return createLocalImageEntries(files)
}

async function ocrImageEntries(entries,statusText){
  if(!entries.length)throw new Error("이미지를 먼저 선택하세요.");
  if(!window.Tesseract)throw new Error("OCR 라이브러리를 불러오지 못했습니다.");
  let text="",confidenceTotal=0;
  for(let i=0;i<entries.length;i++){
    const result=await Tesseract.recognize(entries[i].file,"kor+eng");
    text+=`\n--- ${statusText} ${i+1} ---\n${result.data.text}`;
    confidenceTotal+=Number(result.data.confidence||0)
  }
  return {text,confidence:confidenceTotal/entries.length}
}

function extractOptionLines(text){
  const found={};
  const lines=text.replaceAll("％","%").split(/\r?\n/).map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean);
  for(const line of lines){
    for(const[label,key]of ALIASES){
      if(!line.includes(label))continue;
      const tail=line.split(label).slice(1).join(label);
      const matches=tail.match(/[-+]?\d[\d,\s]*(?:\.\d+)?\s*(?:[경조억만])?%?/g);
      if(matches?.length)found[key]=parseNumber(matches[0]);
      break
    }
  }
  return found
}

function renderOcrDiff(selector,beforeMap,afterMap,source){
  const keys=[...new Set([...Object.keys(beforeMap),...Object.keys(afterMap)])];
  const rows=keys.map(key=>({source,key,before:Number(beforeMap[key]||0),after:Number(afterMap[key]||0)}));
  state.pendingOcrDiffs[source]=rows;
  const box=$(selector);
  if(!rows.length){box.className="ocr-change-preview empty-state";box.textContent="인식된 옵션이 없습니다. 이미지 상태를 확인하거나 수동 입력을 이용하세요.";return}
  box.className="ocr-change-preview editable-ocr-preview";
  box.innerHTML=`<p class="small-note">인식값이 틀리면 아래 숫자를 수정하세요. 옵션이 한쪽 장비에 없으면 0으로 입력합니다.</p>
    <div class="table-scroll"><table class="ocr-edit-table"><thead><tr><th>항목</th><th class="num">변경 전 A</th><th class="num">변경 후 B</th><th class="num">차이</th><th></th></tr></thead>
    <tbody>${rows.map((x,i)=>`<tr data-ocr-row="${i}"><td><select data-ocr-key="${i}">${Object.entries(STAT_META).map(([key,meta])=>`<option value="${key}" ${key===x.key?"selected":""}>${meta[0]}</option>`).join("")}</select></td>
    <td><input class="num-input" data-ocr-before="${i}" type="number" step="any" value="${x.before}"></td>
    <td><input class="num-input" data-ocr-after="${i}" type="number" step="any" value="${x.after}"></td>
    <td class="num" data-ocr-delta="${i}">${formatValue(x.key,x.after-x.before)}</td>
    <td><button class="text-button danger" data-remove-ocr="${i}" type="button">삭제</button></td></tr>`).join("")}</tbody></table></div>
    <div class="button-row top-gap"><button class="button ghost" data-add-ocr-row type="button">항목 추가</button><button class="button primary" data-apply-ocr-diff type="button">수정한 차이를 변경 목록에 적용</button></div>`;
  const sync=()=>{
    const list=[];
    box.querySelectorAll("[data-ocr-row]").forEach(tr=>{
      const i=tr.dataset.ocrRow,key=tr.querySelector(`[data-ocr-key="${i}"]`).value,before=Number(tr.querySelector(`[data-ocr-before="${i}"]`).value||0),after=Number(tr.querySelector(`[data-ocr-after="${i}"]`).value||0);
      list.push({source,key,before,after});tr.querySelector(`[data-ocr-delta="${i}"]`).textContent=formatValue(key,after-before)
    });state.pendingOcrDiffs[source]=list
  };
  box.addEventListener("input",sync);box.addEventListener("change",sync);
  box.querySelectorAll("[data-remove-ocr]").forEach(btn=>btn.addEventListener("click",()=>{btn.closest("tr").remove();sync()}));
  box.querySelector("[data-add-ocr-row]").addEventListener("click",()=>{
    const list=state.pendingOcrDiffs[source]||[];list.push({source,key:"attack",before:0,after:0});renderOcrDiff(selector,Object.fromEntries(list.map(x=>[x.key,x.before])),Object.fromEntries(list.map(x=>[x.key,x.after])),source)
  });
  box.querySelector("[data-apply-ocr-diff]").addEventListener("click",()=>{
    sync();state.changes=state.changes.filter(c=>c.source!==source);
    for(const change of state.pendingOcrDiffs[source].filter(x=>x.before!==x.after))state.changes.push(change);
    renderChanges();renderLiveImpactPreview();saveLocal()
  })
}



function normalizeOptionRows(rows, count=7){
  const cleaned=(rows||[]).slice(0,count).map(x=>({
    key:x?.key&&STAT_META[x.key]?x.key:"",
    value:Number(x?.value||0),
    raw:x?.raw||"",
    confidence:Number(x?.confidence||0),
    review:x?.review||"neutral"
  }));
  while(cleaned.length<count)cleaned.push({key:"",value:0,raw:"",confidence:0,review:"neutral"});
  return cleaned
}

function sumOptionRows(rows){
  const sums={};
  for(const row of rows){
    if(!row?.key || Number(row.value||0)===0)continue;
    sums[row.key]=(sums[row.key]||0)+Number(row.value||0);
  }
  return sums
}

function renderSevenRowEditor({selector,source,beforeRows,afterRows,stateKey,titleA,titleB}){
  state[stateKey]={
    before:normalizeOptionRows(beforeRows,7),
    after:normalizeOptionRows(afterRows,7)
  };
  const box=$(selector);
  box.className="ocr-change-preview editable-ocr-preview equipment-seven-editor";
  const options=(selected)=>`<option value="" ${!selected?"selected":""}>(없음)</option>`+Object.entries(STAT_META)
    .map(([key,meta])=>`<option value="${key}" ${key===selected?"selected":""}>${meta[0]}</option>`).join("");

  const side=(name,title)=>`<section class="option-slot-panel">
    <h4>${title}</h4>
    <p class="small-note">최대 7줄입니다. 오인식된 항목과 수치를 직접 고치세요.</p>
    <div class="option-slot-list">${state[stateKey][name].map((row,i)=>`
      <div class="option-slot-row review-${row.review} ${i===3?"sub-option-start":""}" data-seven-row="${name}-${i}">
        ${i===3?'<div class="option-group-divider"><span>부옵션</span></div>':''}
        <span class="option-slot-number">${i+1}</span>
        <select data-seven-key="${name}-${i}">${options(row.key)}</select>
        <input data-seven-value="${name}-${i}" type="number" step="any" value="${row.value}">
        <span class="review-status-badge ${row.review}">${row.review==="warning"?"확인 필요":row.review==="confirmed"?"확인 완료":"미입력"}</span>
        ${row.review==="warning"?`<button class="review-confirm-button" data-confirm-seven="${name}-${i}" type="button">확인</button>`:""}
        <button class="text-button danger" data-seven-clear="${name}-${i}" type="button">비우기</button>
      </div>`).join("")}</div>
  </section>`;

  box.innerHTML=`<div class="option-slot-columns">
      ${side("before",titleA)}
      ${side("after",titleB)}
    </div>
    <section class="ability-summary-panel">
      <div class="panel-title-row">
        <div><h4>합산 및 현재 스펙 반영 검토</h4>
        <p class="small-note">현재 스펙에는 B 자체가 아닌 B 합계 - A 합계만 가감됩니다.</p></div>
        <button class="button primary" data-seven-apply type="button">수정한 차이를 변경 목록에 적용</button>
      </div>
      <div data-seven-summary></div>
    </section>`;

  const sync=()=>{
    for(const name of ["before","after"]){
      state[stateKey][name]=state[stateKey][name].map((row,i)=>{
        const keyEl=box.querySelector(`[data-seven-key="${name}-${i}"]`);
        const valueEl=box.querySelector(`[data-seven-value="${name}-${i}"]`);
        const key=keyEl.value;
        if(!key){ valueEl.value=0; valueEl.disabled=true; } else valueEl.disabled=false;
        return {...row,key,value:key?Number(valueEl.value||0):0};
      });
    }
    const a=sumOptionRows(state[stateKey].before),b=sumOptionRows(state[stateKey].after);
    const keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
    const summary=box.querySelector("[data-seven-summary]");
    summary.innerHTML=keys.length?`<div class="table-scroll"><table class="ocr-edit-table option-aggregate-table">
      <thead><tr><th>항목</th><th class="num">A 합계</th><th class="num">B 합계</th><th class="num">변화량</th><th class="num">현재 스펙</th><th class="num">적용 후</th></tr></thead>
      <tbody>${keys.map(key=>{
        const av=Number(a[key]||0),bv=Number(b[key]||0),delta=bv-av,current=Number(state.stats[key]||0),applied=current+delta;
        return `<tr><td>${STAT_META[key][0]}</td><td class="num">${formatValue(key,av)}</td>
        <td class="num">${formatValue(key,bv)}</td>
        <td class="num ${delta>=0?"positive":"negative"}">${delta>=0?"+":""}${formatValue(key,delta)}</td>
        <td class="num">${formatValue(key,current)}</td><td class="num">${formatValue(key,applied)}</td></tr>`
      }).join("")}</tbody></table></div>`:'<div class="empty-state">입력된 옵션이 없습니다.</div>';
  };

  box.querySelectorAll("[data-seven-key],[data-seven-value]").forEach(el=>{
    el.addEventListener("input",sync);el.addEventListener("change",()=>{
      const [name,index]=(el.dataset.sevenKey||el.dataset.sevenValue).split("-");
      const row=state[stateKey][name][Number(index)];
      row.review=row.key?"confirmed":"neutral";
      renderSevenRowEditor({selector,source,beforeRows:state[stateKey].before,afterRows:state[stateKey].after,stateKey,titleA,titleB})
    })
  });
  box.querySelectorAll("[data-confirm-seven]").forEach(btn=>btn.addEventListener("click",()=>{
    const [name,index]=btn.dataset.confirmSeven.split("-");
    state[stateKey][name][Number(index)].review="confirmed";
    renderSevenRowEditor({selector,source,beforeRows:state[stateKey].before,afterRows:state[stateKey].after,stateKey,titleA,titleB})
  }));
  box.querySelectorAll("[data-seven-clear]").forEach(btn=>btn.addEventListener("click",()=>{
    const [name,index]=btn.dataset.sevenClear.split("-");
    box.querySelector(`[data-seven-key="${name}-${index}"]`).value="";
    box.querySelector(`[data-seven-value="${name}-${index}"]`).value=0;sync();
    state[stateKey][name][Number(index)].review="neutral";
    renderSevenRowEditor({selector,source,beforeRows:state[stateKey].before,afterRows:state[stateKey].after,stateKey,titleA,titleB})
  }));
  box.querySelector("[data-seven-apply]").addEventListener("click",()=>{
    sync();
    const warnings=[...state[stateKey].before,...state[stateKey].after].filter(row=>row.key&&row.review==="warning");
    if(warnings.length)return alert(`확인 필요 옵션이 ${warnings.length}줄 남아 있습니다. 주황색 줄의 항목과 수치를 확인한 뒤 '확인'을 눌러 주세요.`);
    const a=sumOptionRows(state[stateKey].before),b=sumOptionRows(state[stateKey].after);
    const keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
    state.pendingOcrDiffs[source]=keys.map(key=>({source,key,before:Number(a[key]||0),after:Number(b[key]||0)}));
    state.changes=state.changes.filter(c=>c.source!==source);
    state.changes.push(...state.pendingOcrDiffs[source].filter(x=>x.before!==x.after));
    renderChanges();renderLiveImpactPreview();saveLocal()
  });
  sync()
}

function extractOptionRows(text,confidence=0){
  const rows=[];
  const lines=text.replaceAll("％","%").split(/\r?\n/)
    .map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean);
  for(const line of lines){
    for(const [label,key] of ALIASES){
      if(!line.includes(label))continue;
      const tail=line.split(label).slice(1).join(label);
      const numbers=tail.match(/[-+]?\d[\d,\s]*(?:\.\d+)?\s*(?:[경조억만])?%?/g);
      if(numbers?.length)rows.push({key,value:parseNumber(numbers[0]),raw:line,confidence,review:confidence>=85?"confirmed":"warning"});
      break;
    }
  }
  return rows
}

function normalizeAbilityRows(rows){
  const cleaned=(rows||[]).slice(0,7).map(x=>({
    key:x?.key&&STAT_META[x.key]?x.key:"",
    value:Number(x?.value||0),
    raw:x?.raw||""
  }));
  while(cleaned.length<7)cleaned.push({key:"",value:0,raw:""});
  return cleaned
}

function sumAbilityRows(rows){
  const sums={};
  for(const row of rows){
    if(!row?.key)continue;
    sums[row.key]=(sums[row.key]||0)+Number(row.value||0);
  }
  return sums
}

function renderAbilityOcrEditor(beforeRows,afterRows){
  state.pendingAbilityRows={
    before:normalizeAbilityRows(beforeRows),
    after:normalizeAbilityRows(afterRows)
  };
  const box=$("#abilityOcrPreview");
  box.className="ocr-change-preview editable-ocr-preview ability-ocr-editor";

  const optionHtml=(selected)=>`<option value="" ${!selected?"selected":""}>(없음)</option>`+Object.entries(STAT_META)
    .map(([key,meta])=>`<option value="${key}" ${key===selected?"selected":""}>${meta[0]}</option>`).join("");

  const sideHtml=(side,title)=>{
    const rows=state.pendingAbilityRows[side];
    return `<section class="ability-slot-panel">
      <h4>${title}</h4>
      <p class="small-note">OCR이 읽은 각 줄입니다. 능력치 종류와 수치를 직접 수정할 수 있습니다.</p>
      <div class="ability-slot-list">
        ${rows.map((row,i)=>`<div class="ability-slot-row" data-ability-row="${side}-${i}">
          <span class="ability-slot-number">${i+1}</span>
          <select data-ability-key="${side}-${i}">${optionHtml(row.key)}</select>
          <input data-ability-value="${side}-${i}" type="number" step="any" value="${row.value}">
          <button class="text-button danger" data-clear-ability-row="${side}-${i}" type="button">비우기</button>
        </div>`).join("")}
      </div>
    </section>`
  };

  box.innerHTML=`<div class="ability-slot-columns">
      ${sideHtml("before","현재 어빌 A · 최대 7개")}
      ${sideHtml("after","변경 어빌 B · 최대 7개")}
    </div>
    <section class="ability-summary-panel">
      <div class="panel-title-row">
        <div><h4>능력치별 합산 비교</h4><p class="small-note">위 12개 입력을 기준으로 같은 능력치는 자동 합산됩니다.</p></div>
        <button class="button primary" data-apply-ability-rows type="button">수정한 어빌 차이 적용</button>
      </div>
      <div id="abilityAggregatePreview"></div>
    </section>`;

  const sync=()=>{
    for(const side of ["before","after"]){
      state.pendingAbilityRows[side]=state.pendingAbilityRows[side].map((row,i)=>{
        const keyEl=box.querySelector(`[data-ability-key="${side}-${i}"]`);
        const valueEl=box.querySelector(`[data-ability-value="${side}-${i}"]`);
        const key=keyEl.value;
        if(!key){ valueEl.value=0; valueEl.disabled=true; } else valueEl.disabled=false;
        return {...row,key,value:key?Number(valueEl.value||0):0};
      });
    }
    renderAbilityAggregate()
  };

  box.querySelectorAll("[data-ability-key],[data-ability-value]").forEach(el=>{
    el.addEventListener("input",sync);
    el.addEventListener("change",sync)
  });
  box.querySelectorAll("[data-clear-ability-row]").forEach(btn=>btn.addEventListener("click",()=>{
    const [side,index]=btn.dataset.clearAbilityRow.split("-");
    box.querySelector(`[data-ability-key="${side}-${index}"]`).value="";
    box.querySelector(`[data-ability-value="${side}-${index}"]`).value=0;
    sync()
  }));
  box.querySelector("[data-apply-ability-rows]").addEventListener("click",()=>{
    sync();
    const before=sumAbilityRows(state.pendingAbilityRows.before);
    const after=sumAbilityRows(state.pendingAbilityRows.after);
    const keys=[...new Set([...Object.keys(before),...Object.keys(after)])];
    state.pendingOcrDiffs["어빌리티"]=keys.map(key=>({
      source:"어빌리티",key,before:Number(before[key]||0),after:Number(after[key]||0)
    }));
    state.changes=state.changes.filter(c=>c.source!=="어빌리티");
    for(const change of state.pendingOcrDiffs["어빌리티"].filter(x=>x.before!==x.after))state.changes.push(change);
    renderChanges();renderLiveImpactPreview();saveLocal()
  });
  renderAbilityAggregate()
}

function renderAbilityAggregate(){
  const target=$("#abilityAggregatePreview");if(!target)return;
  const before=sumAbilityRows(state.pendingAbilityRows.before);
  const after=sumAbilityRows(state.pendingAbilityRows.after);
  const keys=[...new Set([...Object.keys(before),...Object.keys(after)])]
    .filter(key=>Number(before[key]||0)!==0||Number(after[key]||0)!==0);
  if(!keys.length){
    target.innerHTML='<div class="empty-state">입력된 어빌 옵션이 없습니다.</div>';return
  }
  target.innerHTML=`<div class="table-scroll"><table class="ocr-edit-table">
    <thead><tr><th>항목</th><th class="num">A 합계</th><th class="num">B 합계</th><th class="num">변화량</th></tr></thead>
    <tbody>${keys.map(key=>{
      const a=Number(before[key]||0),b=Number(after[key]||0),d=b-a;
      return `<tr><td>${STAT_META[key][0]}</td><td class="num">${formatValue(key,a)}</td>
      <td class="num">${formatValue(key,b)}</td>
      <td class="num ${d>=0?"positive":"negative"}">${d>=0?"+":""}${formatValue(key,d)}</td></tr>`
    }).join("")}</tbody></table></div>`
}

function clearChangeSource(source,{clearImages=false,clearPreview=false}={}){
  state.changes=state.changes.filter(change=>change.source!==source);
  delete state.pendingOcrDiffs[source];

  if(source==="수동"){
    $("#changeAfter").value="";
    syncChangeBefore()
  }
  if(source==="장비"){
    state.pendingEquipmentRows={before:[],after:[]};
    if(clearImages){
      state.equipmentBeforeImages=[];state.equipmentAfterImages=[];
      renderMiniGallery("#equipmentBeforeGallery",[]);
      renderMiniGallery("#equipmentAfterGallery",[])
    }
    if(clearPreview){
      const box=$("#equipmentOcrPreview");
      box.className="ocr-change-preview empty-state";
      box.textContent="이미지 분석 후 A와 B의 인식 후보가 검토 가능한 형태로 표시됩니다."
    }
  }
  if(source==="어빌리티"){
    state.pendingAbilityRows={before:[],after:[]};
    if(clearImages){
      state.abilityBeforeImages=[];state.abilityAfterImages=[];
      renderMiniGallery("#abilityBeforeGallery",[]);
      renderMiniGallery("#abilityAfterGallery",[])
    }
    if(clearPreview){
      const box=$("#abilityOcrPreview");
      box.className="ocr-change-preview empty-state";
      box.textContent="이미지 분석 후 A와 B의 인식 후보가 각각 검토 가능한 형태로 표시됩니다."
    }
  }
  renderChanges();renderResults();renderLiveImpactPreview();saveLocal()
}

async function runEquipmentOcr(){
  try{
    const beforeResult=await ocrImageEntries(state.equipmentBeforeImages,"현재 장비 A");
    const afterResult=await ocrImageEntries(state.equipmentAfterImages,"변경 장비 B");
    const before=extractOptionRows(beforeResult.text,beforeResult.confidence);
    const after=extractOptionRows(afterResult.text,afterResult.confidence);
    renderSevenRowEditor({
      selector:"#equipmentOcrPreview",source:"장비",beforeRows:before,afterRows:after,
      stateKey:"pendingEquipmentRows",titleA:"현재 장비 A · 최대 7줄",titleB:"변경 장비 B · 최대 7줄"
    })
  }catch(e){alert(e.message)}
}

async function runAbilityOcr(){
  try{
    const beforeResult=await ocrImageEntries(state.abilityBeforeImages,"현재 어빌 A");
    const afterResult=await ocrImageEntries(state.abilityAfterImages,"변경 어빌 B");
    const before=extractOptionRows(beforeResult.text,beforeResult.confidence);
    const after=extractOptionRows(afterResult.text,afterResult.confidence);
    renderSevenRowEditor({
      selector:"#abilityOcrPreview",source:"어빌리티",beforeRows:before,afterRows:after,
      stateKey:"pendingAbilityRows",titleA:"현재 어빌 A · 최대 7줄",titleB:"변경 어빌 B · 최대 7줄"
    })
  }catch(e){alert(e.message)}
}

function renderLiveImpactPreview(){
  const before={...state.stats},after=getAfterStats(),comp=compare(before,after);
  const metrics=[
    ["보스 스킬",comp.boss_skill],["일반몹 스킬",comp.normal_skill],
    ["보스 기본공격",comp.boss_basic],["일반몹 기본공격",comp.normal_basic]
  ];
  $("#liveImpactMetrics").innerHTML=metrics.map(([label,value])=>`
    <article class="metric-card"><span>${label} 비교 지수 변화 ${officialHelpButton("comparisonModel", true)}</span>
    <strong class="${value>=0?"positive":"negative"}">${value>=0?"+":""}${value.toFixed(3)}%</strong></article>`).join("");

  const keys=Object.keys(STAT_META).filter(k=>Number(before[k]||0)!==Number(after[k]||0));
  $("#liveImpactStatsBody").innerHTML=keys.map(key=>{
    const d=after[key]-before[key];
    return `<tr><td><span class="table-stat-label">${STAT_META[key][0]}${officialHelpButton(key)}</span></td><td class="num">${formatValue(key,before[key])}</td>
    <td class="num">${formatValue(key,after[key])}</td>
    <td class="num ${d>=0?"positive":"negative"}">${d>=0?"+":""}${formatValue(key,d)}</td></tr>`
  }).join("")||`<tr><td colspan="4" class="empty-state">변경된 스탯이 없습니다.</td></tr>`;

  const contrib=contributionAnalysis(before,after);
  $("#liveImpactAnalysis").textContent=contrib.length
    ? `연구소 비교 모델에서 가장 큰 영향은 ${STAT_META[contrib[0][0]][0]} (${contrib[0][1]>=0?"+":""}${contrib[0][1].toFixed(3)}%)입니다. 보스 스킬 지수 ${comp.boss_skill>=0?"+":""}${comp.boss_skill.toFixed(3)}%, 일반몹 스킬 지수 ${comp.normal_skill>=0?"+":""}${comp.normal_skill.toFixed(3)}% 변화입니다.`
    : "변경을 추가하면 현재 스펙에 미치는 영향이 표시됩니다.";
}


function setupFileDropZone(selector, onFiles){
  const zone=$(selector); if(!zone)return;
  ["dragenter","dragover"].forEach(type=>zone.addEventListener(type,e=>{e.preventDefault();e.stopPropagation();zone.classList.add("dragover")}));
  ["dragleave","drop"].forEach(type=>zone.addEventListener(type,e=>{e.preventDefault();e.stopPropagation();zone.classList.remove("dragover")}));
  zone.addEventListener("drop",e=>{const files=[...(e.dataTransfer?.files||[])].filter(f=>f.type.startsWith("image/"));if(files.length)onFiles(files)});
}

function setupAllDropZones(){
  setupFileDropZone("#equipmentBeforeDrop",files=>{state.equipmentBeforeImages=createLocalImageEntries(files);renderMiniGallery("#equipmentBeforeGallery",state.equipmentBeforeImages)});
  setupFileDropZone("#equipmentAfterDrop",files=>{state.equipmentAfterImages=createLocalImageEntries(files);renderMiniGallery("#equipmentAfterGallery",state.equipmentAfterImages)});
  setupFileDropZone("#abilityBeforeDrop",files=>{state.abilityBeforeImages=createLocalImageEntries(files);renderMiniGallery("#abilityBeforeGallery",state.abilityBeforeImages)});
  setupFileDropZone("#abilityAfterDrop",files=>{state.abilityAfterImages=createLocalImageEntries(files);renderMiniGallery("#abilityAfterGallery",state.abilityAfterImages)});
  for(const rarity of ["epic","unique","legendary"]){
    setupFileDropZone(`#${rarity}InventoryDrop`,files=>addInventoryImages(rarity,files));
  }
}

function setupAdvancedChangeInputs(){
  setupChangeSourceTabs();

  $("#equipmentBeforeInput").addEventListener("change",e=>{state.equipmentBeforeImages=createLocalImageEntries(e.target.files);renderMiniGallery("#equipmentBeforeGallery",state.equipmentBeforeImages)});
  $("#equipmentAfterInput").addEventListener("change",e=>{state.equipmentAfterImages=createLocalImageEntries(e.target.files);renderMiniGallery("#equipmentAfterGallery",state.equipmentAfterImages)});
  $("#equipmentBeforeClipboardBtn").addEventListener("click",async()=>{try{state.equipmentBeforeImages=await readClipboardImageEntries();renderMiniGallery("#equipmentBeforeGallery",state.equipmentBeforeImages)}catch(e){alert(e.message)}});
  $("#equipmentAfterClipboardBtn").addEventListener("click",async()=>{try{state.equipmentAfterImages=await readClipboardImageEntries();renderMiniGallery("#equipmentAfterGallery",state.equipmentAfterImages)}catch(e){alert(e.message)}});
  $("#runEquipmentOcrBtn").addEventListener("click",runEquipmentOcr);

  $("#abilityBeforeInput").addEventListener("change",e=>{
    state.abilityBeforeImages=createLocalImageEntries(e.target.files);
    renderMiniGallery("#abilityBeforeGallery",state.abilityBeforeImages)
  });
  $("#abilityAfterInput").addEventListener("change",e=>{
    state.abilityAfterImages=createLocalImageEntries(e.target.files);
    renderMiniGallery("#abilityAfterGallery",state.abilityAfterImages)
  });
  $("#abilityBeforeClipboardBtn").addEventListener("click",async()=>{try{state.abilityBeforeImages=await readClipboardImageEntries();renderMiniGallery("#abilityBeforeGallery",state.abilityBeforeImages)}catch(e){alert(e.message)}});
  $("#abilityAfterClipboardBtn").addEventListener("click",async()=>{try{state.abilityAfterImages=await readClipboardImageEntries();renderMiniGallery("#abilityAfterGallery",state.abilityAfterImages)}catch(e){alert(e.message)}});
  $("#runAbilityOcrBtn").addEventListener("click",runAbilityOcr);

  $("#goCompanionTabBtn").addEventListener("click",()=>activateTab("companions"));
  $("#applyCompanionsFromChangesBtn").addEventListener("click",applyCompanionsToChanges);
  $("#previewChangesBtn").addEventListener("click",renderLiveImpactPreview);
  $("#openResultsFromChangesBtn").addEventListener("click",()=>{renderResults();activateTab("results")});
}

function setupPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister())).catch(console.warn);
  }
  if ("caches" in window) caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).catch(console.warn);
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault(); state.deferredInstallPrompt = event;
    $("#installBtn").classList.remove("hidden");
  });
  $("#installBtn").addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    $("#installBtn").classList.add("hidden");
  });
}


async function loadCompanionDatabase(){
  try{
    const response=await fetch("./companions_database.json?v="+encodeURIComponent(APP_VERSION), {cache:"no-store"});
    state.companionDb=await response.json();
    $("#companionEditor").value=JSON.stringify(state.companionDb,null,2);
    renderCompanions();
  }catch(error){console.error(error);$("#companionCards").innerHTML='<div class="empty-state">동료 데이터베이스를 불러오지 못했습니다.</div>'}
}
function companionValue(c,r,l){
  const d=c.rarities[r];
  const lv=Math.max(1,Math.min(Number(l||1),d.level_cap));
  const raw=Number(d.base_value)+(lv-1)*Number(d.per_level);
  return c.unit==="flat" ? Math.floor(raw+1e-9) : Math.floor((raw+1e-9)*10)/10;
}
function companionDisplay(c,v){return c.unit==="flat"?Math.round(v).toLocaleString("ko-KR"):`${Math.floor((v+1e-8)*10)/10}%`}

function inventoryKey(companionId,rarity){return `${companionId}::${rarity}`}
function ensureInventoryEntry(companionId,rarity){
  const key=inventoryKey(companionId,rarity);
  if(!state.companionInventory[key])state.companionInventory[key]={companionId,rarity,owned:false,level:1,equipped:false,fixed:false,excluded:false};
  return state.companionInventory[key]
}
function inventoryEntries(ownedOnly=false){
  if(!state.companionDb)return[];
  const rows=[];
  for(const rarity of ["legendary","unique","epic"]){
    for(const c of state.companionDb.companions){
      const inv=ensureInventoryEntry(c.id,rarity);
      if(ownedOnly&&!inv.owned)continue;
      rows.push({key:inventoryKey(c.id,rarity),companion:c,...inv,value:companionValue(c,rarity,inv.level)})
    }
  }
  return rows
}
function selectedCompanions(){return inventoryEntries(true).filter(x=>x.equipped)}
function companionSumsForEntries(entries){const sums={};for(const x of entries)sums[x.companion.effect_key]=(sums[x.companion.effect_key]||0)+x.value;return sums}
function companionSums(){return companionSumsForEntries(selectedCompanions())}

function getBaselineCompanionTeam(){
  const saved=new Set(state.savedCompanionTeam||[]);
  const savedTeam=inventoryEntries(true).filter(x=>saved.has(x.key));
  if(savedTeam.length===7)return savedTeam;
  return inventoryEntries(true).filter(x=>x.equipped);
}
function renderCurrentCompanionTeam(){
  const box=$("#currentCompanionTeamView"); if(!box)return;
  const team=getBaselineCompanionTeam();
  if(!team.length){box.innerHTML='<div class="empty-state">이미지의 E 표시를 분석하거나 아래 목록에서 현재 장착 동료를 선택해 주세요.</div>';renderStatsCurrentCompanionTeam();return}
  box.innerHTML=team.map((x,i)=>`<div class="companion-current-member"><span>장착 ${i+1}</span><img src="${x.companion.icon_data||x.companion.icon}" alt="${x.companion.name}"><strong>${x.companion.name}</strong><small>${x.companion.rarities[x.rarity].name} Lv.${x.level}</small></div>`).join("")+`${team.length<7?`<div class="empty-state compact-empty">E 표시 ${team.length}명만 반영되었습니다.</div>`:""}`;
  renderStatsCurrentCompanionTeam();
  renderHomeDashboard();
}

function renderCompanions(){
  if(!state.companionDb)return;
  const q=($("#companionSearch")?.value||"").trim().toLowerCase();
  const rf=$("#companionRarityFilter")?.value||"all";
  const sf=$("#companionStateFilter")?.value||"all";
  const sort=$("#companionSortMode")?.value||"rarity";
  const box=$("#companionCards");box.innerHTML="";

  let rows=inventoryEntries(false).filter(x=>{
    if(rf!=="all"&&x.rarity!==rf)return false;
    if(q&&!`${x.companion.name} ${x.companion.effect_name}`.toLowerCase().includes(q))return false;
    if(sf==="owned"&&!x.owned)return false;if(sf==="equipped"&&!x.equipped)return false;
    if(sf==="fixed"&&!x.fixed)return false;if(sf==="excluded"&&!x.excluded)return false;return true
  });
  if(sort==="job")rows.sort((a,b)=>state.companionDb.companions.indexOf(a.companion)-state.companionDb.companions.indexOf(b.companion)||["legendary","unique","epic"].indexOf(a.rarity)-["legendary","unique","epic"].indexOf(b.rarity));

  const renderCard=x=>{
    const c=x.companion,inv=state.companionInventory[x.key],d=c.rarities[x.rarity],card=document.createElement("article");
    card.className=`companion-card ${inv.owned?"selected":""}`;
    card.innerHTML=`<div class="companion-card-head"><img class="companion-avatar ${x.rarity}" src="${c.icon_data||c.icon}" alt="${c.name}"><div><div class="companion-name">${c.name}</div><div class="companion-effect">${c.effect_name}</div></div></div>
    <div class="companion-card-grid"><label>등급<input value="${d.name}" disabled></label><label>레벨<input data-inv-level="${x.key}" type="number" min="1" max="${d.level_cap}" value="${inv.level}"></label></div>
    <div class="companion-value"><span>장착 효과</span><strong>${companionDisplay(c,companionValue(c,x.rarity,inv.level))}</strong></div>
    <div class="companion-card-actions"><label class="companion-state-toggle"><input data-inv-owned="${x.key}" type="checkbox" ${inv.owned?"checked":""}>보유</label><label class="companion-state-toggle"><input data-inv-equipped="${x.key}" type="checkbox" ${inv.equipped?"checked":""} ${!inv.owned?"disabled":""}>현재 장착</label><label class="companion-state-toggle"><input data-inv-fixed="${x.key}" type="checkbox" ${inv.fixed?"checked":""} ${!inv.owned?"disabled":""}>필수 고정</label><label class="companion-state-toggle"><input data-inv-excluded="${x.key}" type="checkbox" ${inv.excluded?"checked":""} ${!inv.owned?"disabled":""}>추천 제외</label></div>`;
    return card
  };

  if(sort==="rarity"){
    const names={legendary:"레전드",unique:"유니크",epic:"에픽"};
    for(const rarity of ["legendary","unique","epic"]){
      const group=rows.filter(x=>x.rarity===rarity);if(!group.length)continue;
      const section=document.createElement("details");section.className="companion-rarity-section";section.open=true;
      section.innerHTML=`<summary class="companion-rarity-header"><div class="companion-rarity-title"><span class="rarity-badge ${rarity}">${names[rarity]}</span><span>${group.length}명</span></div>
      <span class="summary-tools">${officialHelpButton("companions", true, "공식 동료 능력치 설명 보기")}<span class="collapse-hint" aria-hidden="true">접기/펼치기</span></span></summary>
      <div class="companion-rarity-actions"><button class="button ghost" data-rarity-own-all="${rarity}" type="button">모두 보유</button><button class="button ghost" data-rarity-own-none="${rarity}" type="button">모두 해제</button></div>
      <div class="companion-rarity-cards"></div>`;
      const cards=section.querySelector(".companion-rarity-cards");group.forEach(x=>cards.appendChild(renderCard(x)));box.appendChild(section)
    }
  }else rows.forEach(x=>box.appendChild(renderCard(x)));

  $$("[data-rarity-own-all]").forEach(btn=>btn.addEventListener("click",()=>{for(const x of inventoryEntries(false).filter(x=>x.rarity===btn.dataset.rarityOwnAll))state.companionInventory[x.key].owned=true;renderCompanions();saveLocal()}));
  $$("[data-rarity-own-none]").forEach(btn=>btn.addEventListener("click",()=>{for(const x of inventoryEntries(false).filter(x=>x.rarity===btn.dataset.rarityOwnNone)){const inv=state.companionInventory[x.key];inv.owned=false;inv.equipped=false;inv.fixed=false;inv.excluded=false}renderCompanions();saveLocal()}));

  $$("[data-inv-level]").forEach(el=>el.addEventListener("change",()=>{const inv=state.companionInventory[el.dataset.invLevel],c=state.companionDb.companions.find(x=>x.id===inv.companionId);inv.level=Math.max(1,Math.min(Number(el.value||1),c.rarities[inv.rarity].level_cap));renderCompanions();renderInventorySummary();saveLocal()}));
  $$("[data-inv-owned]").forEach(el=>el.addEventListener("change",()=>{const inv=state.companionInventory[el.dataset.invOwned];inv.owned=el.checked;if(!inv.owned){inv.equipped=false;inv.fixed=false;inv.excluded=false}renderCompanions();renderInventorySummary();saveLocal()}));
  $$("[data-inv-equipped]").forEach(el=>el.addEventListener("change",()=>{const inv=state.companionInventory[el.dataset.invEquipped],count=inventoryEntries(true).filter(x=>x.equipped).length;if(el.checked&&count>=7){alert("현재 장착은 최대 7개입니다.");el.checked=false;return}inv.equipped=el.checked;renderInventorySummary();renderCurrentCompanionTeam();saveLocal()}));
  $$("[data-inv-fixed]").forEach(el=>el.addEventListener("change",()=>{const inv=state.companionInventory[el.dataset.invFixed],count=inventoryEntries(true).filter(x=>x.fixed).length;if(el.checked&&count>=7){alert("필수 고정은 최대 7개입니다.");el.checked=false;return}inv.fixed=el.checked;if(inv.fixed)inv.excluded=false;renderCompanions();renderInventorySummary();saveLocal()}));
  $$("[data-inv-excluded]").forEach(el=>el.addEventListener("change",()=>{const inv=state.companionInventory[el.dataset.invExcluded];inv.excluded=el.checked;if(inv.excluded)inv.fixed=false;renderCompanions();renderInventorySummary();saveLocal()}));
  renderInventorySummary()
}

function renderInventorySummary(){
  const owned=inventoryEntries(true),equipped=owned.filter(x=>x.equipped),fixed=owned.filter(x=>x.fixed);
  $("#ownedCompanionCount").textContent=`${owned.length}개`;
  $("#equippedCompanionCount").textContent=`${equipped.length} / 7`;
  $("#fixedCompanionCount").textContent=`${fixed.length} / 7`;
  renderCurrentCompanionTeam();
}

const OPTIMIZER_PRESETS={
  general:[["damage",40],["critical_damage",35],["attack_speed",25]],
  boss:[["boss_damage",60],["critical_damage",25],["attack_speed",15]],
  normal:[["normal_damage",60],["critical_damage",25],["attack_speed",15]],
  mixed:[["boss_damage",40],["normal_damage",40],["attack_speed",20]],
  status:[["status_damage",60],["damage",25],["attack_speed",15]],
  accuracy:[["accuracy",70],["normal_damage",20],["attack_speed",10]]
};
function optimizerPriorities(){
  return [1,2,3].map(i=>({key:$(`#priorityKey${i}`)?.value||"",weight:Number($(`#priorityWeight${i}`)?.value||0)})).filter(x=>x.key&&x.weight>0)
}
function priorityScore(entries){
  const sums=companionSumsForEntries(entries),priorities=optimizerPriorities();
  return priorities.reduce((total,p)=>{
    const value=Number(sums[p.key]||0),base=Math.max(1,Math.abs(Number(state.stats[p.key]||0)));
    const normalized=STAT_META[p.key]?.[1]?value:(value/base*100);
    return total+normalized*(p.weight/100)
  },0)
}
function scoreTeam(entries){
  const before={...state.stats},after={...before};
  for(const[k,v]of Object.entries(companionSumsForEntries(entries)))after[k]=Number(after[k]||0)+v;
  const mode=$("#optimizerMode").value,comp=compare(before,after);
  const damageScore=mode==="boss"?comp.boss_skill:mode==="normal"?comp.normal_skill:mode==="mixed"?(comp.boss_skill+comp.normal_skill)/2:(comp.boss_skill+comp.normal_skill+comp.boss_basic+comp.normal_basic)/4;
  return damageScore+priorityScore(entries);
}
function applyOptimizerPreset(mode){
  const preset=OPTIMIZER_PRESETS[mode]||OPTIMIZER_PRESETS.general;
  preset.forEach(([key,weight],i)=>{const n=i+1;$(`#priorityKey${n}`).value=key;$(`#priorityWeight${n}`).value=weight});
  updatePriorityStatus();
}
function updatePriorityStatus(){
  const total=[1,2,3].reduce((s,i)=>s+Number($(`#priorityWeight${i}`)?.value||0),0),el=$("#priorityWeightStatus");if(!el)return;
  el.textContent=`가중치 합계 ${total}%${total===100?"":" - 100%가 되도록 조정하세요."}`;
  el.classList.toggle("warning",total!==100)
}
function normalizePriorityWeights(){
  const vals=[1,2,3].map(i=>Math.max(0,Number($(`#priorityWeight${i}`).value||0))),sum=vals.reduce((a,b)=>a+b,0);
  if(sum<=0){[60,25,15].forEach((v,i)=>$(`#priorityWeight${i+1}`).value=v)}else{
    let used=0;vals.forEach((v,i)=>{const n=i===2?100-used:Math.round(v/sum*100);$(`#priorityWeight${i+1}`).value=n;used+=n})
  }updatePriorityStatus()
}
function combinationsExact(items,k,callback,start=0,picked=[]){if(k===0){callback([...picked]);return}for(let i=start;i<=items.length-k;i++){picked.push(items[i]);combinationsExact(items,k-1,callback,i+1,picked);picked.pop()}}
function optimizeCompanions(){
  const current=getBaselineCompanionTeam();if(current.length!==7)return alert("현재 사용 중인 동료 7명을 먼저 선택하고 기준 저장을 눌러주세요.");
  const owned=inventoryEntries(true),fixed=owned.filter(x=>x.fixed&&!x.excluded),candidates=owned.filter(x=>!x.fixed&&!x.excluded),need=7-fixed.length;
  if(fixed.length>7)return alert("필수 고정 동료가 7개를 초과했습니다.");if(candidates.length<need)return alert(`추천 가능한 동료가 부족합니다. 현재 ${fixed.length+candidates.length}개입니다.`);
  const totalWeight=[1,2,3].reduce((s,i)=>s+Number($(`#priorityWeight${i}`).value||0),0);if(totalWeight!==100)return alert("세부 우선순위 가중치 합계를 100%로 맞춰주세요.");
  const limit=Math.max(1,Math.min(10,Number($("#optimizerResultCount").value||5))),results=[];
  const push=team=>{results.push({team,score:scoreTeam(team)});results.sort((a,b)=>b.score-a.score);if(results.length>limit)results.length=limit};
  const comb=(n,r)=>{let v=1;for(let i=1;i<=r;i++)v=v*(n-r+i)/i;return Math.round(v)},total=comb(candidates.length,need);
  if(total<=250000)combinationsExact(candidates,need,c=>push([...fixed,...c]));
  else{let beam=[[]];const width=2500;for(let depth=0;depth<need;depth++){const ex=[];for(const p of beam){const last=p.length?candidates.indexOf(p.at(-1)):-1;for(let i=last+1;i<candidates.length;i++){const n=[...p,candidates[i]];ex.push({p:n,s:scoreTeam([...fixed,...n])})}}ex.sort((a,b)=>b.s-a.s);beam=ex.slice(0,width).map(x=>x.p)}for(const c of beam)push([...fixed,...c])}
  state.optimizerResults=results;$("#optimizerStatus").textContent=`${total.toLocaleString("ko-KR")}개 후보에서 현재 조합과 비교할 상위 ${results.length}개를 계산했습니다.`;renderOptimizerResults()
}
function companionDeltaSums(current,recommended){
  const a=companionSumsForEntries(current),b=companionSumsForEntries(recommended),out={};
  for(const key of new Set([...Object.keys(a),...Object.keys(b)]))out[key]=Number(b[key]||0)-Number(a[key]||0);return out
}
function applyRecommendedTeamToChanges(team){
  const current=getBaselineCompanionTeam();if(current.length!==7)return alert("현재 동료 기준 7명을 먼저 저장하세요.");
  state.changes=state.changes.filter(c=>c.source!=="동료");
  const deltas=companionDeltaSums(current,team);
  for(const[key,delta]of Object.entries(deltas)){if(!(key in STAT_META)||delta===0)continue;const before=Number(state.stats[key]||0);state.changes.push({source:"동료",key,before,after:before+delta})}
  renderChanges();renderLiveImpactPreview();renderResults();saveLocal();activateTab("changes")
}
function renderOptimizerResults(){
  const box=$("#optimizerResults"),current=getBaselineCompanionTeam(),currentScore=current.length===7?scoreTeam(current):null;box.innerHTML="";
  state.optimizerResults.forEach((r,i)=>{const deltas=current.length===7?companionDeltaSums(current,r.team):{},deltaRows=Object.entries(deltas).filter(([,v])=>v!==0).map(([k,v])=>`${STAT_META[k]?.[0]||k} ${v>=0?"+":""}${formatValue(k,v)}`).join(" · ");const card=document.createElement("article");card.className="optimizer-result-card";card.innerHTML=`<div class="optimizer-result-head"><div><strong>${i+1}위 추천 조합</strong><p class="subtitle">현재 사용 7명 대비 교체 결과</p></div><div class="optimizer-score">${currentScore===null?"기준 미저장":`${r.score-currentScore>=0?"+":""}${(r.score-currentScore).toFixed(3)}`}</div></div><div class="optimizer-team">${r.team.map(x=>`<div class="optimizer-member"><img src="${x.companion.icon_data||x.companion.icon}" alt="${x.companion.name}"><strong>${x.companion.name}</strong><small>${x.companion.rarities[x.rarity].name} Lv.${x.level}</small></div>`).join("")}</div><div class="optimizer-deltas">${deltaRows||"현재 조합과 능력치 차이가 없습니다."}</div><div class="button-row top-gap"><button class="button primary" data-use-recommended="${i}" type="button">이 추천을 변경 목록에 적용</button></div>`;box.appendChild(card)});
  $$('[data-use-recommended]').forEach(btn=>btn.addEventListener('click',()=>applyRecommendedTeamToChanges(state.optimizerResults[Number(btn.dataset.useRecommended)].team)))
}
function renderInventoryImageGallery(rarity){
  const box=$(`#${rarity}InventoryPreview`),items=state.companionInventoryImages[rarity]||[];
  if(!items.length){box.className="inventory-preview empty-state";box.textContent="이미지 없음";return}
  box.className="inventory-preview inventory-multi-gallery";
  box.innerHTML=items.map((item,index)=>`<article><img src="${item.url}" alt="${rarity} 목록 ${index+1}"><button data-remove-inventory-image="${rarity}:${item.id}" type="button" aria-label="이미지 삭제">×</button><small>${index+1}번 이미지</small></article>`).join("");
  $$('[data-remove-inventory-image]').forEach(button=>button.addEventListener("click",()=>{
    const [targetRarity,id]=button.dataset.removeInventoryImage.split(":");
    const target=state.companionInventoryImages[targetRarity]||[],item=target.find(x=>x.id===id);if(item?.url)URL.revokeObjectURL(item.url);
    state.companionInventoryImages[targetRarity]=target.filter(x=>x.id!==id);renderInventoryImageGallery(targetRarity)
  }))
}
function addInventoryImages(rarity,files){
  const additions=[...(files||[])].filter(file=>file.type.startsWith("image/")).map(file=>({id:crypto.randomUUID(),file,url:URL.createObjectURL(file)}));
  state.companionInventoryImages[rarity]=[...(state.companionInventoryImages[rarity]||[]),...additions];renderInventoryImageGallery(rarity)
}
async function setInventoryFromClipboard(rarity){
  try{const entries=await readClipboardImageEntries();if(!entries.length)throw new Error("클립보드에 이미지가 없습니다.");addInventoryImages(rarity,entries.map(x=>x.file))}catch(e){alert(e.message)}
}

function rgbToHsv(r,g,b){
  r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;
  if(d){if(max===r)h=60*(((g-b)/d)%6);else if(max===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4)}
  if(h<0)h+=360;return [h,max?d/max:0,max]
}
function rarityHueMatch(rarity,h,s,v){
  if(s<.28||v<.18)return false;
  if(rarity==="legendary")return h>=75&&h<=175;
  if(rarity==="unique")return h>=25&&h<=72;
  return h>=245&&h<=335
}
async function inventoryCanvas(file){
  const bitmap=await createImageBitmap(file),scale=Math.min(1,1200/bitmap.width),canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height);return canvas
}
function detectCompanionFrames(canvas,rarity){
  const ctx=canvas.getContext("2d"),image=ctx.getImageData(0,0,canvas.width,canvas.height),data=image.data,w=canvas.width,h=canvas.height,n=w*h,mask=new Uint8Array(n);
  for(let i=0;i<n;i++){const p=i*4,[hh,s,v]=rgbToHsv(data[p],data[p+1],data[p+2]);if(rarityHueMatch(rarity,hh,s,v))mask[i]=1}
  const components=[],neighbors=[-1,1,-w,w,-w-1,-w+1,w-1,w+1];
  for(let start=0;start<n;start++){
    if(mask[start]!==1)continue;const stack=[start],members=[];mask[start]=2;let minX=w,maxX=0,minY=h,maxY=0;
    while(stack.length){const idx=stack.pop(),x=idx%w,y=Math.floor(idx/w);members.push(idx);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      for(const delta of neighbors){const next=idx+delta;if(next<0||next>=n||mask[next]!==1)continue;const nx=next%w,ny=Math.floor(next/w);if(Math.abs(nx-x)>1||Math.abs(ny-y)>1)continue;mask[next]=2;stack.push(next)}}
    const bw=maxX-minX+1,bh=maxY-minY+1,aspect=bw/bh;if(members.length<24||bw<24||bh<24||bw>260||bh>260||aspect<.68||aspect>1.32)continue;
    const band=Math.max(2,Math.round(Math.min(bw,bh)*.14));let borderPixels=0,strength=0;
    for(const idx of members){const x=idx%w,y=Math.floor(idx/w);if(x-minX<=band||maxX-x<=band||y-minY<=band||maxY-y<=band){const p=idx*4,[,s,v]=rgbToHsv(data[p],data[p+1],data[p+2]);borderPixels++;strength+=s*v}}
    const perimeter=Math.max(1,2*bw*band+2*Math.max(0,bh-2*band)*band),coverage=borderPixels/perimeter;if(coverage<.055)continue;
    components.push({x:minX,y:minY,width:bw,height:bh,borderStrength:borderPixels?strength/borderPixels:0,score:coverage*(1-Math.abs(1-aspect))})
  }
  components.sort((a,b)=>b.score-a.score);const kept=[];
  for(const box of components){const overlaps=kept.some(other=>{const ix=Math.max(0,Math.min(box.x+box.width,other.x+other.width)-Math.max(box.x,other.x)),iy=Math.max(0,Math.min(box.y+box.height,other.y+other.height)-Math.max(box.y,other.y));return ix*iy/Math.min(box.width*box.height,other.width*other.height)>.45});if(!overlaps)kept.push(box)}
  return kept.sort((a,b)=>a.y-b.y||a.x-b.x)
}
function descriptorFromCanvas(source,box=null){
  const size=20,canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;const ctx=canvas.getContext("2d");ctx.fillStyle="#777";ctx.fillRect(0,0,size,size);
  if(box){const inset=.09;ctx.drawImage(source,box.x+box.width*inset,box.y+box.height*inset,box.width*(1-inset*2),box.height*(1-inset*2),0,0,size,size)}else ctx.drawImage(source,0,0,size,size);
  const d=ctx.getImageData(0,0,size,size).data,gray=[];for(let i=0;i<d.length;i+=4)gray.push(d[i]*.299+d[i+1]*.587+d[i+2]*.114);
  const bits=[];for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++){const i=y*size+x;bits.push(gray[i+1]>gray[i-1],gray[i+size]>gray[i-size])}return bits
}
function descriptorSimilarity(a,b){let same=0,n=Math.min(a.length,b.length);for(let i=0;i<n;i++)if(a[i]===b[i])same++;return n?same/n:0}
let companionReferenceDescriptors=null;
async function getCompanionReferenceDescriptors(){
  if(companionReferenceDescriptors)return companionReferenceDescriptors;companionReferenceDescriptors=[];
  for(const companion of state.companionDb.companions){try{const response=await fetch(companion.icon_data||companion.icon),bitmap=await createImageBitmap(await response.blob());companionReferenceDescriptors.push({id:companion.id,bits:descriptorFromCanvas(bitmap)})}catch{}}
  return companionReferenceDescriptors
}
function cropDataUrl(canvas,box){const out=document.createElement("canvas"),pad=.03;out.width=96;out.height=96;out.getContext("2d").drawImage(canvas,box.x-box.width*pad,box.y-box.height*pad,box.width*(1+pad*2),box.height*(1+pad*2),0,0,96,96);return out.toDataURL("image/jpeg",.84)}
function wordsForFrame(words,box){return (words||[]).filter(word=>{const x=((word.bbox?.x0||0)+(word.bbox?.x1||0))/2,y=((word.bbox?.y0||0)+(word.bbox?.y1||0))/2;return x>=box.x&&x<=box.x+box.width&&y>=box.y&&y<=box.y+box.height}).sort((a,b)=>(a.bbox?.y0||0)-(b.bbox?.y0||0)||(a.bbox?.x0||0)-(b.bbox?.x0||0)).map(word=>word.text).join(" ")}
function detectEquippedMarker(canvas,box){
  const ctx=canvas.getContext("2d"),x=Math.max(0,Math.round(box.x+box.width*.58)),y=Math.max(0,Math.round(box.y+box.height*.18)),w=Math.max(1,Math.round(box.width*.34)),h=Math.max(1,Math.round(box.height*.62)),data=ctx.getImageData(x,y,Math.min(w,canvas.width-x),Math.min(h,canvas.height-y)).data;let bright=0,total=0;
  for(let i=0;i<data.length;i+=4){const [hue,s,v]=rgbToHsv(data[i],data[i+1],data[i+2]);if(hue>=42&&hue<=82&&s>=.52&&v>=.62)bright++;total++}
  return total>0&&bright/total>=.018
}
function companionDetectionReviewState(item){
  if(!item.companionId)return "missing";
  if(item.ownedGuess==="unknown"||item.matchConfidence<.58)return "warning";
  return "confirmed"
}
function updateCompanionDetectionRow(item,row){
  const review=companionDetectionReviewState(item);
  row.classList.remove("review-neutral","review-warning","review-confirmed","review-missing","low-confidence");
  row.classList.add(`review-${review}`);
  const badge=row.querySelector("[data-detection-status]");
  if(badge){badge.className=`review-status-badge ${review}`;badge.textContent=review==="confirmed"?"확인 완료":review==="warning"?"확인 필요":"동료 선택 필요"}
}
function renderCompanionDetectionReview(){
  const box=$("#companionInventoryOcrResult"),items=state.pendingCompanionDetections||[],options=state.companionDb.companions.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
  if(!items.length){box.className="ocr-change-preview empty-state";box.textContent="색 테두리의 동료 카드를 찾지 못했습니다. 이미지가 잘리지 않았는지 확인하거나 아래 목록에서 직접 입력해 주세요.";return}
  box.className="ocr-change-preview companion-detection-review";
  box.innerHTML=`<div class="import-safety-notice"><strong>적용 전 검토</strong><p>위치가 아닌 테두리 색과 초상화로 찾은 후보입니다. 이름·보유 여부·레벨·E 장착 표시를 확인한 항목만 적용하세요.</p></div>
    <div class="detection-review-list">${items.map((item,index)=>`<article class="detection-review-row review-${companionDetectionReviewState(item)}" data-detection-row="${item.id}"><img src="${item.thumbnail}" alt="감지 카드 ${index+1}"><div class="detection-fields"><label><span>동료</span><select data-detection-companion="${item.id}"><option value="">선택 필요</option>${options}</select></label><label><span>보유 판정</span><select data-detection-owned="${item.id}"><option value="unknown">확인 필요</option><option value="owned">보유</option><option value="unowned">미보유</option></select></label><label><span>레벨</span><input data-detection-level="${item.id}" type="number" inputmode="numeric" min="1" max="${item.cap}" value="${item.level}"></label><label class="equipped-detection"><input data-detection-equipped="${item.id}" type="checkbox" ${item.equipped?"checked":""}><span>현재 장착 E</span></label></div><small><span class="review-status-badge ${companionDetectionReviewState(item)}" data-detection-status>${companionDetectionReviewState(item)==="confirmed"?"확인 완료":companionDetectionReviewState(item)==="warning"?"확인 필요":"동료 선택 필요"}</span> 초상화 일치도 ${Math.round(item.matchConfidence*100)}% · 테두리 ${Math.round(item.borderStrength*100)}%</small></article>`).join("")}</div>
    <div class="button-row top-gap"><button class="button primary" id="applyCompanionDetectionsBtn" type="button">검토한 보유·장착 동료 적용</button><button class="button ghost" id="manualCompanionEntryBtn" type="button">목록에서 직접 입력</button></div>`;
  for(const item of items){const select=box.querySelector(`[data-detection-companion="${item.id}"]`),owned=box.querySelector(`[data-detection-owned="${item.id}"]`),row=box.querySelector(`[data-detection-row="${item.id}"]`);if(item.companionId&&item.matchConfidence>=.58)select.value=item.companionId;owned.value=item.ownedGuess;select.addEventListener("change",()=>{item.companionId=select.value;item.matchConfidence=1;updateCompanionDetectionRow(item,row)});owned.addEventListener("change",()=>{item.ownedGuess=owned.value;updateCompanionDetectionRow(item,row)});box.querySelector(`[data-detection-level="${item.id}"]`).addEventListener("change",event=>{item.level=Math.max(1,Math.min(item.cap,Number(event.target.value||1)));event.target.value=item.level});box.querySelector(`[data-detection-equipped="${item.id}"]`).addEventListener("change",event=>item.equipped=event.target.checked)}
  $("#applyCompanionDetectionsBtn").addEventListener("click",applyCompanionDetections);$("#manualCompanionEntryBtn").addEventListener("click",openCompanionManualEntry)
}
function applyCompanionDetections(){
  for(const item of state.pendingCompanionDetections||[]){const companion=$("#companionInventoryOcrResult")?.querySelector(`[data-detection-companion="${item.id}"]`),owned=$("#companionInventoryOcrResult")?.querySelector(`[data-detection-owned="${item.id}"]`),level=$("#companionInventoryOcrResult")?.querySelector(`[data-detection-level="${item.id}"]`),equipped=$("#companionInventoryOcrResult")?.querySelector(`[data-detection-equipped="${item.id}"]`);if(companion)item.companionId=companion.value;if(owned)item.ownedGuess=owned.value;if(level)item.level=Math.max(1,Math.min(item.cap,Number(level.value||1)));if(equipped)item.equipped=equipped.checked}
  const unresolved=(state.pendingCompanionDetections||[]).filter(item=>companionDetectionReviewState(item)!=="confirmed");if(unresolved.length)return alert(`확인 필요 동료 후보가 ${unresolved.length}개 남아 있습니다. 주황색 또는 붉은색 박스의 동료와 보유 판정을 확인해 주세요.`);
  const reviewed=(state.pendingCompanionDetections||[]).filter(item=>item.companionId&&item.ownedGuess!=="unknown");if(!reviewed.length)return alert("동료 이름과 보유 여부를 확인한 항목이 없습니다.");
  const merged=new Map();for(const item of reviewed){const key=`${item.companionId}::${item.rarity}`,previous=merged.get(key);if(!previous||item.matchConfidence>previous.matchConfidence)merged.set(key,item)}
  const unique=[...merged.values()],equipped=unique.filter(item=>item.ownedGuess==="owned"&&item.equipped);
  for(const item of unique){const inv=ensureInventoryEntry(item.companionId,item.rarity);inv.owned=item.ownedGuess==="owned";inv.level=Math.max(1,Math.min(item.cap,item.level));if(!inv.owned){inv.equipped=false;inv.fixed=false;inv.excluded=false}}
  if(equipped.length>=1&&equipped.length<=7){for(const inv of Object.values(state.companionInventory))inv.equipped=false;for(const item of equipped)ensureInventoryEntry(item.companionId,item.rarity).equipped=true;state.savedCompanionTeam=equipped.map(item=>inventoryKey(item.companionId,item.rarity))}
  state.pendingCompanionDetections=[];renderCompanions();renderCurrentCompanionTeam();saveLocal();const result=$("#companionInventoryOcrResult");result.className="ocr-change-preview import-applied";result.innerHTML=`<strong>${unique.length}개 동료를 적용했습니다.</strong><p>${equipped.length>=1&&equipped.length<=7?`E 표시 ${equipped.length}명을 현재 사용 중인 동료로 반영했습니다.`:"보유 여부와 레벨을 반영했습니다."}</p>`
}
async function analyzeCompanionInventoryImages(){
  const registered=[];for(const rarity of ["legendary","unique","epic"])for(const item of state.companionInventoryImages[rarity]||[])registered.push({rarity,item});if(!registered.length)return alert("동료 이미지를 하나 이상 추가해 주세요.");
  const button=$("#runCompanionInventoryOcrBtn");button.disabled=true;state.pendingCompanionDetections=[];
  try{const refs=await getCompanionReferenceDescriptors();for(let imageIndex=0;imageIndex<registered.length;imageIndex++){const {rarity,item}=registered[imageIndex],canvas=await inventoryCanvas(item.file),frames=detectCompanionFrames(canvas,rarity);$("#companionInventoryOcrResult").className="ocr-change-preview";$("#companionInventoryOcrResult").textContent=`${registered.length}장 중 ${imageIndex+1}장 · 색 테두리와 초상화 분석 중...`;
      let words=[];if(window.Tesseract&&frames.length){const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));const result=await Tesseract.recognize(blob,"eng",{tessedit_char_whitelist:"Lv.E0123456789",preserve_interword_spaces:"1"});words=result.data.words||[]}
      const cap=state.companionDb.companions[0].rarities[rarity].level_cap;for(const frame of frames){const bits=descriptorFromCanvas(canvas,frame),matches=refs.map(ref=>({id:ref.id,score:descriptorSimilarity(bits,ref.bits)})).sort((a,b)=>b.score-a.score),cardText=wordsForFrame(words,frame),levelMatch=cardText.match(/Lv[.\s:·-]*(\d{1,3})/i),equipped=/(^|\s)E($|\s)/.test(cardText)||detectEquippedMarker(canvas,frame);state.pendingCompanionDetections.push({id:crypto.randomUUID(),rarity,thumbnail:cropDataUrl(canvas,frame),companionId:matches[0]?.id||"",matchConfidence:matches[0]?.score||0,borderStrength:frame.borderStrength,ownedGuess:frame.borderStrength>=.42?"owned":frame.borderStrength<=.24?"unowned":"unknown",level:Math.max(1,Math.min(cap,Number(levelMatch?.[1]||1))),cap,equipped})}}
    renderCompanionDetectionReview()
  }catch(error){console.error(error);alert("이미지 분석 중 오류가 발생했습니다. 아래 목록에서 직접 입력해 주세요.");openCompanionManualEntry()}finally{button.disabled=false}
}
function openCompanionManualEntry(){
  $("#companionManualNotice")?.classList.add("active");
  $("#companionCards")?.scrollIntoView({behavior:"smooth",block:"start"});
  $("#companionSearch")?.focus({preventScroll:true});
}

function applyCompanionsToChanges(){const team=selectedCompanions();if(team.length!==7)return alert("추천 또는 변경할 동료 조합을 정확히 7명 선택하세요.");applyRecommendedTeamToChanges(team)}
function setupCompanionActions(){
  $("#companionSearch").addEventListener("input",renderCompanions);$("#companionRarityFilter").addEventListener("change",renderCompanions);$("#companionStateFilter").addEventListener("change",renderCompanions);$("#companionSortMode").addEventListener("change",renderCompanions);$("#runCompanionOptimizerBtn").addEventListener("click",optimizeCompanions);$("#runCompanionInventoryOcrBtn").addEventListener("click",analyzeCompanionInventoryImages);
  const priorityOptions='<option value="">선택 안 함</option>'+Object.entries(STAT_META).map(([k,m])=>`<option value="${k}">${m[0]}</option>`).join("");[1,2,3].forEach(i=>{$(`#priorityKey${i}`).innerHTML=priorityOptions;$(`#priorityWeight${i}`).addEventListener("input",updatePriorityStatus)});$("#optimizerMode").addEventListener("change",e=>applyOptimizerPreset(e.target.value));$("#normalizePriorityBtn").addEventListener("click",normalizePriorityWeights);applyOptimizerPreset($("#optimizerMode").value);
  $("#epicInventoryInput").addEventListener("change",e=>{addInventoryImages("epic",e.target.files);e.target.value=""});$("#uniqueInventoryInput").addEventListener("change",e=>{addInventoryImages("unique",e.target.files);e.target.value=""});$("#legendaryInventoryInput").addEventListener("change",e=>{addInventoryImages("legendary",e.target.files);e.target.value=""});
  $("#epicInventoryClipboardBtn").addEventListener("click",()=>setInventoryFromClipboard("epic"));$("#uniqueInventoryClipboardBtn").addEventListener("click",()=>setInventoryFromClipboard("unique"));$("#legendaryInventoryClipboardBtn").addEventListener("click",()=>setInventoryFromClipboard("legendary"));
  const saveCurrentTeam=()=>{const team=inventoryEntries(true).filter(x=>x.equipped);if(team.length!==7)return alert("현재 장착 동료를 정확히 7명 선택하세요.");state.savedCompanionTeam=team.map(x=>x.key);saveLocal();renderCurrentCompanionTeam();$("#optimizerStatus").textContent="현재 7인 조합을 비교 기준으로 저장했습니다.";};
  $("#saveCurrentCompanionTeamBtn").addEventListener("click",saveCurrentTeam);
  $("#saveCurrentCompanionTeamBtn2")?.addEventListener("click",saveCurrentTeam);
  $("#resetCompanionInventoryBtn").addEventListener("click",()=>{
    if(!confirm("보유 상태, 레벨, 현재 장착, 필수 고정, 추천 제외를 모두 초기화할까요?"))return;
    state.companionInventory={};state.savedCompanionTeam=[];state.optimizerResults=[];
    for(const rarity of ["epic","unique","legendary"]){for(const item of state.companionInventoryImages[rarity]||[])if(item.url)URL.revokeObjectURL(item.url);state.companionInventoryImages[rarity]=[];renderInventoryImageGallery(rarity)}
    state.pendingCompanionDetections=[];$("#companionInventoryOcrResult").className="ocr-change-preview empty-state";$("#companionInventoryOcrResult").textContent="이미지를 추가한 뒤 분석하면 검토할 카드 후보가 표시됩니다.";
    $("#optimizerResults").innerHTML="";$("#optimizerStatus").textContent="보유 동료를 등록한 뒤 추천 조합 계산을 눌러주세요.";
    renderCompanions();saveLocal()
  });
  $("#saveCompanionInventoryBtn").addEventListener("click",()=>downloadJson("companion-inventory.json",{version:"0.9",inventory:state.companionInventory,savedCompanionTeam:state.savedCompanionTeam}));
  $("#companionInventoryFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());state.companionInventory=d.inventory||d;state.savedCompanionTeam=d.savedCompanionTeam||[];renderCompanions();saveLocal()}catch{alert("보유 목록 JSON 형식이 올바르지 않습니다.")}});
  $("#saveCompanionBtn").addEventListener("click",()=>{try{state.companionDb=JSON.parse($("#companionEditor").value);downloadJson("companions_database.json",state.companionDb);renderCompanions()}catch{alert("동료 DB JSON 형식을 확인하세요.")}});
  $("#companionFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{state.companionDb=JSON.parse(await f.text());$("#companionEditor").value=JSON.stringify(state.companionDb,null,2);renderCompanions()}catch{alert("동료 DB JSON 형식이 올바르지 않습니다.")}})
}

function buildReportBody() {
  const type = $("#reportType")?.value || "기타";
  const description = $("#reportDescription")?.value.trim() || "(설명 없음)";
  const includeDebug = $("#includeDebugData")?.checked;
  const lines = [
    `## 제보 종류\n${type}`,
    `## 자세한 설명\n${description}`,
    `## 재현 순서\n${$("#reportSteps")?.value.trim() || "1. \n2. \n3. "}`,
    `## 실제 결과\n${$("#reportActual")?.value.trim() || "(작성되지 않음)"}`,
    `## 예상 결과\n${$("#reportExpected")?.value.trim() || "(작성되지 않음)"}`,
    `## 개인정보 확인\n- [ ] 첨부할 스크린샷에 개인정보가 없는지 확인했습니다.`
  ];
  if (includeDebug) {
    const debug = {
      appVersion: APP_VERSION,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      stats: state.stats,
      changes: state.changes,
      savedCompanionTeam: state.savedCompanionTeam,
      companionInventory: state.companionInventory
    };
    lines.push(`## 연구소 디버그 정보\n\n\`\`\`json\n${JSON.stringify(debug, null, 2)}\n\`\`\``);
  }
  lines.push("## 자동으로 포함되지 않는 정보\n원본 이미지, 이름, 이메일, 전화번호, IP 주소, 위치, 로그인 정보, 게임 계정 정보");
  return lines.join("\n\n");
}

function setupReportActions() {
  const preview = $("#previewReportBtn");
  const open = $("#openGithubIssueBtn");
  if (!preview || !open) return;
  preview.addEventListener("click", () => { $("#reportPreview").value = buildReportBody(); });
  open.addEventListener("click", () => {
    const titleInput = $("#reportTitle").value.trim();
    const title = `[${$("#reportType").value}] ${titleInput || "MapleSpecLab 제보"}`;
    const body = buildReportBody();
    $("#reportPreview").value = body;
    if (GITHUB_REPOSITORY.startsWith("YOUR_")) {
      alert("app.js 상단의 GITHUB_REPOSITORY를 실제 GitHub 아이디/저장소명으로 바꾼 뒤 사용할 수 있습니다. 우선 전송 내용을 복사해 주세요.");
      navigator.clipboard?.writeText(body).catch(()=>{});
      return;
    }
    const url = `https://github.com/${GITHUB_REPOSITORY}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent("user-report")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

function setupManualEntryActions() {
  $("#startEquipmentManualBtn")?.addEventListener("click", () => {
    renderSevenRowEditor({selector:"#equipmentOcrPreview",source:"장비",beforeRows:[],afterRows:[],stateKey:"pendingEquipmentRows",titleA:"현재 장비 A",titleB:"변경 장비 B"});
  });
  $("#startAbilityManualBtn")?.addEventListener("click", () => {
    renderSevenRowEditor({selector:"#abilityOcrPreview",source:"어빌리티",beforeRows:[],afterRows:[],stateKey:"pendingAbilityRows",titleA:"현재 어빌 A",titleB:"변경 어빌 B"});
  });
}

loadLocal();
setupTabs();
setupOfficialGuideUI();
renderStats();
renderChangeSelect();
renderChanges();
renderResults();
renderImages();
renderOcrResults();
setupInputs();
setupActions();
setupAdvancedChangeInputs();
setupAllDropZones();
setupManualEntryActions();
setupReportActions();
renderHomeDashboard();
setupCompanionActions();
loadCompanionDatabase();
setupPwa();
