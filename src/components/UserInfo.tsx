import React, {FunctionComponent, useCallback, useContext, useEffect, useState} from 'react';
import {AuthContext, IAuthContext} from "react-oauth2-code-pkce";
// @ts-ignore
import GitHub from "github-api";
import {FormControl, MenuItem, Select} from "@mui/material";

let config = {
  protocol: "https",           //If not passed, defaults to 'https'
  host: "api.github.com",      //If not passed, defaults to 'api.github.com' | In case of Enterprise-GitHub e.g github.snapcircle.net.
  pathPrefix: "",              //Leave empty if you are using github.com | In case of Enterprise-GitHub e.g api/v3
  owner: "bastiion",           //Your GitHub username
  repo: "decision-adb-test",             //Your repository name where you'd like to have your JSON store hosted
  path: "db.json",             //Your data store file with .json extension
};

interface OwnProps {}

type Props = OwnProps;

type UserEmail = {
  email: string,
  primary: boolean,
  verified: boolean,
  visibility: 'public' | 'private' | null
}

const UserInfo: FunctionComponent<Props> = (props) => {
  const {token}: IAuthContext = useContext(AuthContext)
  const [gh, setGh] = useState<typeof GitHub | null>(null);
  const [ghUser, setGhUser] = useState<any>(null);
  const [userEmails, setUserEmails] = useState<UserEmail[]>([]);
  const [repos, setRepos] = useState<any>(null);
  const [defaultEmail, setDefaultEmail] = useState<string>("");
  useEffect(() => {
    if(!token) return
    setGh(new GitHub({token}))
  }, [token,setGh]);

  useEffect(() => {
    if(!gh) return
    console.log({gh})
    const user = gh.getUser();
    console.log({user})
    user.listRepos().then(repos => {
     setRepos(repos)
    })
    user.getEmails().then(emails => {
      Array.isArray(emails?.data) && setUserEmails(emails?.data)
    })
    setGhUser(user)
  }, [gh, setGhUser, setRepos, setUserEmails]);

  const handleSelectEmail = useCallback(
      (e ) => {
        console.log({v: e.target.value})
        setDefaultEmail(e.target.value)
      },
      [setDefaultEmail],
  );

  const commit = useCallback(
      async () => {
        if(!gh) return
        const conf = {
          ...config,
          personalAccessToken: token
        }
        try {
          const repo = gh.getRepo(
             conf.owner,
             conf.repo
          )
          const mainBranch = await repo.getBranch('main')
          console.log({mainBranch})
          const lastCommitSha = mainBranch?.data?.commit?.sha
          if(!lastCommitSha) return
          const head_ref = await repo.getRef('head')
          const {object, ref } = head_ref?.data?.[0] || {}
          const base_sha = object?.sha
          console.log({head_ref})
          if(!base_sha) return
          const blob = await repo.createBlob("Hello World")
          console.log({blob})
          const blob_sha = blob?.data?.sha
          if(!base_sha) {
            console.error('cannot create blob, no sha returned')
            return
          }
          const tree = await repo.createTree([{
            path: 'hello.md',
            mode: "100644",
            type: 'blob',
            sha: blob_sha
          }], base_sha)
          console.log({tree})
          const tree_sha = tree?.data?.sha
          if(!tree_sha) {
            console.error('cannot create tree, no tree sha returned')
            return
          }
          const concreteCommit = await repo.commit(lastCommitSha, tree_sha, "a new test commit", {
            author: {name: "Sebastian Tilsch", email:  "sebastian.tilsch@slub-dresden.de" }
          })
          console.log({concreteCommit})

          const commit_sha = concreteCommit?.data?.sha
          const head_update = await repo.updateHead(ref.substring(5), commit_sha, true)
          console.log({head_update})

        } catch (e) {
          console.error('cannot commit', e)
        }

      },
      [gh, token])



  return ghUser ? (
      <>
        <div>
          <FormControl fullWidth>
            <Select
              labelId="email-select-github"
              value={defaultEmail}
              label={"Select email"}
              onChange={handleSelectEmail}>
              {userEmails.map(({email}) =>
                <MenuItem key={email}  value={email}>{email}</MenuItem>
              )}
            </Select>
          </FormControl>
        </div>
        <div>
          <button onClick={() => commit()}>commit</button>
        </div>
      </>
      )
      : null;
};

export default UserInfo;
