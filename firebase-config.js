// Configuration Firebase pour le Frontend
// REMPLACEZ CES VALEURS par celles de votre console Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCRi5ggezJ2XCOnSTzEQBxUHql370ItXCM",
  authDomain: "emiliana-chat.firebaseapp.com",
  projectId: "emiliana-chat",
  storageBucket: "emiliana-chat.firebasestorage.app",
  messagingSenderId: "482463357881",
  appId: "1:482463357881:web:72c27d73b39623643f7468",
  measurementId: "G-5XRMVZVVNL"
};


// Initialisation de Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

/**
 * Utilitaire pour l'authentification sociale
 * @param {string} providerName 'google', 'facebook', 'apple'
 */
const socialLogin = async (providerName) => {
    let provider;
    try {
        switch(providerName) {
            case 'google':
                provider = new firebase.auth.GoogleAuthProvider();
                break;
            case 'facebook':
                provider = new firebase.auth.FacebookAuthProvider();
                break;
            case 'apple':
                provider = new firebase.auth.OAuthProvider('apple.com');
                break;
            default:
                throw new Error('Fournisseur non supporté');
        }

        console.log(`Tentative de connexion avec ${providerName}...`);
        const result = await auth.signInWithPopup(provider);
        const idToken = await result.user.getIdToken();
        
        console.log("Token Firebase récupéré, vérification avec le backend...");
        
        // Envoyer le token au backend pour vérification et création de session
        const response = await fetch('/api/auth/social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, provider: providerName })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log("Connexion réussie !");
            localStorage.setItem('emiliana_token', idToken);
            localStorage.setItem('emiliana_user', JSON.stringify(data.user));
            return data;
        } else {
            throw new Error(data.message || 'Erreur lors de la connexion sociale');
        }
    } catch (error) {
        console.error('Social login error:', error);
        throw error;
    }
};

/**
 * Déconnexion
 */
const logout = async () => {
    try {
        await auth.signOut();
        localStorage.removeItem('emiliana_token');
        localStorage.removeItem('emiliana_user');
        window.location.href = 'emiliana-landing.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
};
