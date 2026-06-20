import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load credentials
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
} catch (error) {
  console.error("Could not load credentials.json:", error.message);
}

const auth = credentials ? new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
}) : null;

const calendar = google.calendar({ version: 'v3', auth });
const TARGET_CALENDAR_ID = "shawnsoon.ss@gmail.com";

app.get('/api/calendar/events', async (req, res) => {
  if (!auth) {
    return res.status(500).json({ error: 'Service account credentials not configured on backend.' });
  }

  try {
    const timeMin = new Date(2026, 5, 1).toISOString(); // Fetch starting June 2026 as in original code
    
    const response = await calendar.events.list({
      calendarId: TARGET_CALENDAR_ID,
      timeMin: timeMin,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(response.data);
  } catch (error) {
    console.error("Google Calendar API Error:", error.message);
    res.status(500).json({ error: 'Failed to fetch calendar events from Google API' });
  }
});

app.delete('/api/calendar/events/:id', async (req, res) => {
  if (!auth) return res.status(500).json({ error: 'No auth' });
  try {
    await calendar.events.delete({
      calendarId: TARGET_CALENDAR_ID,
      eventId: req.params.id,
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/calendar/events', async (req, res) => {
  if (!auth) return res.status(500).json({ error: 'No auth' });
  try {
    const { day, time, name, type } = req.body;
    // Basic date parsing for June 2026. This assumes input is structured properly.
    const dateStr = `2026-06-${day.toString().padStart(2, '0')}`;
    
    // Parse time like "10:30 AM"
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = 9;
    let mins = 0;
    if (match) {
      hours = parseInt(match[1]);
      mins = parseInt(match[2]);
      if (match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    
    const startDateTime = new Date(2026, 5, day, hours, mins, 0); // Month is 0-indexed (5 = June)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const response = await calendar.events.insert({
      calendarId: TARGET_CALENDAR_ID,
      requestBody: {
        summary: name,
        description: type,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Asia/Kuala_Lumpur', // Using a default timezone, ideally this should be configurable or UTC
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Asia/Kuala_Lumpur',
        },
      },
    });
    
    res.json(response.data);
  } catch (error) {
    console.error("Post Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API Server running on http://localhost:${PORT}`);
});
