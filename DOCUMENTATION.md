# VacayBot Documentation

## Data Flow Architecture

### Absence Request Flow

```
Employee creates request
    ↓
[DB] createAbsenceRequest()
    ↓
Status: 'pending' → 'sent'
    ↓
Manager receives notification (via DB subscription)
    ↓
Manager approves/denies
    ↓
[DB] updateAbsenceRequest() → Status: 'approved' | 'denied'
    ↓
Employee sees updated status (via DB subscription)
```

### Request States

1. **pending** - Initial state when request is created
2. **sent** - Request has been sent to manager (or resent)
3. **approved** - Manager approved the request
4. **denied** - Manager denied the request
5. **cancelled** - Employee aborted the request

### Employee Actions

- **Abort**: Changes status from `pending`/`sent` → `cancelled`
- **Resend**: Changes status from `pending`/`sent` → `sent` (triggers new notification)

### Manager Actions

- **Approve**: Changes status from `pending`/`sent` → `approved`
- **Deny**: Changes status from `pending`/`sent` → `denied`

---

## Typeform Flow Steps

### Employee Flow

The typeform flows are **built with code** (not data-driven). Each step is a React component with conditional rendering based on the `step` state.

#### Step Sequence

1. **home** (`'home'`)
   - Employee home screen
   - Shows: Ongoing, Upcoming, Pending, Rejected requests
   - Buttons: Start New Request (1), Show Holidays (2), Show History (3), Show Features (4), Show Docs (5)

2. **type** (`'type'`)
   - Select absence type
   - Shows: List of absence types (Vacation, Sick Leave, etc.)
   - Keyboard: Number keys 1-9 to select type
   - Next: `office`

3. **office** (`'office'`)
   - Select office location
   - Shows: Ljubljana, Munich
   - Keyboard: Number keys 1-2 to select office
   - Next: `duration` (if type supports both) or `dates` (if type is days-only)
   - Back: `type`

4. **duration** (`'duration'`)
   - Select duration type (only if absence type supports both hours and days)
   - Shows: Hours, Days
   - Keyboard: 1 = Hours, 2 = Days
   - Next: `dates`
   - Back: `office`

5. **dates** (`'dates'`)
   - Enter date information
   - Shows: Start date input, End date input (optional), Hours/Days input
   - Keyboard: Tab navigation, Enter to submit
   - Next: `note`
   - Back: `duration` or `office`

6. **note** (`'note'`)
   - Add optional note
   - Shows: Textarea for note
   - Keyboard: Tab navigation, Enter to submit
   - Next: `review`
   - Back: `dates`

7. **review** (`'review'`)
   - Review request before submission
   - Shows: Summary of all entered data
   - Keyboard: Enter to submit (auto-focused)
   - Next: `submitted`
   - Back: `note`

8. **submitted** (`'submitted'`)
   - Confirmation screen
   - Shows: Success message
   - Button: Back to first page (auto-focused)
   - Next: `home`

#### Special Screens

- **holidays** (`'holidays'`)
  - Public holidays display
  - Shows: Slovenian and Munich holidays grouped by date
  - Keyboard: Escape or 2 to close
  - Back: `home`

- **history** (`'history'`)
  - All request history
  - Shows: All requests sorted by start date with gap warnings
  - Keyboard: Escape to close
  - Back: `home`

### Manager Flow

- **Dashboard** (no step name)
  - Shows: Filter buttons (Pending, Approved, Denied, All)
  - Shows: List of requests with approve/deny actions
  - Keyboard: 2 = Show Holidays
  - Real-time updates via DB subscriptions

---

## Flow Implementation Details

### Typeform Flows: Code-Based (Not Data-Driven)

**Answer**: The typeform flows are **built with code**, not encoded as data.

#### Current Implementation

- **Steps are hardcoded** in `src/app/page.tsx` as React components
- **Step order** is defined in the `goBack()` function: `['type', 'office', 'duration', 'dates', 'note', 'review']`
- **Step logic** is conditional rendering: `{step === 'type' && <TypeformStep>...</TypeformStep>}`
- **Navigation** is handled by state updates: `setStep('nextStep')`

#### Stateless Flow Class (Unused)

