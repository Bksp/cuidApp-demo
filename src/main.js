

import './style.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ThemeManager } from './utils/theme-manager.js';

ThemeManager.init();

// Fallback implementation of window.showGlassAlert to replace the deleted GlassKit alert component
window.showGlassAlert = function (message, type = 'success') {
  const alertContainer = document.getElementById('glass-alerts-container') || (() => {
    const container = document.createElement('div');
    container.id = 'glass-alerts-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.maxWidth = '350px';
    container.style.width = 'calc(100% - 40px)';
    document.body.appendChild(container);
    return container;
  })();

  const alert = document.createElement('div');
  alert.style.background = 'rgba(255, 255, 255, 0.08)';
  alert.style.backdropFilter = 'blur(12px)';
  alert.style.webkitBackdropFilter = 'blur(12px)';

  let iconClass = 'bi-info-circle';
  let borderColor = 'rgba(255, 255, 255, 0.2)';

  if (type === 'success') {
    borderColor = 'rgba(16, 185, 129, 0.4)';
    iconClass = 'bi-check-circle-fill text-success';
  } else if (type === 'danger' || type === 'error') {
    borderColor = 'rgba(239, 68, 68, 0.4)';
    iconClass = 'bi-exclamation-triangle-fill text-danger';
  } else if (type === 'warning') {
    borderColor = 'rgba(245, 158, 11, 0.4)';
    iconClass = 'bi-exclamation-circle-fill text-warning';
  } else if (type === 'info') {
    borderColor = 'rgba(6, 182, 212, 0.4)';
    iconClass = 'bi-info-circle-fill text-info';
  }

  alert.style.border = `1px solid ${borderColor}`;
  alert.style.borderRadius = '12px';
  alert.style.padding = '14px 18px';
  alert.style.color = '#fff';
  alert.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
  alert.style.display = 'flex';
  alert.style.alignItems = 'center';
  alert.style.gap = '12px';
  alert.style.transform = 'translateX(100%)';
  alert.style.opacity = '0';
  alert.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  alert.innerHTML = `
    <i class="bi ${iconClass} fs-4"></i>
    <div style="flex-grow: 1; font-size: 0.9rem; font-weight: 500; line-height: 1.3;">${message}</div>
  `;

  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.style.transform = 'translateX(0)';
    alert.style.opacity = '1';
  }, 50);

  setTimeout(() => {
    alert.style.transform = 'translateX(120%)';
    alert.style.opacity = '0';
    setTimeout(() => {
      alert.remove();
    }, 400);
  }, 3000);
};

class Condition {
  constructor(key, name, description) {
    this.key = key; // 'HYPERTENSION', 'DIABETES', 'EPOC', 'ERC', 'GENERAL'
    this.name = name;
    this.description = description;
  }
}

class Patient {
  constructor(id, name, age, gender, weight, stature, bloodType, conditions, allergies, emergencyContact, fileNumber, username, password) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.gender = gender; // 'Masculino' o 'Femenino'
    this.weight = weight; // Peso base en kg
    this.stature = stature; // Estatura en cm
    this.bloodType = bloodType; // Tipo de sangre (ej. 'O+')
    this.conditions = conditions; // Array de keys de condiciones
    this.allergies = allergies; // Alergias conocidas
    this.emergencyContact = emergencyContact; // { name, relation, phone }
    this.fileNumber = fileNumber; // RUT/DNI o Identificador
    this.username = username || '';
    this.password = password || '';
  }

  hasCondition(conditionKey) {
    return this.conditions.includes(conditionKey);
  }
}

class Caregiver {
  constructor(id, name, email, assignedPatientId, username, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.assignedPatientId = assignedPatientId; // Link a patient.id
    this.username = username;
    this.password = password;
  }
}

// Catálogo de Condiciones Clínicas
const CLINICAL_CONDITIONS = {
  HYPERTENSION: new Condition('HYPERTENSION', 'Hipertensión Arterial', 'Monitoreo de presión, pulso, edemas y síntomas cardiovasculares.'),
  DIABETES: new Condition('DIABETES', 'Diabetes Mellitus', 'Control glucémico capilar por momentos, insulina y pie diabético.'),
  EPOC: new Condition('EPOC', 'EPOC o Asma', 'Evaluación de saturación SpO2, disnea de mMRC y secreciones.'),
  ERC: new Condition('ERC', 'Enfermedad Renal Crónica', 'Control riguroso de peso diario, diuresis y presión arterial.'),
  GENERAL: new Condition('GENERAL', 'Monitoreo de Bienestar', 'Control transversal de adherencia de medicamentos y dolor.')
};

// Base de datos en memoria (Pacientes y Cuidadores)
let PATIENTS_DATABASE = [
  new Patient('p1', 'Juan Díaz', 76, 'Masculino', 74, 168, 'A+', ['HYPERTENSION'], 'Penicilina', { name: 'Sofía Díaz', relation: 'Hija', phone: '+56912345678' }, '10.420.932-K', 'juan', 'juan123'),
  new Patient('p2', 'María Rodríguez', 68, 'Femenino', 65, 156, 'O+', ['DIABETES'], 'Ninguna', { name: 'Marcos Rodríguez', relation: 'Hijo', phone: '+56923456789' }, '12.194.883-2', 'maria', 'maria123'),
  new Patient('p3', 'Carlos Mendoza', 82, 'Masculino', 80, 172, 'B-', ['HYPERTENSION', 'DIABETES'], 'Lactosa', { name: 'Laura Mendoza', relation: 'Esposa', phone: '+56934567890' }, '9.183.224-8', 'carlos', 'carlos123'),
  new Patient('p4', 'Ana Gómez', 59, 'Femenino', 70, 160, 'A-', ['EPOC'], 'Polvo, Sulfa', { name: 'Pedro Gómez', relation: 'Hermano', phone: '+56945678901' }, '15.024.118-5', 'ana', 'ana123'),
  new Patient('p5', 'Luis Martínez', 71, 'Masculino', 85, 175, 'O-', ['ERC', 'HYPERTENSION'], 'Ninguna', { name: 'Clara Martínez', relation: 'Hija', phone: '+56956789012' }, '11.109.845-6', 'luis', 'luis123'),
  new Patient('p6', 'Elena Vázquez', 65, 'Femenino', 68, 162, 'AB+', ['EPOC', 'ERC'], 'Dipirona', { name: 'Miguel Vázquez', relation: 'Hijo', phone: '+56967890123' }, '13.281.402-K', 'elena', 'elena123'),
  new Patient('p7', 'Roberto Castro', 79, 'Masculino', 78, 170, 'O+', ['HYPERTENSION', 'DIABETES', 'EPOC', 'ERC'], 'Ninguna', { name: 'Sandra Castro', relation: 'Hija', phone: '+56978901234' }, '8.032.554-1', 'roberto', 'roberto123')
];

let CAREGIVERS_DATABASE = [
  new Caregiver('c1', 'Sofía Díaz', 'sofia@cuidapp.com', 'p1', 'sofia', 'sofia123'),
  new Caregiver('c2', 'Marcos Rodríguez', 'marcos@cuidapp.com', 'p2', 'marcos', 'marcos123'),
  new Caregiver('c3', 'Laura Mendoza', 'laura@cuidapp.com', 'p3', 'laura', 'laura123')
];

// Estado global de la aplicación
let currentUser = 'admin';
let currentView = 'evaluation'; // 'evaluation' o 'management'
let activePatient = PATIENTS_DATABASE[0];
let managementSubTab = 'patients'; // 'patients' o 'caregivers'
let editingItem = null; // Item que se edita en CRUD

// --- UTILERÍAS ---
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- RENDERIZADO DE PANTALLAS ---

function renderLogin() {
  document.querySelector('#app').innerHTML = `
    <div id="ambient-orb"></div>
    <section id="login-section" class="content-section position-relative overflow-hidden" style="padding: 0; min-height: 100vh;">
        <div class="zorin-login-container d-flex flex-column align-items-center justify-content-between py-4" style="min-height: 100vh;">
            <div class="w-100 d-flex flex-column align-items-center gap-1">
                <div class="zorin-top-bar d-flex justify-content-center w-100 pt-3">
                    <div id="zorinClock" class="fw-medium text-white text-opacity-80">-- -- --:--</div>
                </div>
                <div class="zorin-credentials-widget p-3 glass-card">
                    <h6 class="fw-bold mb-2 text-white"><i class="bi bi-info-circle text-primary me-2"></i>Credenciales Demo</h6>
                    <div class="mb-1"><span class="small text-white text-opacity-50">Admin:</span> <code class="text-primary">admin</code> / <code class="text-primary">admin123</code></div>
                    <div class="mb-1"><span class="small text-white text-opacity-50">Cuidador:</span> <code class="text-primary">sofia</code> / <code class="text-primary">sofia123</code></div>
                    <div><span class="small text-white text-opacity-50">Paciente:</span> <code class="text-primary">juan</code> / <code class="text-primary">juan123</code></div>
                </div>
            </div>
            <div class="zorin-center-login d-flex flex-column align-items-center gap-3">
                <div class="zorin-avatar shadow-lg d-flex justify-content-center align-items-center" style="width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); overflow: hidden;">
                    <i id="zorinAvatarIcon" class="bi bi-person text-white text-opacity-40" style="font-size: 2.5rem;"></i>
                </div>
                <div id="zorinGreeting" class="zorin-username text-white text-center m-0 fw-medium" style="font-size: 1.15rem;">¿Hola?</div>
                <div id="loginStepUsername" class="w-100 text-center">
                    <form id="formUsername" class="zorin-input-wrapper mt-1 px-4 d-flex align-items-center justify-content-center gap-2">
                        <div class="zorin-spacer" style="width: 32px; height: 32px;"></div>
                        <div class="zorin-input-container position-relative flex-grow-1" style="max-width: 200px;">
                            <input type="text" id="zorinUsername" class="zorin-input text-center rounded-pill py-1 text-white border-white border-opacity-25" placeholder="Usuario" autocomplete="username" required style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.25); outline: none;">
                        </div>
                        <button type="submit" class="zorin-forward-btn btn-glass-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #fff;"><i class="bi bi-arrow-right-short fs-4"></i></button>
                    </form>
                </div>
                <div id="loginStepPassword" class="w-100 text-center d-none">
                    <form id="formPassword" class="zorin-input-wrapper mt-1 px-4 d-flex align-items-center justify-content-center gap-2">
                        <button type="button" id="btnBackToUser" class="zorin-back-btn btn-glass-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #fff;"><i class="bi bi-arrow-left-short fs-4"></i></button>
                        <div class="zorin-input-container position-relative flex-grow-1" style="max-width: 200px; display: flex; align-items: center;">
                            <input type="password" id="zorinPassword" class="zorin-input rounded-pill py-1 text-center w-100 text-white border-white border-opacity-25" placeholder="Contraseña" autocomplete="current-password" required style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.25); outline: none; padding-right: 30px;">
                            <span id="togglePasswordVisibility" class="zorin-toggle-password position-absolute" style="right: 12px; cursor: pointer; color: rgba(255,255,255,0.6);"><i id="passwordEyeIcon" class="bi bi-eye"></i></span>
                        </div>
                        <button type="submit" class="zorin-forward-btn btn-glass-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #fff;"><i class="bi bi-arrow-right-short fs-4"></i></button>
                    </form>
                </div>
            </div>
            <div class="zorin-bottom-bar w-100 d-flex justify-content-center align-items-center position-relative pb-4 gap-2">
                <i class="bi bi-heart-pulse-fill text-white fs-4 me-1"></i>
                <div class="zorin-logo fw-bold" style="font-family: 'Outfit', sans-serif; letter-spacing: 4px; font-size: 1.2rem; color: rgba(255,255,255,0.85); margin-top: 2px;">CUIDAPP</div>
                <i id="settingsBtn" class="bi bi-gear zorin-settings-btn position-absolute" style="right: 40px; cursor: pointer; font-size: 1.15rem; color: rgba(255,255,255,0.6);"></i>
            </div>
        </div>
    </section>
  `;
  bindLoginEvents();
}

