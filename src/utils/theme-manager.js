export class ThemeManager {
    static init() {
        // Inicializar con el tema de salud por defecto
        this.setTheme('health');
    }

    static setTheme(themeName) {
        // Mantener 'health' como el único tema activo para cuidApp
        localStorage.setItem('glasskit-theme', 'health');
        const root = document.documentElement.style;

        // Configurar variables base del Glassmorphism (Salud / Clínico)
        root.setProperty('--bg-color', '#060f12');
        root.setProperty('--grad1-color', 'rgba(10, 38, 48, 1)'); // Verde azulado clínico profundo
        root.setProperty('--grad2-color', 'rgba(5, 23, 33, 1)');   // Azul oscuro profundo
        root.setProperty('--grad3-color', 'rgba(8, 18, 25, 1)');   // Gris azulado médico
        root.setProperty('--orb-color', 'rgba(13, 202, 240, 0.15)'); // Orbe turquesa brillante

        // Configurar colores de Bootstrap (Sobrescritos con paleta médica)
        root.setProperty('--bs-primary', '#0ea5e9'); // Azul cielo moderno (Primary)
        root.setProperty('--bs-primary-rgb', '14, 165, 233');
        root.setProperty('--bs-secondary', '#64748b'); // Gris pizarra (Secondary)
        root.setProperty('--bs-secondary-rgb', '100, 116, 139');
        root.setProperty('--bs-success', '#10b981'); // Verde esmeralda para éxitos clínicos (Success)
        root.setProperty('--bs-success-rgb', '16, 185, 129');
        root.setProperty('--bs-warning', '#f59e0b'); // Ámbar de alerta (Warning)
        root.setProperty('--bs-warning-rgb', '245, 158, 11');
        root.setProperty('--bs-danger', '#ef4444'); // Rojo clínico de urgencia (Danger)
        root.setProperty('--bs-danger-rgb', '239, 68, 68');
        root.setProperty('--bs-info', '#06b6d4'); // Turquesa info (Info)
        root.setProperty('--bs-info-rgb', '6, 182, 212');

        // Notificar cambio de tema a otros componentes
        window.dispatchEvent(new CustomEvent('glasskit-theme-changed', {
            detail: { 
                theme: 'health',
                primary: '#0ea5e9',
                secondary: '#64748b',
                success: '#10b981'
            }
        }));

        console.log(`[ThemeManager] Tema configurado por defecto: health (Colores enfocados en salud)`);
    }
}