There's a `StatelessFlow` class in `src/lib/statelessFlow.ts` that was designed for data-driven flows, but it's **not currently used**. The actual implementation uses:

- React state (`useState` for `step`)
- URL-encoded state (`encodeFlowState`/`decodeFlowState` for sharing links)
- Direct component rendering based on step value

#### Flow Configuration

Each step is configured inline:

```typescript
{step === 'type' && (
  <TypeformStep title={t('absence.title', language)}>
    {Object.entries(absenceTypes).map(([key, config], index) => (
      <TypeformButton
        label={t(`absence.types.${key}`, language)}
        shortcut={String(index + 1)}
        onClick={() => handleTypeSelect(key as AbsenceType)}
      />
    ))}
  </TypeformStep>
)}
```

#### To Make It Data-Driven

Would require:
1. Define step configuration objects
2. Create a step renderer component
3. Map step IDs to components/configuration
4. Update navigation logic to use configuration

**Current Status**: Flows are code-based for flexibility and type safety.

---

## Keyboard Shortcuts

- **Backspace**: Go back to previous screen
- **Escape**: Close holidays/history screens
- **Enter**: Activates chosen option or button. Primary buttons like Close or Return are normally auto-focused so one Enter is enough.

---

## Data Models

### AbsenceRequest

```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  type: AbsenceType;
  office: Office;
  startDate: string; // ISO date
  endDate?: string; // ISO date (optional)
  hours?: number;
  days?: number;
  note?: string;
  status: 'pending' | 'sent' | 'approved' | 'denied' | 'cancelled';
  managerEmail?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  approvedAt?: string; // ISO datetime
  deniedAt?: string; // ISO datetime
  cancelledAt?: string; // ISO datetime
}
```

### User

```typescript
{
  id: string;
  email: string;
  name?: string;
  role: 'employee' | 'manager';
  managerEmail?: string;
  department?: string;
}
```

---

## API Endpoints

### Absence Endpoints

- `POST /api/absences` - Create absence request
- `GET /api/absences` - List absence requests (filters: userEmail, managerEmail, status, startDate, endDate)
- `GET /api/absences/[id]` - Get specific absence request
- `PATCH /api/absences/[id]` - Update absence request
- `DELETE /api/absences/[id]` - Cancel absence request (soft delete)

### Out of Office Endpoints

- `GET /api/outOfOffice/department/{department}` - Get absences by department
- `GET /api/outOfOffice/manager/{managerEmail}` - Get absences by manager
- `GET /api/outOfOffice/user/{email}` - Get absences by user

### Query Parameters

All list endpoints support:
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)
- `status` - Filter by status (pending, sent, approved, denied, cancelled)

---

## DB Service Layer

### absenceService.ts

- `createAbsenceRequest(input)` - Create new request
- `getAbsenceRequest(id)` - Get single request
- `updateAbsenceRequest(id, updates)` - Update request
- `deleteAbsenceRequest(id)` - Soft delete (sets status to cancelled)
- `listAbsenceRequests(filters)` - List requests with filters
- `observeAbsenceRequests(filters)` - Reactive subscription for requests

### userService.ts

- `getUserByEmail(email)` - Get user by email
- `createUser(user)` - Create user
- `listUsers()` - List all users

---

## State Management

### Flow State (URL-Encoded)

Stored in URL as base64url-encoded JSON:
- `step`: Current step ID
- `data`: Form data collected so far
- `language`: Selected language

### React State

- `step`: Current step (synced with flowState.step)
- `flowState`: Complete flow state object
- `userEmail`: Logged-in user email
- `userRole`: User role (employee/manager)
- `language`: UI language
- `userRequests`: Employee's absence requests (reactive DB subscription)
- `showHolidays`: Show holidays screen flag
- `showHistoryScreen`: Show history screen flag

---

## Component Structure

### TypeformStep
- Wrapper component for each step
- Handles layout, animations, back button
- Props: `title`, `description`, `showBack`, `onBack`, `children`

### TypeformButton
- Interactive button with keyboard shortcuts
- Props: `label`, `onClick`, `variant`, `shortcut`, `autoFocus`

### Input Components
- `DateInput` - Date picker
- `NumberInput` - Number input (hours/days)
- `TextArea` - Multi-line text input

All inputs support `autoFocus` prop.
