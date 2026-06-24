// ============================================================
//  firebase.js — TaskFlow To-Do App con Firebase Firestore
// ============================================================
//
//  ⚙️  CONFIGURACIÓN:
//  Reemplazá el objeto firebaseConfig con el de TU proyecto
//  en Firebase Console → Configuración del proyecto → SDK
//
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDocs,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── 🔧 TU CONFIGURACIÓN DE FIREBASE ─────────────────────
// Reemplazá estos valores con los de tu proyecto en:
// Firebase Console → Configuración del proyecto → General → Tus apps → SDK de Firebase
const firebaseConfig = {
  apiKey:            "AIzaSyB1gTXuzMLspbIlNtBFth3SP-5LztGWaLU",
  authDomain:        "rodrigo1808-dev.firebaseapp.com",
  projectId:         "rodrigo1808-dev",
  storageBucket:     "rodrigo1808-dev.firebasestorage.app",
  messagingSenderId: "155800818206",
  appId:             "1:155800818206:web:4c57eea562bcf936b4140f",
};
// ──────────────────────────────────────────────────────────

// ─── INIT FIREBASE ───────────────────────────────────────
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  setStatus("error", "Error al inicializar Firebase");
}

// ─── REFERENCIAS DOM ──────────────────────────────────────
const addForm        = document.getElementById("addForm");
const taskInput      = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const tasksList      = document.getElementById("tasksList");
const emptyState     = document.getElementById("emptyState");
const loadingState   = document.getElementById("loadingState");
const clearDoneBtn   = document.getElementById("clearDone");
const toast          = document.getElementById("toast");
const statTotal      = document.getElementById("statTotal");
const statPending    = document.getElementById("statPending");

// ─── ESTADO ───────────────────────────────────────────────
let currentFilter = "todas";
let allTasks      = [];

// ─── FIREBASE STATUS ─────────────────────────────────────
function setStatus(state, text) {
  const dot  = document.getElementById("statusDot");
  const span = document.getElementById("statusText");
  dot.className  = "status-dot " + (state === "ok" ? "connected" : state === "error" ? "error" : "");
  span.textContent = text;
}

// ─── COLECCIÓN FIRESTORE ──────────────────────────────────
const tasksRef = collection(db, "tasks");
const tasksQuery = query(tasksRef, orderBy("createdAt", "desc"));

// ─── ESCUCHAR CAMBIOS EN TIEMPO REAL ─────────────────────
onSnapshot(
  tasksQuery,
  (snapshot) => {
    allTasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setStatus("ok", "Conectado a Firebase · tiempo real");
    loadingState.hidden = true;
    renderTasks();
    updateStats();
  },
  (error) => {
    setStatus("error", "Sin conexión a Firebase");
    loadingState.hidden = true;
    console.error(error);
  }
);

// ─── AGREGAR TAREA ────────────────────────────────────────
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }
  try {
    await addDoc(tasksRef, {
      text,
      priority:  prioritySelect.value,
      completed: false,
      createdAt: serverTimestamp(),
    });
    taskInput.value = "";
    prioritySelect.value = "normal";
    taskInput.focus();
    showToast("✅ Tarea agregada");
  } catch (err) {
    showToast("❌ Error al agregar la tarea");
    console.error(err);
  }
});

// ─── COMPLETAR / DESCOMPLETAR ─────────────────────────────
async function toggleTask(id, completed) {
  try {
    await updateDoc(doc(db, "tasks", id), { completed: !completed });
  } catch (err) {
    showToast("❌ Error al actualizar");
  }
}

// ─── ELIMINAR TAREA ───────────────────────────────────────
async function deleteTask(id) {
  try {
    await deleteDoc(doc(db, "tasks", id));
    showToast("🗑️ Tarea eliminada");
  } catch (err) {
    showToast("❌ Error al eliminar");
  }
}

// ─── LIMPIAR COMPLETADAS ──────────────────────────────────
clearDoneBtn.addEventListener("click", async () => {
  const done = allTasks.filter((t) => t.completed);
  if (!done.length) { showToast("No hay tareas completadas"); return; }
  const batch = writeBatch(db);
  done.forEach((t) => batch.delete(doc(db, "tasks", t.id)));
  await batch.commit();
  showToast(`🗑️ ${done.length} tarea${done.length > 1 ? "s" : ""} eliminada${done.length > 1 ? "s" : ""}`);
});

// ─── FILTROS ─────────────────────────────────────────────
document.getElementById("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  renderTasks();
});

// ─── RENDER ──────────────────────────────────────────────
function renderTasks() {
  let filtered = allTasks;
  if (currentFilter === "pendientes")   filtered = allTasks.filter((t) => !t.completed);
  if (currentFilter === "completadas")  filtered = allTasks.filter((t) => t.completed);

  tasksList.innerHTML = "";

  if (!filtered.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  filtered.forEach((task) => {
    const item = document.createElement("div");
    item.className = `task-item${task.completed ? " completed" : ""}`;
    item.innerHTML = `
      <div class="task-checkbox${task.completed ? " checked" : ""}"
           data-id="${task.id}" data-completed="${task.completed}"
           role="checkbox" aria-checked="${task.completed}" tabindex="0"></div>
      <div class="task-content">
        <p class="task-text">${escapeHtml(task.text)}</p>
        <div class="task-meta">
          <span class="priority-badge priority-${task.priority}">${task.priority}</span>
          <span class="task-date">${formatDate(task.createdAt)}</span>
        </div>
      </div>
      <button class="task-delete" data-id="${task.id}" aria-label="Eliminar tarea">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    `;

    // Eventos
    item.querySelector(".task-checkbox").addEventListener("click", (e) => {
      toggleTask(e.currentTarget.dataset.id, task.completed);
    });
    item.querySelector(".task-delete").addEventListener("click", (e) => {
      deleteTask(e.currentTarget.dataset.id);
    });

    tasksList.appendChild(item);
  });
}

// ─── STATS ───────────────────────────────────────────────
function updateStats() {
  const total   = allTasks.length;
  const pending = allTasks.filter((t) => !t.completed).length;
  statTotal.textContent   = `${total} tarea${total !== 1 ? "s" : ""}`;
  statPending.textContent = `${pending} pendiente${pending !== 1 ? "s" : ""}`;
}

// ─── TOAST ───────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ─── HELPERS ─────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-AR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
}
