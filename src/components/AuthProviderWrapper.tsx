import dynamic from 'next/dynamic'
import { TAuthConfig} from 'react-oauth2-code-pkce'

const authConfig: TAuthConfig = {
  clientId: '7a3e2697c5674d4b0bfa',
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  logoutEndpoint: 'https://github.com/login/oauth/logout',
  tokenEndpoint: 'https://github.gra.one/api/token',
  redirectUri: window.location.href || 'http://localhost:3000/',
  preLogin: () =>  localStorage.setItem('preLoginPath', window.location.pathname),
  postLogin: () =>  window.location.replace(localStorage.getItem('preLoginPath') || ''),
  decodeToken: false,
  autoLogin: false,
  scope: 'user,public_repo'
}


const AuthProviderWrapper = dynamic(() => import('./AuthProvider'), {
  ssr: false
})
// eslint-disable-next-line react/display-name
export default ( props: any) => <AuthProviderWrapper authConfig={authConfig} {...props}/>
