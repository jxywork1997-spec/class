const semesterStart = new Date(2026, 8, 7);
const weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五"];
const shortWeekdays = ["周一", "周二", "周三", "周四", "周五"];

const courses = [
  {
    id: "writing",
    name: "医学论文写作与学术规范",
    className: "五台3班",
    teacher: "马红霞",
    day: 4,
    sections: "第2—5节",
    time: "08:50—12:00",
    start: "08:50",
    end: "12:00",
    location: "2号楼268教室",
    segments: [[7, 7], [10, 12]],
    color: "#087d79"
  },
  {
    id: "marxism",
    name: "中国马克思主义与当代",
    className: "五台3班",
    teacher: "石仿",
    day: 4,
    sections: "第7—10节",
    time: "14:00—17:10",
    start: "14:00",
    end: "17:10",
    location: "2号楼228教室",
    segments: [[7, 7], [10, 16]],
    color: "#cf6f45"
  },
  {
    id: "english",
    name: "博士英语",
    className: "五台7班",
    teacher: "胡存超",
    day: 2,
    sections: "第2—5节",
    time: "08:50—12:00",
    start: "08:50",
    end: "12:00",
    location: "3号楼204教室",
    segments: [[7, 9], [11, 15]],
    color: "#3977b7"
  },
  {
    id: "safety",
    name: "学术规范与实验室安全（博士）",
    className: "五台3班",
    teacher: "陈晓军",
    day: 3,
    sections: "第2—3节",
    time: "08:50—10:20",
    start: "08:50",
    end: "10:20",
    location: "2号楼268教室",
    segments: [[8, 8]],
    color: "#7b62b5"
  },
  {
    id: "clinical",
    name: "临床科研方法学",
    className: "秋季五台1班",
    teacher: "张刚",
    day: 2,
    sections: "第12—15节",
    time: "18:10—21:20",
    start: "18:10",
    end: "21:20",
    location: "2号楼228教室",
    segments: [[12, 15]],
    color: "#b85673"
  },
  {
    id: "animal",
    name: "实验动物学",
    className: "3班（五台）",
    teacher: "李建民",
    day: 1,
    sections: "第7—10节",
    time: "14:00—17:10",
    start: "14:00",
    end: "17:10",
    location: "2号楼228教室",
    segments: [[9, 9], [11, 17]],
    color: "#4d8756"
  },
  {
    id: "pediatrics",
    name: "儿科学进展",
    className: "秋季1班",
    teacher: "黄松明",
    day: 0,
    sections: "第12—13节",
    time: "18:10—19:40",
    start: "18:10",
    end: "19:40",
    location: "学海楼D214教室",
    segments: [[13, 20]],
    color: "#d1932f"
  },
  {
    id: "ai",
    name: "医学大数据与人工智能",
    className: "1班",
    teacher: "李建清",
    day: 3,
    sections: "第12—15节",
    time: "18:10—21:20",
    start: "18:10",
    end: "21:20",
    location: "2号楼228教室",
    segments: [[13, 20]],
    color: "#2d839f"
  }
];

const sectionGroups = [
  { name: "上午", rows: [[1, "08:00—08:40"], [2, "08:50—09:30"], [3, "09:40—10:20"], [4, "10:30—11:10"], [5, "11:20—12:00"], [6, "12:10—12:50"]] },
  { name: "下午", rows: [[7, "14:00—14:40"], [8, "14:50—15:30"], [9, "15:40—16:20"], [10, "16:30—17:10"], [11, "17:20—18:00"], [12, "18:10—18:50"]] },
  { name: "晚上", rows: [[13, "19:00—19:40"], [14, "19:50—20:30"], [15, "20:40—21:20"], [16, "21:30—22:10"]] }
];

const allEvents = courses.flatMap((course) => {
  const events = [];
  for (const [startWeek, endWeek] of course.segments) {
    for (let week = startWeek; week <= endWeek; week += 1) {
      const date = addDays(semesterStart, (week - 1) * 7 + course.day);
      events.push({ ...course, week, date, startDate: withTime(date, course.start), endDate: withTime(date, course.end) });
    }
  }
  return events;
}).sort((a, b) => a.startDate - b.startDate);

const now = new Date();
const rawCurrentWeek = Math.floor((startOfDay(now) - semesterStart) / 86400000 / 7) + 1;
let selectedWeek = rawCurrentWeek >= 1 && rawCurrentWeek <= 20
  ? rawCurrentWeek
  : rawCurrentWeek < 1
    ? allEvents[0].week
    : 20;
let selectedDay = preferredDayForWeek(selectedWeek);

