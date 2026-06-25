import { createClient } from '@supabase/supabase-js';
import { Octokit } from 'octokit';
import { storageGet, storageSet, storageUnset } from '@utils/chrome-storage.js';

const SUPABASE_URL = 'https://zyngevuwmgaakoqevrbx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nWCEat6ZAGliNHytDdWfmA_Ia20fmCP';

// SINGLETON: one GoTrueClient per browser context to avoid concurrent-instance warnings.
// Created lazily on first mount so the Chrome storage calls don't run at module load time.
let supabaseClient = null;
function getSupabaseClient() {
  if ( !supabaseClient ) {
    supabaseClient = createClient( SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        flowType: 'pkce',
        storage: {
          getItem:    ( key )      => storageGet( 'auth', key ).then( val => val ?? null ),
          setItem:    ( key, val ) => storageSet( 'auth', key, val ),
          removeItem: ( key )      => storageUnset( 'auth', key ),
        },
      },
    });
  }
  return supabaseClient;
}

export default {
  data() {
    return {
      supabaseClient: null,
      octokit: null,
      githubToken: null,
      profile: {},
      authenticating: false,
    };
  },

  async mounted() {

    this.supabaseClient = getSupabaseClient();

    // Restore a persisted token so the user doesn't have to re-auth on every open
    const token = await storageGet( 'auth', 'github_token' );
    if ( token ) {
      this.githubToken = token;
      this.octokit     = new Octokit({ auth: token });
      try {
        await this.loadProfile();
        await this.loadRepos();
      }
      catch ( err ) {
        // Only wipe the token if GitHub explicitly rejects it (401).
        // Network errors, rate limits, etc. should not log the user out.
        if ( err?.status === 401 ) await this.clearSession();
      }
    }
    
  },

  methods: {
    /**
     * Starts the GitHub OAuth flow via Supabase + Chrome identity.
     * Uses PKCE: the redirect carries a one-time `code` instead of tokens in the URL hash.
     * Supabase exchanges the code + stored code_verifier for a full session server-side.
     */
    async auth() {
    
      this.authenticating = true;
      this.statusMessage  = 'Opening GitHub login...';
      
      try {
      
        const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: chrome.identity.getRedirectURL(),
            skipBrowserRedirect: true,
            scopes: 'public_repo workflow',
          },
        });
        
        if ( error ) throw error;
        
        // NOTE: if I ever get the Firefox extension back up and running, I don't think it supports this method.
        chrome.identity.launchWebAuthFlow( { url: data.url, interactive: true }, async ( responseUrl ) => {
          
          if ( !responseUrl ) {
            this.statusMessage  = 'Login cancelled.';
            this.authenticating = false;
            return;
          }

          this.statusMessage = 'Authenticating...';
          
          try {
          
            // Extract the authorization code from the response URL
            const code = new URL( responseUrl ).searchParams.get( 'code' );
            if ( !code ) throw new Error( 'No authorization code in response' );

            // This is the critical step where the PKCE flow completes and we get a GitHub token without it ever touching the client.
            const { data: session, error: sessionError } = await this.supabaseClient.auth.exchangeCodeForSession( code );
            if ( sessionError ) throw sessionError;

            // Store the token in memory...
            this.githubToken = session.session.provider_token;
            // ABORT!
            if ( !this.githubToken ) throw new Error( 'No GitHub token in session' );
            // Store the token in Chrome local storage. Supabase drops provider_token after JWT refresh
            await storageSet( 'auth', 'github_token', this.githubToken );

            this.octokit = new Octokit({ auth: this.githubToken });
            this.statusMessage = '';
            await this.loadProfile();
            await this.loadRepos();
            
          } 
          catch ( err ) {
          
            console.error( err );
            this.statusMessage = 'Error: ' + err.message;
            
          } 
          finally {
          
            this.authenticating = false;
            
          }
          
        });
        
      }
        
      catch ( err ) {
      
        console.error( err );
        this.statusMessage  = 'Error: ' + err.message;
        this.authenticating = false;
        
      }
      
    },

    /** Wipes the Supabase session and persisted token. */
    async clearSession() {
    
      await this.supabaseClient?.auth.signOut();
      await storageUnset( 'auth', 'github_token' );
      
      this.octokit     = null;
      this.githubToken = null;
      this.profile     = {};
      
    },

    /** Signs out and resets all UI state. */
    async signOut() {
    
      await this.clearSession();
      
      this.repos         = [];
      this.selectedRepo  = '';
      this.statusMessage = '';
      this.progress      = { stage: '', total: 0, done: 0, percent: 0 };
      
    },

    /** Fetches the authenticated user's GitHub profile and stores it in `profile`. */
    async loadProfile() {

      const res = await this.ghGet( 'user' );

      // If the token is missing the workflow scope (e.g. authorized before we added it),
      // silently clear the session and re-trigger OAuth so the user gets a fresh token.
      const scopes = ( res.headers['x-oauth-scopes'] || '' ).split( ',' ).map( s => s.trim() );
      if ( !scopes.includes( 'workflow' ) ) {
        await this.clearSession();
        await this.auth();
        return;
      }

      this.profile = {
        login      : res.data.login,
        name       : res.data.name,
        avatar     : res.data.avatar_url,
        publicRepos: res.data.public_repos,
      };

    },
  },
};
