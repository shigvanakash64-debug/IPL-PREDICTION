const Match = require('../models/Match');
const Prediction = require('../models/Prediction');
const { findOrCreateUser } = require('../services/userService');

const getRequestIdentifier = (req) => {
  return (
    req.headers['x-user-identifier'] ||
    req.query.userIdentifier ||
    req.body.userIdentifier ||
    req.ip ||
    'anonymous'
  );
};

const createPrediction = async (req, res) => {
  try {
    const { selectedTeam } = req.body;
    const { matchId } = req.params;

    if (!selectedTeam) {
      return res.status(400).json({ message: 'selectedTeam is required.' });
    }

    const match = await Match.findOne({ matchId });
    if (!match) {
      return res.status(404).json({ message: 'Match not found.' });
    }

    const normalizedTeam = String(selectedTeam).trim();
    if (normalizedTeam !== match.teamA && normalizedTeam !== match.teamB) {
      return res.status(400).json({ message: 'selectedTeam must match one of the contesting teams.' });
    }

    const identifier = getRequestIdentifier(req);
    const user = await findOrCreateUser(identifier);

    const existingPrediction = await Prediction.findOne({ userId: user._id, matchId });
    if (existingPrediction) {
      return res.status(400).json({ message: 'You have already predicted this match.' });
    }

    const prediction = new Prediction({ userId: user._id, matchId, selectedTeam: normalizedTeam });
    await prediction.save();

    if (normalizedTeam === match.teamA) {
      match.teamAVotes += 1;
    } else {
      match.teamBVotes += 1;
    }

    await match.save();

    return res.json({
      matchId: match.matchId,
      teamA: match.teamA,
      teamB: match.teamB,
      totalVotes: match.teamAVotes + match.teamBVotes,
      selectedTeam: normalizedTeam,
    });
  } catch (error) {
    console.error('Prediction failed:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate prediction detected.' });
    }
    res.status(500).json({ message: 'Unable to save prediction at this time.' });
  }
};

module.exports = {
  createPrediction,
};
