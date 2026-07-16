const dayNames = { Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday" };
const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const selected = new Set();
let courseMeta = {};
let rows = [];
let courses = [];

function toSession(r) {
  const [course, section, type, classNo, daysTimes, room, instructor, dates] = r;
  const meta = courseMeta[course];
  const time = daysTimes.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  const dayPart = daysTimes.replace(/\s*\d{2}:\d{2}.*/, "");
  const days = [...dayPart.matchAll(/Mo|Tu|We|Th|Fr/g)].map(m => dayNames[m[0]]);
  return {
    id: `${course}-${section}-${classNo}`,
    course, section, type, classNo, daysTimes, room, instructor, dates,
    zh: meta.zh, en: meta.en, area: meta.area, color: meta.color,
    days, start: toMinutes(time[1]), end: toMinutes(time[2])
  };
}
function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function timeLabel(start, end) {
  const f = n => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  return `${f(start)}-${f(end)}`;
}
function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}
function shortSection(section) {
  return section.replace("-LEC", "").replace("-TUT", "");
}

function renderCourseList() {
  const root = document.getElementById("courseList");
  const byArea = groupBy(Object.keys(courseMeta), c => courseMeta[c].area);
  const areaOrder = [
    "必修 / 通识与英文",
    "Area 1 Mathematical Foundation",
    "Area 2 Statistical Methodology",
    "Area 3 Computing & Machine Learning",
    "Area 4 Financial Statistics",
    "Complementary / ML & DL",
    "Complementary Electives",
    "Not in STAT Scheme / Verify Credit"
  ];
  root.innerHTML = "";
  const orderedAreas = areaOrder.filter(area => byArea[area])
    .concat(Object.keys(byArea).filter(area => !areaOrder.includes(area)).sort());
  for (const area of orderedAreas) {
    const courseCodes = byArea[area];
    const group = document.createElement("section");
    group.className = "index-group";
    group.innerHTML = `<h3>${area}</h3>`;
    courseCodes.forEach(code => group.appendChild(courseCard(code)));
    root.appendChild(group);
  }
}
function courseCard(code) {
  const meta = courseMeta[code];
  const details = document.createElement("details");
  details.className = `course-card ${meta.color}`;
  const sessions = courses.filter(s => s.course === code);
  details.innerHTML = `<summary><span class="course-title"><span class="course-code">${code}</span><span class="course-name">${meta.zh} / ${meta.en}</span></span></summary>`;
  ["Lecture", "Tutorial"].forEach(kind => {
    const items = sessions.filter(s => s.type === kind);
    if (!items.length) return;
    const title = document.createElement("div");
    title.className = "section-kind";
    title.textContent = kind === "Lecture" ? "LEC" : "TUT";
    details.appendChild(title);
    items.forEach(s => {
      const label = document.createElement("label");
      label.className = "session-option";
      label.innerHTML = `
        <input type="checkbox" value="${s.id}">
        <span>
          <span class="session-title">${shortSection(s.section)} (${s.classNo})</span>
          <span class="session-meta">${s.daysTimes} · ${s.room} · ${s.instructor}</span>
        </span>`;
      label.querySelector("input").addEventListener("change", e => {
        e.target.checked ? selected.add(s.id) : selected.delete(s.id);
        renderSchedule();
      });
      details.appendChild(label);
    });
  });
  return details;
}

