# VacayBot Feature Documentation

## ✅ Built Features

### Core Absence Management ✅
- ✅ Request vacation days through interface
- ✅ Request sick leave
- ✅ Request parental leave
- ✅ Request sick leave for child (Care for sick child)
- ✅ Request work from home
- ✅ Request knowledge time
- ✅ Request flex time
- ✅ Request paid/unpaid leave
- ✅ Request care of close relative
- ✅ Request military duties
- ✅ Support for different request durations (hours or days)

### Request Workflow ✅
- ✅ Create pending requests
- ✅ Send requests to manager for approval
- ✅ Manager approval/denial workflow
- ✅ Request cancellation (soft delete via abort)
- ✅ Request resend functionality
- ✅ Status tracking (pending, sent, approved, denied, cancelled)
- ✅ Employee home screen with request categorization (Ongoing, Upcoming, Pending, Rejected)
- ✅ Request history view with gap warnings
- ✅ Abort and Resend buttons for pending requests

### Multi-language Support ✅
- ✅ Support for multiple languages (English, Slovenian, German)
- ✅ Localized date formats
- ✅ Localized holiday names
- ✅ Automatic language detection from Slack user locale

### Department-Specific Features ✅
- ✅ Support for multiple offices: Ljubljana, Munich
- ✅ Office-specific holiday calendars
- ✅ Office selection in request flow

### Manager Features ✅
- ✅ Manager approval workflow
- ✅ Team vacation overview
- ✅ Filter by status (Pending, Approved, Denied, All)
- ✅ Real-time reactive updates using RxDB
- ✅ Manager dashboard with request cards

