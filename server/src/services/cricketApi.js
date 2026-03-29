const axios = require('axios');
const fallbackMatches = require('../data/fallbackMatches');

const API_URL = process.env.CRICKET_API_URL || 'https://api.cricapi.com/v1/matches';
const API_KEY = process.env.CRICKET_API_KEY || '';
const CACHE_TTL = Number(process.env.MATCH_CACHE_TTL_MS || 60_000);

let cache = {
  expiresAt: 0,
  data: [],
};

const normalizeTeamName = (value) => {
  if (!value) return '';
  return String(value).trim();
};

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isIplMatch = (raw) => {
  const title = String(raw.name || raw.series || raw.matchType || raw.title || '').toLowerCase();
  return title.includes('ipl');
};

const resolveStatus = (raw, startTime) => {
  const lower = String(raw || '').toLowerCase();
  if (raw === true || lower.includes('live') || lower.includes('in progress')) {
    return 'live';
  }

  const now = Date.now();
  if (startTime && startTime.getTime() > now) {
    return 'upcoming';
  }

  if (lower.includes('completed') || lower.includes('result') || lower.includes('finished')) {
    return 'completed';
  }

  return 'completed';
};

const extractMatchId = (raw) => {
  return String(raw.id || raw.unique_id || raw.match_id || raw.matchId || raw.uid || '').trim();
};

const extractTeam = (raw, keyA, keyB, index) => {
  if (raw[keyA]) return normalizeTeamName(raw[keyA]);
  if (raw[keyB]) return normalizeTeamName(raw[keyB]);
  if (raw.teams && Array.isArray(raw.teams) && raw.teams[index]) {
    return normalizeTeamName(raw.teams[index].name || raw.teams[index]);
  }
  return '';
};

const parseApiMatch = (raw) => {
  const matchId = extractMatchId(raw);
  const teamA = extractTeam(raw, 'team-1', 'teamA', 0);
  const teamB = extractTeam(raw, 'team-2', 'teamB', 1);
  const startTime = parseDate(raw.dateTimeGMT || raw.dateTime || raw.start_date || raw.start_time || raw.start_time_gmt);
  const venue = normalizeTeamName(raw.venue || raw.venueName || raw.fullName || raw.ground || raw.location || '');
  const status = resolveStatus(raw.status || raw.matchStarted || raw.statusMessage || '', startTime);

  if (!matchId || !teamA || !teamB || !startTime) {
    return null;
  }

  return {
    matchId,
    teamA,
    teamB,
    startTime,
    status,
    venue,
  };
};

const buildMatchList = (rawMatches) => {
  const now = Date.now();
  return rawMatches
    .filter((raw) => {
      if (!isIplMatch(raw)) {
        return false;
      }

      const startTime = parseDate(raw.dateTimeGMT || raw.dateTime || raw.start_date || raw.start_time || raw.start_time_gmt);
      if (!startTime) {
        return false;
      }

      const status = resolveStatus(raw.status || raw.matchStarted || raw.statusMessage || '', startTime);
      if (status === 'live') {
        return true;
      }

      if (status === 'upcoming') {
        const timeDiff = startTime.getTime() - now;
        return timeDiff >= 0 && timeDiff <= 24 * 60 * 60 * 1000;
      }

      return false;
    })
    .map(parseApiMatch)
    .filter(Boolean);
};

const fetchApiMatches = async () => {
  if (!API_KEY) {
    throw new Error('Missing CRICKET_API_KEY');
  }

  const response = await axios.get(API_URL, {
    params: {
      apikey: API_KEY,
    },
    timeout: 10_000,
  });

  const payload = response.data?.data || response.data?.matches || response.data;
  if (!Array.isArray(payload)) {
    throw new Error('Unexpected API response shape');
  }

  return buildMatchList(payload);
};

const getIplMatches = async () => {
  if (Date.now() < cache.expiresAt && cache.data.length) {
    return cache.data;
  }

  try {
    const liveMatches = await fetchApiMatches();
    cache = {
      expiresAt: Date.now() + CACHE_TTL,
      data: liveMatches,
    };
    return liveMatches;
  } catch (error) {
    console.error('Cric API fetch failed:', error.message);
    if (cache.data.length) {
      return cache.data;
    }
    return fallbackMatches;
  }
};

module.exports = {
  getIplMatches,
};
