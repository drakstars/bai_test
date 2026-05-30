
export const WECHAT_CONFIG = {

  appId: 'your_wechat_app_id',


  // redirectUri: `${window.location.origin}/wechat/callback`,
  redirectUri: `/wechat/callback`,


  scope: 'snsapi_userinfo',


  state: 'wechat_login'
}


export function getWechatAuthUrl(state?: string): string {
  const {appId, redirectUri, scope} = WECHAT_CONFIG
  const authState = state || Math.random().toString(36).substr(2, 15)

  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${authState}#wechat_redirect`
}


export const PHONE_CONFIG = {

  codeLength: 6,


  sendInterval: 60,


  phoneRegex: /^1[2-9]\d{9}$/
}


export const EMAIL_CONFIG = {

  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,


  codeLength: 6
}


export const PASSWORD_CONFIG = {

  minLength: 9,


  maxLength: 20
}