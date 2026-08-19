const DEFAULT_COMPANIONS = Object.freeze([
  Object.freeze({ id: 'simon', name: 'Simon', gender: 'M', role: 'Ami bienveillant', defaultPhotoUrl: null, defaultLang: 'fr' }),
  Object.freeze({ id: 'junior', name: 'Junior', gender: 'M', role: 'Ami créatif', defaultPhotoUrl: null, defaultLang: 'fr' }),
  Object.freeze({ id: 'kevin', name: 'Kevin', gender: 'M', role: 'Ami confident', defaultPhotoUrl: null, defaultLang: 'fr' }),
  Object.freeze({ id: 'ludmilla', name: 'Ludmilla', gender: 'F', role: 'Mentor inspirant', defaultPhotoUrl: null, defaultLang: 'fr' }),
  Object.freeze({ id: 'annabella', name: 'Annabella', gender: 'F', role: 'Complice', defaultPhotoUrl: null, defaultLang: 'fr' }),
  Object.freeze({ id: 'lia', name: 'LIA', gender: 'X', role: 'Présence attentive', defaultPhotoUrl: null, defaultLang: 'fr' })
]);

const PERSONALITY_TYPES = Object.freeze([
  Object.freeze({ id: 'friend_kind', label: 'Ami bienveillant', maturity: 'all' }),
  Object.freeze({ id: 'friend_creative', label: 'Ami créatif', maturity: 'all' }),
  Object.freeze({ id: 'friend_confidant', label: 'Ami confident', maturity: 'all' }),
  Object.freeze({ id: 'mentor', label: 'Mentor inspirant', maturity: 'all' }),
  Object.freeze({ id: 'partner_playful', label: 'Complice', maturity: 'all' }),
  Object.freeze({ id: 'partner_flirty', label: 'Flirt léger', maturity: 'mature' })
]);

const CHARACTER_TRAITS = Object.freeze([
  Object.freeze({ id: 'caring', label: 'Attentionné·e', maturity: 'all' }),
  Object.freeze({ id: 'witty', label: 'Vif·ve d’esprit', maturity: 'all' }),
  Object.freeze({ id: 'serene', label: 'Serein·e', maturity: 'all' }),
  Object.freeze({ id: 'passionate', label: 'Passionné·e', maturity: 'all' }),
  Object.freeze({ id: 'mischievous', label: 'Espiègle', maturity: 'all' }),
  Object.freeze({ id: 'coquine', label: 'Coquin·e', maturity: 'mature' }),
  Object.freeze({ id: 'fontaine', label: 'Expressif·ve', maturity: 'mature' }),
  Object.freeze({ id: 'intense', label: 'Intense', maturity: 'all' })
]);

module.exports = { DEFAULT_COMPANIONS, PERSONALITY_TYPES, CHARACTER_TRAITS };
