# 📅 Calendar Timeline Card

A custom Home Assistant Lovelace card that displays one or more calendars as pixel-accurate vertical timelines — inspired by Apple Calendar.

---

## ✅ Features

- Multiple calendars shown side by side
- Each day divided by hours with pixel precision
- Uses `ical-sensor` entities for data
- Full GUI editor (via `ha-form`)
- Theme-aware (colors, fonts)
- Support for:
  - Offset (`offset`) to skip days
  - Adjustable `start_hour` and `end_hour`
  - Font size and border radius
  - Per-calendar color and border color
  - Optional dashed hour lines (`show_hour_lines`)
  - Adjustable font size for hour labels (`hour_font_size`)

---

## 📦 Installation (via HACS)

1. Go to **HACS > Frontend > Custom Repositories**
2. Add the GitHub repo URL and select type: **Lovelace**
3. After installation, refresh your browser
4. Add the card via the Lovelace UI

---

## ⚙️ YAML Configuration Example

```yaml
type: custom:calendar-timeline-card
title: Agenda Tijdlijn
days: 2
offset: 1
start_hour: 7
end_hour: 22
pixel_per_minute: 1
font_size: 1.0
hour_font_size: 14px
border_width: 1
border_radius: 6
show_date: true
show_names: true
show_start_time: true
show_end_time: true
show_hour_lines: true
calendars:
  - name: Henk
    color: 'var(--accent-color)'
    border_color: 'var(--primary-color)'
    prefix: sensor.ical_henk_event_
  - name: Marie
    color: '#64b5f6'
    border_color: '#1976d2'
    prefix: sensor.ical_marie_event_
```

---

## ⚠️ Requirements

You need to use the [`ical-sensor`](https://github.com/ehendrix23/ical-sensor) integration to read iCal/WebCal feeds as entities.

---

## ℹ️ Notes

- Card is fully compatible with Home Assistant themes
- Created and maintained with help from ChatGPT
