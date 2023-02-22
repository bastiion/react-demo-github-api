import {create} from 'zustand'
// @ts-ignore
import GitHub from "github-api";


export type UserEmail = {
  email: string,
  primary: boolean,
  verified: boolean,
  visibility: 'public' | 'private' | null
}

export type GitHubStore = {
  userEmails: UserEmail[],
  setUserEmails: (userEmails: UserEmail[]) => void,
  github: typeof GitHub | null,
  setGitHub: (github: typeof GitHub) => void,
}

const useGitHubStore = create<GitHubStore>((set, get) => ({
  userEmails: [],
  github: null,
  setUserEmails: userEmails => set({userEmails}),
  setGitHub: github => set({github})
}))
export default useGitHubStore
