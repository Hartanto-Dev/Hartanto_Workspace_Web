export function initDashboard(container) {
  // --- 1. GitHub Calendar with Caching ---
  const calendarEl = container.querySelector('.calendar');
  if (calendarEl && typeof GitHubCalendar !== 'undefined') {
    // Instantly load cached calendar HTML if available
    const cachedCalendar = localStorage.getItem('github_calendar_cache');
    if (cachedCalendar) {
      calendarEl.innerHTML = cachedCalendar;
    }

    // Fetch fresh data in the background
    GitHubCalendar(calendarEl, "Hartanto-Dev", { 
      responsive: true,
      tooltips: true
    }).then(() => {
      // Save fresh HTML to cache for next time
      localStorage.setItem('github_calendar_cache', calendarEl.innerHTML);
    }).catch(err => {
      if (!cachedCalendar) {
        calendarEl.innerHTML = `
          <div style="text-align: center; color: var(--danger);">
            <p>Failed to load GitHub contributions.</p>
            <p style="font-size: 0.8rem; opacity: 0.7;">${err.message}</p>
          </div>
        `;
      }
    });
  } else if (!calendarEl && typeof GitHubCalendar === 'undefined') {
    console.error("GitHubCalendar library is not loaded.");
  }

  // --- 2. Recent Commit Info with Caching ---
  const commitTextEl = container.querySelector('#commit-text');
  const commitRepoEl = container.querySelector('#commit-repo');
  const commitLinkEl = container.querySelector('#commit-link');

  if (commitTextEl && commitRepoEl) {
    // Instantly load cached commit info if available
    const cachedCommitText = localStorage.getItem('github_commit_text');
    const cachedCommitRepo = localStorage.getItem('github_commit_repo');
    const cachedCommitLink = localStorage.getItem('github_commit_link');
    
    if (cachedCommitText && cachedCommitRepo) {
      commitTextEl.innerHTML = cachedCommitText;
      commitRepoEl.textContent = cachedCommitRepo;
      if (commitLinkEl && cachedCommitLink) {
        commitLinkEl.href = cachedCommitLink;
        commitLinkEl.style.display = 'inline-flex';
      }
    }

    // Fetch fresh commit data in the background
    fetch('https://api.github.com/users/Hartanto-Dev/events/public')
      .then(res => res.json())
      .then(events => {
        const pushEvent = events.find(e => e.type === 'PushEvent');
        if (pushEvent && pushEvent.payload.commits.length > 0) {
          const repoName = pushEvent.repo.name.replace('Hartanto-Dev/', ''); // Strip username
          const lastCommit = pushEvent.payload.commits[pushEvent.payload.commits.length - 1];
          const commitMsg = lastCommit.message.split('\\n')[0]; // First line only
          
          const newTextHTML = `Telah melakukan Commit pada Repository <span style="font-weight: 600; color: var(--foreground);">${repoName}</span>`;
          const newRepoText = `"${commitMsg}"`;
          const newLinkHref = \`https://github.com/\${pushEvent.repo.name}/commit/\${lastCommit.sha}\`;

          // Update UI
          commitTextEl.innerHTML = newTextHTML;
          commitRepoEl.textContent = newRepoText;
          if (commitLinkEl) {
            commitLinkEl.href = newLinkHref;
            commitLinkEl.style.display = 'inline-flex';
          }

          // Save fresh data to cache
          localStorage.setItem('github_commit_text', newTextHTML);
          localStorage.setItem('github_commit_repo', newRepoText);
          localStorage.setItem('github_commit_link', newLinkHref);
        } else if (!cachedCommitText) {
          commitTextEl.textContent = 'Belum ada aktivitas commit publik terbaru.';
          commitRepoEl.textContent = 'Tidak ada data.';
        }
      })
      .catch(err => {
        if (!cachedCommitText) {
          commitTextEl.textContent = 'Gagal memuat info aktivitas.';
          commitRepoEl.textContent = 'Silakan periksa koneksi internet.';
        }
      });
  }
}

