// calendar-timeline-card.js
class CalendarTimelineCard extends HTMLElement {
  setConfig(config) {
    this.config = {
      days: 1,
      start_hour: 7,
      end_hour: 20,
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
        grid-template-columns: 60px repeat(${this.config.entities.length * this.config.days}, 1fr);
        grid-auto-rows: 40px;
        font-family: sans-serif;
      }
      .time {
        text-align: right;
        padding-right: 5px;
        border-bottom: 1px solid #ddd;
        font-size: 12px;
      }
      .event {
        border: 1px solid #999;
        background-color: #b3d1ff;
        margin: 2px;
        padding: 2px;
        font-size: 12px;
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

      this.config.entities.forEach((_, idx) => {
        const header = document.createElement('div');
        header.className = 'header';
        header.textContent = `${dateString} (${idx + 1})`;
        container.appendChild(header);
      });
    }

    // Tijden start_hour - end_hour
    for (let i = this.config.start_hour; i <= this.config.end_hour; i++) {
      const timeLabel = document.createElement('div');
      timeLabel.className = 'time';
      timeLabel.textContent = `${i}:00`;
      container.appendChild(timeLabel);

      for (let d = 0; d < this.config.days; d++) {
        for (let col = 0; col < this.config.entities.length; col++) {
          const slot = document.createElement('div');
          slot.className = 'column';
          container.appendChild(slot);
        }
      }
    }

    // Dummy data
    const dummyEvents = [
      {
        entity: 0,
        dayOffset: 0,
        start: 9,
        end: 11,
        title: 'Overleg werk'
      },
      {
        entity: 1,
        dayOffset: 0,
        start: 10,
        end: 12,
        title: 'Tandarts'
      },
      {
        entity: 2,
        dayOffset: 0,
        start: 14,
        end: 15,
        title: 'Bellen met school'
      },
      {
        entity: 1,
        dayOffset: 1,
        start: 8,
        end: 9,
        title: 'Sporten'
      },
    ];

    dummyEvents.forEach(ev => {
      const eventEl = document.createElement('div');
      eventEl.className = 'event';
      const baseColumn = ev.dayOffset * this.config.entities.length + ev.entity;
      eventEl.style.gridColumn = (baseColumn + 2).toString();
      eventEl.style.gridRow = `${ev.start - this.config.start_hour + 1} / ${ev.end - this.config.start_hour + 1}`;
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
  description: 'Toont meerdere agenda’s in tijdlijn-dagweergave met meerdere dagen en kolommen'
});
