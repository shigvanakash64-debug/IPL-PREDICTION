const Match = require('../models/Match');
const Prediction = require('../models/Prediction');
const { findOrCreateUser } = require('../services/userService');
const { refreshMatches } = require('../services/matchUpdater');

const getRequestIdentifier = (req) => {
  return (
    req.headers['x-user-identifier'] ||
    req.query.userIdentifier ||
    req.body.userIdentifier ||
    req.ip ||
    'anonymous'
  );
};

const getMatches = async (req, res) => {
  try {
    const identifier = getRequestIdentifier(req);
    const user = await findOrCreateUser(identifier);

    let matches = await Match.find({ status: { $in: ['live', 'upcoming'] } }).sort({ status: -1, startTime: 1 }).lean();
    if (!matches.length) {
      await refreshMatches();
      matches = await Match.find({ status: { $in: ['live', 'upcoming'] } }).sort({ status: -1, startTime: 1 }).lean();
    }

    const predictions = await Prediction.find({ userId: user._id, matchId: { $in: matches.map((entry) => entry.matchId) } }).lean();
    const predictionMap = predictions.reduce((map, item) => {
      map[item.matchId] = item.selectedTeam;
      return map;
    }, {});

    const payload = matches.map((match) => ({
      matchId: match.matchId,
      teamA: match.teamA,
      teamB: match.teamB,
      status: match.status,
      startTime: match.startTime,
      venue: match.venue,
      totalVotes: (match.teamAVotes || 0) + (match.teamBVotes || 0),
      userPrediction: predictionMap[match.matchId] || null,
    }));

    res.json(payload);
  } catch (error) {
    console.error('Get matches failed:', error.message);
    res.status(500).json({ message: 'Unable to load matches at this time.' });
  }
};

module.exports = {
  getMatches,
};