function renderDashboard(user) {
  document.querySelector('#app').innerHTML = `
    <div id="ambient-orb"></div>
    <div class="d-flex" style="min-height: 100vh;">
      
      <!-- Sidebar de GlassKit -->
      <nav class="sidebar d-flex flex-column" id="sidebarMenu" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border-right: 1px solid rgba(255, 255, 255, 0.08); z-index: 1000;">
        <header class="d-flex justify-content-between align-items-center p-3 border-bottom border-light border-opacity-25" style="height: 70px;" id="sidebarHeader">
          <div class="sidebar-logo-container d-flex align-items-center">
            <i class="bi bi-heart-pulse-fill text-white fs-4 me-2" id="sidebarLogoIcon"></i>
            <div class="sidebar-logo-text">
              <h4 class="fw-bold m-0 text-white" style="font-size: 1.2rem; letter-spacing: 1px;">cuidApp</h4>
            </div>
          </div>
          <button id="sidebarToggleBtn" class="nav-toggle-btn toggle-sidebar-btn d-none d-lg-flex" aria-label="Toggle Sidebar" type="button">
            <div class="hamburger-lines">
              <span class="line line1"></span>
              <span class="line line2"></span>
              <span class="line line3"></span>
            </div>
          </button>
        </header>

        <div class="pt-3 flex-grow-1">
          <div class="px-3 d-flex flex-column gap-1">
            ${currentUser.startsWith('patient_') ? `
            <a href="#" class="nav-link active" id="linkPatientView">
              <i class="bi bi-person-badge-fill me-3"></i> <span>Mi Estado de Salud</span>
            </a>
            ` : `
            <a href="#" class="nav-link ${currentView === 'evaluation' ? 'active' : ''}" id="linkEvaluation">
              <i class="bi bi-pencil-square me-3"></i> <span>Evaluación Diaria</span>
            </a>
            ${user === 'admin' ? `
            <a href="#" class="nav-link ${currentView === 'management' ? 'active' : ''}" id="linkManagement">
              <i class="bi bi-people-fill me-3"></i> <span>Gestión de Perfiles</span>
            </a>
            ` : ''}
            `}
          </div>
        </div>

        <div class="mt-auto my-3 border-top border-light border-opacity-25"></div>
        <footer class="mb-4 text-center px-3 pt-2">
          <small class="text-white text-opacity-50 d-block mb-3 sidebar-text-full">
            Usuario: <strong class="text-white">${user}</strong>
          </small>
          <button id="btnLogout" class="btn-glass-danger btn-sm w-100 py-2 border-0 d-flex align-items-center justify-content-center" style="cursor: pointer; border-radius: 12px;">
            <i class="bi bi-box-arrow-left"></i><span class="sidebar-text-full ms-2">Cerrar Sesión</span>
          </button>
        </footer>
      </nav>

      <!-- Área de Contenido Principal -->
      <main class="main-content flex-grow-1 w-100" style="min-height: 100vh;">
        <!-- Top Navbar (Visible solo en Móviles) -->
        <nav id="main-navbar" class="glass-nav mb-4 p-3 px-4 d-flex justify-content-between align-items-center d-lg-none" role="banner">
          <div class="nav-brand d-flex align-items-center gap-2">
            <i class="bi bi-heart-pulse-fill text-white fs-5"></i>
            <span class="fw-bold text-white fs-6" style="letter-spacing: 1px;">cuidApp</span>
          </div>
          <button class="nav-toggle-btn toggle-sidebar-btn" aria-label="Toggle Sidebar" id="mobileSidebarToggle" type="button">
            <div class="hamburger-lines">
              <span class="line line1"></span>
              <span class="line line2"></span>
              <span class="line line3"></span>
            </div>
          </button>
        </nav>
        <div id="dashboard-content-area"></div>
      </main>
    </div>
  `;

  // Registrar listeners del Sidebar
  const linkEvaluation = document.getElementById('linkEvaluation');
  if (linkEvaluation) {
    linkEvaluation.onclick = (e) => {
      e.preventDefault();
      currentView = 'evaluation';
      document.body.classList.remove('sidebar-mobile-open');
      renderView();
    };
  }

  const linkManagement = document.getElementById('linkManagement');
  if (linkManagement) {
    linkManagement.onclick = (e) => {
      e.preventDefault();
      currentView = 'management';
      document.body.classList.remove('sidebar-mobile-open');
      renderView();
    };
  }

  const linkPatientView = document.getElementById('linkPatientView');
  if (linkPatientView) {
    linkPatientView.onclick = (e) => {
      e.preventDefault();
      currentView = 'patient_dashboard';
      document.body.classList.remove('sidebar-mobile-open');
      renderView();
    };
  }

  document.getElementById('btnLogout').onclick = () => {
    document.body.classList.remove('sidebar-mobile-open');
    document.body.classList.remove('sidebar-collapsed');
    window.showGlassAlert('Cerrando sesión...', 'info');
    setTimeout(() => {
      renderLogin();
    }, 800);
  };

  // Toggle del Sidebar en Escritorio
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  if (sidebarToggleBtn) {
    sidebarToggleBtn.onclick = () => {
      document.body.classList.toggle('sidebar-collapsed');
    };
  }

  // Toggle del Sidebar en Móvil
  const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
  if (mobileSidebarToggle) {
    mobileSidebarToggle.onclick = () => {
      document.body.classList.toggle('sidebar-mobile-open');
    };
  }



  // Scroll handler para cambiar opacidad del top navbar
  const glassNav = document.getElementById('main-navbar');
  window.onscroll = () => {
    if (glassNav) {
      if (window.scrollY > 10) {
        glassNav.classList.add('scrolled');
      } else {
        glassNav.classList.remove('scrolled');
      }
    }
  };

  renderView();
}

function renderView() {
  const evalLink = document.getElementById('linkEvaluation');
  const manageLink = document.getElementById('linkManagement');
  if (evalLink && manageLink) {
    if (currentView === 'evaluation') {
      evalLink.classList.add('active');
      manageLink.classList.remove('active');
    } else {
      evalLink.classList.remove('active');
      manageLink.classList.add('active');
    }
  }

  const contentArea = document.getElementById('dashboard-content-area');
  if (!contentArea) return;

  if (currentView === 'evaluation') {
    renderEvaluationView(contentArea);
  } else if (currentView === 'management') {
    renderManagementView(contentArea);
  } else if (currentView === 'patient_dashboard') {
    renderPatientView(contentArea);
  }


}

