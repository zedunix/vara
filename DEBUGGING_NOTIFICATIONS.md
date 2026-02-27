# 🔍 DEBUGGING GUIDE - Finding Missing Events/Jobs

## Step 1: Check Backend Logs
When you click Notifications, watch your **backend terminal** for logs like:

```
✅ API RESPONSE about to send:
   Events: 3
   Jobs: 2
   Announcements: 1
📤 Full response: {
  "upcomingEvents": [...],
  "jobs": [...],
  "announcements": [...]
}
```

**What to look for:**
- If Events: 0 → Events not in database OR being filtered out
- If Events: 3+ → Events ARE being retrieved ✅
- If `upcomingEvents` is empty array `[]` → Check database query filters

---

## Step 2: Check Frontend Logs (Browser Console)
Open DevTools (F12) → Console tab and look for:

```
📡 Raw Axios Response: {
  "status": 200,
  "data": {
    "success": true,
    "data": {
      "upcomingEvents": [...],
      "jobs": [...],
      "announcements": [...]
    }
  }
}
```

Then look for:
```
🔔 Extracted Notifications Data: {
  upcomingEvents: 3,
  jobs: 2,
  announcements: 1
}
```

**What this tells you:**
- ✅ If you see upcomingEvents: 3+ → Events ARE making it to frontend
- ❌ If you see upcomingEvents: 0 → Backend query returned empty

---

## Step 3: If Events Show in Backend but Not Frontend

The disconnect point will be visible in the logs. Compare:

| Location | Backend Logs | Frontend Logs | Issue |
|----------|--------------|---------------|-------|
| Backend retrieves | ✅ Events: 3 | 🔴 Missing | Check response.data.data structure |
| Frontend receives | N/A | ❌ Events: 0 | Backend not sending them |
| Frontend renders | N/A | ✅ Events: 3 but not showing | Check notification panel DOM |

---

## Step 4: If Events Don't Show in UI Despite Logs

Check the **Notification Panel DOM** (F12 → Elements tab):
- Look for `<h4>Upcoming Events</h4>` element
- If NOT present → Frontend conditional blocked it
- If present but empty → Events array was falsy when rendering

---

## QUICK TEST FLOW:

1. **Backend running**: `npm start` (watch terminal)
2. **Open browser**: Dashboard
3. **Open DevTools**: F12 → Console
4. **Click Notifications** bell 🔔
5. **Check both terminals:**
   - Backend terminal: Look for `Events: X`
   - Browser console: Look for `upcomingEvents: X`
6. **Share results with format:**
   ```
   Backend says: Events X, Jobs Y, Announcements Z
   Frontend console shows: upcomingEvents X, jobs Y, announcements Z
   UI displays: Events [YES/NO], Jobs [YES/NO]
   ```

This will pinpoint exactly where the data is being lost!
