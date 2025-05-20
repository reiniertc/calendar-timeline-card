# Calendar Timeline Card

A custom Home Assistant Lovelace card that displays one or more calendars as vertical timelines, inspired by the Apple Calendar layout.

This version is designed to work with ical-sensor, which reads ICS/iCal feeds and creates event sensors in Home Assistant.

⸻

Features
	•	Visual timeline layout per calendar, with time on the left
	•	Supports multiple calendars shown side-by-side
	•	Per-day vertical scrolling layout
	•	Pixel-precise placement of events based on time
	•	Customizable:
	•	Font size
	•	Border thickness
	•	Border radius
	•	Background color per calendar
	•	Start and end hours of the day
	•	Number of days shown
	•	Optionally show calendar name and date
	•	Optionally show start and/or end times

⸻

Dependencies

This card requires the use of ical-sensor, an integration that creates sensor.ical_xxx_event_0, sensor.ical_xxx_event_1, etc. per iCal feed.

Make sure your sensors contain start, end, and summary attributes.

⸻

Example Configuration

type: custom:calendar-timeline-card
days: 2
start_hour: 7
end_hour: 22
pixel_per_minute: 1
font_size: 1.1
border_width: 1
border_radius: 6
show_date: true
show_names: true
show_start_time: true
show_end_time: true
calendars:
  - name: Henk
    color: '#81c784'
    prefix: sensor.ical_henk_event_
  - name: Marie
    color: '#64b5f6'
    prefix: sensor.marie_event_

Explanation
	•	prefix: is used to collect all matching sensor.xxx entries
	•	Events are included if their start/end falls within the configured days

⸻

Installation
	1.	Save calendar-timeline-card.js in /config/www/
	2.	Add this to your Lovelace resources:

url: /local/calendar-timeline-card.js
type: module


	3.	Add the example configuration to your dashboard
	4.	Clear browser cache if necessary (Ctrl+F5)

⸻

Disclaimer

This card was created with the assistance of ChatGPT (OpenAI) and customized by the user. It is provided as-is. Use at your own risk. Contributions and improvements are welcome!