// --- VISTA 1: EVALUACIÓN DIARIA ---
function renderEvaluationView(container) {
  container.innerHTML = `
    <!-- Barra de navegación superior con selector de pacientes -->
    <div class="glass-card p-3 d-flex justify-content-between align-items-center mb-4 text-white gap-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; position: relative; z-index: 10;">
      <div class="d-flex align-items-center gap-3 flex-grow-1" style="max-width: 450px;">
        <h5 class="m-0 fw-bold text-nowrap"><i class="bi bi-person-fill-gear text-primary me-2"></i>Paciente:</h5>
        <select id="patientSelector" class="form-select py-1 px-3 text-white" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); max-width: 250px; font-size: 0.95rem; cursor: pointer;">
          <!-- Cargado dinámicamente -->
        </select>
      </div>
      <span class="badge-glass bg-success bg-opacity-25 text-success border-success px-3 py-1 d-none d-lg-inline-block">
        <i class="bi bi-activity me-1"></i>Módulos Médicos Activos
      </span>
    </div>

    <!-- Formulario Diario -->
    <form id="diaryForm">
      <div class="row g-4 text-white">
        
        <!-- Columna Izquierda: Tarjetas Adaptativas por Patología -->
        <div class="col-lg-8">
          
          <!-- Banner de bloqueo por fecha histórica -->
          <div id="lockWarningBanner" class="alert alert-warning mb-4 d-none" style="background: rgba(255, 193, 7, 0.08) !important; border: 1px solid rgba(255, 193, 7, 0.25) !important;">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-shield-lock-fill fs-4 text-warning"></i>
              <div>
                <strong>Registro Histórico Bloqueado:</strong> Los reportes con antigüedad superior a 24 horas son de <strong>Solo Lectura</strong> por regulaciones clínicas de seguridad.
              </div>
            </div>
          </div>

          <!-- A. CARDIOVASCULAR (Hipertensión Arterial) -->
          <div id="cardCardiovascular" class="glass-card p-4 border-0 mb-4 d-none">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="glass-title m-0"><i class="bi bi-activity text-primary me-2"></i> Hipertensión Arterial</h4>
              <span class="badge-glass bg-primary bg-opacity-25 text-primary border-primary">Riesgo Cardiovascular</span>
            </div>
            
            <div class="row g-3 mb-4">
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Presión Sistólica (mmHg)</label>
                <div class="input-group input-group-lg">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="bpSystolic" style="font-size: 1.25rem; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">-</button>
                  <input type="number" id="bpSystolic" class="form-control text-center text-white input-field" placeholder="Ej. 120" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="bpSystolic" style="font-size: 1.25rem; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">+</button>
                </div>
              </div>
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Presión Diastólica (mmHg)</label>
                <div class="input-group input-group-lg">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="bpDiastolic" style="font-size: 1.25rem; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">-</button>
                  <input type="number" id="bpDiastolic" class="form-control text-center text-white input-field" placeholder="Ej. 80" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="bpDiastolic" style="font-size: 1.25rem; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">+</button>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="glass-label d-flex justify-content-between mb-2" style="font-size: 0.85rem; opacity: 0.85;">
                <span>Frecuencia Cardíaca</span>
                
              </label>
              <div class="input-group input-group-lg">
                <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="heartRate" style="font-size: 1.25rem; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">-</button>
                <input type="number" id="heartRate" class="form-control text-center text-white input-field" min="40" max="180" value="75" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="heartRate" style="font-size: 1.25rem; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">+</button>
              </div>
            </div>

            <div class="form-check form-switch mb-4 d-flex align-items-center gap-3">
              <input class="form-check-input m-0 input-field" type="checkbox" role="switch" id="cardioEdema" style="cursor: pointer; width: 2.8em; height: 1.4em;">
              <label class="form-check-label glass-label mb-0" style="font-size: 0.95rem;" for="cardioEdema">¿Presenta edema (retención de líquido en piernas/tobillos)?</label>
            </div>

            <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Síntomas de Alerta (Cardiovascular)</label>
            <div class="d-flex gap-2 flex-wrap" id="cardioSymptomsContainer">
              <button type="button" class="btn btn-glass-secondary flex-fill py-2 cardio-symptom-btn input-btn" data-symptom="Cefalea">Cefalea</button>
              <button type="button" class="btn btn-glass-secondary flex-fill py-2 cardio-symptom-btn input-btn" data-symptom="Tinnitus">Tinnitus</button>
              <button type="button" class="btn btn-glass-secondary flex-fill py-2 cardio-symptom-btn input-btn" data-symptom="Fosfenos">Fosfenos</button>
              <button type="button" class="btn btn-glass-secondary flex-fill py-2 cardio-symptom-btn active-symptom-none input-btn" data-symptom="Ninguno" style="background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4);">Ninguno</button>
            </div>
          </div>

          <!-- B. DIABETES MELLITUS (Control Metabólico) -->
          <div id="cardMetabolica" class="glass-card p-4 border-0 mb-4 d-none">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="glass-title m-0"><i class="bi bi-droplet-fill text-info me-2"></i> Diabetes Mellitus</h4>
              <span class="badge-glass bg-info bg-opacity-25 text-info border-info">Control Metabólico</span>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Momento de la Medición</label>
                <select id="glucoseMoment" class="form-select text-white input-field" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15);">
                  <option value="En ayunas" class="bg-dark text-white" selected>En ayunas</option>
                  <option value="Pre-prandial" class="bg-dark text-white">Pre-prandial (antes de comer)</option>
                  <option value="Post-prandial" class="bg-dark text-white">Post-prandial (2h después)</option>
                  <option value="Antes de dormir" class="bg-dark text-white">Antes de dormir</option>
                </select>
              </div>
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Glucemia Capilar (mg/dL)</label>
                <div class="input-group input-group-lg">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="glucoseLevel" style="font-size: 1.25rem; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">-</button>
                  <input type="number" id="glucoseLevel" class="form-control text-center text-white input-field" placeholder="Ej. 100" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="glucoseLevel" style="font-size: 1.25rem; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">+</button>
                </div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Dosis de Insulina Administrada (UI)</label>
                <div class="input-group">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="insulinDose" style="font-size: 1.1rem; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">-</button>
                  <input type="number" step="0.5" id="insulinDose" class="form-control text-center text-white input-field" placeholder="0.0 UI" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="insulinDose" style="font-size: 1.1rem; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">+</button>
                </div>
              </div>
              <div class="col-sm-6 d-flex align-items-end">
                <div class="form-check form-switch w-100 d-flex align-items-center gap-3 pb-2">
                  <input class="form-check-input m-0 input-field" type="checkbox" role="switch" id="diabetesFootCheck" style="cursor: pointer; width: 2.8em; height: 1.4em;">
                  <label class="form-check-label glass-label mb-0" style="font-size: 0.9rem;" for="diabetesFootCheck">Revisión de extremidades (Pie Diabético)</label>
                </div>
              </div>
            </div>

            <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Síntomas de Alerta (Metabólico)</label>
            <div class="d-flex gap-2 flex-wrap" id="diabetesSymptomsContainer">
              <button type="button" class="btn btn-glass-secondary flex-fill py-2 diabetes-symptom-btn input-btn" data-symptom="Sudoración fría">Sudoración fría</button>
              <button type="button" class="btn btn-glass-secondary flex-fill py-2 diabetes-symptom-btn input-btn" data-symptom="Mareos/Temblores">Mareos / Temblores</button>
              <button type="button" class="btn btn-glass-secondary flex-fill py-2 diabetes-symptom-btn input-btn" data-symptom="Sed excesiva">Sed excesiva</button>
              <button type="button" class="btn btn-glass-secondary flex-fill py-2 diabetes-symptom-btn active-symptom-none input-btn" data-symptom="Ninguno" style="background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4);">Ninguno</button>
            </div>
          </div>

          <!-- C. EPOC O ASMA (Enfermedades Respiratorias Crónicas) -->
          <div id="cardEpoc" class="glass-card p-4 border-0 mb-4 d-none">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="glass-title m-0"><i class="bi bi-wind text-info me-2"></i> EPOC o Asma</h4>
              <span class="badge-glass bg-info bg-opacity-25 text-info border-info">Evaluación Respiratoria</span>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Saturación de Oxígeno (SpO2 %)</label>
                <div class="input-group input-group-lg">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="epocSpO2" style="font-size: 1.25rem; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">-</button>
                  <input type="number" id="epocSpO2" class="form-control text-center text-white input-field" placeholder="Ej. 95%" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="epocSpO2" style="font-size: 1.25rem; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">+</button>
                </div>
              </div>
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Frecuencia Respiratoria (rpm)</label>
                <div class="input-group input-group-lg">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="epocRespRate" style="font-size: 1.25rem; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">-</button>
                  <input type="number" id="epocRespRate" class="form-control text-center text-white input-field" placeholder="Ej. 16" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="epocRespRate" style="font-size: 1.25rem; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">+</button>
                </div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Uso Oxígeno Suplementario (L/min)</label>
                <div class="input-group">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="epocO2Flow" style="font-size: 1.1rem; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">-</button>
                  <input type="number" step="0.5" id="epocO2Flow" class="form-control text-center text-white input-field" placeholder="0.0 L/min" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="epocO2Flow" style="font-size: 1.1rem; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">+</button>
                </div>
              </div>
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Nivel de Disnea (Escala mMRC)</label>
                <select id="epocDyspnea" class="form-select text-white input-field" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15);">
                  <option value="0" class="bg-dark text-white">0 - Ahogo solo ante ejercicio intenso</option>
                  <option value="1" class="bg-dark text-white">1 - Ahogo al andar rápido o subir pendientes</option>
                  <option value="2" class="bg-dark text-white">2 - Ahogo al andar al paso de personas de su edad</option>
                  <option value="3" class="bg-dark text-white">3 - Ahogo que obliga a parar a los 100m</option>
                  <option value="4" class="bg-dark text-white">4 - Ahogo al vestirse o que impide salir de casa</option>
                </select>
              </div>
            </div>

            <div class="mb-2">
              <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Características de las Secreciones</label>
              <select id="epocSputum" class="form-select text-white input-field" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15);">
                <option value="Ausentes" class="bg-dark text-white">Ausentes</option>
                <option value="Claras" class="bg-dark text-white">Claras / Mucosas</option>
                <option value="Amarillentas/Verdosas" class="bg-dark text-white">Amarillentas / Verdosas (Posible Infección)</option>
                <option value="Con sangre" class="bg-dark text-white">Con presencia de sangre (Hemoptisis)</option>
              </select>
            </div>
          </div>

          <!-- D. ENFERMEDAD RENAL CRÓNICA (ERC) -->
          <div id="cardErc" class="glass-card p-4 border-0 mb-4 d-none">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="glass-title m-0"><i class="bi bi-heart-pulse-fill text-warning me-2"></i> Enfermedad Renal Crónica</h4>
              <span class="badge-glass bg-warning bg-opacity-25 text-warning border-warning">Control Renal</span>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Peso Diario (kg)</label>
                <div class="input-group input-group-lg">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="renalWeight" style="font-size: 1.25rem; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">-</button>
                  <input type="number" step="0.1" id="renalWeight" class="form-control text-center text-white input-field" placeholder="Ej. 74.5" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="renalWeight" style="font-size: 1.25rem; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">+</button>
                </div>
              </div>
              <div class="col-sm-6">
                <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Volumen de Diuresis (ml)</label>
                <div class="input-group input-group-lg">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="renalDiuresis" style="font-size: 1.25rem; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">-</button>
                  <input type="number" id="renalDiuresis" class="form-control text-center text-white input-field" placeholder="Ej. 1200" style="background: rgba(255, 255, 255, 0.05); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.15);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="renalDiuresis" style="font-size: 1.25rem; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">+</button>
                </div>
              </div>
            </div>

            <p class="text-white-50 small mb-2"><i class="bi bi-info-circle me-1"></i>Presión Arterial Específica (Parámetro Renal):</p>
            <div class="row g-3">
              <div class="col-6">
                <label class="glass-label mb-2" style="font-size: 0.75rem; opacity: 0.75;">Sistólica Renal (mmHg)</label>
                <div class="input-group">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="renalBpSystolic" style="font-size: 1.1rem; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">-</button>
                  <input type="number" id="renalBpSystolic" class="form-control text-center text-white input-field" placeholder="Sistólica" style="background: rgba(255, 255, 255, 0.03); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="renalBpSystolic" style="font-size: 1.1rem; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">+</button>
                </div>
              </div>
              <div class="col-6">
                <label class="glass-label mb-2" style="font-size: 0.75rem; opacity: 0.75;">Diastólica Renal (mmHg)</label>
                <div class="input-group">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold decrease-btn" data-target="renalBpDiastolic" style="font-size: 1.1rem; border-top-left-radius: 8px; border-bottom-left-radius: 8px;">-</button>
                  <input type="number" id="renalBpDiastolic" class="form-control text-center text-white input-field" placeholder="Diastólica" style="background: rgba(255, 255, 255, 0.03); border-left: none; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <button type="button" class="btn btn-glass-secondary input-btn px-3 fw-bold increase-btn" data-target="renalBpDiastolic" style="font-size: 1.1rem; border-top-right-radius: 8px; border-bottom-right-radius: 8px;">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- E. MÓDULO TRANSVERSAL (Transversal a todos los registros) -->
          <div class="glass-card p-4 border-0 mb-4">
            <h4 class="glass-title mb-3"><i class="bi bi-shield-check text-success me-2"></i> Parámetros de Bienestar General</h4>
            
            <div class="form-check form-switch mb-4 d-flex align-items-center gap-3">
              <input class="form-check-input m-0 input-field" type="checkbox" role="switch" id="transversalMedication" style="cursor: pointer; width: 2.8em; height: 1.4em;">
              <label class="form-check-label glass-label mb-0" style="font-size: 1.05rem;" for="transversalMedication">Adherencia Farmacológica (¿Tomó medicamentos correspondientes?)</label>
            </div>

            <div class="mb-4">
              <label class="glass-label d-flex justify-content-between mb-2" style="font-size: 0.85rem; opacity: 0.85;">
                <span>Nivel de Dolor (Escala EVA 1-10)</span>
                
              </label>
              <input type="hidden" id="painLevel" class="input-field" value="1">
              <div class="btn-group w-100 mt-2 pain-scale-container" role="group" id="pain-buttons-container" style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; backdrop-filter: blur(10px);">
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="1" style="color: #b91c1c; font-size: 0.9rem; padding: 10px 0;">1</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="2" style="color: #ef4444; font-size: 0.9rem; padding: 10px 0;">2</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="3" style="color: #f87171; font-size: 0.9rem; padding: 10px 0;">3</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="4" style="color: #f97316; font-size: 0.9rem; padding: 10px 0;">4</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="5" style="color: #f59e0b; font-size: 0.9rem; padding: 10px 0;">5</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="6" style="color: #facc15; font-size: 0.9rem; padding: 10px 0;">6</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="7" style="color: #a3e635; font-size: 0.9rem; padding: 10px 0;">7</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="8" style="color: #84cc16; font-size: 0.9rem; padding: 10px 0;">8</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="9" style="color: #34d399; font-size: 0.9rem; padding: 10px 0;">9</button>
                <button type="button" class="btn btn-glass-secondary pain-btn input-btn fw-bold" data-value="10" style="color: #10b981; font-size: 0.9rem; padding: 10px 0;">10</button>
              </div>
            </div>

            <div class="mb-2">
              <label class="glass-label mb-2" style="font-size: 0.85rem; opacity: 0.85;">Apuntes e Incidencias del Cuidador</label>
              <textarea id="caregiverNotes" class="form-control text-white p-3 input-field" rows="4" placeholder="Registra observaciones sobre conducta, alimentación, descanso u otros sucesos relevantes..." style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15);"></textarea>
            </div>
          </div>

        </div>

        <!-- Columna Derecha: Ficha y Panel de Controles (Boton Guardar, Fecha, Rangos) -->
        <div class="col-lg-4">
          <div class="d-flex flex-column gap-4" style="position: sticky; top: 20px;">
            
            <!-- Ficha del Paciente Activo -->
            <div class="glass-card p-4">
              <h5 class="fw-bold mb-3"><i class="bi bi-person-bounding-box text-primary me-2"></i>Ficha del Paciente</h5>
              <div class="d-flex align-items-center gap-3 mb-3 border-bottom border-light border-opacity-10 pb-3">
                <div id="patientInitials" class="rounded-circle d-flex justify-content-center align-items-center text-white" style="width: 55px; height: 55px; background: rgba(14, 165, 233, 0.25); border: 1px solid rgba(14, 165, 233, 0.4); font-size: 1.35rem; font-weight: bold;">JD</div>
                <div>
                  <h6 id="patientName" class="mb-0 fw-bold">--</h6>
                  <small id="patientDni" class="text-warning font-monospace">--</small>
                </div>
              </div>
              
              <!-- Datos Base Universales -->
              <div class="d-flex flex-column gap-2 small text-white-50">
                <div class="d-flex justify-content-between"><span>Edad / Sexo:</span><strong class="text-white" id="pMetaAgeSex">--</strong></div>
                <div class="d-flex justify-content-between"><span>Peso / Estatura:</span><strong class="text-white" id="pMetaWeightHeight">--</strong></div>
                <div class="d-flex justify-content-between"><span>Grupo Sanguíneo:</span><strong class="text-white" id="pMetaBlood">--</strong></div>
                <div class="d-flex justify-content-between"><span>Alergias:</span><strong class="text-white text-end" style="max-width: 150px;" id="pMetaAllergies">--</strong></div>
                <div class="border-top border-light border-opacity-10 my-2"></div>
                <div class="fw-bold text-info mb-1"><i class="bi bi-telephone-fill me-1"></i>Contacto Emergencia:</div>
                <div id="pMetaContact" class="text-white">--</div>
              </div>

              <h6 class="fw-bold border-top border-light border-opacity-10 pt-3 mt-3 mb-2" style="font-size: 0.9rem;">Condiciones Activas:</h6>
              <div id="patientConditionsList" class="d-flex flex-column gap-2"></div>
            </div>

            <!-- Panel de Control y Envío (Lado Derecho del Panel) -->
            <div class="glass-card p-4 border border-primary border-opacity-25" style="background: rgba(14, 165, 233, 0.03);">
              <h5 class="fw-bold mb-3 text-info"><i class="bi bi-sliders me-2"></i>Controles del Reporte</h5>
              
              <div class="mb-4">
                <label class="small text-white-50 mb-2">Fecha del Registro</label>
                <input type="date" id="reportDate" class="form-control text-white" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); cursor: pointer;">
              </div>

              <div id="submitButtonContainer">
                <button type="submit" class="btn btn-glass-primary btn-lg w-100 fw-bold py-3" style="border-radius: 12px;">
                  <i class="bi bi-save2-fill me-2"></i> Guardar Reporte
                </button>
              </div>
            </div>

            <!-- Rangos Clínicos de Control -->
            <div class="glass-card p-4">
              <h5 class="fw-bold mb-3"><i class="bi bi-heart-fill text-danger me-2"></i>Rangos Clínicos de Control</h5>
              <ul class="list-unstyled mb-0 d-flex flex-column gap-2 small">
                <li class="d-flex justify-content-between"><span>Presión Arterial:</span><strong class="text-success">&lt; 120/80 mmHg</strong></li>
                <li class="d-flex justify-content-between"><span>Saturación SpO2:</span><strong class="text-success">&gt; 94%</strong></li>
                <li class="d-flex justify-content-between"><span>Glucemia Basal:</span><strong class="text-success">70 - 100 mg/dL</strong></li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </form>
  `;

  // Poblar selectores
  const patientSelector = document.getElementById('patientSelector');
  if (patientSelector) {
    patientSelector.innerHTML = PATIENTS_DATABASE.map(p => `
      <option value="${p.id}" class="bg-dark text-white" ${p.id === activePatient.id ? 'selected' : ''}>${p.name}</option>
    `).join('');

    patientSelector.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const patient = PATIENTS_DATABASE.find(p => p.id === selectedId);
      if (patient) {
        updateActivePatient(patient);
      }
    });
  }

  // Configurar input de fecha
  const reportDateInput = document.getElementById('reportDate');
  if (reportDateInput) {
    reportDateInput.value = getTodayDateString();
    reportDateInput.max = getTodayDateString();
    reportDateInput.addEventListener('change', evaluateDateLock);
  }

  // Inicializar vista del paciente activo
  updateActivePatient(activePatient);

  // Inicializar Custom Selects en Dashboard
  initCustomSelects();
}