### Holiday Calendar Integration (Feature 25) ✅
- ✅ List upcoming public holidays with date and name
- ✅ Support for Slovenian public holidays
- ✅ Support for German (Munich area) public holidays
- ✅ Holiday data for 2025-2035 (10 years forward)
- ✅ Unified calendar view showing both Slovenian and Munich holidays together
- ✅ Holidays displayed chronologically with flag indicators (🇸🇮 for Slovenia, 🇩🇪 for Munich)
- ✅ Deduplicated holiday names when both regions share the same holiday
- ✅ Combined holiday names when regions have different names for the same date
- ✅ Accessible from both employee and manager flows
- ✅ Display upcoming holidays in web interface (accessible via keyboard shortcut)
- ✅ Display upcoming holidays in interface (e.g., next 3 months)
- ✅ Holiday filtering by date range (upcoming holidays only, configurable limit via `getGroupedHolidays()`)
- ✅ Integration with vacation planning (holidays visible to help plan absences)
- ✅ Holiday information accessible during request flow (via dedicated holidays screen)
- ✅ API endpoint: `GET /api/holidays?office=ljubljana|munich&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

### REST API Endpoints ✅
- ✅ GET `/api/absences` - List absence requests (with filters)
- ✅ POST `/api/absences` - Create absence request
- ✅ GET `/api/absences/[id]` - Get specific absence request
- ✅ PATCH `/api/absences/[id]` - Update absence request
- ✅ DELETE `/api/absences/[id]` - Cancel absence request
- ✅ GET `/api/outOfOffice/department/{department}` - Get all out of office entries for a department
- ✅ GET `/api/outOfOffice/manager/{manager_email}` - Get all out of office entries for a manager
- ✅ GET `/api/outOfOffice/user/{email}` - Get all out of office entries for a user
- ✅ Support for query parameters: `start_date`, `end_date`, `status`

### Data Persistence ✅
- ✅ RxDB integration for client-side data storage
- ✅ Reactive subscriptions for real-time updates
- ✅ IndexedDB storage via Dexie adapter
- ✅ Demo user system (employee and manager)

### Typeform-Style UI ✅
- ✅ Step-by-step interactive flow
- ✅ Keyboard shortcuts (number keys for selections)
- ✅ Auto-focus on inputs and primary buttons
- ✅ Back navigation (Backspace key)
- ✅ Smooth animations with Framer Motion

### Slack Integration ✅
- ✅ Slack Bolt SDK integration
- ✅ Socket Mode support
- ✅ Slash command (`/vacation`)
- ✅ Interactive buttons and modals
- ✅ Stateless flow URLs for web app integration

---

## ⏳ Prioritized Features (In Progress / Planned)

### Google Calendar Integration (Feature 4)
- ⏳ Automatic creation of Google Calendar events for approved absences
- ⏳ Creation of preliminary calendar events for pending requests
- ⏳ Automatic deletion of calendar events when requests are cancelled
- ⏳ Support for manager vacation calendars
- ⏳ Calendar event management per employee

### Slack Status Integration (Feature 6)
- ⏳ Automatic Slack status updates for approved absences
- ⏳ Status clearing when requests are cancelled

### Home Tab Interface (Feature 9)
- ✅ Personal vacation overview (partially implemented)
- ⏳ Team vacation overview
- ⏳ Personal overtime overview
- ⏳ Team overtime overview
- ⏳ Filtering and pagination

### Absence Calendar View (Feature 28)
- ⏳ Visual calendar showing team absences
- ⏳ Color-coded by absence type
- ⏳ Month/week/day views

### Notifications and Reminders (Feature 29)
- ⏳ Reminder notifications for pending approvals
- ⏳ Reminder notifications for upcoming vacations
- ⏳ Team notifications when colleagues are on vacation

### Mobile App Support (Feature 31)
- ✅ Mobile-optimized interface
- ⏳ Push notifications
- ✅ Quick actions from mobile

### Approval Delegation (Feature 35)
- ⏳ Temporary manager delegation
- ⏳ Approval chain support
- ⏳ Escalation workflows

### Documentation and Help (Feature 36)
- ✅ In-app help system (Features and Documentation screens)
- ⏳ FAQ integration
- ⏳ Tutorial for new users

---

## 🔮 Potential Future Features

### Overtime and Standby Management (Feature 2)
- Submit overtime hours
- Submit standby time
- View team overtime
- View personal overtime
- Filter overtime by user, month, department, and type

### E-računi Integration (Feature 11)
- Working days calculation excluding weekends and national holidays
- Integration with E-računi system for payroll

### Hour Reporting Bot (Features 12-16)
- Automated Hour Reporting
  - Daily processing of employee work hours
  - Automatic Excel file generation per employee
  - Monthly folder organization in Google Drive
- Work Type Classification
  - Sick leave tracking
  - Parental leave tracking
  - Vacation tracking
  - Work in office tracking
  - Work from home tracking
  - Standby time tracking
  - Overtime tracking
- Excel Template Management
  - Employee-specific Excel templates
  - E-računi template generation
  - Automatic data insertion based on absence and presence data
  - Employee validation data (on 25th of month)
- Data Integration
  - Integration with absence-bot for out-of-office data
  - Integration with botyonce-hub-presence for in-office data
  - Integration with flex time/overtime data
  - Employee data from employee data service
- Google Drive Integration
  - Automatic upload to Google Drive
  - Monthly folder creation
  - File sharing with employees and managers
  - Template creation when files don't exist

### Botyoncé Hub Presence (Features 17-24)
- Office Check-in System
  - Automatic check-in when employee enters office (via card scan)
  - Office location tracking
  - Support for multiple offices
- Social Interaction Preferences
  - Employee preference selection (lunch, games, etc.)
  - Emoji-based preference representation
  - Checkbox-based interaction interface
- Welcome Messages
  - Personalized welcome messages posted to office channel
  - Random message generation with customizable vocabulary
  - User mention and interest display
  - GIF integration via Giphy API
- Lunch Coordination
  - Daily lunch thread creation (at 10:30)
  - Lunch poll functionality
  - Mention employees who want to have lunch together
  - Food-related GIFs
- Game Coordination
  - Game poll functionality
  - Game thread creation
  - Employee participation tracking
- TV stream Integration
  - Display list of employees in office
  - Show employee preferences as emojis
  - Office-specific displays
- Analytics and Reporting
  - Daily data transfer to Google Sheets
  - Usage metrics tracking
  - Manual sync capability for specific dates
  - Employee engagement tracking
- Slack Interactions
  - Interactive message handling
  - Modal dialogs for polls
  - Action button handling
  - Response management


### Vacation Balance Tracking (Feature 27)
- Track remaining vacation days per employee
- Display vacation balance in home tab
- Warnings when balance is low
- Annual reset functionality

### Recurring Absence Patterns (Feature 27)
- Support for recurring absences (e.g., every Friday afternoon)
- Pattern-based request creation

### Statistics and Reporting (Feature 30)
- Department absence statistics
- Personal absence statistics
- Overtime statistics
- Usage analytics dashboard

### Integration Enhancements (Feature 32)
- Integration with more HR systems
- Integration with project management tools
- Integration with time tracking systems

### Advanced Filtering (Feature 33)
- Multi-criteria filtering
- Saved filter presets
- Export filtered data

### Bulk Operations (Feature 34)
- Bulk approval/denial for managers
- Bulk request creation
- Bulk calendar updates

### Accessibility Features (Feature 37)
- Screen reader support
- Keyboard navigation (partially implemented)
- High contrast mode

### Holiday Planning Assistant (Feature 39)
- Suggest optimal vacation dates based on team coverage
- Conflict detection
- Team capacity planning

### Integration with External Calendars (Feature 40)
- Sync with personal calendars (iCal, Outlook)
- Two-way calendar sync
- Calendar conflict detection

### Cinode Integration (Feature 5)
- Automatic absence entry into Cinode system
- Automatic removal from Cinode when requests are cancelled
- User lookup by email