const elements = {
  nextCourse: document.querySelector("#nextCourse"),
  nextLabel: document.querySelector("#nextLabel"),
  weekName: document.querySelector("#weekName"),
  weekRange: document.querySelector("#weekRange"),
  weekStrip: document.querySelector("#weekStrip"),
  mobileDayTabs: document.querySelector("#mobileDayTabs"),
  scheduleGrid: document.querySelector("#scheduleGrid"),
  prevWeek: document.querySelector("#prevWeek"),
  nextWeek: document.querySelector("#nextWeek"),
  weekPicker: document.querySelector("#weekPicker"),
  courseList: document.querySelector("#courseList"),
  timeGroups: document.querySelector("#timeGroups"),
  installButton: document.querySelector("#installButton"),
  installSheet: document.querySelector("#installSheet"),
  installHelp: document.querySelector("#installHelp"),
  confirmInstall: document.querySelector("#confirmInstall"),
  closeInstall: document.querySelector("#closeInstall")
};

function addDays(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function withTime(date, time) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
}

function dateLabel(date, includeWeekday = false) {
  const text = `${date.getMonth() + 1}月${date.getDate()}日`;
  return includeWeekday ? `${text} ${shortWeekdays[(date.getDay() + 6) % 7] || ""}` : text;
}

function rangeLabel(week) {
  const monday = addDays(semesterStart, (week - 1) * 7);
  const sunday = addDays(monday, 6);
  return `${monday.getMonth() + 1}.${String(monday.getDate()).padStart(2, "0")}—${sunday.getMonth() + 1}.${String(sunday.getDate()).padStart(2, "0")}`;
}

function weeksLabel(segments) {
  return segments.map(([start, end]) => start === end ? `第${start}周` : `第${start}—${end}周`).join("、");
}

function preferredDayForWeek(week) {
  const todayIndex = now.getDay() - 1;
  if (week === rawCurrentWeek && todayIndex >= 0 && todayIndex < 5) return todayIndex;
  return allEvents.find((event) => event.week === week)?.day ?? 0;
}

function countdownLabel(target) {
  const diff = target - now;
  if (diff <= 0) return "正在进行";
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  if (days > 0) return `${days}天后`;
  const hours = Math.floor(totalMinutes / 60);
  if (hours > 0) return `${hours}小时后`;
  return `${Math.max(1, totalMinutes)}分钟后`;
}

function renderNextCourse() {
  const active = allEvents.find((event) => event.startDate <= now && event.endDate > now);
  const upcoming = active || allEvents.find((event) => event.startDate > now);
  if (!upcoming) {
    elements.nextLabel.textContent = "本学期已结束";
    elements.nextCourse.innerHTML = `<p class="next-empty">课程已经全部完成。你仍可以在下方查看本学期的完整课表。</p>`;
    return;
  }
  elements.nextLabel.textContent = active ? "正在上课" : "下一节课";
  elements.nextCourse.innerHTML = `
    <div class="next-content">
      <div class="next-course-row">
        <h2 class="next-course-name">${upcoming.name}</h2>
        <span class="countdown">${active ? "进行中" : countdownLabel(upcoming.startDate)}</span>
      </div>
      <div class="next-details">
        <span>◷ ${dateLabel(upcoming.date, true)} · ${upcoming.time}</span>
        <span>⌖ 五台校区 ${upcoming.location}</span>
        <span>第${upcoming.week}周 · ${upcoming.sections}</span>
      </div>
    </div>`;
}

function renderWeekStrip() {
  elements.weekStrip.innerHTML = Array.from({ length: 20 }, (_, index) => {
    const week = index + 1;
    const classes = allEvents.filter((event) => event.week === week).length;
    const classesLabel = classes ? `${classes}节安排` : "无课";
    return `<button class="week-chip ${week === selectedWeek ? "week-chip--active" : ""} ${week === 20 ? "week-chip--warning" : ""}" type="button" role="option" aria-selected="${week === selectedWeek}" data-week="${week}" title="第${week}周，${classesLabel}">${week}${week === 20 ? "*" : ""}</button>`;
  }).join("");
}

function renderMobileDayTabs(monday, weekEvents) {
  elements.mobileDayTabs.innerHTML = weekdays.map((_, dayIndex) => {
    const date = addDays(monday, dayIndex);
    const hasCourse = weekEvents.some((event) => event.day === dayIndex);
    const isToday = startOfDay(date).getTime() === startOfDay(now).getTime();
    const active = dayIndex === selectedDay;
    return `<button class="mobile-day-tab ${active ? "mobile-day-tab--active" : ""} ${hasCourse ? "mobile-day-tab--has-course" : ""} ${isToday ? "mobile-day-tab--today" : ""}" type="button" role="tab" aria-selected="${active}" aria-controls="day-${dayIndex}" data-day="${dayIndex}"><span>${shortWeekdays[dayIndex]}</span><strong>${date.getMonth() + 1}/${date.getDate()}</strong></button>`;
  }).join("");
}

