import http from '../utils/http.ts'

import {CodeType} from '../types';


export interface LoginParams {
  account?: string
  password?: string
  phone?: string
  code?: string
  type: 'code' | 'pwd'
}

export interface User {
  id: string
  email?: string
  phone?: string
  username?: string
  avatar?: string,
  hasPwd?: boolean,
  member: {
    levelDesc: string,
    status: string,
    active: boolean,
    endDate: number,
    autoRenew: boolean,
    plan: string,
    planDesc: string,
  }
}



export interface RegisterParams {
  account: string
  password: string
  code: string
}

export interface RegisterResponse {
  token: string
  user: {
    id: string
    email?: string
    phone: string
    nickname?: string
    avatar?: string
  }
}


export interface SendCodeParams {
  val: string
  type: CodeType
}


export interface ResetPasswordParams {
  account: string
  code: string
  newPassword: string
}


export interface WechatLoginParams {
  code: string
  state?: string
}

export function loginApi(params: LoginParams) {
  return http<{ token:string }>('user/login', params, null, 'post')
}

export function registerApi(params: RegisterParams) {
  return http<{ token:string }>('user/register', params, null, 'post')
}

export function sendCode(params: SendCodeParams) {
  return http<boolean>('user/sendCode', null, params, 'get')
}

export function resetPasswordApi(params: ResetPasswordParams) {
  return http<boolean>('user/resetPassword', params, null, 'post')
}

export function wechatLogin(params: WechatLoginParams) {
  return http<User>('user/wechatLogin', params, null, 'post')
}

export function refreshToken() {
  return http<{ token: string }>('user/refreshToken', null, null, 'post')
}


export function getUserInfo() {
  return http<User>('user/userInfo', null, null, 'get')
}


export function setPassword(data) {
  return http('user/setPassword', data, null, 'post')
}


export function changeEmailApi(data) {
  return http('user/changeEmail', data, null, 'post')
}


export function changePhoneApi(data) {
  return http('user/changePhone', data, null, 'post')
}


export function updateUserInfoApi(data) {
  return http('user/updateUserInfo', data, null, 'post')
}