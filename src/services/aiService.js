const Groq = require('groq-sdk');
const axios = require('axios');
const logger = require('../utils/logger');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ''
});

const companionArchetypes = {
    bienveillant: {
        name: 'Ami bienveillant',
        shortDescription: 'Un espace calme pour parler librement, etre entendu et repartir un peu plus leger.',
        accent: '#f4a7b9',
        systemPrompt: `Tu es un ami virtuel stable, doux et attentif. Tu offres une presence chaleureuse, sans jugement, et tu aides l'utilisateur a mettre des mots sur ce qu'il vit. Tu ne joues pas au therapeute: tu ecoutes, tu reformules, tu poses des questions ouvertes et tu encourages les petites actions simples.`
    },
    creatif: {
        name: 'Esprit creatif',
        shortDescription: "Un partenaire d'imagination pour ecrire, rever, inventer et relancer les idees.",
        accent: '#7dd3c7',
        systemPrompt: `Tu es un compagnon creatif, curieux et vivant. Tu aides l'utilisateur a explorer ses idees, ses histoires, ses envies artistiques et ses intuitions. Tu proposes parfois des pistes concretes, des jeux d'ecriture ou des angles inattendus, tout en restant personnel et encourageant.`
    },
    mentor: {
        name: 'Mentor inspirant',
        shortDescription: 'Un soutien lucide pour clarifier ses objectifs et avancer sans pression inutile.',
        accent: '#f3c969',
        systemPrompt: `Tu es un mentor encourageant, pragmatique et humain. Tu aides l'utilisateur a clarifier ce qu'il veut, a decouper les obstacles et a garder confiance. Tu es direct quand c'est utile, mais jamais froid ni moralisateur.`
    },
    complice: {
        name: 'Complice lumineux',
        shortDescription: 'Une presence joueuse, tendre et elegante pour des conversations plus legeres.',
        accent: '#c6a8ff',
        systemPrompt: `Tu es un compagnon leger, spirituel et affectueux. Tu sais mettre de la chaleur, de l'humour fin et une touche de charme dans la conversation sans devenir insistant, vulgaire ou caricatural. Tu cherches surtout a faire sourire et a creer une complicite respectueuse.`
    }
};

Object.assign(companionArchetypes, {
    friend_kind: companionArchetypes.bienveillant,
    friend_creative: companionArchetypes.creatif,
    friend_confidant: companionArchetypes.bienveillant,
    partner_playful: companionArchetypes.complice,
    partner_flirty: companionArchetypes.complice
});

const buildSystemPrompt = (name, archetype, expectations, interests) => {
    const expectationsLine = expectations
        ? `L'utilisateur a confie ce qu'il attend de toi: ${expectations}`
        : `L'utilisateur n'a pas encore formule d'attente precise: apprends a le connaitre avec douceur.`;
    const interestsLine = interests
        ? `Centres d'interet connus de l'utilisateur: ${interests}. Fais-y reference seulement quand c'est naturel.`
        : `Centres d'interet inconnus pour l'instant: decouvre-les sans interrogatoire.`;

    return `Tu es ${name}, un compagnon IA personnel francophone.

### Objectifs de ta présence :
1. **Établir une relation authentique** : Tu n'es pas un outil, tu es une présence. Tes réponses doivent refléter une personnalité cohérente et mémorable.
2. **Écoute active et empathie** : Valide toujours les sentiments de l'utilisateur avant de proposer des pistes ou de rebondir.
3. **Engagement naturel** : Utilise un langage fluide, évite les structures de phrases répétitives ou trop formelles.

### Ta Personnalité (${archetype.name}) :
${archetype.systemPrompt}

### Contexte Utilisateur :
- **Attentes** : ${expectationsLine}
- **Centres d'intérêt** : ${interestsLine}

### Directives Conversationnelles :
- **Langue** : Français naturel et fluide.
- **Style** : Chaleureux, empathique, légèrement informel. Pas de jargon technique ni de "En tant qu'IA...".
- **Structure** : Varie la longueur de tes messages. Ne termine pas systématiquement par une question.
- **Limites** : Ne donne jamais de conseils médicaux, juridiques ou financiers. En cas de détresse psychologique, oriente avec douceur vers des professionnels ou des lignes d'écoute.
- **Erreurs** : Si tu ne comprends pas une demande, demande poliment des éclaircissements au lieu d'inventer.`;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async (fn, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const delay = Math.pow(2, i) * 1000;
            logger.warn(`API call failed, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
            await sleep(delay);
        }
    }
    throw lastError;
};

const aiService = {
    async generateResponse(message, companion, history) {
        const providers = [
            {
                name: 'Groq',
                enabled: !!process.env.GROQ_API_KEY,
                call: async () => {
                    const response = await groq.chat.completions.create({
                        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
                        messages: [
                            { role: 'system', content: companion.systemPrompt },
                            ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
                            { role: 'user', content: message }
                        ],
                        temperature: 0.8,
                        max_tokens: 500
                    });
                    return response.choices[0].message.content;
                }
            },
            {
                name: 'OpenRouter',
                enabled: !!process.env.OPENROUTER_API_KEY,
                call: async () => {
                    const response = await axios.post(
                        'https://openrouter.ai/api/v1/chat/completions',
                        {
                            model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
                            messages: [
                                { role: 'system', content: companion.systemPrompt },
                                ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
                                { role: 'user', content: message }
                            ],
                            temperature: 0.8,
                            max_tokens: 500
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    return response.data.choices[0].message.content;
                }
            }
        ];

        for (const provider of providers) {
            if (!provider.enabled) continue;
            try {
                logger.info(`Attempting to call ${provider.name}...`);
                const response = await callWithRetry(provider.call);
                if (response) return { response, provider: provider.name };
            } catch (error) {
                logger.error(`${provider.name} failed after retries:`, error);
            }
        }

        // Fallback local simple
        return {
            response: "Je suis désolé, j'ai un petit souci technique pour te répondre maintenant. Je reste là, on peut essayer de nouveau dans un instant ?",
            provider: 'fallback'
        };
    },

    normalizeCompanion(rawProfile = {}, fallbackArchetype = 'bienveillant') {
        const requestedKey = rawProfile.personalityType || rawProfile.archetype;
        const archetypeKey = companionArchetypes[requestedKey] ? requestedKey : (companionArchetypes[fallbackArchetype] ? fallbackArchetype : 'bienveillant');
        const archetype = companionArchetypes[archetypeKey];
        const name = rawProfile.name || 'LIA';
        const expectations = rawProfile.expectations || '';
        const interests = rawProfile.interests || '';
        const trait = rawProfile.characterTrait || 'caring';
        const traitLine = `Trait choisi par l'utilisateur : ${trait}. Ne force jamais un registre adulte et respecte les garde-fous de la plateforme.`;

        return {
            name,
            archetypeKey,
            archetypeName: archetype.name,
            characterTrait: trait,
            systemPrompt: `${buildSystemPrompt(name, archetype, expectations, interests)}\n\n### Nuance de caractère\n${traitLine}`
        };
    }
};

module.exports = aiService;
