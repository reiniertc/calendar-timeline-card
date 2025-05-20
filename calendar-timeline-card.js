// calendar-timeline-card.js (met iCal ondersteuning)
class CalendarTimelineCard extends HTMLElement {
  setConfig(config) {
    this.config = {
      days: 1,
      start_hour: 7,
      end_hour: 20,
      pixel_per_minute: 1,
      show_date: true,
      show_names: true,
      calendars: [],
      ...config,
    };
  }

  connectedCallback() {
    this.fetchAndRender();
  }

  async fetchAndRender() {
    const events = [];
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + this.config.days);

    for (const cal of this.config.calendars) {
      try {
        const url = cal.url.replace('webcal://', 'https://');
        const res = await fetch(url);
        const text = await res.text();
        const parsed = this.parseICal(text);
        parsed.forEach(ev => {
          const evStart = new Date(ev.start);
          const evEnd = new Date(ev.end);
          if (evEnd < start || evStart > end) return;

          const dayOffset = Math.floor((evStart - start) / (24 * 60 * 60 * 1000));
          events.push({
            name: cal.name,
            dayOffset,
            startMinutes: evStart.getHours() * 60 + evStart.getMinutes(),
            endMinutes: evEnd.getHours() * 60 + evEnd.getMinutes(),
            title: ev.summary
          });
        });
      } catch (err) {
        console.error('Fout bij ophalen/parsen iCal feed:', cal.url, err);
      }
    }

    this.render(events);
  }

  parseICal(data) {
    const events = [];
    const lines = data.split(/\r?\n/);
    let event = null;
    lines.forEach(line => {
      if (line === 'BEGIN:VEVENT') {
        event = {};
      } else if (line === 'END:VEVENT') {
        if (event?.start && event?.end && event?.summary) events.push(event);
        event = null;
      } else if (event) {
        if (line.startsWith('DTSTART')) {
          const dt = line.split(':')[1];
          event.start = this.parseICalDate(dt);
        } else if (line.startsWith('DTEND')) {
          const dt = line.split(':')[1];
          event.end = this.parseICalDate(dt);
        } else if (line.startsWith('SUMMARY')) {
          event.summary = line.split(':').slice(1).join(':');
        }
      }
    });
    return events;
  }

  parseICalDate(dt) {
    // werkt voor formaat: 20250520T130000Z of 20250520T130000
    const year = parseInt(dt.slice(0, 4));
    const month = parseInt(dt.slice(4, 6)) - 1;
    const day = parseInt(dt.slice(6, 8));
    const hour = parseInt(dt.slice(9, 11));
    const minute = parseInt(dt.slice(11, 13));
    return new Date(Date.UTC(year, month, day, hour, minute));
  }

  render(events = []) {
    const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        font-family: var(--primary-font-family, sans-serif);
      }
      .container {
        display: flex;
      }
      .time-column {
        width: 60px;
        padding-right: 5px;
        text-align: right;
        font-size: 12px;
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
        border-left: 1px solid #ccc;
      }
      .column-header {
        text-align: center;
        font-size: 12px;
        font-weight: bold;
        height: 30px;
        line-height: 30px;
        background: var(--card-background-color);
        position: sticky;
        top: 0;
        z-index: 2;
        border-bottom: 1px solid #ccc;
      }
      .column {
        position: relative;
        height: ${60 * this.config.pixel_per_minute * (this.config.end_hour - this.config.start_hour)}px;
      }
      .event {
        position: absolute;
        left: 2px;
        right: 2px;
        font-size: 11px;
        padding: 2px;
        border-radius: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: black;
        background-color: #b3d1ff;
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
      date.setDate(date.getDate() + d);
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
        block.appendChild(column);

        grid.appendChild(block);
      });
    }

    events.forEach(ev => {
      const colIndex = ev.dayOffset * this.config.calendars.length + this.config.calendars.findIndex(c => c.name === ev.name);
      if (colIndex < 0) return;

      const event = document.createElement('div');
      event.className = 'event';
      event.style.top = `${(ev.startMinutes - this.config.start_hour * 60) * this.config.pixel_per_minute}px`;
      event.style.height = `${(ev.endMinutes - ev.startMinutes) * this.config.pixel_per_minute}px`;
      event.textContent = ev.title;

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
  name: 'Calendar Timeline Card (iCal)',
  description: 'Toont iCal agenda’s in tijdlijnweergave met pixelprecisie.'
});