function evaluateDateLock() {
  const dateInput = document.getElementById('reportDate');
  const warningBanner = document.getElementById('lockWarningBanner');
  const submitContainer = document.getElementById('submitButtonContainer');
  if (!dateInput) return;

  const todayStr = getTodayDateString();
  const selectedStr = dateInput.value;
  const isOld = selectedStr !== todayStr;

  const inputs = document.querySelectorAll('.input-field');
  const buttons = document.querySelectorAll('.input-btn');

  if (isOld) {
    warningBanner.classList.remove('d-none');
    if (submitContainer) submitContainer.classList.add('d-none');
    inputs.forEach(el => el.disabled = true);
    buttons.forEach(el => {
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.5';
    });
  } else {
    warningBanner.classList.add('d-none');
    if (submitContainer) submitContainer.classList.remove('d-none');
    inputs.forEach(el => el.disabled = false);
    buttons.forEach(el => {
      el.style.pointerEvents = 'auto';
      el.style.opacity = '1';
    });
  }
}

// --- VISTA 2: GESTIÓN DE PERFILES (CRUD ADMIN) ---
function renderManagementView(container) {
  container.innerHTML = `
    <div class="glass-card p-3 d-flex justify-content-between align-items-center mb-4 text-white" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;">
      <h5 class="m-0 fw-bold"><i class="bi bi-people-fill text-primary me-2"></i>Administración de Perfiles</h5>
      <span class="badge-glass bg-primary bg-opacity-25 text-primary border-primary">Panel Admin</span>
    </div>

    <div class="glass-card p-4 text-white">
      <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light border-opacity-10 flex-wrap gap-3">
        <div class="d-flex gap-2">
          <button id="tabPatients" class="btn btn-sm ${managementSubTab === 'patients' ? 'btn-glass-primary active' : 'btn-glass-secondary'} px-4 py-2">
            <i class="bi bi-person-fill me-2"></i>Pacientes
          </button>
          <button id="tabCaregivers" class="btn btn-sm ${managementSubTab === 'caregivers' ? 'btn-glass-primary active' : 'btn-glass-secondary'} px-4 py-2">
            <i class="bi bi-person-heart me-2"></i>Cuidadores
          </button>
        </div>
        
        <button id="btnAddNew" class="btn btn-glass-primary btn-sm px-4 py-2">
          <i class="bi bi-plus-lg me-2"></i>${managementSubTab === 'patients' ? 'Registrar Paciente' : 'Registrar Cuidador'}
        </button>
      </div>

      <div id="crudMainWorkspace"></div>
    </div>
  `;

  document.getElementById('tabPatients').onclick = () => {
    managementSubTab = 'patients';
    editingItem = null;
    renderManagementView(container);
  };
  document.getElementById('tabCaregivers').onclick = () => {
    managementSubTab = 'caregivers';
    editingItem = null;
    renderManagementView(container);
  };
  document.getElementById('btnAddNew').onclick = () => {
    showCrudForm();
  };

  renderCrudTable();
}

function renderCrudTable() {
  const workspace = document.getElementById('crudMainWorkspace');
  if (!workspace) return;

  if (managementSubTab === 'patients') {
    workspace.innerHTML = `
      <div class="table-responsive">
        <table class="table table-dark table-hover bg-transparent text-white align-middle" style="--bs-table-bg: transparent; --bs-table-border-color: rgba(255,255,255,0.08);">
          <thead>
            <tr>
              <th scope="col" class="text-white-50">Paciente / DNI</th>
              <th scope="col" class="text-white-50">Datos Demográficos</th>
              <th scope="col" class="text-white-50">Grupo Sanguíneo</th>
              <th scope="col" class="text-white-50">Condiciones</th>
              <th scope="col" class="text-white-50 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${PATIENTS_DATABASE.map(p => {
      const initials = p.name.split(' ').map(n => n[0]).join('');
      const condBadges = p.conditions.map(key => {
        const cond = CLINICAL_CONDITIONS[key];
        return `<span class="badge-glass bg-info bg-opacity-10 text-info border-info me-1 small" style="font-size: 0.72rem;">${cond ? cond.name : key}</span>`;
      }).join(' ');

      return `
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      <div class="rounded-circle d-flex justify-content-center align-items-center bg-primary bg-opacity-25 border border-primary border-opacity-25" style="width: 38px; height: 38px; font-weight: bold; font-size: 0.88rem;">
                        ${initials}
                      </div>
                      <div>
                        <div class="fw-bold">${p.name}</div>
                        <small class="text-warning font-monospace">${p.fileNumber}</small>
                      </div>
                    </div>
                  </td>
                  <td>${p.age} años • ${p.gender}<br><small class="text-white-50">${p.weight} kg • ${p.stature} cm</small></td>
                  <td><code class="text-white">${p.bloodType}</code></td>
                  <td>${condBadges || '<span class="text-white-50 small">Ninguna</span>'}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-glass-primary me-2 edit-patient-btn" data-id="${p.id}"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-glass-danger delete-patient-btn" data-id="${p.id}"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('.edit-patient-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        editingItem = PATIENTS_DATABASE.find(p => p.id === id);
        showCrudForm();
      };
    });

    document.querySelectorAll('.delete-patient-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const patient = PATIENTS_DATABASE.find(p => p.id === id);
        if (confirm(`¿Estás seguro de que deseas eliminar al paciente "${patient.name}"?`)) {
          PATIENTS_DATABASE = PATIENTS_DATABASE.filter(p => p.id !== id);
          if (activePatient && activePatient.id === id) {
            activePatient = PATIENTS_DATABASE[0] || null;
          }
          window.showGlassAlert('Paciente eliminado.', 'success');
          renderCrudTable();
        }
      };
    });

  } else {
    // Tabla Cuidadores
    workspace.innerHTML = `
      <div class="table-responsive">
        <table class="table table-dark table-hover bg-transparent text-white align-middle" style="--bs-table-bg: transparent; --bs-table-border-color: rgba(255,255,255,0.08);">
          <thead>
            <tr>
              <th scope="col" class="text-white-50">Cuidador</th>
              <th scope="col" class="text-white-50">Email</th>
              <th scope="col" class="text-white-50">Paciente Asignado</th>
              <th scope="col" class="text-white-50 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${CAREGIVERS_DATABASE.map(c => {
      const patient = PATIENTS_DATABASE.find(p => p.id === c.assignedPatientId);
      return `
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      <div class="rounded-circle d-flex justify-content-center align-items-center bg-info bg-opacity-25 border border-info border-opacity-25" style="width: 38px; height: 38px;"><i class="bi bi-person-heart"></i></div>
                      <div class="fw-bold">${c.name}</div>
                    </div>
                  </td>
                  <td>${c.email}</td>
                  <td>${patient ? patient.name : '<span class="text-white-30">No asignado</span>'}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-glass-primary me-2 edit-caregiver-btn" data-id="${c.id}"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-glass-danger delete-caregiver-btn" data-id="${c.id}"><i class="bi bi-trash"></i></button>
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.querySelectorAll('.edit-caregiver-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        editingItem = CAREGIVERS_DATABASE.find(c => c.id === id);
        showCrudForm();
      };
    });

    document.querySelectorAll('.delete-caregiver-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const caregiver = CAREGIVERS_DATABASE.find(c => c.id === id);
        if (confirm(`¿Estás seguro de que deseas eliminar al cuidador "${caregiver.name}"?`)) {
          CAREGIVERS_DATABASE = CAREGIVERS_DATABASE.filter(c => c.id !== id);
          window.showGlassAlert('Cuidador eliminado.', 'success');
          renderCrudTable();
        }
      };
    });
  }
}

function showCrudForm() {
  const workspace = document.getElementById('crudMainWorkspace');
  if (!workspace) return;

  const isEdit = editingItem !== null;

  if (managementSubTab === 'patients') {
    const pDni = isEdit ? editingItem.fileNumber : '';
    const pName = isEdit ? editingItem.name : '';
    const pAge = isEdit ? editingItem.age : '';
    const pGender = isEdit ? editingItem.gender : 'Masculino';
    const pWeight = isEdit ? editingItem.weight : '';
    const pStature = isEdit ? editingItem.stature : '';
    const pBlood = isEdit ? editingItem.bloodType : 'O+';
    const pAllergies = isEdit ? editingItem.allergies : '';
    const pEmergencyName = isEdit ? (editingItem.emergencyContact?.name || '') : '';
    const pEmergencyRelation = isEdit ? (editingItem.emergencyContact?.relation || '') : '';
    const pEmergencyPhone = isEdit ? (editingItem.emergencyContact?.phone || '') : '';
    const pConds = isEdit ? editingItem.conditions : [];

    workspace.innerHTML = `
      <div class="p-4 rounded border border-light border-opacity-10" style="background: rgba(255,255,255,0.01); max-width: 700px;">
        <h5 class="fw-bold mb-4 text-info"><i class="bi bi-person-fill-add me-2"></i>${isEdit ? 'Editar Perfil del Paciente' : 'Añadir Nuevo Paciente'}</h5>
        <form id="patientCrudForm">
          <div class="row g-3 mb-3">
            <div class="col-sm-6">
              <label class="form-label text-white-50 small">Identificador Único (RUT/DNI)</label>
              <input type="text" id="crudPDni" class="form-control text-white" value="${pDni}" required placeholder="Ej. 12.345.678-9" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            </div>
            <div class="col-sm-6">
              <label class="form-label text-white-50 small">Nombre Completo</label>
              <input type="text" id="crudPName" class="form-control text-white" value="${pName}" required placeholder="Ej. Juan Díaz" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-6 col-sm-3">
              <label class="form-label text-white-50 small">Edad</label>
              <input type="number" id="crudPAge" class="form-control text-white" value="${pAge}" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            </div>
            <div class="col-6 col-sm-3">
              <label class="form-label text-white-50 small">Sexo Biológico</label>
              <select id="crudPGender" class="form-select text-white" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
                <option value="Masculino" class="bg-dark" ${pGender === 'Masculino' ? 'selected' : ''}>Masculino</option>
                <option value="Femenino" class="bg-dark" ${pGender === 'Femenino' ? 'selected' : ''}>Femenino</option>
              </select>
            </div>
            <div class="col-6 col-sm-3">
              <label class="form-label text-white-50 small">Peso Base (kg)</label>
              <input type="number" id="crudPWeight" class="form-control text-white" value="${pWeight}" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            </div>
            <div class="col-6 col-sm-3">
              <label class="form-label text-white-50 small">Estatura (cm)</label>
              <input type="number" id="crudPStature" class="form-control text-white" value="${pStature}" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-sm-6">
              <label class="form-label text-white-50 small">Grupo Sanguíneo y Factor Rh</label>
              <select id="crudPBlood" class="form-select text-white" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
                ${['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(type => `
                  <option value="${type}" class="bg-dark" ${pBlood === type ? 'selected' : ''}>${type}</option>
                `).join('')}
              </select>
            </div>
            <div class="col-sm-6">
              <label class="form-label text-white-50 small">Alergias Conocidas</label>
              <input type="text" id="crudPAllergies" class="form-control text-white" value="${pAllergies}" placeholder="Ej. Penicilina, Sulfa, o Ninguna" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            </div>
          </div>

          <div class="p-3 rounded mb-3" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);">
            <label class="fw-bold small text-info mb-2"><i class="bi bi-telephone-fill me-1"></i>Contacto de Emergencia</label>
            <div class="row g-2">
              <div class="col-sm-4">
                <input type="text" id="crudPEmergencyName" class="form-control form-control-sm text-white" value="${pEmergencyName}" placeholder="Nombre" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
              </div>
              <div class="col-sm-4">
                <input type="text" id="crudPEmergencyRelation" class="form-control form-control-sm text-white" value="${pEmergencyRelation}" placeholder="Parentesco (ej. Hija)" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
              </div>
              <div class="col-sm-4">
                <input type="text" id="crudPEmergencyPhone" class="form-control form-control-sm text-white" value="${pEmergencyPhone}" placeholder="Teléfono" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label text-white-50 small d-block">Diagnósticos / Patologías Crónicas</label>
            <div class="form-check mb-2">
              <input class="form-check-input cond-check" type="checkbox" value="HYPERTENSION" id="condHyp" ${pConds.includes('HYPERTENSION') ? 'checked' : ''}>
              <label class="form-check-label small" for="condHyp">Hipertensión Arterial (Evaluación Cardiovascular)</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input cond-check" type="checkbox" value="DIABETES" id="condDia" ${pConds.includes('DIABETES') ? 'checked' : ''}>
              <label class="form-check-label small" for="condDia">Diabetes Mellitus (Control Metabólico)</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input cond-check" type="checkbox" value="EPOC" id="condEpoc" ${pConds.includes('EPOC') ? 'checked' : ''}>
              <label class="form-check-label small" for="condEpoc">EPOC o Asma (Enfermedades Respiratorias)</label>
            </div>
            <div class="form-check">
              <input class="form-check-input cond-check" type="checkbox" value="ERC" id="condErc" ${pConds.includes('ERC') ? 'checked' : ''}>
              <label class="form-check-label small" for="condErc">Enfermedad Renal Crónica (ERC)</label>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-glass-primary px-4 py-2">Guardar Paciente</button>
            <button type="button" id="btnCancelCrud" class="btn btn-glass-secondary px-4 py-2">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    // Inicializar custom selects de GlassKit para el formulario de Pacientes
    initCustomSelects();

    document.getElementById('patientCrudForm').onsubmit = (e) => {
      e.preventDefault();
      const dni = document.getElementById('crudPDni').value.trim();
      const name = document.getElementById('crudPName').value.trim();
      const age = parseInt(document.getElementById('crudPAge').value);
      const gender = document.getElementById('crudPGender').value;
      const weight = parseFloat(document.getElementById('crudPWeight').value);
      const stature = parseInt(document.getElementById('crudPStature').value);
      const blood = document.getElementById('crudPBlood').value;
      const allergies = document.getElementById('crudPAllergies').value.trim() || 'Ninguna';

      const emergencyContact = {
        name: document.getElementById('crudPEmergencyName').value.trim(),
        relation: document.getElementById('crudPEmergencyRelation').value.trim(),
        phone: document.getElementById('crudPEmergencyPhone').value.trim()
      };

      const conditions = [];
      document.querySelectorAll('.cond-check:checked').forEach(chk => {
        conditions.push(chk.value);
      });

      if (isEdit) {
        editingItem.fileNumber = dni;
        editingItem.name = name;
        editingItem.age = age;
        editingItem.gender = gender;
        editingItem.weight = weight;
        editingItem.stature = stature;
        editingItem.bloodType = blood;
        editingItem.allergies = allergies;
        editingItem.emergencyContact = emergencyContact;
        editingItem.conditions = conditions;
        window.showGlassAlert('Perfil del paciente actualizado.', 'success');
      } else {
        const newId = 'p_' + Date.now();
        const newPatient = new Patient(newId, name, age, gender, weight, stature, blood, conditions, allergies, emergencyContact, dni);
        PATIENTS_DATABASE.push(newPatient);
        if (!activePatient) activePatient = newPatient;
        window.showGlassAlert('Paciente registrado exitosamente.', 'success');
      }

      editingItem = null;
      renderCrudTable();
    };

  } else {
    // Formulario Cuidadores
    const cName = isEdit ? editingItem.name : '';
    const cEmail = isEdit ? editingItem.email : '';
    const cUsername = isEdit ? (editingItem.username || '') : '';
    const cPassword = isEdit ? (editingItem.password || '') : '';
    const cPatientId = isEdit ? editingItem.assignedPatientId : (PATIENTS_DATABASE[0] ? PATIENTS_DATABASE[0].id : '');

    workspace.innerHTML = `
      <div class="p-4 rounded border border-light border-opacity-10" style="background: rgba(255,255,255,0.01); max-width: 550px;">
        <h5 class="fw-bold mb-4 text-info"><i class="bi bi-person-fill-add me-2"></i>${isEdit ? 'Editar Perfil del Cuidador' : 'Añadir Nuevo Cuidador'}</h5>
        <form id="caregiverCrudForm">
          <div class="mb-3">
            <label class="form-label text-white-50 small">Nombre Completo</label>
            <input type="text" id="crudCName" class="form-control text-white" value="${cName}" required placeholder="Ej. Sofía Díaz" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
          </div>
          <div class="mb-3">
            <label class="form-label text-white-50 small">Correo Electrónico</label>
            <input type="email" id="crudCEmail" class="form-control text-white" value="${cEmail}" required placeholder="Ej. sofia@cuidapp.com" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
          </div>
          <div class="row g-3 mb-3">
            <div class="col-sm-6">
              <label class="form-label text-white-50 small">Usuario de Acceso</label>
              <input type="text" id="crudCUsername" class="form-control text-white" value="${cUsername}" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            </div>
            <div class="col-sm-6">
              <label class="form-label text-white-50 small">Contraseña</label>
              <input type="text" id="crudCPassword" class="form-control text-white" value="${cPassword}" required style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);">
            </div>
          </div>
          <div class="mb-4">
            <label class="form-label text-white-50 small">Paciente Asignado</label>
            <select id="crudCPatient" class="form-select text-white" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15);">
              ${PATIENTS_DATABASE.map(p => `
                <option value="${p.id}" class="bg-dark" ${p.id === cPatientId ? 'selected' : ''}>${p.name}</option>
              `).join('')}
              <option value="" class="bg-dark" ${cPatientId === '' ? 'selected' : ''}>Ninguno (Sin asignación)</option>
            </select>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn-glass-primary px-4 py-2 border-0 rounded-2" style="cursor: pointer;">Guardar Cuidador</button>
            <button type="button" id="btnCancelCrud" class="btn-glass-secondary px-4 py-2 border-0 rounded-2" style="cursor: pointer;">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    // Inicializar selectores
    initCustomSelects();

    document.getElementById('caregiverCrudForm').onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('crudCName').value.trim();
      const email = document.getElementById('crudCEmail').value.trim();
      const username = document.getElementById('crudCUsername').value.trim();
      const password = document.getElementById('crudCPassword').value.trim();
      const patientId = document.getElementById('crudCPatient').value;

      if (isEdit) {
        editingItem.name = name;
        editingItem.email = email;
        editingItem.assignedPatientId = patientId;
        editingItem.username = username;
        editingItem.password = password;
        window.showGlassAlert('Perfil del cuidador actualizado.', 'success');
      } else {
        const newId = 'c_' + Date.now();
        const newCaregiver = new Caregiver(newId, name, email, patientId, username, password);
        CAREGIVERS_DATABASE.push(newCaregiver);
        window.showGlassAlert('Cuidador registrado exitosamente.', 'success');
      }

      editingItem = null;
      renderCrudTable();
    };
  }

  document.getElementById('btnCancelCrud').onclick = () => {
    editingItem = null;
    renderCrudTable();
  };
}

