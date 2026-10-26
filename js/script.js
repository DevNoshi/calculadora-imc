const $ = s => document.querySelector(s);
const fmt = (n, d = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const num = v => parseFloat(String(v).trim().replace(",", "."));

// Faixas da OMS. "max" é o limite superior (exclusivo) de cada categoria.
const CATS = [
  { max: 18.5, nome: "Abaixo do peso", cor: "var(--c1)", dicas: [
    ["Procure avaliação", "Peso baixo pode ter várias causas. Um médico ou nutricionista ajuda a descobrir a sua."],
    ["Coma melhor, não só mais", "Inclua refeições com proteína, grãos integrais, oleaginosas e frutas ao longo do dia."],
    ["Treino de força", "Musculação leve ou exercícios com o próprio peso ajudam a ganhar massa de forma saudável."] ] },
  { max: 25, nome: "Peso normal", cor: "var(--c2)", dicas: [
    ["Mantenha o ritmo", "Seu IMC está na faixa de menor risco. Foque em manter os hábitos que já funcionam."],
    ["Mexa-se toda semana", "A OMS recomenda pelo menos 150 minutos de atividade moderada por semana."],
    ["Durma bem", "Dormir de 7 a 9 horas ajuda no apetite, no humor e na recuperação do corpo."] ] },
  { max: 30, nome: "Sobrepeso", cor: "var(--c3)", dicas: [
    ["Comece pequeno", "Trocas simples, como menos ultraprocessados e mais frutas e verduras, já fazem diferença."],
    ["Caminhe todo dia", "Uma caminhada de 30 minutos é um bom ponto de partida e fácil de manter."],
    ["Meça a cintura", "Gordura abdominal pesa na saúde. Vale acompanhar a cintura além do IMC."] ] },
  { max: 35, nome: "Obesidade grau I", cor: "var(--c4)", dicas: [
    ["Busque acompanhamento", "Médico e nutricionista montam um plano seguro para o seu caso."],
    ["Evite dietas radicais", "Cortes extremos costumam não se sustentar. Mudanças graduais funcionam melhor."],
    ["Metas realistas", "Perder de 5% a 10% do peso já traz benefícios para pressão, glicemia e colesterol."] ] },
  { max: 40, nome: "Obesidade grau II", cor: "var(--c5)", dicas: [
    ["Acompanhamento profissional", "Nesta faixa, o apoio de médico e nutricionista é bastante recomendado."],
    ["Faça check-ups", "Pressão, glicemia e colesterol merecem acompanhamento regular."],
    ["Atividade de baixo impacto", "Caminhada, hidroginástica e bicicleta protegem as articulações."] ] },
  { max: Infinity, nome: "Obesidade grau III", cor: "var(--c6)", dicas: [
    ["Procure um médico", "Esta faixa exige acompanhamento de saúde. Agende uma consulta o quanto antes."],
    ["Cuide do emocional", "Apoio psicológico e de pessoas próximas faz parte do tratamento."],
    ["Um passo de cada vez", "Mudanças pequenas e constantes, com orientação, são mais seguras que atalhos."] ] },
];
const SEG = [3.5, 6.5, 5, 5, 5, 5]; // larguras do medidor (escala 15 a 45)
const catIdx = r => CATS.findIndex(c => r < c.max);

/* ---------- cálculo ---------- */
function ler() {
  let h = num($("#altura").value);
  const p = num($("#peso").value);
  if (h > 3) h /= 100; // aceita centímetros
  const erros = [];
  if (!(h >= 0.5 && h <= 2.5)) erros.push("altura");
  if (!(p >= 10 && p <= 400)) erros.push("peso");
  return { h, p, erros };
}

function mostrar(h, p) {
  const imc = p / (h * h);
  const r = Math.round(imc * 10) / 10;
  const i = catIdx(r), c = CATS[i];
  const min = 18.5 * h * h, max = 24.9 * h * h;
  const pos = Math.min(Math.max((r - 15) / 30, 0), 1) * 100;

  let meta = `<span>Faixa de peso ideal para ${fmt(h, 2)} m: <b>${fmt(min)} a ${fmt(max)} kg</b></span>`;
  if (p < min) meta += `<span>Para chegar ao peso normal: <b>ganhar cerca de ${fmt(min - p)} kg</b></span>`;
  else if (p > max) meta += `<span>Para chegar ao peso normal: <b>perder cerca de ${fmt(p - max)} kg</b></span>`;
  else meta += `<span>Você está dentro da faixa ideal.</span>`;

  $("#resultado").innerHTML = `
    <p class="label">Seu IMC</p>
    <p class="valor">${fmt(r)}</p>
    <p class="cat" style="color:${c.cor}">${c.nome}</p>
    <div class="gauge" role="img" aria-label="IMC ${fmt(r)}, ${c.nome}">
      ${SEG.map((w, k) => `<i style="width:${(w / 30) * 100}%;background:var(--c${k + 1})"></i>`).join("")}
      <span class="pin" style="left:0"></span>
    </div>
    <div class="scale"><span>15</span><span>18,5</span><span>25</span><span>30</span><span>35</span><span>40</span><span>45</span></div>
    <div class="facts">${meta}</div>
    <button class="copy" id="copiar">Copiar resultado</button>`;
  requestAnimationFrame(() => requestAnimationFrame(() => ($(".pin").style.left = pos + "%")));

  $("#copiar").onclick = async e => {
    const txt = `IMC ${fmt(r)} (${c.nome}) | altura ${fmt(h, 2)} m, peso ${fmt(p)} kg | faixa ideal: ${fmt(min)} a ${fmt(max)} kg`;
    try { await navigator.clipboard.writeText(txt); e.target.textContent = "Copiado!"; }
    catch { e.target.textContent = "Não foi possível copiar"; }
    setTimeout(() => (e.target.textContent = "Copiar resultado"), 1800);
  };

  $("#dicas").hidden = false;
  $("#dicas").innerHTML = `<h2>Dicas para a faixa: ${c.nome}</h2>
    <div class="tips">${c.dicas.map(([t, d]) => `<div class="tip"><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
    <p class="aviso">Orientações gerais, não substituem avaliação profissional.</p>`;

  document.querySelectorAll("#tabela tbody tr").forEach((tr, k) => tr.classList.toggle("on", k === i));
  return { r, i };
}

/* ---------- histórico ---------- */
let hist = [];
try { hist = JSON.parse(localStorage.getItem("imc-hist")) || []; } catch { hist = []; }
const salvar = () => { try { localStorage.setItem("imc-hist", JSON.stringify(hist)); } catch {} renderHist(); };

function renderHist() {
  $("#histVazio").hidden = hist.length > 0;
  $("#limparHist").hidden = !hist.length;
  $("#historico").innerHTML = [...hist].reverse().map(e => `
    <li><span>${new Date(e.t).toLocaleDateString("pt-BR")}<small>${fmt(e.p)} kg · ${fmt(e.h, 2)} m</small></span>
      <span class="tag" style="color:${CATS[catIdx(e.r)].cor}">${fmt(e.r)}</span>
      <button data-t="${e.t}" aria-label="Remover registro">✕</button></li>`).join("");

  if (hist.length < 2) return ($("#grafico").innerHTML = "");
  const v = hist.map(e => e.r), lo = Math.min(...v) - 1, hi = Math.max(...v) + 1;
  const pts = v.map((y, k) => `${(k / (v.length - 1)) * 290 + 5},${60 - ((y - lo) / (hi - lo)) * 50 - 5}`);
  $("#grafico").innerHTML = `<svg viewBox="0 0 300 60" preserveAspectRatio="none" role="img" aria-label="Evolução do IMC">
    <polyline points="${pts.join(" ")}" fill="none" stroke="var(--brand)" stroke-width="2" vector-effect="non-scaling-stroke"/>
    ${pts.map(p => `<circle cx="${p.split(",")[0]}" cy="${p.split(",")[1]}" r="2.5" fill="var(--brand)"/>`).join("")}</svg>`;
}

$("#historico").onclick = e => {
  const b = e.target.closest("button");
  if (!b) return;
  hist = hist.filter(x => String(x.t) !== b.dataset.t);
  salvar();
};
$("#limparHist").onclick = () => { if (confirm("Apagar todo o histórico?")) { hist = []; salvar(); } };

/* ---------- formulário ---------- */
$("#imcForm").addEventListener("submit", e => {
  e.preventDefault();
  const { h, p, erros } = ler();
  ["altura", "peso"].forEach(id => $("#" + id).classList.toggle("bad", erros.includes(id)));
  $("#erro").textContent = erros.length
    ? `Confira ${erros.join(" e ")}: altura entre 0,5 e 2,5 m e peso entre 10 e 400 kg.` : "";
  if (erros.length) return;
  const { r } = mostrar(h, p);
  hist.push({ t: Date.now(), h, p, r });
  hist = hist.slice(-20);
  salvar();
});

$("#limpar").onclick = () => {
  $("#imcForm").reset();
  $("#erro").textContent = "";
  $("#resultado").innerHTML = '<p class="vazio">Informe sua altura e seu peso para ver o resultado, a faixa de peso ideal e dicas personalizadas.</p>';
  $("#dicas").hidden = true;
  document.querySelectorAll("#tabela tr").forEach(tr => tr.classList.remove("on"));
};

/* ---------- tema ---------- */
function tema(t, salvarEscolha) {
  document.documentElement.dataset.theme = t;
  $("#toggleMode").textContent = t === "dark" ? "☀️" : "🌙";
  if (salvarEscolha) try { localStorage.setItem("imc-theme", t); } catch {}
}
tema(document.documentElement.dataset.theme || "light");
$("#toggleMode").onclick = () => tema(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);

renderHist();
