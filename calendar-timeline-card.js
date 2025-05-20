// calendar-timeline-card.js met optie voor fontsize van de uren
class CalendarTimelineCard extends HTMLElement {
  setConfig(config) {
    this.config = {
      days: 1,
      offset: 0,
      start_hour: 7,
      end_hour: 20,
      pixel_per_minute: 1,
      font_size: 1.0,
      hour_font_size: '12px',
      border_width: 0,
      border_radius: 4,
      show_date: true,
      show_names: true,
      show_start_time: true,
      show_end_time: false,
      show_hour_lines: false,
      calendars: [],
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this.fetchAndRender();
  }

  fetchAndRender() {
    const events = [];
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() + (this.config.offset || 0));
    const end = new Date(start);
    end.setDate(end.getDate() + this.config.days);

    this.config.calendars.forEach(cal => {
      const prefix = cal.prefix || '';
      Object.keys(this._hass.states).forEach(id => {
        if (id.startsWith(prefix)) {
          const state = this._hass.states[id];
          const attrs = state.attributes;
          if (!attrs.start || !attrs.end) return;

          const startDate = new Date(attrs.start);
          const endDate = new Date(attrs.end);
          if (endDate < start || startDate > end) return;

          const dayOffset = Math.floor((startDate - start) / (24 * 60 * 60 * 1000));
          events.push({
            name: cal.name,
            dayOffset,
            startMinutes: startDate.getHours() * 60 + startDate.getMinutes(),
            endMinutes: endDate.getHours() * 60 + endDate.getMinutes(),
            title: attrs.summary || attrs.message || id,
            color: cal.color || 'var(--accent-color)',
            borderColor: cal.border_color || 'var(--divider-color)',
            startTime: startDate,
            endTime: endDate
          });
        }
      });
    });

    this.render(events);
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  render(events = []) {
    const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        font-family: var(--primary-font-family, sans-serif);
        color: var(--primary-text-color);
      }
      .container {
        display: flex;
        margin-top: 30px;
      }
      .time-column {
        width: 60px;
        padding-right: 5px;
        text-align: right;
        font-size: ${this.config.hour_font_size};
        color: var(--secondary-text-color);
        position: relative;
      }
      .time-column div {
        height: ${60 * this.config.pixel_per_minute}px;
      }
      .calendars {
        flex: 1;
        display: flex;
        gap: 4px;
      }
      .calendar-block {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--divider-color);
      }
      .column-header {
        text-align: center;
        font-size: var(--body-font-size, 12px);
        font-weight: bold;
        height: 30px;
        line-height: 30px;
        background: var(--card-background-color);
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }
      .column {
        position: relative;
        height: ${60 * this.config.pixel_per_minute * (this.config.end_hour - this.config.start_hour)}px;
      }
      .hour-line {
        position: absolute;
        left: 0;
        right: 0;
        border-top: 1px dashed var(--divider-color);
        pointer-events: none;
      }
      .event {
        position: absolute;
        left: 2px;
        right: 2px;
        font-size: ${this.config.font_size}em;
        padding: 4px;
        border-radius: ${this.config.border_radius}px;
        border-width: ${this.config.border_width}px;
        border-style: solid;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        background-color: var(--accent-color);
        line-height: 1.2;
        background-clip: padding-box;
        box-sizing: border-box;
      }
    `;
    shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.className = 'container';

    const timeColumn = document.createElement('div');
    timeColumn.className = 'time-column';
    for (let h = this.config.start_hour; h <= this.config.end_hour; h++) {
      const d = document.createElement('div');
      d.textContent = `${h}:00`;
      timeColumn.appendChild(d);
    }
    wrapper.appendChild(timeColumn);

    const grid = document.createElement('div');
    grid.className = 'calendars';

    for (let d = 0; d < this.config.days; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d + (this.config.offset || 0));
      const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

      this.config.calendars.forEach(cal => {
        const block = document.createElement('div');
        block.className = 'calendar-block';

        const header = document.createElement('div');
        header.className = 'column-header';
        header.textContent = [
          this.config.show_date ? dateStr : '',
          this.config.show_names ? (cal.name || '') : ''
        ].filter(Boolean).join(' — ');
        block.appendChild(header);

        const column = document.createElement('div');
        column.className = 'column';

        if (this.config.show_hour_lines) {
          for (let h = this.config.start_hour; h <= this.config.end_hour; h++) {
            const line = document.createElement('div');
            line.className = 'hour-line';
            line.style.top = `${(h - this.config.start_hour) * 60 * this.config.pixel_per_minute}px`;
            column.appendChild(line);
          }
        }

        block.appendChild(column);
        grid.appendChild(block);
      });
    }

    events.forEach(ev => {
      const colIndex = ev.dayOffset * this.config.calendars.length +
        this.config.calendars.findIndex(c => c.name === ev.name);
      if (colIndex < 0) return;

      const event = document.createElement('div');
      event.className = 'event';
      event.style.top = `${(ev.startMinutes - this.config.start_hour * 60) * this.config.pixel_per_minute}px`;
      event.style.height = `${(ev.endMinutes - ev.startMinutes) * this.config.pixel_per_minute}px`;
      event.style.backgroundColor = ev.color;
      event.style.borderColor = ev.borderColor;

      const start = this.config.show_start_time ? this.formatTime(ev.startTime) : '';
      const end = this.config.show_end_time ? this.formatTime(ev.endTime) : '';
      const timeRange = [start, end].filter(Boolean).join(' – ');

      event.innerHTML = `<div>${ev.title}</div>${timeRange ? `<div><small>${timeRange}</small></div>` : ''}`;

      const col = grid.querySelectorAll('.calendar-block .column')[colIndex];
      if (col) col.appendChild(event);
    });

    wrapper.appendChild(grid);
    shadow.appendChild(wrapper);
  }

  getCardSize() {
    return 12;
  }
}

customElements.define('calendar-timeline-card', CalendarTimelineCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'calendar-timeline-card',
  name: 'Calendar Timeline Card (ical-sensor)',
  description: 'Toont afspraken uit ical-sensor entiteiten als tijdlijn.'
});