// --- ACTUALIZACIÓN DE PACIENTE ACTIVO ---
function updateActivePatient(patient) {
  if (!patient) return;
  activePatient = patient;

  // 1. Datos Universales en la Ficha Lateral
  const initialsEl = document.getElementById('patientInitials');
  const nameEl = document.getElementById('patientName');
  const dniEl = document.getElementById('patientDni');
  const metaAgeSexEl = document.getElementById('pMetaAgeSex');
  const metaWeightHeightEl = document.getElementById('pMetaWeightHeight');
  const metaBloodEl = document.getElementById('pMetaBlood');
  const metaAllergiesEl = document.getElementById('pMetaAllergies');
  const metaContactEl = document.getElementById('pMetaContact');
  const condListEl = document.getElementById('patientConditionsList');

  if (initialsEl && nameEl && dniEl) {
    const initials = patient.name.split(' ').map(n => n[0]).join('');
    initialsEl.textContent = initials;
    nameEl.textContent = patient.name;
    dniEl.textContent = `DNI: ${patient.fileNumber}`;

    if (metaAgeSexEl) metaAgeSexEl.textContent = `${patient.age} años / ${patient.gender}`;
    if (metaWeightHeightEl) metaWeightHeightEl.textContent = `${patient.weight} kg / ${patient.stature} cm`;
    if (metaBloodEl) metaBloodEl.textContent = patient.bloodType;
    if (metaAllergiesEl) metaAllergiesEl.textContent = patient.allergies;

    if (metaContactEl && patient.emergencyContact) {
      metaContactEl.innerHTML = `
        <span class="d-block text-white" style="font-size:0.83rem;">${patient.emergencyContact.name} (${patient.emergencyContact.relation})</span>
        <span class="text-info" style="font-size:0.83rem;"><i class="bi bi-telephone-outbound me-1"></i>${patient.emergencyContact.phone}</span>
      `;
    }

    condListEl.innerHTML = patient.conditions.map(key => {
      const cond = CLINICAL_CONDITIONS[key];
      return `
        <div class="p-2 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); font-size: 0.78rem;">
          <div class="fw-bold text-info"><i class="bi bi-bookmark-plus-fill me-1"></i>${cond.name}</div>
          <div class="text-white-50" style="font-size:0.72rem;">${cond.description}</div>
        </div>
      `;
    }).join('');
  }

  // 2. Mostrar/Ocultar Tarjetas por Patología
  const cardCardiovascular = document.getElementById('cardCardiovascular');
  const cardMetabolica = document.getElementById('cardMetabolica');
  const cardEpoc = document.getElementById('cardEpoc');
  const cardErc = document.getElementById('cardErc');

  if (cardCardiovascular) cardCardiovascular.className = `glass-card p-4 border-0 mb-4 ${patient.hasCondition('HYPERTENSION') ? '' : 'd-none'}`;
  if (cardMetabolica) cardMetabolica.className = `glass-card p-4 border-0 mb-4 ${patient.hasCondition('DIABETES') ? '' : 'd-none'}`;
  if (cardEpoc) cardEpoc.className = `glass-card p-4 border-0 mb-4 ${patient.hasCondition('EPOC') ? '' : 'd-none'}`;
  if (cardErc) cardErc.className = `glass-card p-4 border-0 mb-4 ${patient.hasCondition('ERC') ? '' : 'd-none'}`;

  // Enlazar eventos interactivos de este paciente
  bindDashboardEvents(patient.name);

  // Forzar bloqueo de controles si la fecha no es la de hoy
  evaluateDateLock();
}

// --- VINCULACIÓN DE EVENTOS DEL LOGIN ---
function bindLoginEvents() {
  const usernameInput = document.getElementById('zorinUsername');
  const greetingEl = document.getElementById('zorinGreeting');
  const stepUser = document.getElementById('loginStepUsername');
  const stepPass = document.getElementById('loginStepPassword');
  const formUsername = document.getElementById('formUsername');
  const formPassword = document.getElementById('formPassword');
  const btnBackToUser = document.getElementById('btnBackToUser');
  const togglePasswordVisibility = document.getElementById('togglePasswordVisibility');
  const passwordInput = document.getElementById('zorinPassword');
  const eyeIcon = document.getElementById('passwordEyeIcon');
  const settingsBtn = document.getElementById('settingsBtn');

  function updateZorinGreeting(newText) {
    if (greetingEl) {
      greetingEl.style.transition = 'opacity 0.2s ease, transform 0.2s cubic-bezier(.34,1.56,.64,1)';
      greetingEl.style.opacity = '0';
      greetingEl.style.transform = 'translateY(-8px) scale(0.9)';

      setTimeout(() => {
        greetingEl.textContent = newText;
        greetingEl.style.opacity = '1';
        greetingEl.style.transform = 'translateY(0) scale(1)';
      }, 200);
    }
  }

  function goToPasswordStep() {
    const username = usernameInput.value.trim();
    if (!username) {
      window.showGlassAlert('Por favor, ingresa un nombre de usuario.', 'warning');
      return;
    }

    updateZorinGreeting(`¡Hola ${username}!`);
    stepUser.classList.add('d-none');
    stepPass.classList.remove('d-none');

    setTimeout(() => {
      passwordInput.focus();
    }, 100);
  }

  function goToUsernameStep() {
    updateZorinGreeting('¿Hola?');
    stepPass.classList.add('d-none');
    stepUser.classList.remove('d-none');

    setTimeout(() => {
      usernameInput.focus();
    }, 100);
  }

  if (formUsername) {
    formUsername.addEventListener('submit', (e) => {
      e.preventDefault();
      goToPasswordStep();
    });
  }

  if (btnBackToUser) {
    btnBackToUser.addEventListener('click', goToUsernameStep);
  }

  if (togglePasswordVisibility && passwordInput && eyeIcon) {
    togglePasswordVisibility.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('bi-eye');
        eyeIcon.classList.add('bi-eye-slash');
      } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('bi-eye-slash');
        eyeIcon.classList.add('bi-eye');
      }
    });
  }

  if (formPassword) {
    formPassword.addEventListener('submit', (e) => {
      e.preventDefault();
      submitZorinLogin();
    });
  }

  function submitZorinLogin() {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    const centerForm = document.querySelector('.zorin-center-login');

    if (user === 'admin' && pass === 'admin123') {
      stepPass.classList.add('d-none');
      updateZorinGreeting('Acceso Concedido');
      window.showGlassAlert('¡Acceso concedido a cuidApp (Admin)!', 'success');

      currentUser = 'admin';
      setTimeout(() => {
        renderDashboard('admin');
      }, 1500);

      return;
    }

    // Buscar en la base de datos de pacientes (acceso personal)
    const patient = PATIENTS_DATABASE.find(p => p.username === user && p.password === pass);
    if (patient) {
      stepPass.classList.add('d-none');
      updateZorinGreeting('Acceso Concedido');
      window.showGlassAlert(`¡Bienvenido/a, ${patient.name}!`, 'success');

      currentUser = 'patient_' + patient.id;
      activePatient = patient;
      currentView = 'patient_dashboard';

      setTimeout(() => {
        renderDashboard(patient.name);
      }, 1500);
      return;
    }

    const caregiver = CAREGIVERS_DATABASE.find(c => c.username === user && c.password === pass);
    if (caregiver) {
      stepPass.classList.add('d-none');
      updateZorinGreeting('Acceso Concedido');
      window.showGlassAlert(`¡Bienvenido/a, ${caregiver.name}!`, 'success');

      currentUser = caregiver.name;
      // Pre-seleccionar su paciente asignado si existe, o el primero disponible
      const assigned = PATIENTS_DATABASE.find(p => p.id === caregiver.assignedPatientId);
      activePatient = assigned || PATIENTS_DATABASE[0];

      setTimeout(() => {
        renderDashboard(caregiver.name);
      }, 1500);
    } else {
      if (centerForm) {
        centerForm.classList.add('shake-animation');
        centerForm.style.animation = 'shake 0.5s ease-in-out';
        window.showGlassAlert('Autenticación fallida. Verifica usuario y contraseña.', 'danger');

        setTimeout(() => {
          centerForm.classList.remove('shake-animation');
          centerForm.style.animation = '';
        }, 500);
      }
    }
  }

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      window.showGlassAlert('Ajustes del sistema de cuidApp.', 'info', [
        { text: 'Ver Presentación', class: 'btn-glass-primary', onClick: () => { window.location.href = '/showcase.html'; } },
        { text: 'Cerrar', class: 'btn-glass-secondary', onClick: (t) => t.remove() }
      ]);
    });
  }
}

