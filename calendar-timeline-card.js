class CalendarTimelineCard extends HTMLElement {
  setConfig(config) {
    this.innerHTML = `<div style="padding: 1em;">✅ Calendar Timeline Card geladen!</div>`;
  }

  set hass(hass) {}
  getCardSize() {
    return 1;
  }
}

customElements.define('calendar-timeline-card', CalendarTimelineCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'calendar-timeline-card',
  name: 'Calendar Timeline Card',
  description: 'Test of hij verschijnt'
});
