import * as VueRouter from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
import words from '@/pages/(words)/words.vue'
import Dict from '@/pages/(words)/dict.vue'
import DictList from '@/pages/(words)/dict-list.vue'
import PracticeWords from '@/pages/(words)/practice-words/[id].vue'
import WordTest from '@/pages/(words)/words-test/[id].vue'

// import articles from '@/pages/(articles)/articles.vue'
// import BookDetail from '@/pages/(articles)/book/index.vue'
// import BookList from '@/pages/(articles)/book-list.vue'
// import PracticeArticles from '@/pages/(articles)/practice-articles/[id].vue'

import setting from '@/pages/setting.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/words' },
  { path: '/words', component: words },
  { path: '/word', redirect: '/words' },
  { path: '/practice-words/:id', component: PracticeWords },
  { path: '/word-test/:id', component: WordTest },
  { path: '/study-word', redirect: '/words' },
  { path: '/dict-list', component: DictList },
  { path: '/dict', component: Dict },

  // { path: '/articles', component: articles },
  // { path: '/article', redirect: '/articles' },
  // { path: '/practice-articles/:id', component: PracticeArticles },
  // { path: '/study-article', redirect: '/articles' },
  // { path: '/book', component: BookDetail },
  // { path: '/book-list', component: BookList },
  { path: '/setting', component: setting },
  { path: '/:pathMatch(.*)*', redirect: '/words' },
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(import.meta.env.VITE_ROUTE_BASE),
  // history: VueRouter.createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // console.log('savedPosition', savedPosition)
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})


router.beforeEach(async (to: any, from: any) => {
  return true

  // const userStore = useAuthStore()
  //

  // const publicRoutes = ['/login', '/wechat/callback', '/user-agreement', '/privacy-policy']
  //

  // if (publicRoutes.includes(to.path)) {
  //   return true
  // }
  //

  // if (!userStore.isLoggedIn) {

  //   const isInitialized = await userStore.initAuth()
  //   if (!isInitialized) {
  //     return {path: '/login', query: {redirect: to.fullPath}}
  //   }
  // }
  //
  // return true
  // console.log('beforeEach-to',to.path)
  // console.log('beforeEach-from',from.path)
  // const runtimeStore = useRuntimeStore()
  //

  // let noAnimation = [
  //   '/pc/practice',
  //   '/pc/dict',
  //   '/mobile',
  //   '/'
  // ]
  //
  // if (noAnimation.indexOf(from.path) !== -1 && noAnimation.indexOf(to.path) !== -1) {
  //   return true
  // }
  //
  // const toDepth = routes.findIndex(v => v.path === to.path)
  // const fromDepth = routes.findIndex(v => v.path === from.path)
  // // const fromDepth = routeDeep.indexOf(from.path)
  //
  // if (toDepth > fromDepth) {
  //   if (to.matched && to.matched.length) {
  //     let def = to.matched[0].components.default
  //     let toComponentName = def.name ?? def.__name
  //     runtimeStore.updateExcludeRoutes({type: 'remove', value: toComponentName})



  //   }
  // } else {
  //   if (from.matched && from.matched.length) {
  //     let def = from.matched[0].components.default
  //     let fromComponentName = def.name ?? def.__name
  //     runtimeStore.updateExcludeRoutes({type: 'add', value: fromComponentName})


  //   }
  // }
  // ...

  // return true
})

export default router