// Vercel Serverless Function: Community Pulse API
// Returns live-feel community activity data

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  var now = new Date();
  var hour = now.getHours();

  // Simulate realistic runner counts based on time of day
  var baseRunners;
  if (hour >= 17 && hour < 20) baseRunners = 2200 + Math.floor(Math.random() * 1200);
  else if (hour >= 20 && hour < 22) baseRunners = 1800 + Math.floor(Math.random() * 800);
  else if (hour >= 22 || hour < 5) baseRunners = 400 + Math.floor(Math.random() * 600);
  else if (hour >= 5 && hour < 7) baseRunners = 800 + Math.floor(Math.random() * 400);
  else baseRunners = 300 + Math.floor(Math.random() * 300);

  // Weekly stats
  var routesThisWeek = 120 + Math.floor(Math.random() * 80);
  var safetyNotes = 30 + Math.floor(Math.random() * 25);

  // Group runs tonight
  var groupRuns;
  var dayOfWeek = now.getDay();
  if (dayOfWeek === 2 || dayOfWeek === 4) groupRuns = 15 + Math.floor(Math.random() * 10);
  else if (dayOfWeek === 6) groupRuns = 20 + Math.floor(Math.random() * 12);
  else groupRuns = 8 + Math.floor(Math.random() * 10);

  // Recent feed items
  var cities = ['Austin, TX', 'Portland, OR', 'Chicago, IL', 'Denver, CO', 'Seattle, WA',
    'Brooklyn, NY', 'San Francisco, CA', 'Miami, FL', 'Boston, MA', 'Nashville, TN',
    'Atlanta, GA', 'Minneapolis, MN', 'Los Angeles, CA', 'Philadelphia, PA', 'Washington, DC'];
  var names = ['Sarah M.', 'Alex R.', 'Marcus T.', 'Priya N.', 'Kenji M.',
    'Daniela V.', 'Tanya B.', 'Ryan P.', 'Aisha T.', 'David L.',
    'Jasmine K.', 'Mei W.', 'Carlos G.', 'Jordan F.', 'Keisha M.'];
  var distances = ['3.1', '3.8', '4.2', '5.0', '5.5', '6.2', '2.8', '4.5', '7.1', '3.5'];

  var feedItems = [];

  // Generate 5 recent feed items
  for (var i = 0; i < 5; i++) {
    var nameIdx = Math.floor(Math.random() * names.length);
    var cityIdx = Math.floor(Math.random() * cities.length);
    var distIdx = Math.floor(Math.random() * distances.length);
    var minutesAgo = i * 5 + Math.floor(Math.random() * 8);

    var types = ['checkin', 'route', 'safety', 'group'];
    var type = types[Math.floor(Math.random() * types.length)];

    var item = { time: minutesAgo + 'm ago' };

    if (type === 'checkin') {
      item.dot = 'green';
      item.text = '<strong>' + names[nameIdx] + '</strong> checked in from ' + cities[cityIdx] + ' — ' + distances[distIdx] + ' mi night run completed';
    } else if (type === 'route') {
      item.dot = 'blue';
      item.text = '<strong>Night Crew ' + cities[cityIdx].split(',')[0] + '</strong> shared a new route';
    } else if (type === 'safety') {
      item.dot = 'gold';
      item.text = '<strong>Safety note:</strong> New update for ' + cities[cityIdx];
    } else {
      item.dot = 'rose';
      var runHour = 18 + Math.floor(Math.random() * 4);
      var runTime = (runHour > 12 ? runHour - 12 : runHour) + ':' + (Math.random() > 0.5 ? '00' : '30') + ' PM';
      item.text = '<strong>Group run:</strong> ' + cities[cityIdx].split(',')[0] + ' Night Crew — ' + runTime;
    }

    feedItems.push(item);
  }

  var data = {
    stats: {
      runnersTonight: baseRunners,
      routesThisWeek: routesThisWeek,
      safetyNotes: safetyNotes,
      groupRunsTonight: groupRuns
    },
    feed: feedItems,
    timestamp: now.toISOString()
  };

  return res.status(200).json(data);
};
