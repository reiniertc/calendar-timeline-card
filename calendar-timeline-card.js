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
    this.innerHTML = '';
    this.render();
  }

  render() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
      .timeline {
        display: grid;
        grid-template-columns: 80px repeat(${this.config.calendars.length * this.config.days}, 1fr);
        grid-auto-rows: 40px;
        font-family: sans-serif;
      }
      .time {
        text-align: right;
        padding-right: 8px;
        border-bottom: 1px solid #ddd;
        font-size: 12px;
        background: #fff;
        position: sticky;
        left: 0;
        z-index: 2;
      }
      .event {
        border: 1px solid #999;
        margin: 2px;
        padding: 2px;
        font-size: 12px;
        color: #000;
      }
      .column {
        border-left: 1px solid #ccc;
      }
      .header {
        font-weight: bold;
        font-size: 12px;
        text-align: center;
        border-bottom: 1px solid #ccc;
      }
    `;
    shadow.appendChild(style);

    const container = document.createElement('div');
    container.className = 'timeline';

    // Header row
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

    // Tijdslijn
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

    // Dummy data met echte entity-namen
    const dummyEvents = [
      {
        entity: 'calendar.mats',
        dayOffset: 0,
        start: 9,
        end: 11,
        title: 'Overleg werk'
      },
      {
        entity: 'calendar.ical_roemer',
        dayOffset: 0,
        start: 10,
        end: 12,
        title: 'Tandarts'
      },
      {
        entity: 'calendar.ical_roemer',
        dayOffset: 0,
        start: 14,
        end: 15,
        title: 'Bellen met school'
      },
      {
        entity: 'calendar.ical_roemer',
        dayOffset: 1,
        start: 8,
        end: 9,
        title: 'Sporten'
      },
    ];

    dummyEvents.forEach(ev => {
      const colIndex = this.config.calendars.findIndex(c => c.entity === ev.entity);
      if (colIndex === -1) return;
      const calendarConfig = this.config.calendars[colIndex];

      const eventEl = document.createElement('div');
      eventEl.className = 'event';
      const baseColumn = ev.dayOffset * this.config.calendars.length + colIndex;
      eventEl.style.gridColumn = (baseColumn + 2).toString();
      eventEl.style.gridRow = `${ev.start - this.config.start_hour + 2} / ${ev.end - this.config.start_hour + 2}`;
      eventEl.style.backgroundColor = calendarConfig?.color || '#b3d1ff';
      eventEl.textContent = ev.title;
      container.appendChild(eventEl);
    });

    shadow.appendChild(container);
  }

  set hass(hass) {
    // Placeholder: in de toekomst echte kalenderdata ophalen
  }

  getCardSize() {
    return 12;
  }
}

customElements.define('calendar-timeline-card', CalendarTimelineCard);

// Voor Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'calendar-timeline-card',
  name: 'Calendar Timeline Card',
  description: 'Toont meerdere agenda’s in tijdlijn-dagweergave met meerdere dagen, kleuren en sticky tijdskolom'
});