// --- VINCULACIÓN DE EVENTOS DEL DASHBOARD ---
function bindDashboardEvents(patientName) {
  const heartRateInput = document.getElementById('heartRate');
  const bpmValueDisplay = document.getElementById('bpm-val');

  if (heartRateInput && bpmValueDisplay) {
    const syncHeartRate = (val) => {
      heartRateInput.value = val;
      bpmValueDisplay.textContent = `${val} BPM`;
    };

    heartRateInput.oninput = (e) => syncHeartRate(e.target.value);
  }

  const painLevelInput = document.getElementById('painLevel');
  const painValueDisplay = document.getElementById('pain-val');
  const painBtns = document.querySelectorAll('.pain-btn');

  if (painLevelInput && painValueDisplay && painBtns.length > 0) {
    const painColors = {
      '1': '#b91c1c',
      '2': '#ef4444',
      '3': '#f87171',
      '4': '#f97316',
      '5': '#f59e0b',
      '6': '#facc15',
      '7': '#a3e635',
      '8': '#84cc16',
      '9': '#34d399',
      '10': '#10b981'
    };

    const painBgColors = {
      '1': 'rgba(185, 28, 28, 0.15)',
      '2': 'rgba(239, 68, 68, 0.15)',
      '3': 'rgba(248, 113, 113, 0.15)',
      '4': 'rgba(249, 115, 22, 0.15)',
      '5': 'rgba(245, 158, 11, 0.15)',
      '6': 'rgba(250, 204, 21, 0.15)',
      '7': 'rgba(163, 230, 53, 0.15)',
      '8': 'rgba(132, 204, 22, 0.15)',
      '9': 'rgba(52, 211, 153, 0.15)',
      '10': 'rgba(16, 185, 129, 0.15)'
    };

    function setPainValue(val) {
      painLevelInput.value = val;
      painValueDisplay.textContent = val;

      painBtns.forEach(btn => {
        const btnVal = btn.getAttribute('data-value');

        // Reset dynamic style properties and classes
        btn.className = 'btn pain-btn fw-bold input-btn';
        btn.style.boxShadow = '';
        btn.style.background = '';
        btn.style.borderColor = '';

        // Unselected buttons get their colored text to show the scale
        btn.style.color = painColors[btnVal];

        if (btnVal === val.toString()) {
          btn.classList.add('active');
          const intVal = parseInt(btnVal);
          if (intVal <= 3) {
            btn.classList.add('btn-glass-danger');
            btn.style.background = painColors[btnVal];
            btn.style.borderColor = painColors[btnVal];
            btn.style.color = '#fff';
            btn.style.boxShadow = `0 0 6px ${painColors[btnVal]}60`;
          } else if (intVal <= 7) {
            btn.classList.add('btn-glass-warning');
            btn.style.background = painColors[btnVal];
            btn.style.borderColor = painColors[btnVal];
            btn.style.color = '#fff'; // white text as requested
            btn.style.boxShadow = `0 0 6px ${painColors[btnVal]}60`;
          } else {
            btn.classList.add('btn-glass-success');
            btn.style.background = painColors[btnVal];
            btn.style.borderColor = painColors[btnVal];
            btn.style.color = '#fff';
            btn.style.boxShadow = `0 0 6px ${painColors[btnVal]}60`;
          }
        } else {
          // Inactive state - uses GlassKit secondary class
          btn.classList.add('btn-glass-secondary');
        }
      });
    }

    painBtns.forEach(btn => {
      btn.onclick = () => {
        const val = btn.getAttribute('data-value');
        setPainValue(val);
      };
    });

    // Set initial active state
    setPainValue(painLevelInput.value || '1');
  }

  // Controladores para botones de incremento/decremento en grupos numéricos personalizados (GlassKit)
  document.querySelectorAll('.decrease-btn').forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input && !input.disabled) {
        const step = parseFloat(input.getAttribute('step')) || 1;
        const min = parseFloat(input.getAttribute('min'));
        let val = parseFloat(input.value);
        if (isNaN(val)) {
          val = parseFloat(input.placeholder.replace(/[^\d.]/g, '')) || 0;
        }
        let newVal = val - step;
        if (!isNaN(min) && newVal < min) newVal = min;

        if (step % 1 !== 0) {
          input.value = parseFloat(newVal.toFixed(2));
        } else {
          input.value = newVal;
        }
        input.dispatchEvent(new Event('input'));
      }
    };
  });

  document.querySelectorAll('.increase-btn').forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input && !input.disabled) {
        const step = parseFloat(input.getAttribute('step')) || 1;
        const max = parseFloat(input.getAttribute('max'));
        let val = parseFloat(input.value);
        if (isNaN(val)) {
          val = parseFloat(input.placeholder.replace(/[^\d.]/g, '')) || 0;
        }
        let newVal = val + step;
        if (!isNaN(max) && newVal > max) newVal = max;

        if (step % 1 !== 0) {
          input.value = parseFloat(newVal.toFixed(2));
        } else {
          input.value = newVal;
        }
        input.dispatchEvent(new Event('input'));
      }
    };
  });

  // A. Controladores de Síntomas Cardiovascular (Con exclusión mutua de Ninguno)
  const cardioSymptomBtns = document.querySelectorAll('.cardio-symptom-btn');
  cardioSymptomBtns.forEach(btn => {
    btn.onclick = () => {
      const isNone = btn.getAttribute('data-symptom') === 'Ninguno';
      if (isNone) {
        cardioSymptomBtns.forEach(b => {
          if (b.getAttribute('data-symptom') !== 'Ninguno') {
            b.classList.remove('btn-glass-primary');
            b.classList.add('btn-glass-secondary');
            b.style.background = '';
            b.style.borderColor = '';
          }
        });
        btn.className = 'btn btn-glass-success flex-fill py-2 cardio-symptom-btn active-symptom-none input-btn';
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      } else {
        const noneBtn = document.querySelector('#cardioSymptomsContainer .active-symptom-none');
        if (noneBtn) {
          noneBtn.className = 'btn btn-glass-secondary flex-fill py-2 cardio-symptom-btn active-symptom-none input-btn';
          noneBtn.style.background = '';
          noneBtn.style.borderColor = '';
        }
        if (btn.classList.contains('btn-glass-secondary')) {
          btn.classList.remove('btn-glass-secondary');
          btn.classList.add('btn-glass-primary');
          btn.style.background = 'rgba(14, 165, 233, 0.25)';
          btn.style.borderColor = 'rgba(14, 165, 233, 0.4)';
        } else {
          btn.classList.remove('btn-glass-primary');
          btn.classList.add('btn-glass-secondary');
          btn.style.background = '';
          btn.style.borderColor = '';
        }
      }
    };
  });

  // B. Controladores de Síntomas Diabetes (Con exclusión mutua de Ninguno)
  const diabetesSymptomBtns = document.querySelectorAll('.diabetes-symptom-btn');
  diabetesSymptomBtns.forEach(btn => {
    btn.onclick = () => {
      const isNone = btn.getAttribute('data-symptom') === 'Ninguno';
      if (isNone) {
        diabetesSymptomBtns.forEach(b => {
          if (b.getAttribute('data-symptom') !== 'Ninguno') {
            b.classList.remove('btn-glass-primary');
            b.classList.add('btn-glass-secondary');
            b.style.background = '';
            b.style.borderColor = '';
          }
        });
        btn.className = 'btn btn-glass-success flex-fill py-2 diabetes-symptom-btn active-symptom-none input-btn';
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      } else {
        const noneBtn = document.querySelector('#diabetesSymptomsContainer .active-symptom-none');
        if (noneBtn) {
          noneBtn.className = 'btn btn-glass-secondary flex-fill py-2 diabetes-symptom-btn active-symptom-none input-btn';
          noneBtn.style.background = '';
          noneBtn.style.borderColor = '';
        }
        if (btn.classList.contains('btn-glass-secondary')) {
          btn.classList.remove('btn-glass-secondary');
          btn.classList.add('btn-glass-primary');
          btn.style.background = 'rgba(14, 165, 233, 0.25)';
          btn.style.borderColor = 'rgba(14, 165, 233, 0.4)';
        } else {
          btn.classList.remove('btn-glass-primary');
          btn.classList.add('btn-glass-secondary');
          btn.style.background = '';
          btn.style.borderColor = '';
        }
      }
    };
  });

  const moodEmojis = document.querySelectorAll('.mood-emoji');
  let selectedMood = 'Alegre';
  moodEmojis.forEach(emoji => {
    emoji.style.textShadow = 'none';
    emoji.onclick = () => {
      selectedMood = emoji.getAttribute('data-mood');
      moodEmojis.forEach(e => {
        e.classList.remove('text-white');
        e.classList.add('text-white-50');
        e.style.textShadow = 'none';
      });
      emoji.classList.remove('text-white-50');
      emoji.classList.add('text-white');
      emoji.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)';
    };
  });

  // Guardar cambios del formulario diario
  const diaryForm = document.getElementById('diaryForm');
  if (diaryForm) {
    diaryForm.onsubmit = (e) => {
      e.preventDefault();

      const payload = {
        patientId: activePatient.id,
        patientName: activePatient.name,
        date: document.getElementById('reportDate').value,
        timestamp: new Date().toISOString(),
        cardiovascular: {},
        diabetes: {},
        respiratory: {},
        renal: {},
        transversal: {}
      };

      if (activePatient.hasCondition('HYPERTENSION')) {
        const activeCardioSymptoms = [];
        document.querySelectorAll('.cardio-symptom-btn').forEach(b => {
          if (b.classList.contains('btn-glass-primary') || b.classList.contains('btn-glass-success')) {
            activeCardioSymptoms.push(b.getAttribute('data-symptom'));
          }
        });
        payload.cardiovascular = {
          systolic: parseInt(document.getElementById('bpSystolic').value),
          diastolic: parseInt(document.getElementById('bpDiastolic').value),
          heartRate: parseInt(document.getElementById('heartRate').value),
          edema: document.getElementById('cardioEdema').checked,
          symptoms: activeCardioSymptoms
        };
      }

      if (activePatient.hasCondition('DIABETES')) {
        const activeDiabetesSymptoms = [];
        document.querySelectorAll('.diabetes-symptom-btn').forEach(b => {
          if (b.classList.contains('btn-glass-primary') || b.classList.contains('btn-glass-success')) {
            activeDiabetesSymptoms.push(b.getAttribute('data-symptom'));
          }
        });
        payload.diabetes = {
          glucose: parseInt(document.getElementById('glucoseLevel').value),
          moment: document.getElementById('glucoseMoment').value,
          insulin: parseFloat(document.getElementById('insulinDose').value) || 0,
          footCheck: document.getElementById('diabetesFootCheck').checked,
          symptoms: activeDiabetesSymptoms
        };
      }

      if (activePatient.hasCondition('EPOC')) {
        payload.respiratory = {
          spO2: parseInt(document.getElementById('epocSpO2').value),
          respRate: parseInt(document.getElementById('epocRespRate').value),
          oxygenFlow: parseFloat(document.getElementById('epocO2Flow').value) || 0,
          dyspnea: document.getElementById('epocDyspnea').value,
          sputum: document.getElementById('epocSputum').value
        };
      }

      if (activePatient.hasCondition('ERC')) {
        payload.renal = {
          weight: parseFloat(document.getElementById('renalWeight').value),
          diuresis: parseInt(document.getElementById('renalDiuresis').value),
          systolic: parseInt(document.getElementById('renalBpSystolic').value),
          diastolic: parseInt(document.getElementById('renalBpDiastolic').value)
        };
      }

      payload.transversal = {
        medicationAdherence: document.getElementById('transversalMedication').checked,
        pain: parseInt(painLevelSlider.value),
        notes: document.getElementById('caregiverNotes').value
      };

      console.log('--- REGISTRO CLÍNICO DIARIO ENVIADO ---', payload);
      window.showGlassAlert(`¡Reporte clínico de ${activePatient.name} guardado con éxito!`, 'success');

      const btnSubmit = diaryForm.querySelector('button[type="submit"]');
      if (btnSubmit) {
        const originalText = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="bi bi-arrow-repeat spin-animation me-2"></i>Guardando...';
        setTimeout(() => {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = originalText;
        }, 1200);
      }
    };
  }
}

