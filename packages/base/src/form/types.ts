

export interface FormType {
  validate: (cb: (vaild: boolean) => void) => void
}

export interface Field {
  prop: string
  modelValue: any
  validate: (rules: any[]) => boolean
}


export interface FormField {
  prop: string
  modelValue: any
  validate: (rules: FormRule[]) => boolean
}


export interface FormRule {
  required?: boolean
  message?: string
  pattern?: RegExp
  validator?: (rule: FormRule, value: any, callback: (error?: Error) => void) => void
  min?: number
  max?: number
  len?: number
  type?: string
}


export type FormRules = Record<string, FormRule[]>


export type FormModel = Record<string, any>


export interface FormProps {
  model?: FormModel
  rules?: FormRules
}


export interface FormInstance {
  
  validate: (callback: (valid: boolean) => void) => void

  
  validateField: (fieldName: string, callback?: (valid: boolean) => void) => boolean
}


export interface FormContext {
  registerField: (field: FormField) => void
  formModel: FormModel
  formValidate: (callback: (valid: boolean) => void) => void
  formRules: FormRules
}


export enum ValidateStatus {
  Success = 'success',
  Error = 'error',
  Validating = 'validating',
  Pending = 'pending',
}