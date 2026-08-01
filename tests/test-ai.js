const aiService = require('../src/services/aiService');
const dotenv = require('dotenv');

dotenv.config();

async function testAIService() {
    console.log('--- Testing AI Service ---');
    
    const companion = aiService.normalizeCompanion({
        name: 'TestLia',
        archetype: 'bienveillant'
    });

    console.log('Generated System Prompt:', companion.systemPrompt.substring(0, 100) + '...');

    try {
        const result = await aiService.generateResponse(
            "Bonjour, comment vas-tu ?",
            companion,
            []
        );
        console.log('AI Response:', result.response);
        console.log('Provider used:', result.provider);
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAIService();
