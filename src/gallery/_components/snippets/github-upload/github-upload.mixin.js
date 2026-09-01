import axios from 'axios';

export default {
  data() {
    return {
      isSyncing: false,
      wasCancelled: false,
      abortController: null,
      rateLimitPromise: null,
      rateLimitResolve: null,
      rateLimitController: null,
      isPolling: false,
      pollAborted: false,
      pollTimedOut: false,
      statusMessage: '',
      commitMessage: '',
      defaultCommitMessage: 'Upload #1',
      uploadComplete: false,
      uploadFailed: false,
      failedMessage: '',
      completedPagesUrl: null,
      completedHashRoute: 'library',
      uploadTimestamp: null,
      includeReadme: true,
      stages: ['Uploading files', 'Organizing files', 'Saving changes', 'Done'],
      progress: { stage: '', total: 0, done: 0, percent: 0 },
    };
  },

  beforeUnmount() {
    this.pollAborted = true;
    this.cancel();
  },

  methods: {

    /** Resets all progress and result state back to the idle baseline. */
    resetProgress() {
      
      this.uploadFailed = false;
      this.uploadComplete = false;
      this.wasCancelled = false;
      this.failedMessage = '';
      this.statusMessage = '';
      this.progress = { stage: '', total: 0, done: 0, percent: 0 };
      
    },

    /** Aborts any in-progress upload and resolves any active rate-limit countdown. */
    cancel() {
      
      // Stop the main upload by aborting all in-flight blob requests
      if ( this.abortController ) {
        this.abortController.abort();
        this.abortController = null;
      }
      // Stop the rate-limit countdown by aborting the signal that blocks workers during limits
      if ( this.rateLimitController ) {
        this.rateLimitController.abort();
        this.rateLimitController = null;
      }
      // Resolve the rate-limit promise so workers aren't left hanging if a limit countdown was active
      if ( this.rateLimitResolve ) {
        this.rateLimitResolve();
        this.rateLimitResolve = null;
        this.rateLimitPromise = null;
      }
      
      // Reset the upload states...
      this.isSyncing = false;
      this.uploadComplete = false;
      this.uploadFailed = false;
      this.wasCancelled = this.progress.done > 0;
      this.statusMessage = '';
      this.progress = { stage: '', total: 0, done: 0, percent: 0 };
      
    },

    /**
     * Returns to the normal screen after a completed upload.
     * Refreshes commit count so the next default message is correct.
     */
    onCompleteBack() {
    
      this.uploadComplete = false;
      this.pollAborted = true; // Leaving the complete screen stops the background build poll; no point checking a site the user walked away from
      this.pollTimedOut = false;
      this.resetProgress(); // just to be safe, though it should already be reset by the time we show the complete screen
      
      // Refresh the commit count so the next default message is correct (e.g. "Upload #2" instead of "Upload #1" on the next upload)
      const repoInfo = this.repos.find( r => r.name === this.selectedRepo );
      if ( repoInfo ) {
        repoInfo.commitCount = null;
        this.fetchRepoDetails( repoInfo ).then(() => {
          this.updateDefaultCommitMessage( this.selectedRepo, repoInfo.commitCount );
        });
      }
      
    },

    /** Returns to the normal screen after a failed upload. */
    onFailedBack() {
      this.uploadFailed = false;
      this.resetProgress(); // just to be safe, though it should already be reset by the time we show the failed screen
    },

    /** Clears the blob cache for the current repo and starts a fresh upload. */
    async cleanUpload() {
    
      // Abort any in-flight requests from a previous attempt
      this.cancel(); 
      this.resetProgress();
      this.wasCancelled = false;
      // Clear the blob cache
      await this.clearBlobCache( this.profile.login, this.selectedRepo );
      
      // Start a new upload
      this.uploadLibrary();
      
    },

    /** Clears the error state and retries the upload. */
    retryUpload() {
    
      this.cancel(); // Clean up any lingering requests or rate-limit countdowns from the failed attempt
      this.uploadFailed = false;
      this.failedMessage = '';
      
      // Retry the upload with the existing cache.
      this.uploadLibrary();
      
    },

    /** Uploads all library files to the selected GitHub repo as a single Git commit. */
    async uploadLibrary() {
    
      // Prevent multiple simultaneous uploads or a repo isn't selected (if that could happen, it would be a bug).
      if ( this.isSyncing || !this.canUpload ) return;
      
      // Clear any leftover state from a previous run (a stalled progress bar, a stale error) before
      // we start, so a fresh upload never briefly shows the old run's percentage or result screen.
      this.resetProgress();

      this.isSyncing       = true;
      this.abortController = new AbortController();
      const { signal }     = this.abortController;

      try {
      
        const owner = this.profile.login;
        const repo  = this.selectedRepo;
        const { files, hasBooks } = await this.getFiles( { array: true } );
        this.completedHashRoute = hasBooks ? 'library' : 'wishlist';

        if ( this.includeReadme ) {
          files.push({
            path: 'README.md',
            content: `# Audible Library\n\nWebsite: [${owner}.github.io/${repo}](https://${owner}.github.io/${repo}/#/${this.completedHashRoute})\n\n> This website was generated by [Audible Library Extractor](https://github.com/joonaspaakko/audible-library-extractor).\n`,
          });
        }

        this.progress.total   = files.length;
        this.progress.done    = 0;
        this.progress.percent = 0;

        // We need the current HEAD SHA so the new commit can point back to it as its parent,
        // keeping the branch history intact instead of creating an orphan commit.
        const { data: repoData } = await this.octokit.rest.repos.get( { owner, repo } );
        const branch = repoData.default_branch;

        // WORKFLOW FILE
        // Always inject the GitHub Actions Pages workflow, migrating legacy repos on their next upload.
        // Check (and if needed fix) whether GitHub-owned actions are allowed to run BEFORE this file
        // is pushed: the workflow triggers on push regardless of Pages mode, so checking any later
        // risks a real Actions run queuing and failing before we've had a chance to fix permissions.
        const repoEntry = this.repos.find( r => r.name === repo );
        const canUseWorkflow = repoEntry?.pagesMode === 'workflow' || await this.ensureGithubActionsAllowed( repo );
        files.push({
          path: '.github/workflows/deploy.yml',
          content: [
            'name: Deploy to GitHub Pages',
            'on:',
            `  push:`,
            `    branches: ["${branch}"]`,
            '  workflow_dispatch:',
            '',
            'permissions:',
            '  contents: read',
            '  pages: write',
            '  id-token: write',
            '',
            'concurrency:',
            '  group: "pages"',
            '  cancel-in-progress: false',
            '',
            'jobs:',
            '  deploy:',
            '    environment:',
            '      name: github-pages',
            '      url: ${{ steps.deployment.outputs.page_url }}',
            '    runs-on: ubuntu-latest',
            '    steps:',
            '      - name: Checkout',
            '        uses: actions/checkout@v7',
            '      - name: Setup Pages',
            '        uses: actions/configure-pages@v6',
            '      - name: Upload artifact',
            '        uses: actions/upload-pages-artifact@v5',
            '        with:',
            "          path: '.'",
            '      - name: Deploy to GitHub Pages',
            '        id: deployment',
            '        uses: actions/deploy-pages@v5',
          ].join( '\n' ),
        });
        // Update the total now that we've added the workflow file
        this.progress.total = files.length;
        const { data: ref } = await this.octokit.rest.git.getRef( { owner, repo, ref: `heads/${branch}` } );
        const latestCommitSha = ref.object.sha;

        // UPLOAD BLOBS
        const blobShas = await this.uploadBlobs( files, owner, repo, repoData.created_at, signal );
        if ( signal.aborted ) return;

        // ORGANIZE TREE
        // Git trees describe the directory structure by mapping file paths to blob SHAs.
        // We build the tree in chunks so the progress bar moves during this step.
        // The first chunk has no base_tree, which creates a clean slate and removes
        // any stale filenames left over from cache-busted files in prior uploads.
        this.progress.stage   = 'Organizing files';
        this.statusMessage    = 'Organizing files...';
        this.progress.percent = 72;

        const TREE_CHUNK   = 100;
        let currentTreeSha = null;
        const totalChunks  = Math.ceil( files.length / TREE_CHUNK );
        let chunksDone     = 0;
        
        // Build the tree in chunks so we can update the progress bar as we go. Each chunk
        // is a separate API call, but they have to be sequential since each one depends
        // on the previous one's result.
        for ( let i = 0; i < files.length; i += TREE_CHUNK ) {
          
          if ( signal.aborted ) return;
          
          // Build the tree
          const chunk = files.slice( i, i + TREE_CHUNK );
          const treeParams = {
            owner, repo,
            tree: chunk.map( ( f, j ) => ({ path: f.path, mode: '100644', type: 'blob', sha: blobShas[i + j] }) ),
          };
          
          // For subsequent chunks, use the previous tree as the base; first chunk has no base_tree to create a clean slate.
          if ( currentTreeSha ) treeParams.base_tree = currentTreeSha;

          // Create the tree in GitHub, which gives us a new tree SHA that represents the
          // directory structure for all files uploaded so far. The final tree SHA after
          // the last chunk is what we point the commit to.
          const { data: tree } = await this.ghPost( `repos/${owner}/${repo}/git/trees`, treeParams );

          // Store the tree SHA for the next chunk's base_tree
          currentTreeSha = tree.sha;
          // Update counter
          chunksDone++;
          // Update progress bar...
          this.progress.percent = 72 + Math.round( ( chunksDone / totalChunks ) * 15 );
          // Update the status message with the file count progress, e.g. "Organizing files... 150/450"
          this.statusMessage = `Organizing files… ${Math.min( i + TREE_CHUNK, files.length )}/${files.length}`;
          
        }

        // COMMIT AND PUSH
        // createCommit writes the commit object; updateRef moves the branch pointer to it.
        this.progress.stage   = 'Saving changes';
        this.statusMessage    = 'Saving...';
        this.progress.percent = 88;

        // Create the commit object linking the tree, parent commit, and message, then move the
        // branch pointer to it, which publishes the changes to GitHub.
        // If the branch moved since we grabbed latestCommitSha (the Pages workflow committed,
        // or a prior upload landed while this one was running), updateRef fails as a non-fast-forward.
        // Our tree is a full snapshot, so we recover by re-parenting onto the real tip and retrying.
        let parentSha = latestCommitSha;
        let commit;
        for ( let attempt = 0; ; attempt++ ) {

          const { data: newCommit } = await this.octokit.rest.git.createCommit({
            owner, repo,
            message: this.commitMessage.trim() || this.defaultCommitMessage,
            tree: currentTreeSha,
            parents: [parentSha], // Link to the previous commit to maintain history
          });

          try {
            await this.octokit.rest.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: newCommit.sha });
            commit = newCommit;
            break;
          }
          catch ( err ) {

            // Only a non-fast-forward is recoverable, and only a couple of times before we give up.
            const notFastForward = err?.response?.status === 422 && /fast forward/i.test( err?.message || '' );
            if ( !notFastForward || attempt >= 2 ) throw err;

            // Re-read the branch tip and loop to rebuild the commit on top of it.
            const { data: freshRef } = await this.octokit.rest.git.getRef( { owner, repo, ref: `heads/${branch}` } );
            parentSha = freshRef.object.sha;

          }

        }

        // Migrate to Actions-powered Pages if not already on it, but only if GitHub-owned actions
        // were confirmed allowed above. If that check failed, leave the repo on whatever Pages
        // mode it already had rather than switching blind.
        if ( repoEntry?.pagesMode !== 'workflow' && canUseWorkflow ) {
          await this.setPagesMode( repo, 'workflow' );
        }

        // Optimistically update the (local) repo state so the UI reflects the new state immediately,
        // rather than waiting for the Pages poll to confirm (provides faster user feedback).
        // The pollPagesBuild will verify and correct this if needed.
        if ( repoEntry ) {
          repoEntry.pushedAt    = new Date().toISOString(); // Mark when we just pushed
          repoEntry.pagesStatus = 'building'; // GitHub Pages auto-builds after a push
        }

        // Mark upload as complete and show the final "Done" stage for a moment so users see the progress bar finish
        this.progress.stage   = 'Done';
        this.progress.percent = 100;
        this.statusMessage    = ''; // Clear the status message
        await this.$nextTick(); // Force Vue to render the "Done" stage before sleeping
        await this.sleep( 1200 ); // Let the user see the completed progress bar

        // Show the completion screen with the Pages URL and record the upload timestamp
        this.completedPagesUrl = repoEntry?.pagesUrl || null;
        this.uploadTimestamp   = Date.now();
        this.uploadComplete    = true;
        // Monitor the GitHub Pages build status in the background; UI will update when it's built.
        // Pass the commit we just pushed so the poll waits for THIS build, not a stale previous one.
        this.pollPagesBuild( owner, repo, commit.sha );

      }
      // Any error that lands here is unexpected and unrecoverable, so we show the error screen with instructions to retry.
      catch ( err ) {
      
        if ( signal.aborted ) return;
        console.error( err );

        // Transient per-request failures (5xx, rate limits) are already retried inside uploadSingleBlob,
        // so anything reaching here means the upload didn't finish and nothing new was published.
        // Surface it so the user sees the error screen instead of a run that silently stalls at 88%.
        this.uploadFailed = true;

        const isNetworkError   = err instanceof TypeError && !err.response;
        const isNotFastForward = err?.response?.status === 422 && /fast forward/i.test( err?.message || '' );

        if ( isNetworkError ) {
          this.failedMessage = 'Network connection lost. Check your connection and retry.';
        }
        else if ( isNotFastForward ) {
          this.failedMessage = 'Something else changed this project on GitHub while uploading. Go back and try uploading again.';
        }
        else {
          this.failedMessage = err?.message || 'Unknown error';
        }
        
      }
      // Reset the syncing flag so the UI and upload button become enabled again, regardless of how the upload finished.
      // Abort controllers are cleaned up separately via cancel() when the user retries or leaves.
      finally {
        this.isSyncing = false;
      }
      
    },

    /**
     * Converts file content to a base64 string as required by the GitHub blobs API.
     * @param {string|ArrayBuffer|Uint8Array} content
     * @returns {string}
     */
    toBase64( content ) {
    
      const isBuffer = content instanceof ArrayBuffer;
      const isUint8  = content instanceof Uint8Array;
      
      if ( isBuffer || isUint8 ) {
      
        let binary = '';
        const bytes = isBuffer ? new Uint8Array( content ) : content;
        for ( let i = 0; i < bytes.byteLength; i++ ) binary += String.fromCharCode( bytes[i] );
        return btoa( binary );
        
      }
      
      return btoa( unescape( encodeURIComponent( content ) ) );
    },

    /**
     * Uploads a single file as a Git blob, with retry logic for rate limits and server errors.
     * Rate-limit waits are shared across all concurrent workers via `rateLimitPromise`, so
     * only the first worker to hit the limit starts the countdown; the rest just await it.
     * @param {Object} file
     * @param {string} owner
     * @param {string} repo
     * @param {AbortSignal} signal
     * @returns {Promise<string|null>} Blob SHA, or null if the upload was aborted
     */
    async uploadSingleBlob( file, owner, repo, signal ) {
      // Setup retry limits and backoff timing
      const MAX_RETRIES            = 5;
      const MAX_RATE_LIMIT_RETRIES = 8;
      let delay            = 1000; // Exponential backoff for 5xx errors
      let attempt          = 0;
      let rateLimitRetries = 0;

      // Retry loop for transient failures
      while ( attempt < MAX_RETRIES ) {
        // Check if the upload was cancelled before making the request
        if ( signal.aborted ) return null;

        let res;
        try {
          // Send the blob to GitHub. Combine the main cancel signal with the rate-limit signal
          // so in-flight requests can be dropped the moment the first 429 lands, without
          // cancelling the whole upload (allowing other workers to continue).
          res = await axios({
            method: 'post',
            url: `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
            headers: {
              'Authorization': `Bearer ${this.githubToken}`,
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
            data: { content: this.toBase64( file.content ?? '' ), encoding: 'base64' },
            signal: AbortSignal.any([ signal, this.rateLimitController.signal ]),
            validateStatus: () => true, // Don't throw on any status code; we handle them below
          });
        }
        catch ( err ) {
          // Request was aborted (either by user or by rate limit)
          if ( signal.aborted ) return null;
          // If aborted by rateLimitController, another worker already set up the countdown
          if ( this.rateLimitPromise ) await this.rateLimitPromise;
          // Stagger our retry to avoid thundering herd when rate limit clears
          await this.sleep( 500 + Math.random() * 1500 );
          continue;
        }

        // SUCCESS
        if ( res.status < 300 ) {
          return res.data.sha;
        }

        // RATE LIMIT (403 / 429)
        if ( res.status === 403 || res.status === 429 ) {
          if ( ++rateLimitRetries > MAX_RATE_LIMIT_RETRIES ) {
            throw new Error( `Upload failed: rate limit did not clear after ${MAX_RATE_LIMIT_RETRIES} attempts` );
          }

          // Calculate how long to wait. GitHub sends Retry-After in seconds; enforce a 15s floor
          // since GitHub sometimes under-reports the actual cooldown.
          const retryAfter = res.headers['retry-after'];
          const waitMs = Math.max( retryAfter ? parseInt( retryAfter ) * 1000 : 60000, 15000 );

          // First worker to hit the limit sets up the countdown and drops all other in-flight
          // requests immediately, so we send at most one 429 instead of up to ten (once per worker).
          if ( !this.rateLimitPromise ) {
            // Abort any in-flight requests from other workers
            this.rateLimitController.abort();
            this.rateLimitController = new AbortController();

            // Create a shared countdown promise so all workers can wait together
            this.rateLimitPromise = new Promise( resolve => {
              
              this.rateLimitResolve = resolve;
              
              // Update the GUI with a countdown timer so users know when the upload will
              // resume. This is updated every second with the remaining time.
              let remaining = Math.round( waitMs / 1000 );
              this.statusMessage = `API rate limit exceeded. Continuing in ${remaining}s...`;

              // Update the UI every second with the remaining time
              const tick = setInterval( () => {
              
                if ( signal.aborted ) {
                  clearInterval( tick );
                  resolve();
                  return;
                }
                
                // Update the remaining time
                remaining--;
                
                // If the limit has cleared, resolve the promise to 
                // wakeup the workers and clear the countdown.
                if ( remaining <= 0 ) {
                  clearInterval( tick );
                  this.rateLimitPromise = null;
                  this.rateLimitResolve = null;
                  resolve();
                }
                else {
                  // Update the GUI with a countdown timer so users know when the upload will
                  // resume. This is updated every second with the remaining time.
                  this.statusMessage = `API rate limit exceeded. Continuing in ${remaining}s...`;
                }
                
              }, 1000 );
            });
          }

          // Wait for the countdown to finish (either this worker's countdown or another's)
          await this.rateLimitPromise;
          // Stagger the wakeup so workers don't all retry at once and re-trigger the rate limit
          await this.sleep( 500 + Math.random() * 1500 );
          
          continue; 
          
        }

        // SERVER ERROR (5xx) - transient, back off exponentially and retry
        if ( res.status >= 500 ) {
          await this.sleep( delay );
          delay *= 2;
          attempt++;
          continue;
        }

        // OTHER ERROR - unrecoverable
        throw new Error( `Upload failed: ${res.status} ${res.statusText}` );
      }

      // Exhausted all retries
      throw new Error( `Upload failed after ${MAX_RETRIES} retries` );
    },

    /**
     * Hashes all files, deduplicates against the IDB cache, and uploads new blobs concurrently.
     * Blob SHAs are content-addressable and permanent on GitHub, so unchanged files are always skipped.
     * @param {Array} files
     * @param {string} owner
     * @param {string} repo
     * @param {string} repoCreatedAt ISO date from the GitHub API (used for cache invalidation)
     * @param {AbortSignal} signal
     * @returns {Promise<string[]>} Blob SHAs in the same order as the input files
     */
    async uploadBlobs( files, owner, repo, repoCreatedAt, signal ) {
    
      this.rateLimitController = new AbortController();
      
      this.progress.stage = 'Uploading files';
      this.statusMessage  = 'Preparing files...';

      // Wipe the IDB cache if the repo was deleted and recreated, since its blob SHAs
      // are gone from GitHub even though the hashes still match locally.
      await this.idbValidateRepoCache( owner, repo, repoCreatedAt );
      const blobCache = await this.idbCacheLoad( owner, repo );

      // Hash all files upfront so we know which ones are already on GitHub and can be skipped
      for ( let i = 0; i < files.length; i++ ) {
      
        if ( signal.aborted ) return [];
        const content = files[i].content;
        let bytes;

        if ( content instanceof ArrayBuffer ) {
          bytes = new Uint8Array( content );
        }
        else if ( content instanceof Uint8Array ) {
          bytes = content;
        }
        else {
          bytes = new TextEncoder().encode( content || '' );
        }

        // Compute the Git blob SHA-1 for the file content, which is how GitHub identifies
        // blobs and allows us to skip uploads for unchanged files.
        files[i].contentHash = await this.gitBlobShaBytes( bytes );
        
      }

      this.statusMessage = 'Uploading files...';

      // Shared mutable state for the worker pool. Workers atomically claim files by
      // incrementing nextIndex, so there's no duplicate work and no coordination overhead.
      const blobShas  = new Array( files.length );
      let completed   = 0;
      let nextIndex   = 0;
      const CONCURRENCY = 10;
      
      const runWorker = async () => {
        while ( true ) {
          if ( signal.aborted ) return;

          // Check rate limit before grabbing the next file so we don't immediately 403 on wakeup
          if ( this.rateLimitPromise ) {
            await this.rateLimitPromise;
            await this.sleep( Math.random() * 1000 );
          }

          // Claim the next file by atomically incrementing nextIndex. 
          // If we've gone through all files, exit the loop.
          const i = nextIndex++;
          if ( i >= files.length ) return;

          const file = files[i];

          // Skip files that are already on GitHub
          if ( blobCache[file.contentHash] ) {
            blobShas[i] = blobCache[file.contentHash];
          }
          // Upload the file as a blob and save the SHA to the cache for future uploads
          else {

            const sha = await this.uploadSingleBlob( file, owner, repo, signal );
            // If the upload failed (aborted or threw), exit the worker
            if ( !sha ) return;

            // Store the blob SHA for use in tree construction
            blobShas[i] = sha;
            // Cache the SHA in memory so we don't re-upload identical files in this run
            blobCache[file.contentHash] = sha;
            // Persist to IndexedDB so future uploads can skip files that are already on GitHub
            await this.idbCacheSave( owner, repo, file.contentHash, sha );

          }

          completed++;
          this.progress.done    = completed;
          this.progress.percent = Math.round( ( completed / files.length ) * 70 );
          this.statusMessage    = `Uploading ${completed}/${files.length}`;
          
        }
      };

      // Spawn CONCURRENCY workers in parallel; each claims files by index and uploads them until all are done
      await Promise.all( Array.from( { length: CONCURRENCY }, runWorker ) );

      // Return the array of blob SHAs, populated atomically by all workers during the upload
      return blobShas;

    },

    /**
     * Reads the actual in-progress Pages BUILD status once and maps it onto the status values the UI
     * understands ( building / built / errored ). Shared by the background poll and the manual refresh
     * button so both read the same thing. The overall `pages` endpoint isn't used here: it stays "built"
     * from the previous deploy while a new build runs, so it reports success too early.
     *
     * @param {string} owner
     * @param {string} repo
     * @param {boolean} useWorkflowPoll True for Actions-powered Pages ( Deployments API ), false for legacy branch builds.
     * @param {string} [commitSha] When given, only a build for THIS commit counts as ours; anything else reads as still building.
     * @returns {Promise<{ pagesStatus: string, isOurBuild: boolean, buildErrored: boolean }>}
     */
    async fetchPagesBuildStatus( owner, repo, useWorkflowPoll, commitSha ) {

      let pagesStatus, isOurBuild, buildErrored;

      if ( useWorkflowPoll ) {

        // WORKFLOW POLL: Actions-powered Pages deploys via the Deployments API.
        // Get the latest deployment for the github-pages environment, then its latest status.
        const deploymentsRes = await this.ghGet(
          `repos/${owner}/${repo}/deployments`,
          { environment: 'github-pages', per_page: 1, t: Date.now() }
        );
        const deployment = deploymentsRes.data[0];

        // No deployment yet means GitHub hasn't picked up the push — treat as still building
        if ( !deployment ) {
          pagesStatus = 'building';
          isOurBuild  = false;
        }
        else {
          isOurBuild = !commitSha || deployment.sha === commitSha;

          const statusesRes = await this.ghGet(
            `repos/${owner}/${repo}/deployments/${deployment.id}/statuses`,
            { per_page: 1, t: Date.now() }
          );
          const deployStatus = statusesRes.data[0]?.state;

          // Map GitHub deployment states onto the status values the UI already understands
          if ( deployStatus === 'success' ) {
            pagesStatus  = 'built';
            buildErrored = false;
          }
          else if ( deployStatus === 'failure' || deployStatus === 'error' ) {
            pagesStatus  = 'errored';
            buildErrored = true;
          }
          else {
            // queued, in_progress, pending, inactive, etc.
            pagesStatus = 'building';
          }
        }

      }
      else {

        // LEGACY POLL: classic branch-based Pages builds via pages/builds/latest.
        // GitHub sends a cacheable response, so a unique param per poll forces a fresh read.
        const res   = await this.ghGet( `repos/${owner}/${repo}/pages/builds/latest`, { t: Date.now() } );
        const build = res.data;

        // When we know the commit we pushed, ignore any build that isn't for it.
        // A build for the previous commit can still be reported as the "latest" for a
        // moment before GitHub queues ours, so treat that window as "still building".
        isOurBuild = !commitSha || build.commit === commitSha;

        // GitHub's build status is null until it picks up, then building, then built/errored.
        pagesStatus  = build.status === null ? 'building' : build.status;
        buildErrored = build.status === 'errored';

      }

      return { pagesStatus, isOurBuild, buildErrored };

    },

    /**
     * Polls the GitHub Pages BUILD status at a steady 10s cadence (measured from the start of each
     * request, so a slow request doesn't add to the gap) until it resolves, errors, or times out at 5 minutes.
     * GitHub Pages doesn't deploy instantly after a push; it kicks off a build job that takes a few minutes.
     *
     * Each tick reads the real in-progress build via fetchPagesBuildStatus, which the manual refresh
     * button shares so both agree on the status.
     *
     * @param {string} owner
     * @param {string} repo
     * @param {string} [commitSha] The commit we just pushed. When given, we wait for the build of THIS commit
     *                             so a leftover "built" from the previous deploy doesn't end the poll early.
     */
    async pollPagesBuild( owner, repo, commitSha ) {

      // Prevent concurrent polls; only one poll sequence should run at a time
      if ( this.isPolling ) return;
      this.isPolling = true;
      this.pollAborted = false;
      const POLL_INTERVAL = 10000; // Target one request per 10s, measured from the start of each request
      const MAX_POLLS = 30; // 30 × 10s = 5 minutes before we give up. A normal build finishes well within this.
      this.pollTimedOut = false; // Reset; set true below if we hit the cap while the build is still running

      // The build endpoint has no site URL and the Pages URL is stable across deploys, so resolve it
      // once up front. This keeps the poll loop at exactly one request per tick instead of paying a
      // second request on whichever iteration first needs the URL, including the final "built" one.
      const repoEntry = this.repos.find( r => r.name === repo );
      if ( repoEntry && !repoEntry.pagesUrl ) {
        try {
          const pagesRes = await this.ghGet( `repos/${owner}/${repo}/pages` );
          repoEntry.pagesUrl = pagesRes.data.html_url;
        }
        catch {} // Non-fatal: the build status is what matters here
      }

      const useWorkflowPoll = repoEntry?.pagesMode === 'workflow';

      try {
        for ( let i = 0; i < MAX_POLLS; i++ ) {

          // Stop polling if the component unmounted or the user navigated away
          if ( this.pollAborted ) break;

          // Time each request so we can hold a steady 10s cadence: the next request fires
          // 10s after this one started, or immediately if this one already took longer.
          const requestStart = Date.now();

          try {

            const { pagesStatus, isOurBuild, buildErrored } = await this.fetchPagesBuildStatus( owner, repo, useWorkflowPoll, commitSha );

            // Update the repo entry status from the build, and keep the complete screen URL live
            if ( repoEntry ) {
              repoEntry.pagesStatus = isOurBuild ? pagesStatus : 'building';
              if ( this.uploadComplete && repoEntry.pagesUrl ) {
                this.completedPagesUrl = repoEntry.pagesUrl;
              }
            }

            // Stop polling once OUR build completes or fails
            if ( isOurBuild && ( pagesStatus === 'built' || pagesStatus === 'errored' ) ) {
              if ( buildErrored ) {
                this.statusMessage = 'Site publish failed. Check GitHub Pages settings.';
              }
              break;
            }

          }
          // Stop polling on any API error (auth, rate limit, 404, etc.)
          catch { break; }

          // Wait out the rest of the 10s interval before the next request. If the request
          // already took 10s or more, the remainder is zero and the next one fires right away.
          // The wait resolves early on abort so closing the modal stops polling immediately
          // instead of firing one more request after the remaining time elapses.
          const remaining = POLL_INTERVAL - ( Date.now() - requestStart );
          if ( remaining > 0 ) {
            await new Promise( resolve => {
              const timer = setTimeout( () => {
                clearInterval( abortCheck );
                resolve();
              }, remaining );
              const abortCheck = setInterval( () => {
                if ( this.pollAborted ) {
                  clearTimeout( timer );
                  clearInterval( abortCheck );
                  resolve();
                }
              }, 250 );
            });
          }

        }

        // If we ran out of polls while the build was still going (not built/errored, not aborted by the
        // user leaving), we've stopped listening. Flag it so the complete screen can say so plainly.
        const repoStillBuilding = repoEntry && repoEntry.pagesStatus === 'building';
        if ( repoStillBuilding && !this.pollAborted ) {
          this.pollTimedOut = true;
        }
      }
      finally {
        this.isPolling = false;
      }

    },

  },
};
