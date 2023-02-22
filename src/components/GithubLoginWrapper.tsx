import dynamic from 'next/dynamic'
const GithubLoginWrapper = dynamic(() => import('./GithubLogin'), {
  ssr: false
})
// eslint-disable-next-line react/display-name
export default ( props: any) => <GithubLoginWrapper {...props}/>