function renderSchedule() {
  const active = courses.filter(s => selected.has(s.id));
  const table = document.getElementById("schedule");
  const empty = document.getElementById("empty");
  const body = document.getElementById("scheduleBody");
  table.hidden = active.length === 0;
  empty.hidden = active.length !== 0;
  body.innerHTML = "";
  if (!active.length) {
    renderSummary(active, []);
    return;
  }

  const conflictIds = new Set();
  const conflictPairs = [];
  for (const day of dayOrder) {
    const daySessions = active.filter(s => s.days.includes(day));
    for (let i = 0; i < daySessions.length; i++) {
      for (let j = i + 1; j < daySessions.length; j++) {
        if (overlaps(daySessions[i], daySessions[j])) {
          conflictIds.add(daySessions[i].id);
          conflictIds.add(daySessions[j].id);
          conflictPairs.push(`${day}: ${daySessions[i].course} ${shortSection(daySessions[i].section)} ↔ ${daySessions[j].course} ${shortSection(daySessions[j].section)}`);
        }
      }
    }
  }

  const intervals = [...new Set(active.map(s => `${s.start}-${s.end}`))]
    .map(x => x.split("-").map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  for (const [start, end] of intervals) {
    const tr = document.createElement("tr");
    if (start >= 18 * 60) tr.className = "tutorial-zone";
    const note = start >= 19 * 60 ? '<span class="zone-note">TUT zone</span>' : "";
    tr.innerHTML = `<td class="time">${timeLabel(start, end)}${note}</td>`;
    for (const day of dayOrder) {
      const td = document.createElement("td");
      active
        .filter(s => s.days.includes(day) && s.start === start && s.end === end)
        .sort((a, b) => a.course.localeCompare(b.course) || a.section.localeCompare(b.section))
        .forEach(s => td.appendChild(sessionBlock(s, conflictIds.has(s.id))));
      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
  renderSummary(active, conflictPairs);
}
function sessionBlock(s, conflict) {
  const div = document.createElement("div");
  div.className = `block ${s.color === "eng" ? "eng" : s.color === "gea" ? "gea" : ""} ${s.type === "Tutorial" ? "tut" : ""} ${conflict ? "conflict" : ""}`.trim();
  div.innerHTML = `
    <strong>${s.course} ${shortSection(s.section)} · ${s.zh}</strong>
    <span class="meta">${s.en}<br>${s.daysTimes} · ${s.room}<br>${s.instructor}</span>`;
  return div;
}
function renderSummary(active, conflicts) {
  const selectedSummary = document.getElementById("selectedSummary");
  const conflictSummary = document.getElementById("conflictSummary");
  selectedSummary.innerHTML = active.length
    ? active.map(s => `<div class="selected-row"><b>${s.course} ${shortSection(s.section)}</b> · ${s.zh}<br>${s.daysTimes} · ${s.room}</div>`).join("")
    : "暂无勾选。";
  conflictSummary.innerHTML = conflicts.length
    ? `<div style="margin-top:8px;">冲突：<br>${[...new Set(conflicts)].map(c => `- ${c}`).join("<br>")}</div>`
    : active.length ? '<div style="margin-top:8px;color:#166534;">当前无时间冲突。</div>' : "";
}
function groupBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
}

document.getElementById("clearAll").addEventListener("click", () => {
  selected.clear();
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  renderSchedule();
});
document.getElementById("selectAll").addEventListener("click", () => {
  selected.clear();
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = true;
    selected.add(cb.value);
  });
  renderSchedule();
});
document.getElementById("openAll").addEventListener("click", () => {
  document.querySelectorAll("details.course-card").forEach(d => d.open = true);
});
document.getElementById("closeAll").addEventListener("click", () => {
  document.querySelectorAll("details.course-card").forEach(d => d.open = false);
});

async function init() {
  try {
    const response = await fetch("courses.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load courses.json: ${response.status}`);
    const data = await response.json();
    courseMeta = data.courseMeta;
    rows = data.rows;
    courses = rows.map(toSession);
    const stamp = document.getElementById("lastUpdated");
    if (stamp) stamp.textContent = data.lastUpdated ? `Data updated: ${data.lastUpdated}` : "Data loaded";
    renderCourseList();
    renderSchedule();
  } catch (error) {
    const root = document.getElementById("courseList");
    root.innerHTML = `<div class="empty-state">无法加载 courses.json。上线后可正常使用；如果本地预览，请用一个本地服务器打开 index.html。</div>`;
    console.error(error);
  }
}

init();
