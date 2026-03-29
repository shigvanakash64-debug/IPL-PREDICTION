module.exports = [
  {
    matchId: 'ipl-fallback-1',
    teamA: 'MI',
    teamB: 'CSK',
    venue: 'Wankhede Stadium',
    status: 'upcoming',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  },
  {
    matchId: 'ipl-fallback-2',
    teamA: 'RCB',
    teamB: 'KKR',
    venue: 'M. Chinnaswamy Stadium',
    status: 'live',
    startTime: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    matchId: 'ipl-fallback-3',
    teamA: 'SRH',
    teamB: 'GT',
    venue: 'Rajiv Gandhi Intl Stadium',
    status: 'upcoming',
    startTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
];
