/**
 * GitHub API Client
 * Simple wrapper for GitHub REST API
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const BASE_URL = 'https://api.github.com'

const REPOS = [
  { owner: 'ErHineda', repo: 'agents-dashboard' },
  { owner: 'ErHineda', repo: 'la-capillita' },
  { owner: 'ErHineda', repo: 'gastos-samuel' },
  { owner: 'ErHineda', repo: 'juego-irene' }
]

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN && { 'Authorization': `Bearer ${GITHUB_TOKEN}` }),
  'User-Agent': 'AgentDashboard/1.0'
}

export async function fetchGitHub(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, { headers })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || `GitHub API error: ${response.status}`)
  }
  
  return response.json()
}

export async function getRepos() {
  const reposData = await Promise.all(
    REPOS.map(async ({ owner, repo }) => {
      try {
        const data = await fetchGitHub(`/repos/${owner}/${repo}`)
        return {
          name: data.name,
          full_name: data.full_name,
          description: data.description,
          url: data.html_url,
          stargazers_count: data.stargazers_count,
          forks_count: data.forks_count,
          open_issues_count: data.open_issues_count,
          language: data.language,
          default_branch: data.default_branch,
          pushed_at: data.pushed_at,
          topics: data.topics || []
        }
      } catch (error) {
        console.error(`Error fetching ${owner}/${repo}:`, error.message)
        return {
          name: repo,
          full_name: `${owner}/${repo}`,
          error: error.message
        }
      }
    })
  )
  
  return reposData
}

export async function getIssues(owner, repo) {
  return fetchGitHub(`/repos/${owner}/${repo}/issues?state=open&per_page=50`)
}

export async function getPullRequests(owner, repo) {
  return fetchGitHub(`/repos/${owner}/${repo}/pulls?state=open&per_page=50`)
}

export { REPOS }
