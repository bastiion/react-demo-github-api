import {AuthContext, IAuthContext} from "react-oauth2-code-pkce";
import {useContext} from "react";
import UserInfo from "@/components/UserInfo";
import {Button} from "@mui/material";
import {GitHub} from "@mui/icons-material";

const GithubLogin: React.FC = () => {
  const { tokenData, token, login, logOut, idToken, error }: IAuthContext = useContext(AuthContext)


  if (error) {
    return (
        <>
          <div style={{ color: 'red' }}>An error occurred during authentication: {error}</div>
          <Button startIcon={<GitHub />} onClick={() => logOut()}>Logout</Button>
        </>
    )
  }

  return (
      <>
        {token ? (
            <>
              <Button color='primary' startIcon={<GitHub />} onClick={() => logOut()}>Logout</Button>
            </>
        ) : (
            <>
              <div>You are not logged in.</div>
              <Button color='primary' startIcon={<GitHub />} onClick={() => login()}>Login</Button>
            </>
        )}
      </>
  )
}

export default GithubLogin
