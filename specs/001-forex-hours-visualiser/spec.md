# Feature Specification: Forex Market Hours Visualiser

**Feature Branch**: `001-forex-hours-visualiser`
**Created**: 2026-05-19
**Status**: Draft
**Input**: User description: "I want to build a Forex Market Hours visualiser that shows which of
the four major forex trading sessions (Sydney, Tokyo, London, New York) are currently open, with
visual overlap indicators and a live clock. No server-side data fetching. No trading volume
display."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Session Status (Priority: P1)

A forex trader opens the visualiser and immediately sees which of the four major sessions —
Sydney, Tokyo, London, and New York — are currently open or closed, based on the current time
on their device. Each session is clearly labelled and its status (open/closed) is obvious at a
glance.

**Why this priority**: Knowing which sessions are active is the primary reason a trader visits
this tool. All other features support this core need.

**Independent Test**: Can be fully tested by loading the visualiser at a known UTC time and
verifying that each session's open/closed status matches the expected state for that time.
Delivers immediate standalone value as a session status checker.

**Acceptance Scenarios**:

1. **Given** the current UTC time is 10:00 on a weekday,
   **When** the trader loads the visualiser,
   **Then** London is shown as open and Sydney, Tokyo, and New York are shown as closed.

2. **Given** the current UTC time is 13:00 on a weekday,
   **When** the trader loads the visualiser,
   **Then** both London and New York are shown as open, and Sydney and Tokyo are shown as closed.

3. **Given** the current UTC time is 22:00 on a weekday,
   **When** the trader loads the visualiser,
   **Then** Sydney is shown as open and Tokyo, London, and New York are shown as closed.

---

### User Story 2 - Identify Session Overlap Windows (Priority: P2)

A trader wants to know when two sessions are simultaneously open, as these overlap windows
represent the most active trading periods. The visualiser clearly highlights periods where two
or more sessions overlap using a distinct visual treatment that is immediately distinguishable
from single-session periods.

**Why this priority**: Overlap windows are critical for traders targeting high-liquidity periods.
This builds directly on US1 (session status) and enhances decision-making without requiring any
additional interaction.

**Independent Test**: Can be fully tested by viewing the visualiser at a known overlap time
(e.g., 13:00 UTC for London/New York) and confirming the overlap indicator is visible and
distinct. Standalone value: trader can identify the next high-activity window.

**Acceptance Scenarios**:

1. **Given** it is 14:00 UTC (London and New York both open),
   **When** the trader views the timeline,
   **Then** the 13:00–17:00 UTC window is visually highlighted as an overlap zone.

2. **Given** it is 05:00 UTC (Sydney and Tokyo both open),
   **When** the trader views the timeline,
   **Then** the Sydney/Tokyo overlap zone is visually marked and distinguishable from
   single-session blocks.

3. **Given** only one session is open,
   **When** the trader views the timeline,
   **Then** no overlap indicator is shown for that period.

---

### User Story 3 - Track Live Time (Priority: P3)

A trader wants to see a live clock that ticks in real time, showing both the current local
device time and the equivalent UTC time, so they can quickly orient themselves on the
24-hour forex timeline without performing mental timezone conversions.

**Why this priority**: The live clock reinforces the current-time context for the session
status display. It is valuable but does not block delivery of US1 or US2.

**Independent Test**: Can be fully tested by observing the clock over a 10-second window and
confirming it updates every second in both local and UTC formats. Delivers value as a
standalone dual-timezone clock.

**Acceptance Scenarios**:

1. **Given** the visualiser is open,
   **When** 1 second passes,
   **Then** the displayed time advances by 1 second without any user interaction or page
   refresh.

2. **Given** a user whose device is set to UTC+5,
   **When** the visualiser loads,
   **Then** both the local time (UTC+5) and the UTC equivalent are displayed simultaneously.

3. **Given** the clock is running,
   **When** the current session open/closed status changes (a session opens or closes),
   **Then** the session status display updates automatically to reflect the new state.

---

### Edge Cases

- What happens at the exact moment a session opens or closes (boundary second)?
- How does the timeline handle sessions that span midnight UTC (Sydney: 22:00–07:00)?
- What is displayed when no sessions are open (rare but possible)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The visualiser MUST display the current open/closed status for all four sessions
  (Sydney, Tokyo, London, New York) based on the device's current time.
- **FR-002**: The visualiser MUST show a 24-hour horizontal timeline with colour-coded blocks
  representing each session's active hours.
- **FR-003**: Periods where two or more sessions are simultaneously open MUST be visually
  differentiated from single-session periods (e.g., distinct colour, pattern, or label).
- **FR-004**: A live clock MUST display the current time, updating at a minimum of once per
  second.
- **FR-005**: The live clock MUST show both the user's local timezone time and the UTC
  equivalent simultaneously.
- **FR-006**: All time calculations and session status determinations MUST be performed
  client-side using the device clock; no network requests are made after initial load.
- **FR-007**: Session open/closed status and the live clock MUST update automatically without
  requiring a page refresh.
- **FR-008**: Each session block on the timeline MUST be labelled with the session name and
  its standard UTC hour range.

### Key Entities

- **TradingSession**: Named session (Sydney/Tokyo/London/New York), UTC open hour, UTC close
  hour, current open/closed state.
- **OverlapWindow**: Time range where two named sessions are simultaneously active.
- **LiveClock**: Current time snapshot in both local timezone and UTC, updating each second.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A trader can determine which sessions are currently open within 3 seconds of
  loading the visualiser, without any prior instruction.
- **SC-002**: The live clock visibly advances at least once per second with no user interaction
  required.
- **SC-003**: Session overlap windows are visually distinguishable from single-session periods
  without any tooltip, legend, or explanation being required.
- **SC-004**: The visualiser correctly reflects session status for every hour of a 24-hour cycle
  (verifiable by simulating the device clock at each hour).
- **SC-005**: The visualiser functions fully after initial load with no network requests; it
  operates correctly in an offline/airplane-mode environment.

## Assumptions

- Standard fixed UTC session hours are used for v1: Sydney 22:00–07:00, Tokyo 00:00–09:00,
  London 08:00–17:00, New York 13:00–22:00.
- Daylight saving time adjustments (which shift London and New York by ±1 hour) are out of scope
  for v1; fixed UTC hours are an accepted simplification.
- The visualiser targets weekday forex hours; weekend session behaviour (markets closed) is out
  of scope for v1.
- No user accounts, authentication, or personalisation are required.
- The primary display surface is a desktop browser, but the layout should be legible on a
  tablet/mobile screen.
- Trading volume data is explicitly excluded per the feature description.
- Server-side data fetching is explicitly excluded; the device clock is the sole time source.
