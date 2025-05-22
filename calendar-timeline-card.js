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
      date_font_size: '14px',
      date_format: { weekday: 'short', day: 'numeric', month: 'short' },
      border_width: 0,
      border_radius: 4,
      show_date: true,
      show_names: true,
      show_start_time: true,
      show_end_time: false,
      show_hour_lines: false,
      showalldayevents: true,
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
          const isAllDay = startDate.getHours() === 0 && startDate.getMinutes() === 0 &&
                           endDate.getHours() === 0 && endDate.getMinutes() === 0;

          events.push({
            name: cal.name,
            dayOffset,
            isAllDay,
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

    const maxAllDay = Array.from({ length: this.config.days }, (_, d) =>
      events.filter(e => e.dayOffset === d && e.isAllDay).length
    );
    const maxAllDayCount = Math.max(...maxAllDay, 0);
    const allDayOffsetPx = maxAllDayCount * 34;

    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        font-family: var(--primary-font-family, sans-serif);
        color: var(--primary-text-color);
      }
      .container {
        display: flex;
      }
      .time-column {
        width: 60px;
        padding-right: 5px;
        text-align: right;
        font-size: ${this.config.hour_font_size};
        color: var(--secondary-text-color);
        position: relative;
        margin-top: ${allDayOffsetPx + 30}px;
      }
      .time-column div {
        height: ${60 * this.config.pixel_per_minute}px;
      }
      .calendars {
        flex: 1;
        display: flex;
        gap: 4px;
      }
      .calendar-day {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--divider-color);
      }
      .column-header {
        text-align: center;
        font-size: ${this.config.date_font_size};
        font-weight: bold;
        height: 30px;
        line-height: 30px;
        background: var(--card-background-color);
        border-bottom: 1px solid var(--divider-color);
        color: var(--primary-text-color);
      }
      .allday {
        display: flex;
        flex-direction: column;
        padding: 2px;
        gap: 2px;
        background-color: var(--card-background-color);
      }
      .column {
        position: relative;
        margin-top: ${allDayOffsetPx}px;
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
      .event.allday {
        position: relative;
        height: 30px;
        left: 2px;
        right: 2px;
      }
    `;
    shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.className = 'container';

    const timeColumn = document.createElement('div');
    timeColumn.className = 'time-column';
    for (let h = this.config.start_hour; h <= this.config.end_hour; h++) {
      const div = document.createElement('div');
      div.textContent = `${h}:00`;
      timeColumn.appendChild(div);
    }
    wrapper.appendChild(timeColumn);

    const grid = document.createElement('div');
    grid.className = 'calendars';

    for (let d = 0; d < this.config.days; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d + (this.config.offset || 0));
      const dateStr = new Intl.DateTimeFormat(undefined, this.config.date_format).format(date);

      const block = document.createElement('div');
      block.className = 'calendar-day';

      const header = document.createElement('div');
      header.className = 'column-header';
      header.textContent = this.config.show_date ? dateStr : '';
      block.appendChild(header);

      const allday = document.createElement('div');
      allday.className = 'allday';
      if (this.config.showalldayevents) {
        events.filter(e => e.dayOffset === d && e.isAllDay).forEach(ev => {
          const e = document.createElement('div');
          e.className = 'event allday';
          e.style.backgroundColor = ev.color;
          e.style.borderColor = ev.borderColor;
          e.innerHTML = `<div>${ev.title}</div>`;
          allday.appendChild(e);
        });
      }
      block.appendChild(allday);

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

      const dayEvents = events.filter(e => e.dayOffset === d && !e.isAllDay).sort((a, b) => a.startMinutes - b.startMinutes);
      const slots = [];
      dayEvents.forEach(ev => {
        let placed = false;
        for (const slot of slots) {
          if (!slot.some(e => !(ev.endMinutes <= e.startMinutes || ev.startMinutes >= e.endMinutes))) {
            slot.push(ev);
            placed = true;
            break;
          }
        }
        if (!placed) slots.push([ev]);
      });

      slots.forEach((group, index, arr) => {
        group.forEach(ev => {
          const event = document.createElement('div');
          event.className = 'event';
          event.style.top = `${allDayOffsetPx + (ev.startMinutes - this.config.start_hour * 60) * this.config.pixel_per_minute}px`;
          event.style.height = `${(ev.endMinutes - ev.startMinutes) * this.config.pixel_per_minute}px`;
          event.style.left = `${(index / arr.length) * 100}%`;
          event.style.width = `${100 / arr.length}%`;
          event.style.backgroundColor = ev.color;
          event.style.borderColor = ev.borderColor;

          const start = this.config.show_start_time ? this.formatTime(ev.startTime) : '';
          const end = this.config.show_end_time ? this.formatTime(ev.endTime) : '';
          const timeRange = [start, end].filter(Boolean).join(' – ');

          event.innerHTML = `<div>${ev.title}</div>${timeRange ? `<div><small>${timeRange}</small></div>` : ''}`;
          column.appendChild(event);
        });
      });

      block.appendChild(column);
      grid.appendChild(block);
    }

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
