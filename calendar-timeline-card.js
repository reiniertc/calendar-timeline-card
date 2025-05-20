// calendar-timeline-card-editor.js met dynamisch agenda beheer
class CalendarTimelineCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  getConfig() {
    return this._config;
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
      .card {
        padding: 16px;
      }
      .calendar {
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 12px;
        padding: 8px;
      }
      .calendar h4 {
        margin: 0 0 8px;
      }
      .inline {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      .inline > * {
        flex: 1;
      }
      button {
        margin-top: 8px;
      }
    `;
    this.shadowRoot.appendChild(style);

    const card = document.createElement('div');
    card.className = 'card';

    const general = document.createElement('div');
    general.innerHTML = `
      <div class="inline">
        <label>Dagen: <input type="number" name="days" value="${this._config.days || 1}"></label>
        <label>Start uur: <input type="number" name="start_hour" value="${this._config.start_hour || 7}"></label>
        <label>Eind uur: <input type="number" name="end_hour" value="${this._config.end_hour || 22}"></label>
      </div>
      <div class="inline">
        <label>Pixels/min: <input type="number" name="pixel_per_minute" value="${this._config.pixel_per_minute || 1}" step="0.1"></label>
        <label>Lettergrootte: <input type="number" name="font_size" value="${this._config.font_size || 1}" step="0.1"></label>
        <label>Rand (px): <input type="number" name="border_width" value="${this._config.border_width || 0}"></label>
        <label>Hoek (px): <input type="number" name="border_radius" value="${this._config.border_radius || 4}"></label>
      </div>
      <div>
        <label><input type="checkbox" name="show_date" ${this._config.show_date ? 'checked' : ''}> Toon datum</label>
        <label><input type="checkbox" name="show_names" ${this._config.show_names ? 'checked' : ''}> Toon naam</label>
        <label><input type="checkbox" name="show_start_time" ${this._config.show_start_time ? 'checked' : ''}> Toon starttijd</label>
        <label><input type="checkbox" name="show_end_time" ${this._config.show_end_time ? 'checked' : ''}> Toon eindtijd</label>
      </div>
    `;
    card.appendChild(general);

    const calendars = this._config.calendars || [];

    calendars.forEach((cal, index) => {
      const calDiv = document.createElement('div');
      calDiv.className = 'calendar';
      calDiv.innerHTML = `
        <h4>Agenda ${index + 1}</h4>
        <div class="inline">
          <label>Naam: <input type="text" name="name" value="${cal.name || ''}" data-index="${index}" data-field="name"></label>
          <label>Kleur: <input type="color" name="color" value="${cal.color || '#81c784'}" data-index="${index}" data-field="color"></label>
        </div>
        <label>Prefix: <input type="text" name="prefix" value="${cal.prefix || ''}" data-index="${index}" data-field="prefix"></label>
        <button type="button" data-remove="${index}">Verwijder</button>
      `;
      card.appendChild(calDiv);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '➕ Agenda toevoegen';
    addBtn.addEventListener('click', () => {
      this._config.calendars = [...(this._config.calendars || []), { name: '', color: '#81c784', prefix: '' }];
      this._fireChange();
      this.render();
    });
    card.appendChild(addBtn);

    card.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', ev => {
        const el = ev.target;
        if (el.dataset.index !== undefined) {
          const i = parseInt(el.dataset.index);
          const field = el.dataset.field;
          this._config.calendars[i][field] = el.value;
        } else {
          const name = el.name;
          const value = el.type === 'checkbox' ? el.checked : el.value;
          this._config[name] = isNaN(value) || name.startsWith('show') ? value : parseFloat(value);
        }
        this._fireChange();
      });
    });

    card.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.addEventListener('click', ev => {
        const idx = parseInt(ev.target.dataset.remove);
        this._config.calendars.splice(idx, 1);
        this._fireChange();
        this.render();
      });
    });

    this.shadowRoot.appendChild(card);
  }

  _fireChange() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
  }
}

customElements.define('calendar-timeline-card-editor', CalendarTimelineCardEditor);
