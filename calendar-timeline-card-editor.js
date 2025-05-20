// calendar-timeline-card-editor.js
class CalendarTimelineCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    if (this._form) {
      this._form.data = config;
    }
  }

  async connectedCallback() {
    if (!this._form) {
      const form = document.createElement('ha-form');
      form.schema = [
        { name: 'days', selector: { number: { min: 1, max: 14 } } },
        { name: 'start_hour', selector: { number: { min: 0, max: 23 } } },
        { name: 'end_hour', selector: { number: { min: 0, max: 23 } } },
        { name: 'pixel_per_minute', selector: { number: { min: 0.1, max: 10, step: 0.1 } } },
        { name: 'font_size', selector: { number: { min: 0.5, max: 3, step: 0.1 } } },
        { name: 'border_width', selector: { number: { min: 0, max: 5 } } },
        { name: 'border_radius', selector: { number: { min: 0, max: 20 } } },
        { name: 'show_date', selector: { boolean: {} } },
        { name: 'show_names', selector: { boolean: {} } },
        { name: 'show_start_time', selector: { boolean: {} } },
        { name: 'show_end_time', selector: { boolean: {} } },
        {
          name: 'calendars',
          type: 'grid',
          schema: [
            { name: 'name', required: true, selector: { text: {} } },
            { name: 'color', required: true, selector: { color: {} } },
            { name: 'prefix', required: true, selector: { text: {} } },
          ]
        }
      ];

      form.data = this._config || {};
      form.addEventListener('value-changed', (ev) => {
        ev.stopPropagation();
        this._config = ev.detail.value;
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      });

      this._form = form;
      this.appendChild(form);
    }
  }

  getConfig() {
    return this._config;
  }
}

customElements.define('calendar-timeline-card-editor', CalendarTimelineCardEditor);
