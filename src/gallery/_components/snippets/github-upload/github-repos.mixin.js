export default {
  data() {
    return {
      repos: [],
      reposLoading: false,
      newRepoName: 'my-audible-library',
      showAllRepos: false,
      aleTopics: ['audible-library-extractor-gallery'],
      createRepoTimeout: null,
    };
  },

  computed: {
    selectedRepo: {
      get() { 
      
        return this.$store.state.sticky.githubSelectedRepo; 
        
      },
      set( val ) { 
        
        this.$store.commit( 'stickyProp', { key: 'githubSelectedRepo', value: val } ); 
        
      },
    },
  },

  watch: {
    async selectedRepo( newRepo, oldRepo ) {
    
      // Reset progress switching between repos, but not on initial load (oldRepo is null)
      // or when re-selecting the same repo (newRepo === oldRepo)
      if ( newRepo !== oldRepo ) this.resetProgress();
      
      // Load info for the new repo (Pages status, commit count, etc). This also updates
      // the default commit message based on the new repo's commit count.
      await this.loadSelectedRepoData( newRepo );
      
    },
  },

  beforeUnmount() {
  
    clearTimeout( this.createRepoTimeout );
    
  },

  methods: {
    /**
     * Loads all public repos for the authenticated user.
     * Restores the previously selected repo from local storage, or defaults to the first ALE repo.
     */
    async loadRepos() {
      
      this.reposLoading = true;
      
      try {
      
        // Get all public repos for the authenticated user
        const data = await this.octokit.paginate( this.octokit.rest.repos.listForAuthenticatedUser, {
          visibility : 'public',
          affiliation: 'owner',
          sort       : 'pushed',
          per_page   : 100,
        });
        
        // Topics come in the list response, no extra API calls needed.
        // Pages info and commit count are fetched lazily when a repo is selected.
        this.repos = data.map( r => {
          const topics = r.topics || [];
          return {
            name     : r.name,
            pushedAt : r.pushed_at,
            updatedAt: r.updated_at,
            createdAt: r.created_at,
            private  : r.private,
            branch   : r.default_branch,
            // A repo is an ALE repo if it has any of our marker topics tagged on it
            isAleRepo: !!_.intersection( topics, this.aleTopics ).length,
            topics,
            pagesUrl     : null,
            pagesStatus  : null,
            pagesMode    : null,
            pagesChecking: false,
            commitCount  : null,
          };
        });

        // Restore the last selected repo. If it no longer exists, fall back to the first ALE repo,
        // or straight to the "create new" form if the user has no repos at all.
        // If the value doesn't change, the watcher won't fire, so call loadSelectedRepoData explicitly.
        // If it does change, the watcher handles it, so don't call both.
        const stored = this.$store.state.sticky.githubSelectedRepo;
        const storedExists = stored && this.repos.find( r => r.name === stored );
        const fallback = this.repos.length === 0 ? this.newRepoKey : ( this.repos.find( r => r.isAleRepo )?.name || '' );
        const newSelected = storedExists ? stored : fallback;
        const watcherWillFire = newSelected !== this.selectedRepo;
        this.selectedRepo = newSelected;
        if ( !watcherWillFire ) await this.loadSelectedRepoData( newSelected );
        
      }
      finally {
        this.reposLoading = false;
      }
      
    },

    /**
     * Lazily fetches Pages and commit info for the given repo name.
     * Called from the selectedRepo watcher and explicitly from loadRepos (in case the
     * watcher doesn't fire because the stored value was already selected).
     * @param {string} repoName
     */
    async loadSelectedRepoData( repoName ) {
    
      if ( !repoName || repoName === this.newRepoKey ) return;
      
      const info = this.repos.find( r => r.name === repoName );
      if ( !info ) return;
      
      if ( info.pagesStatus === null ) await this.fetchRepoPages( info );
      if ( info.pagesStatus === 'building' ) this.pollPagesBuild( this.profile.login, repoName );
      if ( info.commitCount === null ) await this.fetchRepoDetails( info );
      
      await this.updateDefaultCommitMessage( repoName, info.commitCount );
      
    },

    /**
     * Lazily fetches GitHub Pages info for a single repo on selection.
     * @param {Object} repoEntry
     */
    async fetchRepoPages( repoEntry ) {
      try {
      
        const res = await this.ghGet( `repos/${this.profile.login}/${repoEntry.name}/pages` );
        repoEntry.pagesUrl    = res.data.html_url;
        repoEntry.pagesStatus = res.data.status;
        repoEntry.pagesMode   = res.data.build_type || 'legacy';
        
      }
      catch {
      
        // Pages not enabled or not accessible, so treat it as not set up
        repoEntry.pagesStatus = 'none';
        
      }
    },

    /**
     * Manual single re-check of a repo's Pages status, fired from the refresh icon on the
     * info card. One ping, not a poll. The in-flight flag spins the icon and blocks overlapping
     * requests so a spam-clicker can't stack calls.
     *
     * Reads the real in-progress build via the shared fetchPagesBuildStatus so the refresh button
     * agrees with the background poll, instead of the site-level `pages` endpoint that lingers on
     * "built" from the previous deploy while a new build is still running.
     * @param {string} repoName
     */
    async recheckRepoPages( repoName ) {

      const repoEntry = this.repos.find( r => r.name === repoName );
      if ( !repoEntry || repoEntry.pagesChecking ) return;

      repoEntry.pagesChecking = true;

      try {

        // Resolve the URL and build mode first if we've never loaded them ( the helper branches on mode ).
        if ( !repoEntry.pagesUrl || !repoEntry.pagesMode ) await this.fetchRepoPages( repoEntry );

        // Pages not set up: nothing to poll, fetchRepoPages already left the status as 'none'.
        if ( repoEntry.pagesStatus === 'none' ) return;

        const useWorkflowPoll = repoEntry.pagesMode === 'workflow';
        const { pagesStatus } = await this.fetchPagesBuildStatus( this.profile.login, repoEntry.name, useWorkflowPoll );
        repoEntry.pagesStatus = pagesStatus;

      }
      catch {} // Non-fatal: leave the last known status in place if the check fails
      finally {
        repoEntry.pagesChecking = false;
      }

    },

    /**
     * Lazily fetches the commit count for a single repo.
     * Uses the Link header pagination trick: request 1 commit per page and read the "last"
     * page number from the Link header. This avoids fetching and counting all commits.
     * @param {Object} repoEntry
     */
    async fetchRepoDetails( repoEntry ) {
      try {

        const res   = await this.ghGet( `repos/${this.profile.login}/${repoEntry.name}/commits`, { per_page: 1 } );
        const match = ( res.headers?.link || '' ).match( /page=(\d+)>; rel="last"/ );
        // If there's no Link header, the repo has only 1 commit (no pagination needed)
        repoEntry.commitCount = match ? parseInt( match[1] ) : 1;

      }
      catch ( err ) {
        if ( err.response?.status === 404 ) {
          repoEntry.commitCount = 0;
        }
        else {
          console.error( `Failed to fetch commit count for ${repoEntry.name}:`, err );
          throw err;
        }
      }
    },

    /**
     * Creates a new public repo, tags it as ALE, and enables GitHub Pages.
     * Pages setup is retried up to 6 times because `auto_init` needs a moment to land
     * the initial commit before the Pages API will accept a source configuration.
     */
    async createRepo() {

      // Don't allow creating an empty repo
      const name = this.newRepoName.trim();
      if ( !name ) return;

      // Clear any pending timeout from a previous attempt
      clearTimeout( this.createRepoTimeout );
      this.statusMessage = '';

      try {
      
        // CREATE NEW REPO
        this.statusMessage = `Creating "${name}"...`;
        const { data: newRepo } = await this.octokit.rest.repos.createForAuthenticatedUser({
          name,
          private  : false,
          auto_init: true, // Creates an initial commit so the branch exists immediately
        });
        
        // Get branch name from response just to be safe, but it should always be "main" or "master"
        const branch = newRepo.default_branch;

        // Tag repo with ale topic automatically for easy discovery in the repo dropdown.
        await this.tagRepoWithAle( name );

        // STARTING PAGES SETUP
        this.statusMessage = `Setting up website for "${name}"...`;

        // workflow build_type doesn't require a prior commit to exist, so a single call is enough.
        // 409 means Pages was already enabled (shouldn't happen on a brand-new repo, but guard anyway).
        let pagesEnabled = false;
        try {
          const res = await this.ghPost( `repos/${this.profile.login}/${name}/pages`, { build_type: 'workflow' } );
          if ( res.status === 201 || res.status === 409 ) pagesEnabled = true;
        }
        catch ( err ) {
          if ( err.response?.status === 409 ) pagesEnabled = true;
          else console.warn( 'Could not enable Pages automatically:', err );
        }

        // FINISHED PAGES SETUP: if it still isn't enabled, show a warning but continue anyway.
        if ( !pagesEnabled ) console.warn( 'Could not enable Pages automatically' );
        
        // Reload repo list to include the new repo
        await this.loadRepos();
        
        // Select new repo
        this.selectedRepo = name;
        
        // Finalize
        this.newRepoName  = '';
        this.statusMessage = pagesEnabled ?
          `"${name}" created with website enabled!` :
          `"${name}" created! Enable GitHub Pages manually in repo settings.`;
        
        // Clear status message after 5 seconds to keep the UI clean, but allow time for the user to read it in case of slow loading.
        this.createRepoTimeout = setTimeout( () => { this.statusMessage = ''; }, 5000 );
        
      }
      catch ( err ) {
        this.statusMessage = 'Failed to create: ' + err.message;
      }
    },

    /**
     * Adds or removes ALE topics on a repo and syncs local state.
     * @param {string} name Repo name
     * @param {{ action: 'add'|'remove' }} [options]
     */
    async tagRepoWithAle( name, options = { action: 'add' } ) {
      try {

        const repo = this.repos.find( r => r.name === name );
        if ( !repo ) return;

        const currentTopics = repo.topics;

        // Add or remove ALE topics based on the action. 
        // Adding is a simple union, removing is a filter. 
        let nextTopics;
        if ( options.action === 'remove' ) {
          nextTopics = currentTopics.filter( t => !this.aleTopics.includes( t ) );
        }
        else {
          nextTopics = Array.from( new Set( [...currentTopics, ...this.aleTopics] ) );
        }

        // Actually update topics via the API and get the updated list in response
        const res = await this.ghPut( `repos/${this.profile.login}/${name}/topics`, { names: nextTopics } );

        // Update local state
        repo.topics    = res.data.names;
        // A repo is an ALE repo if it has any of our marker topic(s)
        repo.isAleRepo = !!_.intersection( res.data.names, this.aleTopics ).length;

        // If the selected repo was just untagged while in ALE-only view, switch to "show all"
        // so it doesn't disappear from the dropdown while the user is still looking at it.
        if ( options.action === 'remove' && !repo.isAleRepo && !this.showAllRepos ) {
          this.showAllRepos = true;
        }
        
      }
      catch ( err ) {
        console.error( 'Failed to update topics:', err );
      }
    },

    /**
     * Switches a repo's Pages build source between 'workflow' (GitHub Actions) and 'legacy' (deploy from branch).
     * Also persists the user's preference so it survives page reloads.
     * @param {string} repoName
     * @param {'workflow'|'legacy'} mode
     */
    async setPagesMode( repoName, mode ) {

      const repoEntry = this.repos.find( r => r.name === repoName );
      if ( !repoEntry ) return;

      try {

        try {
          await this.ghPut( `repos/${this.profile.login}/${repoName}/pages`, { build_type: mode } );
        }
        catch ( err ) {
          if ( err.response?.status === 404 ) {
            await this.ghPost( `repos/${this.profile.login}/${repoName}/pages`, { build_type: mode } );
          }
          else {
            throw err;
          }
        }
        repoEntry.pagesMode = mode;

      }
      catch ( err ) {
        console.error( `Failed to switch Pages mode for ${repoName}:`, err );
      }

    },

    /**
     * Derives the default commit message for the next upload (e.g. "Upload #3 · ALE v2.1").
     * Accepts a pre-fetched count to avoid a redundant API call when fetchRepoDetails already ran.
     * @param {string} repo
     * @param {number|null} knownCount Already-fetched commit count, or null to fetch it
     */
    async updateDefaultCommitMessage( repo, knownCount = null ) {
    
      // Don't update if the repo isn't selected, or if we're creating a new repo
      if ( !repo || repo === this.newRepoKey || !this.githubToken ) return;
      
      // Add version number to the commit message if available, to help users identify
      // which version of ALE they used for the upload. This is especially helpful if they
      // have multiple versions of ALE over time, or if they're uploading on behalf of
      // someone else and want to keep track of it.
      const version = this.$store.state.version;
      const versionStr = version ? ` (ALE v${version})` : '';
      
      let commitCount;
      if ( knownCount !== null ) {
        commitCount = knownCount + 1;
      }
      else {
        try {
          // Fetch the commit count if it wasn't already fetched by fetchRepoDetails. This
          // is needed to generate the default commit message for the next upload, which
          // includes the upload number (e.g. "Upload #4").
          const res   = await this.ghGet( `repos/${this.profile.login}/${repo}/commits`, { per_page: 1 } );
          // If there's no Link header, the repo has only 1 commit (no pagination needed)
          const match = ( res.headers?.link || '' ).match( /page=(\d+)>; rel="last"/ );
          // Add 1 to the count because the next commit will be one more than the current count.
          commitCount = match ? parseInt( match[1] ) + 1 : 2;
        }
        catch ( err ) {
          if ( err.response?.status === 404 ) {
            commitCount = 2;
          }
          else {
            console.error( `Failed to fetch commit count for ${repo}:`, err );
            throw err;
          }
        }
      }
      
      // Finally update the default commit message (User can always edit it before the upload...)
      this.defaultCommitMessage = `Upload #${commitCount}${versionStr}`;
      this.commitMessage        = this.defaultCommitMessage;
      
    },

  },
};