// --- INITIALIZE CUSTOM SELECTS (GLASSKIT) ---
function initCustomSelects() {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('.form-select').forEach(select => {
    if (select.parentNode && select.parentNode.classList.contains('custom-select-wrapper')) return;

    select.style.display = 'none';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper position-relative';

    const trigger = document.createElement('div');
    trigger.className = 'form-select custom-select-trigger d-flex justify-content-between align-items-center';
    trigger.style.cursor = 'pointer';

    const triggerText = document.createElement('span');
    const selectedOption = select.options[select.selectedIndex];
    triggerText.textContent = selectedOption ? selectedOption.textContent : '';
    trigger.appendChild(triggerText);

    const arrow = document.createElement('i');
    arrow.className = 'bi bi-chevron-down ms-2 text-white';
    arrow.style.transition = 'transform 0.2s ease';
    trigger.appendChild(arrow);

    wrapper.appendChild(trigger);

    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown glass-card position-absolute w-100 mt-1 d-none p-2';
    dropdown.style.zIndex = '1050';

    Array.from(select.options).forEach((option, index) => {
      const item = document.createElement('div');
      item.className = 'custom-select-option px-3 py-2 rounded-2 mb-1';
      if (index === select.options.length - 1) {
        item.className = 'custom-select-option px-3 py-2 rounded-2';
      }
      item.textContent = option.textContent;

      if (index === select.selectedIndex) {
        item.classList.add('active');
      }

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        select.selectedIndex = index;
        select.dispatchEvent(new Event('change', { bubbles: true }));

        triggerText.textContent = option.textContent;

        dropdown.querySelectorAll('.custom-select-option').forEach((opt, idx) => {
          if (idx === index) {
            opt.classList.add('active');
          } else {
            opt.classList.remove('active');
          }
        });

        dropdown.classList.add('d-none');
        arrow.style.transform = 'rotate(0deg)';
      });

      dropdown.appendChild(item);
    });

    wrapper.appendChild(dropdown);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !dropdown.classList.contains('d-none');
      document.querySelectorAll('.custom-select-dropdown').forEach(d => d.classList.add('d-none'));
      document.querySelectorAll('.custom-select-trigger i').forEach(a => a.style.transform = 'rotate(0deg)');

      if (!isOpen) {
        dropdown.classList.remove('d-none');
        arrow.style.transform = 'rotate(180deg)';
      }
    });

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-dropdown').forEach(d => d.classList.add('d-none'));
    document.querySelectorAll('.custom-select-trigger i').forEach(a => a.style.transform = 'rotate(0deg)');
  });
}

