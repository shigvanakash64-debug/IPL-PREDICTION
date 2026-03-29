const Match = require('../models/Match');
const { getIplMatches } = require('./cricketApi');

const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const RETIRE_MATCH_MS = 48 * ONE_HOUR_MS;

const normalizeMatch = (raw) => ({
  matchId: raw.matchId,
  teamA: raw.teamA,
  teamB: raw.teamB,
  status: raw.status,
  venue: raw.venue,
  startTime: raw.startTime,
});

const refreshMatches = async () => {
  const rawMatches = await getIplMatches();
  if (!Array.isArray(rawMatches) || !rawMatches.length) {
    return;
  }

  const now = new Date();
  const operations = rawMatches.map((rawMatch) => {
    const normalized = normalizeMatch(rawMatch);
    return {
      updateOne: {
        filter: { matchId: normalized.matchId },
        update: {
          $set: normalized,
          $setOnInsert: {
            teamAVotes: 0,
            teamBVotes: 0,
            createdAt: now,
          },
        },
        upsert: true,
      },
    };
  });

  if (operations.length) {
    await Match.bulkWrite(operations);
  }

  await Match.updateMany({ status: 'upcoming', startTime: { $lte: new Date() } }, { status: 'live' });
  await Match.updateMany({ status: 'live', startTime: { $lte: new Date(Date.now() - 5 * ONE_HOUR_MS) } }, { status: 'completed' });
};

const cleanOldMatches = async () => {
  const cutoff = new Date(Date.now() - RETIRE_MATCH_MS);
  await Match.deleteMany({ startTime: { $lt: cutoff } });
};

const startMatchUpdater = () => {
  refreshMatches().catch((error) => {
    console.error('Initial match refresh failed:', error.message);
  });

  setInterval(() => {
    refreshMatches().catch((error) => {
      console.error('Match refresh failed:', error.message);
    });
  }, ONE_MINUTE_MS);

  setInterval(() => {
    cleanOldMatches().catch((error) => {
      console.error('Match cleanup failed:', error.message);
    });
  }, ONE_HOUR_MS);
};

module.exports = {
  startMatchUpdater,
  refreshMatches,
};