function renderWeek() {
  elements.weekName.textContent = `第${selectedWeek}周${selectedWeek === 20 ? " · 待确认" : ""}`;
  elements.weekRange.textContent = rangeLabel(selectedWeek);
  elements.prevWeek.disabled = selectedWeek === 1;
  elements.nextWeek.disabled = selectedWeek === 20;

  const weekEvents = allEvents.filter((event) => event.week === selectedWeek);
  const monday = addDays(semesterStart, (selectedWeek - 1) * 7);
  renderMobileDayTabs(monday, weekEvents);
  if (!weekEvents.length) {
    elements.scheduleGrid.innerHTML = `<div class="empty-week"><strong>这一周没有安排课程</strong>可以点击周次，快速查看有课的周。</div>`;
    renderWeekStrip();
    return;
  }

  elements.scheduleGrid.innerHTML = weekdays.map((dayName, dayIndex) => {
    const date = addDays(monday, dayIndex);
    const events = weekEvents.filter((event) => event.day === dayIndex);
    const isToday = startOfDay(date).getTime() === startOfDay(now).getTime();
    const body = events.length
      ? events.map((event) => `
        <article class="course-card" style="--course-color:${event.color}">
          <div class="course-time">${event.time}</div>
          <h3>${event.name}</h3>
          <div class="course-meta">
            <span>${event.sections}</span>
            <span>⌖ ${event.location}</span>
            <span>${event.teacher}</span>
          </div>
          ${event.week === 20 ? `<span class="warning-badge">超出校历19周 · 待确认</span>` : ""}
        </article>`).join("")
      : `<div class="day-empty">无课</div>`;
    return `
      <section class="day-column ${dayIndex === selectedDay ? "day-column--active" : ""}" id="day-${dayIndex}" role="tabpanel" aria-label="${dayName} ${dateLabel(date)}">
        <div class="day-header">
          <strong>${dayName}</strong>
          <span class="day-date">${date.getMonth() + 1}/${date.getDate()}</span>
          ${isToday ? `<span class="day-today">今天</span>` : ""}
        </div>
        ${body}
      </section>`;
  }).join("");
  renderWeekStrip();
}

function renderCourses() {
  elements.courseList.innerHTML = courses.map((course) => `
    <article class="course-overview" style="--course-color:${course.color}">
      <div class="course-overview__bar" aria-hidden="true"></div>
      <div class="course-overview__body">
        <h3>${course.name}</h3>
        <div class="overview-tags">
          <span>${shortWeekdays[course.day]} ${course.time}</span>
          <span>${course.sections}</span>
          <span>${weeksLabel(course.segments)}</span>
          <span>${course.teacher}</span>
        </div>
        <p class="overview-location">五台校区 · ${course.location} · ${course.className}</p>
        ${course.segments.some(([, end]) => end === 20) ? `<span class="warning-badge">第20周待确认</span>` : ""}
      </div>
    </article>`).join("");
}

function renderTimes() {
  elements.timeGroups.innerHTML = sectionGroups.map((group) => `
    <section class="time-group">
      <h3>${group.name}</h3>
      ${group.rows.map(([section, time]) => `<div class="time-row"><span>第${section}节</span><strong>${time}</strong></div>`).join("")}
    </section>`).join("");
}

function switchView(target) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("view--active", view.dataset.view === target));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("nav-item--active", item.dataset.target === target));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

elements.prevWeek.addEventListener("click", () => {
  selectedWeek = Math.max(1, selectedWeek - 1);
  selectedDay = preferredDayForWeek(selectedWeek);
  renderWeek();
});

elements.nextWeek.addEventListener("click", () => {
  selectedWeek = Math.min(20, selectedWeek + 1);
  selectedDay = preferredDayForWeek(selectedWeek);
  renderWeek();
});

elements.weekPicker.addEventListener("click", () => {
  elements.weekStrip.classList.toggle("week-strip--open");
});

elements.weekStrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-week]");
  if (!button) return;
  selectedWeek = Number(button.dataset.week);
  selectedDay = preferredDayForWeek(selectedWeek);
  elements.weekStrip.classList.remove("week-strip--open");
  renderWeek();
});

elements.mobileDayTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-day]");
  if (!button) return;
  selectedDay = Number(button.dataset.day);
  renderWeek();
});

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => switchView(item.dataset.target));
});

let installPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  elements.installHelp.textContent = "已准备好安装。添加后会出现在手机桌面，并支持离线打开。";
});

elements.installButton.addEventListener("click", () => {
  elements.installSheet.hidden = false;
});

elements.closeInstall.addEventListener("click", () => {
  elements.installSheet.hidden = true;
});

elements.installSheet.addEventListener("click", (event) => {
  if (event.target === elements.installSheet) elements.installSheet.hidden = true;
});

elements.confirmInstall.addEventListener("click", async () => {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    elements.installSheet.hidden = true;
  } else {
    elements.installHelp.textContent = "请点击浏览器右上角菜单，选择“添加到主屏幕”或“安装应用”。建议使用 Chrome、Edge 或安卓系统浏览器。";
    elements.confirmInstall.textContent = "知道了";
    elements.confirmInstall.addEventListener("click", () => { elements.installSheet.hidden = true; }, { once: true });
  }
});

window.addEventListener("appinstalled", () => {
  elements.installButton.hidden = true;
  elements.installSheet.hidden = true;
});

if (window.matchMedia("(display-mode: standalone)").matches) {
  elements.installButton.hidden = true;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

renderNextCourse();
renderWeek();
renderCourses();
renderTimes();
