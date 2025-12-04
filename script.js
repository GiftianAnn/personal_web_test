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

/* ========== 点云演示 ========== */
(function initPointCloud(){
  const canvas = document.getElementById("pointCloudCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");

  // 根据容器宽度自适应大小
  function resize(){
    const rect = canvas.getBoundingClientRect();
    // 保持 16:9 高宽比
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.width * 9 / 16);
    canvas.width = width;
    canvas.height = height;
  }
  resize();
  window.addEventListener("resize", resize);

  // 生成立方体内的随机点
  const pointCount = 2000;
  const points = [];
  const size = 1.0; // 立方体边长（标准化坐标）
  for(let i=0;i<pointCount;i++){
    points.push({
      x: (Math.random()-0.5)*size,
      y: (Math.random()-0.5)*size,
      z: (Math.random()-0.5)*size
    });
  }

  let running = true;
  let angleY = 0;
  const toggleBtn = document.getElementById("pcToggle");
  const speedInput = document.getElementById("pcSpeed");
  let speed = parseFloat(speedInput?.value || "0.15"); // 每秒弧度

  toggleBtn?.addEventListener("click", ()=>{
    running = !running;
    toggleBtn.textContent = running ? "暂停" : "继续";
  });
  speedInput?.addEventListener("input", ()=>{
    speed = parseFloat(speedInput.value);
  });

  function getPointColor(){
    // 根据主题选择颜色
    const dark = document.documentElement.classList.contains("dark");
    return dark ? getComputedStyle(document.documentElement).getPropertyValue("--pc-point").trim() : getComputedStyle(document.documentElement).getPropertyValue("--pc-point").trim();
  }

  function render(dt){
    // 清屏
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const color = getPointColor();
    ctx.fillStyle = color;

    // 视图参数
    const fov = 800; // 透视投影焦距
    const scale = Math.min(canvas.width, canvas.height) * 0.4; // 场景缩放
    const cx = canvas.width/2;
    const cy = canvas.height/2;

    // 累积旋转
    if(running){
      angleY += (speed * dt);
    }

    // 绘制点
    for(const p of points){
      // 绕 Y 轴旋转
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const xr = p.x * cosY + p.z * sinY;
      const yr = p.y;
      const zr = -p.x * sinY + p.z * cosY;

      // 简易透视投影
      const perspective = fov / (fov + zr*scale);
      const x2d = xr * scale * perspective + cx;
      const y2d = yr * scale * perspective + cy;

      // 近远大小变化
      const r = Math.max(0.5, 2.2 * perspective); // 点半径
      ctx.beginPath();
      ctx.arc(x2d, y2d, r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  let lastTs = performance.now();
  function loop(ts){
    const dt = Math.min(0.05, (ts - lastTs)/1000); // 秒，限制最大步长
    lastTs = ts;
    render(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
