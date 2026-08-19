const PLANS = Object.freeze({
  free: Object.freeze({
    dailyMessages: 150,
    slidingWindowHours: 24,
    maxActiveCompanions: 2,
    canCreateCustomCompanion: false,
    historyRetentionDays: 90,
    exports: Object.freeze([]),
    warningThresholds: Object.freeze([0.8, 0.95]),
    antiAbuseRatePerMinute: 20,
    features: Object.freeze({ privateMode: false, customTheme: false, priorityQueue: false, twoFA: false, exclusivePersonalities: false, pinMessage: false, advancedModels: false })
  }),
  premium: Object.freeze({
    dailyMessages: Infinity,
    slidingWindowHours: 24,
    maxActiveCompanions: Infinity,
    canCreateCustomCompanion: true,
    historyRetentionDays: Infinity,
    exports: Object.freeze(['pdf', 'txt', 'json']),
    warningThresholds: Object.freeze([]),
    antiAbuseRatePerMinute: 30,
    features: Object.freeze({ privateMode: true, customTheme: true, priorityQueue: true, twoFA: true, exclusivePersonalities: true, pinMessage: true, advancedModels: true })
  })
});

module.exports = { PLANS };