// --- RELOJ MÓDULO ---
function updateZorinClock() {
  const clockEl = document.getElementById('zorinClock');
  if (!clockEl) return;
  const now = new Date();
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const dayName = days[now.getDay()];
  const dayNum = now.getDate();
  const monthName = months[now.getMonth()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  clockEl.textContent = `${dayName} ${dayNum} de ${monthName} ${hours}:${minutes}`;
}
setInterval(updateZorinClock, 1000);

// --- SEGUIMIENTO DE MOUSE ---
let orbFrameId = null;
document.addEventListener('mousemove', function (e) {
  if (orbFrameId) cancelAnimationFrame(orbFrameId);
  orbFrameId = requestAnimationFrame(() => {
    const orb = document.getElementById('ambient-orb');
    if (orb) {
      orb.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }
  });
});

// Lanzar Login por defecto
let patientTempVitals = null;

// --- VISTA 3: PORTAL DE PACIENTE ---
function renderPatientView(container) {
  if (!patientTempVitals || patientTempVitals.patientId !== activePatient.id) {
    patientTempVitals = {
      patientId: activePatient.id,
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
      glucose: 95,
      insulin: 2.5,
      spO2: 96,
      respRate: 16,
      weight: activePatient.weight,
      diuresis: 1200,
      medication: true,
      pain: 0,
      hasSubmittedToday: false
    };
  }

  // Encontrar cuidador del paciente activo
  const caregiver = CAREGIVERS_DATABASE.find(c => c.assignedPatientId === activePatient.id);
  const caregiverText = caregiver ? `${caregiver.name}` : 'Sin cuidador asignado';
  const caregiverRelation = caregiver ? (activePatient.id === 'p1' ? 'Hija' : activePatient.id === 'p2' ? 'Hijo' : 'Cónyuge') : '';
  const caregiverPhone = caregiver ? activePatient.emergencyContact.phone : '';

  // Determinar el mensaje motivacional según su condición
  let alertMessage = '¡Todo va excelente hoy! Mantén una alimentación baja en sodio y descansa adecuadamente.';
  let conditionText = '';

  if (activePatient.hasCondition('HYPERTENSION')) {
    conditionText = 'Hipertensión Arterial';
    alertMessage = '¡Hola! Recuerda reducir el consumo de sal hoy y beber al menos 2 litros de agua.';
  } else if (activePatient.hasCondition('DIABETES')) {
    conditionText = 'Diabetes Mellitus';
    alertMessage = 'Recuerda medir tu glucosa capilar antes de las comidas y registrar tus dosis de insulina.';
  } else if (activePatient.hasCondition('EPOC')) {
    conditionText = 'EPOC / Asma';
    alertMessage = 'Mantente abrigado/a, evita corrientes de aire frío y vigila tu nivel de saturación de oxígeno.';
  } else if (activePatient.hasCondition('ERC')) {
    conditionText = 'Enfermedad Renal Crónica';
    alertMessage = 'Recuerda controlar tu peso cada mañana y limitar la ingesta diaria de líquidos según lo indicado.';
  } else {
    conditionText = 'Monitoreo General de Bienestar';
  }

  // Generar tarjetas de signos vitales (Mock con valores de referencia premium)
  let vitalsHTML = '';
  if (activePatient.hasCondition('HYPERTENSION') || activePatient.hasCondition('ERC')) {
    vitalsHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4 text-center h-100 position-relative overflow-hidden" style="border-radius: 16px;">
          <div class="position-absolute top-0 end-0 p-3 opacity-10"><i class="bi bi-heart-pulse-fill fs-1"></i></div>
          <span class="badge bg-primary bg-opacity-25 text-primary rounded-pill px-3 py-1 mb-2" style="font-size: 0.75rem;">Presión Arterial</span>
          <h2 class="fw-extrabold m-0 text-white" style="font-family: 'Outfit';">${patientTempVitals.systolic}/${patientTempVitals.diastolic} <span class="fs-6 fw-normal text-white-50">mmHg</span></h2>
          <p class="small text-success mt-2 mb-0"><i class="bi bi-check-circle-fill me-1"></i>Estado: ${patientTempVitals.systolic < 135 ? 'Óptimo' : 'Elevado'}</p>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4 text-center h-100 position-relative overflow-hidden" style="border-radius: 16px;">
          <div class="position-absolute top-0 end-0 p-3 opacity-10"><i class="bi bi-activity fs-1"></i></div>
          <span class="badge bg-danger bg-opacity-25 text-danger rounded-pill px-3 py-1 mb-2" style="font-size: 0.75rem;">Pulso / Frecuencia</span>
          <h2 class="fw-extrabold m-0 text-white" style="font-family: 'Outfit';">${patientTempVitals.heartRate} <span class="fs-6 fw-normal text-white-50">BPM</span></h2>
          <p class="small text-success mt-2 mb-0"><i class="bi bi-check-circle-fill me-1"></i>Estado: Normal</p>
        </div>
      </div>
    `;
  }
  if (activePatient.hasCondition('DIABETES')) {
    vitalsHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4 text-center h-100 position-relative overflow-hidden" style="border-radius: 16px;">
          <div class="position-absolute top-0 end-0 p-3 opacity-10"><i class="bi bi-droplet-fill fs-1"></i></div>
          <span class="badge bg-info bg-opacity-25 text-info rounded-pill px-3 py-1 mb-2" style="font-size: 0.75rem;">Glucemia Capilar</span>
          <h2 class="fw-extrabold m-0 text-white" style="font-family: 'Outfit';">${patientTempVitals.glucose} <span class="fs-6 fw-normal text-white-50">mg/dL</span></h2>
          <p class="small text-success mt-2 mb-0"><i class="bi bi-check-circle-fill me-1"></i>Estado: Estable (Ayuno)</p>
        </div>
      </div>
    `;
  }
  if (activePatient.hasCondition('EPOC')) {
    vitalsHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4 text-center h-100 position-relative overflow-hidden" style="border-radius: 16px;">
          <div class="position-absolute top-0 end-0 p-3 opacity-10"><i class="bi bi-wind fs-1"></i></div>
          <span class="badge bg-warning bg-opacity-25 text-warning rounded-pill px-3 py-1 mb-2" style="font-size: 0.75rem;">Saturación SpO2</span>
          <h2 class="fw-extrabold m-0 text-white" style="font-family: 'Outfit';">${patientTempVitals.spO2} <span class="fs-6 fw-normal text-white-50">%</span></h2>
          <p class="small text-success mt-2 mb-0"><i class="bi bi-check-circle-fill me-1"></i>Estado: Adecuado</p>
        </div>
      </div>
    `;
  }
  if (activePatient.hasCondition('ERC')) {
    vitalsHTML += `
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4 text-center h-100 position-relative overflow-hidden" style="border-radius: 16px;">
          <div class="position-absolute top-0 end-0 p-3 opacity-10"><i class="bi bi-scale fs-1"></i></div>
          <span class="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-1 mb-2" style="font-size: 0.75rem;">Peso Reciente</span>
          <h2 class="fw-extrabold m-0 text-white" style="font-family: 'Outfit';">${patientTempVitals.weight} <span class="fs-6 fw-normal text-white-50">kg</span></h2>
          <p class="small text-success mt-2 mb-0"><i class="bi bi-check-circle-fill me-1"></i>Estado: Estable</p>
        </div>
      </div>
    `;
  }

  if (vitalsHTML === '') {
    vitalsHTML = `
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4 text-center h-100 position-relative overflow-hidden" style="border-radius: 16px;">
          <div class="position-absolute top-0 end-0 p-3 opacity-10"><i class="bi bi-emoji-smile fs-1"></i></div>
          <span class="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-1 mb-2" style="font-size: 0.75rem;">Bienestar General</span>
          <h2 class="fw-extrabold m-0 text-white" style="font-family: 'Outfit';">Excelente</h2>
          <p class="small text-success mt-2 mb-0"><i class="bi bi-check-circle-fill me-1"></i>Adherencia: 100%</p>
        </div>
      </div>
    `;
  }

  // Generar formulario de autoreporte según su condición
  let selfReportFormHTML = '';
  if (!patientTempVitals.hasSubmittedToday) {
    let formFieldsHTML = '';

    if (activePatient.hasCondition('HYPERTENSION')) {
      formFieldsHTML += `
        <div class="col-md-6 col-lg-4">
          <label class="form-label small text-white-50">Presión Sistólica (mmHg)</label>
          <div class="input-group">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.dispatchEvent(new Event('change'))">-</button>
            <input type="number" id="selfSystolic" class="form-control text-center text-white border-light border-opacity-10" value="${patientTempVitals.systolic}" min="70" max="210" style="background: rgba(255,255,255,0.05); font-size: 1.15rem; font-weight: bold;">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.dispatchEvent(new Event('change'))">+</button>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <label class="form-label small text-white-50">Presión Diastólica (mmHg)</label>
          <div class="input-group">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.dispatchEvent(new Event('change'))">-</button>
            <input type="number" id="selfDiastolic" class="form-control text-center text-white border-light border-opacity-10" value="${patientTempVitals.diastolic}" min="40" max="130" style="background: rgba(255,255,255,0.05); font-size: 1.15rem; font-weight: bold;">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.dispatchEvent(new Event('change'))">+</button>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <label class="form-label small text-white-50">Pulso / Frecuencia (BPM)</label>
          <div class="input-group">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.dispatchEvent(new Event('change'))">-</button>
            <input type="number" id="selfHeartRate" class="form-control text-center text-white border-light border-opacity-10" value="${patientTempVitals.heartRate}" min="40" max="180" style="background: rgba(255,255,255,0.05); font-size: 1.15rem; font-weight: bold;">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.dispatchEvent(new Event('change'))">+</button>
          </div>
        </div>
      `;
    }

    if (activePatient.hasCondition('DIABETES')) {
      formFieldsHTML += `
        <div class="col-md-6 col-lg-4">
          <label class="form-label small text-white-50">Glucemia Capilar (mg/dL)</label>
          <div class="input-group">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.dispatchEvent(new Event('change'))">-</button>
            <input type="number" id="selfGlucose" class="form-control text-center text-white border-light border-opacity-10" value="${patientTempVitals.glucose}" min="30" max="400" style="background: rgba(255,255,255,0.05); font-size: 1.15rem; font-weight: bold;">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.dispatchEvent(new Event('change'))">+</button>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <label class="form-label small text-white-50">Dosis Insulina (UI)</label>
          <div class="input-group">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="const input = this.nextElementSibling; input.value = Math.max(0, (parseFloat(input.value) - 0.5).toFixed(1)); input.dispatchEvent(new Event('change'))">-</button>
            <input type="number" id="selfInsulin" class="form-control text-center text-white border-light border-opacity-10" value="${patientTempVitals.insulin}" step="0.5" min="0" max="50" style="background: rgba(255,255,255,0.05); font-size: 1.15rem; font-weight: bold;">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="const input = this.previousElementSibling; input.value = (parseFloat(input.value) + 0.5).toFixed(1); input.dispatchEvent(new Event('change'))">+</button>
          </div>
        </div>
      `;
    }

    if (activePatient.hasCondition('EPOC')) {
      formFieldsHTML += `
        <div class="col-md-6 col-lg-4">
          <label class="form-label small text-white-50">Saturación SpO2 (%)</label>
          <div class="input-group">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.dispatchEvent(new Event('change'))">-</button>
            <input type="number" id="selfSpO2" class="form-control text-center text-white border-light border-opacity-10" value="${patientTempVitals.spO2}" min="70" max="100" style="background: rgba(255,255,255,0.05); font-size: 1.15rem; font-weight: bold;">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.dispatchEvent(new Event('change'))">+</button>
          </div>
        </div>
      `;
    }

    if (activePatient.hasCondition('ERC')) {
      formFieldsHTML += `
        <div class="col-md-6 col-lg-4">
          <label class="form-label small text-white-50">Peso Diario (kg)</label>
          <div class="input-group">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="const input = this.nextElementSibling; input.value = Math.max(30, (parseFloat(input.value) - 0.1).toFixed(1)); input.dispatchEvent(new Event('change'))">-</button>
            <input type="number" id="selfWeight" class="form-control text-center text-white border-light border-opacity-10" value="${patientTempVitals.weight}" step="0.1" style="background: rgba(255,255,255,0.05); font-size: 1.15rem; font-weight: bold;">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="const input = this.previousElementSibling; input.value = (parseFloat(input.value) + 0.1).toFixed(1); input.dispatchEvent(new Event('change'))">+</button>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <label class="form-label small text-white-50">Diuresis (ml)</label>
          <div class="input-group">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.nextElementSibling.stepDown(50); this.nextElementSibling.dispatchEvent(new Event('change'))">-</button>
            <input type="number" id="selfDiuresis" class="form-control text-center text-white border-light border-opacity-10" value="${patientTempVitals.diuresis}" step="50" min="0" max="5000" style="background: rgba(255,255,255,0.05); font-size: 1.15rem; font-weight: bold;">
            <button type="button" class="btn btn-glass-secondary py-1" onclick="this.previousElementSibling.stepUp(50); this.previousElementSibling.dispatchEvent(new Event('change'))">+</button>
          </div>
        </div>
      `;
    }

    formFieldsHTML += `
      <div class="col-md-6 col-lg-4 d-flex align-items-center">
        <div class="form-check form-switch pt-4">
          <input class="form-check-input" type="checkbox" id="selfMedication" ${patientTempVitals.medication ? 'checked' : ''} style="cursor: pointer; width: 45px; height: 22px;">
          <label class="form-check-label small text-white-50 ms-2" for="selfMedication" style="padding-top: 2px;">¿Tomé mis medicamentos?</label>
        </div>
      </div>
    `;

    selfReportFormHTML = `
      <div class="col-12 mt-2 mb-2">
        <div class="glass-card p-4" style="border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);">
          <h5 class="fw-bold mb-3" style="font-family: 'Outfit';">
            <i class="bi bi-file-earmark-medical-fill text-primary me-2"></i>Llevar mi Propio Control
          </h5>
          <p class="small text-white-50 mb-4">Ingresa tus datos personales de hoy. Se enviarán directamente al historial de tu cuidadora.</p>
          <form id="patientSelfReportForm">
            <div class="row g-3 align-items-end">
              ${formFieldsHTML}
              <div class="col-12 mt-4 text-end">
                <button type="submit" class="btn btn-glass-primary px-4 py-2" style="border-radius: 12px; font-weight: 600;">
                  <i class="bi bi-check-circle-fill me-2"></i>Guardar mi Reporte
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  } else {
    selfReportFormHTML = `
      <div class="col-12 mt-2 mb-2">
        <div class="glass-card p-4 text-center border-success" style="border-radius: 16px; background: rgba(16, 185, 129, 0.05) !important;">
          <i class="bi bi-shield-check text-success fs-2 mb-2"></i>
          <h6 class="fw-bold text-success">¡Control Diario Completado!</h6>
          <p class="small text-white-50 mb-0">Ya ingresaste tus autoreportes de hoy. Tu cuidadora ha recibido la actualización en tiempo real.</p>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="container-fluid px-4 py-4 text-white">
      <!-- Fila 1: Bienvenida -->
      <div class="glass-card p-4 mb-4 text-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;">
        <div>
          <h2 class="fw-bold mb-1" style="font-family: 'Outfit';">¡Hola, ${activePatient.name}! 👋</h2>
          <p class="text-white-50 m-0">Aquí tienes un resumen simple de tu estado de salud y cuidados.</p>
        </div>
        <div>
          <span class="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill" style="font-size: 0.85rem;">
            <i class="bi bi-shield-fill-check me-2 text-primary"></i>Perfil Paciente Activo
          </span>
        </div>
      </div>

      <!-- Fila 2: Alertas y Mensajes del Día -->
      <div class="glass-card p-4 mb-4" style="background: rgba(14, 165, 233, 0.1) !important; border: 1px solid rgba(14, 165, 233, 0.25) !important; border-radius: 16px;">
        <div class="d-flex align-items-center gap-3">
          <i class="bi bi-chat-heart-fill text-primary fs-3"></i>
          <div>
            <h6 class="fw-bold m-0 text-primary" style="font-size: 1rem;">Recomendación para tu salud hoy:</h6>
            <p class="small text-white text-opacity-80 m-0 mt-1">${alertMessage}</p>
          </div>
        </div>
      </div>

      <!-- Fila 3: Signos Vitales -->
      <div class="row g-4 mb-4">
        <div class="col-12">
          <h5 class="fw-bold mb-3" style="font-family: 'Outfit';"><i class="bi bi-activity text-primary me-2"></i>Mis Signos Vitales de Hoy</h5>
          <div class="row g-3">
            ${vitalsHTML}
          </div>
        </div>
      </div>

      <!-- Fila 4: Formulario de Autoreporte -->
      <div class="row g-4 mb-4">
        ${selfReportFormHTML}
      </div>

      <div class="row g-4">
        <!-- Columna Izquierda: Información de Contacto del Cuidador -->
        <div class="col-lg-6">
          <div class="glass-card p-4 h-100" style="border-radius: 16px;">
            <h5 class="fw-bold mb-3 text-white border-bottom border-light border-opacity-10 pb-2" style="font-family: 'Outfit';">
              <i class="bi bi-people-fill text-info me-2"></i>Mi Equipo de Cuidado
            </h5>
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="d-flex justify-content-center align-items-center rounded-circle" style="width: 54px; height: 54px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255,255,255,0.15);">
                <i class="bi bi-person-fill text-info fs-3"></i>
              </div>
              <div>
                <h6 class="fw-bold m-0">${caregiverText} ${caregiverRelation ? `(${caregiverRelation})` : ''}</h6>
                <p class="small text-white-50 m-0">Emergencia / Contacto directo</p>
              </div>
            </div>
            ${caregiverPhone ? `
            <div class="d-flex gap-2">
              <a href="tel:${caregiverPhone}" class="btn btn-glass-secondary flex-grow-1 py-2.5 d-flex align-items-center justify-content-center gap-2" style="border-radius: 12px; font-weight: 500;">
                <i class="bi bi-telephone-fill"></i> Llamar
              </a>
              <a href="https://wa.me/${caregiverPhone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-glass-success flex-grow-1 py-2.5 d-flex align-items-center justify-content-center gap-2" style="border-radius: 12px; font-weight: 500;">
                <i class="bi bi-whatsapp"></i> WhatsApp
              </a>
            </div>
            ` : `
            <p class="small text-white-50 mb-0">No hay teléfono de emergencia registrado.</p>
            `}
          </div>
        </div>

        <!-- Columna Derecha: Reporte de Estado de Ánimo del Paciente -->
        <div class="col-lg-6">
          <div class="glass-card p-4 h-100" style="border-radius: 16px;">
            <h5 class="fw-bold mb-3 text-white border-bottom border-light border-opacity-10 pb-2" style="font-family: 'Outfit';">
              <i class="bi bi-emoji-laughing text-warning me-2"></i>¿Cómo te sientes hoy?
            </h5>
            <p class="small text-white-50 mb-4">Hazle saber a tu cuidador tu estado de ánimo con un solo toque.</p>
            
            <div class="d-flex justify-content-around gap-2 mb-4">
              <button class="btn btn-glass-secondary rounded-3 p-3 flex-grow-1 text-center border border-white border-opacity-10" id="moodBtnGood" style="transition: all 0.3s ease;">
                <div style="font-size: 2.25rem;" class="mb-1">😃</div>
                <div class="small fw-semibold">Muy bien</div>
              </button>
              <button class="btn btn-glass-secondary rounded-3 p-3 flex-grow-1 text-center border border-white border-opacity-10" id="moodBtnNeutral" style="transition: all 0.3s ease;">
                <div style="font-size: 2.25rem;" class="mb-1">😐</div>
                <div class="small fw-semibold">Regular</div>
              </button>
              <button class="btn btn-glass-secondary rounded-3 p-3 flex-grow-1 text-center border border-white border-opacity-10" id="moodBtnBad" style="transition: all 0.3s ease;">
                <div style="font-size: 2.25rem;" class="mb-1">😟</div>
                <div class="small fw-semibold">Cansado/a</div>
              </button>
            </div>

            <!-- Panel de retroalimentación de estado de ánimo -->
            <div id="moodFeedbackArea" class="glass-card p-3 d-none text-center" style="border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
              <p class="small m-0 text-white-50" id="moodFeedbackText"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Registrar listeners de estado de ánimo
  const moodBtnGood = document.getElementById('moodBtnGood');
  const moodBtnNeutral = document.getElementById('moodBtnNeutral');
  const moodBtnBad = document.getElementById('moodBtnBad');
  const moodFeedbackArea = document.getElementById('moodFeedbackArea');
  const moodFeedbackText = document.getElementById('moodFeedbackText');

  const highlightMoodBtn = (selectedBtn) => {
    [moodBtnGood, moodBtnNeutral, moodBtnBad].forEach(btn => {
      btn.style.background = 'rgba(255, 255, 255, 0.05)';
      btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });
    selectedBtn.style.background = 'rgba(14, 165, 233, 0.2)';
    selectedBtn.style.borderColor = 'rgba(14, 165, 233, 0.4)';
    moodFeedbackArea.classList.remove('d-none');
  };

  moodBtnGood.onclick = () => {
    highlightMoodBtn(moodBtnGood);
    window.showGlassAlert('¡Estado de ánimo registrado! ' + caregiverText + ' ha sido notificada.', 'success');
    moodFeedbackText.innerHTML = '<i class="bi bi-heart-fill text-danger me-2"></i><strong>¡Qué alegría!</strong> Sigue cuidándote y recuerda tomar tus medicamentos a la hora.';
  };

  moodBtnNeutral.onclick = () => {
    highlightMoodBtn(moodBtnNeutral);
    window.showGlassAlert('¡Estado de ánimo registrado! ' + caregiverText + ' ha sido notificada.', 'info');
    moodFeedbackText.innerHTML = '<i class="bi bi-info-circle-fill text-info me-2"></i>Tómate el día con tranquilidad. Tu equipo de cuidado está atento a ti.';
  };

  moodBtnBad.onclick = () => {
    highlightMoodBtn(moodBtnBad);
    window.showGlassAlert('Aviso enviado a tu cuidador. Se pondrá en contacto pronto.', 'warning');
    moodFeedbackText.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>Hemos enviado un mensaje de alerta a ' + caregiverText + '. Ella se comunicará contigo pronto.';
  };

  // Registrar listeners del formulario de autoreporte
  const selfReportForm = document.getElementById('patientSelfReportForm');
  if (selfReportForm) {
    selfReportForm.onsubmit = (e) => {
      e.preventDefault();

      // Leer valores según condición
      if (activePatient.hasCondition('HYPERTENSION')) {
        patientTempVitals.systolic = parseInt(document.getElementById('selfSystolic').value);
        patientTempVitals.diastolic = parseInt(document.getElementById('selfDiastolic').value);
        patientTempVitals.heartRate = parseInt(document.getElementById('selfHeartRate').value);
      }
      if (activePatient.hasCondition('DIABETES')) {
        patientTempVitals.glucose = parseInt(document.getElementById('selfGlucose').value);
        patientTempVitals.insulin = parseFloat(document.getElementById('selfInsulin').value);
      }
      if (activePatient.hasCondition('EPOC')) {
        patientTempVitals.spO2 = parseInt(document.getElementById('selfSpO2').value);
      }
      if (activePatient.hasCondition('ERC')) {
        patientTempVitals.weight = parseFloat(document.getElementById('selfWeight').value);
        patientTempVitals.diuresis = parseInt(document.getElementById('selfDiuresis').value);
      }

      patientTempVitals.medication = document.getElementById('selfMedication').checked;
      patientTempVitals.hasSubmittedToday = true;

      window.showGlassAlert('¡Tu autoreporte clínico ha sido guardado y enviado!', 'success');

      // Re-renderizar la vista para actualizar las tarjetas y mostrar el estado completado
      renderPatientView(container);
    };
  }
}

renderLogin();
