// Vercel Serverless Function: Tonight's Conditions API
// Returns real-time-feel running conditions data

module.exports = function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  var now = new Date();
  var hour = now.getHours();
  var month = now.getMonth();

  // Sunset estimation by month (US average latitude ~38°N)
  var sunsetHours = [17.25, 17.75, 18.25, 19.75, 20.25, 20.58, 20.5, 20.0, 19.25, 18.25, 17.17, 16.92];
  var sunsetH = Math.floor(sunsetHours[month]);
  var sunsetM = Math.round((sunsetHours[month] % 1) * 60);
  var ampm = sunsetH >= 12 ? 'PM' : 'AM';
  var hour12 = sunsetH % 12 || 12;
  var sunset = hour12 + ':' + (sunsetM < 10 ? '0' : '') + sunsetM + ' ' + ampm;

  // Temperature by month (evening temps, Fahrenheit)
  var tempRanges = [
    [25, 35], [28, 40], [35, 52], [45, 62], [55, 72], [65, 82],
    [70, 88], [68, 86], [60, 78], [48, 65], [35, 50], [28, 38]
  ];
  var range = tempRanges[month];
  var temp = Math.round(range[0] + seededRandom(now.getDate()) * (range[1] - range[0]));

  // Wind (2-18 mph range)
  var wind = Math.round(2 + seededRandom(now.getDate() + month) * 16);

  // Moon phase (29.53 day cycle)
  var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  var moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  var moonIndex = Math.floor((dayOfYear % 29.53) / 3.69);
  var moon = moonPhases[moonIndex % 8];

  // Visibility based on moon and weather
  var visOptions = ['Excellent', 'Good', 'Moderate', 'Low'];
  var visIndex = 0;
  if (moon === 'Full Moon' || moon === 'Waxing Gibbous') visIndex = 0;
  else if (moon === 'First Quarter' || moon === 'Waning Gibbous') visIndex = 1;
  else visIndex = Math.random() > 0.5 ? 1 : 2;
  if (wind > 14) visIndex = Math.min(visIndex + 1, 3);
  var visibility = visOptions[visIndex];

  // Street activity based on time of day and day of week
  var dayOfWeek = now.getDay();
  var isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  var activity;
  if (hour >= 17 && hour < 19) activity = 'High';
  else if (hour >= 19 && hour < 21) activity = isWeekend ? 'High' : 'Moderate';
  else if (hour >= 21 && hour < 23) activity = isWeekend ? 'Moderate' : 'Low';
  else if (hour >= 23 || hour < 5) activity = 'Low';
  else activity = 'Moderate';

  // Generate verdict
  var score = 0;
  if (temp >= 45 && temp <= 75) score += 3;
  else if (temp >= 35 && temp <= 85) score += 2;
  else score += 1;
  if (wind < 10) score += 2;
  else if (wind < 15) score += 1;
  if (visibility === 'Excellent') score += 3;
  else if (visibility === 'Good') score += 2;
  else score += 1;
  if (activity === 'High' || activity === 'Moderate') score += 1;

  var verdict;
  if (score >= 8) verdict = 'Excellent conditions for a night run tonight. Get out there and own the night!';
  else if (score >= 6) verdict = 'Great conditions for a night run. Visibility is good and streets are active enough for comfort.';
  else if (score >= 4) verdict = 'Decent conditions tonight. Layer up appropriately and stick to well-lit, familiar routes.';
  else verdict = 'Challenging conditions tonight. Consider a shorter route on main corridors with good lighting.';

  // Safety tips based on conditions
  var tips = [];
  if (temp < 40) tips.push('Layer up — wear moisture-wicking base layer and wind-resistant outer layer.');
  if (temp > 80) tips.push('Stay hydrated — carry water even on short runs in warm conditions.');
  if (wind > 12) tips.push('Wind advisory — plan your route so you run into the wind first and have it at your back on the return.');
  if (visibility === 'Low' || visibility === 'Moderate') tips.push('Lower visibility tonight — make sure your reflective gear and lights are fully charged.');
  if (activity === 'Low') tips.push('Low street activity — stick to main corridors and let someone know your route.');
  if (moon === 'Full Moon') tips.push('Full moon tonight — enjoy the extra natural light on open routes!');
  if (tips.length === 0) tips.push('Great conditions — enjoy your run!');

  var data = {
    sunset: sunset,
    temp: temp + '°F',
    wind: wind + ' mph',
    visibility: visibility,
    moon: moon,
    streets: activity,
    verdict: verdict,
    tips: tips,
    timestamp: now.toISOString(),
    location: 'US Average (set your city for local data)'
  };

  return res.status(200).json(data);
};

// Seeded random for consistent daily values
function seededRandom(seed) {
  var x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}
