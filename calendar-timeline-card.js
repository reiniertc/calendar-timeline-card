// calendar-timeline-card.js
class CalendarTimelineCard extends HTMLElement {
  setConfig(config) {
    this.config = {
      days: 1,
      start_hour: 7,
      end_hour: 20,
      calendars: [],
      ...config,
    };
  }

  connectedCallback() {
    this.render();
  }

  render(events = []) {
    try {
      const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
      shadow.innerHTML = '';

      const style = document.createElement('style');
      style.textContent = `
        :host {
          all: initial;
        }
        .timeline {
          display: grid;
          grid-template-columns: 80px repeat(${this.config.calendars.length * this.config.days}, 1fr);
          grid-auto-rows: 40px;
          font-family: var(--primary-font-family, sans-serif);
          background: var(--card-background-color, #fff);
        }
        .timeline > div {
          box-sizing: border-box;
          height: 40px;
          display: flex;
          align-items: center;
        }
        .time {
          text-align: right;
          padding-right: 8px;
          border-bottom: 1px solid #ddd;
          font-size: 12px;
          background: var(--card-background-color, #fff);
          position: sticky;
          left: 0;
          z-index: 2;
          height: 40px;
          line-height: 40px;
        }
        .event {
          border: 1px solid #999;
          margin: 2px;
          padding: 4px;
          font-size: 12px;
          color: #000;
          display: flex;
          align-items: center;
          background-color: #b3d1ff;
        }
        .column {
          border-left: 1px solid #ccc;
          height: 40px;
        }
        .header {
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          border-bottom: 1px solid #ccc;
          background: var(--card-background-color, #fff);
          position: sticky;
          top: 0;
          z-index: 3;
        }
      `;
      shadow.appendChild(style);

      const container = document.createElement('div');
      container.className = 'timeline';

      const headerSpacer = document.createElement('div');
      container.appendChild(headerSpacer);

      for (let d = 0; d < this.config.days; d++) {
        const dayLabel = new Date();
        dayLabel.setDate(dayLabel.getDate() + d);
        const dateString = dayLabel.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

        this.config.calendars.forEach((cal, idx) => {
          const header = document.createElement('div');
          header.className = 'header';
          header.textContent = `${dateString} (${idx + 1})`;
          container.appendChild(header);
        });
      }

      for (let i = this.config.start_hour; i <= this.config.end_hour; i++) {
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time';
        timeLabel.textContent = `${i}:00`;
        container.appendChild(timeLabel);

        for (let d = 0; d < this.config.days; d++) {
          for (let col = 0; col < this.config.calendars.length; col++) {
            const slot = document.createElement('div');
            slot.className = 'column';
            container.appendChild(slot);
          }
        }
      }

      events.forEach(ev => {
        const colIndex = this.config.calendars.findIndex(c => c.entity === ev.entity);
        if (colIndex === -1) return;
        const calendarConfig = this.config.calendars[colIndex];
        const baseColumn = ev.dayOffset * this.config.calendars.length + colIndex;

        const eventEl = document.createElement('div');
        eventEl.className = 'event';
        eventEl.style.gridColumn = (baseColumn + 2).toString();
        eventEl.style.gridRow = `${ev.start - this.config.start_hour + 2} / ${ev.end - this.config.start_hour + 2}`;
        eventEl.style.backgroundColor = calendarConfig?.color || '#b3d1ff';
        eventEl.textContent = ev.title;
        container.appendChild(eventEl);
      });

      shadow.appendChild(container);
    } catch (err) {
      console.error('Fout in render():', err);
      this.innerHTML = `<div style="color: red; padding: 1em;">❌ Fout bij laden van kalenderkaart:<br>${err.message}</div>`;
    }
  }

  set hass(hass) {
    const events = [];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    this.config.calendars.forEach((calendar, index) => {
      const stateObj = hass.states[calendar.entity];
      if (!stateObj || !stateObj.attributes.start_time) return;

      const start = new Date(stateObj.attributes.start_time);
      const end = new Date(stateObj.attributes.end_time);

      if (start.toISOString().slice(0, 10) !== today) return;

      events.push({
        entity: calendar.entity,
        dayOffset: 0,
        start: start.getHours() + start.getMinutes() / 60,
        end: end.getHours() + end.getMinutes() / 60,
        title: stateObj.attributes.message || 'Afspraak'
      });
    });

    this.render(events);
  }

  getCardSize() {
    return 12;
  }
}

customElements.define('calendar-timeline-card', CalendarTimelineCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'calendar-timeline-card',
  name: 'Calendar Timeline Card',
  description: 'Toont meerdere agenda’s in tijdlijn-dagweergave met meerdere dagen, kleuren en sticky tijdskolom'
});
