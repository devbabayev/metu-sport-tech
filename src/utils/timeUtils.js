let timeOffset = 0;
let isInitialized = false;

/**
 * Initializes the time offset by fetching the current time from WorldTimeAPI.
 * This should be called once when the app starts.
 */
export const initSecureTime = async () => {
  if (isInitialized) return;
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Istanbul');
    if (!response.ok) throw new Error('Failed to fetch time');
    const data = await response.json();
    
    const serverTime = new Date(data.datetime).getTime();
    const localTime = Date.now();
    
    timeOffset = serverTime - localTime;
    isInitialized = true;
    console.log('Secure time initialized. Offset:', timeOffset, 'ms');
  } catch (error) {
    console.error('Failed to initialize secure time. Falling back to local device time.', error);
    timeOffset = 0; // Fallback to local time if API fails
  }
};

/**
 * Returns a new Date object representing the current secure Turkey Time,
 * completely independent of the user's local device clock manipulation.
 */
export const getSecureTurkeyTime = () => {
  return new Date(Date.now() + timeOffset);
};

/**
 * Checks if a given date string (e.g., from DB) belongs to the "current day" in Turkey Time.
 * A new day starts at 00:00:00 (Midnight) in Turkey.
 * @param {string} dateString - ISO date string
 * @returns {boolean}
 */
export const isTodayInTurkey = (dateString) => {
  if (!dateString) return false;

  const targetDate = new Date(dateString);
  const now = getSecureTurkeyTime();

  // Create a formatter that formats a date object into Turkey local time components
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const targetFormatted = formatter.format(targetDate);
  const nowFormatted = formatter.format(now);

  return targetFormatted === nowFormatted;
};
