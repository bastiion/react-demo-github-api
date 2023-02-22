import {AuthContext, IAuthContext} from "react-oauth2-code-pkce";
import {useCallback, useContext, useEffect, useState} from "react";
// @ts-ignore
import GitHub from "github-api";
import useGitHubStore from "@/components/hooks/useGitHubStore";

export type PersistConfig = {
  repo: string,
  owner: string,
  filePath: string
}

export type GithubAuthor = {
  name: string
  email: string
  date?: string
}


export const useGitHubCommitPersistor: (config: PersistConfig) => { commit: (content: (string | Buffer), message: string, author: GithubAuthor) => Promise<void> } = (config: PersistConfig) => {
  const {token}: IAuthContext = useContext(AuthContext)
  const {github, setGitHub, setUserEmails} = useGitHubStore()


  useEffect(() => {
    if (!token) return
    setGitHub(new GitHub({token}))
  }, [token, setGitHub]);

  useEffect(() => {
    if (!github) return
    const user = github.getUser();
    user.getEmails().then((emails: any) => {
      Array.isArray(emails?.data) && setUserEmails(emails?.data)
    })
  }, [github, setUserEmails]);

  const commit = useCallback(
      async (content: string | Buffer, message: string, author: GithubAuthor) => {
        if (!github) throw new Error("Github API not initialized or logged out")
        const repo = github.getRepo(
            config.owner,
            config.repo
        )
        const mainBranch = await repo.getBranch('main')
        console.log({mainBranch})
        const lastCommitSha = mainBranch?.data?.commit?.sha
        if (!lastCommitSha) return
        const head_ref = await repo.getRef('head')
        const {object, ref} = head_ref?.data?.[0] || {}
        const base_sha = object?.sha
        console.log({head_ref})
        if (!base_sha) return
        const blob = await repo.createBlob(content)
        console.log({blob})
        const blob_sha = blob?.data?.sha
        if (!base_sha) {
          console.error('cannot create blob, no sha returned')
          return
        }
        const tree = await repo.createTree([{
          path: config.filePath,
          mode: "100644",
          type: 'blob',
          sha: blob_sha
        }], base_sha)
        console.log({tree})
        const tree_sha = tree?.data?.sha
        if (!tree_sha) {
          console.error('cannot create tree, no tree sha returned')
          return
        }
        const concreteCommit = await repo.commit(
            lastCommitSha,
            tree_sha,
            message,
            {author})
        console.log({concreteCommit})

        const commit_sha = concreteCommit?.data?.sha
        const head_update = await repo.updateHead(ref.substring(5), commit_sha, true)
        console.log({head_update})

      },
      [github, config])

  return {
    commit
  }
}
