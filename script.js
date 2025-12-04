// 初始化年份
document.getElementById("year").textContent = new Date().getFullYear();

// 主题切换（浅/深色）
const root = document.documentElement;
const toggleBtn = document.getElementById("themeToggle");
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

function applyTheme(theme){
  if(theme === "dark"){ root.classList.add("dark"); toggleBtn.textContent = "☀️"; }
  else { root.classList.remove("dark"); toggleBtn.textContent = "🌙"; }
}
applyTheme(localStorage.getItem("theme") || (prefersDark ? "dark" : "light"));
toggleBtn.addEventListener("click", ()=>{
  const next = root.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
});

// 加载项目数据并渲染
const grid = document.getElementById("projectGrid");
const emptyEl = document.getElementById("projectEmpty");
const searchInput = document.getElementById("projectSearch");
const tagFilter = document.getElementById("tagFilter");

let projects = [];
let tags = new Set();

async function loadProjects(){
  try{
    const res = await fetch("projects.json");
    if(!res.ok) throw new Error("无法加载 projects.json");
    projects = await res.json();
    renderTags();
    renderProjects();
  }catch(e){
    console.error(e);
    grid.innerHTML = "";
    emptyEl.classList.remove("hidden");
    emptyEl.textContent = "暂未配置项目数据（缺少 projects.json）";
  }
}

function renderTags(){
  tags = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
  tagFilter.innerHTML = `<option value="">全部标签</option>`;
  Array.from(tags).sort().forEach(t=>{
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t;
    tagFilter.appendChild(opt);
  });
}

function projectCard(p){
  const tagHtml = (p.tags || []).map(t=>`<span class="tag">${t}</span>`).join("");
  const links = [];
  if(p.repo) links.push(`<a href="${p.repo}" target="_blank" rel="noopener">仓库</a>`);
  if(p.demo) links.push(`<a href="${p.demo}" target="_blank" rel="noopener">演示</a>`);
  return `
    <article class="card">
      <h3>${p.name || "未命名项目"}</h3>
      <p class="desc">${p.description || "暂无描述"}</p>
      <div class="meta">${tagHtml}</div>
      <div class="links">${links.join(" ")}</div>
    </article>
  `;
}

function renderProjects(){
  const q = (searchInput.value || "").toLowerCase();
  const tag = tagFilter.value;

  const filtered = projects.filter(p=>{
    const matchText =
      (p.name || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.tags || []).some(t => (t || "").toLowerCase().includes(q));
    const matchTag = !tag || (p.tags || []).includes(tag);
    return matchText && matchTag;
  });

  grid.innerHTML = filtered.map(projectCard).join("");
  emptyEl.classList.toggle("hidden", filtered.length > 0);
  if(filtered.length === 0){
    emptyEl.textContent = "没有匹配的项目";
  }
}

searchInput.addEventListener("input", renderProjects);
tagFilter.addEventListener("change", renderProjects);

loadProjects();